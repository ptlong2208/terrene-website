import clsx from 'clsx';

interface SlotTextProps {
  text: string;
  className?: string;
}

export default function SlotText({ text, className }: SlotTextProps) {
  const classes = clsx(
    'inline-flex h-[1.35em] overflow-hidden align-top leading-[1.35]',
    className
  );

  return (
    <span className={classes}>
      <span className="inline-flex h-[2.7em] translate-y-0 flex-col transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-y-[-1.35em]">
        <span className="block h-[1.35em] shrink-0 leading-[1.35em]">{text}</span>
        <span className="block h-[1.35em] shrink-0 leading-[1.35em]">{text}</span>
      </span>
    </span>
  );
}
