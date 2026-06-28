import type { ProcessStep } from '@/lib/types';

interface ProcessItemProps {
  step: ProcessStep;
  index: number;
  isActive: boolean;
  onMouseEnter: () => void;
}

export default function ProcessItem({ step, index, isActive, onMouseEnter }: ProcessItemProps) {
  return (
    <li
      onMouseEnter={onMouseEnter}
      className={`grid grid-cols-[56px_1fr] gap-5 py-6.5 px-3.5 -mx-3.5 border-t border-line last:border-b transition-colors duration-280 cursor-default${isActive ? ' bg-(--green-deep)' : ''}`}
    >
      <span className={`text-xs tabular-nums pt-1 transition-colors duration-[280ms]${isActive ? ' text-cream/55' : ' text-ink-faint'}`}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        <p className={`text-[clamp(17px,1.5vw,22px)] font-[450] mb-1.5 transition-colors duration-[280ms]${isActive ? ' text-cream' : ' text-(--green-deep)'}`}>
          {step.name}
        </p>
        {step.description && (
          <p className={`text-[13px] leading-[1.65] max-w-[46ch] transition-colors duration-[280ms]${isActive ? ' text-cream/60' : ' text-ink-soft'}`}>
            {step.description}
          </p>
        )}
      </div>
    </li>
  );
}
