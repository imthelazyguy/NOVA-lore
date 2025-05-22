// --- economy/coinflip.js ---
module.exports = {
  name: 'coinflip',
  async execute(message, args, db) {
    const userId = message.author.id;
    const userRef = db.collection('players').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!['heads', 'tails'].includes(choice)) {
      return message.reply('Please choose `heads` or `tails`.');
    }

    if (!bet || isNaN(bet) || bet <= 0) {
      return message.reply('Enter a valid amount of coins to bet.');
    }

    if ((userData.currency || 0) < bet) {
      return message.reply('You don’t have enough coins to bet that much.');
    }

    const flip = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = flip === choice;

    if (won) {
      userData.currency += bet;
      message.reply(`The coin landed on **${flip}**. You won **${bet}** coins!`);
    } else {
      userData.currency -= bet;
      message.reply(`The coin landed on **${flip}**. You lost **${bet}** coins.`);
    }

    await userRef.set(userData);
  },
};
