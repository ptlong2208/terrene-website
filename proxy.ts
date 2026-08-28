import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { supabaseMiddlewareClient } from './lib/supabase-middleware';

const intlMiddleware = createMiddleware(routing);

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/auth/callback'];

async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/admin');

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = supabaseMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return isApi
      ? NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    return isApi
      ? NextResponse.json({ error: 'forbidden' }, { status: 403 })
      : NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return getResponse();
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return adminMiddleware(request);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!studio|admin|api|_next|_vercel|.*\\..*).*)',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
