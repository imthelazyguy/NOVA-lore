// src/commands/economy/addshopitem.js
module.exports = {
  name: 'addshopitem',
  description: 'Admin: add a new shop item.',
  async execute(message, args, db) {
    if (!message.member.permissions.has('Administrator')) 
      return message.reply('❌ Admin only.');

    const [id, price, type, ...rest] = args;
    if (!id || !price || !type || !rest.length) 
      return message.reply('⚠️ Usage: `!addshopitem <itemID> <price> <type> <name|description>`');

    const [name, ...descArr] = rest;
    const description = descArr.join(' ');

    await db.collection('shopItems').doc(id).set({ name, description, price: parseInt(price), type });

    message.reply(`✅ Added shop item \`${id}\`.`);
  }
};
