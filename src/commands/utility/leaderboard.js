const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  description: 'View the top 10 users by XP.',
  async execute(message, args, db) {
    const snap = await db.collection('players').get();

    const leaderboard = snap.docs
      .map(doc => {
        const data = doc.data();
        const totalXP = (data.chatXP || 0) + (data.voiceXP || 0);
        return {
          name: data.name || 'Unknown',
          totalXP,
          userId: doc.id
        };
      })
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, 10);

    if (leaderboard.length === 0) {
      return message.reply('⚠️ No players found.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 NOVA Leaderboard')
      .setColor(0xffc300)
      .setDescription(
        leaderboard.map((u, i) =>
          `**#${i + 1}** — <@${u.userId}> (${u.totalXP} XP)`
        ).join('\n')
      )
      .setFooter({ text: 'Only top 10 are shown here.' });

    return message.channel.send({ embeds: [embed] });
  }
};
