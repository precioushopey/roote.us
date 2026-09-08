import { useT, useContentLocale } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Eyebrow, Button, Timeline, Card } from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { systemSteps } from '@/content/brand';
import type { MessageKey } from '@/i18n/messages';

const PILLARS: Array<{ titleKey: MessageKey; bodyKey: MessageKey }> = [
  { titleKey: 'marketing.sys.pillar.analyze', bodyKey: 'marketing.sys.pillar.analyzeBody' },
  { titleKey: 'marketing.sys.pillar.treat', bodyKey: 'marketing.sys.pillar.treatBody' },
  { titleKey: 'marketing.sys.pillar.track', bodyKey: 'marketing.sys.pillar.trackBody' },
];

/** "Our system" — the Analyze → Treat → Track model + the tracking journey
 *  that continues after checkout (brief §11 §10, §17). */
export function SystemPage() {
  const t = useT();
  const cl = useContentLocale();

  const milestones = [
    { id: 'd0', dayLabel: t('marketing.sys.day', { n: 0 }), title: t('marketing.home.progress.baseline'), state: 'done' as const },
    { id: 'd30', dayLabel: t('marketing.sys.day', { n: 30 }), title: t('marketing.home.progress.progressPhoto'), state: 'done' as const },
    { id: 'd60', dayLabel: t('marketing.sys.day', { n: 60 }), title: t('marketing.home.progress.progressPhoto'), state: 'current' as const },
    { id: 'd90', dayLabel: t('marketing.sys.day', { n: 90 }), title: t('marketing.home.progress.progressScan'), state: 'upcoming' as const },
    { id: 'd120', dayLabel: t('marketing.sys.day', { n: 120 }), title: t('marketing.home.progress.progressPhoto'), state: 'upcoming' as const },
    { id: 'd180', dayLabel: t('marketing.sys.day', { n: 180 }), title: t('marketing.home.progress.finalScan'), state: 'upcoming' as const },
  ];

  return (
    <>
      <Section tone="teal" width="content" animate={false} className="text-center">
        <Eyebrow onDark className="rounded-full border border-gold-500 px-4 py-1.5">
          {t('marketing.nav.system')}
        </Eyebrow>
        <DisplayTitle as="h1" step="lg" onDark align="center" className="mx-auto mt-2 max-w-2xl">
          {t('marketing.sys.heading')}
        </DisplayTitle>
        <Prose onDark size="lg" className="mx-auto mt-4 text-center">
          {t('marketing.sys.body')}
        </Prose>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="md">
          {t('marketing.home.how.heading')}
        </DisplayTitle>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {systemSteps.map((step) => (
            <li key={step.key} className="flex flex-col gap-2">
              <span className="font-display text-2xl text-accent">{String(step.n).padStart(2, '0')}</span>
              <p className="font-display text-md text-foreground">{pickLocalized(step.title, cl)}</p>
              <p className="font-body text-sm text-muted-foreground">{pickLocalized(step.body, cl)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="grid" width="content">
        <Eyebrow>{t('marketing.home.progress.eyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="md" className="mt-2 max-w-2xl">
          {t('marketing.home.progress.heading')}
        </DisplayTitle>
        <Prose className="mt-3 max-w-2xl">{t('marketing.sys.trackBody')}</Prose>
        <div className="mt-8 max-w-md">
          <Timeline milestones={milestones} />
        </div>
      </Section>

      <Section tone="cream" width="content">
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Card key={p.titleKey}>
              <p className="font-display text-xl text-accent">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-1 font-display text-md text-foreground">{t(p.titleKey)}</p>
              <p className="mt-2 font-body text-sm text-muted-foreground">{t(p.bodyKey)}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="readable" className="border-b border-gold-500 text-center">
        <DisplayTitle as="h2" step="lg" onDark align="center">
          {t('marketing.sys.ctaHeading')}
        </DisplayTitle>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}
