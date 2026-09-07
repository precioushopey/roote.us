import type { TimeOfDay, TreatmentTask, TaskStatus, TrackingState } from './types';

/** Minimal shape from `resolvePlanTreatments` — kept local so `domain/` stays
 *  free of app-layer imports. */
export type ResolvedTreatment = { key: string; name: string; frequency: string };

/**
 * How each treatment maps onto the day (spec §2 — MORNING / EVENING / SHAMPOO).
 *
 * [TODO: confirm with client] — slot + dose per product, and whether the Density
 * program includes an oral component. Keyed by the treatment `key` from
 * `resolvePlanTreatments`; unknown keys fall back to a single evening task.
 */
type SlotDef = { timeOfDay: TimeOfDay; dose: string };

const SLOTS: Record<string, SlotDef[]> = {
  // core
  'roote-topical': [
    { timeOfDay: 'morning', dose: 'app.today.dose.applyScalp' },
    { timeOfDay: 'evening', dose: 'app.today.dose.applyScalp' },
  ],
  'density-serum': [{ timeOfDay: 'evening', dose: 'app.today.dose.applyScalp' }],
  'density-6': [{ timeOfDay: 'evening', dose: 'app.today.dose.applyScalp' }],
  'density-10': [{ timeOfDay: 'evening', dose: 'app.today.dose.applyScalp' }],
  'density-15': [{ timeOfDay: 'evening', dose: 'app.today.dose.applyScalp' }],
  // supporting
  'derma-stim': [{ timeOfDay: 'evening', dose: 'app.today.dose.weekly' }],
  cleanser: [{ timeOfDay: 'shampoo', dose: 'app.today.dose.shampoo' }],
  'regrowth-shampoo': [{ timeOfDay: 'shampoo', dose: 'app.today.dose.shampoo' }],
  'gray-support': [{ timeOfDay: 'morning', dose: 'app.today.dose.capsules2' }],
  'gray-serum': [{ timeOfDay: 'evening', dose: 'app.today.dose.serum' }],
};

const DEFAULT_SLOT: SlotDef[] = [{ timeOfDay: 'evening', dose: 'app.today.dose.applyScalp' }];

export type DayRoutine = Record<TimeOfDay, TreatmentTask[]>;

/**
 * The tasks for a given program day, grouped by time of day. Pure — `statusFor`
 * looks up the persisted `taskLog` for the date (defaulting to 'pending').
 */
export function tasksForDay(
  treatments: { core: ResolvedTreatment[]; supporting: ResolvedTreatment[] },
  isoDate: string,
  taskLog: TrackingState['taskLog'] = {},
): DayRoutine {
  const routine: DayRoutine = { morning: [], evening: [], shampoo: [] };
  const dayLog = taskLog[isoDate] ?? {};

  const emit = (tr: ResolvedTreatment) => {
    const defs = SLOTS[tr.key] ?? DEFAULT_SLOT;
    defs.forEach((def, i) => {
      const key = defs.length > 1 ? `${tr.key}:${def.timeOfDay}` : tr.key;
      const task: TreatmentTask = {
        key,
        productId: tr.key,
        name: tr.name,
        timeOfDay: def.timeOfDay,
        doseLabel: def.dose,
        frequencyLabel: tr.frequency,
        status: (dayLog[key] as TaskStatus) ?? 'pending',
      };
      routine[def.timeOfDay].push(task);
      void i;
    });
  };

  treatments.core.forEach(emit);
  treatments.supporting.forEach(emit);
  return routine;
}

export function flattenRoutine(routine: DayRoutine): TreatmentTask[] {
  return [...routine.morning, ...routine.evening, ...routine.shampoo];
}

/** Old flat completion-log keys (`core:0`, `support:1`) → new per-slot keys,
 *  by position, for the one-time migration. */
export function migrateTaskKeys(
  oldKeys: string[],
  treatments: { core: ResolvedTreatment[]; supporting: ResolvedTreatment[] },
): string[] {
  const flat = flattenRoutine(tasksForDay(treatments, '1970-01-01'));
  const byPos: string[] = [
    ...treatments.core.flatMap((_, i) => flat.filter((t) => t.productId === treatments.core[i].key).map((t) => t.key)),
    ...treatments.supporting.flatMap((_, i) =>
      flat.filter((t) => t.productId === treatments.supporting[i].key).map((t) => t.key),
    ),
  ];
  const idx = (k: string): number => {
    const m = /^(core|support):(\d+)$/.exec(k);
    if (!m) return -1;
    const base = m[1] === 'core' ? 0 : treatments.core.length;
    return base + Number(m[2]);
  };
  return oldKeys.map((k) => byPos[idx(k)] ?? k).filter((v, i, a) => a.indexOf(v) === i);
}
