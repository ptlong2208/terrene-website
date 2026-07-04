import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { fetchStrapiBySlug, strapiMediaUrl } from '@/lib/strapi';
import type { ShopProduct } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });

  const product = await fetchStrapiBySlug<ShopProduct>('/api/shop-products', slug, {
    'populate[gallery]': 'true',
    'populate[image]': 'true',
    'populate[category]': 'true',
    'populate[taste_notes]': 'true',
    'populate[product_info]': 'true',
    'populate[learn_more_link]': 'true',
    locale,
  });

  if (!product) notFound();

  const galleryImages = product.gallery?.length
    ? product.gallery
    : product.image
      ? [product.image]
      : [];

  return (
    <section className="pt-[calc(64px+clamp(24px,4vh,56px))] pb-[clamp(60px,9vh,120px)]">
      <div className="max-w-[1440px] mx-auto px-gutter">

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-[clamp(28px,5vw,88px)] items-start max-md:grid-cols-1 max-md:gap-8">

          {/* Gallery */}
          <div className="flex flex-col gap-3.5">
            {galleryImages.length > 0 ? (
              galleryImages.map((img, i) => (
                <div
                  key={img.id ?? i}
                  className="relative w-full aspect-[4/5] overflow-hidden bg-card"
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
              <div className="relative w-full aspect-[4/5] bg-card" />
            )}
          </div>

          {/* Info panel */}
          <aside className="sticky top-[84px] flex flex-col max-h-[calc(100vh-100px)] max-md:static max-md:max-h-none">
            <div className="min-h-0 overflow-y-auto pr-1 scrollbar-thin">

              {/* Back */}
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center gap-2 text-[12px] tracking-[0.04em] uppercase text-ink-faint mb-5 hover:text-(--green-deep) transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('backToAll')}
              </Link>

              {/* Category */}
              {product.category && (
                <span className="block text-[12px] tracking-[0.08em] uppercase text-ink-faint mb-1.5">
                  {product.category.name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-[clamp(24px,2.8vw,34px)] font-extrabold tracking-[-0.02em] leading-[1.05] text-(--green-deep) mb-3">
                {product.title}
              </h1>

              {/* Price */}
              {product.price > 0 && (
                <p className="flex items-baseline gap-2.5 mb-4">
                  <span className="text-[20px] font-extrabold text-(--green-deep)">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-[14px] text-ink-faint line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </p>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-[13px] leading-[1.65] text-ink-faint max-w-[48ch] mb-4">
                  {product.description}
                </p>
              )}

              {/* Learn more link */}
              {product.learn_more_link && (
                <div className="mb-5">
                  <Link
                    href={product.learn_more_link.href}
                    className="inline-flex pb-0.5 border-b border-current text-[11px] font-bold tracking-[0.08em] uppercase text-(--green-deep) hover:opacity-70 transition-opacity"
                  >
                    {product.learn_more_link.label}
                  </Link>
                </div>
              )}

              {/* Taste notes */}
              {product.taste_notes?.length > 0 && (
                <div className="py-4 border-t border-b border-(--line) mb-2">
                  <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-(--green-deep) mb-3.5">
                    {t('tasteNotesTitle')}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {product.taste_notes.map((note) => (
                      <div
                        key={note.id}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_40px] items-center gap-3.5"
                      >
                        <span className="text-[13px] font-semibold text-(--green-deep) leading-[1.25]">
                          {note.label}
                        </span>
                        <div className="h-[6px] rounded-full bg-[#BFCDA6] overflow-hidden">
                          <div
                            className="h-full bg-(--green-deep) rounded-full transition-[width]"
                            style={{ width: `${(note.value / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-(--green-deep) tabular-nums text-right">
                          {note.value}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add to cart — stays at bottom of panel */}
            <button
              type="button"
              className="w-full mt-4 py-[15px] bg-(--green-deep) text-cream text-[13px] font-bold tracking-[0.12em] uppercase hover:opacity-85 transition-opacity shrink-0"
            >
              {t('addToCart')}
            </button>
          </aside>
        </div>

        {/* ── Product info accordion ─────────────────────────────────────── */}
        {product.product_info?.length > 0 && (
          <div className="mt-[clamp(48px,6vh,88px)] max-w-[560px]">
            <h2 className="text-[clamp(18px,1.8vw,24px)] font-extrabold tracking-[-0.01em] text-(--green-deep) mb-4">
              {t('productInfoTitle')}
            </h2>
            <div className="border-t border-(--line)">
              {product.product_info.map((item) => (
                <details key={item.id} className="border-b border-(--line) group">
                  <summary className="list-none cursor-pointer py-[14px] flex items-center justify-between gap-4 text-[12px] font-bold tracking-[0.06em] uppercase text-(--green-deep) [&::-webkit-details-marker]:hidden select-none">
                    {item.title}
                    <span className="text-[20px] font-light text-ink-faint shrink-0 group-open:hidden" aria-hidden="true">+</span>
                    <span className="text-[20px] font-light text-ink-faint shrink-0 hidden group-open:block" aria-hidden="true">−</span>
                  </summary>
                  {item.body && (
                    <p className="pb-4 text-[13px] leading-[1.65] text-ink-faint">
                      {item.body}
                    </p>
                  )}
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
