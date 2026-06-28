import Link from 'next/link';
import type { PartnerItem as PartnerItemType } from '@/lib/types';

interface PartnerItemProps {
  item: PartnerItemType;
  visitLabel: string;
}

export default function PartnerItem({ item, visitLabel }: PartnerItemProps) {
  return (
    <li className="group/partner grid grid-cols-[minmax(180px,1.2fr)_2.5fr_minmax(80px,auto)] gap-[clamp(20px,4vw,60px)] py-[clamp(18px,2.4vh,30px)] px-3.5 -mx-3.5 border-t last:border-b border-cream/22 items-center cursor-default transition-[opacity,background-color,color] duration-220 hover:bg-cream hover:text-(--green-deep) max-md:grid-cols-[1fr_auto]">
      <p className="text-[clamp(16px,1.4vw,21px)] font-[450] tracking-[-0.01em]">
        {item.name}
      </p>
      {item.description && (
        <p className="text-[clamp(12px,0.95vw,14px)] leading-[1.6] text-cream/68 group-hover/partner:text-(--brown) transition-colors duration-220 max-md:hidden">
          {item.description}
        </p>
      )}
      {item.url && (
        <Link
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold tracking-[0.08em] uppercase text-right whitespace-nowrap text-cream group-hover/partner:text-(--green-deep) hover:opacity-55 transition-opacity duration-250"
        >
          {visitLabel}
        </Link>
      )}
    </li>
  );
}
