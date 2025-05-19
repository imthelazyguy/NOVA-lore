const { Client, GatewayIntentBits } = require('discord.js');
const admin = require('firebase-admin');

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("FIREBASE_SERVICE_ACCOUNT env variable is missing.");
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.name && typeof command.execute === 'function') {
    client.commands.set(command.name, command);
  } else {
    console.warn(`[WARN] Invalid command format in ${file}`);
  }
}

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  // Command example
  const args = message.content.slice(1).trim().split(/ +/);
const commandName = args.shift().toLowerCase();

const command = client.commands.get(commandName);
if (!command) return;

try {
  await command.execute(message, args, db);
} catch (error) {
  console.error(`❌ Error running ${commandName}:`, error);
  message.reply('There was an error executing that command.');
}

  // XP TRACKING BLOCK (moved inside the async handler)
  const userId = message.author.id;
  const channelId = message.channel.id;

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

  // XP calculation with multiplier support
  let multiplier = 1;
  if (config.globalMultiplier) multiplier *= config.globalMultiplier;
  if (userData.multiplier) multiplier *= userData.multiplier;
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
});

if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing in environment variables!");
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
