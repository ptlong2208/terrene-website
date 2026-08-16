import * as Sentry from '@sentry/nextjs';

import { SHIPPING_FALLBACK_FEE } from '@/lib/config';
import logger from '@/lib/logger';

const log = logger.child({ module: 'ghtk' });

const GHTK_BASE = 'https://services.giaohangtietkiem.vn';

// The shop's pickup address — plain province/ward text is enough, no pick_address_id needed
const PICK_PROVINCE = 'TP Hồ Chí Minh';
const PICK_WARD = 'Phường Gia Định';

function ghtkHeaders() {
  return {
    Token: process.env.GHTK_API_TOKEN ?? '',
    'X-Client-Source': process.env.GHTK_SHOP_ID ?? '',
  };
}

export async function getShippingFee(
  province: string,
  ward: string,
  weightGrams = 200,
  orderValue = 0
): Promise<number> {
  const token = process.env.GHTK_API_TOKEN;
  const shopId = process.env.GHTK_SHOP_ID;

  if (!token || !shopId) {
    log.warn('GHTK credentials not configured, using fallback fee');
    return SHIPPING_FALLBACK_FEE;
  }

  try {
    const params = new URLSearchParams({
      pick_province: PICK_PROVINCE,
      pick_ward: PICK_WARD,
      province,
      ward,
      weight: String(Math.max(Math.round(weightGrams), 1)),
      value: String(Math.max(Math.round(orderValue), 0)),
      transport: 'road',
    });

    const res = await fetch(`${GHTK_BASE}/services/shipment/fee?${params.toString()}`, {
      headers: ghtkHeaders(),
    });

    if (!res.ok) {
      log.error({ status: res.status, province, ward }, 'GHTK fee API returned non-OK');
      Sentry.captureMessage(`GHTK fee API returned non-OK: ${res.status}`, {
        level: 'warning',
        tags: { province, ward },
      });
      return SHIPPING_FALLBACK_FEE;
    }

    const data = (await res.json()) as { success?: boolean; fee?: { fee?: number } };
    if (!data.success || typeof data.fee?.fee !== 'number') {
      log.error({ data }, 'Unexpected GHTK fee response shape');
      Sentry.captureMessage('Unexpected GHTK fee response shape', {
        level: 'warning',
        tags: { province, ward },
      });
      return SHIPPING_FALLBACK_FEE;
    }
    return data.fee.fee;
  } catch (err) {
    log.error({ err, province, ward }, 'GHTK fee API call failed');
    Sentry.captureException(err, { level: 'warning', tags: { province, ward } });
    return SHIPPING_FALLBACK_FEE;
  }
}
