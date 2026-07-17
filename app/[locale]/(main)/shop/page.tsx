import { fetchStrapiCollection } from '@/lib/strapi';
import { fetchProductPricesBySlugs } from '@/lib/haravan';
import type { ShopProduct, ShopCategory } from '@/lib/types';
import ShopCatalog from '@/app/components/ShopCatalog';

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [products, categories] = await Promise.all([
    fetchStrapiCollection<ShopProduct>('/api/shop-products', {
      'populate[image]': 'true',
      'populate[tags]': 'true',
      'populate[category]': 'true',
      locale,
    }),
    fetchStrapiCollection<ShopCategory>('/api/shop-categories', { locale }),
  ]);

  const prices = await fetchProductPricesBySlugs(products.map(p => p.slug));

  return (
    <ShopCatalog
      products={products}
      categories={categories}
      prices={prices}
      locale={locale}
    />
  );
}
