import Card from '@/app/components/ui/Card';
import type { ProductInfoItem } from '@/lib/types';

interface Props {
  title: string;
  items: ProductInfoItem[];
}

export default function ProductInfoCard({ title, items }: Props) {
  return (
    <Card>
      <h2 className="text-[clamp(20px,2vw,26px)] font-semibold tracking-[-0.02em] text-(--green-deep)">
        {title}
      </h2>
      <div className="border-line mt-4.5 border-t">
        {items.map((item) => (
          <details
            key={item.id}
            className="border-line border-b [&[open]_summary]:after:content-['-']"
          >
            <summary className="after:text-ink-faint flex cursor-pointer list-none items-center justify-between gap-3 py-3.75 text-[13px] font-bold tracking-[0.04em] text-(--green-deep) uppercase select-none after:shrink-0 after:text-[18px] after:font-normal after:content-['+'] [&::-webkit-details-marker]:hidden">
              {item.title}
            </summary>
            {item.body && (
              <div className="text-ink-soft pb-4 text-[13px] leading-[1.65]">{item.body}</div>
            )}
          </details>
        ))}
      </div>
    </Card>
  );
}
