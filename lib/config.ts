export const SITE_URL = process.env.SITE_URL ?? 'https://terrene.vn';
export const SITE_NAME = 'Terrene';
// Used when the GHTK fee API is unreachable
export const SHIPPING_FALLBACK_FEE = Number(process.env.SHIPPING_FALLBACK_FEE ?? 15_000);
export const SHIPPING_MAX_ORDER_WEIGHT = Number(process.env.SHIPPING_MAX_ORDER_WEIGHT ?? 3_000);
// Fallback per-item weight when Haravan variant has no grams set
export const DEFAULT_ITEM_WEIGHT_GRAMS = 200;

// Free standard shipping (and the minimum order value to unlock express) — VND
export const FREESHIP_THRESHOLD = 300_000;
// Express shipping: we subsidize up to this much of the real GHTK fee, customer pays the rest
export const EXPRESS_SUBSIDY_CAP = 20_000;
// Off until GHTK activates real XFast for this shop — currently "express" would just be the
// standard GHTK fee with a subsidy applied, not an actually faster delivery
export const EXPRESS_SHIPPING_ENABLED = false;
