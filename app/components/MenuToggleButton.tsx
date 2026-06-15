'use client';

interface MenuToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}
export default function MenuToggleButton({ isOpen, onToggle }: MenuToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group inline-flex h-4 w-6.5 flex-col items-center justify-center gap-1.25 border-0 bg-transparent p-0 text-inherit transition-transform duration-120 ease-out active:scale-[0.92] cursor-pointer"
      aria-expanded={isOpen}
    >
      <span className="h-[1.5px] w-6.5 bg-current transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-y-px" />
      <span className="h-[1.5px] w-6.5 bg-current transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:-translate-y-px" />
    </button>
  );
}
