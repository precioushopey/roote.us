import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useScrollCondense } from '@/app/lib/useScrollCondense';
import { useHeroLogoReveal } from '@/app/lib/useHeroLogoReveal';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { Button, Drawer, IconButton, CountryLanguageSelector } from '@/app/components/roote';
import { cn } from '@/app/components/ui/utils';
import { PATHS, EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { countryDefault, type LocaleCode } from '@/i18n/locales';
import type { MessageKey } from '@/i18n/messages';

const NAV: Array<[key: MessageKey, to: string]> = [
  ['marketing.nav.products', PATHS.products],
  ['marketing.nav.howItWorks', PATHS.howItWorks],
  ['marketing.nav.science', PATHS.science],
  ['marketing.nav.about', PATHS.about],
];

export function Header() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const condensed = useScrollCondense();
  const logoReveal = useHeroLogoReveal();
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
      'font-body text-xs uppercase tracking-[0.14em] transition-colors',
      isActive ? 'text-accent' : 'text-ink-foreground/70 hover:text-ink-foreground',
    );

  return (
    <header
      className={cn(
        'glass-dark sticky top-0 z-40 w-full transition-[padding,border-color] duration-200',
        condensed ? 'border-b border-ink-foreground/15' : 'border-b border-transparent',
      )}
    >
      <div
        // Header chrome stays in a fixed left-nav / right-menu arrangement in
        // every locale — only page content mirrors for RTL, not this bar.
        dir="ltr"
        className={cn(
          'relative mx-auto flex max-w-[80rem] items-center gap-4 px-6 md:px-10',
          condensed ? 'py-3' : 'py-4',
        )}
      >
        <nav
          aria-label={t('marketing.nav.primaryLabel')}
          className="hidden flex-1 items-center gap-6 lg:flex xl:gap-8"
        >
          {NAV.map(([key, to]) => (
            <NavLink key={to} to={withLocale(to)} className={navLinkClass}>
              <span className="whitespace-nowrap">{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-0 md:flex">
            <CountryLanguageSelector
              country={country}
              locale={locale}
              onChangeCountry={onChangeCountry}
              onChangeLocale={onChangeLocale}
              labels={regionLabels}
              compact
              className="text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
            />
            <Link
              to={withLocale(PATHS.account)}
              aria-label={t('marketing.nav.account')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps onInk className="hidden sm:inline-flex text-sm">
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

        <Link
          to={withLocale(PATHS.home)}
          aria-label="ROOTÉ"
          aria-hidden={logoReveal < 0.5}
          tabIndex={logoReveal < 0.5 ? -1 : undefined}
          style={{
            opacity: logoReveal,
            pointerEvents: logoReveal < 0.5 ? 'none' : 'auto',
            transform: `scale(${0.55 + 0.45 * logoReveal})`,
          }}
          className="absolute inset-x-0 mx-auto w-fit"
        >
          <Wordmark className="w-24 md:w-28 lg:w-32" onInk />
        </Link>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={t('marketing.nav.menuLabel')} side="right">
        <nav className="flex flex-col gap-1">
          {[...NAV, ['marketing.nav.account', PATHS.account] as [MessageKey, string]].map(([key, to]) => (
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
          <Button to={EXTERNAL_ASSESSMENT_URL} external caps block className="mt-4 text-sm" onClick={() => setMenuOpen(false)}>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Drawer>
    </header>
  );
}
