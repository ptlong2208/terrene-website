import { createHmac, randomInt } from 'crypto';
import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { checkoutCustomerSchema, SLUG_PATTERN } from '@/lib/checkout';
import { fetchProductData } from '@/lib/haravan';
import { savePendingOrder } from '@/lib/orderStore';

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

function err(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

function signPayload(data: Record<string, string | number>, checksumKey: string): string {
  const fields = ['amount', 'cancelUrl', 'description', 'orderCode', 'returnUrl'] as const;
  const raw = fields.map((k) => `${k}=${data[k]}`).join('&');
  return createHmac('sha256', checksumKey).update(raw).digest('hex');
}

export async function POST(req: NextRequest) {
  // CSRF: reject requests from other origins
  const origin = req.headers.get('origin');
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return err(500, 'Server misconfiguration.');
  if (origin !== siteUrl) return err(403, 'Forbidden.');

  // Parse + validate body
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return err(400, 'Invalid request.');

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

    if (!variant) return err(422, `Variant not found for "${item.productTitle}".`);
    if (!variant.available) return err(422, `"${item.productTitle}" is out of stock.`);

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
  if (amount <= 0) return err(422, 'Order total must be greater than zero.');

  // PayOS credentials
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) return err(500, 'Server misconfiguration.');

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

  if (!payosRes.ok) return err(502, 'Payment service unavailable. Please try again.');

  const payosData = await payosRes.json();
  if (payosData.code !== '00') return err(502, payosData.desc ?? 'Payment service error.');

  savePendingOrder(orderCode, {
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
  });
}
