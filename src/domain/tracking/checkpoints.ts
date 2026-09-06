import type { ProgramDurationDays } from '@/domain/program/types';
import type { CheckpointType, ProgressCheckpoint, TrackingState } from './types';

/**
 * Per-duration checkpoint schedule (spec §3; PO decision #14, 2026-09-04 —
 * supersedes the earlier ⅓/⅔ proposal).
 *
 * Rule: a progress photo every 30 days; a formal analysis scan every 90 days
 * (day 90 / 180 / 270); a final scan on the last day. A 30-day mark that lands on
 * a scan or the final day is that scan, not a photo. Change here only; every
 * screen derives from `buildCheckpoints`.
 */
type CheckpointDef = { day: number; type: CheckpointType };

const everyN = (step: number, end: number): number[] => {
  const out: number[] = [];
  for (let d = step; d < end; d += step) out.push(d);
  return out;
};

const TYPE_RANK: Record<CheckpointType, number> = { baseline: 0, photo: 1, scan: 2, 'final-scan': 3 };

function schedule(photoDays: number[], scanDays: number[], durationDays: number): CheckpointDef[] {
  const defs: CheckpointDef[] = [{ day: 0, type: 'baseline' }];
  for (const d of photoDays) defs.push({ day: d, type: 'photo' });
  for (const d of scanDays) defs.push({ day: d, type: 'scan' });
  defs.push({ day: durationDays, type: 'final-scan' });
  // One checkpoint per day — where a photo day and a scan day collide, the scan
  // wins (a scan captures the same four views).
  const byDay = new Map<number, CheckpointType>();
  for (const d of defs) {
    const cur = byDay.get(d.day);
    if (cur === undefined || TYPE_RANK[d.type] > TYPE_RANK[cur]) byDay.set(d.day, d.type);
  }
  return [...byDay.entries()].map(([day, type]) => ({ day, type })).sort((a, b) => a.day - b.day);
}

/** photos every 30d, scans at 90/180/270 (when inside the program), final on the last day */
function poSchedule(durationDays: number): CheckpointDef[] {
  const scanDays = [90, 180, 270].filter((d) => d < durationDays);
  const photoDays = everyN(30, durationDays).filter((d) => !scanDays.includes(d));
  return schedule(photoDays, scanDays, durationDays);
}

export const CHECKPOINT_SCHEDULE: Record<ProgramDurationDays, CheckpointDef[]> = {
  90: poSchedule(90),
  120: poSchedule(120),
  180: poSchedule(180),
  270: poSchedule(270),
  360: poSchedule(360),
};

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Materialize the schedule for a program, folding in completion dates. */
export function buildCheckpoints(
  durationDays: ProgramDurationDays,
  startDate: string,
  checkpointLog: TrackingState['checkpointLog'] = {},
): ProgressCheckpoint[] {
  return CHECKPOINT_SCHEDULE[durationDays].map((def) => {
    const id = `${def.type}-d${def.day}`;
    return {
      id,
      day: def.day,
      type: def.type,
      scheduledDate: addDays(startDate, def.day),
      completedDate: checkpointLog[id] ?? null,
    };
  });
}

/** The next checkpoint the user has not completed or skipped, by day. `null` when done. */
export function nextCheckpoint(
  checkpoints: ProgressCheckpoint[],
  currentDay: number,
  skipped: readonly string[] = [],
): ProgressCheckpoint | null {
  const pending = checkpoints
    .filter((c) => c.type !== 'baseline' && !c.completedDate && !skipped.includes(c.id))
    .sort((a, b) => a.day - b.day);
  // prefer the first not-yet-past checkpoint; fall back to the earliest overdue
  return pending.find((c) => c.day >= currentDay) ?? pending[0] ?? null;
}

export type CheckpointState = 'completed' | 'skipped' | 'due' | 'overdue' | 'upcoming';

export function checkpointState(
  cp: ProgressCheckpoint,
  currentDay: number,
  skipped = false,
): CheckpointState {
  if (cp.completedDate) return 'completed';
  if (cp.type === 'baseline') return 'completed';
  if (skipped) return 'skipped';
  if (currentDay > cp.day + 7) return 'overdue'; // shown as "Past due" — never blocks (PO #17)
  if (currentDay >= cp.day - 3) return 'due';
  return 'upcoming';
}
