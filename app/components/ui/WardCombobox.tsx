'use client';

import { Command } from 'cmdk';
import { useEffect, useRef, useState } from 'react';

import { HCMC_WARDS } from '@/lib/hcmc-wards';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface Props {
  value: string;
  onChange: (ward: string) => void;
  error?: string;
  placeholder?: string;
  emptyText?: string;
  inputClassName?: string;
}

export default function WardCombobox({
  value,
  onChange,
  error,
  placeholder,
  emptyText = 'Không tìm thấy phường/xã',
  inputClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function select(ward: string) {
    onChange(ward);
    setSearch('');
    setOpen(false);
  }

  const filtered = (HCMC_WARDS as readonly string[]).filter((w) =>
    normalize(w).includes(normalize(search))
  );

  return (
    <Command
      ref={containerRef}
      className="relative"
      shouldFilter={false}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Tab') setOpen(false);
      }}
    >
      <Command.Input
        value={open ? search : value}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={inputClassName}
        onFocus={() => {
          setSearch(value);
          setOpen(true);
        }}
        onValueChange={(v) => setSearch(v)}
      />

      {open && (
        <Command.List className="absolute z-50 mt-1 w-full border border-(--green-deep)/20 bg-white shadow-md">
          <div className="max-h-48 overflow-y-auto">
            <Command.Empty className="px-4 py-2.5 text-[13px] text-(--green-deep) opacity-40">
              {emptyText}
            </Command.Empty>
            {filtered.map((ward) => (
              <Command.Item
                key={ward}
                value={ward}
                onSelect={select}
                className="cursor-pointer px-4 py-2.5 text-[14px] text-(--green-deep) data-[selected=true]:bg-(--green-deep)/5"
              >
                {ward}
              </Command.Item>
            ))}
          </div>
        </Command.List>
      )}
    </Command>
  );
}
