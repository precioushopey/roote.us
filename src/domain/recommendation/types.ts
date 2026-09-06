import type { Gender, SeverityBand, PlanEmphasis } from '@/domain/analysis/types';

/** What the visitor said they want to understand (assessment step 3 / gray branch). */
export type Concern = 'thinning' | 'gray' | 'both';

/** Packaging/presentation theme only — never a treatment-strength input (brief §7). */
export type GenderPresentation = 'men' | 'women';

export type ProgramKind = 'density' | 'gray' | 'complete';

/**
 * A *suggested* Density tier to raise at medical review. The engine never emits
 * `density-15` automatically — the intensive concept is clinician-gated (brief §9).
 */
export type DensityTier = 'density-6' | 'density-10';

export type EligibilityStatus = 'requires-review' | 'not-required';

export type RecommendationInput = {
  concern: Concern;
  gender: Gender;
  severityBand: SeverityBand;
  planEmphasis: PlanEmphasis;
  /** From `HairAnalysis.recommendedDurationDays` — the engine passes it through, never overrides it. */
  recommendedDurationDays: 90 | 120 | 180 | 270 | 360;
};

export type RecommendationOutcome = {
  programKind: ProgramKind;
  /** Discussion suggestion only. `null` for gray-only programs. */
  densityTier: DensityTier | null;
  /** Product slugs from `content/products.ts`. */
  supportingProductKeys: string[];
  /** True whenever a prescription-strength Density component is in the outcome. */
  requiresMedicalReview: boolean;
  eligibilityStatus: EligibilityStatus;
  recommendedDurationDays: RecommendationInput['recommendedDurationDays'];
  packaging: GenderPresentation;
  /** True when the assessment profile is severe enough that a higher Density
   *  tier *may* be discussed at review — surfaced as safe, non-prescriptive copy. */
  strongerTierNote: boolean;
  /** i18n key for the plain-language rationale. */
  rationaleKey: string;
  /** Which rule fired — traceability, shown in dev / audits. */
  ruleId: string;
};

export type RecommendationRule = {
  id: string;
  /** Human note — why this rule exists. Not rendered. */
  note: string;
  when: (input: RecommendationInput) => boolean;
  outcome: (
    input: RecommendationInput,
  ) => Omit<RecommendationOutcome, 'recommendedDurationDays' | 'packaging' | 'ruleId'>;
};
