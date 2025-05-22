module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client, db) {
    // logic to calculate time joined vs left and add XP
    const member = newState.member;
    if (!member || member.user.bot) return;

    const joined = oldState.channelId === null && newState.channelId !== null;
    const left = oldState.channelId !== null && newState.channelId === null;

    if (joined) {
      member.voiceStart = Date.now();
    }

    if (left && member.voiceStart) {
      const duration = Date.now() - member.voiceStart;
      const minutes = Math.floor(duration / 60000);
      const xp = minutes * 2;

      const userRef = db.collection('players').doc(member.id);
      const doc = await userRef.get();
      const data = doc.exists ? doc.data() : { xp: 0, voiceXp: 0 };
      data.voiceXp = (data.voiceXp || 0) + xp;
      data.currency = Math.floor((data.xp + data.voiceXp) / 3);
      await userRef.set(data, { merge: true });
    }
  }
};
