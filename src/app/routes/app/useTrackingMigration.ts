import { useEffect } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { resolvePlanTreatments, planKeysForProgram } from './programProgress';
import { migrateTaskKeys } from '@/domain/tracking/schedule';
import type { HairPhoto, TaskStatus, TrackingState } from '@/domain/tracking/types';

/**
 * One-time migration: when a `Program` exists but `tracking.programId` doesn't
 * match it, seed `store/tracking` from the program's legacy `completionLog`
 * (flat `core:N` keys → per-slot keys) and `progressPhotos` (→ baseline
 * `HairPhoto`s). Runs once per program from `AppShell`.
 */
export function useTrackingMigration() {
  const { locale } = useLocale();
  const session = useSession();
  const tracking = useTracking();

  useEffect(() => {
    const program = session.program;
    if (!program || tracking.programId === program.orderId) return;

    const planKeys = planKeysForProgram(session.diagnosis, program.analysisSnapshot);
    const treatments = resolvePlanTreatments((k) => k, locale, planKeys); // keys, not display — we only need `key`
    const taskLog: TrackingState['taskLog'] = {};
    for (const [iso, keys] of Object.entries(program.completionLog ?? {})) {
      const mapped = migrateTaskKeys(keys, treatments);
      taskLog[iso] = Object.fromEntries(mapped.map((k) => [k, 'done' as TaskStatus]));
    }

    // Baseline photos: the four assessment photos, plus any legacy progressPhotos.
    const baseline: HairPhoto[] = session.diagnosis.photos.map((p) => ({
      id: p.id,
      checkpointId: 'baseline-d0',
      view: p.angleKey,
      capturedAt: program.startDate,
      blobId: p.blobId,
      thumb: p.thumb,
    }));
    const legacy: HairPhoto[] = (program.progressPhotos ?? []).map((p) => ({
      id: p.id,
      checkpointId: 'baseline-d0',
      view: p.angleKey,
      capturedAt: p.isoDate,
      blobId: p.blobId,
      thumb: p.thumb,
    }));
    const seen = new Set<string>();
    const photos = [...baseline, ...legacy].filter((p) => {
      const k = `${p.checkpointId}:${p.view}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    tracking.initForProgram(program.orderId, taskLog, photos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.program?.orderId, tracking.programId]);
}
