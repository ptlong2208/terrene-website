import { isEmailOnWishlist } from '@/lib/brevo';
import logger from '@/lib/logger';
import { isScoped, type PromoLineItem } from '@/lib/promoMath';

const log = logger.child({ module: 'promo' });
const BASE = 'https://apis.haravan.com/com';
const TOKEN = process.env.HARAVAN_API_TOKEN!;

/**
 * The only rule Haravan's DiscountCode genuinely can't express — there's no concept of
 * "restricted to this marketing list" on Haravan at all, so it has to live app-side. Everything
 * else (product scope, quantity, enabled/date range/usage limit) is read live off the discount
 * itself. A code not listed here just has no extra restriction — it isn't rejected.
 */
const WISHLIST_EMAIL_REQUIRED_CODES = new Set(['WISHLIST15']);

interface HaravanDiscount {
  status: 'enabled' | 'disabled';
  take_type: string;
  value: number;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  times_used: number;
  products_selection: string;
  entitled_variant_ids: number[];
  entitled_product_ids: number[];
  promotion_apply_type: number;
  applies_to_quantity: number;
  max_amount_apply: number | null;
  minimum_order_amount: number;
  applies_once: boolean;
}

async function fetchDiscountByCode(code: string): Promise<HaravanDiscount | null> {
  const res = await fetch(`${BASE}/discounts.json?code=${encodeURIComponent(code)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ status: res.status, body }, 'Failed to look up discount code');
    throw new Error(`Haravan discount lookup failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return (data.discounts ?? [])[0] ?? null;
}

export type PromoErrorCode =
  | 'invalid_code'
  | 'expired'
  | 'usage_limit_reached'
  | 'quantity_not_met'
  | 'minimum_not_met'
  | 'not_eligible';

export type PromoValidationResult =
  | {
      valid: true;
      discountType: 'percentage' | 'fixed_amount';
      value: number;
      maxAmount: number | null;
      productsSelection: string;
      entitledVariantIds: number[];
      entitledProductIds: number[];
      appliesOnce: boolean;
      /** Display-only, for explaining the code's conditions in the UI — `null` means no such condition. */
      minimumOrderAmount: number | null;
      minQuantity: number | null;
    }
  | { valid: false; error: PromoErrorCode };

export async function validatePromoCode(params: {
  code: string;
  email: string;
  items: PromoLineItem[];
}): Promise<PromoValidationResult> {
  const { email, items } = params;
  const code = params.code.trim().toUpperCase();

  const discount = await fetchDiscountByCode(code);
  const now = Date.now();
  if (
    !discount ||
    discount.status !== 'enabled' ||
    (discount.starts_at && new Date(discount.starts_at).getTime() > now)
  ) {
    return { valid: false, error: 'invalid_code' };
  }
  if (discount.ends_at && new Date(discount.ends_at).getTime() < now) {
    return { valid: false, error: 'expired' };
  }
  if (discount.usage_limit !== null && discount.times_used >= discount.usage_limit) {
    return { valid: false, error: 'usage_limit_reached' };
  }

  // Haravan Admin's "Sản phẩm áp dụng" writes to *either* entitled_product_ids ("Sản phẩm") or
  // entitled_variant_ids ("Biến thể") depending which radio was picked — products_selection says
  // which one is actually in effect (see isScoped). "all" means the whole cart counts. Per
  // Haravan's own Admin UI ("Áp dụng cho Nhóm sản phẩm đã chọn" vs "Áp dụng cho tất cả sản phẩm"),
  // BOTH the minimum-value and minimum-quantity conditions are checked against this same scope —
  // a product-scoped code's minimum applies to that product's share of the cart, not the whole order.
  const promoScope = {
    productsSelection: discount.products_selection,
    entitledVariantIds: discount.entitled_variant_ids,
    entitledProductIds: discount.entitled_product_ids,
  };
  const scopedItems = items.filter((i) => isScoped(promoScope, i));

  const scopedSubtotal = scopedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (discount.minimum_order_amount > 0 && scopedSubtotal < discount.minimum_order_amount) {
    return { valid: false, error: 'minimum_not_met' };
  }

  const minQuantity = discount.applies_to_quantity > 0 ? discount.applies_to_quantity : 1;
  const targetQuantity = scopedItems.reduce((sum, i) => sum + i.quantity, 0);
  if (targetQuantity < minQuantity) {
    return { valid: false, error: 'quantity_not_met' };
  }

  if (WISHLIST_EMAIL_REQUIRED_CODES.has(code) && !(await isEmailOnWishlist(email))) {
    return { valid: false, error: 'not_eligible' };
  }

  return {
    valid: true,
    discountType: discount.take_type === 'fixed_amount' ? 'fixed_amount' : 'percentage',
    value: discount.value,
    maxAmount: discount.max_amount_apply,
    productsSelection: discount.products_selection,
    entitledVariantIds: discount.entitled_variant_ids,
    entitledProductIds: discount.entitled_product_ids,
    appliesOnce: discount.applies_once,
    minimumOrderAmount: discount.minimum_order_amount > 0 ? discount.minimum_order_amount : null,
    minQuantity: discount.applies_to_quantity > 0 ? discount.applies_to_quantity : null,
  };
}
