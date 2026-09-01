import type { HairAnalysis } from '@/domain/analysis/types';
import type { ReportModel } from '@/domain/report/types';

export type ProgramDurationDays = 90 | 120 | 180 | 270 | 360;

/** Same shape as one row of ReportModel.plan.core/supporting — frozen at checkout time. */
export type Treatment = ReportModel['plan']['core'][number];

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
  plan: { core: Treatment[]; supporting: Treatment[] };
  completionLog: Record<string, string[]>; // isoDate -> taskKey[]
  progressPhotos: ProgressPhoto[];
  reminders: Reminder[];
};
