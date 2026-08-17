import { localPhone } from '@/lib/haravan';
import { supabasePublic } from '@/lib/supabase';

const normalizeOrderName = (orderName: string) => orderName.replace(/^#/, '');

/** Permanently registers order_name -> haravan_order_id so /track-order can find it later. */
export async function saveOrderLookup(
  orderName: string,
  haravanOrderId: number,
  phone: string
): Promise<void> {
  const { error } = await supabasePublic()
    .from('order_lookup')
    .insert({
      order_name: normalizeOrderName(orderName),
      haravan_order_id: haravanOrderId,
      phone: localPhone(phone),
    });
  if (error) throw new Error(`Failed to save order lookup: ${error.message}`);
}

/** Returns the Haravan order id only if both orderName AND phone match */
export async function verifyOrderLookup(orderName: string, phone: string): Promise<number | null> {
  const { data, error } = await supabasePublic().rpc('verify_order_lookup', {
    p_order_name: normalizeOrderName(orderName),
    p_phone: localPhone(phone),
  });
  if (error) throw new Error(`Failed to verify order lookup: ${error.message}`);
  return typeof data === 'number' ? data : null;
}
