import type { ProductInfoItem } from '@/lib/types';

interface Props {
  title: string;
  items: ProductInfoItem[];
}

export default function ProductInfoCard({ title, items }: Props) {
  return (
    <div className="bg-white border border-line p-[clamp(20px,2.4vw,32px)]">
      <h2 className="text-[clamp(20px,2vw,26px)] font-semibold tracking-[-0.02em] text-(--green-deep)">
        {title}
      </h2>
      <div className="border-t border-line mt-4.5">
        {items.map((item) => (
          <details
            key={item.id}
            className="border-b border-line [&[open]_summary]:after:content-['-']"
          >
            <summary className="list-none cursor-pointer py-3.75 flex items-center justify-between gap-3 text-[13px] font-bold tracking-[0.04em] uppercase text-(--green-deep) [&::-webkit-details-marker]:hidden select-none after:content-['+'] after:text-[18px] after:font-normal after:text-ink-faint after:shrink-0">
              {item.title}
            </summary>
            {item.body && (
              <div className="pb-4 text-[13px] leading-[1.65] text-ink-soft">
                {item.body}
              </div>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
