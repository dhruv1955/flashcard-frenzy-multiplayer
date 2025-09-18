import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { ActiveGameRow, GameDoc } from '@/types/db';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const ParamsSchema = z.object({ id: z.string().min(1) });

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createSupabaseServerClient(cookies());
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = ParamsSchema.parse(await context.params);
    const db = await getMongoDb();
    const games = db.collection<GameDoc>('games');
    const game = await games.findOne({ id });
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    if (game.status !== 'in_progress') return NextResponse.json({ error: 'Game not in progress' }, { status: 400 });
    const queue = game.questionQueue ?? [];
    const currentIndex = (game.currentIndex ?? 0) + 1;
    if (currentIndex >= queue.length) {
      await games.updateOne({ id }, { $set: { status: 'completed', endedAt: new Date().toISOString(), currentQuestion: null, currentQuestionStartedAt: null } as any });
      const updated = await games.findOne({ id });
      return NextResponse.json({ game: updated }, { status: 200 });
    }
    await games.updateOne(
      { id },
      { $set: { currentIndex, currentQuestion: queue[currentIndex], currentQuestionStartedAt: new Date().toISOString(), answeredPlayerIds: [], firstCorrectPlayerId: null } }
    );
    const updated = await games.findOne({ id });
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
    return NextResponse.json({ game: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


