import type { BenefitItem } from '@/lib/types';

interface BenefitCardProps {
  item: BenefitItem;
  index: number;
}

export default function BenefitCard({ item, index }: BenefitCardProps) {
  return (
    <article className="border-t border-line pt-6.5">
      <div className="mb-5.5">
        <span className="text-xs text-ink-faint tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="text-[clamp(16px,1.4vw,20px)] font-[450] tracking-[-0.02em] mb-3 text-(--green-deep)">
        {item.title}
      </h3>
      {item.description && (
        <p className="text-[13px] leading-[1.7] text-ink-soft">
          {item.description}
        </p>
      )}
    </article>
  );
}
