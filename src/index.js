const { Client, GatewayIntentBits, Collection } = require('discord.js');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Validate ENV
if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.DISCORD_TOKEN) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT or DISCORD_TOKEN.");
  process.exit(1);
}

// Firebase setup
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.name && typeof command.execute === 'function') {
    client.commands.set(command.name, command);
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  const userId = message.author.id;

  if (command) {
    try {
      await command.execute(message, args, db);
    } catch (error) {
      console.error(`❌ Error running ${commandName}:`, error);
      message.reply('There was an error executing that command.');
    }
  }

  // XP tracking applies only after command execution (if allowed)
 try {
  const configRef = db.collection('config').doc('xp');
  const configSnap = await configRef.get();
  const config = configSnap.exists ? configSnap.data() : {
    enabledTextChannels: [],
    blacklist: { users: [], roles: [] }
  };

  const userId = message.author.id;
  const channelId = message.channel.id;

  // Blacklist: skip if user or role is blacklisted
  if (config.blacklist?.users?.includes(userId)) return;

  const member = await message.guild.members.fetch(userId);
  if (member.roles.cache.some(role => config.blacklist.roles?.includes(role.id))) return;

  // Channel filter: only apply if config specifies allowed channels
  const textChannelWhitelist = config.enabledTextChannels || [];
  const useChannelLimit = Array.isArray(textChannelWhitelist) && textChannelWhitelist.length > 0;

  if (useChannelLimit && !textChannelWhitelist.includes(channelId)) return;

  // Get player data
  const userRef = db.collection('players').doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.exists ? userSnap.data() : {
    name: message.author.username,
    xp: 0,
    currency: 0,
    blacklisted: false,
    voiceTime: 0
  };

  // XP multiplier logic
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
  userData.currency = Math.floor(userData.xp / 3);
  userData.lastMessage = new Date();

  await userRef.set(userData);
} catch (err) {
  console.error('❌ XP tracking error:', err);
}
});

client.login(process.env.DISCORD_TOKEN);
