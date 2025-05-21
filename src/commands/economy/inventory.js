// src/commands/economy/inventory.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'inventory',
  description: 'View your purchased items.',
  async execute(message, args, db) {
    const snap = await db.collection('players').doc(message.author.id).get();
    if (!snap.exists || !(snap.data().inventory||[]).length) {
      return message.reply('📭 Your inventory is empty.');
    }

    const inv = snap.data().inventory;
    const embed = new EmbedBuilder()
      .setTitle('🎒 Your Inventory')
      .setColor(0xffc107)
      .setDescription(inv.join('\n'));

    message.channel.send({ embeds: [embed] });
  }
};
