import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, User } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useScrollCondense } from '@/app/lib/useScrollCondense';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { Button, Drawer, IconButton, LanguagePicker } from '@/app/components/roote';
import { CartLink } from '@/app/components/shell/CartLink';
import { cn } from '@/app/components/ui/utils';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { resolveCartLines } from '@/store/cartLines';

// 2026-09-08 nav sketch: Magazine | Products | AI Section. The former
// Process/Science/About pages were dropped from the header nav then, and were
// fully removed from the app (routes + components) in the 2026-09-10 redesign
// consolidation — /about, /science, /how-it-works, /system no longer exist.
const NAV: Array<[key: MessageKey, to: string]> = [
  ['marketing.nav.magazine', PATHS.magazine],
  ['marketing.nav.products', PATHS.products],
  ['marketing.nav.aiSection', PATHS.hairScan],
];

export function Header() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const condensed = useScrollCondense();
  const cart = useCart();
  const auth = useAuth();
  const { locale, setLocale } = useLocale();
  const resolvedCartCount = resolveCartLines(cart.lines, locale).reduce((n, l) => n + l.qty, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  // A guest with no account can't reach the authenticated /account app (it
  // redirects away, see AppShell.tsx), so send them to the guest-facing
  // nudge page instead of a link that silently bounces them.
  const accountLink = auth.email ? PATHS.account : PATHS.getStarted;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'font-body text-sm font-medium uppercase transition-colors',
      isActive ? 'text-accent' : 'text-ink-foreground hover:text-ink-foreground',
    );

  return (
    <header
      className={cn(
        // Matches the hero band's own `bg-ink` exactly at the top (mdhair.co-
        // style: no visible seam) → solid white once scrolled.
        'sticky top-0 z-40 w-full transition-[padding,border-color,background-color] duration-200',
        condensed ? 'bg-white border-b border-ink-foreground/15' : 'bg-ink border-b border-transparent',
      )}
    >
      <div
        // Header chrome stays in a fixed left-nav / right-menu arrangement in
        // every locale — only page content mirrors for RTL, not this bar.
        dir="ltr"
        className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-6 md:px-12 py-4"
      >
        {/* Group 1: logo + primary nav, hugging the start edge. shrink-0 —
            the nav labels are whitespace-nowrap, so this group never has any
            real give; all the squeeze belongs to the CTA in Group 2. */}
        <div className="flex shrink-0 items-center gap-8 lg:gap-12">
          <Link to={withLocale(PATHS.home)} aria-label="ROOTÉ" className="w-fit shrink-0">
            <Wordmark className="w-24 md:w-28 lg:w-32" />
          </Link>
          <nav
            aria-label={t('marketing.nav.primaryLabel')}
            className="hidden items-center gap-8 lg:flex xl:gap-8"
          >
            {NAV.map(([key, to]) => (
              <NavLink key={to} to={withLocale(to)} className={navLinkClass}>
                <span className="whitespace-nowrap">{t(key)}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Group 2: icons + CTA, hugging the end edge. `justify-between` on the
            row above puts all the flexible space between the two groups. This
            group itself must stay shrinkable (no shrink-0 here) or the browser
            has no reason to compress anything inside it and the row just
            overflows — the icon cluster and hamburger get `shrink-0` instead,
            so the CTA (the only child with genuine give, via its own
            `min-w-0` + `truncate`) is what actually absorbs the squeeze. */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex shrink-0 items-center gap-0">
            <div className="hidden items-center gap-0 md:flex">
              <LanguagePicker
                locale={locale}
                onChange={setLocale}
                compact
                className="text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              />
              <Link
                to={withLocale(accountLink)}
                aria-label={t('marketing.nav.account')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <User width={20} height={20} strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
            <CartLink label={t('cart.open')} count={resolvedCartCount} />
          </div>
          <Button
            to={withLocale(PATHS.analysis)}
            caps
            variant={condensed ? 'primary' : 'secondary'}
            className="hidden min-w-0 sm:inline-flex text-sm"
          >
            <span className="min-w-0 truncate">{t('marketing.nav.cta')}</span>
          </Button>
          <IconButton
            label={t('marketing.nav.openMenu')}
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-ink-foreground hover:bg-ink-foreground/10 shrink-0"
          >
            <Menu width={22} height={22} strokeWidth={1.5} aria-hidden />
          </IconButton>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={t('marketing.nav.menuLabel')} side="right">
        <nav className="flex flex-col gap-0">
          {[...NAV, ['marketing.nav.account', accountLink] as [MessageKey, string]].map(([key, to]) => (
            <Link
              key={to}
              to={withLocale(to)}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-3 font-display text-base text-foreground hover:bg-cream-100"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-6">
          <LanguagePicker locale={locale} onChange={setLocale} />
          <Button to={withLocale(PATHS.analysis)} caps block variant="secondary" className="mt-4 text-xs" onClick={() => setMenuOpen(false)}>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Drawer>
    </header>
  );
}
