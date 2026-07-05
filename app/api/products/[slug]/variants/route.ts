import { fetchProductData } from '@/lib/haravan';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await fetchProductData(slug);
  return Response.json(data);
}
