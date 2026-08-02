import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  type CheckoutCustomer,
  checkoutCustomerSchema,
  CheckoutErrorCode,
  SLUG_PATTERN,
} from '@/lib/checkout';
import { getShippingFee } from '@/lib/ghn';
import { fetchProductData, type HaravanProduct } from '@/lib/haravan';
import logger from '@/lib/logger';
import type { PendingOrderItem } from '@/lib/orderStore';

const log = logger.child({ module: 'checkout' });

export const itemSchema = z.object({
  productSlug: z.string().regex(SLUG_PATTERN),
  productTitle: z.string().max(200),
  variantId: z.number().int().positive(),
  variantTitle: z.string().max(200),
  quantity: z.number().int().min(1).max(100),
  price: z.number(),
});

export const checkoutBodySchema = z.object({
  customer: checkoutCustomerSchema,
  items: z.array(itemSchema).min(1).max(20),
  shippingFee: z.number().int().nonnegative().nullable(),
});

export function errResponse(status: number, code: string, extra?: Record<string, string>) {
  return Response.json({ error: code, ...extra }, { status });
}

/**
 * Validates CSRF origin. Returns `{ siteUrl }` on success, or an error Response to return early.
 */
export function checkOrigin(req: NextRequest): { siteUrl: string } | Response {
  const origin = req.headers.get('origin');
  const siteUrl =
    process.env.SITE_URL ??
    (process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : null) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (!siteUrl) {
    log.error('Neither SITE_URL nor VERCEL_URL is set');
    return errResponse(500, CheckoutErrorCode.ServerError);
  }
  const branchUrl = process.env.VERCEL_BRANCH_URL
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : null;
  if (origin !== siteUrl && origin !== branchUrl) {
    log.warn({ origin, siteUrl }, 'CSRF: request from unexpected origin');
    return errResponse(403, CheckoutErrorCode.Forbidden);
  }
  return { siteUrl };
}

/** Creates a sliding-window rate limiter (5 req / 1 min) with the given Redis prefix. */
export function makeRatelimit(prefix: string): Ratelimit {
  return new Ratelimit({
    redis: new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix,
  });
}

/** Fetches Haravan product data for all unique slugs in the item list. */
export async function fetchProductMap(
  items: Array<{ productSlug: string }>
): Promise<Record<string, HaravanProduct>> {
  const slugs = [...new Set(items.map((i) => i.productSlug))];
  return Object.fromEntries(
    await Promise.all(slugs.map(async (slug) => [slug, await fetchProductData(slug)] as const))
  );
}

/**
 * Rate-limits, parses, and validates the checkout request body end-to-end.
 * Returns `{ customer, pendingItems, amount }` on success, or an error Response to return early.
 * Pass the route's own ratelimit instance so each route keeps its own prefix.
 */
export async function validateCheckoutRequest(
  req: NextRequest,
  ratelimit: Ratelimit
): Promise<
  | {
      siteUrl: string;
      customer: CheckoutCustomer;
      pendingItems: PendingOrderItem[];
      subtotal: number;
      shippingFee: number;
      amount: number;
    }
  | Response
> {
  const originResult = checkOrigin(req);
  if (originResult instanceof Response) return originResult;
  const { siteUrl } = originResult;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    log.warn({ ip }, 'Rate limit exceeded');
    return errResponse(429, CheckoutErrorCode.ServerError);
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutBodySchema.safeParse(body);
  if (!parsed.success) {
    log.warn({ issues: parsed.error?.issues }, 'Invalid request body');
    return errResponse(400, 'Invalid request.');
  }

  const { customer, items, shippingFee: clientFee } = parsed.data;

  const productMap = await fetchProductMap(items);
  const itemResult = verifyItems(items, productMap);
  if (itemResult instanceof Response) return itemResult;
  const pendingItems = itemResult;

  const subtotal = pendingItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (subtotal <= 0) return errResponse(422, CheckoutErrorCode.ZeroTotal);

  const shippingFee: number = await getShippingFee(customer.districtId, customer.wardCode);
  if (clientFee !== null && clientFee !== shippingFee) {
    log.warn({ clientFee, shippingFee }, 'Shipping fee mismatch');
    return errResponse(409, CheckoutErrorCode.ShippingFeeChanged, { fee: String(shippingFee) });
  }

  return { siteUrl, customer, pendingItems, subtotal, shippingFee, amount: subtotal + shippingFee };
}

/**
 * Verifies each item against live Haravan data (variant exists, in stock).
 * Returns an array of PendingOrderItem on success, or an error Response on failure.
 */
export function verifyItems(
  items: z.infer<typeof itemSchema>[],
  productMap: Record<string, HaravanProduct>
): PendingOrderItem[] | Response {
  const pendingItems: PendingOrderItem[] = [];
  for (const item of items) {
    const variant = productMap[item.productSlug]?.variants.find((v) => v.id === item.variantId);

    if (!variant) {
      log.warn({ slug: item.productSlug, variantId: item.variantId }, 'Variant not found');
      return errResponse(422, CheckoutErrorCode.NotFound, { product: item.productTitle });
    }
    if (!variant.available) {
      log.warn({ slug: item.productSlug, variantId: item.variantId }, 'Variant out of stock');
      return errResponse(422, CheckoutErrorCode.OutOfStock, { product: item.productTitle });
    }

    pendingItems.push({
      variantId: item.variantId,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      price: Math.round(variant.price),
    });
  }
  return pendingItems;
}
