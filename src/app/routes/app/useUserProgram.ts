import { useMemo } from 'react';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useTracking } from '@/store/tracking';
import { rooteContent } from '@/content/roote.config';
import { resolvePlanTreatments, planKeysForProgram, isoToday } from './programProgress';
import { buildUserProgram } from '@/domain/tracking/buildUserProgram';
import { tasksForDay, flattenRoutine, type ResolvedTreatment } from '@/domain/tracking/schedule';
import type { DayRoutine } from '@/domain/tracking/schedule';
import type { UserProgram } from '@/domain/tracking/types';

export type UserProgramView = {
  userProgram: UserProgram;
  treatments: { core: ResolvedTreatment[]; supporting: ResolvedTreatment[] };
  routine: DayRoutine;
  today: string;
};

/** The one hook every dashboard screen uses. Returns `null` until a program
 *  exists (AppShell guards that, so in practice it's always populated). */
export function useUserProgram(): UserProgramView | null {
  const t = useT();
  const { locale } = useLocale();
  const session = useSession();
  const tracking = useTracking();
  const today = isoToday();

  return useMemo(() => {
    if (!session.program) return null;
    const planKeys = planKeysForProgram(session.diagnosis, session.program.analysisSnapshot);
    const treatments = resolvePlanTreatments(t, locale, planKeys);
    const routine = tasksForDay(treatments, today, tracking.taskLog);
    const taskCountPerDay = flattenRoutine(tasksForDay(treatments, today)).length;
    const userProgram = buildUserProgram({
      program: session.program,
      tracking,
      today,
      reorderLeadDays: rooteContent.reorderLeadDays,
      taskCountPerDay,
    });
    return { userProgram, treatments, routine, today };
    // tracking is a new object each render; depend on its parts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session.program,
    session.diagnosis.concern,
    session.diagnosis.gender,
    locale,
    today,
    tracking.taskLog,
    tracking.checkpointLog,
    tracking.scans,
    tracking.skippedCheckpoints,
  ]);
}
