import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import SlotText from '@/app/components/ui/SlotText';
import { fetchStrapiBySlug, strapiMediaUrl } from '@/lib/strapi';
import { fetchProductData } from '@/lib/haravan';
import type { ShopProduct } from '@/lib/types';
import ProductInfoCard from '@/app/components/ProductInfoCard';
import StoryModal from '@/app/components/StoryModal';
import VariantPicker from '@/app/components/VariantPicker';
import ScrollFade from '@/app/components/ui/ScrollFade';

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
      <div className="max-w-360 mx-auto px-gutter">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 mb-6 text-[13px] text-ink-soft no-underline group"
        >
          <ArrowLeft size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <SlotText text={t('backToAll')} />
        </Link>

        <div className="grid grid-cols-[1.1fr_0.9fr] gap-[clamp(28px,5vw,88px)] items-start max-md:grid-cols-1 max-md:gap-8">
          <div className="flex flex-col gap-3.5">
            {galleryImages.length > 0 ? (
              galleryImages.map((img, i) => (
                <div
                  key={img.id ?? i}
                  className="relative w-full aspect-4/5 overflow-hidden bg-card"
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
              <div className="relative w-full aspect-4/5 bg-card" />
            )}
          </div>

          <div className="sticky top-[calc(64px+clamp(24px,4vh,56px))] h-[calc(100vh-64px-clamp(24px,4vh,56px))] flex items-center max-md:static max-md:h-auto max-md:items-start">
            <aside className="w-full flex flex-col max-h-[calc(100vh-64px-clamp(24px,4vh,56px))] max-md:max-h-none">
              {(product.category || product.tags?.length > 0) && (
                <p className="text-[12px] tracking-[0.08em] uppercase text-ink-soft mb-2 flex flex-wrap items-center gap-x-2">
                  {product.category && (
                    <span>{product.category.name}</span>
                  )}
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

              <h1 className="text-[clamp(24px,2.8vw,34px)] font-semibold tracking-[-0.02em] leading-[1.05] text-(--green-deep) mb-3">
                {product.title}
              </h1>

              <ScrollFade className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                {product.description && (
                  <p className="text-[13px] leading-[1.65] text-ink-soft max-w-[48ch] mb-4">
                    {product.description}
                  </p>
                )}

                {product.story && (
                  <div className="mb-5">
                    <StoryModal story={product.story} />
                  </div>
                )}

                {product.taste_notes?.length > 0 && (
                  <div className="py-3.5 border-t border-b border-line mb-4 flex flex-col gap-2.25">
                    <p className="text-[12px] font-bold tracking-[0.06em] uppercase text-(--green-deep) mb-1">
                      {t('tasteNotesTitle')}
                    </p>
                    {product.taste_notes.map((note) => (
                      <div
                        key={note.id}
                        className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_44px] items-center gap-3.5"
                      >
                        <span className="text-[14px] font-semibold text-(--green-deep) leading-tight">
                          {note.label}
                        </span>
                        <div className="h-1.75 rounded-full bg-[#BFCDA6] overflow-hidden">
                          <div
                            className="h-full bg-(--green-deep) rounded-full"
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

        <div className="mt-[clamp(48px,6vh,88px)] grid grid-cols-[1.35fr_0.65fr] gap-[clamp(20px,2.6vw,44px)] items-start max-md:grid-cols-1">
          <div />

          {product.product_info?.length > 0 && (
            <ProductInfoCard title={t('productInfoTitle')} items={product.product_info} />
          )}
        </div>

      </div>
    </section>
  );
}
