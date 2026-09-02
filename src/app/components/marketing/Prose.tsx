import { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

interface ProseProps {
  children: ReactNode;
  size?: 'l' | 'm';
  className?: string;
}

export function Prose({ children, size = 'm', className }: ProseProps) {
  const sizeClasses = {
    l: 'text-[1.0625rem] leading-[1.7]',
    m: 'text-[0.9375rem] leading-[1.65]',
  }[size];

  const base = 'font-body text-muted-foreground max-w-prose';

  return <p className={cn(sizeClasses, base, className)}>{children}</p>;
}
