import type { Gender } from '@/domain/analysis/types';
import type {
  Concern,
  GenderPresentation,
  RecommendationInput,
  RecommendationOutcome,
} from './types';
import { RECOMMENDATION_RULES, RECOMMENDATION_FALLBACK } from './rules';

/** Packaging theme from the assessment's gender step — presentation only (brief §7). */
export function packagingFor(gender: Gender): GenderPresentation {
  return gender === 'male' ? 'men' : 'women';
}

/** Normalize the assessment's concern selection (thinning branch + gray branch). */
export function concernFrom(primary: 'thinning' | 'gray' | 'both'): Concern {
  return primary;
}

/**
 * Pure recommendation resolver. First matching rule wins. Returns i18n keys and
 * product slugs — no display strings, no React, no storage (domain purity).
 *
 * Density outcomes are always `requiresMedicalReview` + `requires-review`
 * eligibility: a program suggestion, never a prescription.
 */
export function recommend(input: RecommendationInput): RecommendationOutcome {
  const rule = RECOMMENDATION_RULES.find((r) => r.when(input));
  const base = rule ? rule.outcome(input) : RECOMMENDATION_FALLBACK(input);

  return {
    ...base,
    // Invariant: any Density component forces medical review, whatever a rule said.
    requiresMedicalReview: base.requiresMedicalReview || base.densityTier !== null,
    eligibilityStatus: base.densityTier !== null ? 'requires-review' : base.eligibilityStatus,
    recommendedDurationDays: input.recommendedDurationDays,
    packaging: packagingFor(input.gender),
    ruleId: rule?.id ?? 'fallback',
  };
}
