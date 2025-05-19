const { Client, GatewayIntentBits } = require('discord.js');
const admin = require('firebase-admin');



// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("FIREBASE_SERVICE_ACCOUNT env variable is missing.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
