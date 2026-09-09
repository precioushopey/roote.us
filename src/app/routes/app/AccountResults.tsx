import { useEffect, useMemo } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import {
  DisplayTitle,
  Prose,
  Eyebrow,
  Card,
  Button,
  Badge,
  Stat,
  ReportSection,
  BeforeAfterSlider,
  Timeline,
  useToast,
} from '@/app/components/roote';
import type { TimelineMilestone } from '@/app/components/roote';
import { qualitativeMetrics, compareMetric } from '@/domain/tracking/metrics';
import { checkpointState } from '@/domain/tracking/checkpoints';
import { PHOTO_VIEWS, type PhotoView } from '@/domain/tracking/types';
import { track } from '@/analytics/analytics';
import { buildRootePdf } from '@/pdf/reportPdf';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';
import { METRIC_LABEL, METRIC_LABEL_FALLBACK } from './metricLabels';
import { useUserProgram } from './useUserProgram';

const VIEW_KEY: Record<PhotoView, MessageKey> = {
  front: 'photo.angle.front',
  top: 'photo.angle.top',
  crown: 'photo.angle.crown',
  hairline: 'photo.angle.hairline',
};

function Photo({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="block h-full w-full object-cover" />;
}

/**
 * "ROOTÉ PROGRAM RESULTS" (spec §10). The end-of-program summary: before/after,
 * initial vs. final analysis (qualitative only), adherence (a routine measure,
 * not a clinical result), what was used, the timeline, and a neutral set of next
 * steps. ROOTÉ never auto-picks a medical next action.
 */
export function AccountResults() {
  const t = useT();
  const withLocale = useLocalizedPath();
  const toast = useToast();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();

  const finalScan = useMemo(
    () => [...tracking.scans].reverse().find((s) => s.type === 'final'),
    [tracking.scans],
  );

  useEffect(() => {
    track('program_results_viewed');
  }, []);

  if (!view) return null;
  const { userProgram: up, treatments } = view;
  const ready = up.status === 'complete' || !!finalScan;

  if (!ready) {
    return (
      <div data-animate className="flex flex-col gap-4">
        <Eyebrow>{t('app.results.eyebrow')}</Eyebrow>
        <DisplayTitle as="h1" step="sm">
          {t('app.results.notReady.title')}
        </DisplayTitle>
        <Prose size="sm">{t('app.results.notReady.body')}</Prose>
        <Button to={withLocale(PATHS.account)} variant="secondary" className="w-fit">
          {t('app.results.notReady.cta')}
        </Button>
      </div>
    );
  }

  const photoAt = (checkpointId: string, v: PhotoView) =>
    tracking.photos.find((p) => p.checkpointId === checkpointId && p.view === v);
  const baselinePhoto = (v: PhotoView) => {
    const p = photoAt('baseline-d0', v);
    if (p) return p.thumb;
    return session.diagnosis.photos.find((dp) => dp.angleKey === v)?.thumb;
  };
  const finalCheckpoint = up.checkpoints.find((c) => c.type === 'final-scan');
  const finalPhoto = (v: PhotoView) => (finalCheckpoint ? photoAt(finalCheckpoint.id, v)?.thumb : undefined);

  const initialMetrics = qualitativeMetrics({
    analysis: session.analysis,
    grayProfile: session.grayProfile,
    provider: 'mock',
    isMock: true,
    capturedAt: `${up.startDate}T00:00:00Z`,
  });
  const hasFinalPhotos = PHOTO_VIEWS.some((v) => finalPhoto(v));

  const dayLabel = (n: number) => t('marketing.sys.day', { n });
  const milestones: TimelineMilestone[] = [
    { id: 'baseline', dayLabel: dayLabel(0), title: t('app.scans.type.baseline'), state: 'done' },
    ...up.checkpoints
      .filter((c) => c.type !== 'baseline')
      .map((c) => ({
        id: c.id,
        dayLabel: dayLabel(c.day),
        title:
          c.type === 'final-scan'
            ? t('app.scans.type.final')
            : c.type === 'scan'
              ? t('app.scans.type.progress')
              : t('app.checkpoint.photo'),
        // on a finished program a not-completed checkpoint was simply missed or
        // skipped — show it faint ('upcoming'), reserve 'current' for one due now
        state: (c.completedDate
          ? 'done'
          : checkpointState(c, up.currentDay, tracking.skippedCheckpoints.includes(c.id)) === 'due'
            ? 'current'
            : 'upcoming') as TimelineMilestone['state'],
      })),
  ];

  function downloadPdf() {
    void buildRootePdf({
      title: t('app.results.pdfTitle'),
      subtitle: `${t('app.results.summary.duration')}: ${t('app.results.summary.days', { n: up.durationDays })} · ${up.startDate} – ${up.endDate}`,
      sections: [
        {
          heading: t('app.results.analysis.title'),
          rows: initialMetrics.map((m): [string, string] => {
            const f = finalScan?.metrics.find((x) => x.key === m.key);
            return [
              t(METRIC_LABEL[m.key] ?? METRIC_LABEL_FALLBACK),
              `${t('app.results.analysis.initial')}: ${t(m.status as 'severity.mild')}  |  ${t('app.results.analysis.final')}: ${f ? t(f.status as 'severity.mild') : '-'}`,
            ];
          }),
        },
        { heading: t('app.results.adherence.title'), rows: [[t('app.today.adherence.label'), `${up.adherencePct}%`]] },
        {
          heading: t('app.results.products.title'),
          lines: [...treatments.core, ...treatments.supporting].map((tr) => `${tr.name}: ${tr.frequency}`),
        },
        { heading: t('app.results.timeline.title'), lines: milestones.map((m) => `${m.dayLabel}: ${m.title}`) },
      ],
      disclaimer: `${t('app.progress.metricsNote')} ${t('app.results.adherence.body')}`,
      filename: 'roote-program-results.pdf',
    });
  }

  return (
    <div data-animate className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Eyebrow>{t('app.results.eyebrow')}</Eyebrow>
        <DisplayTitle as="h1" step="sm">
          {t('app.results.title')}
        </DisplayTitle>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={downloadPdf} variant="secondary" size="sm">
            {t('app.results.actions.download')}
          </Button>
          <Button onClick={() => toast.show(t('app.results.actions.emailStub'))} variant="ghost" size="sm">
            {t('app.results.actions.email')}
          </Button>
          <Button to={withLocale(PATHS.accountSection('renew'))} size="sm">
            {t('app.results.next.reviewNext')}
          </Button>
        </div>
      </header>

      <Card>
        <dl className="grid gap-3 font-body text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('app.results.summary.duration')}</dt>
            <dd className="text-foreground">{t('app.results.summary.days', { n: up.durationDays })}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t('app.results.summary.dates')}</dt>
            <dd className="text-foreground">
              {up.startDate} – {up.endDate}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="flex flex-col">
        <ReportSection title={t('app.results.beforeAfter.title')}>
          <p>{t('app.results.beforeAfter.body')}</p>
          {!hasFinalPhotos && <p className="mt-2">{t('app.results.beforeAfter.pendingFinal')}</p>}
          <div className="mt-4 flex flex-col gap-4">
            {baselinePhoto('front') && finalPhoto('front') && (
              <BeforeAfterSlider
                before={<Photo src={baselinePhoto('front')!} alt={`${t('photo.angle.front')}, ${t('app.baseline.badge')}`} />}
                after={<Photo src={finalPhoto('front')!} alt={`${t('photo.angle.front')}, ${t('app.results.analysis.final')}`} />}
                beforeLabel={t('app.results.analysis.initial')}
                afterLabel={t('app.results.analysis.final')}
                ariaLabel={t('app.beforeAfter.reveal')}
                className="max-w-md"
              />
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PHOTO_VIEWS.filter((v) => v !== 'front' || !finalPhoto('front')).map((v) => (
                <figure key={v} className="flex flex-col gap-1">
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { tag: t('app.results.analysis.initial'), src: baselinePhoto(v) },
                      { tag: t('app.results.analysis.final'), src: finalPhoto(v) },
                    ].map((cell) => (
                      <div
                        key={cell.tag}
                        className="aspect-square w-full overflow-hidden rounded-md border border-border bg-cream-100"
                      >
                        {cell.src ? (
                          <Photo src={cell.src} alt={`${t(VIEW_KEY[v])}, ${cell.tag}`} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-center font-body text-sm text-muted-foreground">
                            {t('app.photos.notYet')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <figcaption className="font-body text-sm text-muted-foreground">{t(VIEW_KEY[v])}</figcaption>
                </figure>
              ))}
            </div>
            <Button to={withLocale(PATHS.accountSection('progress/before-after'))} variant="secondary" size="sm" className="w-fit">
              {t('app.results.beforeAfter.cta')}
            </Button>
          </div>
        </ReportSection>

        <ReportSection title={t('app.results.analysis.title')}>
          {initialMetrics.length === 0 ? (
            <p>{t('app.progress.noBaseline')}</p>
          ) : (
            <>
              {!finalScan && <p className="mb-3">{t('app.results.analysis.pending')}</p>}
              <dl className="divide-y divide-border/60">
                <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 pb-2 font-body text-sm text-muted-foreground">
                  <span />
                  <span>{t('app.results.analysis.initial')}</span>
                  <span>{t('app.results.analysis.final')}</span>
                </div>
                {initialMetrics.map((b) => {
                  const f = finalScan?.metrics.find((m) => m.key === b.key);
                  const cmp = compareMetric(b, f);
                  return (
                    <div key={b.key} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-2.5">
                      <dt className="font-body text-sm text-muted-foreground">
                        {t(METRIC_LABEL[b.key] ?? METRIC_LABEL_FALLBACK)}
                      </dt>
                      <dd className="font-display text-sm text-foreground">{t(b.status as 'severity.mild')}</dd>
                      <dd className="font-display text-sm text-foreground">
                        {f ? t(f.status as 'severity.mild') : <span className="text-muted-foreground">-</span>}
                        {cmp.numericChange != null && (
                          <span className="ms-1 font-body text-sm text-accent">
                            {cmp.numericChange > 0 ? '+' : ''}
                            {cmp.numericChange}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-3 font-body text-sm">{t('app.progress.metricsNote')}</p>
              {finalScan?.isMock && (
                <Badge tone="review" className="mt-2">
                  {t('app.scans.demo')}
                </Badge>
              )}
            </>
          )}
        </ReportSection>

        <ReportSection title={t('app.results.adherence.title')}>
          <Stat label={t('app.today.adherence.label')} value={`${up.adherencePct}%`} />
          <p className="mt-2">{t('app.results.adherence.body')}</p>
        </ReportSection>

        <ReportSection title={t('app.results.products.title')}>
          <ul className="flex flex-col gap-2">
            {[...treatments.core, ...treatments.supporting].map((tr) => (
              <li key={tr.key} className="flex items-baseline justify-between gap-4">
                <span className="text-foreground">{tr.name}</span>
                <span className="font-body text-sm text-muted-foreground">{tr.frequency}</span>
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title={t('app.results.timeline.title')}>
          <Timeline milestones={milestones} />
        </ReportSection>

        <ReportSection title={t('app.results.next.title')}>
          <p>{t('app.results.next.body')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button to={withLocale(PATHS.accountSection('renew'))} size="sm">
              {t('app.results.next.reviewNext')}
            </Button>
            <Button to={withLocale(PATHS.analysis)} variant="secondary" size="sm">
              {t('app.results.next.newAnalysis')}
            </Button>
            <Button to={withLocale(PATHS.accountSection('care'))} variant="ghost" size="sm">
              {t('app.results.next.careTeam')}
            </Button>
          </div>
        </ReportSection>
      </div>
    </div>
  );
}
