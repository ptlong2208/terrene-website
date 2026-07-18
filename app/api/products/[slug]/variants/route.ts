import { fetchProductData } from '@/lib/haravan';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const SLUG_PATTERN = /^[a-z0-9-]+$/;

  if (!SLUG_PATTERN.test(slug)) {
    return new Response('Invalid slug', { status: 400 });
  }

  const data = await fetchProductData(slug);
  return Response.json(data);
}
