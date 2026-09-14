import { useTracking } from '@/store/tracking';
import { generateReminders } from '@/domain/tracking/reminders';
import { rooteContent } from '@/content/roote.config';
import { useUserProgram } from './useUserProgram';

const shiftIso = (iso: string, delta: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

/** Every enabled reminder that's due today or later — shared by AccountToday's
 *  "coming up" card and the account header's bell badge (which shows the full
 *  count, not just however many rows a caller chooses to display). Empty when
 *  there's no active program (AppProfile is reachable without one). */
export function useUpcomingReminders() {
  const tracking = useTracking();
  const view = useUserProgram();
  if (!view) return [];
  const { userProgram: up, today } = view;
  return generateReminders({
    checkpoints: up.checkpoints,
    endDate: up.endDate,
    reorderDates: rooteContent.reorderReminderLeadDays.map((d) => shiftIso(up.endDate, -d)),
    skipped: tracking.skippedCheckpoints,
    settings: tracking.reminderSettings,
  }).filter((r) => r.enabled && r.dueDate >= today);
}
