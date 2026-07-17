'use client';

import { useEffect, useRef, useState } from 'react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}

export default function Dropdown<T extends string>({ label, value, options, onChange }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [anchorRight, setAnchorRight] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handleToggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAnchorRight(rect.left > window.innerWidth / 2);
    }
    setOpen(o => !o);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-2 border border-(--green-deep)/20 rounded-full px-4 py-2.5 text-[12px] font-semibold tracking-[0.04em] uppercase text-(--green-deep) transition-colors duration-200 hover:border-(--green-deep)/50 cursor-pointer"
      >
        {label}
        <span
          className="text-[9px] inline-block transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className={`absolute top-[calc(100%+10px)] z-200 min-w-50 bg-cream border border-(--green-deep)/12 rounded-2xl shadow-[0_24px_60px_rgba(29,64,37,0.14)] py-2 ${anchorRight ? 'right-0' : 'left-0'}`}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full text-left px-4 py-2.5 text-[13px] transition-colors duration-150 hover:bg-(--green-deep)/5 cursor-pointer ${
                value === opt.value ? 'text-(--green-deep) font-semibold' : 'text-(--green-deep)/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
