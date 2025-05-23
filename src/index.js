// src/index.js
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

// Create client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Collections
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
      const cmd = require(full);
      // Register for prefix
      if (cmd.name && typeof cmd.execute === 'function') {
        client.commands.set(cmd.name, cmd);
      }
      if (command.data && typeof command.data.name === 'string') {
    // Fallback for missing description
    if (!command.data.description) {
      console.warn(`⚠️ Command "${command.data.name}" missing description. Adding default.`);
      command.data.setDescription('No description provided.');
    }
      // Register slash data
      if (cmd.data) {
        slashCommandData.push(cmd.data.toJSON());
      }
    }
  }
}
loadCommands(path.join(__dirname, 'commands'));

// Register slash commands on ready
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: slashCommandData }
    );
    console.log('✅ Slash commands registered.');
  } catch (err) {
    console.error('❌ Error registering slash commands:', err);
  }
});

// Handle slash interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd || !cmd.data) return;
  try {
    await cmd.execute(interaction, [], db);
  } catch (err) {
    console.error(`❌ Slash ${interaction.commandName} error:`, err);
    await interaction.reply({ content: 'There was an error.', ephemeral: true });
  }
});

// Handle legacy prefix
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  // fetch or default prefix
  const guildRef = db.collection('config').doc(`guild_${message.guild.id}`);
  const guildSnap = await guildRef.get();
  const prefix = (guildSnap.exists && guildSnap.data().prefix) || '!';

  if (!message.content.startsWith(prefix)) return;
  const [cmdName, ...args] = message.content.slice(prefix.length).trim().split(/ +/);
  const command = client.commands.get(cmdName.toLowerCase());
  if (!command || command.data == null) return; // skip slash-only commands

  try {
    await command.execute(message, args, db);
  } catch (err) {
    console.error(`❌ Prefix ${cmdName} error:`, err);
    message.reply('There was an error executing that command.');
  }
});

// Load voice event (example)
const voiceEvent = require('./events/voiceStateUpdate');
client.on('voiceStateUpdate', (...args) => voiceEvent.execute(...args, client, db));

client.login(process.env.DISCORD_TOKEN);
