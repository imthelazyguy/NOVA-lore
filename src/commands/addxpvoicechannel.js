module.exports = {
  name: 'addxpvoicechannel',
  description: 'Enable XP in a specific voice channel (by ID).',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Only admins can use this command.');
    }

    const vcId = args[0];
    if (!vcId || isNaN(vcId)) return message.reply('Provide a valid voice channel ID.');

    const ref = db.collection('config').doc('xp');
    const snap = await ref.get();
    const config = snap.exists ? snap.data() : {};
    config.enabledVoiceChannels = config.enabledVoiceChannels || [];

    if (!config.enabledVoiceChannels.includes(vcId)) {
      config.enabledVoiceChannels.push(vcId);
      await ref.set(config, { merge: true });
      return message.reply(`✅ XP is now enabled in voice channel ID \`${vcId}\`.`);
    } else {
      return message.reply(`⚠️ XP is already enabled in that voice channel.`);
    }
  }
};
