import { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

interface ProseProps {
  children: ReactNode;
  size?: 'l' | 'm';
  onInk?: boolean;
  className?: string;
}

export function Prose({ children, size = 'm', onInk = false, className }: ProseProps) {
  const sizeClasses = {
    l: 'text-[0.9375rem] leading-[1.6] sm:text-[1.0625rem] sm:leading-[1.7]',
    m: 'text-[0.875rem] leading-[1.6] sm:text-[0.9375rem] sm:leading-[1.65]',
  }[size];

  const tone = onInk ? 'text-ink-foreground/85' : 'text-muted-foreground';

  return <p className={cn(sizeClasses, 'font-body max-w-prose', tone, className)}>{children}</p>;
}
