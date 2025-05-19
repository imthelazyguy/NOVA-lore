// src/commands/addcurrency.js
module.exports = {
  name: 'addcurrency',
  description: 'Manually grant coins to a user.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) return;
    const user = message.mentions.users.first();
    const coins = parseInt(args[1]);
    if (!user || isNaN(coins)) return message.reply('Usage: !addcurrency @user 100');

    const ref = db.collection('players').doc(user.id);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : { currency: 0 };
    data.currency += coins;
    await ref.set(data, { merge: true });

    message.channel.send(`💸 Added ${coins} coins to ${user.username}`);
  }
};
