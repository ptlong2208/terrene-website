'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { PartnerItem as PartnerItemType } from '@/lib/types';

interface PartnerItemProps {
  item: PartnerItemType;
  visitLabel: string;
}

export default function PartnerItem({ item, visitLabel }: PartnerItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li
      onClick={() => setIsExpanded((v) => !v)}
      className="group/partner border-t last:border-b border-cream/22 transition-[opacity,background-color,color] duration-220 hover:bg-cream hover:text-(--green-deep) cursor-default"
    >
      <div className="grid grid-cols-[minmax(180px,1.2fr)_2.5fr_minmax(80px,auto)] gap-[clamp(20px,4vw,60px)] py-[clamp(18px,2.4vh,30px)] px-3.5 -mx-3.5 items-center max-md:grid-cols-[1fr_auto]">
        <p className="text-[clamp(16px,1.4vw,21px)] font-[450] tracking-[-0.01em]">
          {item.name}
        </p>

        {item.description && (
          <p className="text-[clamp(12px,0.95vw,14px)] leading-[1.6] text-cream/68 group-hover/partner:text-(--brown) transition-colors duration-220 max-md:hidden">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-3 justify-end">
          {item.url && (
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap text-cream group-hover/partner:text-(--green-deep) hover:opacity-55 transition-opacity duration-250"
              onClick={(e) => e.stopPropagation()}
            >
              {visitLabel}
            </Link>
          )}

          {item.description && (
            <ChevronDown
              size={14}
              className={`md:hidden shrink-0 text-cream/70 group-hover/partner:text-(--green-deep)/70 transition-transform duration-220 ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {item.description && (
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${isExpanded ? 'max-h-60' : 'max-h-0'}`}
        >
          <p className="px-3.5 -mx-3.5 pb-[clamp(18px,2.4vh,30px)] text-[13px] leading-[1.6] text-cream/68 group-hover/partner:text-(--brown) transition-colors duration-220">
            {item.description}
          </p>
        </div>
      )}
    </li>
  );
}
