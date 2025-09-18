import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getOrCreateUserProfile, updateUserProfile } from '@/lib/profile';

export async function GET() {
  try {
    const supabase = createSupabaseServerClient(cookies());
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const user = data.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const profile = await getOrCreateUserProfile(user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = createSupabaseServerClient(cookies());
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const user = data.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const profile = await updateUserProfile(user.id, body);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


