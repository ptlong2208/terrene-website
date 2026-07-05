const TOKEN = process.env.HARAVAN_API_TOKEN!;
const BASE = 'https://apis.haravan.com/com';

export interface ProductVariant {
  id: number;
  title: string;
  price: number;
  compare_at_price: number | null;
  inventory_management: string | null;
  inventory_quantity: number;
  available: boolean;
  sku: string | null;
}

export interface HaravanProduct {
  variants: ProductVariant[];
  optionName: string | null;
}

export async function fetchProductData(slug: string): Promise<HaravanProduct> {
  const res = await fetch(`${BASE}/products.json?handle=${slug}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) return { variants: [], optionName: null };

  const data = await res.json();
  const product = data.products?.[0];

  const variants: ProductVariant[] = (product?.variants ?? []).map(
    (v: Omit<ProductVariant, 'available'>) => ({
      ...v,
      available: v.inventory_management === null || v.inventory_quantity > 0,
    })
  );

  return {
    variants,
    optionName: product?.options?.[0]?.name ?? null,
  };
}
