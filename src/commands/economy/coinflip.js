const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  name: 'coinflip',
  aliases: ['cf'],
  description: 'Bet coins on a coin flip',
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Bet coins on heads or tails')
    .addStringOption(o=>o.setName('choice').setRequired(true)
      .addChoices({name:'Heads',value:'heads'},{name:'Tails',value:'tails'}))
    .addIntegerOption(o=>o.setName('bet').setRequired(true)),
  async execute(ctx, args, db) {
    const isSlash=ctx.isCommand?.();
    const reply=r=>isSlash?ctx.reply(r):ctx.reply(r);
    const choice=isSlash?ctx.options.getString('choice'):args[0];
    const bet=isSlash?ctx.options.getInteger('bet'):parseInt(args[1]);
    if(!['heads','tails'].includes(choice)||!bet) return reply('Usage heads|tails amount');
    const uref=db.collection('players').doc((isSlash?ctx.user.id:ctx.author.id));
    const usnap=await uref.get(); const data=usnap.data()||{currency:0};
    if(data.currency<bet) return reply('No coins');
    const flip=Math.random()<0.5?'heads':'tails',won=flip===choice;
    data.currency+=won?bet:-bet; await uref.set(data,{merge:true});
    const embed=new EmbedBuilder().setTitle('🎲 Coin Flip')
      .setColor(won?0x00ff00:0xff0000)
      .setDescription(`${won?'Won':'Lost'} ${bet} coins! Landed on ${flip}.`);
    return isSlash?ctx.reply({embeds:[embed]}):ctx.reply({embeds:[embed]});
  }
};
