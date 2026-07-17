import Link from 'next/link';
import SlotText from '@/app/components/ui/SlotText';

interface CtaLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function CtaLink({ href, label, className }: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 border-b border-current pb-0.75 text-[14px] font-semibold tracking-[-0.02em] text-(--green-deep) no-underline${className ? ` ${className}` : ''}`}
    >
      <SlotText text={label} />
    </Link>
  );
}
