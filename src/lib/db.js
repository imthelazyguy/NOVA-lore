const admin = require("firebase-admin");

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  process.exit(1); // Exit if Firebase fails
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
  admin,
  createCharacter,
  updateCharacter
};
