const { SlashCommandBuilder } = require('discord.js');
const shop = require('../data/shop.json');
const { getCharacter, updateCharacter } = require('../lib/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse and buy items from the galactic shop')
    .addStringOption(opt => opt.setName('buy').setDescription('Name of the item to purchase')),

  async execute(interaction) {
    const itemName = interaction.options.getString('buy');
    const char = await getCharacter(interaction.user.id);
    if (!char) return interaction.reply('You need a character first. Use /character.');

    if (!itemName) {
      const catalog = shop.map(item => `**${item.name}** (${item.price} credits): ${item.description}`).join('\n');
      return interaction.reply(`🛒 **Galactic Shop**\n${catalog}`);
    }

    const item = shop.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return interaction.reply('Item not found.');
    if (char.credits < item.price) return interaction.reply('Not enough credits.');

    char.credits -= item.price;
    char.inventory.push(item.name);
    await updateCharacter(interaction.user.id, { credits: char.credits, inventory: char.inventory });
    return interaction.reply(`You purchased **${item.name}** for ${item.price} credits.`);
  }
};