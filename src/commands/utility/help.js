const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Shows the help menu with all categories',
  aliases: ['h'],
  data: new SlashCommandBuilder().setName('help').setDescription('Shows all bot commands'),

  async execute(msg, args, db, isSlash = false) {
    const embed = new EmbedBuilder()
      .setTitle('**NOVA Bot Help Menu**')
      .setDescription('Here are all the available commands grouped by category.')
      .setColor('#5865F2')
      .addFields(
        { name: 'Economy', value: '`!work`, `!daily`, `!crime`, `!balance`, `!shop`, `!buy`, `!equip`' },
        { name: 'XP & Ranking', value: '`!rank`, `!leaderboard`, `!profile`' },
        { name: 'Voice Mods', value: '`!vmute`, `!vdeafen`, `!vmove`, `!vkick`' },
        { name: 'Moderation', value: '`!kick`, `!ban`, `!timeout`, `!warn`' },
        { name: 'Fun', value: '`!pp`, `!ship`, `!horny`, `!gay`' },
        { name: 'Utilities', value: '`!help`, `!setprefix`, `!ping`' }
      )
      .setFooter({ text: 'Use ! before commands or / for slash commands.' });

    return isSlash
      ? msg.reply({ embeds: [embed], ephemeral: true })
      : msg.channel.send({ embeds: [embed] });
  }
};
