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
      className={`border-line -mx-3.5 grid cursor-default grid-cols-[56px_1fr] gap-5 border-t px-3.5 py-6.5 transition-colors duration-280 last:border-b ${isActive ? 'bg-(--green-deep)' : ''}`}
    >
      <span
        className={`pt-1 text-xs tabular-nums transition-colors duration-280 ${isActive ? 'text-cream/55' : 'text-ink-faint'}`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        <p
          className={`mb-1.5 text-[clamp(17px,1.5vw,22px)] font-[450] transition-colors duration-280 ${isActive ? 'text-cream' : 'text-(--green-deep)'}`}
        >
          {step.name}
        </p>
        {step.description && (
          <p
            className={`max-w-[46ch] text-[13px] leading-[1.65] transition-colors duration-280 ${isActive ? 'text-cream/60' : 'text-ink-soft'}`}
          >
            {step.description}
          </p>
        )}
      </div>
    </li>
  );
}
