import { isEmailOnWishlist } from '@/lib/brevo';
import logger from '@/lib/logger';
import { isScoped, type PromoLineItem } from '@/lib/promoMath';
import { countRedemptions } from '@/lib/promoRedemptions';

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
  once_per_customer: boolean;
  rule_customs: Array<{ name: string; value: string }>;
}

function getPerCustomerLimit(discount: HaravanDiscount): number | null {
  const rule = discount.rule_customs.find((r) => r.name === 'customer_limit_used');
  const parsed = rule ? Number(rule.value) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return discount.once_per_customer ? 1 : null;
}

/** Every gate that depends only on the discount + who's asking, not on cart contents. */
async function checkEligibility(
  discount: HaravanDiscount,
  code: string,
  email: string
): Promise<PromoErrorCode | null> {
  const now = Date.now();
  if (
    discount.status !== 'enabled' ||
    (discount.starts_at && new Date(discount.starts_at).getTime() > now)
  ) {
    return 'invalid_code';
  }
  if (discount.ends_at && new Date(discount.ends_at).getTime() < now) {
    return 'expired';
  }
  if (discount.usage_limit !== null && discount.times_used >= discount.usage_limit) {
    return 'usage_limit_reached';
  }
  const perCustomerLimit = getPerCustomerLimit(discount);
  if (perCustomerLimit !== null && (await countRedemptions(code, email)) >= perCustomerLimit) {
    return 'already_redeemed';
  }
  return null;
}

// Haravan Admin's "Sản phẩm áp dụng" writes to *either* entitled_product_ids ("Sản phẩm") or
// entitled_variant_ids ("Biến thể") depending which radio was picked — products_selection says
// which one is actually in effect (see isScoped). "all" means the whole cart counts. Per
// Haravan's own Admin UI ("Áp dụng cho Nhóm sản phẩm đã chọn" vs "Áp dụng cho tất cả sản phẩm"),
// BOTH the minimum-value and minimum-quantity conditions are checked against this same scope —
// a product-scoped code's minimum applies to that product's share of the cart, not the whole order.
function checkCartConditions(
  discount: HaravanDiscount,
  items: PromoLineItem[]
): PromoErrorCode | null {
  const promoScope = {
    productsSelection: discount.products_selection,
    entitledVariantIds: discount.entitled_variant_ids,
    entitledProductIds: discount.entitled_product_ids,
  };
  const scopedItems = items.filter((i) => isScoped(promoScope, i));

  const scopedSubtotal = scopedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (discount.minimum_order_amount > 0 && scopedSubtotal < discount.minimum_order_amount) {
    return 'minimum_not_met';
  }

  const minQuantity = discount.applies_to_quantity > 0 ? discount.applies_to_quantity : 1;
  const targetQuantity = scopedItems.reduce((sum, i) => sum + i.quantity, 0);
  if (targetQuantity < minQuantity) {
    return 'quantity_not_met';
  }
  return null;
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
  | 'not_eligible'
  | 'already_redeemed';

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
  if (!discount) {
    return { valid: false, error: 'invalid_code' };
  }

  const eligibilityError = await checkEligibility(discount, code, email);
  if (eligibilityError) {
    return { valid: false, error: eligibilityError };
  }

  const cartError = checkCartConditions(discount, items);
  if (cartError) {
    return { valid: false, error: cartError };
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
