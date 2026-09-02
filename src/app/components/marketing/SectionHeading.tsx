import { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

interface SectionHeadingProps {
  /** Gold section numeral, e.g. "01". */
  index?: string;
  /** Optional node shown opposite the numeral (usually an <Eyebrow> link). */
  trailing?: ReactNode;
  align?: 'start' | 'end';
  onInk?: boolean;
  /** CSS font-size expression for the fluid display heading. */
  clamp?: string;
  as?: 'h1' | 'h2';
  className?: string;
  children: string;
}

/**
 * The homepage's signature section header: a gold numeral row plus an oversized
 * uppercase display heading that fills the section width. Mirrors the inline
 * pattern used across `Home.tsx` so the rest of the site reads the same.
 */
export function SectionHeading({
  index,
  trailing,
  align = 'start',
  onInk = false,
  clamp = 'clamp(2rem, 9vw, 6.5rem)',
  as: Tag = 'h2',
  className,
  children,
}: SectionHeadingProps) {
  const hasRow = index != null || trailing != null;
  return (
    <div className={className}>
      {hasRow && (
        <div
          className={cn(
            'flex items-center gap-4',
            trailing != null ? 'justify-between' : align === 'end' && 'flex-row-reverse',
          )}
        >
          {index != null && (
            <span aria-hidden className="text-2xl leading-none tracking-[0.18em] text-accent">
              {index}
            </span>
          )}
          {trailing}
        </div>
      )}
      <Tag
        className={cn(
          'select-none text-balance font-display font-medium uppercase leading-[0.95] tracking-[-0.02em]',
          hasRow && 'mt-4',
          onInk ? 'text-ink-foreground' : 'text-foreground',
          align === 'end' ? 'text-end' : 'text-start',
        )}
        style={{ fontSize: clamp }}
      >
        {children}
      </Tag>
    </div>
  );
}
