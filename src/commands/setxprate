// src/commands/setxprate.js
module.exports = {
  name: 'setxprate',
  description: 'Set XP gain multiplier globally or for a user.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) return;
    const multiplier = parseFloat(args[1]);
    if (isNaN(multiplier) || multiplier <= 0) return message.reply('Usage: !setxprate [global|@user] 2');

    const isGlobal = args[0] === 'global';
    if (isGlobal) {
      await db.collection('config').doc('xp').set({ globalMultiplier: multiplier }, { merge: true });
      message.reply(`🌐 Set global XP rate to ×${multiplier}`);
    } else if (message.mentions.users.size) {
      const user = message.mentions.users.first();
      const ref = db.collection('players').doc(user.id);
      await ref.set({ multiplier }, { merge: true });
      message.reply(`👤 Set XP rate for ${user.username} to ×${multiplier}`);
    } else {
      message.reply('Mention a user or use "global" as target.');
    }
  }
};
