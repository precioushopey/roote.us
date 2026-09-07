import { useState } from 'react';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { DisplayTitle, Prose, Card, Badge, Button } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { GuidedPhotoCapture } from '@/app/components/tracking/GuidedPhotoCapture';
import { getAnalysisProvider } from '@/domain/analysis/provider';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { qualitativeMetrics } from '@/domain/tracking/metrics';
import { checkpointState } from '@/domain/tracking/checkpoints';
import { PHOTO_VIEWS, type PhotoView, type HairScan, type ScanType } from '@/domain/tracking/types';
import { PHOTO_ANGLES } from '@/content/assessment';
import { pickLocalized } from '@/content/localized';
import { getBlob } from '@/store/persistence';
import { track } from '@/analytics/analytics';
import { isoToday } from './programProgress';
import { useUserProgram } from './useUserProgram';
import { METRIC_LABEL, METRIC_LABEL_FALLBACK } from './metricLabels';
import type { Answers } from '@/domain/analysis/types';

type Phase = 'idle' | 'capturing' | 'analyzing';

export function AccountScans() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();
  const [phase, setPhase] = useState<Phase>('idle');
  const [shots, setShots] = useState<Record<PhotoView, { blobId: string; thumb: string } | undefined>>({
    front: undefined,
    top: undefined,
    crown: undefined,
    hairline: undefined,
  });

  if (!view) return null;
  const { userProgram: up } = view;
  const today = isoToday();

  // PO #17: the final scan is always reachable; never force the oldest missed scan
  // first. Prefer the final scan, then the one actually due now, then whatever's left.
  const scanCandidates = up.checkpoints.filter(
    (c) =>
      (c.type === 'scan' || c.type === 'final-scan') &&
      !c.completedDate &&
      !tracking.skippedCheckpoints.includes(c.id) &&
      ['due', 'overdue'].includes(checkpointState(c, up.currentDay)),
  );
  const dueCheckpoint =
    scanCandidates.find((c) => c.type === 'final-scan') ??
    scanCandidates.find((c) => checkpointState(c, up.currentDay) === 'due') ??
    scanCandidates[0];
  const pastDueScans = scanCandidates.filter((c) => c.id !== dueCheckpoint?.id);
  const skippedScans = up.checkpoints.filter(
    (c) => (c.type === 'scan' || c.type === 'final-scan') && tracking.skippedCheckpoints.includes(c.id),
  );
  const isFinal = dueCheckpoint?.type === 'final-scan';
  const allShot = PHOTO_VIEWS.every((v) => shots[v]);
  const viewLabel = (v: PhotoView) => pickLocalized(PHOTO_ANGLES.find((a) => a.angle === v)!.title, cl);
  const instructionFor = (v: PhotoView) => pickLocalized(PHOTO_ANGLES.find((a) => a.angle === v)!.instruction, cl);

  async function runScan() {
    if (!dueCheckpoint || !allShot) return;
    setPhase('analyzing');
    track(isFinal ? 'final_scan_completed' : 'progress_scan_completed', { day: dueCheckpoint.day });
    const images: { angleKey: string; blob: Blob }[] = [];
    for (const v of PHOTO_VIEWS) {
      const s = shots[v]!;
      try {
        const blob = await getBlob(s.blobId);
        if (blob) images.push({ angleKey: v, blob });
      } catch {
        /* skip */
      }
    }
    const gender = session.diagnosis.gender ?? 'male';
    const hairGoal = session.diagnosis.hairGoal ?? 'other';
    const answers = (session.diagnosis.answers as Answers) ?? undefined;
    let analysis;
    let isMock = true;
    try {
      const res = await getAnalysisProvider().analyze({ gender, hairGoal, answers, images });
      analysis = res.analysis;
      isMock = res.isMock;
    } catch {
      analysis = deriveAnalysis({ gender, hairGoal, answers });
    }
    const type: ScanType = isFinal ? 'final' : 'progress';
    const scan: HairScan = {
      id: crypto.randomUUID(),
      type,
      provider: getAnalysisProvider().name,
      isMock,
      capturedAt: `${today}T00:00:00Z`,
      metrics: qualitativeMetrics({ analysis, grayProfile: session.grayProfile, provider: getAnalysisProvider().name, isMock, capturedAt: `${today}T00:00:00Z` }),
      imageRefs: PHOTO_VIEWS.map((v) => shots[v]!.blobId),
      analysis,
      grayProfile: session.grayProfile,
    };
    tracking.addScan(scan);
    // a scan captures the same four views — keep them as checkpoint photos so the
    // Photos and Before/After screens can show them (deduped by checkpoint+view).
    for (const v of PHOTO_VIEWS) {
      const s = shots[v]!;
      tracking.addPhoto({ id: crypto.randomUUID(), checkpointId: dueCheckpoint.id, view: v, capturedAt: today, blobId: s.blobId, thumb: s.thumb });
    }
    tracking.completeCheckpoint(dueCheckpoint.id, today);
    setShots({ front: undefined, top: undefined, crown: undefined, hairline: undefined });
    setPhase('idle');
  }

  const scans = tracking.scans;

  return (
    <div data-animate className="flex flex-col gap-8">
      <header>
        <DisplayTitle as="h1" step="sm">
          {t('app.scans.title')}
        </DisplayTitle>
        <Prose className="mt-2" size="sm">
          {t('app.scans.body')}
        </Prose>
      </header>

      {scans.some((s) => s.type === 'final') && (
        <Button to={withLocale(PATHS.accountSection('results'))} variant="secondary" size="sm" className="w-fit">
          {t('app.overview.viewResults')}
        </Button>
      )}

      {dueCheckpoint && phase !== 'analyzing' && (
        <Card tone="cream">
          <p className="font-display text-md text-foreground">
            {isFinal ? t('app.scans.finalPrompt') : t('app.scans.progressPrompt')}
          </p>
          <Prose size="sm" className="mt-1">
            {isFinal ? t('app.scans.finalBody') : t('app.scans.progressBody')}
          </Prose>
          {phase === 'idle' ? (
            <button
              type="button"
              onClick={() => {
                setPhase('capturing');
                track('progress_scan_started', { day: dueCheckpoint.day });
              }}
              className="mt-3 w-fit rounded-full bg-primary px-5 py-2 font-body text-sm text-primary-foreground"
            >
              {t('app.scans.startCapture')}
            </button>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PHOTO_VIEWS.map((v) => (
                  <GuidedPhotoCapture
                    key={v}
                    view={v}
                    label={viewLabel(v)}
                    instruction={instructionFor(v)}
                    currentThumb={shots[v]?.thumb}
                    onCaptured={(ref) => setShots((s) => ({ ...s, [v]: ref }))}
                    onRemove={() => setShots((s) => ({ ...s, [v]: undefined }))}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={!allShot}
                onClick={runScan}
                className="mt-4 w-fit rounded-full bg-primary px-5 py-2 font-body text-sm text-primary-foreground disabled:opacity-40"
              >
                {t('app.scans.runAnalysis')}
              </button>
            </>
          )}
        </Card>
      )}

      {phase === 'analyzing' && (
        <Card>
          <p aria-live="polite" className="font-body text-sm text-foreground">
            {t('app.scans.analyzing')}
          </p>
        </Card>
      )}

      {(pastDueScans.length > 0 || skippedScans.length > 0) && (
        <ul className="flex flex-col divide-y divide-border/60 rounded-lg border border-border bg-card">
          {pastDueScans.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-body text-sm text-foreground">
                {t(c.type === 'final-scan' ? 'app.checkpoint.finalScan' : 'app.checkpoint.scan')} ·{' '}
                {t('marketing.sys.day', { n: c.day })}
              </span>
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => tracking.skipCheckpoint(c.id, true)}
                  className="font-body text-2xs text-muted-foreground underline"
                >
                  {t('app.checkpoint.skip')}
                </button>
                <Badge tone="neutral">{t('app.checkpoint.state.overdue')}</Badge>
              </span>
            </li>
          ))}
          {skippedScans.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-body text-sm text-muted-foreground">
                {t(c.type === 'final-scan' ? 'app.checkpoint.finalScan' : 'app.checkpoint.scan')} ·{' '}
                {t('marketing.sys.day', { n: c.day })}
              </span>
              <span className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => tracking.skipCheckpoint(c.id, false)}
                  className="font-body text-2xs text-muted-foreground underline"
                >
                  {t('app.checkpoint.unskip')}
                </button>
                <Badge tone="neutral">{t('app.checkpoint.state.skipped')}</Badge>
              </span>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-md text-foreground">{t('app.scans.history')}</h2>
        {scans.length === 0 ? (
          <Prose size="sm">{t('app.scans.none')}</Prose>
        ) : (
          scans.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-body text-sm text-foreground">
                  {t(`app.scans.type.${s.type}` as 'app.scans.type.progress')} · {s.capturedAt.slice(0, 10)}
                </p>
                {s.isMock && <Badge tone="review">{t('app.scans.demo')}</Badge>}
              </div>
              <dl className="mt-2 flex flex-col gap-1 font-body text-sm">
                {s.metrics.map((m) => (
                  <div key={m.key} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t(METRIC_LABEL[m.key] ?? METRIC_LABEL_FALLBACK)}</dt>
                    <dd className="text-foreground">{t(m.status as 'severity.mild')}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
