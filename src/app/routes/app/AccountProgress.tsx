import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { Prose, Card, Badge, Button, SegmentedControl, Timeline } from '@/app/components/roote';
import type { TimelineMilestone } from '@/app/components/roote';
import { qualitativeMetrics, compareMetric } from '@/domain/tracking/metrics';
import type { HairScan } from '@/domain/tracking/types';
import { PATHS } from '@/app/paths';
import { METRIC_LABEL, METRIC_LABEL_FALLBACK } from './metricLabels';
import { useUserProgram } from './useUserProgram';
import { AccountPageHeader } from './AccountPageHeader';
import { AccountPhotos } from './AccountPhotos';
import { AccountScans } from './AccountScans';
import { AccountBeforeAfter } from './AccountBeforeAfter';
import type { MessageKey } from '@/i18n/messages';

const SCAN_TYPE_KEY = {
  baseline: 'app.scans.type.baseline',
  progress: 'app.scans.type.progress',
  final: 'app.scans.type.final',
} as const;

type Tab = 'metrics' | 'photos' | 'scans' | 'beforeAfter';
const TAB_VALUES: readonly Tab[] = ['metrics', 'photos', 'scans', 'beforeAfter'];
const TAB_LABEL_KEY: Record<Tab, MessageKey> = {
  metrics: 'app.nav.progress',
  photos: 'app.nav.photos',
  scans: 'app.nav.scans',
  beforeAfter: 'app.nav.beforeAfter',
};

/**
 * Progress over time (spec §7). Every metric shows its baseline read next to the
 * latest scan's read — qualitative only, since nothing has produced a real
 * number yet (locked decision #1). A numeric delta renders *only* when a real
 * provider genuinely returned values on both sides.
 */
function ProgressMetricsPanel({ onGoBeforeAfter }: { onGoBeforeAfter: () => void }) {
  const t = useT();
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
    <div className="flex flex-col gap-4 md:gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
          <Card tone="cream">
            <Prose className="text-sm sm:text-sm md:text-sm">{t('app.progress.noBaseline')}</Prose>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {baselineMetrics.map((b) => {
              const l = latest?.metrics.find((m) => m.key === b.key);
              const cmp = compareMetric(b, l);
              return (
                <Card key={b.key}>
                  <p className="font-body text-sm text-muted-foreground">
                    {t(METRIC_LABEL[b.key] ?? METRIC_LABEL_FALLBACK)}
                  </p>
                  <div className="mt-2 flex items-baseline justify-between gap-4">
                    <span className="font-body text-sm text-muted-foreground">{t('app.progress.baselineLabel')}</span>
                    <span className="font-display text-md text-foreground">{t(b.status as 'severity.mild')}</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-4">
                    <span className="font-body text-sm text-muted-foreground">{t('app.progress.latestLabel')}</span>
                    <span className="font-display text-md text-foreground">
                      {l ? t(l.status as 'severity.mild') : <span className="text-muted-foreground">-</span>}
                    </span>
                  </div>
                  {cmp.numericChange != null && (
                    <p className="mt-1 text-end font-body text-sm text-accent">
                      {cmp.numericChange > 0 ? '+' : ''}
                      {cmp.numericChange}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {scans.length === 0 ? (
          <Card tone="cream" className="flex flex-col gap-2">
            <Prose className="text-sm sm:text-sm md:text-sm">{t('app.progress.noScanYet')}</Prose>
            <Prose className="text-sm sm:text-sm md:text-sm text-muted-foreground">{t('app.progress.metricsNote')}</Prose>
          </Card>
        ) : (
          <Prose className="text-sm sm:text-sm md:text-sm text-muted-foreground">{t('app.progress.metricsNote')}</Prose>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-md text-foreground">{t('app.progress.scanTimelineTitle')}</h2>
        <Timeline milestones={milestones} orientation="horizontal" />
      </section>

      <div>
        <button
          type="button"
          onClick={onGoBeforeAfter}
          className="inline-flex min-h-8 items-center justify-center rounded-full border border-border bg-transparent px-4 py-1.5 font-body text-sm font-medium text-foreground transition-colors hover:border-deep-700"
        >
          {t('app.progress.openBeforeAfter')}
        </button>
      </div>

      {latest?.isMock && (
        <Badge tone="review" className="w-fit">
          {t('app.scans.demo')}
        </Badge>
      )}
    </div>
  );
}

/** Progress absorbs the former standalone Photos, Scans, and Before & After
 *  pages as tabs of one screen (nav-consolidation, 2026-09-11) — `?tab=`
 *  keeps each section deep-linkable from CTAs elsewhere in the app. */
export function AccountProgress() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const [searchParams, setSearchParams] = useSearchParams();
  // Derived straight from the URL (not local state) so it stays in sync
  // whichever way the tab changed — an in-page click or an external NavLink
  // (e.g. the sidebar's "Run a new hair analysis" -> ?tab=scans).
  const requested = searchParams.get('tab') as Tab | null;
  const tab: Tab = requested && TAB_VALUES.includes(requested) ? requested : 'metrics';

  function goTab(next: Tab) {
    setSearchParams(
      (p) => {
        p.set('tab', next);
        return p;
      },
      { replace: true },
    );
  }

  return (
    <div data-animate className="flex flex-col gap-4 md:gap-8">
      <AccountPageHeader eyebrow={t('app.nav.progress')} title={t('app.progress.title')} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <Prose className="text-sm sm:text-sm md:text-sm">{t('app.progress.subtitle')}</Prose>
        <Button to={withLocale(`${PATHS.accountSection('progress')}?tab=scans`)} variant="secondary">
          {t('app.care.rescanLink')}
        </Button>
      </div>

      <SegmentedControl
        label={t('common.progressLabel')}
        value={tab}
        onChange={goTab}
        options={TAB_VALUES.map((value) => ({ value, label: t(TAB_LABEL_KEY[value]) }))}
        className="w-fit"
      />

      {tab === 'metrics' && <ProgressMetricsPanel onGoBeforeAfter={() => goTab('beforeAfter')} />}
      {tab === 'photos' && <AccountPhotos />}
      {tab === 'scans' && <AccountScans />}
      {tab === 'beforeAfter' && <AccountBeforeAfter onGoToPhotos={() => goTab('photos')} />}
    </div>
  );
}
