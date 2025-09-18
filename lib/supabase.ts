import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

type CreateClientParams = {
  supabaseUrl?: string | undefined;
  supabaseAnonKey?: string | undefined;
};

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const createSupabaseBrowserClient = ({
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}: CreateClientParams = {}): SupabaseClient => {
  try {
    const url = supabaseUrl ?? getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = supabaseAnonKey ?? getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return createBrowserClient(url, key, {
      cookies: {
        get: (name: string) => {
          if (typeof document === 'undefined') return undefined;
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : undefined;
        },
        set: (name: string, value: string, options: CookieOptions) => {
          if (typeof document === 'undefined') return;
          const cookie = `${name}=${encodeURIComponent(value)}; Path=${options.path ?? '/'}; Max-Age=${options.maxAge ?? ''}; SameSite=${options.sameSite ?? 'Lax'}; ${options.secure ? 'Secure' : ''}`.trim();
          document.cookie = cookie;
        },
        remove: (name: string, options: CookieOptions) => {
          if (typeof document === 'undefined') return;
          const cookie = `${name}=; Path=${options.path ?? '/'}; Max-Age=0`;
          document.cookie = cookie;
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to create Supabase browser client: ${(error as Error).message}`);
  }
};

export const createSupabaseServerClient = (cookies: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: CookieOptions) => void;
  remove: (name: string, options: CookieOptions) => void;
}, {
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}: CreateClientParams = {}): SupabaseClient => {
  try {
    const url = supabaseUrl ?? getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = supabaseAnonKey ?? getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return createServerClient(url, key, { cookies });
  } catch (error) {
    throw new Error(`Failed to create Supabase server client: ${(error as Error).message}`);
  }
};

export const assertSupabaseEnv = (): void => {
  getEnv('NEXT_PUBLIC_SUPABASE_URL');
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
};


