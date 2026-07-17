'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import SlotText from '@/app/components/ui/SlotText';
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
      className="group/partner border-cream/22 hover:bg-cream cursor-default border-t transition-[opacity,background-color,color] duration-220 last:border-b hover:text-(--green-deep)"
    >
      <div className="-mx-3.5 grid grid-cols-[minmax(180px,1.2fr)_2.5fr_minmax(80px,auto)] items-center gap-[clamp(20px,4vw,60px)] px-3.5 py-[clamp(18px,2.4vh,30px)] max-md:grid-cols-[1fr_auto]">
        <p className="text-[clamp(16px,1.4vw,21px)] font-[450] tracking-[-0.01em]">{item.name}</p>

        {item.description && (
          <p className="text-cream/68 text-[clamp(12px,0.95vw,14px)] leading-[1.6] transition-colors duration-220 group-hover/partner:text-(--brown) max-md:hidden">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          {item.url && (
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-cream inline-flex items-center text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase transition-colors duration-220 group-hover/partner:text-(--green-deep)"
              onClick={(e) => e.stopPropagation()}
            >
              <SlotText text={visitLabel} />
              <SlotText text="↗" className="ml-1.5" />
            </Link>
          )}

          {item.description && (
            <ChevronDown
              size={14}
              className={`text-cream/70 shrink-0 transition-transform duration-220 group-hover/partner:text-(--green-deep)/70 md:hidden ${isExpanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {item.description && (
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out md:hidden ${isExpanded ? 'max-h-60' : 'max-h-0'}`}
        >
          <p className="text-cream/68 -mx-3.5 px-3.5 pb-[clamp(18px,2.4vh,30px)] text-[13px] leading-[1.6] transition-colors duration-220 group-hover/partner:text-(--brown)">
            {item.description}
          </p>
        </div>
      )}
    </li>
  );
}
