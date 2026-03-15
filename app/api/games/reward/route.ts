import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addSayucoins } from '@/lib/db';
import { getReward, type Difficulty } from '@/lib/games';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const difficulty = (body.difficulty as Difficulty) || 'facile';
  if (!['facile', 'moyen', 'difficile'].includes(difficulty)) {
    return NextResponse.json({ error: 'Difficulté invalide' }, { status: 400 });
  }
  const reward = getReward(difficulty);
  const newTotal = await addSayucoins(
    session.user.id,
    reward,
    session.user.name ?? undefined,
    (session.user as any).image ?? undefined
  );
  return NextResponse.json({ reward, sayucoins: newTotal });
}
