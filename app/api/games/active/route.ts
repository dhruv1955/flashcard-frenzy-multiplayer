import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import type { GameDoc } from '@/types/db';

export async function GET() {
  try {
    const db = await getMongoDb();
    const games = await db.collection<GameDoc>('games').find({ status: 'waiting' }).project({ id: 1, players: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(50).toArray();
    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


