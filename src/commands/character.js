const { SlashCommandBuilder } = require('discord.js');
const { createCharacter, getCharacter } = require('../lib/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Create or view your RPG character'),

  async execute(interaction) {
    const char = await getCharacter(interaction.user.id);
    if (char) {
      return interaction.reply(`**${char.name}**\nClass: ${char.class}\nLevel: ${char.level}`);
    }
    const newChar = await createCharacter(interaction.user.id, interaction.user.username);
    return interaction.reply(`Character created: **${newChar.name}**, Class: ${newChar.class}`);
  }
};