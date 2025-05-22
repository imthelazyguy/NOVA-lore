// --- fun/ship.js ---
module.exports = {
  name: 'ship',
  async execute(message, args) {
    const user1 = message.author.username;
    const user2 = args.join(" ") || "themselves";
    const score = Math.floor(Math.random() * 101);
    message.reply(`Love score between **${user1}** and **${user2}**: **${score}%**`);
  },
};
