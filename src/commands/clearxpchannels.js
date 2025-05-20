module.exports = {
  name: 'clearxpchannels',
  description: 'Clears the list of XP-enabled channels (enables all).',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ You need Administrator permissions to use this command.');
    }

    const configRef = db.collection('config').doc('xp');
    const doc = await configRef.get();
    const config = doc.exists ? doc.data() : {};

    await configRef.set({
      ...config,
      enabledTextChannels: []
    });

    message.reply('✅ XP channel list cleared. XP will now be granted in all text channels.');
  }
};
