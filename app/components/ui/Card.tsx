import type { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export default function Card({ className, children }: CardProps) {
  return (
    <div
      className={`border-line border bg-white p-[clamp(20px,2.4vw,32px)] ${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}
