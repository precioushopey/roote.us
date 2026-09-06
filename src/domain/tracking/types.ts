import type { HairAnalysis } from '@/domain/analysis/types';
import type { GrayProfile } from '@/domain/analysis/grayProfile';
import type { ProgramDurationDays } from '@/domain/program/types';

/**
 * Tracking data model (spec §16). These entities are the canonical shape the
 * dashboard reads and a real backend would persist. The concept build stores
 * them in `store/tracking.tsx` (localStorage + IndexedDB for blobs); the UI
 * never keeps tracking state only in a component.
 *
 * `buildUserProgram()` aggregates a `Program` (frozen at checkout) + the mutable
 * `TrackingState` + the diagnosis baseline into the `UserProgram` view below.
 */

export type PhotoView = 'front' | 'top' | 'crown' | 'hairline';
export const PHOTO_VIEWS: PhotoView[] = ['front', 'top', 'crown', 'hairline'];

export type TimeOfDay = 'morning' | 'evening' | 'shampoo';

export type CheckpointType = 'baseline' | 'photo' | 'scan' | 'final-scan';

export type ScanType = 'baseline' | 'progress' | 'final';

export type TaskStatus = 'pending' | 'done' | 'skipped';

/** Reminder categories to architect for (spec §15). Delivery (push/email/SMS)
 *  is wired later — this is the data + UI layer. */
export type ReminderType =
  | 'daily-treatment'
  | 'shampoo-day'
  | 'supplement'
  | 'progress-photo'
  | 'progress-scan'
  | 'final-scan'
  | 'reorder'
  | 'shipment'
  | 'program-completion';

/** A qualitative-first measurement. `value`/`unit` stay null until a real
 *  provider returns a number; `status` is the human-readable qualitative read. */
export type HairMetric = {
  key: MetricKey;
  /** qualitative read, always present */
  status: string;
  /** numeric value — only set by a real (non-mock) provider */
  value: number | null;
  unit: string | null;
  provider: string;
  isMock: boolean;
  confidence: number | null;
  capturedAt: string; // ISO
};

export type MetricKey =
  | 'hair-density'
  | 'visible-thinning'
  | 'hairline'
  | 'loss-area'
  | 'scalp-condition'
  | 'gray-pattern';

export const METRIC_KEYS: MetricKey[] = [
  'hair-density',
  'visible-thinning',
  'hairline',
  'loss-area',
  'scalp-condition',
  'gray-pattern',
];

export type HairPhoto = {
  id: string;
  /** id of the checkpoint this photo belongs to (baseline photos → 'baseline') */
  checkpointId: string;
  view: PhotoView;
  capturedAt: string; // ISO
  blobId: string;
  thumb: string; // data URL
};

export type HairScan = {
  id: string;
  type: ScanType;
  provider: string;
  isMock: boolean;
  capturedAt: string; // ISO
  metrics: HairMetric[];
  /** HairPhoto ids captured for this scan */
  imageRefs: string[];
  /** frozen analysis snapshot for a baseline scan */
  analysis?: HairAnalysis;
  grayProfile?: GrayProfile | null;
};

export type ProgressCheckpoint = {
  id: string;
  /** 1-based program day the checkpoint is scheduled for (0 = baseline) */
  day: number;
  type: CheckpointType;
  scheduledDate: string; // YYYY-MM-DD
  completedDate: string | null;
};

export type TreatmentTask = {
  key: string; // stable — matches the completion log
  productId: string; // slug or treatment key
  name: string; // resolved for the current locale
  timeOfDay: TimeOfDay;
  /** e.g. "2 capsules", "Apply to the areas of concern" */
  doseLabel: string;
  frequencyLabel: string;
  status: TaskStatus;
};

export type ProgramStatus = 'on-track' | 'keep-going' | 'catch-up' | 'complete';

/** The aggregated dashboard view. */
export type UserProgram = {
  id: string; // program orderId
  durationDays: ProgramDurationDays;
  startDate: string;
  endDate: string;
  today: string;
  currentDay: number; // 1..durationDays
  daysCompleted: number;
  daysRemaining: number;
  pct: number; // 0..100
  status: ProgramStatus;
  nextCheckpoint: ProgressCheckpoint | null;
  checkpoints: ProgressCheckpoint[];
  /** rolling 7-day adherence, 0..100 (not a medical outcome) */
  adherencePct: number;
  reorderDate: string;
  reorderDue: boolean;
};

export type Reminder = {
  id: string;
  type: ReminderType;
  /** ISO date it becomes relevant */
  dueDate: string;
  /** i18n key for the label */
  labelKey: string;
  enabled: boolean;
};

/** Mutable, persisted tracking state (the localStorage stand-in for a backend). */
export type TrackingState = {
  /** orderId of the Program this state belongs to; a mismatch triggers re-init. */
  programId: string | null;
  /** isoDate -> taskKey -> status */
  taskLog: Record<string, Record<string, TaskStatus>>;
  photos: HairPhoto[];
  scans: HairScan[];
  /** checkpointId -> completedDate */
  checkpointLog: Record<string, string>;
  /** checkpointIds the user chose to skip (PO #17 — never blocks, never hides) */
  skippedCheckpoints: string[];
  /** ReminderType -> enabled */
  reminderSettings: Partial<Record<ReminderType, boolean>>;
};

export const EMPTY_TRACKING: TrackingState = {
  programId: null,
  taskLog: {},
  photos: [],
  scans: [],
  checkpointLog: {},
  skippedCheckpoints: [],
  reminderSettings: {},
};
