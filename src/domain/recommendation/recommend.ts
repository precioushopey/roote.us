import type { Gender } from '@/domain/analysis/types';
import type { GenderPresentation, RecommendationInput, RecommendationOutcome, RecommendationStatus } from './types';
import { RECOMMENDATION_RULES, RECOMMENDATION_FALLBACK } from './rules';

/** Packaging theme from the assessment's gender step — presentation only (brief §7). */
export function packagingFor(gender: Gender): GenderPresentation {
  return gender === 'male' ? 'men' : 'women';
}

const STATUS_RANK: Record<RecommendationStatus, number> = {
  standard: 0,
  'requires-review': 1,
  'professional-review-recommended': 2,
};

function higherPriority(a: RecommendationStatus, b: RecommendationStatus): RecommendationStatus {
  return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b;
}

/**
 * Pure recommendation resolver. First matching Hair-Goal rule wins, then Q13
 * (progression) is layered on top as a cross-cutting safety escalation — client
 * rule: "PROFESSIONAL_REVIEW_RECOMMENDED should override a normal product
 * recommendation" regardless of which goal rule fired. No display strings, no
 * React, no storage (domain purity).
 */
export function recommend(input: RecommendationInput): RecommendationOutcome {
  const rule = RECOMMENDATION_RULES.find((r) => r.when(input));
  const base = rule ? rule.outcome(input) : RECOMMENDATION_FALLBACK(input);

  const progressionStatus: RecommendationStatus =
    input.progression === 'sudden' || input.progression === 'patchy'
      ? 'professional-review-recommended'
      : 'standard';
  const status = higherPriority(base.status, progressionStatus);
  const held = status !== 'standard' && status !== base.status; // escalated by Q13, not by the goal rule itself

  return {
    ...base,
    status,
    analysisContextUncertain: input.progression === 'unsure',
    // Hold the product the moment Q13 escalates past what the goal rule already decided.
    coreProductKey: held ? null : base.coreProductKey,
    supportingProductKeys: held ? [] : base.supportingProductKeys,
    recommendedDurationDays: input.recommendedDurationDays,
    packaging: packagingFor(input.gender),
    ruleId: rule?.id ?? 'fallback',
  };
}
