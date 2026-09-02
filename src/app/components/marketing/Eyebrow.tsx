import { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

interface EyebrowProps {
  children: ReactNode;
  onInk?: boolean;
  className?: string;
}

export function Eyebrow({ children, onInk = false, className }: EyebrowProps) {
  const tone = onInk ? 'text-ink-foreground/70' : 'text-muted-foreground';
  return (
    <p className={cn('font-body text-xs font-medium uppercase tracking-[0.18em]', tone, className)}>
      {children}
    </p>
  );
}
