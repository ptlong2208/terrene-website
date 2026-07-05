import Image from 'next/image';
import Link from 'next/link';
import { strapiMediaUrl } from '@/lib/strapi';
import type { ShopProduct } from '@/lib/types';

interface ProductCardProps {
  product: ShopProduct;
  href: string;
  tabIndex?: number;
  ariaHidden?: boolean;
  viewProductLabel: string;
}

export default function ProductCard({
  product,
  href,
  tabIndex,
  ariaHidden,
  viewProductLabel,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
      className="group relative w-[clamp(320px,34vw,500px)] max-md:w-[75vw] aspect-4/5 shrink-0 overflow-hidden block mr-4 bg-[#E8E3D5] no-underline"
    >
      {product.image && (
        <Image
          src={strapiMediaUrl(product.image.url)}
          alt={product.image.alternativeText ?? product.title}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 75vw, clamp(320px, 34vw, 500px)"
        />
      )}

      {product.tags.length > 0 && (
        <span className="absolute top-3 left-3 z-40 bg-white text-(--green-deep) border border-(--green-deep)/12 text-sm font-semibold tracking-[-0.01em] px-3.5 py-2.5 shadow-[0_4px_14px_rgba(29,64,37,0.10)] opacity-0 -translate-y-1.5 pointer-events-none transition duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          {product.tags.map((t) => t.label).join(' · ')}
        </span>
      )}

      <div className="absolute left-3 right-3 bottom-3 z-30 bg-[#F2EFE8] p-4 flex flex-col opacity-0 pointer-events-none transition-opacity duration-350 group-hover:opacity-100 group-hover:pointer-events-auto">
        <div className="text-base font-extrabold uppercase text-(--green-deep) mb-4 tracking-[-0.01em]">
          {product.title}
        </div>
        {product.description && (
          <p className="text-sm leading-normal text-(--green-deep)/78 mb-4.5">
            {product.description}
          </p>
        )}
        <div className="mt-auto">
          <span className="block border border-(--green-deep) text-(--green-deep) text-xs font-bold tracking-[0.08em] uppercase p-3 text-center transition-colors group-hover:hover:bg-(--green-deep) group-hover:hover:text-cream">
            {viewProductLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
