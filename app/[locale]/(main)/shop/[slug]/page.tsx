import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductDetailContent from '@/app/components/ProductDetailContent';
import { SITE_NAME, SITE_URL } from '@/lib/config';
import { fetchProductData } from '@/lib/haravan';
import { fetchStrapiBySlug, strapiMediaUrl } from '@/lib/strapi';
import type { ShopProduct } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await fetchStrapiBySlug<ShopProduct>('/api/shop-products', slug, {
    'populate[image]': 'true',
    locale,
  });
  if (!product) return {};
  const imageUrl = product.image ? strapiMediaUrl(product.image.url) : undefined;
  return {
    title: `${product.title} | ${SITE_NAME}`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.title,
      description: product.description ?? undefined,
      url: `${SITE_URL}/${locale}/shop/${slug}`,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const [product, { variants, optionName }] = await Promise.all([
    fetchStrapiBySlug<ShopProduct>('/api/shop-products', slug, {
      'populate[gallery]': 'true',
      'populate[image]': 'true',
      'populate[category]': 'true',
      'populate[tags]': 'true',
      'populate[taste_notes]': 'true',
      'populate[product_info]': 'true',
      'populate[story][populate][images]': 'true',
      locale,
    }),
    fetchProductData(slug),
  ]);

  if (!product) notFound();

  const galleryImages = product.gallery?.length
    ? product.gallery
    : product.image
      ? [product.image]
      : [];

  const prices = variants.map((v) => v.price).filter((p) => p > 0);
  const hasStock = variants.some((v) => v.available);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    brand: { '@type': 'Brand', name: SITE_NAME },
    image: galleryImages.map((img) => strapiMediaUrl(img.url)).filter(Boolean),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: prices.length ? Math.min(...prices) : undefined,
      highPrice: prices.length ? Math.max(...prices) : undefined,
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <ProductDetailContent
      product={product}
      galleryImages={galleryImages}
      variants={variants}
      optionName={optionName}
      jsonLd={jsonLd}
      locale={locale}
      slug={slug}
    />
  );
}
