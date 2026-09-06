import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

export type AccordionItem = {
  id: string;
  title: ReactNode;
  body: ReactNode;
};

type Props = {
  items: AccordionItem[];
  /** allow multiple panels open at once */
  multiple?: boolean;
  /** ids open on first render */
  defaultOpen?: string[];
  className?: string;
};

/**
 * Disclosure list for FAQs and product technical detail. Native <button>
 * headers, real `aria-expanded` / `aria-controls`, panels are plain regions.
 * No height animation (a chevron rotate is the only motion), so it is
 * reduced-motion-safe by construction.
 */
export function Accordion({ items, multiple = false, defaultOpen = [], className }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));
  const baseId = useId();

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={cn('divide-y divide-border border-y border-border', className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const btnId = `${baseId}-${item.id}-btn`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <h3 className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 py-5 text-start font-body text-md font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>{item.title}</span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={cn('h-4 w-4 shrink-0 text-accent transition-transform duration-200', isOpen && 'rotate-180')}
                  fill="none"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen} className="pb-6">
              <div className="max-w-[62ch] font-body text-sm leading-[1.65] text-muted-foreground">{item.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
