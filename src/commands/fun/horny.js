// --- fun/horny.js ---
module.exports = {
  name: 'horny',
  async execute(message) {
    const percent = Math.floor(Math.random() * 101);
    message.reply(`${message.author.username} is ${percent}% horny today!`);
  },
};
