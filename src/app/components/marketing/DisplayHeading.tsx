import { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

interface DisplayHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: 'xl' | 'l' | 'm' | 's';
  /** CSS font-size expression (e.g. a clamp()); overrides `size` when set. */
  clamp?: string;
  text: string;
  ghost?: string;
  onInk?: boolean;
  className?: string;
}

export function DisplayHeading({
  as: Tag = 'h2',
  size = 'm',
  clamp,
  text,
  ghost,
  onInk = false,
  className,
}: DisplayHeadingProps) {
  const sizeClasses = {
    xl: 'text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.02em]',
    l: 'text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.0] tracking-[-0.015em]',
    m: 'text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.05]',
    s: 'text-2xl leading-snug',
  }[size];

  const base = 'font-display font-medium text-balance';
  const ghostClass = onInk ? 'text-ink-ghost' : 'text-accent-ghost';

  return (
    <Tag
      className={cn(clamp ? 'leading-[0.95] tracking-[-0.02em]' : sizeClasses, base, className)}
      style={clamp ? { fontSize: clamp } : undefined}
    >
      {text}
      {ghost && (
        <span aria-hidden="true" className={ghostClass}>
          {' '}
          {ghost}
        </span>
      )}
    </Tag>
  );
}
