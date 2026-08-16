import * as Sentry from '@sentry/nextjs';

import logger from '@/lib/logger';

const log = logger.child({ module: 'addressData' });

// v2 = post-2025-merger (2-tier: province + ward, no district)
const PROVINCES_API_BASE = 'https://provinces.open-api.vn/api/v2';

export interface Province {
  code: string;
  name: string;
}

export interface Ward {
  code: string;
  name: string;
}

export async function fetchProvinces(): Promise<Province[]> {
  try {
    const res = await fetch(`${PROVINCES_API_BASE}/p/`, { next: { revalidate: 86400 } });
    if (!res.ok) {
      log.error({ status: res.status }, 'Provinces API fetch failed');
      Sentry.captureException(new Error(`Provinces API fetch failed: ${res.status}`));
      return [];
    }
    const data = (await res.json()) as Array<{ code: number; name: string }>;
    return data.map((p) => ({ code: String(p.code), name: p.name }));
  } catch (err) {
    log.error({ err }, 'Provinces API fetch errored');
    Sentry.captureException(err);
    return [];
  }
}

export async function fetchWards(provinceCode: string): Promise<Ward[]> {
  try {
    const res = await fetch(`${PROVINCES_API_BASE}/p/${provinceCode}?depth=2`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      log.error({ status: res.status, provinceCode }, 'Wards API fetch failed');
      Sentry.captureException(new Error(`Wards API fetch failed: ${res.status}`), {
        tags: { provinceCode },
      });
      return [];
    }
    const data = (await res.json()) as { wards?: Array<{ code: number; name: string }> };
    return (data.wards ?? []).map((w) => ({ code: String(w.code), name: w.name }));
  } catch (err) {
    log.error({ err, provinceCode }, 'Wards API fetch errored');
    Sentry.captureException(err, { tags: { provinceCode } });
    return [];
  }
}
