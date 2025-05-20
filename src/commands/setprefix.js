module.exports = {
  name: 'setprefix',
  description: 'Sets a custom command prefix for this server',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('You need Administrator permission to use this command.');
    }

    const newPrefix = args[0];
    if (!newPrefix) return message.reply('Please specify a new prefix.');

    const guildRef = db.collection('config').doc(`guild_${message.guild.id}`);
    await guildRef.set({ prefix: newPrefix }, { merge: true });

    message.reply(`✅ Prefix updated to \`${newPrefix}\``);
  }
};
