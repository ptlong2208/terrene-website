import { EXPRESS_SHIPPING_ENABLED, FREESHIP_THRESHOLD } from '@/lib/config';
import oldSaigonWards from '@/lib/data/oldSaigonWards.json';

const OLD_SAIGON_WARD_CODES = new Set(oldSaigonWards.map((w) => w.code));

/**
 * Whether a ward code falls within the old (pre-2025-merger) Ho Chi Minh City boundaries.
 * Safe to import from client components — no server-only dependencies.
 */
export function isOldSaigonWard(wardCode: string): boolean {
  return OLD_SAIGON_WARD_CODES.has(wardCode);
}

/** Express is only offered within old-Saigon boundaries, and only above the freeship threshold. */
export function isExpressEligible(wardCode: string, subtotal: number): boolean {
  return EXPRESS_SHIPPING_ENABLED && isOldSaigonWard(wardCode) && subtotal >= FREESHIP_THRESHOLD;
}
