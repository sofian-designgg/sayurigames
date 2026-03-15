const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const PREFIX = '-';
const SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const BOT_SECRET = process.env.SAYURI_BOT_SECRET;
const RANKING_CHANNEL_ID = process.env.DISCORD_RANKING_CHANNEL_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

function apiUrl(path) {
  const base = SITE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}

async function fetchRanking() {
  const res = await fetch(apiUrl('/api/ranking'));
  if (!res.ok) return [];
  return res.json();
}

async function fetchUserSayucoins(discordId) {
  if (!BOT_SECRET) return null;
  const res = await fetch(apiUrl(`/api/bot/user/${discordId}`), {
    headers: { Authorization: `Bearer ${BOT_SECRET}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sayucoins ?? 0;
}

async function claimPendingRoles() {
  if (!BOT_SECRET) return;
  const res = await fetch(apiUrl('/api/bot/pending-roles'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${BOT_SECRET}` },
  });
  if (!res.ok) return;
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) return;
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return;
  for (const { discordId, roleId } of list) {
    try {
      const member = await guild.members.fetch(discordId).catch(() => null);
      if (member && roleId) {
        await member.roles.add(roleId);
        const channel = member.dmChannel || await member.createDM().catch(() => null);
        if (channel) {
          await channel.send({
            content: '🎉 Félicitations ! Tu as gagné un rôle à la roulette Sayuri Games. Il t’a été attribué sur le serveur.',
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Erreur attribution rôle', discordId, roleId, err.message);
    }
  }
}

async function postRanking() {
  if (!RANKING_CHANNEL_ID) return;
  const channel = client.channels.cache.get(RANKING_CHANNEL_ID);
  if (!channel) return;
  const ranking = await fetchRanking();
  const lines = ranking.slice(0, 15).map((r, i) => {
    const name = r.username || `User#${(r.discordId || '').slice(-6)}`;
    return `**#${i + 1}** ${name} — ${r.sayucoins} Sayucoins`;
  });
  const embed = new EmbedBuilder()
    .setTitle('🏆 Classement Sayuri Games')
    .setDescription(lines.length ? lines.join('\n') : 'Aucun joueur pour le moment.')
    .setColor(0xf8b4c4)
    .setTimestamp()
    .setFooter({ text: 'Classement mis à jour • sayurigames.vercel.app' });
  await channel.send({ embeds: [embed] });
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
    const coins = await fetchUserSayucoins(target.id);
    if (coins === null) {
      await message.reply('Impossible de récupérer le solde pour le moment.');
      return;
    }
    await message.reply(`${target === message.author ? 'Tu as' : `${target.username} a`} **${coins}** Sayucoins.`);
    return;
  }

  if (command === 'ranking' || command === 'classement') {
    const ranking = await fetchRanking();
    const lines = ranking.slice(0, 10).map((r, i) => {
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
