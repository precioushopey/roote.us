import { useT, useContentLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { DisplayTitle, Prose, Badge } from '@/app/components/roote';
import { GuidedPhotoCapture } from '@/app/components/tracking/GuidedPhotoCapture';
import { deleteBlob } from '@/store/persistence';
import { PHOTO_VIEWS, type PhotoView } from '@/domain/tracking/types';
import { checkpointState } from '@/domain/tracking/checkpoints';
import { PHOTO_ANGLES } from '@/content/assessment';
import { pickLocalized } from '@/content/localized';
import { isoToday } from './programProgress';
import { useUserProgram } from './useUserProgram';
import type { MessageKey } from '@/i18n/messages';

const CHECKPOINT_KEY: Record<string, MessageKey> = {
  baseline: 'app.checkpoint.baseline',
  photo: 'app.checkpoint.photo',
  scan: 'app.checkpoint.scan',
  'final-scan': 'app.checkpoint.finalScan',
};

/**
 * Progress Photos (spec §5) — every checkpoint's four views, captured with the
 * same guidance each time (silhouette + previous-image ghost overlay) so later
 * shots stay comparable to the baseline.
 */
export function AccountPhotos() {
  const t = useT();
  const cl = useContentLocale();
  const session = useSession();
  const tracking = useTracking();
  const view = useUserProgram();
  if (!view) return null;
  const { userProgram: up } = view;
  const today = isoToday();

  const instructionFor = (v: PhotoView) =>
    pickLocalized(PHOTO_ANGLES.find((a) => a.angle === v)!.instruction, cl);
  const viewLabel = (v: PhotoView) => pickLocalized(PHOTO_ANGLES.find((a) => a.angle === v)!.title, cl);

  const photoFor = (checkpointId: string, v: PhotoView) =>
    tracking.photos.find((p) => p.checkpointId === checkpointId && p.view === v);

  // baseline photos come from the assessment if the migration hasn't folded them in
  const baselinePhotoFor = (v: PhotoView) =>
    photoFor('baseline-d0', v) ??
    (() => {
      const dp = session.diagnosis.photos.find((p) => p.angleKey === v);
      return dp ? { id: dp.id, checkpointId: 'baseline-d0', view: v, capturedAt: up.startDate, blobId: dp.blobId, thumb: dp.thumb } : undefined;
    })();

  // photo checkpoints + scans (scans also capture the 4 views); the final scan
  // lives on the Hair Scans screen.
  const shownCheckpoints = up.checkpoints.filter((c) => c.type !== 'final-scan');

  return (
    <div data-animate className="flex flex-col gap-8">
      <header>
        <DisplayTitle as="h1" step="sm">
          {t('app.photos.title')}
        </DisplayTitle>
        <Prose className="mt-2" size="sm">
          {t('app.photos.body')}
        </Prose>
      </header>

      {shownCheckpoints.map((cp) => {
        const isSkipped = tracking.skippedCheckpoints.includes(cp.id);
        // the baseline is captured at program start — it is never "due" again
        const state = cp.type === 'baseline' ? 'completed' : checkpointState(cp, up.currentDay, isSkipped);
        const capturable = cp.type !== 'baseline' && (state === 'due' || state === 'overdue');
        const cpIndex = up.checkpoints.findIndex((c) => c.id === cp.id);
        const prev = up.checkpoints[cpIndex - 1];
        return (
          <section key={cp.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-md text-foreground">
                {t(CHECKPOINT_KEY[cp.type])} · {t('marketing.sys.day', { n: cp.day })}
              </h2>
              <span className="flex items-center gap-3">
                {state === 'overdue' && (
                  <button
                    type="button"
                    onClick={() => tracking.skipCheckpoint(cp.id, true)}
                    className="font-body text-sm text-muted-foreground underline"
                  >
                    {t('app.checkpoint.skip')}
                  </button>
                )}
                {state === 'skipped' && (
                  <button
                    type="button"
                    onClick={() => tracking.skipCheckpoint(cp.id, false)}
                    className="font-body text-sm text-muted-foreground underline"
                  >
                    {t('app.checkpoint.unskip')}
                  </button>
                )}
                <Badge tone={state === 'completed' ? 'success' : 'neutral'}>
                  {t(`app.checkpoint.state.${state}` as 'app.checkpoint.state.due')}
                </Badge>
              </span>
            </div>
            {state === 'skipped' ? null : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PHOTO_VIEWS.map((v) => {
                const existing = cp.type === 'baseline' ? baselinePhotoFor(v) : photoFor(cp.id, v);
                const ghost = prev ? (prev.type === 'baseline' ? baselinePhotoFor(v) : photoFor(prev.id, v))?.thumb : undefined;
                if (!capturable) {
                  return (
                    <figure key={v} className="overflow-hidden rounded-lg border border-border bg-cream-100">
                      <div className="aspect-square w-full">
                        {existing ? (
                          <img src={existing.thumb} alt={viewLabel(v)} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center font-body text-sm text-muted-foreground">
                            {t('app.photos.notYet')}
                          </div>
                        )}
                      </div>
                      <figcaption className="px-2 py-1.5 font-body text-sm text-muted-foreground">{viewLabel(v)}</figcaption>
                    </figure>
                  );
                }
                return (
                  <GuidedPhotoCapture
                    key={v}
                    view={v}
                    label={viewLabel(v)}
                    instruction={instructionFor(v)}
                    currentThumb={existing?.thumb}
                    ghostThumb={ghost}
                    onCaptured={({ blobId, thumb }) => {
                      const prevBlob = existing?.blobId;
                      tracking.addPhoto({
                        id: crypto.randomUUID(),
                        checkpointId: cp.id,
                        view: v,
                        capturedAt: today,
                        blobId,
                        thumb,
                      });
                      if (prevBlob) void deleteBlob(prevBlob);
                    }}
                    onRemove={existing ? () => tracking.removePhoto(existing.id) : undefined}
                  />
                );
              })}
            </div>
            )}
            {capturable &&
              PHOTO_VIEWS.every((v) => photoFor(cp.id, v)) &&
              !cp.completedDate && (
                <button
                  type="button"
                  onClick={() => tracking.completeCheckpoint(cp.id, today)}
                  className="w-fit rounded-xs bg-primary px-5 py-2 font-body text-sm text-primary-foreground"
                >
                  {t('app.photos.markCheckpointDone')}
                </button>
              )}
          </section>
        );
      })}
    </div>
  );
}
