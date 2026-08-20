import { createBrowserClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

let _supabasePublic: SupabaseClient | null = null;

export function supabasePublic(): SupabaseClient {
  if (!_supabasePublic) {
    _supabasePublic = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _supabasePublic;
}

export function supabaseBrowser(): SupabaseClient {
  return createBrowserClient(SUPABASE_URL, PUBLISHABLE_KEY);
}
