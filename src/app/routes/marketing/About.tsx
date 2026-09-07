import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Eyebrow, Button } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import favicon from '@/assets/favicon.png';
import scanBaseline from '@/assets/images/scan-baseline.png';
import step2Scan from '@/assets/images/step-2-scan.png';

export function About() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const problems = [
    { title: t('marketing.about.problem.p1Title'), body: t('marketing.about.problem.p1Body') },
    { title: t('marketing.about.problem.p2Title'), body: t('marketing.about.problem.p2Body') },
    { title: t('marketing.about.problem.p3Title'), body: t('marketing.about.problem.p3Body') },
  ];
  const promises = [
    { title: t('marketing.about.promise.p1Title'), body: t('marketing.about.promise.p1Body') },
    { title: t('marketing.about.promise.p2Title'), body: t('marketing.about.promise.p2Body') },
    { title: t('marketing.about.promise.p3Title'), body: t('marketing.about.promise.p3Body') },
  ];
  const comparisonRows = [
    {
      label: t('marketing.about.comparison.row1Label'),
      generic: t('marketing.about.comparison.row1Generic'),
      ours: t('marketing.about.comparison.row1Ours'),
    },
    {
      label: t('marketing.about.comparison.row2Label'),
      generic: t('marketing.about.comparison.row2Generic'),
      ours: t('marketing.about.comparison.row2Ours'),
    },
    {
      label: t('marketing.about.comparison.row3Label'),
      generic: t('marketing.about.comparison.row3Generic'),
      ours: t('marketing.about.comparison.row3Ours'),
    },
    {
      label: t('marketing.about.comparison.row4Label'),
      generic: t('marketing.about.comparison.row4Generic'),
      ours: t('marketing.about.comparison.row4Ours'),
    },
  ];

  return (
    <>
      <Section tone="teal" width="content" animate={false}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow onDark className="rounded-full border border-gold-500 px-4 py-1.5">
              {t('marketing.nav.about')}
            </Eyebrow>
            <DisplayTitle as="h1" step="lg" onDark>
              {t('marketing.about.hero.title')}
            </DisplayTitle>
            <Prose onDark size="lg" className="max-w-lg">
              {t('marketing.about.mission.body')}
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
            src={favicon}
            alt={t('marketing.about.heroMediaAlt')}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.about.problem.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.about.problem.heading')}
        </DisplayTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {problems.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <p className="font-display text-md text-foreground">{p.title}</p>
              <Prose>{p.body}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <Eyebrow>{t('marketing.about.solution.eyebrow')}</Eyebrow>
            <DisplayTitle as="h2" step="lg" className="mt-1 max-w-lg">
              {t('marketing.about.solution.heading')}
            </DisplayTitle>
            <Prose size="lg" className="max-w-lg">
              {t('marketing.about.solution.body')}
            </Prose>
          </div>
          <img
            src={step2Scan}
            alt={t('marketing.about.solution.mediaAlt')}
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.about.comparison.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.about.comparison.heading')}
        </DisplayTitle>
        <div className="mt-10 overflow-x-auto">
          <div className="min-w-[36rem] overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-3 border-b border-border bg-cream-200">
              <div className="p-4" />
              <div className="p-4 font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('marketing.about.comparison.colGeneric')}
              </div>
              <div className="p-4 font-body text-xs font-semibold uppercase tracking-wide text-accent">
                {t('marketing.about.comparison.colOurs')}
              </div>
            </div>
            {comparisonRows.map((row) => (
              <div key={row.label} className="grid grid-cols-3 border-b border-border last:border-b-0">
                <div className="p-4 font-body text-sm font-medium text-foreground">{row.label}</div>
                <div className="p-4 font-body text-sm text-muted-foreground">{row.generic}</div>
                <div className="p-4 font-body text-sm text-foreground">{row.ours}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="cream" width="content" className="overflow-hidden">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <DisplayTitle as="h2" step="md" className="max-w-xl">
              {t('marketing.about.story.title')}
            </DisplayTitle>
            <Prose size="lg" className="max-w-xl">{t('marketing.about.story.body')}</Prose>
          </div>
          <img
            src={scanBaseline}
            alt={t('marketing.about.story.mediaAlt')}
            className="aspect-[4/5] w-full rounded-2xl object-cover lg:ms-auto lg:max-w-md"
          />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.about.promise.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.about.promise.heading')}
        </DisplayTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {promises.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <p className="font-display text-md text-foreground">{p.title}</p>
              <Prose>{p.body}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="readable" className="border-b border-gold-500 text-center">
        <DisplayTitle as="h2" step="lg" onDark align="center">
          {t('marketing.about.cta.title')}
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
