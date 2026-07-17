import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import ProductInfoCard from '@/app/components/ProductInfoCard';
import StoryModal from '@/app/components/StoryModal';
import ScrollFade from '@/app/components/ui/ScrollFade';
import SlotText from '@/app/components/ui/SlotText';
import VariantPicker from '@/app/components/VariantPicker';
import { fetchProductData } from '@/lib/haravan';
import { fetchStrapiBySlug, strapiMediaUrl } from '@/lib/strapi';
import type { ShopProduct } from '@/lib/types';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });

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

  return (
    <section className="pt-[calc(64px+clamp(24px,4vh,56px))] pb-[clamp(60px,9vh,120px)]">
      <div className="px-gutter mx-auto max-w-360">
        <Link
          href="/shop"
          className="text-ink-soft group mb-6 inline-flex items-center gap-1.5 text-[13px] no-underline"
        >
          <ChevronLeft
            size={14}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <SlotText text={t('backToAll')} />
        </Link>

        <div className="grid grid-cols-[1.1fr_0.9fr] items-start gap-[clamp(28px,5vw,88px)] max-md:grid-cols-1 max-md:gap-8">
          <div className="flex flex-col gap-3.5">
            {galleryImages.length > 0 ? (
              galleryImages.map((img, i) => (
                <div
                  key={img.id ?? i}
                  className="bg-card relative aspect-4/5 w-full overflow-hidden"
                >
                  <Image
                    src={strapiMediaUrl(img.url)}
                    alt={img.alternativeText ?? product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 860px) 100vw, 55vw"
                    priority={i === 0}
                  />
                </div>
              ))
            ) : (
              <div className="bg-card relative aspect-4/5 w-full" />
            )}
          </div>

          <div className="sticky top-[calc(64px+clamp(24px,4vh,56px))] flex h-[calc(100vh-64px-clamp(24px,4vh,56px))] items-center max-md:static max-md:h-auto max-md:items-start">
            <aside className="flex max-h-[calc(100vh-64px-clamp(24px,4vh,56px))] w-full flex-col max-md:max-h-none">
              {(product.category || product.tags?.length > 0) && (
                <p className="text-ink-soft mb-2 flex flex-wrap items-center gap-x-2 text-[12px] tracking-[0.08em] uppercase">
                  {product.category && <span>{product.category.name}</span>}
                  {product.category && product.tags?.length > 0 && (
                    <span className="opacity-40">—</span>
                  )}
                  {product.tags?.map((tag, i) => (
                    <span key={tag.id} className="flex items-center gap-x-2">
                      {tag.label}
                      {i < product.tags.length - 1 && <span className="opacity-40">/</span>}
                    </span>
                  ))}
                </p>
              )}

              <h1 className="mb-3 text-[clamp(24px,2.8vw,34px)] leading-[1.05] font-semibold tracking-[-0.02em] text-(--green-deep)">
                {product.title}
              </h1>

              <ScrollFade className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-1">
                {product.description && (
                  <p className="text-ink-soft mb-4 max-w-[48ch] text-[13px] leading-[1.65]">
                    {product.description}
                  </p>
                )}

                {product.story && (
                  <div className="mb-5">
                    <StoryModal story={product.story} />
                  </div>
                )}

                {product.taste_notes?.length > 0 && (
                  <div className="border-line mb-4 flex flex-col gap-2.25 border-t border-b py-3.5">
                    <p className="mb-1 text-[12px] font-bold tracking-[0.06em] text-(--green-deep) uppercase">
                      {t('tasteNotesTitle')}
                    </p>
                    {product.taste_notes.map((note) => (
                      <div
                        key={note.id}
                        className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_44px] items-center gap-3.5"
                      >
                        <span className="text-[14px] leading-tight font-semibold text-(--green-deep)">
                          {note.label}
                        </span>
                        <div className="h-1.75 overflow-hidden rounded-full bg-[#BFCDA6]">
                          <div
                            className="h-full rounded-full bg-(--green-deep)"
                            style={{ width: `${(note.value / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-[14px] font-semibold text-(--green-deep) tabular-nums">
                          {note.value.toFixed(1)}/5
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollFade>

              <VariantPicker
                variants={variants}
                optionName={optionName}
                productSlug={slug}
                productTitle={product.title}
              />
            </aside>
          </div>
        </div>

        <div className="mt-[clamp(48px,6vh,88px)] grid grid-cols-[1.35fr_0.65fr] items-start gap-[clamp(20px,2.6vw,44px)] max-md:grid-cols-1">
          <div />

          {product.product_info?.length > 0 && (
            <ProductInfoCard title={t('productInfoTitle')} items={product.product_info} />
          )}
        </div>
      </div>
    </section>
  );
}
