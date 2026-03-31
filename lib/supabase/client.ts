import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

export function createClient<TDatabase = Record<string, unknown>>() {
  return createBrowserClient<TDatabase>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
