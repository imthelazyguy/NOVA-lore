
// src/commands/economy/buy.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'buy',
  description: 'Purchase an item from the shop.',
  async execute(message, args, db) {
    const itemId = args[0];
    if (!itemId) return message.reply('⚠️ Usage: `!buy <itemID>`');

    const itemRef = db.collection('shopItems').doc(itemId);
    const itemSnap = await itemRef.get();
    if (!itemSnap.exists) return message.reply(`❌ Item \`${itemId}\` not found.`);

    const item = itemSnap.data();
    const userRef = db.collection('players').doc(message.author.id);
    const userSnap = await userRef.get();
    if (!userSnap.exists || (userSnap.data().currency || 0) < item.price) {
      return message.reply('❌ Insufficient coins.');
    }

    // Deduct cost and add to inventory
    const userData = userSnap.exists ? userSnap.data() : { currency: 0, inventory: [], equipped: {} };
    userData.currency -= item.price;
    userData.inventory = Array.from(new Set([...(userData.inventory||[]), itemId]));

    await userRef.set(userData, { merge: true });

    const embed = new EmbedBuilder()
      .setTitle('✅ Purchase Complete')
      .setColor(0x00ff00)
      .setDescription(`You bought **${item.name}** for ${item.price} coins!`)
      .addFields(
        { name: 'New Balance', value: `${userData.currency} coins`, inline: true },
        { name: 'Item Added', value: `${item.name}`, inline: true }
      );

    message.channel.send({ embeds: [embed] });
  }
};
