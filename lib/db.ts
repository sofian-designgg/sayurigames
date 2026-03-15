// Stockage MongoDB : utilisateurs, Sayucoins, classement, rôles en attente

import { MongoClient, Collection } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL;
let client: MongoClient | null = null;

async function getDb() {
  if (!MONGO_URL) throw new Error('MONGO_URL est requis. Configure la variable d\'environnement sur Vercel.');
  if (!client) client = new MongoClient(MONGO_URL);
  if (!client.topology?.isConnected()) await client.connect();
  return client.db();
}

interface UserDoc {
  _id: string;
  sayucoins: number;
  username?: string;
  avatar?: string;
}

interface PendingRoleDoc {
  discordId: string;
  roleId: string;
}

function usersCol(): Promise<Collection<UserDoc>> {
  return getDb().then((db) => db.collection<UserDoc>('users'));
}

function pendingCol(): Promise<Collection<PendingRoleDoc>> {
  return getDb().then((db) => db.collection<PendingRoleDoc>('pending_roles'));
}

export async function getUser(discordId: string) {
  const col = await usersCol();
  const doc = await col.findOne({ _id: discordId });
  if (!doc) return null;
  return { sayucoins: doc.sayucoins, username: doc.username, avatar: doc.avatar };
}

export async function getOrCreateUser(discordId: string, username?: string, avatar?: string) {
  const col = await usersCol();
  let doc = await col.findOne({ _id: discordId });
  if (!doc) {
    await col.insertOne({
      _id: discordId,
      sayucoins: 0,
      username,
      avatar,
    } as UserDoc);
    return { sayucoins: 0, username, avatar };
  }
  if (username !== undefined || avatar !== undefined) {
    await col.updateOne(
      { _id: discordId },
      { $set: { username: username ?? doc.username, avatar: avatar ?? doc.avatar } }
    );
    doc = { ...doc, username: username ?? doc.username, avatar: avatar ?? doc.avatar };
  }
  return { sayucoins: doc.sayucoins, username: doc.username, avatar: doc.avatar };
}

export async function setUser(
  discordId: string,
  data: { sayucoins: number; username?: string; avatar?: string }
) {
  const col = await usersCol();
  await col.updateOne(
    { _id: discordId },
    { $set: data },
    { upsert: true }
  );
}

export async function addSayucoins(
  discordId: string,
  amount: number,
  username?: string,
  avatar?: string
) {
  const u = await getOrCreateUser(discordId, username, avatar);
  const newCoins = Math.max(0, u.sayucoins + amount);
  await setUser(discordId, { ...u, sayucoins: newCoins });
  return newCoins;
}

export async function getRanking(limit = 50) {
  const col = await usersCol();
  const docs = await col
    .find({})
    .sort({ sayucoins: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => ({
    discordId: d._id,
    sayucoins: d.sayucoins,
    username: d.username,
    avatar: d.avatar,
  }));
}

export async function addPendingRole(discordId: string, roleId: string) {
  const col = await pendingCol();
  await col.insertOne({ discordId, roleId });
}

export async function getAndClearPendingRoles(): Promise<{ discordId: string; roleId: string }[]> {
  const col = await pendingCol();
  const list = await col.find({}).toArray();
  await col.deleteMany({});
  return list.map((d) => ({ discordId: d.discordId, roleId: d.roleId }));
}
