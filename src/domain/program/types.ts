import type { HairAnalysis } from '@/domain/analysis/types';
import type { ReportModel } from '@/domain/report/types';

export type ProgramDurationDays = 90 | 120 | 180 | 270 | 360;

/** One row of ReportModel.plan.core — frozen at checkout time (carries per-zone `appliesToLabels`). */
export type Treatment = ReportModel['plan']['core'][number];

/** One row of ReportModel.plan.supporting — like Treatment but without per-zone targeting. */
export type SupportingTreatment = ReportModel['plan']['supporting'][number];

export type ProgressPhoto = {
  id: string;
  isoDate: string; // YYYY-MM-DD
  angleKey: 'front' | 'top' | 'crown' | 'hairline';
  blobId: string;
  thumb: string;
};

export type Reminder = {
  taskKey: string;
  times: string[]; // "HH:mm"
  enabled: boolean;
};

export type Program = {
  orderId: string;
  reportId: string;
  analysisSnapshot: HairAnalysis;
  durationDays: ProgramDurationDays;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD, startDate + durationDays
  plan: { core: Treatment[]; supporting: SupportingTreatment[] };
  completionLog: Record<string, string[]>; // isoDate -> taskKey[]
  progressPhotos: ProgressPhoto[];
  reminders: Reminder[];
};
