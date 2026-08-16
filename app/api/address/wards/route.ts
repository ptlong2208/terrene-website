import { type NextRequest } from 'next/server';

import { fetchWards } from '@/lib/addressData';

export async function GET(req: NextRequest) {
  const provinceCode = new URL(req.url).searchParams.get('provinceCode') ?? '';
  if (!provinceCode) {
    return Response.json({ error: 'Invalid provinceCode' }, { status: 400 });
  }
  const wards = await fetchWards(provinceCode);
  return Response.json(wards);
}
