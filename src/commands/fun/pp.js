// --- fun/pp.js ---
module.exports = {
  name: 'pp',
  async execute(message) {
    const sizes = ["8D", "8=D", "8==D", "8===D", "8====D", "8=====D", "8======D", "8=======D", "8========D"];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    message.reply(`${message.author.username}'s PP size: ${size}`);
  },
};
