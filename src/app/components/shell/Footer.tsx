import { Link } from 'react-router';
import { useT, useContentLocale, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { rooteContent } from '@/content/roote.config';
import { LEGAL_PAGES } from '@/content/legal';
import { CONCERN_OPTIONS } from '@/content/assessment';
import { pickLocalized } from '@/content/localized';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { CountryLanguageSelector } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { countryDefault, type LocaleCode } from '@/i18n/locales';

type Col = { title: MessageKey; links: Array<[to: string, label: MessageKey]> };

const COLUMNS: Col[] = [
  {
    title: 'marketing.footer.company',
    links: [
      [PATHS.home, 'marketing.nav.home'],
      [PATHS.magazine, 'marketing.nav.magazine'],
      [PATHS.products, 'marketing.nav.products'],
      [PATHS.hairScan, 'marketing.nav.aiSection'],
      [PATHS.faq, 'marketing.nav.faq'],
    ],
  },
];

const ACCOUNT_LINKS: Col['links'] = [
  [PATHS.support, 'marketing.nav.support'],
  [PATHS.account, 'marketing.nav.account'],
  [PATHS.bag, 'marketing.nav.bag'],
];

/** 'thinning' / 'gray' resolve via CONCERN_OPTIONS (localized). */
const SOLUTION_LINKS: Array<[to: string, kind: string]> = [
  [PATHS.solutionThinning, 'thinning'],
  [PATHS.solutionGray, 'gray'],
];

/** The legal links list is split into two columns purely so it doesn't run
 *  too tall in one column — each half gets its own real heading (not a
 *  second hidden "Legal" label) since they read as two distinct groups:
 *  purchase-facing policies vs. program/compliance policies. */
const LEGAL_COLUMN_TITLES: [MessageKey, MessageKey] = ['marketing.footer.legal', 'marketing.footer.policies'];

/** Icon paths are simple, brand-agnostic glyphs (24x24, stroke style matching the
 *  Header's icon set) — swap for the real brand marks if the client prefers those. */
const SOCIAL_ICONS: Record<string, JSX.Element> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14 21v-8h2.5l.5-3H14V8c0-.9.3-1.5 1.6-1.5H17V4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V10H8v3h3v8h3Z" />,
  tiktok: <path d="M14 3c.3 2 1.6 3.4 3.6 3.7v2.6c-1.3 0-2.5-.4-3.6-1.1v6.3c0 3-2.4 5-5.2 5-2.9 0-5.2-2.2-5.2-5s2.4-5 5.2-5c.3 0 .6 0 .9.1v2.7a2.5 2.5 0 1 0 1.8 2.4V3Z" />,
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
    </>
  ),
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export function Footer() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const { locale, country, setLocale, setLocaleRegion } = useLocale();
  const year = new Date().getFullYear();
  const { company, brand } = rooteContent;
  const socialLinks = Object.entries(brand.social).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );

  const onChangeCountry = (c: string) => {
    setLocaleRegion(countryDefault(c).locale, c);
  };

  const getStartedLinks = [
    ...SOLUTION_LINKS.map(([to, kind]) => ({
      to,
      label: pickLocalized(CONCERN_OPTIONS.find((c) => c.value === kind)!.title, cl),
    })),
    ...ACCOUNT_LINKS.map(([to, label]) => ({ to, label: t(label) })),
  ];

  const legalLinks = [
    ...LEGAL_PAGES.map((p) => ({ key: p.slug, to: PATHS.legal(p.slug), label: pickLocalized(p.title, cl) })),
    { key: 'terms-of-sale', to: '/terms-of-sale', label: t('marketing.footer.termsOfSale') },
  ];
  const legalMid = Math.ceil(legalLinks.length / 2);
  const legalColumns = [legalLinks.slice(0, legalMid), legalLinks.slice(legalMid)];

  return (
    // bg-cream-100, not bg-ink (taupe) — the taupe anchor tone is too close
    // in value to the gold wordmark rendered below for it to read; see
    // src/app/components/brand/Wordmark.tsx.
    <footer className="border-t border-ink-foreground/15 bg-cream-100 px-6 py-16 text-ink-foreground md:px-10">
      <div className="mx-auto max-w-[80rem]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
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

          {legalColumns.map((links, i) => (
            <nav key={i} aria-label={t(LEGAL_COLUMN_TITLES[i])}>
              <h2 className="u-caps font-body text-sm font-semibold text-ink-foreground">
                {t(LEGAL_COLUMN_TITLES[i])}
              </h2>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.key}>
                    <Link to={withLocale(link.to)} className="font-body text-sm text-ink-foreground hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {socialLinks.length > 0 && (
          <nav aria-label={t('marketing.footer.social')} className="mt-10 flex items-center gap-4">
            {socialLinks.map(([key, href]) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LABELS[key] ?? key}
                className="flex h-9 w-9 items-center justify-center rounded-xs text-ink-foreground transition-colors hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  {SOCIAL_ICONS[key]}
                </svg>
              </a>
            ))}
          </nav>
        )}

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-foreground/15 pt-8 text-sm text-ink-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Wordmark className="w-20" />
            <CountryLanguageSelector
              country={country}
              locale={locale as LocaleCode}
              onChangeCountry={onChangeCountry}
              onChangeLocale={(l) => setLocale(l)}
              className="text-ink-foreground hover:text-ink-foreground"
              labels={{
                open: t('marketing.region.trigger'),
                title: t('marketing.region.title'),
                region: t('marketing.region.regionLabel'),
                language: t('marketing.region.languageLabel'),
                done: t('marketing.region.done'),
              }}
            />
          </div>
          <div className="flex flex-col gap-1 md:text-end">
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
