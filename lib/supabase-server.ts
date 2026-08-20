import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/**
 * Server-side client for /admin route handlers and server components — reads/writes
 * the session cookie. Kept in its own file (not lib/supabase.ts) because it imports
 * next/headers, which must never end up in a Client Component's bundle — even an
 * unused import of this function from a 'use client' file would pull next/headers
 * along with it and break the build.
 */
export async function supabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component render — middleware refreshes the session instead
        }
      },
    },
  });
}
