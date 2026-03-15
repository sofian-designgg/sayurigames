import { NextResponse } from 'next/server';
import { getRanking } from '@/lib/db';

export async function GET() {
  const ranking = await getRanking(50);
  return NextResponse.json(ranking);
}
