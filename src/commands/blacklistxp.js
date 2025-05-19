module.exports = {
  name: 'blacklistxp',
  description: 'Blacklist a user or role from earning XP.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) return;

    const configRef = db.collection('config').doc('xp');
    const snap = await configRef.get();
    const config = snap.exists ? snap.data() : { blacklist: { users: [], roles: [] } };

    if (message.mentions.users.size) {
      const userId = message.mentions.users.first().id;
      if (!config.blacklist.users.includes(userId)) config.blacklist.users.push(userId);
    } else if (message.mentions.roles.size) {
      const roleId = message.mentions.roles.first().id;
      if (!config.blacklist.roles.includes(roleId)) config.blacklist.roles.push(roleId);
    } else {
      return message.reply('Mention a user or role to blacklist.');
    }

    await configRef.set(config, { merge: true });
    message.channel.send('Added to XP blacklist.');
  },
};
