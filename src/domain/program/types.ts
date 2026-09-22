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
  /** When checkout completed — always set, immutable. */
  orderedAt: string; // YYYY-MM-DD
  /** Day 0 of the routine. `null` until the customer confirms their package
   *  arrived (see `store/program.ts`'s `confirmDelivery`) — `AppShell` shows
   *  a pre-delivery landing screen instead of the dashboard while this is
   *  `null`, so every other /account/* screen can treat it as set. */
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD, startDate + durationDays; null until startDate is set
  plan: { core: Treatment[]; supporting: SupportingTreatment[] };
  completionLog: Record<string, string[]>; // isoDate -> taskKey[]
  progressPhotos: ProgressPhoto[];
  reminders: Reminder[];
};
