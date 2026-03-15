// Le site n’a pas de base : il appelle l’API du bot (Railway + MongoDB).

const BOT_API_URL = process.env.BOT_API_URL?.replace(/\/$/, '');
const SECRET = process.env.SAYURI_BOT_SECRET;

function api(path: string, options: RequestInit = {}) {
  if (!BOT_API_URL) throw new Error('BOT_API_URL manquant. Configure la variable sur Vercel (URL du bot Railway).');
  return fetch(`${BOT_API_URL}${path.startsWith('/') ? path : '/' + path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(SECRET ? { Authorization: `Bearer ${SECRET}` } : {}),
      ...options.headers,
    },
  });
}

export async function getUser(discordId: string) {
  try {
    const res = await api(`/api/user/${discordId}`);
    const data = await res.json();
    if (!res.ok) return null;
    return { sayucoins: data.sayucoins ?? 0, username: data.username, avatar: data.avatar };
  } catch {
    return null;
  }
}

export async function getOrCreateUser(discordId: string, username?: string, avatar?: string) {
  const res = await api('/api/users', {
    method: 'POST',
    body: JSON.stringify({ discordId, username, avatar }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur API bot');
  }
  return res.json();
}

export async function setUser(
  _discordId: string,
  _data: { sayucoins: number; username?: string; avatar?: string }
) {
  // Géré côté bot uniquement
}

export async function addSayucoins(
  _discordId: string,
  _amount: number,
  _username?: string,
  _avatar?: string
) {
  // Utilisé uniquement via les routes du bot (games/reward, roulette)
  return 0;
}

export async function getRanking(limit = 50) {
  try {
    const res = await api('/api/ranking');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function addPendingRole(_discordId: string, _roleId: string) {
  // Géré dans la route /api/roulette/spin du bot
}

export async function getAndClearPendingRoles(): Promise<{ discordId: string; roleId: string }[]> {
  try {
    const res = await api('/api/bot/pending-roles', { method: 'POST' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
