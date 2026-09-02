import { rooteContent } from '@/content/roote.config';
import { isPending } from '@/content/pending';
import type { Program } from '@/domain/program/types';

const DAY_MS = 86_400_000;

export function isoToday(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
}

function shiftIso(iso: string, deltaDays: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

/** 1-based day within the program, clamped to [1, durationDays]. */
export function programDay(program: Program, today: string = isoToday()): number {
  return Math.min(program.durationDays, Math.max(1, daysBetween(program.startDate, today) + 1));
}

export function daysRemaining(program: Program, today: string = isoToday()): number {
  return Math.max(0, daysBetween(today, program.endDate));
}

export function reorderDate(program: Program): string {
  return shiftIso(program.endDate, -rooteContent.reorderLeadDays);
}

export function isReorderDue(program: Program, today: string = isoToday()): boolean {
  return daysRemaining(program, today) <= rooteContent.reorderLeadDays;
}

export type DailyTask = { key: string; name: string; usage: string; frequency: string };

/** Flattens core + supporting treatments into one stable-keyed task list. */
export function dailyTasks(program: Program, pendingName: string): DailyTask[] {
  const rows = [
    ...program.plan.core.map((tr, i) => ({ tr, key: `core:${i}` })),
    ...program.plan.supporting.map((tr, i) => ({ tr, key: `support:${i}` })),
  ];
  return rows.map(({ tr, key }) => ({
    key,
    name: isPending(tr.name) ? pendingName : tr.name,
    usage: tr.usage,
    frequency: tr.frequency,
  }));
}

export function tasksDoneOn(program: Program, iso: string): Set<string> {
  return new Set(program.completionLog[iso] ?? []);
}

/** Rolling completion rate over the last `days` days, as a 0–100 integer. */
export function adherencePct(program: Program, days = 7, today: string = isoToday()): number {
  const taskCount = program.plan.core.length + program.plan.supporting.length;
  if (taskCount === 0) return 0;
  let done = 0;
  for (let i = 0; i < days; i += 1) {
    done += (program.completionLog[shiftIso(today, -i)] ?? []).length;
  }
  return Math.min(100, Math.round((done / (taskCount * days)) * 100));
}

/** Care-team messages unlock as the program advances. */
export const CARE_MESSAGES: { day: number; key: string }[] = [
  { day: 1, key: 'app.care.msg.day1' },
  { day: 14, key: 'app.care.msg.day14' },
  { day: 45, key: 'app.care.msg.day45' },
  { day: 90, key: 'app.care.msg.day90' },
  { day: 180, key: 'app.care.msg.day180' },
];
