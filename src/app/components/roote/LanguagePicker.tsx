import { useEffect, useId, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { ENABLED_LOCALES, LOCALES, type LocaleCode } from '@/i18n/locales';
import { useT } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';

type Props = {
  locale: LocaleCode;
  onChange: (l: LocaleCode) => void;
  compact?: boolean;
  className?: string;
};

export function LanguagePicker({ locale, onChange, compact = false, className }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();
  const current = LOCALES[locale];

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, ENABLED_LOCALES.indexOf(locale));
    setActiveIndex(idx);
    const raf = requestAnimationFrame(() => itemRefs.current[idx]?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open, locale]);

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDocPointer);
    return () => document.removeEventListener('pointerdown', onDocPointer);
  }, [open]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const last = ENABLED_LOCALES.length - 1;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.min(last, activeIndex + 1); setActiveIndex(n); itemRefs.current[n]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.max(0, activeIndex - 1); setActiveIndex(n); itemRefs.current[n]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); itemRefs.current[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); setActiveIndex(last); itemRefs.current[last]?.focus(); }
  }

  function pick(l: LocaleCode) {
    close(true);
    if (l !== locale) onChange(l);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          compact
            ? 'inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground'
            : 'inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground',
          className,
        )}
      >
        <Globe className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
        {!compact && <span>{current.label}</span>}
        <span className="sr-only">
          {t('nav.language.open')} — {t('nav.language.current', { name: current.englishName })}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          id={menuId}
          aria-label={t('nav.language.title')}
          onKeyDown={onMenuKeyDown}
          className="absolute end-0 z-50 mt-2 min-w-44 rounded-sm border border-border bg-white py-1 shadow-lg"
        >
          {ENABLED_LOCALES.map((code, i) => {
            const meta = LOCALES[code];
            const isCurrent = code === locale;
            return (
              <button
                key={code}
                ref={(el) => { itemRefs.current[i] = el; }}
                type="button"
                role="menuitem"
                tabIndex={i === activeIndex ? 0 : -1}
                aria-current={isCurrent ? 'true' : undefined}
                dir={meta.dir}
                onClick={() => pick(code)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 px-3 py-2 text-start font-body text-sm',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground hover:bg-cream-100 hover:text-foreground',
                )}
              >
                <span>{meta.label}</span>
                {isCurrent && <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
