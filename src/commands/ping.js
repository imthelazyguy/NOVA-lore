const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Check the bot’s latency.',
  async execute(message, args) {
    const sent = await message.channel.send('Pinging...');
    const roundTrip = sent.createdTimestamp - message.createdTimestamp;
    const apiPing = message.client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Message Latency', value: `${roundTrip}ms`, inline: true },
        { name: 'API Ping', value: `${apiPing}ms`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    sent.edit({ content: ' ', embeds: [embed] });
  },
};
