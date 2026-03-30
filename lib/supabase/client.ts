import { createBrowserClient } from '@supabase/ssr';

export function createClient<TDatabase = Record<string, unknown>>() {
  return createBrowserClient<TDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}
