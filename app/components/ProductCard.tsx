import Image from "next/image";
import type { ShopProduct } from "@/lib/types";
import { strapiMediaUrl } from "@/lib/strapi";

interface Props {
  product: ShopProduct;
}

export function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function isNew(createdAt: string, days = 30) {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24) <= days;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="flex flex-col shrink-0 h-full border-r border-dark/15" style={{ width: "clamp(260px, calc((100vw - 4rem) / 1.2), calc((100vw - 4rem) / 3.2))" }}>
      {/* Image */}
      <div className="flex-1 min-h-0 relative bg-placeholder">
        {product.image ? (
          <Image
            src={strapiMediaUrl(product.image.url)}
            alt={product.image.alternativeText ?? product.title}
            fill
            className="object-cover"
          />
        ) : null}
        {isNew(product.createdAt) && (
          <span className="absolute top-5 right-5 bg-badge text-dark text-[10px] font-extrabold uppercase tracking-[0.1em] px-3 py-1.5">
            NEW
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className="bg-cream border-t border-dark/15 flex flex-col justify-between"
        style={{ padding: "1.5rem", minHeight: "230px" }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-extrabold uppercase text-matcha tracking-[0.1em]">
            {product.category?.name}
          </span>
          <h3 className="text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-dark m-0">
            {product.title}
          </h3>
          {product.description && (
            <p
              className="text-[13px] text-dark opacity-60 leading-[1.45] mb-2"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </p>
          )}
          {/* Tags + attribute */}
          <div className="flex flex-wrap gap-1.5 items-center text-[10px] font-bold uppercase tracking-[0.05em] text-dark">
            {product.tags?.map((tag) => (
              <span key={tag.id} className="border border-dark/15 px-2.5 py-1 rounded-sm">
                {tag.label}
              </span>
            ))}
            {product.attribute && <span>{product.attribute}</span>}
          </div>
        </div>

        {/* Bottom: price + actions */}
        <div className="flex justify-between items-end mt-4">
          <div className="flex flex-col items-start">
            {product.original_price && (
              <span className="text-[12px] font-semibold text-dark opacity-40 line-through leading-none mb-1.5">
                {formatPrice(product.original_price)}
              </span>
            )}
            <span className="text-[18px] font-extrabold text-matcha leading-none">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex gap-2 items-center">
            <button
              className="w-9.5 h-9.5 border border-dark/15 bg-transparent rounded-full flex items-center justify-center text-dark cursor-pointer transition-colors duration-300 hover:border-matcha hover:text-matcha"
              aria-label="Add to cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.9211 7.29287C9.31164 7.15483 9.74013 7.35953 9.87817 7.75007C10.1874 8.62497 11.0218 9.25 12.0003 9.25C12.9788 9.25 13.8133 8.62497 14.1225 7.75007C14.2605 7.35953 14.689 7.15483 15.0796 7.29287C15.4701 7.43091 15.6748 7.8594 15.5368 8.24993C15.0223 9.70541 13.6343 10.75 12.0003 10.75C10.3664 10.75 8.97835 9.70541 8.46391 8.24993C8.32587 7.8594 8.53057 7.43091 8.9211 7.29287ZM12.3607 5.5H11.6395C10.0137 5.5 8.93165 5.50267 8.11211 5.60393C7.33378 5.70009 6.97502 5.86728 6.72326 6.07623C6.47149 6.28517 6.24105 6.60698 6.00309 7.35425C5.75254 8.14109 5.5505 9.20417 5.25088 10.8021C4.8309 13.042 4.54933 14.5634 4.49931 15.7093C4.4511 16.8139 4.63619 17.2835 4.89607 17.5966C5.15595 17.9097 5.58337 18.1782 6.67789 18.3344C7.81341 18.4964 9.36063 18.5 11.6395 18.5H12.3607C14.6397 18.5 16.1869 18.4964 17.3224 18.3344C18.4169 18.1782 18.8443 17.9097 19.1042 17.5966C19.3641 17.2835 19.5492 16.8139 19.501 15.7093C19.451 14.5634 19.1694 13.042 18.7494 10.8021C18.4498 9.20417 18.2477 8.14109 17.9972 7.35425C17.7592 6.60698 17.5288 6.28517 17.277 6.07623C17.0253 5.86728 16.6665 5.70009 15.8882 5.60393C15.0686 5.50267 13.9865 5.5 12.3607 5.5ZM5.7653 4.92196C4.65441 5.84393 4.36179 7.40452 3.77657 10.5257C2.95365 14.9146 2.54219 17.1091 3.74181 18.5545C4.94143 20 7.17414 20 11.6395 20H12.3607C16.8261 20 19.0588 20 20.2585 18.5545C21.4581 17.1091 21.0466 14.9146 20.2237 10.5257C19.6385 7.40452 19.3459 5.84393 18.235 4.92196C17.1241 4 15.5363 4 12.3607 4H11.6395C8.46398 4 6.8762 4 5.7653 4.92196Z" fill="currentColor" />
              </svg>
            </button>
            <button className="h-9.5 px-5 bg-matcha text-cream border-none rounded-full font-bold text-[12px] uppercase tracking-[0.05em] cursor-pointer transition-opacity duration-300 hover:opacity-80 font-sans">
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
