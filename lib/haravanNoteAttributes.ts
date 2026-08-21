export interface HaravanNoteAttribute {
  name: string;
  value: string;
}

const PAYOS_ORDER_CODE_KEY = 'payos_order_code';

export function payosOrderCodeAttribute(orderCode: number): HaravanNoteAttribute {
  return { name: PAYOS_ORDER_CODE_KEY, value: String(orderCode) };
}

export function parsePayosOrderCode(
  attributes: HaravanNoteAttribute[] | null | undefined
): number | null {
  const found = attributes?.find((a) => a.name === PAYOS_ORDER_CODE_KEY);
  return found ? Number(found.value) : null;
}
