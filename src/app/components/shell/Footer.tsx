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
    title: 'marketing.footer.explore',
    links: [
      [PATHS.howItWorks, 'marketing.nav.howItWorks'],
      [PATHS.science, 'marketing.nav.science'],
      [PATHS.system, 'marketing.nav.system'],
    ],
  },
  {
    title: 'marketing.footer.company',
    links: [
      [PATHS.about, 'marketing.nav.about'],
      [PATHS.faq, 'marketing.nav.faq'],
      [PATHS.support, 'marketing.nav.support'],
    ],
  },
  {
    title: 'marketing.footer.account',
    links: [
      [PATHS.account, 'marketing.nav.account'],
      [PATHS.analysis, 'marketing.nav.cta'],
    ],
  },
];

const SOLUTION_LINKS: Array<[to: string, label: string]> = [
  [PATHS.solutionThinning, 'thinning'],
  [PATHS.solutionGray, 'gray'],
  [PATHS.products, 'products'],
];

export function Footer() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const { locale, country, setLocale, setLocaleRegion } = useLocale();
  const year = new Date().getFullYear();
  const { company } = rooteContent;

  const onChangeCountry = (c: string) => {
    setLocaleRegion(countryDefault(c).locale, c);
  };

  const legalLinks = [
    ...LEGAL_PAGES.map((p) => ({ key: p.slug, to: PATHS.legal(p.slug), label: pickLocalized(p.title, cl) })),
    { key: 'terms-of-sale', to: '/terms-of-sale', label: t('marketing.footer.termsOfSale') },
  ];
  const legalMid = Math.ceil(legalLinks.length / 2);
  const legalColumns = [legalLinks.slice(0, legalMid), legalLinks.slice(legalMid)];

  return (
    <footer className="border-t border-ink-foreground/15 bg-ink px-6 py-16 text-ink-foreground md:px-10">
      <div className="mx-auto max-w-[80rem]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={t(col.title)}>
              <h2 className="u-caps font-body text-2xs font-semibold text-ink-foreground/60">{t(col.title)}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map(([to, label]) => (
                  <li key={to + label}>
                    <Link to={withLocale(to)} className="font-body text-sm text-ink-foreground hover:text-gold-500">
                      {t(label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label={t('marketing.footer.solutions')}>
            <h2 className="u-caps font-body text-2xs font-semibold text-ink-foreground/60">
              {t('marketing.footer.solutions')}
            </h2>
            <ul className="mt-3 space-y-2">
              {SOLUTION_LINKS.map(([to, kind]) => (
                <li key={to}>
                  <Link to={withLocale(to)} className="font-body text-sm text-ink-foreground hover:text-gold-500">
                    {kind === 'products'
                      ? t('marketing.nav.products')
                      : pickLocalized(CONCERN_OPTIONS.find((c) => c.value === kind)!.title, cl)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {legalColumns.map((links, i) => (
            <nav key={i} aria-label={t('marketing.footer.legal')}>
              <h2
                aria-hidden={i > 0 || undefined}
                className={`u-caps font-body text-2xs font-semibold text-ink-foreground/60 ${i > 0 ? 'opacity-0' : ''}`}
              >
                {t('marketing.footer.legal')}
              </h2>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.key}>
                    <Link to={withLocale(link.to)} className="font-body text-sm text-ink-foreground hover:text-gold-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-foreground/15 pt-8 text-xs text-ink-foreground/60 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Wordmark className="w-20" onInk />
            <CountryLanguageSelector
              country={country}
              locale={locale as LocaleCode}
              onChangeCountry={onChangeCountry}
              onChangeLocale={(l) => setLocale(l)}
              className="text-ink-foreground/60 hover:text-ink-foreground"
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
