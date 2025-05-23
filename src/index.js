
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('./keepAlive');
const { db } = require('./lib/firebase');

// Env check
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error("❌ DISCORD_TOKEN and CLIENT_ID are required.");
  process.exit(1);
}

// Initialize client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
const slashCommandData = [];

// Recursively load commands
function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      loadCommands(full);
    } else if (file.endsWith('.js')) {
      const command = require(full);
      if (command.name && typeof command.execute === 'function') {
        client.commands.set(command.name, command);
      }
      if (command.data && typeof command.data.name === 'string') {
        if (!command.data.description) {
          console.warn(`⚠️ Command "${command.data.name}" missing description. Adding default.`);
          command.data.setDescription('No description provided.');
        }
        slashCommandData.push(command.data.toJSON());
      }
    }
  }
}
loadCommands(path.join(__dirname, 'commands'));

// Register slash commands
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: slashCommandData }
    );
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error('❌ Failed to register slash commands:', err);
  }
});

// Handle slash interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command || typeof command.execute !== 'function') return;
  try {
    await command.execute(interaction, [], db, true);
  } catch (err) {
    console.error(`❌ Slash error in ${interaction.commandName}:`, err);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
});

// Handle prefix commands
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const guildRef = db.collection('config').doc(`guild_${message.guild.id}`);
  const guildSnap = await guildRef.get();
  const prefix = (guildSnap.exists && guildSnap.data().prefix) || '!';

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command || typeof command.execute !== 'function') return;

  try {
    await command.execute(message, args, db, false);
  } catch (err) {
    console.error(`❌ Prefix error in ${commandName}:`, err);
    message.reply('There was an error executing that command.');
  }
});

// Voice tracking
const voiceEvent = require('./events/voiceStateUpdate');
client.on('voiceStateUpdate', (...args) => voiceEvent.execute(...args, client, db));

client.login(process.env.DISCORD_TOKEN);
