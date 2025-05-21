// src/commands/economy/removeshopitem.js
module.exports = {
  name: 'removeshopitem',
  description: 'Admin: remove an item from shop.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) 
      return message.reply('❌ Admin only.');

    const id = args[0];
    if (!id) return message.reply('⚠️ Usage: `!removeshopitem <itemID>`');

    await db.collection('shopItems').doc(id).delete();
    message.reply(`✅ Removed shop item \`${id}\`.`);
  }
};
