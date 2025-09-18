import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
};

let cached: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient => {
  if (cached) return cached;
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
};


