NOVA.LORE – Sci-Fi Discord RPG Bot

NOVA.LORE is a gamified sci-fi Discord bot built using Node.js and Discord.js v14+, designed to transform your server into a dynamic universe of PvP duels, exploration, guild heists, and resource-based progression. It works alongside the nova.core moderation bot, sharing data through a single Firestore database.


---

Features

Daily Rewards with streak-based scaling and vote bonuses

Turn-Based Duels using Power, Defense, Speed, Luck stats

Guild System with shared bank and PvP heist mechanics

Exploration Commands like /scan, /mine, /hack

Item Collection, Crafting, and Gear Equipping

Firestore-powered XP and credits sync from nova.core



---

Firestore Schema

users/userId: {
  xp: Number,
  credits: Number,
  stats: { power, defense, speed, luck },
  inventory: { itemName: count },
  equipped: { weapon, module, relic },
  guild: "GuildName",
  dailyStreak: Number,
  voteTimestamp: Timestamp
}

guilds/guildName: {
  leader: userId,
  members: [userIds],
  bank: Number,
  failedHeists: Number,
  lastHeistTimestamp: Timestamp
}


---

Project Structure

nova_lore_bot/
├── commands/
│   ├── economy/
│   ├── exploration/
│   ├── guild/
│   └── pvp/
├── utils/
│   ├── combat.js
│   └── loot.js
├── database/
│   └── firestore.js


---

Setup

1. Clone the repo and install dependencies:



npm install

2. Configure your Firebase project in database/firestore.js:



const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

3. Deploy to Render or host locally using:



node index.js


---

Contribution

Feel free to fork, expand, or integrate this with
