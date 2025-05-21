// src/commands/economy/equip.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'equip',
  description: 'Equip an item from your inventory.',
  async execute(message, args, db) {
    const itemId = args[0];
    if (!itemId) return message.reply('⚠️ Usage: `!equip <itemID>`');

    const userRef = db.collection('players').doc(message.author.id);
    const snap = await userRef.get();
    const data = snap.exists ? snap.data() : {};

    if (!(data.inventory||[]).includes(itemId)) {
      return message.reply('❌ You do not own that item.');
    }

    // Example: cosmetic backgrounds
    data.equipped = data.equipped || {};
    data.equipped.background = itemId;

    await userRef.set(data, { merge: true });

    const embed = new EmbedBuilder()
      .setTitle('🖌️ Item Equipped')
      .setColor(0x9b59b6)
      .setDescription(`Equipped **${itemId}** as your background.`);

    message.channel.send({ embeds: [embed] });
  }
};
