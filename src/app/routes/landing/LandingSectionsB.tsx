import { Link } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import type { MessageKey } from '@/i18n/messages';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending, PENDING, type PendingMarker } from '@/content/pending';
import { rooteContent, type LocalizedText } from '@/content/roote.config';
import productLineup from '@/assets/product-lineup.png';
import scalpBefore from '@/assets/scalp-before.jpg';
import scalpAfter from '@/assets/scalp-after.jpg';
import hairCuticle from '@/assets/hair-cuticle.jpg';

/** Same fallback rule as buildReport's private resolveLocalized: an empty translation is unresolved, not blank. */
function resolveLocalized(text: LocalizedText, locale: 'en' | 'he', label: string): string | PendingMarker {
  const v = text[locale];
  return v ? v : PENDING(label);
}

export function ScienceSection() {
  const t = useT();
  const stats = [t('landing.science.stat1.label'), t('landing.science.stat2.label'), t('landing.science.stat3.label')];
  const bands = [
    { label: t('severity.mild'), from: 1, to: 2 },
    { label: t('severity.moderate'), from: 3, to: 5 },
    { label: t('severity.established'), from: 6, to: 7 },
  ];
  return (
    <section id="science" className="px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.science.title')}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{t('landing.science.body')}</p>

        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((stage) => (
              <span
                key={stage}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
              >
                S{stage}
              </span>
            ))}
          </div>
          <div className="flex gap-4 text-[11px] uppercase tracking-wide text-muted-foreground">
            {bands.map((b) => (
              <span key={b.label}>{b.label}</span>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3 pt-4">
          <h3 className="text-lg font-medium" style={{ fontFamily: "'Spectral', 'Libre Franklin', serif" }}>
            {t('landing.science.progressTitle')}
          </h3>
          <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
            <div className="relative">
              <img src={scalpBefore} alt={t('landing.science.progressBefore')} className="aspect-square w-full rounded-xl border border-border object-cover" />
              <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide shadow-sm">
                {t('landing.science.progressBefore')}
              </span>
            </div>
            <div className="relative">
              <img src={scalpAfter} alt={t('landing.science.progressAfter')} className="aspect-square w-full rounded-xl border border-border object-cover" />
              <span className="absolute bottom-3 start-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide shadow-sm">
                {t('landing.science.progressAfter')}
              </span>
            </div>
          </div>
          <p className="max-w-sm text-[11px] text-muted-foreground">{t('landing.science.progressCaption')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((label) => (
            <div key={label} className="flex items-center justify-center rounded-lg border border-border bg-card p-5">
              <PendingChip label={label} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t('landing.science.footnote')}</p>
      </div>
    </section>
  );
}

const ROLE_KEYS: Record<string, MessageKey> = {
  'regrowth-stimulant': 'landing.regimen.role.regrowth-stimulant',
  'dht-blocker': 'landing.regimen.role.dht-blocker',
  'dht-support': 'landing.regimen.role.dht-support',
  'proprietary-support': 'landing.regimen.role.proprietary-support',
};

export function RegimenTeaser() {
  const t = useT();
  const { locale } = useLocale();
  return (
    <section id="plan" className="px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.regimen.title')}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{t('landing.regimen.body')}</p>

        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border">
          <img src={productLineup} alt={t('landing.regimen.imageAlt')} className="block h-auto w-full" />
          <div className="absolute inset-y-0 start-0 flex w-1/2 flex-col justify-center gap-3 p-4 sm:gap-4 sm:p-8">
            {rooteContent.formula.ingredients.map((ing) => (
              <div key={ing.key} className="text-start">
                <p className="text-xs font-medium sm:text-sm">{ing.name}</p>
                <p className="text-[10px] text-muted-foreground sm:text-[11px]">{t(ROLE_KEYS[ing.role])}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="rounded border border-dashed border-accent px-3 py-1.5 text-xs text-accent">
          {rooteContent.disclaimers.formulaPending[locale]}
        </p>
        <Link to="/diagnosis" className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
          {t('landing.cta')}
        </Link>
      </div>
    </section>
  );
}

export function CtaBanner() {
  const t = useT();
  return (
    <section className="bg-primary px-6 py-14 text-center text-primary-foreground">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.ctaBanner.title')}</h2>
        <p className="text-sm opacity-90">{t('landing.ctaBanner.body')}</p>
        <Link to="/diagnosis" className="inline-flex items-center rounded-md bg-background px-6 py-3 text-sm text-foreground">
          {t('landing.cta')}
        </Link>
      </div>
    </section>
  );
}

export function ResearchSection() {
  const t = useT();
  return (
    <section className="bg-secondary/40 px-6 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.research.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('landing.research.body')}</p>
          <Link to="/diagnosis" className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
            {t('landing.cta')}
          </Link>
        </div>
        <figure className="mx-auto w-full max-w-sm">
          <img src={hairCuticle} alt={t('landing.research.imageAlt')} className="h-64 w-full rounded-2xl border border-border object-cover shadow-sm sm:h-80" />
          <figcaption className="mt-2 text-center text-[11px] text-muted-foreground">{t('landing.research.imageCaption')}</figcaption>
        </figure>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-accent">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FinalCta() {
  const t = useT();
  const items = [t('landing.finalCta.item1'), t('landing.finalCta.item2'), t('landing.finalCta.item3')];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.finalCta.title')}</h2>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
          <Link to="/diagnosis" className="inline-flex items-center rounded-md bg-primary px-8 py-4 text-sm text-primary-foreground">
            {t('landing.cta')}
          </Link>
        </div>
        <img
          src={productLineup}
          alt=""
          className="mx-auto h-56 w-full max-w-md rounded-2xl border border-border object-cover shadow-sm sm:h-72"
        />
      </div>
    </section>
  );
}

export function Footer() {
  const t = useT();
  const { locale } = useLocale();
  const disclaimer = resolveLocalized(rooteContent.disclaimers.medical, locale, 'footer medical disclaimer (he)');
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <Wordmark className="w-24" />
        <nav className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <a href="#how-it-works">{t('landing.footer.navHowItWorks')}</a>
          <a href="#science">{t('landing.footer.navScience')}</a>
          <a href="#plan">{t('landing.footer.navPlan')}</a>
        </nav>
        {isPending(disclaimer) ? (
          <PendingChip label={disclaimer.label} />
        ) : (
          <p className="max-w-xl text-[11px] text-muted-foreground">{disclaimer}</p>
        )}
        <Link to="/diagnosis" className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
          {t('landing.cta')}
        </Link>
        <p className="text-[11px] text-muted-foreground">{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
