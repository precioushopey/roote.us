import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  TextLink,
  ScanCard,
  Accordion,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { HOME_FAQS } from '@/content/faqs';
import howItWorksHero from '@/assets/images/how-it-works-hero.png';
import step1Quiz from '@/assets/images/step-1-quiz.png';
import step2Scan from '@/assets/images/step-2-scan.png';
import step3Formula from '@/assets/images/step-3-formula.png';
import step4Progress from '@/assets/images/step-4-progress.png';

export function HowItWorks() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const steps = [
    {
      title: t('marketing.howItWorks.step1.title'),
      body: t('marketing.howItWorks.step1.body'),
      mediaAlt: t('marketing.howItWorks.step1MediaAlt'),
      image: step1Quiz,
    },
    {
      title: t('marketing.howItWorks.step2.title'),
      body: t('marketing.howItWorks.step2.body'),
      mediaAlt: t('marketing.howItWorks.step2MediaAlt'),
      image: step2Scan,
    },
    {
      title: t('marketing.howItWorks.step3.title'),
      body: t('marketing.howItWorks.step3.body'),
      mediaAlt: t('marketing.howItWorks.step3MediaAlt'),
      image: step3Formula,
    },
    {
      title: t('marketing.howItWorks.step4.title'),
      body: t('marketing.howItWorks.step4.body'),
      mediaAlt: t('marketing.howItWorks.step4MediaAlt'),
      image: step4Progress,
    },
  ];
  const phases = [
    {
      n: 1,
      action: t('marketing.howItWorks.timeline.m1Action'),
      duration: t('marketing.howItWorks.timeline.m1'),
      bullets: [t('marketing.howItWorks.timeline.m1Bullet1'), t('marketing.howItWorks.timeline.m1Bullet2')],
    },
    {
      n: 2,
      action: t('marketing.howItWorks.timeline.m3Action'),
      duration: t('marketing.howItWorks.timeline.m3'),
      bullets: [t('marketing.howItWorks.timeline.m3Bullet1'), t('marketing.howItWorks.timeline.m3Bullet2')],
    },
    {
      n: 3,
      action: t('marketing.howItWorks.timeline.m6Action'),
      duration: t('marketing.howItWorks.timeline.m6'),
      bullets: [t('marketing.howItWorks.timeline.m6Bullet1'), t('marketing.howItWorks.timeline.m6Bullet2')],
    },
  ];

  return (
    <>
      <Section tone="teal" width="content" animate={false}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow onDark className="rounded-full border border-gold-500 px-4 py-1.5">
              {t('marketing.nav.howItWorks')}
            </Eyebrow>
            <DisplayTitle as="h1" step="lg" onDark>
              {t('marketing.howItWorks.hero.title')}
            </DisplayTitle>
            <Prose onDark size="lg" className="max-w-lg">
              {t('marketing.howItWorks.hero.body')}
            </Prose>
            <Button
              to={withLocale(PATHS.analysis)}
              size="lg"
              caps
              className="bg-gold-500 text-ink text-sm md:text-base font-bold hover:bg-gold-600"
            >
              {t('marketing.nav.cta')}
            </Button>
          </div>
          <img
            src={howItWorksHero}
            alt={t('marketing.howItWorks.heroMediaAlt')}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="flex items-start justify-between gap-4">
          <DisplayTitle as="h2" step="lg" className="max-w-2xl">
            {t('marketing.nav.howItWorks')}
          </DisplayTitle>
          <TextLink to={withLocale(PATHS.products)} className="mt-2 shrink-0">
            {t('marketing.nav.products')}
          </TextLink>
        </div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3">
              <img
                src={step.image}
                alt={step.mediaAlt}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-500 font-display text-xs text-accent">
                  {i + 1}
                </span>
                <p className="font-display text-lg font-medium text-foreground">{step.title}</p>
              </div>
              <Prose>{step.body}</Prose>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid items-center gap-10 border-t border-border pt-16 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <Eyebrow>{t('marketing.home.analysis.eyebrow')}</Eyebrow>
            <DisplayTitle as="h3" step="md" className="mt-1 max-w-lg">
              {t('marketing.home.analysis.heading')}
            </DisplayTitle>
            <Prose size="lg" className="max-w-lg">
              {t('marketing.home.analysis.body')}
            </Prose>
            <Button to={withLocale(PATHS.analysis)} size="lg" className="mt-2">
              {t('marketing.nav.cta')}
            </Button>
          </div>
          <ScanCard
            title={t('marketing.home.analysis.cardTitle')}
            rows={[
              { label: t('marketing.home.analysis.rowDensity'), value: null, pendingLabel: 'density' },
              { label: t('marketing.home.analysis.rowPattern'), value: null, pendingLabel: 'pattern' },
              { label: t('marketing.home.analysis.rowProgression'), value: null, pendingLabel: 'progression' },
            ]}
            footnote={t('marketing.home.analysis.disclaimer')}
          />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="lg" className="max-w-2xl">
          {t('marketing.howItWorks.timeline.title')}
        </DisplayTitle>
        <ol className="relative mt-12 grid gap-10 sm:grid-cols-3">
          <span aria-hidden className="absolute left-[10%] right-[10%] top-5 hidden h-px bg-gold-500/40 sm:block" />
          {phases.map((phase) => (
            <li key={phase.action} className="relative flex flex-col gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500 bg-background font-display text-sm text-accent">
                {String(phase.n).padStart(2, '0')}
              </span>
              <div>
                <p className="font-display text-lg font-medium text-foreground">{phase.action}</p>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-accent">{phase.duration}</p>
              </div>
              <ul className="flex flex-col gap-1.5 font-body text-sm text-muted-foreground">
                {phase.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl font-body text-xs text-muted-foreground">
          {t('marketing.howItWorks.timeline.shedding')}
        </p>
      </Section>

      <Section tone="cream" width="readable">
        <Eyebrow>{t('marketing.home.faq.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="md" className="mt-2">
          {t('marketing.howItWorks.faq.title')}
        </DisplayTitle>
        <Accordion
          className="mt-10"
          items={HOME_FAQS.map((f) => ({
            id: f.id,
            title: pickLocalized(f.q, cl),
            body: pickLocalized(f.a, cl),
          }))}
        />
      </Section>

      <Section tone="teal" width="readable" className="border-b border-gold-500 text-center">
        <DisplayTitle as="h2" step="lg" onDark align="center">
          {t('marketing.howItWorks.cta.title')}
        </DisplayTitle>
        <div className="mt-6 flex justify-center">
          <Button
            to={withLocale(PATHS.analysis)}
            size="lg"
            caps
            className="bg-gold-500 text-ink text-sm md:text-base font-bold hover:bg-gold-600"
          >
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}
