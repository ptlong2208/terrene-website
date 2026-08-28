'use client';

import { Command } from 'cmdk';
import { useEffect, useRef, useState } from 'react';

export interface ComboboxItem {
  id: string | number;
  name: string;
}

interface Props {
  items: ComboboxItem[];
  value: string;
  onSelect: (item: ComboboxItem) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  placeholder?: string;
  emptyText?: string;
  inputClassName?: string;
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function Combobox({
  items,
  value,
  onSelect,
  disabled = false,
  loading = false,
  error,
  placeholder,
  emptyText = 'Không tìm thấy',
  inputClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function select(item: ComboboxItem) {
    onSelect(item);
    setSearch('');
    setOpen(false);
  }

  const filtered = items.filter((item) => normalize(item.name).includes(normalize(search)));

  const displayValue = open ? search : value;

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
        value={displayValue}
        placeholder={loading ? 'Đang tải...' : placeholder}
        aria-invalid={!!error}
        disabled={disabled || loading}
        className={inputClassName}
        onFocus={() => {
          if (!disabled && !loading) {
            setSearch(value);
            setOpen(true);
          }
        }}
        onValueChange={(v) => setSearch(v)}
      />

      {open && !loading && (
        <Command.List className="absolute z-50 mt-1 w-full border border-(--green-deep)/20 bg-white shadow-md">
          <div data-lenis-prevent className="max-h-48 overflow-y-auto">
            <Command.Empty className="px-4 py-2.5 text-[13px] text-(--green-deep) opacity-40">
              {emptyText}
            </Command.Empty>
            {filtered.map((item) => (
              <Command.Item
                key={item.id}
                value={String(item.id)}
                onSelect={() => select(item)}
                className="cursor-pointer px-4 py-2.5 text-[14px] text-(--green-deep) data-[selected=true]:bg-(--green-deep)/5"
              >
                {item.name}
              </Command.Item>
            ))}
          </div>
        </Command.List>
      )}
    </Command>
  );
}
