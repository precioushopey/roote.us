import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

/**
 * Text tooltip shown on hover and on keyboard focus. The trigger keeps its own
 * accessible name; the tip is supplementary (`aria-describedby`). Not for
 * essential content.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      <span
        role="tooltip"
        id={id}
        hidden={!open}
        className="absolute bottom-full start-1/2 z-40 mb-2 w-max max-w-[16rem] -translate-x-1/2 rounded-lg bg-foreground px-3 py-1.5 text-center font-body text-sm text-background shadow-lg rtl:translate-x-1/2"
      >
        {content}
      </span>
    </span>
  );
}
