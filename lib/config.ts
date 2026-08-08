export const SITE_URL = process.env.SITE_URL ?? 'https://terrene.vn';
export const SITE_NAME = 'Terrene';
// Average GHN fee from Vạn Kiếp, Bình Thạnh to HCMC districts — used when GHN API is unreachable
export const GHN_FALLBACK_FEE = Number(process.env.GHN_FALLBACK_FEE ?? 15_000);
export const GHN_MAX_ORDER_WEIGHT = Number(process.env.GHN_MAX_ORDER_WEIGHT ?? 3_000);
// Fallback per-item weight when Haravan variant has no grams set
export const DEFAULT_ITEM_WEIGHT_GRAMS = 200;
