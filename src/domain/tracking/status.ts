import type { ProgramStatus } from './types';

const DAY_MS = 86_400_000;

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}
function shiftIso(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** 1-based program day, clamped to [1, durationDays]. */
export function programDay(startDate: string, durationDays: number, today: string): number {
  return Math.min(durationDays, Math.max(1, daysBetween(startDate, today) + 1));
}

/**
 * Program status (spec §1; PO decision #16, 2026-09-04). Not a medical judgement —
 * a tiered read of routine-completion only. Missed checkpoints do NOT set the
 * status (they get a "Past due" label instead — PO #17).
 *
 *  complete   — the program has ended
 *  on-track   — rolling adherence 80–100% (or still inside the grace window)
 *  keep-going — rolling adherence 60–79%
 *  catch-up   — rolling adherence below 60%
 *
 * Status is not computed until the grace window has elapsed (a brand-new program
 * always reads on-track). No red / error styling for any of these.
 */
export const ADHERENCE_THRESHOLD = 60;
export const ADHERENCE_ON_TRACK = 80;
export const ADHERENCE_GRACE_DAYS = 7;

export function deriveStatus(
  currentDay: number,
  durationDays: number,
  adherencePct: number,
): ProgramStatus {
  if (currentDay >= durationDays) return 'complete';
  if (currentDay <= ADHERENCE_GRACE_DAYS) return 'on-track';
  if (adherencePct >= ADHERENCE_ON_TRACK) return 'on-track';
  if (adherencePct >= ADHERENCE_THRESHOLD) return 'keep-going';
  return 'catch-up';
}

/**
 * Rolling completion rate over the last `days` days as a 0–100 integer.
 * A task counts if its status is `done` (a `skipped` task does not).
 */
export function adherencePct(
  taskLog: Record<string, Record<string, string>>,
  taskCountPerDay: number,
  today: string,
  days = 7,
): number {
  if (taskCountPerDay === 0) return 0;
  let done = 0;
  for (let i = 0; i < days; i += 1) {
    const day = taskLog[shiftIso(today, -i)] ?? {};
    done += Object.values(day).filter((s) => s === 'done').length;
  }
  return Math.min(100, Math.round((done / (taskCountPerDay * days)) * 100));
}
