import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { GameDoc, GameHistoryDoc, QuestionDoc } from '@/types/db';

const ParamsSchema = z.object({ id: z.string().min(1) });

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = ParamsSchema.parse(await context.params);
    const db = await getMongoDb();
    const game = await db.collection<GameDoc>('games').findOne({ id });
    if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const histories = await db.collection<GameHistoryDoc>('gameHistory').find({ gameId: id }).toArray();
    const qids = Array.from(new Set((game.submissions ?? []).map((s) => s.questionId)));
    const qDocs = await db.collection<QuestionDoc>('questions').find({ id: { $in: qids } }).toArray();
    const byId = new Map(qDocs.map((q) => [q.id, q] as const));
    const breakdown = (game.submissions ?? []).map((s) => ({
      questionId: s.questionId,
      prompt: byId.get(s.questionId)?.question ?? 'Unknown',
      playerId: s.playerId,
      answer: s.answer,
      correct: s.correct,
      timeMs: s.timeMs,
      at: s.at,
    }));
    return NextResponse.json({ game, histories, breakdown });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


