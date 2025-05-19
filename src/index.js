const { Client, GatewayIntentBits } = require('discord.js');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("FIREBASE_SERVICE_ACCOUNT env variable is missing.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Initialize Discord Client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Example command handler
client.on('messageCreate', async (message) => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
  // Add your existing command handlers here
});

// Add this BELOW your command handling in index.js
const { id: userId } = message.author;
const { id: channelId } = message.channel;

if (!message.guild || message.author.bot) return;

// Load XP config
const configRef = db.collection('config').doc('xp');
const configSnap = await configRef.get();
const config = configSnap.exists ? configSnap.data() : {
  enabledTextChannels: [],
  blacklist: { users: [], roles: [] }
};

if (!config.enabledTextChannels.includes(channelId)) return;
if (config.blacklist.users?.includes(userId)) return;

const member = await message.guild.members.fetch(userId);
if (member.roles.cache.some(role => config.blacklist.roles?.includes(role.id))) return;

const userRef = db.collection('players').doc(userId);
const userSnap = await userRef.get();
const userData = userSnap.exists ? userSnap.data() : {
  name: message.author.username,
  xp: 0,
  currency: 0,
  blacklisted: false,
  voiceTime: 0
};

// Award XP
let multiplier = 1;

// Get global XP rate from config
if (config.globalMultiplier) multiplier *= config.globalMultiplier;

// Player-specific multiplier
if (userData.multiplier) multiplier *= userData.multiplier;

// Future-proof: multiplier from shop items
if (userData.inventory) {
  for (const item of userData.inventory) {
    if (item.type === 'xpBoost') {
      multiplier *= item.multiplier || 1;
    }
  }
}

const xpEarned = Math.floor((Math.random() * 5 + 1) * multiplier);
userData.xp += xpEarned;
userData.currency = Math.floor(userData.xp / 3);
userData.lastMessage = new Date();

await userRef.set(userData);

// Login to Discord
if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing in environment variables!");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
