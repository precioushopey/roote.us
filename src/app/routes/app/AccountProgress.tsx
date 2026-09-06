import { useMemo, useState } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { DisplayTitle, Prose, Card, Button, Badge, SegmentedControl, Timeline } from '@/app/components/roote';
import type { TimelineMilestone } from '@/app/components/roote';
import { qualitativeMetrics, compareMetric } from '@/domain/tracking/metrics';
import type { HairScan } from '@/domain/tracking/types';
import { PATHS } from '@/app/paths';
import { METRIC_LABEL, METRIC_LABEL_FALLBACK } from './metricLabels';
import { useUserProgram } from './useUserProgram';

const SCAN_TYPE_KEY = {
  baseline: 'app.scans.type.baseline',
  progress: 'app.scans.type.progress',
  final: 'app.scans.type.final',
} as const;

/**
 * Progress over time (spec §7). Every metric shows its baseline read next to the
 * latest scan's read — qualitative only, since nothing has produced a real
 * number yet (locked decision #1). A numeric delta renders *only* when a real
 * provider genuinely returned values on both sides.
 */
export function AccountProgress() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();

  const scans = useMemo(
    () => [...tracking.scans].sort((a, b) => a.capturedAt.localeCompare(b.capturedAt)),
    [tracking.scans],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const latest: HairScan | undefined = scans.find((s) => s.id === selectedId) ?? scans.at(-1);

  if (!view) return null;
  const { userProgram: up } = view;

  const baselineMetrics = qualitativeMetrics({
    analysis: session.analysis,
    grayProfile: session.grayProfile,
    provider: 'mock',
    isMock: true,
    capturedAt: `${up.startDate}T00:00:00Z`,
  });

  const dayLabel = (n: number) => t('marketing.sys.day', { n });
  const dayForDate = (iso: string) =>
    Math.max(0, Math.round((Date.parse(`${iso.slice(0, 10)}T00:00:00Z`) - Date.parse(`${up.startDate}T00:00:00Z`)) / 86_400_000));

  const milestones: TimelineMilestone[] = [
    {
      id: 'baseline',
      dayLabel: dayLabel(0),
      title: t('app.scans.type.baseline'),
      state: 'done',
    },
    ...scans.map((s) => ({
      id: s.id,
      dayLabel: dayLabel(dayForDate(s.capturedAt)),
      title: t(SCAN_TYPE_KEY[s.type]),
      caption: s.isMock ? t('app.scans.demo') : undefined,
      state: 'done' as const,
    })),
    ...up.checkpoints
      .filter((c) => (c.type === 'scan' || c.type === 'final-scan') && !c.completedDate)
      .map((c, i) => ({
        id: c.id,
        dayLabel: dayLabel(c.day),
        title: c.type === 'final-scan' ? t('app.scans.type.final') : t('app.scans.type.progress'),
        state: (i === 0 ? 'current' : 'upcoming') as 'current' | 'upcoming',
      })),
  ];

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <DisplayTitle as="h1" step="sm">
          {t('app.progress.title')}
        </DisplayTitle>
        <Prose size="sm">{t('app.progress.subtitle')}</Prose>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-md text-foreground">{t('app.progress.metricsTitle')}</h2>
          {scans.length > 1 && (
            <SegmentedControl
              label={t('app.progress.compareWith')}
              value={latest?.id ?? scans[scans.length - 1].id}
              onChange={setSelectedId}
              options={scans.map((s) => ({ value: s.id, label: dayLabel(dayForDate(s.capturedAt)) }))}
            />
          )}
        </div>

        {baselineMetrics.length === 0 ? (
          <Prose size="sm">{t('app.progress.noBaseline')}</Prose>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {baselineMetrics.map((b) => {
              const l = latest?.metrics.find((m) => m.key === b.key);
              const cmp = compareMetric(b, l);
              return (
                <Card key={b.key}>
                  <p className="font-body text-sm text-muted-foreground">
                    {t(METRIC_LABEL[b.key] ?? METRIC_LABEL_FALLBACK)}
                  </p>
                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <span className="font-body text-2xs text-muted-foreground">{t('app.progress.baselineLabel')}</span>
                    <span className="font-display text-md text-foreground">{t(b.status as 'severity.mild')}</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <span className="font-body text-2xs text-muted-foreground">{t('app.progress.latestLabel')}</span>
                    <span className="font-display text-md text-foreground">
                      {l ? t(l.status as 'severity.mild') : <span className="text-muted-foreground">—</span>}
                    </span>
                  </div>
                  {cmp.numericChange != null && (
                    <p className="mt-1 text-end font-body text-2xs text-accent">
                      {cmp.numericChange > 0 ? '+' : ''}
                      {cmp.numericChange}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {scans.length === 0 && <Prose size="sm">{t('app.progress.noScanYet')}</Prose>}
        <Prose size="sm" className="text-muted-foreground">
          {t('app.progress.metricsNote')}
        </Prose>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-md text-foreground">{t('app.progress.scanTimelineTitle')}</h2>
        <Timeline milestones={milestones} />
      </section>

      <div>
        <Button to={withLocale(PATHS.accountSection('progress/before-after'))} variant="secondary">
          {t('app.progress.openBeforeAfter')}
        </Button>
      </div>

      {latest?.isMock && (
        <Badge tone="review" className="w-fit">
          {t('app.scans.demo')}
        </Badge>
      )}
    </div>
  );
}
