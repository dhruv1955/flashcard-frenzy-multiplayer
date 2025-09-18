import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import type { QuestionDoc } from '@/types/db';

export async function GET() {
  try {
    const db = await getMongoDb();
    const collection = db.collection<QuestionDoc>('questions');
    const [doc] = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
    if (!doc) return NextResponse.json({ error: 'No questions found' }, { status: 404 });
    return NextResponse.json({ question: doc });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


