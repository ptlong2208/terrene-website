import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest } from 'next/server';

import { CheckoutErrorCode, resolveShippingFee, shippingMethodSchema } from '@/lib/checkout';
import { SHIPPING_MAX_ORDER_WEIGHT } from '@/lib/config';

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
  const province = searchParams.get('province') ?? '';
  const ward = searchParams.get('ward') ?? '';
  const wardCode = searchParams.get('wardCode') ?? '';
  const methodResult = shippingMethodSchema.safeParse(searchParams.get('method'));

  if (!province || !ward || !wardCode || !methodResult.success) {
    return Response.json(
      { error: 'province, ward, wardCode and method are required' },
      { status: 400 }
    );
  }

  const rawWeight = Number(searchParams.get('weight'));
  const weightGrams = Number.isFinite(rawWeight) && rawWeight > 0 ? rawWeight : 200;

  if (weightGrams > SHIPPING_MAX_ORDER_WEIGHT) {
    return Response.json(
      {
        error: CheckoutErrorCode.OrderTooHeavy,
        limit: String(Math.round(SHIPPING_MAX_ORDER_WEIGHT / 1000)),
      },
      { status: 422 }
    );
  }

  const rawSubtotal = Number(searchParams.get('subtotal'));
  const subtotal = Number.isFinite(rawSubtotal) && rawSubtotal > 0 ? rawSubtotal : 0;

  const fee = await resolveShippingFee({
    province,
    ward,
    wardCode,
    weightGrams,
    subtotal,
    method: methodResult.data,
  });

  if (fee === null) {
    return Response.json({ error: CheckoutErrorCode.ExpressNotAvailable }, { status: 422 });
  }

  return Response.json({ fee });
}
