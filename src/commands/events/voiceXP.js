client.on('voiceStateUpdate', async (oldState, newState) => {
  const user = newState.member?.user;
  if (!user || user.bot) return;

  const now = Date.now();
  const dbRef = db.collection('voiceTracking').doc(user.id);

  if (!oldState.channel && newState.channel) {
    await dbRef.set({ joinTime: now });
  } else if (oldState.channel && !newState.channel) {
    const doc = await dbRef.get();
    if (!doc.exists) return;

    const joinTime = doc.data().joinTime || now;
    const duration = Math.floor((now - joinTime) / 1000); // in seconds
    const xpGained = Math.floor(duration / 30); // 1 XP per 30s

    const playerRef = db.collection('players').doc(user.id);
    const playerDoc = await playerRef.get();
    const playerData = playerDoc.exists ? playerDoc.data() : { voiceXP: 0, currency: 0 };

    playerData.voiceXP = (playerData.voiceXP || 0) + xpGained;
    playerData.currency = (playerData.currency || 0) + Math.floor(xpGained / 2);
    await playerRef.set(playerData, { merge: true });
    await dbRef.delete();
  }
});
