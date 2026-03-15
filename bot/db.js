const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL;
let client = null;

async function getDb() {
  if (!MONGO_URL) throw new Error('MONGO_URL requis (Railway)');
  if (!client) client = new MongoClient(MONGO_URL);
  if (!client.topology?.isConnected()) await client.connect();
  return client.db();
}

const ROULETTE_COST = 1000;
const ROULETTE_ROLES = [
  { roleId: '1479163259297861845', chance: 1, tier: 1 },
  { roleId: '1478138748616052756', chance: 3, tier: 2 },
  { roleId: '1478480011303452735', chance: 6, tier: 3 },
  { roleId: '1470854476859441242', chance: 12, tier: 4 },
  { roleId: '1477763567167082506', chance: 20, tier: 5 },
  { roleId: '1477766282299572254', chance: 28, tier: 6 },
];

function spinRoulette() {
  const rand = Math.random() * 100;
  let acc = 0;
  for (const r of ROULETTE_ROLES) {
    acc += r.chance;
    if (rand < acc) return { roleId: r.roleId, tier: r.tier };
  }
  return null;
}

const REWARDS = { facile: [5, 15], moyen: [20, 45], difficile: [50, 120] };
function getReward(difficulty) {
  const [min, max] = REWARDS[difficulty] || [5, 15];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function usersCol() {
  return (await getDb()).collection('users');
}
async function pendingCol() {
  return (await getDb()).collection('pending_roles');
}

async function getUser(discordId) {
  const col = await usersCol();
  const doc = await col.findOne({ _id: discordId });
  return doc ? { sayucoins: doc.sayucoins, username: doc.username, avatar: doc.avatar } : null;
}

async function getOrCreateUser(discordId, username, avatar) {
  const col = await usersCol();
  let doc = await col.findOne({ _id: discordId });
  if (!doc) {
    await col.insertOne({ _id: discordId, sayucoins: 0, username, avatar });
    return { sayucoins: 0, username, avatar };
  }
  if (username !== undefined || avatar !== undefined) {
    await col.updateOne(
      { _id: discordId },
      { $set: { username: username ?? doc.username, avatar: avatar ?? doc.avatar } }
    );
  }
  return { sayucoins: doc.sayucoins, username: doc.username, avatar: doc.avatar };
}

async function setUser(discordId, data) {
  const col = await usersCol();
  await col.updateOne({ _id: discordId }, { $set: data }, { upsert: true });
}

async function addSayucoins(discordId, amount, username, avatar) {
  const u = await getOrCreateUser(discordId, username, avatar);
  const newCoins = Math.max(0, u.sayucoins + amount);
  await setUser(discordId, { ...u, sayucoins: newCoins });
  return newCoins;
}

async function getRanking(limit = 50) {
  const col = await usersCol();
  const docs = await col.find({}).sort({ sayucoins: -1 }).limit(limit).toArray();
  return docs.map((d) => ({ discordId: d._id, sayucoins: d.sayucoins, username: d.username, avatar: d.avatar }));
}

async function addPendingRole(discordId, roleId) {
  const col = await pendingCol();
  await col.insertOne({ discordId, roleId });
}

async function getAndClearPendingRoles() {
  const col = await pendingCol();
  const list = await col.find({}).toArray();
  await col.deleteMany({});
  return list.map((d) => ({ discordId: d.discordId, roleId: d.roleId }));
}

module.exports = {
  getUser,
  getOrCreateUser,
  setUser,
  addSayucoins,
  getRanking,
  addPendingRole,
  getAndClearPendingRoles,
  spinRoulette,
  getReward,
  ROULETTE_COST,
};
