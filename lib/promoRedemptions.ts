import logger from '@/lib/logger';
import { supabasePublic } from '@/lib/supabase';

const log = logger.child({ module: 'promoRedemptions' });

export type PromoPaymentMethod = 'cod' | 'payos';

/**
 * How many times `email` has already redeemed `code`. Goes through the `count_promo_redemptions`
 * RPC (see supabase/promo_redemptions.sql) rather than a raw `select` — the table has no select
 * policy for `anon` at all, on purpose.
 */
export async function countRedemptions(code: string, email: string): Promise<number> {
  const { data, error } = await supabasePublic().rpc('count_promo_redemptions', {
    p_code: code,
    p_email: email.trim().toLowerCase(),
  });
  if (error) {
    log.error({ error, code }, 'Failed to count promo redemptions');
    throw new Error(`count_promo_redemptions failed: ${error.message}`);
  }
  return (data as number | null) ?? 0;
}

/**
 * Records a redemption once money has actually moved — order creation for COD (which has no
 * separate "paid" step), payment-confirmed webhook for PayOS (never at payment-link creation,
 * since the customer can still abandon before paying).
 */
export async function recordRedemption(params: {
  code: string;
  email: string;
  haravanOrderId: number;
  discountAmount: number;
  paymentMethod: PromoPaymentMethod;
}): Promise<void> {
  const { error } = await supabasePublic().from('promo_redemptions').insert({
    code: params.code,
    customer_email: params.email.trim().toLowerCase(),
    haravan_order_id: params.haravanOrderId,
    discount_amount: params.discountAmount,
    payment_method: params.paymentMethod,
  });
  if (error) {
    log.error({ error, code: params.code }, 'Failed to record promo redemption');
    throw new Error(`promo_redemptions insert failed: ${error.message}`);
  }
}
