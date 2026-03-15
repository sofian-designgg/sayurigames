import { NextResponse } from 'next/server';
import { getAndClearPendingRoles } from '@/lib/db';

const BOT_SECRET = process.env.SAYURI_BOT_SECRET;

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (!BOT_SECRET || auth !== `Bearer ${BOT_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const list = await getAndClearPendingRoles();
  return NextResponse.json(list);
}
