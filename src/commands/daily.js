// src/commands/daily.js
module.exports = {
  name: 'daily',
  description: 'Claim daily coins reward.',
  async execute(message, args, db) {
    const ref = db.collection('players').doc(message.author.id);
    const snap = await ref.get();
    const now = Date.now();
    const data = snap.exists ? snap.data() : {};

    const cooldown = 24 * 60 * 60 * 1000; // 24 hours
    if (data.lastDaily && now - data.lastDaily < cooldown)
      return message.reply('⏳ You’ve already claimed your daily reward today!');

    const reward = 100;
    data.currency = (data.currency || 0) + reward;
    data.lastDaily = now;
    await ref.set(data, { merge: true });

    message.reply(`✅ You claimed your daily reward of 💰 ${reward} coins!`);
  }
};
