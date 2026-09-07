import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/app/components/ui/utils';

function useDismissable(onClose: () => void, active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [active, onClose]);
  return ref;
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** hide the visible title but keep it as the accessible name */
  hideTitle?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** Centered dialog. Focus-trapped, Esc + backdrop close, scroll-locked. */
export function Modal({ open, onClose, title, hideTitle, children, footer, className }: ModalProps) {
  const ref = useDismissable(onClose, open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-deep-950/40 backdrop-blur-[2px]"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative flex w-full max-w-lg flex-col rounded-t-2xl bg-card p-6 shadow-[0_-8px_60px_-16px_rgba(6,46,49,0.5)] sm:max-h-[85vh] sm:rounded-2xl',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {!hideTitle && <h2 className="font-display text-lg text-foreground">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ms-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-cream-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-4 overflow-y-auto">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /**
   * `'start'`/`'end'` are RTL-aware (flip with locale, like the page content).
   * `'left'`/`'right'` are physical and never flip — use these for chrome
   * that should stay put regardless of locale, such as a menu anchored to a
   * fixed-position trigger (see `Header`'s nav drawer, always `'right'`).
   */
  side?: 'start' | 'end' | 'left' | 'right';
  children: ReactNode;
  className?: string;
};

const DRAWER_SIDE_CLASS = {
  end: 'end-0',
  start: 'start-0',
  right: 'right-0',
  left: 'left-0',
} as const;

/** Edge sheet. Used for the mobile nav. `side` defaults to the RTL-aware 'end'. */
export function Drawer({ open, onClose, title, side = 'end', children, className }: DrawerProps) {
  const ref = useDismissable(onClose, open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-deep-950/40" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute inset-y-0 flex w-[86%] max-w-sm flex-col bg-card p-6 shadow-2xl',
          DRAWER_SIDE_CLASS[side],
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-cream-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-6 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
