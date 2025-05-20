module.exports = {
  name: 'help',
  description: 'Lists all available commands',
  async execute(message) {
    const commands = message.client.commands;
    const helpText = commands.map(cmd => `**!${cmd.name}** – ${cmd.description || 'No description'}`).join('\n');

    message.channel.send({
      embeds: [{
        title: 'NOVA Bot Help',
        description: helpText,
        color: 0x00ffcc
      }]
    });
  }
};
