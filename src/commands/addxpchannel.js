module.exports = {
  name: 'addxpchannel',
  description: 'Adds a text channel to the XP-enabled list.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ You need Administrator permissions to use this command.');
    }

    const channel = message.mentions.channels.first();
    if (!channel || channel.type !== 0) {
      return message.reply('❌ Please mention a valid text channel.');
    }

    const configRef = db.collection('config').doc('xp');
    const doc = await configRef.get();
    const config = doc.exists ? doc.data() : {};

    const updated = new Set(config.enabledTextChannels || []);
    updated.add(channel.id);

    await configRef.set({
      ...config,
      enabledTextChannels: Array.from(updated)
    });

    message.reply(`✅ Added ${channel} to XP-enabled channels.`);
  }
};
