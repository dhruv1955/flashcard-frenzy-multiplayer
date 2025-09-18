import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { ActiveGameRow, GameDoc } from '@/types/db';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const BodySchema = z.object({ playerId: z.string().min(1), gameId: z.string().min(1) });

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
    const games = db.collection<GameDoc>('games');
    const game = await games.findOne({ id: body.gameId });
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    if (game.status !== 'waiting') return NextResponse.json({ error: 'Game not joinable' }, { status: 400 });
    const maxPlayers = game.maxPlayers ?? 6;
    if (game.players.length >= maxPlayers) return NextResponse.json({ error: 'Game is full' }, { status: 400 });
    if (game.players.includes(body.playerId)) return NextResponse.json({ game }, { status: 200 });

    await games.updateOne(
      { id: body.gameId },
      { $push: { players: body.playerId }, $set: { [`scores.${body.playerId}`]: 0 } as any }
    );
    const updated = await games.findOne({ id: body.gameId });
    // Publish update
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


