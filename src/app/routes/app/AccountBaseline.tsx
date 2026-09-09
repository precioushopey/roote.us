import { useT, useContentLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Prose, Card, Badge, ScanCard } from '@/app/components/roote';
import { qualitativeMetrics } from '@/domain/tracking/metrics';
import { PHOTO_ANGLES } from '@/content/assessment';
import { pickLocalized } from '@/content/localized';
import { METRIC_LABEL, METRIC_LABEL_FALLBACK } from './metricLabels';
import { useUserProgram } from './useUserProgram';

/** Baseline / BEFORE state (spec §4) — day 0 photos + the initial qualitative
 *  analysis, clearly labelled as the starting point. */
export function AccountBaseline() {
  const t = useT();
  const cl = useContentLocale();
  const session = useSession();
  const view = useUserProgram();
  if (!view) return null;
  const { userProgram: up } = view;

  const metrics = qualitativeMetrics({
    analysis: session.analysis,
    grayProfile: session.grayProfile,
    provider: 'mock',
    isMock: true,
    capturedAt: `${up.startDate}T00:00:00Z`,
  });

  const photoLabel = (angle: string) => pickLocalized(PHOTO_ANGLES.find((a) => a.angle === angle)!.title, cl);

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="u-caps font-body text-sm font-semibold text-accent">{t('marketing.sys.day', { n: 0 })}</p>
          <DisplayTitle as="h1" step="sm">
            {t('app.baseline.title')}
          </DisplayTitle>
        </div>
        <Badge tone="neutral">{t('app.baseline.badge')}</Badge>
      </header>

      <Card>
        <dl className="grid gap-2 font-body text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('app.baseline.date')}</dt>
            <dd className="text-foreground">{up.startDate}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('app.baseline.programStart')}</dt>
            <dd className="text-foreground">{up.startDate}</dd>
          </div>
        </dl>
      </Card>

      <section>
        <h2 className="font-display text-md text-foreground">{t('app.baseline.photos')}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PHOTO_ANGLES.map(({ angle }) => {
            const p = session.diagnosis.photos.find((x) => x.angleKey === angle);
            return (
              <figure key={angle} className="overflow-hidden rounded-lg border border-border bg-cream-100">
                <div className="aspect-square w-full">
                  {p ? (
                    <img src={p.thumb} alt={photoLabel(angle)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-center font-body text-sm text-muted-foreground">
                      {t('app.photos.notYet')}
                    </div>
                  )}
                </div>
                <figcaption className="px-2 py-1.5 font-body text-sm text-muted-foreground">{photoLabel(angle)}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <ScanCard
        title={t('app.baseline.analysisTitle')}
        rows={metrics.map((m) => ({
          label: t(METRIC_LABEL[m.key] ?? METRIC_LABEL_FALLBACK),
          value: t(m.status as 'severity.mild'),
        }))}
        footnote={session.diagnosis.hairGoal ? undefined : t('analysis.results.consentLine')}
      />
      <Prose size="sm">{t('app.baseline.metricsNote')}</Prose>
    </div>
  );
}
