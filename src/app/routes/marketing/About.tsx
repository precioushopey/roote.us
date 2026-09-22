import { useT } from '@/i18n/LocaleProvider';
import {
  Hero,
  Section,
  SectionIntro,
  DisplayTitle,
  Prose,
  Button,
  MediaPlaceholder,
  CtaSection,
} from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';

/** /about — rebuilt from the `marketing.about.*` message set, which survived
 *  the 2026-09-10 redesign consolidation even though the page component
 *  itself was removed then. No new copy invented here; every string below
 *  already existed (and was six-locale complete) before this page did. */
export function About() {
  const t = useT();

  const problems = [
    { title: t('marketing.about.problem.p1Title'), body: t('marketing.about.problem.p1Body') },
    { title: t('marketing.about.problem.p2Title'), body: t('marketing.about.problem.p2Body') },
    { title: t('marketing.about.problem.p3Title'), body: t('marketing.about.problem.p3Body') },
  ];
  const benefits = [
    { title: t('marketing.about.benefits.b1Title'), body: t('marketing.about.benefits.b1Body') },
    { title: t('marketing.about.benefits.b2Title'), body: t('marketing.about.benefits.b2Body') },
    { title: t('marketing.about.benefits.b3Title'), body: t('marketing.about.benefits.b3Body') },
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
      <Hero
        title={t('marketing.about.hero.title')}
        body={t('marketing.about.mission.body')}
        cta={
          <Button to={EXTERNAL_ASSESSMENT_URL} external caps className="w-full sm:w-auto">
            {t('marketing.nav.cta')}
          </Button>
        }
      />

      <Section tone="cream" width="content" gap={8}>
        <SectionIntro eyebrow={t('marketing.about.problem.eyebrow')} title={t('marketing.about.problem.heading')} />
        <div className="grid gap-8 sm:grid-cols-3">
          {problems.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <p className="font-display text-lg text-foreground">{p.title}</p>
              <Prose>{p.body}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="grid" width="content" gap={12} className="-mt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <SectionIntro
              eyebrow={t('marketing.about.solution.eyebrow')}
              title={t('marketing.about.solution.heading')}
              body={t('marketing.about.solution.body')}
            />
          </div>
          <MediaPlaceholder
            alt={t('marketing.about.solution.mediaAlt')}
            label="About: the assessment-to-plan flow, editorial photography"
            ratio="4 / 3"
          />
        </div>
      </Section>

      <Section tone="cream" width="content" gap={8} className="-mt-24">
        <SectionIntro eyebrow={t('marketing.about.benefits.eyebrow')} title={t('marketing.about.benefits.heading')} />
        <div className="grid gap-8 sm:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="flex flex-col gap-2">
              <p className="font-display text-lg text-foreground">{b.title}</p>
              <Prose>{b.body}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="grid" width="content" gap={8} className="-mt-24">
        <SectionIntro eyebrow={t('marketing.about.comparison.eyebrow')} title={t('marketing.about.comparison.heading')} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-border text-start text-muted-foreground">
                <th className="py-3 text-start font-medium">&nbsp;</th>
                <th className="py-3 text-start font-medium">{t('marketing.about.comparison.colGeneric')}</th>
                <th className="py-3 text-start font-medium text-accent">{t('marketing.about.comparison.colOurs')}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-border/60">
                  <td className="py-3 font-medium text-foreground">{row.label}</td>
                  <td className="py-3 text-muted-foreground">{row.generic}</td>
                  <td className="py-3 text-foreground">{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="cream" width="content" gap={12} className="-mt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <DisplayTitle as="h2" step="lg">
              {t('marketing.about.story.title')}
            </DisplayTitle>
            <Prose>{t('marketing.about.story.body')}</Prose>
          </div>
          <MediaPlaceholder
            alt={t('marketing.about.story.mediaAlt')}
            label="About: founder/origin story, editorial photography"
            ratio="4 / 5"
          />
        </div>
      </Section>

      <CtaSection title={t('marketing.about.cta.title')} />
    </>
  );
}
