const { SlashCommandBuilder } = require('discord.js');
const npcs = require('../data/npcs.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('npc')
    .setDescription('Talk to a local NPC')
    .addStringOption(opt => opt.setName('name').setDescription('NPC name').setRequired(true)),

  async execute(interaction) {
    const name = interaction.options.getString('name');
    const npc = npcs.find(n => n.name.toLowerCase() === name.toLowerCase());
    if (!npc) return interaction.reply(`No NPC named '${name}' found.`);
    return interaction.reply(`**${npc.name}** says: _${npc.dialogue}_`);
  }
};