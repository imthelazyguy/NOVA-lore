const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const { getXPLevel } = require('../../lib/xpUtils');

module.exports = {
  name: 'rank',
  description: 'Shows your rank card with XP and levels.',
  aliases: ['r'],
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Shows your rank card with XP and levels.')
    .addUserOption(option =>
      option.setName('user').setDescription('Check rank of someone else')
    ),

  async execute(messageOrInteraction, args, db, isSlash = false) {
    try {
      const user = isSlash
        ? messageOrInteraction.options.getUser('user') || messageOrInteraction.user
        : messageOrInteraction.mentions.users.first() || messageOrInteraction.author;

      const userId = user.id;
      const userRef = db.collection('players').doc(userId);
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() : null;

      if (!userData) {
        return reply(messageOrInteraction, 'This user has no XP yet!', isSlash);
      }

      const levelInfo = getXPLevel(userData.xp || 0);
      const voiceLevel = getXPLevel(userData.voiceXP || 0);
      const progress = userData.xp - levelInfo.minXP;
      const nextLevelXP = levelInfo.maxXP - levelInfo.minXP;

      const canvas = createCanvas(800, 250);
      const ctx = canvas.getContext('2d');

      // Load background
      const bgPath = userData.background || path.join('assets', 'backgrounds', 'default.jpg');
      const background = await loadImage(path.join(process.cwd(), bgPath));
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Draw XP bar
      const barWidth = 500;
      const filledBar = (progress / nextLevelXP) * barWidth;

      ctx.fillStyle = '#2C2F33';
      ctx.fillRect(230, 180, barWidth, 30);
      ctx.fillStyle = '#7289DA';
      ctx.fillRect(230, 180, filledBar, 30);

      // Text
      ctx.font = '28px Sans';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Level: ${levelInfo.level} | Chat XP: ${userData.xp}`, 230, 60);
      ctx.fillText(`Voice Level: ${voiceLevel.level} | Voice XP: ${userData.voiceXP || 0}`, 230, 100);
      ctx.fillText(`Currency: ${userData.currency || 0}`, 230, 140);

      // Avatar
      const avatar = await loadImage(
        user.displayAvatarURL({ extension: 'png', size: 256 })
      );
      ctx.beginPath();
      ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 45, 45, 160, 160);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });

      return isSlash
        ? messageOrInteraction.reply({ files: [attachment] })
        : messageOrInteraction.channel.send({ files: [attachment] });
    } catch (err) {
      console.error('❌ Error in rank command:', err);
      return reply(messageOrInteraction, 'Error generating rank card.', isSlash);
    }
  }
};

function reply(target, content, isSlash) {
  if (isSlash) return target.reply({ content, ephemeral: true });
  return target.channel.send(content);
}
