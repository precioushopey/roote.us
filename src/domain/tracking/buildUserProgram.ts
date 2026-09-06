import type { Program } from '@/domain/program/types';
import type { TrackingState, UserProgram } from './types';
import { buildCheckpoints, nextCheckpoint } from './checkpoints';
import { programDay, deriveStatus, adherencePct } from './status';

const DAY_MS = 86_400_000;
function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}
function shiftIso(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Aggregates a frozen `Program` + the mutable `TrackingState` into the
 * `UserProgram` view the dashboard reads. Pure; `reorderLeadDays` +
 * `taskCountPerDay` are passed in so `domain/` stays free of config/app imports.
 */
export function buildUserProgram(input: {
  program: Program;
  tracking: TrackingState;
  today: string;
  reorderLeadDays: number;
  /** number of tasks that recur every day — the adherence denominator */
  taskCountPerDay: number;
}): UserProgram {
  const { program, tracking, today, reorderLeadDays, taskCountPerDay } = input;
  const { durationDays, startDate, endDate } = program;

  const currentDay = programDay(startDate, durationDays, today);
  const rawDay = daysBetween(startDate, today) + 1;
  const daysCompleted = Math.max(0, Math.min(durationDays, rawDay - 1));
  const daysRemaining = Math.max(0, durationDays - daysCompleted);
  const pct = Math.round((daysCompleted / durationDays) * 100);

  const checkpoints = buildCheckpoints(durationDays, startDate, tracking.checkpointLog);
  const adherence = adherencePct(tracking.taskLog, taskCountPerDay, today);
  const status = deriveStatus(currentDay, durationDays, adherence);

  const reorderDate = shiftIso(endDate, -reorderLeadDays);
  const reorderDue = daysBetween(today, endDate) <= reorderLeadDays;

  return {
    id: program.orderId,
    durationDays,
    startDate,
    endDate,
    today,
    currentDay,
    daysCompleted,
    daysRemaining,
    pct,
    status,
    nextCheckpoint: nextCheckpoint(checkpoints, currentDay, tracking.skippedCheckpoints),
    checkpoints,
    adherencePct: adherence,
    reorderDate,
    reorderDue,
  };
}
