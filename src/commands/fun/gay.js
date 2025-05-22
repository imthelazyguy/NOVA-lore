// --- fun/gay.js ---
module.exports = {
  name: 'gay',
  async execute(message) {
    const percent = Math.floor(Math.random() * 101);
    message.reply(`${message.author.username} is ${percent}% gay today!`);
  },
};
