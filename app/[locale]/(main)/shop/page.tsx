import ShopCatalog from '@/app/components/ShopCatalog';
import { fetchProductPricesBySlugs } from '@/lib/haravan';
import { getShopCategories, getShopProducts } from '@/sanity/lib/queries';

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [products, categories] = await Promise.all([
    getShopProducts(locale),
    getShopCategories(locale),
  ]);

  const prices = await fetchProductPricesBySlugs(products.map((p) => p.slug));

  return (
    <ShopCatalog products={products} categories={categories} prices={prices} locale={locale} />
  );
}
