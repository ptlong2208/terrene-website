import { fetchProvinces } from '@/lib/addressData';

export async function GET() {
  const provinces = await fetchProvinces();
  return Response.json(provinces);
}
