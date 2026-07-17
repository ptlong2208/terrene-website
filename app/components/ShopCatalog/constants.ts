export const CategoryFilter = {
  All: 'all',
} as const;

export const SortMode = {
  Default: 'default',
  PriceAsc: 'price-asc',
  PriceDesc: 'price-desc',
} as const;

export type SortMode = (typeof SortMode)[keyof typeof SortMode];
