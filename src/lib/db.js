const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, '../../serviceAccountKey.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function getCharacter(userId) {
  const ref = db.collection('characters').doc(userId);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

async function createCharacter(userId, name) {
  const newChar = {
    name,
    class: ['Engineer', 'Soldier', 'Medic'][Math.floor(Math.random() * 3)],
    level: 1,
    xp: 0,
    hp: 100,
    inventory: [],
    credits: 100
  };
  await db.collection('characters').doc(userId).set(newChar);
  return newChar;
}

async function updateCharacter(userId, data) {
  await db.collection('characters').doc(userId).update(data);
}

module.exports = {
  getCharacter,
  createCharacter,
  updateCharacter
};