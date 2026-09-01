import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Wordmark } from '@/app/components/brand/Wordmark';
import productLineup from '@/assets/product-lineup.jpg';
import scanDevice from '@/assets/scan-device.jpg';

const SERIF = "'Spectral', 'Libre Franklin', serif";

function HeroBadge({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <div className="absolute -top-4 -end-4 flex h-20 w-20 flex-col items-center justify-center rounded-full border border-accent bg-background text-center shadow-sm">
      <span className="text-[8px] font-medium uppercase tracking-wide text-accent">{line1}</span>
      <span className="text-[8px] font-medium uppercase tracking-wide text-accent">{line2}</span>
    </div>
  );
}

export function Hero() {
  const t = useT();
  return (
    <section className="px-6 pb-20 pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">{t('landing.eyebrow')}</p>
          <Wordmark className="w-52 sm:w-64" />
          <h1 className="text-3xl leading-tight text-foreground sm:text-4xl" style={{ fontFamily: SERIF }}>
            {t('landing.hero.headline')} <em className="text-accent">{t('landing.hero.headlineAccent')}</em>
          </h1>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">{t('landing.hero.tagline')}</p>
          <div className="flex flex-col items-start gap-2">
            <Link
              to="/diagnosis"
              className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-sm tracking-wide text-primary-foreground"
            >
              {t('landing.cta')}
            </Link>
            <p className="text-xs text-muted-foreground">{t('landing.hero.subCta')}</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <img src={productLineup} alt="" className="h-64 w-full object-cover sm:h-80" />
          </div>
          <div className="absolute -bottom-8 -start-6 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-md sm:w-48">
            <img src={scanDevice} alt="" className="h-28 w-full object-cover sm:h-32" />
            <p className="px-3 py-2 text-[10px] leading-snug text-muted-foreground">{t('landing.hero.insetCaption')}</p>
          </div>
          <HeroBadge line1={t('landing.hero.badgeLine1')} line2={t('landing.hero.badgeLine2')} />
        </div>
      </div>
    </section>
  );
}

export function PlanTeaser() {
  const t = useT();
  const steps = [t('landing.planTeaser.step1'), t('landing.planTeaser.step2'), t('landing.planTeaser.step3')];
  return (
    <section className="border-y border-border bg-secondary/40 px-6 py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.planTeaser.title')}</h2>
        <p className="max-w-xl text-sm text-muted-foreground">{t('landing.planTeaser.body')}</p>
        <ol className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center justify-center gap-2 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
        <Link to="/diagnosis" className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
          {t('landing.cta')}
        </Link>
      </div>
    </section>
  );
}

function DotIcon() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />;
}

export function TrustStrip() {
  const t = useT();
  const items = [t('landing.trust.item1'), t('landing.trust.item2'), t('landing.trust.item3')];
  return (
    <section className="px-6 py-8">
      <ul className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center text-xs uppercase tracking-wide text-muted-foreground sm:flex-row sm:justify-center sm:gap-8">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <DotIcon />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HowItWorks() {
  const t = useT();
  const steps = [
    { title: t('landing.howItWorks.step1.title'), body: t('landing.howItWorks.step1.body') },
    { title: t('landing.howItWorks.step2.title'), body: t('landing.howItWorks.step2.body') },
    { title: t('landing.howItWorks.step3.title'), body: t('landing.howItWorks.step3.body') },
    { title: t('landing.howItWorks.step4.title'), body: t('landing.howItWorks.step4.body') },
  ];
  return (
    <section id="how-it-works" className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.howItWorks.title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('landing.howItWorks.subtitle')}</p>
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-5 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent text-sm text-accent">
                {i + 1}
              </span>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
