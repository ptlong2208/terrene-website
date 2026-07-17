'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { strapiMediaUrl } from '@/lib/strapi';
import { formatPrice } from '@/lib/utils';
import type { ShopProduct } from '@/lib/types';

interface ProductCardProps {
  product: ShopProduct;
  href: string;
  minPrice?: number;
  tabIndex?: number;
  ariaHidden?: boolean;
  className?: string;
  sizes?: string;
}

export default function ProductCard({
  product,
  href,
  minPrice,
  tabIndex,
  ariaHidden,
  className,
  sizes: sizesProp,
}: ProductCardProps) {
  const tagOrigin = product.tags[0]?.label;
  const tagGrade = product.tags[1]?.label;
  const hasTags = tagOrigin || tagGrade;

  const mediaRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    const tags = tagsRef.current;
    if (!media || !tags || !hasTags) return;

    const el = media;

    if (window.matchMedia('(hover: none)').matches) {
      gsap.set(tags, { opacity: 1, yPercent: -50, y: 0 });
      return;
    }

    gsap.set(tags, { opacity: 0, yPercent: -50, y: 8 });

    const quickOpacity = gsap.quickTo(tags, 'opacity', { duration: 0.35, ease: 'power2.out' });
    const quickY = gsap.quickTo(tags, 'y', { duration: 0.5, ease: 'power3.out' });

    function onEnter() {
      quickOpacity(1);
      quickY(0);
    }
    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const frac = Math.min(0.82, Math.max(0.18, (e.clientY - rect.top) / rect.height));
      quickY((frac - 0.5) * rect.height);
    }
    function onLeave() {
      quickOpacity(0);
      quickY(8);
    }

    media.addEventListener('mouseenter', onEnter);
    media.addEventListener('mousemove', onMove);
    media.addEventListener('mouseleave', onLeave);

    return () => {
      media.removeEventListener('mouseenter', onEnter);
      media.removeEventListener('mousemove', onMove);
      media.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(tags);
    };
  }, [hasTags]);

  return (
    <article
      aria-hidden={ariaHidden}
      className={
        className ?? 'mr-4 flex w-[clamp(260px,28vw,420px)] shrink-0 flex-col max-md:w-[70vw]'
      }
    >
      <div ref={mediaRef} className="group relative aspect-square overflow-hidden bg-[#E8E3D5]">
        <Link
          href={href}
          tabIndex={tabIndex}
          className="absolute inset-0 z-10"
          aria-label={product.title}
        />
        {product.image && (
          <Image
            src={strapiMediaUrl(product.image.url)}
            alt={product.image.alternativeText ?? product.title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.03]"
            sizes={sizesProp ?? '(max-width: 768px) 70vw, clamp(260px, 28vw, 420px)'}
          />
        )}

        {hasTags && (
          <div
            ref={tagsRef}
            className="pointer-events-none absolute inset-x-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between"
            style={{ opacity: 0 }}
          >
            {tagOrigin && (
              <span className="text-[11px] font-semibold tracking-[0.03em] text-white uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
                {tagOrigin}
              </span>
            )}
            {tagGrade && (
              <span className="text-[11px] font-semibold tracking-[0.03em] text-white uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
                {tagGrade}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="border-line flex items-baseline justify-between gap-3 border-t pt-3.5">
        <span className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-(--green-deep)">
          {product.title}
        </span>
        {minPrice !== undefined && minPrice > 0 && (
          <span className="font-sans text-[16px] font-bold whitespace-nowrap text-(--green-deep) tabular-nums">
            {formatPrice(minPrice)}
          </span>
        )}
      </div>
    </article>
  );
}
