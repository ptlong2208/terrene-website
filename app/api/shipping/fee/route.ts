import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest } from 'next/server';

import { CheckoutErrorCode } from '@/lib/checkout';
import { GHN_MAX_ORDER_WEIGHT } from '@/lib/config';
import { getShippingFee } from '@/lib/ghn';

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit)
    _ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'ratelimit:shipping-fee',
    });
  return _ratelimit;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
  const { success } = await getRatelimit().limit(ip);
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const districtId = Number(searchParams.get('districtId'));
  const wardCode = searchParams.get('wardCode') ?? '';

  if (!districtId || !Number.isInteger(districtId) || districtId <= 0 || !wardCode) {
    return Response.json({ error: 'districtId and wardCode are required' }, { status: 400 });
  }

  const rawWeight = Number(searchParams.get('weight'));
  const weight = Number.isFinite(rawWeight) && rawWeight > 0 ? rawWeight : 200;

  if (weight > GHN_MAX_ORDER_WEIGHT) {
    return Response.json(
      {
        error: CheckoutErrorCode.OrderTooHeavy,
        limit: String(Math.round(GHN_MAX_ORDER_WEIGHT / 1000)),
      },
      { status: 422 }
    );
  }

  const fee = await getShippingFee(districtId, wardCode, weight);
  return Response.json({ fee });
}
