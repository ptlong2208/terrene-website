import { type NextRequest } from 'next/server';

import { fetchProductData } from '@/lib/haravan';

// Internal-only — called from Sanity Studio's slug field validation so content
// editors get warned immediately if a slug doesn't match any Haravan product handle,
// instead of finding out later via the Sentry warning on the live product page.
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug') ?? '';
  if (!slug) return Response.json({ exists: false }, { status: 400 });

  const { variants } = await fetchProductData(slug);
  return Response.json({ exists: variants.length > 0 });
}
