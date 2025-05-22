// --- economy/slut.js ---
module.exports = {
  name: 'slut',
  cooldown: 7200000, // 2 hours
  async execute(message, args, db) {
    const userId = message.author.id;
    const userRef = db.collection('players').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    const now = Date.now();
    const lastSlut = userData.lastSlut || 0;
    const cooldown = this.cooldown;

    if (now - lastSlut < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastSlut)) / 60000);
      return message.reply(`You need to wait ${remaining}m before slutting again!`);
    }

    const outcome = Math.random() > 0.4; // 60% chance of success
    const amount = Math.floor(Math.random() * 100) + 25;

    if (outcome) {
      userData.currency = (userData.currency || 0) + amount;
      message.reply(`You did something naughty and earned **${amount}** coins!`);
    } else {
      userData.currency = Math.max((userData.currency || 0) - amount, 0);
      message.reply(`They ran off with your clothes and you lost **${amount}** coins!`);
    }

    userData.lastSlut = now;
    await userRef.set(userData);
  },
};
