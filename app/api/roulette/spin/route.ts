import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUser, addSayucoins, addPendingRole } from '@/lib/db';
import { spinRoulette, ROULETTE_COST } from '@/lib/roulette';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  const user = await getUser(session.user.id);
  if (!user || user.sayucoins < ROULETTE_COST) {
    return NextResponse.json(
      { error: `Il te faut ${ROULETTE_COST} Sayucoins pour tourner la roulette !` },
      { status: 400 }
    );
  }
  const result = spinRoulette();
  await addSayucoins(session.user.id, -ROULETTE_COST);
  if (result) await addPendingRole(session.user.id, result.roleId);
  const updated = await getUser(session.user.id);
  return NextResponse.json({
    won: !!result,
    roleId: result?.roleId ?? null,
    tier: result?.tier ?? null,
    sayucoins: updated?.sayucoins ?? 0,
  });
}
