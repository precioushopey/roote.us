// 'unspecified' = "Prefer not to say" (PO #24). Uses the finer Norwood scale for
// the visual assessment; the report leads with severity bands, not the scale name.
export type Gender = 'male' | 'female' | 'unspecified';

/**
 * The customer's stated goal (client-confirmed 2026-09-07, Ilay/Marwell thread).
 * Single-select — the source specification has no combined option. Drives both
 * which follow-up questions appear (`questionsForHairGoal`) and which product
 * family the recommendation engine considers (`domain/recommendation`).
 */
export type HairGoal = 'thicker-fuller' | 'slow-graying' | 'stop-loss' | 'hair-growth' | 'other';

export type ZoneKey = 'frontal-hairline' | 'temples' | 'mid-scalp' | 'crown-vertex';
export type Level = 'low' | 'medium' | 'high';
export type SeverityBand = 'mild' | 'moderate' | 'established';
export type PlanEmphasis = 'stabilize' | 'regrow' | 'stabilize-regrow';

/** Q12 (client-confirmed) — "How long have you been noticing hair loss or thinning?" */
export type OnsetBucket = 'lt-6mo' | '6-12mo' | '1-3y' | 'gt-3y';

/**
 * Q13 (client-confirmed) — "How would you describe the way your hair loss developed?"
 * A routing/safety signal, never a diagnosis: `sudden`/`patchy` hold the automatic
 * treatment recommendation (`PROFESSIONAL_REVIEW_RECOMMENDED`); `unsure` only sets
 * `analysisContextUncertain` on the recommendation outcome.
 */
export type ProgressionPattern = 'gradual' | 'sudden' | 'patchy' | 'unsure';

/**
 * Health History (client-confirmed multi-select). `'none'` is exclusive with every
 * other value — enforced where the answer is written (`sessionStore.setHealthHistory`),
 * not just in the UI, so the invariant holds regardless of entry order. Stored as
 * context/safety information only; no treatment exclusion is derived from it yet.
 */
export type HealthCondition = 'thyroid' | 'anemia' | 'autoimmune' | 'cancer' | 'glp1' | 'none';

export type Answers = {
  q1_area: 'hairline' | 'crown' | 'entire-scalp';
  q2_onset: OnsetBucket;
  q3_prior: 'never' | 'no-success' | 'partial';
  q4_family: 'yes' | 'no' | 'not-sure';
  q13_progression: ProgressionPattern;
};

export type HairAnalysis = {
  scale: 'norwood' | 'ludwig';
  stage: number;
  severityBand: SeverityBand;
  flaggedZones: { zone: ZoneKey; severity: 'mild' | 'moderate'; noteKey: string }[];
  densityByZone: { zone: ZoneKey; level: Level }[];
  metrics: { key: string; level: Level }[];
  notes: string[];
  planEmphasis: PlanEmphasis;
  summaryPlainKey: string;
  recommendedDurationDays: 90 | 120 | 180 | 270 | 360;
};
