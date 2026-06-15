interface SlotTextProps {
  text: string;
  className?: string;
}

export default function SlotText({ text, className }: SlotTextProps) {
  const classes = [
    "inline-flex h-[1.35em] overflow-hidden align-top leading-[1.35]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <span className="inline-flex h-[2.7em] flex-col translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-y-[-1.35em]">
        <span className="block h-[1.35em] shrink-0 leading-[1.35em]">{text}</span>
        <span className="block h-[1.35em] shrink-0 leading-[1.35em]">{text}</span>
      </span>
    </span>
  );
}
