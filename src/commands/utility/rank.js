// src/commands/economy/rank.js
const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getRankCard } = require('../../utils/rankCard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Displays your rank card.'),

  async execute(ctxOrMsg, args, db) {
    const isSlash = !!ctxOrMsg.isCommand;
    const user = isSlash ? ctxOrMsg.user : ctxOrMsg.author;
    const reply = isSlash
      ? (m) => ctxOrMsg.reply(m)
      : (m) => ctxOrMsg.reply(m);

    try {
      const userRef = db.collection('players').doc(user.id);
      const snap = await userRef.get();
      if (!snap.exists) return reply("You have no XP yet.");

      const data = snap.data();
      const buffer = await getRankCard(user, data);
      const attachment = new AttachmentBuilder(buffer, { name: 'rank.png' });
      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Rank`)
        .setImage('attachment://rank.png')
        .setColor('#5865F2');

      if (isSlash) await ctxOrMsg.reply({ embeds:[embed], files:[attachment] });
      else ctxOrMsg.reply({ embeds:[embed], files:[attachment] });
    } catch (err) {
      console.error(err);
      reply('Error fetching rank.');
    }
  }
};
