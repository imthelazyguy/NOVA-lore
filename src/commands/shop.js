// src/commands/economy/shop.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shop',
  description: 'View items available for purchase.',
  async execute(message, args, db) {
    const snap = await db.collection('shopItems').get();
    if (snap.empty) return message.reply('🛒 The shop is empty.');

    const embed = new EmbedBuilder()
      .setTitle('🛒 NOVA Shop')
      .setColor(0x00aeff)
      .setDescription('Use `!buy <itemID>` to purchase.');

    snap.docs.forEach(doc => {
      const { name, description, price } = doc.data();
      embed.addFields({ name: `${doc.id} — ${name}`, value: `${description}\n💰 ${price} coins` });
    });

    message.channel.send({ embeds: [embed] });
  }
};
