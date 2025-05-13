const { SlashCommandBuilder } = require('discord.js');
const { getCharacter, updateCharacter } = require('../lib/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gather')
    .setDescription('Scavenge resources from alien ruins'),

  async execute(interaction) {
    const char = await getCharacter(interaction.user.id);
    if (!char) return interaction.reply('Create a character first with /character');
    const found = ['Iron Ore', 'Alien Artifact', 'Crystal'].sort(() => 0.5 - Math.random())[0];
    char.inventory.push(found);
    await updateCharacter(interaction.user.id, { inventory: char.inventory });
    return interaction.reply(`You found **${found}** and added it to your inventory!`);
  }
};