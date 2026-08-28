export interface PromoDiscount {
  discountType: 'percentage' | 'fixed_amount';
  value: number;
  maxAmount: number | null;
  /**
   * Haravan's own "Sản phẩm áp dụng" mode — which of the two entitlement lists below actually
   * means anything. `"product_prerequisite"` → `entitledProductIds` ("Sản phẩm"),
   * `"variant_prerequisite"` → `entitledVariantIds` ("Biến thể"), anything else (`"all"`) →
   * unscoped, every item counts.
   */
  productsSelection: string;
  /** Which variants the code is scoped to (Haravan's `entitled_variant_ids`). */
  entitledVariantIds: number[];
  /** Which products the code is scoped to (Haravan's `entitled_product_ids`). */
  entitledProductIds: number[];
  /**
   * Haravan's "Chỉ áp dụng giảm giá một lần trên toàn bộ đơn hàng" toggle. Only meaningful for
   * `fixed_amount` (a percentage is already proportional, so this doesn't change its math):
   * `true` subtracts `value` once total; `false` subtracts `value` once per qualifying unit.
   */
  appliesOnce: boolean;
}

export interface PromoLineItem {
  variantId: number;
  productId: number;
  price: number;
  quantity: number;
}

export function isScoped(
  promo: Pick<PromoDiscount, 'productsSelection' | 'entitledVariantIds' | 'entitledProductIds'>,
  item: Pick<PromoLineItem, 'variantId' | 'productId'>
): boolean {
  if (promo.productsSelection === 'product_prerequisite') {
    return promo.entitledProductIds.includes(item.productId);
  }
  if (promo.productsSelection === 'variant_prerequisite') {
    return promo.entitledVariantIds.includes(item.variantId);
  }
  return true;
}

/**
 * A percentage discount is a percentage of the *scoped* subtotal, not the whole cart — a code
 * restricted to one product must not also discount unrelated items sitting in the same order.
 */
export function computeDiscountAmount(promo: PromoDiscount, items: PromoLineItem[]): number {
  const scopedItems = items.filter((i) => isScoped(promo, i));
  const scopedSubtotal = scopedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let raw: number;
  if (promo.discountType === 'fixed_amount') {
    const scopedQuantity = scopedItems.reduce((sum, i) => sum + i.quantity, 0);
    raw = promo.appliesOnce ? promo.value : promo.value * scopedQuantity;
  } else {
    raw = Math.round(scopedSubtotal * (promo.value / 100));
  }
  return promo.maxAmount !== null ? Math.min(raw, promo.maxAmount) : raw;
}
