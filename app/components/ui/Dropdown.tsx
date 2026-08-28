'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

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

export default function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenu.Trigger className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-(--green-deep)/20 px-4 py-2.5 text-[12px] font-semibold tracking-[0.04em] text-(--green-deep) uppercase transition-colors duration-200 outline-none hover:border-(--green-deep)/50">
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
          className="bg-cream z-200 min-w-50 rounded-2xl border border-(--green-deep)/12 py-2 shadow-[0_24px_60px_rgba(29,64,37,0.14)] outline-none"
        >
          {options.map((opt) => (
            <DropdownMenu.Item
              key={opt.value}
              onSelect={() => onChange(opt.value)}
              className={`block w-full cursor-pointer px-4 py-2.5 text-left text-[13px] transition-colors duration-150 outline-none hover:bg-(--green-deep)/5 ${
                value === opt.value ? 'font-semibold text-(--green-deep)' : 'text-(--green-deep)/70'
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
