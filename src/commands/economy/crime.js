// --- economy/crime.js ---
module.exports = {
  name: 'crime',
  cooldown: 7200000, // 2 hours
  async execute(message, args, db) {
    const userId = message.author.id;
    const userRef = db.collection('players').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    const now = Date.now();
    const lastCrime = userData.lastCrime || 0;
    const cooldown = this.cooldown;

    if (now - lastCrime < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastCrime)) / 60000);
      return message.reply(`You need to wait ${remaining}m before committing crime again!`);
    }

    const outcome = Math.random() > 0.4; // 60% chance of success
    const amount = Math.floor(Math.random() * 150) + 50;

    if (outcome) {
      userData.currency = (userData.currency || 0) + amount;
      message.reply(`You got away with a crime and earned **${amount}** coins!`);
    } else {
      userData.currency = Math.max((userData.currency || 0) - amount, 0);
      message.reply(`You got caught and lost **${amount}** coins!`);
    }

    userData.lastCrime = now;
    await userRef.set(userData);
  },
};
