import { type NextRequest } from 'next/server';

import { getShippingFee } from '@/lib/ghn';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtId = Number(searchParams.get('districtId'));
  const wardCode = searchParams.get('wardCode') ?? '';

  if (!districtId || !Number.isInteger(districtId) || districtId <= 0 || !wardCode) {
    return Response.json({ error: 'districtId and wardCode are required' }, { status: 400 });
  }

  const rawWeight = Number(searchParams.get('weight'));
  const weight = Number.isFinite(rawWeight) && rawWeight > 0 ? rawWeight : 200;
  const fee = await getShippingFee(districtId, wardCode, weight);
  return Response.json({ fee });
}
