import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createHmac, randomInt } from 'crypto';
import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { checkoutCustomerSchema, CheckoutErrorCode, SLUG_PATTERN } from '@/lib/checkout';
import { fetchProductData } from '@/lib/haravan';
import logger from '@/lib/logger';
import { savePendingOrder } from '@/lib/orderStore';

const ratelimit = new Ratelimit({
  redis: new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! }),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'ratelimit:checkout',
});

const log = logger.child({ module: 'checkout' });

const PAYOS_BASE_URL = 'https://api-merchant.payos.vn';
const SESSION_MINUTES = 15;

const itemSchema = z.object({
  productSlug: z.string().regex(SLUG_PATTERN),
  productTitle: z.string().max(200),
  variantId: z.number().int().positive(),
  variantTitle: z.string().max(200),
  quantity: z.number().int().min(1).max(100),
  price: z.number(), // client price — ignored; re-fetched server-side
});

const bodySchema = z.object({
  customer: checkoutCustomerSchema,
  items: z.array(itemSchema).min(1).max(20),
});

function err(status: number, code: string, extra?: Record<string, string>) {
  return Response.json({ error: code, ...extra }, { status });
}

function signPayload(data: Record<string, string | number>, checksumKey: string): string {
  const fields = ['amount', 'cancelUrl', 'description', 'orderCode', 'returnUrl'] as const;
  const raw = fields.map((k) => `${k}=${data[k]}`).join('&');
  return createHmac('sha256', checksumKey).update(raw).digest('hex');
}

export async function POST(req: NextRequest) {
  // CSRF: reject requests from other origins
  const origin = req.headers.get('origin');
  const siteUrl =
    process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (!siteUrl) {
    log.error('Neither SITE_URL nor VERCEL_URL is set');
    return err(500, CheckoutErrorCode.ServerError);
  }
  if (origin !== siteUrl) {
    log.warn({ origin, siteUrl }, 'CSRF: request from unexpected origin');
    return err(403, CheckoutErrorCode.Forbidden);
  }

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    log.warn({ ip }, 'Rate limit exceeded');
    return err(429, CheckoutErrorCode.ServerError);
  }

  // Parse + validate body
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error?.issues }, 'Invalid request body');
    return err(400, 'Invalid request.');
  }

  const { customer, items } = parsed.data;

  // Re-fetch prices from Haravan — never trust client-submitted prices
  const slugs = [...new Set(items.map((i) => i.productSlug))];
  const productMap = Object.fromEntries(
    await Promise.all(slugs.map(async (slug) => [slug, await fetchProductData(slug)] as const))
  );

  // Verify each item: variant exists, is available, map to server price
  const verifiedItems = [];
  for (const item of items) {
    const product = productMap[item.productSlug];
    const variant = product?.variants.find((v) => v.id === item.variantId);

    if (!variant) {
      log.warn({ slug: item.productSlug, variantId: item.variantId }, 'Variant not found');
      return err(422, CheckoutErrorCode.NotFound, { product: item.productTitle });
    }
    if (!variant.available) {
      log.warn({ slug: item.productSlug, variantId: item.variantId }, 'Variant out of stock');
      return err(422, CheckoutErrorCode.OutOfStock, { product: item.productTitle });
    }

    verifiedItems.push({
      name: `${item.productTitle}${item.variantTitle ? ` - ${item.variantTitle}` : ''}`.slice(
        0,
        50
      ),
      quantity: item.quantity,
      price: Math.round(variant.price), // server-side price in VND
    });
  }

  // Compute server-side total
  const amount = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (amount <= 0) return err(422, CheckoutErrorCode.ZeroTotal);

  // PayOS credentials
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    log.error('PayOS credentials are not configured');
    return err(500, CheckoutErrorCode.ServerError);
  }

  const orderCode = randomInt(1_000_000_000, 9_999_999_999);
  const returnUrl = `${siteUrl}/checkout/success`;
  const cancelUrl = `${siteUrl}/checkout/cancel`;
  const description = 'Terrene Order'; // PayOS max 25 chars
  const expiredAt = Math.floor(Date.now() / 1000) + SESSION_MINUTES * 60;

  const payload = {
    orderCode,
    amount,
    description,
    buyerName: customer.name,
    buyerEmail: customer.email,
    buyerPhone: customer.phone,
    items: verifiedItems,
    returnUrl,
    cancelUrl,
    expiredAt,
    signature: signPayload({ amount, cancelUrl, description, orderCode, returnUrl }, checksumKey),
  };

  const payosRes = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': clientId,
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!payosRes.ok) {
    log.error({ status: payosRes.status }, 'PayOS HTTP error');
    return err(502, CheckoutErrorCode.PaymentUnavailable);
  }

  const payosData = await payosRes.json();
  if (payosData.code !== '00') {
    log.error({ code: payosData.code, desc: payosData.desc }, 'PayOS returned non-success code');
    return err(502, CheckoutErrorCode.PaymentUnavailable);
  }

  log.info({ orderCode, amount }, 'Payment link created');

  await savePendingOrder(orderCode, {
    customer,
    items: items.map((item) => ({
      variantId: item.variantId,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      price: Math.round(
        productMap[item.productSlug].variants.find((v) => v.id === item.variantId)!.price
      ),
    })),
    amount,
    expiresAt: expiredAt * 1000,
  });

  return Response.json({
    paymentUrl: payosData.data.checkoutUrl,
    expiresAt: expiredAt * 1000,
    orderCode,
  });
}
