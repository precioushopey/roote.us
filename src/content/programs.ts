import { L, type LocalizedText } from './localized';

/**
 * Program compositions and durations (brief §15). A program sells a *process*:
 * targeted treatments + support products + tracking, over a supply period.
 *
 * No prices, savings, or per-day figures are invented — `price` / `perDay` are
 * `null` and render as [PENDING] until the client supplies a price list
 * (OQ-BIZ-1). Density components stay eligibility-gated (brief §9).
 */

export type ProgramKind = 'density' | 'gray' | 'complete';

export type ProgramDef = {
  kind: ProgramKind;
  name: LocalizedText;
  summary: LocalizedText;
  /** Product slugs that make up the program. Density slots resolve to a tier
   *  suggested by the assessment + confirmed at review. */
  coreSlots: Array<'density-tier' | string>;
  supportingSlugs: string[];
  requiresMedicalReview: boolean;
};

export const PROGRAMS: Record<ProgramKind, ProgramDef> = {
  density: {
    kind: 'density',
    name: L('Density Program', 'תוכנית Density'),
    summary: L(
      'A recommended Density treatment plus the Regrowth Shampoo, for visible thinning.',
      'טיפול Density מומלץ יחד עם שמפו Regrowth, לשיער דליל נראה לעין.',
    ),
    coreSlots: ['density-tier'],
    supportingSlugs: ['regrowth-shampoo'],
    requiresMedicalReview: true,
  },
  gray: {
    kind: 'gray',
    name: L('Gray Program', 'תוכנית Gray'),
    summary: L(
      'Gray Support capsules and Gray Serum: a coordinated inside + topical routine.',
      'קפסולות Gray Support וסרום Gray: שגרה מתואמת מבפנים ומבחוץ.',
    ),
    coreSlots: ['gray-support', 'gray-serum'],
    supportingSlugs: [],
    requiresMedicalReview: false,
  },
  complete: {
    kind: 'complete',
    name: L('Complete Program', 'תוכנית מלאה'),
    summary: L(
      'A personalized Density treatment where eligible, the Regrowth Shampoo, and the full Gray routine.',
      'טיפול Density אישי במידת ההתאמה, שמפו Regrowth, ושגרת Gray המלאה.',
    ),
    coreSlots: ['density-tier'],
    supportingSlugs: ['regrowth-shampoo', 'gray-support', 'gray-serum'],
    requiresMedicalReview: true,
  },
};

export type DurationDays = 90 | 120 | 180 | 270 | 360;

export type DurationTier = 'start' | 'recommended' | 'best-value' | 'personalized';

export type ProgramDuration = {
  days: DurationDays;
  /** Marketing emphasis (brief §11, §15). 120 / 270 are personalized-only. */
  tier: DurationTier;
  label: LocalizedText;
  /** All money is [PENDING] until supplied. */
  price: number | null;
  perDay: number | null;
  savingsPct: number | null;
};

export const PROGRAM_DURATIONS: ProgramDuration[] = [
  { days: 90, tier: 'start', label: L('90 days', '90 יום'), price: null, perDay: null, savingsPct: null },
  { days: 120, tier: 'personalized', label: L('120 days', '120 יום'), price: null, perDay: null, savingsPct: null },
  { days: 180, tier: 'recommended', label: L('180 days', '180 יום'), price: null, perDay: null, savingsPct: null },
  { days: 270, tier: 'personalized', label: L('270 days', '270 יום'), price: null, perDay: null, savingsPct: null },
  { days: 360, tier: 'best-value', label: L('360 days', '360 יום'), price: null, perDay: null, savingsPct: null },
];

/** The three durations the marketing UI leads with. */
export const HEADLINE_DURATIONS: DurationDays[] = [90, 180, 360];

export const DURATION_TIER_LABEL: Record<DurationTier, LocalizedText> = {
  start: L('Start', 'התחלה'),
  recommended: L('Recommended', 'מומלץ'),
  'best-value': L('Best value', 'הכי משתלם'),
  personalized: L('Personalized', 'אישי'),
};

export function getDuration(days: DurationDays): ProgramDuration | undefined {
  return PROGRAM_DURATIONS.find((d) => d.days === days);
}
