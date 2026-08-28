'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import ProductInfoCard from '@/app/components/ProductInfoCard';
import ReviewsSection from '@/app/components/ReviewsSection';
import StoryModal from '@/app/components/StoryModal';
import ScrollFade from '@/app/components/ui/ScrollFade';
import SlotText from '@/app/components/ui/SlotText';
import VariantPicker from '@/app/components/VariantPicker';
import type { ProductVariant } from '@/lib/haravan';
import type { MediaAsset, ShopProduct } from '@/lib/types';

interface ProductDetailContentProps {
  product: ShopProduct;
  galleryImages: MediaAsset[];
  variants: ProductVariant[];
  optionName: string | null;
  jsonLd: object;
  locale: string;
  slug: string;
}

export default function ProductDetailContent({
  product,
  galleryImages,
  variants,
  optionName,
  jsonLd,
  locale,
  slug,
}: ProductDetailContentProps) {
  const t = useTranslations('shop');
  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const info = infoRef.current;
    if (info) {
      const children = Array.from(info.children);
      gsap.set(children, { opacity: 0, y: 18 });
      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        delay: 0.1,
        onComplete: () => gsap.set(children, { clearProps: 'opacity,transform' }),
      });
    }

    const gallery = galleryRef.current;
    if (!gallery) return;
    const wrappers = Array.from(gallery.children) as HTMLElement[];
    gsap.set(wrappers, { opacity: 0, y: 30 });
    const tweens = wrappers.map((el) =>
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    );

    return () => {
      tweens.forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
      gsap.set([...(info ? Array.from(info.children) : []), ...wrappers], {
        clearProps: 'opacity,y,transform',
      });
    };
  }, []);

  return (
    <section className="pt-[calc(64px+clamp(24px,4vh,56px))] pb-[clamp(60px,9vh,120px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="px-gutter mx-auto max-w-360">
        <Link
          href={`/${locale}/shop`}
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
          <div ref={galleryRef} className="flex flex-col gap-3.5">
            {galleryImages.length > 0 ? (
              galleryImages.map((img, i) => (
                <div key={i} className="bg-card relative aspect-4/5 w-full overflow-hidden">
                  <Image
                    src={img.url}
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
            <aside
              ref={infoRef}
              className="flex max-h-[calc(100vh-64px-clamp(24px,4vh,56px))] w-full flex-col max-md:max-h-none"
            >
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

              <ScrollFade className="min-h-0 flex-1 scrollbar-thin overflow-y-auto pr-1">
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
          <div className="max-md:order-2">
            <ReviewsSection productSlug={slug} productTitle={product.title} />
          </div>
          {product.product_info?.length > 0 && (
            <div className="max-md:order-1">
              <ProductInfoCard title={t('productInfoTitle')} items={product.product_info} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
