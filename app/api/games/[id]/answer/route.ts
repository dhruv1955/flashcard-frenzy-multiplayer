import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { ActiveGameRow, GameDoc, QuestionDoc } from '@/types/db';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

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
    // Prevent multiple answers from same player for this question
    if ((game.answeredPlayerIds ?? []).includes(body.playerId)) {
      return NextResponse.json({ correct: false, alreadyAnswered: true, game }, { status: 200 });
    }

    // If already someone got it first, just mark as answered
    if (game.firstCorrectPlayerId) {
      await games.updateOne({ id }, { $push: { answeredPlayerIds: body.playerId } });
      const updatedAfter = await games.findOne({ id });
      return NextResponse.json({ correct: false, game: updatedAfter }, { status: 200 });
    }

    // If correct and first, award points and set winner
    if (correct) {
      await games.updateOne(
        { id },
        {
          $set: { firstCorrectPlayerId: body.playerId },
          $inc: { [`scores.${body.playerId}`]: 1 } as any,
          $push: { answeredPlayerIds: body.playerId },
        }
      );
    } else {
      await games.updateOne({ id }, { $push: { answeredPlayerIds: body.playerId } });
    }

    const updated = await games.findOne({ id });
    // publish realtime score update and event
    const admin = getSupabaseAdmin();
    const snapshot: ActiveGameRow = {
      id: updated!.id,
      game_state: updated!,
      players: updated!.players,
      current_question_id: updated!.currentQuestion ?? null,
      scores: updated!.scores,
      status: updated!.status,
    };
    await admin.from('active_games').upsert(snapshot);
    await admin.from('game_events').insert({
      id: crypto.randomUUID(),
      game_id: updated!.id,
      player_id: body.playerId,
      event_type: 'answer',
      data: { correct },
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ correct, game: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


