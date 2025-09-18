import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb } from '@/lib/mongodb';
import type { GameDoc } from '@/types/db';

const ParamsSchema = z.object({ id: z.string().min(1) });

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = ParamsSchema.parse(await context.params);
    const db = await getMongoDb();
    const game = await db.collection<GameDoc>('games').findOne({ id });
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


