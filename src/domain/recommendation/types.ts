import type { Gender, HairGoal, PlanEmphasis, ProgressionPattern, SeverityBand } from '@/domain/analysis/types';

/** Packaging/presentation theme only — never a treatment-strength input (brief §7). */
export type GenderPresentation = 'men' | 'women';

/**
 * Client-confirmed priority states (Ilay/Marwell thread, 2026-09-07). Ordered —
 * `professional-review-recommended` outranks `requires-review` outranks `standard`,
 * and the highest-ranking status always wins regardless of which rule produced it.
 */
export type RecommendationStatus = 'standard' | 'requires-review' | 'professional-review-recommended';

/** Visual hair-loss pattern code the client's Hair Growth strength table is keyed
 *  on. Derived from `HairAnalysis.scale` + `.stage` — see `patternCodeFor`. */
export type PatternCode = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'F1' | 'F2' | 'F3' | 'F4';

export type HairGrowthStrength = 6 | 10 | 15;

/**
 * The confirmed-but-gated Hair Growth treatment-strength result. Always computed
 * (and unit-tested) when the pattern is known, even though `productionActive` is
 * false today — this is exactly the `business_rule_confirmed=true,
 * clinical_approval=pending, production_active=false` state Ilay asked for: ready
 * to flip on, never surfaced to a customer until it does.
 */
export type HairGrowthTier = {
  pattern: PatternCode;
  strengthPct: HairGrowthStrength;
  /** `treatmentRegistry` key this strength resolves to (density-6/10/15). */
  productKey: string;
};

export type RecommendationInput = {
  hairGoal: HairGoal;
  gender: Gender;
  scale: 'norwood' | 'ludwig';
  stage: number;
  severityBand: SeverityBand;
  planEmphasis: PlanEmphasis;
  progression: ProgressionPattern;
  /** From `HairAnalysis.recommendedDurationDays` — the engine passes it through, never overrides it. */
  recommendedDurationDays: 90 | 120 | 180 | 270 | 360;
};

export type RecommendationOutcome = {
  status: RecommendationStatus;
  /** From Q13 = "unsure" — informational only, never blocks a recommendation on its own. */
  analysisContextUncertain: boolean;
  /** `treatmentRegistry` key for the primary product, or `null` when no automatic
   *  recommendation is made (review-gated, or Hair Growth while non-production-active). */
  coreProductKey: string | null;
  supportingProductKeys: string[];
  /** False only for the Hair Growth strength tiers until clinical/regulatory
   *  approval is confirmed — see `HairGrowthTier`. True for every other goal. */
  productionActive: boolean;
  /** Populated whenever hairGoal is Hair Growth and a pattern was resolved,
   *  independent of whether it's shown to the customer. */
  hairGrowthTier: HairGrowthTier | null;
  requiresMedicalReview: boolean;
  recommendedDurationDays: RecommendationInput['recommendedDurationDays'];
  packaging: GenderPresentation;
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
  ) => Omit<
    RecommendationOutcome,
    'recommendedDurationDays' | 'packaging' | 'ruleId' | 'analysisContextUncertain'
  >;
};
