export const SITE_URL = process.env.SITE_URL ?? 'https://terrene.vn';
export const SITE_NAME = 'Terrene';
export const STORE_ADDRESS = process.env.NEXT_PUBLIC_STORE_ADDRESS ?? '';
// Average GHN fee from Vạn Kiếp, Bình Thạnh to HCMC districts — used when GHN API is unreachable
export const GHN_FALLBACK_FEE = Number(process.env.GHN_FALLBACK_FEE ?? 25_000);
