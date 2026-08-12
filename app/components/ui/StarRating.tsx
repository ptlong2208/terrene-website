'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  label?: string;
}

export default function StarRating({ value, onChange, size = 16, label }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  if (!onChange) {
    const filled = Math.round(value);
    return (
      <div className="flex items-center gap-0.5 text-[#E0A92E]" aria-label={label ?? `${value}/5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            strokeWidth={1.5}
            fill={n <= filled ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  }

  const display = hovered || value;
  return (
    <div
      className="flex items-center gap-1 text-[#E0A92E]"
      role="radiogroup"
      aria-label={label ?? 'Chọn số sao'}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} sao`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          className="cursor-pointer border-0 bg-transparent p-0.5"
        >
          <Star size={size} strokeWidth={1.5} fill={n <= display ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
