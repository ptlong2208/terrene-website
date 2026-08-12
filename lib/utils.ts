export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

const AVATAR_COLORS = ['#112D17', '#0ea5e9', '#7c3aed', '#b45309', '#be123c', '#0f766e'];

/** Deterministic avatar color derived from a name/email — no account or upload needed. */
export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
