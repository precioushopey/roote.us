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

/** Builds a frozen Program from the just-purchased order. Pure aside from reading `today`. */
export function buildProgram(input: {
  orderId: string;
  reportId: string;
  analysis: HairAnalysis;
  durationDays: ProgramDurationDays;
  plan: Pick<ReportModel['plan'], 'core' | 'supporting'>;
  today?: Date;
}): Program {
  const startDate = toIsoDate(input.today ?? new Date());
  return {
    orderId: input.orderId,
    reportId: input.reportId,
    analysisSnapshot: input.analysis,
    durationDays: input.durationDays,
    startDate,
    endDate: addDays(startDate, input.durationDays),
    plan: { core: input.plan.core, supporting: input.plan.supporting },
    completionLog: {},
    progressPhotos: [],
    reminders: [],
  };
}
