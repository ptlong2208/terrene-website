import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/**
 * Middleware-flavored Supabase client — cookies come from NextRequest/NextResponse,
 * not next/headers (middleware runs before that context exists). Separate from
 * lib/supabase-server.ts for the same reason that one is separate from lib/supabase.ts:
 * each Next.js runtime context has its own cookie access API.
 */
export function supabaseMiddlewareClient(request: NextRequest): {
  supabase: SupabaseClient;
  getResponse: () => NextResponse;
} {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  return { supabase, getResponse: () => response };
}
