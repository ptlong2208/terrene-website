import { fetchGhnDistricts } from '@/lib/ghn';

export async function GET() {
  const districts = await fetchGhnDistricts();
  return Response.json(districts);
}
