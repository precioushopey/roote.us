import { rooteContent } from '@/content/roote.config';
import { recommend } from '@/domain/recommendation/recommend';
import { planKeysFor } from '@/domain/recommendation/planKeys';
import type { Answers, Gender, HairAnalysis, HairGoal } from '@/domain/analysis/types';
import type { Program } from '@/domain/program/types';
import type { MessageKey } from '@/i18n/messages';
import { type LocaleCode, contentLocaleOf } from '@/i18n/locales';

const DAY_MS = 86_400_000;

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

export type ResolvedTreatment = {
  key: string;
  name: string;
  usage: string;
  frequency: string;
  appliesToLabels: string[];
};

/**
 * Which `treatmentRegistry` keys this customer's program actually includes
 * (Hair-Goal-branched, client-confirmed 2026-09-07). Recomputed from the frozen
 * `analysisSnapshot` + the (effectively immutable, post-purchase) diagnosis
 * rather than stored on `Program`, so it stays derivable and never drifts from
 * the recommendation engine.
 */
export function planKeysForProgram(
  diagnosis: { hairGoal: HairGoal | null; gender: Gender | null; answers: Partial<Answers> },
  analysis: HairAnalysis | null,
): { core: string[]; supporting: string[] } {
  if (!analysis || !diagnosis.gender) return { core: [], supporting: [] };
  const outcome = recommend({
    hairGoal: diagnosis.hairGoal ?? 'other',
    gender: diagnosis.gender,
    scale: analysis.scale,
    stage: analysis.stage,
    severityBand: analysis.severityBand,
    planEmphasis: analysis.planEmphasis,
    progression: diagnosis.answers.q13_progression ?? 'gradual',
    recommendedDurationDays: analysis.recommendedDurationDays,
  });
  return planKeysFor(outcome);
}

/**
 * The post-purchase plan, resolved into the *current* locale from config.
 *
 * `program.plan` is a frozen snapshot of what was purchased; `planKeys` (from
 * `planKeysForProgram`) says *which* products that snapshot should contain, and
 * this resolves their display strings — so "My Plan" and "Today" re-localize
 * when the language is switched instead of being stuck in the checkout locale.
 * Names fall back to English where a Hebrew string is not yet in config.
 */
export function resolvePlanTreatments(
  t: Translate,
  locale: LocaleCode,
  planKeys: { core: string[]; supporting: string[] },
): {
  core: ResolvedTreatment[];
  supporting: ResolvedTreatment[];
} {
  const cl = contentLocaleOf(locale);
  const one = (key: string): ResolvedTreatment => {
    const tr = rooteContent.treatmentRegistry[key];
    if (!tr) return { key, name: key, usage: '', frequency: '', appliesToLabels: [] };
    return {
      key,
      name: tr.name[cl] || tr.name.en,
      usage: t(tr.usageKey as MessageKey),
      frequency: t(tr.frequencyKey as MessageKey),
      appliesToLabels: (tr.appliesToZones ?? []).map((z) => t(`zone.${z}` as MessageKey)),
    };
  };
  return {
    core: planKeys.core.map(one),
    supporting: planKeys.supporting.map(one),
  };
}

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

/**
 * Flattens the resolved core + supporting treatments into one stable-keyed task
 * list. Keys (`core:N` / `support:N`) match the entries in `completionLog`.
 */
export function dailyTasks(resolved: {
  core: ResolvedTreatment[];
  supporting: ResolvedTreatment[];
}): DailyTask[] {
  return [
    ...resolved.core.map((tr, i) => ({ key: `core:${i}`, name: tr.name, usage: tr.usage, frequency: tr.frequency })),
    ...resolved.supporting.map((tr, i) => ({ key: `support:${i}`, name: tr.name, usage: tr.usage, frequency: tr.frequency })),
  ];
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
