import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { GameHistoryDoc } from '@/types/db';

const ParamsSchema = z.object({ userId: z.string().min(1) });

export async function GET(_req: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = ParamsSchema.parse(await context.params);
    const db = await getMongoDb();
    const coll = db.collection<GameHistoryDoc>('gameHistory');
    const records = await coll.find({ playerId: userId }).sort({ createdAt: -1 }).limit(200).toArray();
    const total = records.length;
    const wins = records.filter((r) => {
      // consider a win if player has top finalScore among players in that game in recent records; simplified view
      return r.finalScore === Math.max(...records.filter((x) => x.gameId === r.gameId).map((x) => x.finalScore));
    }).length;
    const avgScore = total ? records.reduce((a, r) => a + r.finalScore, 0) / total : 0;
    const avgAccuracy = total ? records.reduce((a, r) => a + (r.accuracy ?? 0), 0) / total : 0;

    // category performance (requires answers to include question categories; not stored here). Placeholder aggregation by correctness.
    const trend = records.map((r) => ({ t: r.createdAt, score: r.finalScore, acc: r.accuracy }));

    return NextResponse.json({ total, wins, avgScore, avgAccuracy, trend });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


