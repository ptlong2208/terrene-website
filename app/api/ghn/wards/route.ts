import { type NextRequest } from 'next/server';

import { fetchGhnWards } from '@/lib/ghn';

export async function GET(req: NextRequest) {
  const districtId = Number(new URL(req.url).searchParams.get('districtId'));
  if (!districtId || !Number.isInteger(districtId) || districtId <= 0) {
    return Response.json({ error: 'Invalid districtId' }, { status: 400 });
  }
  const wards = await fetchGhnWards(districtId);
  return Response.json(wards);
}
