import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BOT_API_URL = process.env.BOT_API_URL?.replace(/\/$/, '');
const SECRET = process.env.SAYURI_BOT_SECRET;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  if (!BOT_API_URL || !SECRET) return NextResponse.json({ error: 'API bot non configurée' }, { status: 500 });
  const res = await fetch(`${BOT_API_URL}/api/roulette/spin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify({
      discordId: session.user.id,
      username: session.user.name ?? undefined,
      avatar: (session.user as any).image ?? undefined,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: data.error || 'Erreur' }, { status: res.status });
  return NextResponse.json(data);
}
