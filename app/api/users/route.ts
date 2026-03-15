import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateUser } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  const user = await getOrCreateUser(
    session.user.id,
    session.user.name ?? undefined,
    (session.user as any).image ?? undefined
  );
  return NextResponse.json(user);
}
