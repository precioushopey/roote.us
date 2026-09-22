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

export type AgeRange = '18_29' | '30_44' | '45_64' | '65_plus';
export type HairTexture = 'straight' | 'wavy' | 'curly' | 'coily';
export type StressLevel = 'mostly_peaceful' | 'moderately_stressed' | 'very_stressed';
export type VegetableIntake = 'usually_none' | 'one_two' | 'three_plus';
export type GrayHairLevel = 'none' | 'few' | 'about_half' | 'mostly_all';

export type Answers = {
  q1_area: 'hairline' | 'crown' | 'entire-scalp';
  q2_onset: OnsetBucket;
  q3_prior: 'never' | 'no-success' | 'partial';
  q4_family: 'yes' | 'no' | 'not-sure';
  q13_progression: ProgressionPattern;
  /** v3.1 §3 Step 2 — profile context only. */
  age_range?: AgeRange;
  /** v3.1 §3 Step 3 — profile context only. */
  previous_hair_products?: boolean;
  /** v3.1 §3 Step 3A — only asked when `previous_hair_products` is true. */
  satisfied_previous_products?: boolean;
  /** v3.1 §3 Step 5 — image-selected pattern code. Only asked when Hair Goal =
   *  Hair Growth; when present, `deriveAnalysis` uses it directly for `stage`
   *  instead of `q1_area` (design spec §10.1). `PatternCode` lives in
   *  `domain/recommendation/types.ts` — this field's own reference to it is
   *  `import type` only. `deriveAnalysis.ts` separately imports
   *  `stageForPattern` (a value, from `domain/recommendation/hairGrowthTable`)
   *  to resolve it, so `domain/analysis` does carry a real runtime dependency
   *  on `domain/recommendation` overall — both stay inside `src/domain/**`,
   *  so CLAUDE.md's purity rule (no React/DOM/storage/i18n-provider) still
   *  holds either way. */
  hair_pattern_id?: import('@/domain/recommendation/types').PatternCode;
  /** v3.1 §3 Step 6 — profile context only. */
  hair_texture?: HairTexture;
  /** v3.1 §3 Step 8 — profile context only. */
  stress_level?: StressLevel;
  /** v3.1 §3 Step 9 — profile context only. */
  vegetable_intake?: VegetableIntake;
  /** v3.1 §3 Step 10 — profile context only; not the same as `HairGoal =
   *  'slow-graying'`, which is what actually drives the Anti-Gray Capsules
   *  recommendation. */
  gray_hair_level?: GrayHairLevel;
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
