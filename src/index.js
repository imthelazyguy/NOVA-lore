const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('./keepAlive');
const { db } = require('./lib/firebase');

// ENV validation
if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.DISCORD_TOKEN) {
  console.error("❌ Missing FIREBASE_SERVICE_ACCOUNT or DISCORD_TOKEN.");
  process.exit(1);
}

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Command loader (recursive)
client.commands = new Collection();

const loadCommands = (dir = './commands') => {
  const commandFiles = fs.readdirSync(path.join(__dirname, dir));
  for (const file of commandFiles) {
    const fullPath = path.join(__dirname, dir, file);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      loadCommands(path.join(dir, file));
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.name && typeof command.execute === 'function') {
        client.commands.set(command.name, command);
      } else {
        console.warn(`⚠️ Invalid command format in ${file}`);
      }
    }
  }
};
loadCommands();

// Load Events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.name === 'voiceStateUpdate') {
    client.on('voiceStateUpdate', (...args) => event.execute(...args, client, db));
  }
}

// On Ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Message Create
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  // Prefix
  const guildRef = db.collection('config').doc(`guild_${message.guild.id}`);
  const doc = await guildRef.get();
  const guildConfig = doc.exists ? doc.data() : {};
  const prefix = guildConfig.prefix || '!';

  if (!message.content.startsWith(prefix)) return;

  // Parse Command
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  const userId = message.author.id;

  if (command) {
    try {
      await command.execute(message, args, db);
    } catch (err) {
      console.error(`❌ Error in command ${commandName}:`, err);
      message.reply('There was an error executing that command.');
    }
  }

  // XP Tracking
  try {
    const configRef = db.collection('config').doc('xp');
    const configSnap = await configRef.get();
    const config = configSnap.exists ? configSnap.data() : {
      enabledTextChannels: [],
      blacklist: { users: [], roles: [] }
    };

    const channelId = message.channel.id;

    // Skip if blacklisted
    if (config.blacklist?.users?.includes(userId)) return;
    const member = await message.guild.members.fetch(userId);
    if (member.roles.cache.some(role => config.blacklist.roles?.includes(role.id))) return;

    // If no enabledTextChannels specified, default to allow all
    const useChannelLimit = Array.isArray(config.enabledTextChannels) && config.enabledTextChannels.length > 0;
    if (useChannelLimit && !config.enabledTextChannels.includes(channelId)) return;

    // Fetch Player
    const userRef = db.collection('players').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {
      name: message.author.username,
      xp: 0,
      currency: 0,
      voiceXp: 0,
      lastMessage: null,
      multiplier: 1
    };

    let multiplier = 1;
    if (config.globalMultiplier) multiplier *= config.globalMultiplier;
    if (userData.multiplier) multiplier *= userData.multiplier;
    if (userData.inventory) {
      for (const item of userData.inventory) {
        if (item.type === 'xpBoost') multiplier *= item.multiplier || 1;
      }
    }

    const xpEarned = Math.floor((Math.random() * 5 + 1) * multiplier);
    userData.xp += xpEarned;
    userData.currency = Math.floor((userData.xp + (userData.voiceXp || 0)) / 3);
    userData.lastMessage = new Date();

    await userRef.set(userData, { merge: true });
  } catch (err) {
    console.error('❌ XP tracking error:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);
