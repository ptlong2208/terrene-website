import { type NextRequest } from 'next/server';

import { getShippingFee } from '@/lib/ghn';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const districtId = Number(searchParams.get('districtId'));
  const wardCode = searchParams.get('wardCode') ?? '';

  if (!districtId || !Number.isInteger(districtId) || districtId <= 0 || !wardCode) {
    return Response.json({ error: 'districtId and wardCode are required' }, { status: 400 });
  }

  const fee = await getShippingFee(districtId, wardCode);
  return Response.json({ fee });
}
