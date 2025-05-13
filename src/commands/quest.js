const { SlashCommandBuilder } = require('discord.js');
const { getCharacter, updateCharacter } = require('../lib/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quest')
    .setDescription('Embark on a quest mission'),

  async execute(interaction) {
    const char = await getCharacter(interaction.user.id);
    if (!char) return interaction.reply('Create a character first with /character');

    const quests = [
      { title: 'Rescue a stranded merchant', reward: 50, xp: 10 },
      { title: 'Hunt down a rogue AI', reward: 100, xp: 20 },
      { title: 'Recover ancient alien tech', reward: 75, xp: 15 }
    ];
    const quest = quests[Math.floor(Math.random() * quests.length)];
    char.credits += quest.reward;
    char.xp += quest.xp;

    if (char.xp >= char.level * 100) {
      char.level += 1;
      char.hp += 20;
      await updateCharacter(interaction.user.id, {
        credits: char.credits,
        xp: char.xp,
        level: char.level,
        hp: char.hp
      });
      return interaction.reply(`Level up! You are now level ${char.level}! Completed **${quest.title}** and earned ${quest.reward} credits and ${quest.xp} XP.`);
    }

    await updateCharacter(interaction.user.id, { credits: char.credits, xp: char.xp });
    return interaction.reply(`Completed **${quest.title}**. Earned ${quest.reward} credits and ${quest.xp} XP.`);
  }
};