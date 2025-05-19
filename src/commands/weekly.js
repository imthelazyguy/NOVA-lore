// src/commands/weekly.js
module.exports = {
  name: 'weekly',
  description: 'Claim weekly coins reward.',
  async execute(message, args, db) {
    const ref = db.collection('players').doc(message.author.id);
    const snap = await ref.get();
    const now = Date.now();
    const data = snap.exists ? snap.data() : {};

    const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days
    if (data.lastWeekly && now - data.lastWeekly < cooldown)
      return message.reply('⏳ You’ve already claimed your weekly reward!');

    const reward = 500;
    data.currency = (data.currency || 0) + reward;
    data.lastWeekly = now;
    await ref.set(data, { merge: true });

    message.reply(`✅ You claimed your weekly reward of 💰 ${reward} coins!`);
  }
};
