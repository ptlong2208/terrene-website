import { GHN_FALLBACK_FEE } from '@/lib/config';
import logger from '@/lib/logger';

const log = logger.child({ module: 'ghn' });

export const GHN_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://online-gateway.ghn.vn/shiip/public-api'
    : 'https://dev-online-gateway.ghn.vn/shiip/public-api';

function ghnHeaders() {
  return {
    Token: process.env.GHN_API_TOKEN ?? '',
    ShopId: process.env.GHN_SHOP_ID ?? '',
    'Content-Type': 'application/json',
  };
}

export interface GhnDistrict {
  id: number;
  name: string;
}

export interface GhnWard {
  code: string;
  name: string;
}

export async function fetchGhnDistricts(): Promise<GhnDistrict[]> {
  const res = await fetch(`${GHN_BASE}/master-data/district`, {
    method: 'POST',
    headers: ghnHeaders(),
    body: JSON.stringify({ province_id: 202 }),
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    log.error({ status: res.status }, 'GHN districts fetch failed');
    return [];
  }
  const data = await res.json();
  return (data.data ?? []).map((d: { DistrictID: number; DistrictName: string }) => ({
    id: d.DistrictID,
    name: d.DistrictName,
  }));
}

export async function fetchGhnWards(districtId: number): Promise<GhnWard[]> {
  const res = await fetch(`${GHN_BASE}/master-data/ward`, {
    method: 'POST',
    headers: ghnHeaders(),
    body: JSON.stringify({ district_id: districtId }),
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    log.error({ status: res.status, districtId }, 'GHN wards fetch failed');
    return [];
  }
  const data = await res.json();
  return (data.data ?? []).map((w: { WardCode: string; WardName: string }) => ({
    code: w.WardCode,
    name: w.WardName,
  }));
}

export async function getShippingFee(
  districtId: number,
  wardCode: string,
  weightGrams = 200
): Promise<number> {
  const token = process.env.GHN_API_TOKEN;
  const shopId = process.env.GHN_SHOP_ID;

  if (!token || !shopId) {
    log.warn('GHN credentials not configured, using fallback fee');
    return GHN_FALLBACK_FEE;
  }

  try {
    const res = await fetch(`${GHN_BASE}/v2/shipping-order/fee`, {
      method: 'POST',
      headers: { Token: token, ShopId: shopId, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_district_id: districtId,
        to_ward_code: wardCode,
        service_type_id: 2,
        weight: Math.max(Math.round(weightGrams), 1),
      }),
    });

    if (!res.ok) {
      log.error({ status: res.status, districtId, wardCode }, 'GHN fee API returned non-OK');
      return GHN_FALLBACK_FEE;
    }

    const data = await res.json();
    const fee: unknown = data.data?.total;
    if (typeof fee !== 'number') {
      log.error({ data }, 'Unexpected GHN fee response shape');
      return GHN_FALLBACK_FEE;
    }
    return fee;
  } catch (err) {
    log.error({ err, districtId, wardCode }, 'GHN fee API call failed');
    return GHN_FALLBACK_FEE;
  }
}
