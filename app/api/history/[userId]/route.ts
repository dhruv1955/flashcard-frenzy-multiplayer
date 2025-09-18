import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { GameHistoryDoc } from '@/types/db';

const ParamsSchema = z.object({ userId: z.string().min(1) });

export async function GET(_req: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = ParamsSchema.parse(await context.params);
    const db = await getMongoDb();
    const docs = await db.collection<GameHistoryDoc>('gameHistory').find({ playerId: userId }).sort({ _id: -1 }).limit(50).toArray();
    return NextResponse.json({ history: docs });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


