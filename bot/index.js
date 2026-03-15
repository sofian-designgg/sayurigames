const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const db = require('./db');

const PREFIX = '-';
const SECRET = process.env.SAYURI_BOT_SECRET;
const RANKING_CHANNEL_ID = process.env.DISCORD_RANKING_CHANNEL_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const PORT = process.env.PORT || 3001;

// ——— API (le site Vercel appelle ces routes) ———
const app = express();
app.use(express.json());

function auth(req, res, next) {
  if (req.headers.authorization !== `Bearer ${SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/ranking', async (req, res) => {
  try {
    const ranking = await db.getRanking(50);
    res.json(ranking);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/user/:id', auth, async (req, res) => {
  try {
    const u = await db.getUser(req.params.id);
    res.json({ sayucoins: u?.sayucoins ?? 0, username: u?.username });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users', auth, async (req, res) => {
  try {
    const { discordId, username, avatar } = req.body || {};
    if (!discordId) return res.status(400).json({ error: 'discordId requis' });
    const user = await db.getOrCreateUser(discordId, username, avatar);
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/games/reward', auth, async (req, res) => {
  try {
    const { discordId, difficulty, username, avatar } = req.body || {};
    if (!discordId) return res.status(400).json({ error: 'discordId requis' });
    const d = difficulty && ['facile', 'moyen', 'difficile'].includes(difficulty) ? difficulty : 'facile';
    const reward = db.getReward(d);
    const sayucoins = await db.addSayucoins(discordId, reward, username, avatar);
    res.json({ reward, sayucoins });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/roulette/spin', auth, async (req, res) => {
  try {
    const { discordId, username, avatar } = req.body || {};
    if (!discordId) return res.status(400).json({ error: 'discordId requis' });
    const u = await db.getUser(discordId);
    if (!u || u.sayucoins < db.ROULETTE_COST) {
      return res.status(400).json({ error: `Il te faut ${db.ROULETTE_COST} Sayucoins pour tourner la roulette !` });
    }
    const result = db.spinRoulette();
    await db.addSayucoins(discordId, -db.ROULETTE_COST, username, avatar);
    if (result) await db.addPendingRole(discordId, result.roleId);
    const updated = await db.getUser(discordId);
    res.json({
      won: !!result,
      roleId: result?.roleId ?? null,
      tier: result?.tier ?? null,
      sayucoins: updated?.sayucoins ?? 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/bot/pending-roles', auth, async (req, res) => {
  try {
    const list = await db.getAndClearPendingRoles();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`API bot écoute sur le port ${PORT}`));

// ——— Discord ———
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

async function postRanking() {
  if (!RANKING_CHANNEL_ID) return;
  const channel = client.channels.cache.get(RANKING_CHANNEL_ID);
  if (!channel) return;
  try {
    const ranking = await db.getRanking(15);
    const lines = ranking.map((r, i) => {
      const name = r.username || `User#${(r.discordId || '').slice(-6)}`;
      return `**#${i + 1}** ${name} — ${r.sayucoins} Sayucoins`;
    });
    const embed = new EmbedBuilder()
      .setTitle('🏆 Classement Sayuri Games')
      .setDescription(lines.length ? lines.join('\n') : 'Aucun joueur pour le moment.')
      .setColor(0xf8b4c4)
      .setTimestamp()
      .setFooter({ text: 'Classement mis à jour • Joue sur le site !' });
    await channel.send({ embeds: [embed] });
  } catch (e) {
    console.error('postRanking', e.message);
  }
}

async function claimPendingRoles() {
  try {
    const list = await db.getAndClearPendingRoles();
    if (list.length === 0) return;
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;
    for (const { discordId, roleId } of list) {
      try {
        const member = await guild.members.fetch(discordId).catch(() => null);
        if (member && roleId) {
          await member.roles.add(roleId);
          const ch = member.dmChannel || (await member.createDM().catch(() => null));
          if (ch) await ch.send({ content: '🎉 Félicitations ! Tu as gagné un rôle à la roulette Sayuri Games.' }).catch(() => {});
        }
      } catch (err) {
        console.error('Erreur rôle', discordId, err.message);
      }
    }
  } catch (e) {
    console.error('claimPendingRoles', e.message);
  }
}

client.once('ready', () => {
  console.log(`Bot Sayuri Games connecté : ${client.user.tag}`);
  if (RANKING_CHANNEL_ID) {
    postRanking();
    setInterval(postRanking, 60 * 60 * 1000);
  }
  setInterval(claimPendingRoles, 2 * 60 * 1000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args[0]?.toLowerCase();
  if (!command) return;

  if (command === 'argent' || command === 'balance' || command === 'sayucoins') {
    const target = message.mentions.users.first() || message.author;
    const u = await db.getUser(target.id);
    const coins = u?.sayucoins ?? 0;
    await message.reply(`${target === message.author ? 'Tu as' : `${target.username} a`} **${coins}** Sayucoins.`);
    return;
  }

  if (command === 'ranking' || command === 'classement') {
    const ranking = await db.getRanking(10);
    const lines = ranking.map((r, i) => {
      const name = r.username || `User#${(r.discordId || '').slice(-6)}`;
      return `#${i + 1} ${name} — ${r.sayucoins} Sayucoins`;
    });
    const embed = new EmbedBuilder()
      .setTitle('🏆 Classement Sayuri Games')
      .setDescription(lines.length ? lines.join('\n') : 'Aucun joueur.')
      .setColor(0xf8b4c4)
      .setFooter({ text: 'Joue sur le site pour monter !' });
    await message.reply({ embeds: [embed] });
    return;
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
