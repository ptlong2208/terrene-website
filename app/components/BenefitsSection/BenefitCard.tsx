import type { BenefitItem } from '@/lib/types';

interface BenefitCardProps {
  item: BenefitItem;
  index: number;
}

export default function BenefitCard({ item, index }: BenefitCardProps) {
  return (
    <article className="border-line border-t pt-6.5">
      <div className="mb-5.5">
        <span className="text-ink-faint text-xs tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="mb-3 text-[clamp(16px,1.4vw,20px)] font-[450] tracking-[-0.02em] text-(--green-deep)">
        {item.title}
      </h3>
      {item.description && (
        <p className="text-ink-soft text-[13px] leading-[1.7]">{item.description}</p>
      )}
    </article>
  );
}
