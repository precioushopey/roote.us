import { Link } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';
import { resolveLocalized } from '@/content/resolveLocalized';
import { rooteContent } from '@/content/roote.config';

type LinkColumn = {
  title: MessageKey;
  links: Array<[to: string, label: MessageKey]>;
};

const LINK_COLUMNS: LinkColumn[] = [
  {
    title: 'marketing.footer.explore',
    links: [
      ['/how-it-works', 'marketing.nav.howItWorks'],
      ['/science', 'marketing.nav.science'],
      ['/products', 'marketing.nav.products'],
      ['/results', 'marketing.nav.results'],
    ],
  },
  {
    title: 'marketing.footer.company',
    links: [
      ['/about', 'marketing.nav.about'],
      ['/blog', 'marketing.nav.blog'],
      ['/support', 'marketing.nav.support'],
      ['/faq', 'marketing.nav.faq'],
    ],
  },
  {
    title: 'marketing.footer.legal',
    links: [
      ['/terms', 'marketing.footer.terms'],
      ['/privacy', 'marketing.footer.privacy'],
    ],
  },
];

export function Footer() {
  const t = useT();
  const { locale } = useLocale();
  const year = new Date().getFullYear();
  const disclaimer = resolveLocalized(
    rooteContent.disclaimers.medical,
    locale,
    'footer medical disclaimer',
  );

  return (
    <footer className="border-t border-border px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          {LINK_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={t(column.title)}>
              <h2 className="text-sm font-medium tracking-wide text-foreground">
                {t(column.title)}
              </h2>
              <ul className="mt-4 space-y-2">
                {column.links.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm text-muted-foreground">
                      {t(label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-sm font-medium tracking-wide text-foreground">
              {t('marketing.footer.startTitle')}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('marketing.footer.startBody')}
            </p>
            <Link
              to="/diagnosis"
              className="mt-3 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
            >
              {t('marketing.nav.cta')}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <Wordmark className="w-20" />
          <LocaleToggle />
          <p>
            © {year} ROOTÉ · {t('marketing.footer.rights')}
          </p>
          {isPending(disclaimer) ? (
            <PendingChip label={disclaimer.label} />
          ) : (
            <p className="max-w-xl">{disclaimer}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
