module.exports = {
  name: 'xp',
  description: 'Check your XP and currency balance.',
  async execute(message, args, db) {
    const uid = message.author.id;
    const ref = db.collection('players').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return message.reply('No XP yet. Start chatting!');
    const { xp, currency } = snap.data();
    message.reply(`⭐ XP: ${xp} | 🪙 Coins: ${currency}`);
  },
};
