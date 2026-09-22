import type { ComponentType } from 'react';
import { Link } from 'react-router';
import { Instagram, Facebook, Youtube, type LucideProps } from 'lucide-react';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { LEGAL_PAGES } from '@/content/legal';
import { CONCERN_OPTIONS } from '@/content/assessment';
import { pickLocalized } from '@/content/localized';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { Button, LanguagePicker } from '@/app/components/roote';
import { PATHS } from '@/app/paths';

type Col = { title: MessageKey; links: Array<[to: string, label: MessageKey]> };

const COLUMNS: Col[] = [
  {
    title: 'marketing.footer.company',
    links: [
      [PATHS.home, 'marketing.nav.home'],
      [PATHS.magazine, 'marketing.nav.magazine'],
      [PATHS.products, 'marketing.nav.products'],
      [PATHS.hairScan, 'marketing.nav.aiSection'],
      [PATHS.about, 'marketing.nav.about'],
    ],
  },
];

const ACCOUNT_LINKS: Col['links'] = [
  [PATHS.faq, 'marketing.nav.faq'],
  [PATHS.support, 'marketing.nav.support'],
  [PATHS.account, 'marketing.nav.account'],
  [PATHS.cart, 'marketing.nav.bag'],
];

/** 'thinning' / 'gray' resolve via CONCERN_OPTIONS (localized). */
const SOLUTION_LINKS: Array<[to: string, kind: string]> = [
  [PATHS.solutionThinning, 'thinning'],
  [PATHS.solutionGray, 'gray'],
];

/** lucide-react has no TikTok glyph, so it stays a hand-drawn path (matching
 *  the same 24x24/stroke-1.5 shape as the other three) rather than mixing in
 *  a differently-styled third-party mark. */
function TikTokIcon({ strokeWidth = 1.5, ...rest }: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} {...rest}>
      <path d="M14 3c.3 2 1.6 3.4 3.6 3.7v2.6c-1.3 0-2.5-.4-3.6-1.1v6.3c0 3-2.4 5-5.2 5-2.9 0-5.2-2.2-5.2-5s2.4-5 5.2-5c.3 0 .6 0 .9.1v2.7a2.5 2.5 0 1 0 1.8 2.4V3Z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, ComponentType<LucideProps>> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTokIcon,
  youtube: Youtube,
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export function Footer() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const { locale, setLocale } = useLocale();
  const year = new Date().getFullYear();
  const { company, brand } = rooteContent;
  const socialLinks = Object.entries(brand.social).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );

  const getStartedLinks = [
    ...SOLUTION_LINKS.map(([to, kind]) => ({
      to,
      label: pickLocalized(CONCERN_OPTIONS.find((c) => c.value === kind)!.title, locale),
    })),
    ...ACCOUNT_LINKS.map(([to, label]) => ({ to, label: t(label) })),
  ];

  const legalLinks = LEGAL_PAGES.map((p) => ({ key: p.slug, to: PATHS.legal(p.slug), label: pickLocalized(p.title, locale) }));

  return (
    // bg-cream-100, not bg-ink (taupe) — the taupe anchor tone is too close
    // in value to the gold wordmark rendered below for it to read; see
    // src/app/components/brand/Wordmark.tsx.
    <footer className="border-t border-ink-foreground/15 bg-cream-100 px-6 py-16 text-ink-foreground md:px-12">
      <div className="mx-auto max-w-[80rem]">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={t(col.title)}>
              <h2 className="u-caps font-body text-sm font-semibold text-ink-foreground">{t(col.title)}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map(([to, label]) =>
                  to.startsWith('http') ? (
                    <li key={to + label}>
                      <a
                        href={to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-ink-foreground hover:text-accent"
                      >
                        {t(label)}
                      </a>
                    </li>
                  ) : (
                    <li key={to + label}>
                      <Link to={withLocale(to)} className="font-body text-sm text-ink-foreground hover:text-accent">
                        {t(label)}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}

          <nav aria-label={t('marketing.footer.getStarted')}>
            <h2 className="u-caps font-body text-sm font-semibold text-ink-foreground">
              {t('marketing.footer.getStarted')}
            </h2>
            <ul className="mt-3 space-y-2">
              {getStartedLinks.map(({ to, label }) =>
                to.startsWith('http') ? (
                  <li key={to + label}>
                    <a
                      href={to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm text-ink-foreground hover:text-accent"
                    >
                      {label}
                    </a>
                  </li>
                ) : (
                  <li key={to + label}>
                    <Link to={withLocale(to)} className="font-body text-sm text-ink-foreground hover:text-accent">
                      {label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <nav aria-label={t('marketing.footer.legal')}>
            <h2 className="u-caps font-body text-sm font-semibold text-ink-foreground">
              {t('marketing.footer.legal')}
            </h2>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link to={withLocale(link.to)} className="font-body text-sm text-ink-foreground hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('marketing.footer.customerSupport')}>
            <h2 className="u-caps font-body text-sm font-semibold text-ink-foreground">
              {t('marketing.footer.customerSupport')}
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a href={`mailto:${company.support.email}`} dir="ltr" className="font-body text-sm text-ink-foreground hover:text-accent">
                  {company.support.email}
                </a>
              </li>
              <li>
                <a href={company.support.phoneHref} dir="ltr" className="font-body text-sm text-ink-foreground hover:text-accent">
                  {company.support.phone}
                </a>
              </li>
            </ul>
            <Button to={withLocale(PATHS.analysis)} caps variant="secondary" className="mt-6">
              {t('marketing.footer.cta')}
            </Button>
            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-4">
                {socialLinks.map(([key, href]) => {
                  const Icon = SOCIAL_ICONS[key];
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[key] ?? key}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-foreground/15 text-ink-foreground transition-colors hover:bg-ink-foreground/10"
                    >
                      {Icon ? <Icon width={16} height={16} strokeWidth={1.5} aria-hidden /> : null}
                    </a>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-foreground/15 pt-8 text-sm text-ink-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Wordmark className="w-20" />
            <LanguagePicker
              locale={locale}
              onChange={setLocale}
              className="text-ink-foreground hover:text-ink-foreground"
            />
          </div>
          <div className="flex flex-col gap-2 md:text-end">
            <p>© {year} {t('marketing.footer.rights')}</p>
            <p>
              {t('marketing.footer.brandOf')}{' '}
              <span dir="ltr">{company.legalName} · {company.address.join(', ')}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
