import type { HairAnalysis } from '@/domain/analysis/types';
import type { ReportModel } from '@/domain/report/types';
import type { Program, ProgramDurationDays } from '@/domain/program/types';

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDate(d);
}

/** Builds a frozen Program from the just-purchased order. `startDate` stays
 *  `null` — the routine's Day 0 isn't set until `confirmDelivery` runs. Pure
 *  aside from reading `today`. */
export function buildProgram(input: {
  orderId: string;
  reportId: string;
  analysis: HairAnalysis;
  durationDays: ProgramDurationDays;
  plan: Pick<ReportModel['plan'], 'core' | 'supporting'>;
  today?: Date;
}): Program {
  const orderedAt = toIsoDate(input.today ?? new Date());
  return {
    orderId: input.orderId,
    reportId: input.reportId,
    analysisSnapshot: input.analysis,
    durationDays: input.durationDays,
    orderedAt,
    startDate: null,
    endDate: null,
    plan: { core: input.plan.core, supporting: input.plan.supporting },
    completionLog: {},
    progressPhotos: [],
    reminders: [],
  };
}

/** Confirms the package arrived — sets Day 0 to `today` and computes
 *  `endDate` from it. Pure; the caller persists the result via
 *  `session.setProgram`. */
export function confirmDelivery(program: Program, today?: Date): Program {
  const startDate = toIsoDate(today ?? new Date());
  return { ...program, startDate, endDate: addDays(startDate, program.durationDays) };
}
