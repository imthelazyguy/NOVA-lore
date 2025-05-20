module.exports = {
  name: 'setprefix',
  description: 'Changes the command prefix for this server.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ You need Administrator permissions to use this command.');
    }

    const newPrefix = args[0];
    if (!newPrefix || newPrefix.length > 5) {
      return message.reply('❌ Please provide a valid prefix (1-5 characters).');
    }

    const guildRef = db.collection('config').doc(`guild_${message.guild.id}`);
    await guildRef.set({ prefix: newPrefix }, { merge: true });

    message.reply(`✅ Command prefix updated to \`${newPrefix}\``);
  }
};
