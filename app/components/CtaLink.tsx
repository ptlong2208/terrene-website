import Link from 'next/link';
import SlotText from '@/app/components/SlotText';

interface CtaLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function CtaLink({ href, label, className }: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-(--green-deep) border-b border-current pb-0.75 no-underline${className ? ` ${className}` : ''}`}
    >
      <SlotText text={label} />
    </Link>
  );
}
