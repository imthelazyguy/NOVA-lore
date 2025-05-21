const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rank',
  description: 'View your XP, level, and equipped cosmetics.',
  async execute(message, args, db) {
    const userId = message.author.id;
    const userRef = db.collection('players').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return message.reply('❌ You don’t have a profile yet. Start chatting or join a voice channel!');
    }

    const data = userSnap.data();
    const chatXP = data.chatXP || 0;
    const voiceXP = data.voiceXP || 0;
    const totalXP = chatXP + voiceXP;
    const level = data.level || Math.floor(totalXP / 500);
    const currency = data.currency || 0;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🏅 Rank — ${data.name || message.author.username}`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setDescription(data.bio || '')
      .addFields(
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'Total XP', value: `${totalXP}`, inline: true },
        { name: 'Chat XP', value: `${chatXP}`, inline: true },
        { name: 'Voice XP', value: `${voiceXP}`, inline: true },
        { name: 'Currency', value: `${currency} coins`, inline: true },
        { name: 'Background', value: `${data?.equipped?.background || 'None'}`, inline: true }
      )
      .setFooter({ text: 'Keep grinding to level up!' });

    return message.channel.send({ embeds: [embed] });
  }
};
