'use client';

import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

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

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenu.Trigger className="inline-flex items-center gap-2 border border-(--green-deep)/20 rounded-full px-4 py-2.5 text-[12px] font-semibold tracking-[0.04em] uppercase text-(--green-deep) transition-colors duration-200 hover:border-(--green-deep)/50 cursor-pointer outline-none">
        {label}
        <ChevronDown
          size={12}
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={10}
          align="end"
          avoidCollisions
          className="z-200 min-w-50 bg-cream border border-(--green-deep)/12 rounded-2xl shadow-[0_24px_60px_rgba(29,64,37,0.14)] py-2 outline-none"
        >
          {options.map(opt => (
            <DropdownMenu.Item
              key={opt.value}
              onSelect={() => onChange(opt.value)}
              className={`block w-full text-left px-4 py-2.5 text-[13px] transition-colors duration-150 hover:bg-(--green-deep)/5 cursor-pointer outline-none ${
                value === opt.value ? 'text-(--green-deep) font-semibold' : 'text-(--green-deep)/70'
              }`}
            >
              {opt.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
