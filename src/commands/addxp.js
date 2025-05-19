module.exports = {
  name: 'addxp',
  description: 'Add XP to a user manually.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) return;

    const user = message.mentions.users.first();
    const xp = parseInt(args[1]);
    if (!user || isNaN(xp)) return message.reply('Usage: !addxp @user 100');

    const ref = db.collection('players').doc(user.id);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : { xp: 0, currency: 0 };
    data.xp += xp;
    data.currency = Math.floor(data.xp / 3);
    await ref.set(data, { merge: true });
    message.channel.send(`Added ${xp} XP to ${user.username}`);
  },
};
