import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import type { MessageKey } from '@/i18n/messages';

const MENU_LINKS: Array<[key: MessageKey, to: string]> = [
  ['marketing.nav.howItWorks', '/how-it-works'],
  ['marketing.nav.science', '/science'],
  ['marketing.nav.products', '/products'],
  ['marketing.nav.about', '/about'],
  ['marketing.nav.faq', '/faq'],
  ['marketing.nav.support', '/support'],
];

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const t = useT();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('marketing.nav.menuLabel')}
      className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-4"
    >
      <div className="flex items-center justify-end">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t('marketing.nav.closeMenu')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-6">
        {MENU_LINKS.map(([key, to]) => (
          <li key={to}>
            <Link to={to} onClick={onClose} className="font-display text-2xl text-foreground">
              {t(key)}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-6">
        <LocaleToggle />
        <Link
          to="/diagnosis"
          onClick={onClose}
          className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground"
        >
          {t('marketing.nav.cta')}
        </Link>
      </div>
    </div>
  );
}
