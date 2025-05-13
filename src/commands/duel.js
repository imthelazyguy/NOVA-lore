const { SlashCommandBuilder } = require('discord.js');
const { getCharacter, updateCharacter } = require('../lib/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duel')
    .setDescription('Challenge another player to PvP')
    .addUserOption(opt => opt.setName('opponent').setDescription('Target user').setRequired(true)),

  async execute(interaction) {
    const user1 = interaction.user;
    const user2 = interaction.options.getUser('opponent');
    const char1 = await getCharacter(user1.id);
    const char2 = await getCharacter(user2.id);
    if (!char1 || !char2) return interaction.reply('Both players must have characters.');

    const winner = Math.random() > 0.5 ? user1 : user2;
    const loser = winner.id === user1.id ? user2 : user1;
    const winnerChar = winner.id === user1.id ? char1 : char2;
    await updateCharacter(winner.id, { xp: winnerChar.xp + 20 });
    return interaction.reply(`**${winner.username}** won the duel against **${loser.username}**! +20 XP`);
  }
};