import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { ActiveGameRow } from '@/types/db';
import type { GameDoc } from '@/types/db';

const BodySchema = z.object({ playerId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient(cookies());
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const authedUser = data.user;
    if (!authedUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await req.json();
    const body = BodySchema.parse(json);

    if (body.playerId !== authedUser.id) {
      return NextResponse.json({ error: 'playerId mismatch' }, { status: 400 });
    }

    const db = await getMongoDb();
    const now = new Date().toISOString();
    const game: GameDoc = {
      id: crypto.randomUUID(),
      players: [authedUser.id],
      currentQuestion: undefined,
      scores: { [authedUser.id]: 0 },
      status: 'waiting',
      createdAt: now,
    };
    await db.collection<GameDoc>('games').insertOne(game);
    // Publish initial realtime state
    const admin = getSupabaseAdmin();
    const snapshot: ActiveGameRow = {
      id: game.id,
      game_state: game,
      players: game.players,
      current_question_id: game.currentQuestion ?? null,
      scores: game.scores,
      status: game.status,
    };
    const { error: upsertErr } = await admin.from('active_games').upsert(snapshot);
    if (upsertErr) throw upsertErr;
    return NextResponse.json({ game }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


