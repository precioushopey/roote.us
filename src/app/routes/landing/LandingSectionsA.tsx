import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import heroPeople from '@/assets/hero-people.png';
import scanDevice from '@/assets/scan-device.jpg';

const SERIF = "'Spectral', 'Libre Franklin', serif";

function SealBadge({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <div className="absolute bottom-4 start-4 flex h-20 w-20 flex-col items-center justify-center rounded-full border border-accent bg-background text-center shadow-sm sm:h-24 sm:w-24">
      <span className="text-[8px] font-medium uppercase tracking-wide text-accent sm:text-[9px]">{line1}</span>
      <span className="text-[8px] font-medium uppercase tracking-wide text-accent sm:text-[9px]">{line2}</span>
    </div>
  );
}

export function Hero() {
  const t = useT();
  return (
    <section className="pt-16">
      <div className="mx-auto grid max-w-6xl items-end gap-10 px-6 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6 pb-10">
          <h1 className="text-4xl leading-tight text-foreground sm:text-5xl" style={{ fontFamily: SERIF }}>
            {t('landing.hero.headline')} <em className="text-accent">{t('landing.hero.headlineAccent')}</em>
          </h1>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">{t('landing.hero.tagline')}</p>
          <Link
            to="/diagnosis"
            className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-sm tracking-wide text-primary-foreground"
          >
            {t('landing.cta')}
          </Link>
          <div className="flex items-center gap-3">
            <img src={scanDevice} alt="" className="h-11 w-11 shrink-0 rounded-full border border-border object-cover" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{t('landing.hero.trustBadgeTitle')}</span>
              <br />
              {t('landing.hero.trustBadgeSub')}
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <img src={heroPeople} alt="" className="w-full object-contain" />
          <SealBadge line1={t('landing.hero.badgeLine1')} line2={t('landing.hero.badgeLine2')} />
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
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <img
          src={scanDevice}
          alt=""
          className="mx-auto h-64 w-full max-w-sm rounded-2xl border border-border object-cover shadow-sm sm:h-80"
        />
        <div className="flex flex-col items-start gap-5">
          <h2 className="text-2xl font-medium sm:text-3xl">{t('landing.planTeaser.title')}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{t('landing.planTeaser.body')}</p>
          <ol className="flex flex-col gap-2">
            {steps.map((label, i) => (
              <li key={label} className="flex items-center gap-2 text-sm">
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
        <div className="mt-10 flex justify-center">
          <Link to="/diagnosis" className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
            {t('landing.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
