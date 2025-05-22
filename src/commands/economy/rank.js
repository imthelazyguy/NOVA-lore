const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rank',
  description: 'Shows your rank and XP stats',
  async execute(message, args, db) {
    try {
      const userId = message.author.id;
      const guildId = message.guild.id;
      const userRef = db.collection('players').doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return message.reply('You have no XP yet. Start chatting or talking in voice channels!');
      }

      const userData = userSnap.data();
      const userXP = userData.xp || 0;
      const voiceXP = userData.voiceXp || 0;
      const totalXP = userXP + voiceXP;

      // Fetch all players to calculate rank
      const allPlayersSnap = await db.collection('players').get();
      const players = [];
      allPlayersSnap.forEach(doc => {
        const data = doc.data();
        const total = (data.xp || 0) + (data.voiceXp || 0);
        players.push({ id: doc.id, total });
      });

      players.sort((a, b) => b.total - a.total);
      const rank = players.findIndex(p => p.id === userId) + 1;

      const embed = new EmbedBuilder()
        .setColor('#00ff99')
        .setAuthor({ name: `${message.author.username}'s Rank`, iconURL: message.author.displayAvatarURL() })
        .addFields(
          { name: 'Total XP', value: `${totalXP}`, inline: true },
          { name: 'Chat XP', value: `${userXP}`, inline: true },
          { name: 'Voice XP', value: `${voiceXP}`, inline: true },
          { name: 'Your Rank', value: `#${rank}`, inline: false }
        )
        .setFooter({ text: `Leveling System - NOVA Bot`, iconURL: message.guild.iconURL() })
        .setTimestamp();

      // Optional: add background or cosmetics
      if (userData.profileBackground) {
        embed.setImage(userData.profileBackground);
      }

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('❌ Error in rank command:', err);
      return message.reply('There was an error fetching your rank. Please try again later.');
    }
  }
};
