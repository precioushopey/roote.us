import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { useScrollCondense } from '@/app/lib/useScrollCondense';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { Button, Drawer, IconButton, CountryLanguageSelector } from '@/app/components/roote';
import { cn } from '@/app/components/ui/utils';
import { PATHS } from '@/app/paths';
import { countryDefault, type LocaleCode } from '@/i18n/locales';
import type { MessageKey } from '@/i18n/messages';

const NAV: Array<[key: MessageKey, to: string]> = [
  ['marketing.nav.howItWorks', PATHS.howItWorks],
  ['marketing.nav.solutions', PATHS.solutions],
  ['marketing.nav.science', PATHS.science],
  ['marketing.nav.results', PATHS.results],
  ['marketing.nav.system', PATHS.system],
  ['marketing.nav.about', PATHS.about],
];

function CartLink({ label, count }: { label: string; count: number }) {
  const withLocale = useLocalizedPath();
  return (
    <Link
      to={withLocale(PATHS.bag)}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-foreground/10"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const cart = useCart();
  const condensed = useScrollCondense();
  const { locale, country, setLocale, setLocaleRegion } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const regionLabels = {
    open: t('marketing.region.trigger'),
    title: t('marketing.region.title'),
    region: t('marketing.region.regionLabel'),
    language: t('marketing.region.languageLabel'),
    done: t('marketing.region.done'),
  };

  // Picking a region also moves the language to that region's default.
  const onChangeCountry = (c: string) => {
    setLocaleRegion(countryDefault(c).locale, c);
  };
  const onChangeLocale = (l: LocaleCode) => setLocale(l);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'font-body text-sm tracking-wide transition-colors',
      isActive ? 'text-ink-foreground' : 'text-ink-foreground/70 hover:text-ink-foreground',
    );

  return (
    <header
      className={cn(
        'glass-dark sticky top-0 z-40 w-full transition-[padding,border-color] duration-200',
        condensed ? 'border-b border-ink-foreground/15' : 'border-b border-transparent',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-[80rem] items-center justify-between gap-6 px-6 md:px-10',
          condensed ? 'py-3' : 'py-4',
        )}
      >
        <Link to={withLocale(PATHS.home)} aria-label="ROOTÉ" className="inline-flex items-center">
          <Wordmark className="w-28" onInk />
        </Link>

        <nav
          aria-label={t('marketing.nav.primaryLabel')}
          className="hidden items-center gap-6 lg:flex xl:gap-8"
        >
          {NAV.map(([key, to]) => (
            <NavLink key={to} to={withLocale(to)} className={navLinkClass}>
              <span className="whitespace-nowrap">{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <CountryLanguageSelector
            country={country}
            locale={locale}
            onChangeCountry={onChangeCountry}
            onChangeLocale={onChangeLocale}
            labels={regionLabels}
            className="hidden text-ink-foreground/70 hover:text-ink-foreground md:inline-flex"
          />
          <NavLink to={withLocale(PATHS.account)} className="hidden font-body text-sm text-ink-foreground/70 hover:text-ink-foreground md:inline">
            {t('marketing.nav.account')}
          </NavLink>
          <CartLink label={t('cart.open')} count={cart.count} />
          <Button to={withLocale(PATHS.analysis)} size="sm" caps onInk className="hidden sm:inline-flex">
            {t('marketing.nav.cta')}
          </Button>
          <IconButton
            label={t('marketing.nav.openMenu')}
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-ink-foreground hover:bg-ink-foreground/10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </IconButton>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={t('marketing.nav.menuLabel')}>
        <nav className="flex flex-col gap-1">
          {[...NAV, ['marketing.nav.products', PATHS.products] as [MessageKey, string], ['marketing.nav.faq', PATHS.faq] as [MessageKey, string], ['marketing.nav.support', PATHS.support] as [MessageKey, string], ['marketing.nav.account', PATHS.account] as [MessageKey, string]].map(([key, to]) => (
            <Link
              key={to}
              to={withLocale(to)}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-3 font-display text-lg text-foreground hover:bg-cream-100"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-6">
          <CountryLanguageSelector
            country={country}
            locale={locale}
            onChangeCountry={onChangeCountry}
            onChangeLocale={onChangeLocale}
            labels={regionLabels}
          />
          <Button to={withLocale(PATHS.analysis)} caps block className="mt-4" onClick={() => setMenuOpen(false)}>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Drawer>
    </header>
  );
}
