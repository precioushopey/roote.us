import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';

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
    ],
  },
  {
    title: 'marketing.footer.company',
    links: [
      ['/about', 'marketing.nav.about'],
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
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
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

          <div className="col-span-2 md:col-span-1">
            <h2 className="text-sm font-medium tracking-wide text-foreground">
              {t('marketing.footer.startTitle')}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t('marketing.footer.startBody')}
            </p>
            <Link
              to="/diagnosis"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground sm:w-auto"
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
        </div>
      </div>
    </footer>
  );
}
