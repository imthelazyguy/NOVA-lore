// src/commands/economy/coinflip.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and bet coins')
    .addStringOption(opt =>
      opt.setName('choice')
         .setDescription('heads or tails')
         .setRequired(true)
         .addChoices(
           { name: 'Heads', value: 'heads' },
           { name: 'Tails', value: 'tails' }
         ))
    .addIntegerOption(opt =>
      opt.setName('bet')
         .setDescription('Amount of coins to bet')
         .setRequired(true)
    ),

  async execute(ctxOrMsg, args, db) {
    // determine context
    const isSlash = !!ctxOrMsg.isCommand;
    const userId = isSlash ? ctxOrMsg.user.id : ctxOrMsg.author.id;
    const reply = isSlash ? (m) => ctxOrMsg.reply(m) : (m) => ctxOrMsg.reply(m);

    // parse inputs
    let choice, bet;
    if (isSlash) {
      choice = ctxOrMsg.options.getString('choice');
      bet = ctxOrMsg.options.getInteger('bet');
    } else {
      choice = args[0]?.toLowerCase();
      bet = parseInt(args[1]);
    }

    // validation
    if (!['heads','tails'].includes(choice)) 
      return reply('Please choose `heads` or `tails`.');
    if (!bet || isNaN(bet) || bet <= 0)
      return reply('Enter a valid bet amount.');
    
    const userRef = db.collection('players').doc(userId);
    const snap = await userRef.get();
    const data = snap.exists ? snap.data() : { currency: 0 };
    if ((data.currency||0) < bet) 
      return reply('Insufficient coins.');

    // flip
    const flip = Math.random()<0.5 ? 'heads':'tails';
    const won = flip===choice;
    data.currency += won ? bet : -bet;
    await userRef.set(data, { merge:true });

    const color = won ? 0x00ff00 : 0xff0000;
    const embed = new EmbedBuilder()
      .setTitle('🎲 Coin Flip')
      .setColor(color)
      .setDescription(`You chose **${choice}**.\nIt landed on **${flip}**.\nYou ${won ? 'won' : 'lost'} **${bet}** coins!`);

    if (isSlash) await ctxOrMsg.reply({ embeds:[embed] });
    else ctxOrMsg.reply({ embeds:[embed] });
  }
};
