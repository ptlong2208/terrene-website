import { SLUG_PATTERN } from '@/lib/checkout';
import { fetchProductData } from '@/lib/haravan';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!SLUG_PATTERN.test(slug)) {
    return new Response('Invalid slug', { status: 400 });
  }

  const data = await fetchProductData(slug);
  return Response.json(data);
}
