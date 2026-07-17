import type { ShopCategory } from '@/lib/types';
import SlotText from '@/app/components/ui/SlotText';
import { CategoryFilter } from './constants';

interface CategoryBarProps {
  categories: ShopCategory[];
  categoryCounts: Record<string, number>;
  totalCount: number;
  activeCategory: string;
  onSelect: (id: string) => void;
  allProductsLabel: string;
}

export default function CategoryBar({
  categories,
  categoryCounts,
  totalCount,
  activeCategory,
  onSelect,
  allProductsLabel,
}: CategoryBarProps) {
  const btnClass = (active: boolean) =>
    `group inline-flex items-center gap-1 text-[13px] font-semibold tracking-[0.02em] uppercase text-(--green-deep) transition-opacity duration-200 cursor-pointer${
      active ? '' : ' opacity-40 hover:opacity-100'
    }`;

  return (
    <div className="flex items-center flex-wrap gap-x-5.5 gap-y-2.5">
      <button
        type="button"
        onClick={() => onSelect(CategoryFilter.All)}
        className={btnClass(activeCategory === CategoryFilter.All)}
      >
        <SlotText text={allProductsLabel} />
        <span className="tabular-nums">({totalCount})</span>
      </button>
      {categories.map(cat => (
        <button
          key={cat.documentId}
          type="button"
          onClick={() => onSelect(cat.documentId)}
          className={btnClass(activeCategory === cat.documentId)}
        >
          <SlotText text={cat.name} />
          <span className="tabular-nums">({categoryCounts[cat.documentId] ?? 0})</span>
        </button>
      ))}
    </div>
  );
}
