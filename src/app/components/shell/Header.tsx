import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useScrollCondense } from '@/app/lib/useScrollCondense';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { cn } from '@/app/components/ui/utils';
import { MobileMenu } from './MobileMenu';

const PRIMARY_LINKS: Array<[key: string, to: string]> = [
  ['marketing.nav.howItWorks', '/how-it-works'],
  ['marketing.nav.science', '/science'],
  ['marketing.nav.products', '/products'],
  ['marketing.nav.about', '/about'],
];

const MORE_LINKS: Array<[key: string, to: string]> = [
  ['marketing.nav.faq', '/faq'],
  ['marketing.nav.support', '/support'],
];

export function Header() {
  const t = useT();
  const condensed = useScrollCondense();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const moreMenuId = useId();

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    burgerRef.current?.focus();
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors',
        condensed
          ? 'border-b border-border bg-background/95 backdrop-blur'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link to="/" className="inline-flex items-center">
          <Wordmark className="w-28" />
        </Link>

        <nav aria-label={t('marketing.nav.primaryLabel')} className="hidden items-center gap-8 lg:flex">
          {PRIMARY_LINKS.map(([key, to]) => (
            <Link key={to} to={to} className="text-sm tracking-wide text-foreground">
              {t(key)}
            </Link>
          ))}

          <div ref={moreRef} className="relative">
            <button
              ref={moreButtonRef}
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              aria-controls={moreOpen ? moreMenuId : undefined}
              onClick={() => setMoreOpen((open) => !open)}
              className="inline-flex items-center gap-1 text-sm tracking-wide text-foreground"
            >
              {t('marketing.nav.more')}
              <span aria-hidden="true">▾</span>
            </button>

            {moreOpen && (
              <ul
                id={moreMenuId}
                className="absolute end-0 top-full mt-2 min-w-40 rounded-lg border border-border bg-background py-2 shadow-lg"
              >
                {MORE_LINKS.map(([key, to]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground"
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <LocaleToggle />
          <Link
            to="/diagnosis"
            className="hidden items-center rounded-full bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground sm:inline-flex"
          >
            {t('marketing.nav.cta')}
          </Link>
          <button
            ref={burgerRef}
            type="button"
            aria-label={t('marketing.nav.openMenu')}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground lg:hidden"
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
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </header>
  );
}
