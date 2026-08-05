import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/config';
import { getSitemapProducts } from '@/lib/sanity-queries';
const locales = ['vi'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getSitemapProducts().catch(() => []);

  const staticRoutes = locales.flatMap((locale) => [
    { url: `${SITE_URL}/${locale}`, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${SITE_URL}/${locale}/shop`, changeFrequency: 'daily' as const, priority: 0.9 },
  ]);

  const productRoutes = locales.flatMap((locale) =>
    products.map((p) => ({
      url: `${SITE_URL}/${locale}/shop/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  return [...staticRoutes, ...productRoutes];
}
