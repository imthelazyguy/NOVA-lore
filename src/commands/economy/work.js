// --- economy/work.js ---
module.exports = {
  name: 'work',
  cooldown: 3600000, // 1 hour
  async execute(message, args, db) {
    const userId = message.author.id;
    const userRef = db.collection('players').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    const now = Date.now();
    const lastWorked = userData.lastWorked || 0;
    const cooldown = this.cooldown;

    if (now - lastWorked < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastWorked)) / 60000);
      return message.reply(`You need to wait ${remaining}m before working again!`);
    }

    const earnings = Math.floor(Math.random() * 100) + 50;
    userData.currency = (userData.currency || 0) + earnings;
    userData.lastWorked = now;
    await userRef.set(userData);

    return message.reply(`You worked hard and earned **${earnings}** coins!`);
  },
};
