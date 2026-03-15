import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db';

const BOT_SECRET = process.env.SAYURI_BOT_SECRET;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = _req.headers.get('authorization');
  if (!BOT_SECRET || auth !== `Bearer ${BOT_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await getUser(params.id);
  if (!user) return NextResponse.json({ sayucoins: 0 });
  return NextResponse.json({ sayucoins: user.sayucoins, username: user.username });
}
