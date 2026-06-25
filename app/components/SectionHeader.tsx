import TerreneLogo from '@/app/components/TerreneLogo';

interface SectionHeaderProps {
  kicker?: string | null;
  title?: string | null;
  kickerClassName?: string;
  titleClassName?: string;
}

export default function SectionHeader({
  kicker,
  title,
  kickerClassName,
  titleClassName,
}: SectionHeaderProps) {
  if (!kicker && !title) return null;

  return (
    <div>
      {kicker && (
        <div className={`flex items-center gap-2.5 text-ink-soft${kickerClassName ? ` ${kickerClassName}` : ''}`}>
          <TerreneLogo className="size-3.75 shrink-0" />
          <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
            {kicker}
          </span>
        </div>
      )}
      {title && (
        <h2
          className={`font-[380] text-[clamp(28px,3.2vw,54px)] leading-[1.12] tracking-[-0.02em] max-w-[15em] text-balance text-(--green-deep)${titleClassName ? ` ${titleClassName}` : ''}`}
        >
          {title}
        </h2>
      )}
    </div>
  );
}
