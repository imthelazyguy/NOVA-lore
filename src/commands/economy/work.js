// src/commands/economy/work.js 
module.exports = { name: 'work', description: 'Work to earn a small amount of currency', cooldown: 3600000, // 1 hour cooldown in ms async execute(message, args, db) { const userRef = db.collection('players').doc(message.author.id); const userSnap = await userRef.get(); const now = Date.now(); const userData = userSnap.exists ? userSnap.data() : { currency: 0, cooldowns: {} };

const lastWork = userData.cooldowns?.work || 0;
if (now - lastWork < this.cooldown) {
  const remaining = ((this.cooldown - (now - lastWork)) / 60000).toFixed(1);
  return message.reply(`You need to wait ${remaining} more minutes to work again!`);
}

const earned = Math.floor(Math.random() * 100 + 50);
userData.currency += earned;
userData.cooldowns = { ...userData.cooldowns, work: now };
await userRef.set(userData);

return message.reply(`You worked hard and earned **${earned}** coins!`);

} };

