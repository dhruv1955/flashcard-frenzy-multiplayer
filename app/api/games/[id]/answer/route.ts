import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { GameDoc, QuestionDoc } from '@/types/db';

const ParamsSchema = z.object({ id: z.string().min(1) });
const BodySchema = z.object({ playerId: z.string().min(1), answer: z.string().min(1) });

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient(cookies());
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const authedUser = data.user;
    if (!authedUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = ParamsSchema.parse(await context.params);
    const json = await req.json();
    const body = BodySchema.parse(json);
    if (body.playerId !== authedUser.id) return NextResponse.json({ error: 'playerId mismatch' }, { status: 400 });

    const db = await getMongoDb();
    const games = db.collection<GameDoc>('games');
    const game = await games.findOne({ id });
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    if (!game.currentQuestion) return NextResponse.json({ error: 'No active question' }, { status: 400 });

    const question = await db.collection<QuestionDoc>('questions').findOne({ id: game.currentQuestion });
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    const correct = question.answer.trim().toLowerCase() === body.answer.trim().toLowerCase();
    const increment = correct ? 1 : 0;
    await games.updateOne(
      { id },
      { $inc: { [`scores.${body.playerId}`]: increment } as any }
    );
    const updated = await games.findOne({ id });
    return NextResponse.json({ correct, game: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


