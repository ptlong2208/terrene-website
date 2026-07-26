import type { CheckoutCustomer } from '@/lib/checkout';
import logger from '@/lib/logger';
import type { PendingOrderItem } from '@/lib/orderStore';

const log = logger.child({ module: 'haravan' });
const TOKEN = process.env.HARAVAN_API_TOKEN!;
const BASE = 'https://apis.haravan.com/com';

export interface ProductVariant {
  id: number;
  title: string;
  price: number;
  compare_at_price: number | null;
  inventory_management: string | null;
  inventory_quantity: number;
  available: boolean;
  sku: string | null;
}

export interface HaravanProduct {
  variants: ProductVariant[];
  optionName: string | null;
}

export async function fetchProductPricesBySlugs(slugs: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const { variants } = await fetchProductData(slug);
      const prices = variants.map((v) => v.price).filter((p) => p > 0);
      return [slug, prices.length ? Math.min(...prices) : 0] as const;
    })
  );
  return Object.fromEntries(entries);
}

function localPhone(phone: string): string {
  return phone.startsWith('+84') ? '0' + phone.slice(3) : phone;
}

export async function createHaravanOrder(
  customer: CheckoutCustomer,
  items: PendingOrderItem[],
  orderCode: number
): Promise<number> {
  const phone = localPhone(customer.phone);
  const res = await fetch(`${BASE}/orders.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      order: {
        financial_status: 'pending',
        tags: 'payos',
        note: [customer.note ? `Note: ${customer.note}` : null, `PayOS order code: ${orderCode}`]
          .filter(Boolean)
          .join(' | '),
        customer: {
          first_name: customer.name,
          email: customer.email,
          phone: phone,
        },
        shipping_address: {
          first_name: customer.name,
          phone: phone,
          address1: customer.street,
          city: customer.ward,
          province: 'Hồ Chí Minh',
          country: 'Việt Nam',
          country_code: 'VN',
        },
        line_items: items.map((item) => ({
          variant_id: item.variantId,
          title: item.productTitle,
          variant_title: item.variantTitle || undefined,
          quantity: item.quantity,
          price: String(item.price),
        })),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ orderCode, status: res.status, body }, 'Haravan order creation failed');
    throw new Error(`Haravan order creation failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.order.id as number;
}

export async function updateHaravanOrderPaid(haravanOrderId: number): Promise<void> {
  const res = await fetch(`${BASE}/orders/${haravanOrderId}.json`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ order: { id: haravanOrderId, financial_status: 'paid' } }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ haravanOrderId, status: res.status, body }, 'Haravan order update to paid failed');
    throw new Error(`Haravan order update failed: ${res.status} ${body}`);
  }
}

export async function cancelHaravanOrder(haravanOrderId: number): Promise<void> {
  const res = await fetch(`${BASE}/orders/${haravanOrderId}/cancel.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ haravanOrderId, status: res.status, body }, 'Haravan order cancel failed');
    throw new Error(`Haravan order cancel failed: ${res.status} ${body}`);
  }
}

export async function fetchProductData(slug: string): Promise<HaravanProduct> {
  const res = await fetch(`${BASE}/products.json?handle=${slug}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    log.warn({ slug, status: res.status }, 'fetchProductData returned non-OK status');
    return { variants: [], optionName: null };
  }

  const data = await res.json();
  const product = data.products?.[0];
  const variants: ProductVariant[] = (product?.variants ?? []).map(
    (v: Omit<ProductVariant, 'available'>) => ({
      ...v,
      compare_at_price: v.compare_at_price || null,
      available: v.inventory_management === null || v.inventory_quantity > 0,
    })
  );

  const rawOptionName = product?.options?.[0]?.name ?? null;

  return {
    variants,
    optionName: rawOptionName === 'Title' ? null : rawOptionName,
  };
}
