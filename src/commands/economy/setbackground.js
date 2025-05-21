// src/commands/economy/setbackground.js
module.exports = {
  name: 'setbackground',
  description: 'Alias for `!equip <itemID>` to set your profile background.',
  async execute(message, args, db) {
    // Simply delegate to equip.js
    return require('./equip').execute(message, args, db);
  }
};
