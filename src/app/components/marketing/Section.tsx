import { ReactNode } from 'react';
import { ArcMotif } from './ArcMotif';
import { cn } from '@/app/components/ui/utils';

interface SectionProps {
  children: ReactNode;
  id?: string;
  index?: string;
  tone?: 'light' | 'ink';
  motif?: boolean;
  className?: string;
}

export function Section({
  children,
  id,
  index,
  tone = 'light',
  motif = false,
  className,
}: SectionProps) {
  const toneClasses =
    tone === 'ink'
      ? 'py-24 md:py-32 bg-ink text-ink-foreground'
      : 'bg-grid-lines py-20 md:py-28';

  return (
    <section id={id} data-animate="section" className={cn(toneClasses, className)}>
      <div className="relative isolate mx-auto max-w-6xl px-6 md:px-10">
        {motif && <ArcMotif />}
        {index && (
          <span aria-hidden className="mb-4 block font-body text-2xl tracking-[0.18em] text-accent">
            {index}
          </span>
        )}
        {children}
      </div>
    </section>
  );
}
