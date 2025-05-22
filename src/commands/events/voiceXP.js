// File: src/events/voiceXP.js const { Events } = require('discord.js');

module.exports = (client, db) => { client.on(Events.VoiceStateUpdate, async (oldState, newState) => { const user = newState.member?.user; if (!user || user.bot) return;

const now = Date.now();
const trackRef = db.collection('voiceTracking').doc(user.id);

if (!oldState.channel && newState.channel) {
  await trackRef.set({ joinTime: now });
} else if (oldState.channel && !newState.channel) {
  const trackSnap = await trackRef.get();
  if (!trackSnap.exists) return;

  const joinTime = trackSnap.data().joinTime || now;
  const duration = Math.floor((now - joinTime) / 1000);
  const xpGained = Math.floor(duration / 30); // 1 XP per 30 sec

  const playerRef = db.collection('players').doc(user.id);
  const playerSnap = await playerRef.get();
  const data = playerSnap.exists ? playerSnap.data() : {
    name: user.username,
    chatXP: 0,
    voiceXP: 0,
    currency: 0,
    inventory: [],
    equipped: {}
  };

  data.voiceXP = (data.voiceXP || 0) + xpGained;
  data.currency = (data.currency || 0) + Math.floor(xpGained / 2);
  await playerRef.set(data, { merge: true });
  await trackRef.delete();
}

}); };

