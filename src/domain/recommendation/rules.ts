import type { DensityTier, RecommendationRule } from './types';
import type { SeverityBand } from '@/domain/analysis/types';

/**
 * PLACEHOLDER recommendation rules (brief §14). Configurable data, not logic
 * buried in components. Every Density outcome carries `requiresMedicalReview`
 * and an `eligibilityStatus` of `requires-review`; the engine never returns
 * `density-15` — the intensive concept is added only at a clinician/pharmacy
 * review step that this shape leaves room for.
 *
 * These outcomes are NOT medical advice and MUST be replaced with a
 * clinically- and legally-approved rule set before launch.
 */
export const RECOMMENDATION_RULESET_STATUS = 'placeholder' as const;

/** Auto-suggestable starting tier by severity — capped at density-10 on purpose. */
const TIER_BY_SEVERITY: Record<SeverityBand, DensityTier> = {
  mild: 'density-6',
  moderate: 'density-10',
  established: 'density-10',
};

const REGROWTH_SHAMPOO = 'regrowth-shampoo';
const GRAY_SUPPORT = 'gray-support';
const GRAY_SERUM = 'gray-serum';

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'gray-only',
    note: 'Pigmentation concern with no thinning — cosmetic/supplement routine, no Rx component.',
    when: (i) => i.concern === 'gray',
    outcome: () => ({
      programKind: 'gray',
      densityTier: null,
      supportingProductKeys: [GRAY_SUPPORT, GRAY_SERUM],
      requiresMedicalReview: false,
      eligibilityStatus: 'not-required',
      strongerTierNote: false,
      rationaleKey: 'recommend.rationale.grayOnly',
    }),
  },
  {
    id: 'both-thinning-and-gray',
    note: 'Both concerns — Complete program: Density component (review-gated) + gray routine.',
    when: (i) => i.concern === 'both',
    outcome: (i) => ({
      programKind: 'complete',
      densityTier: TIER_BY_SEVERITY[i.severityBand],
      supportingProductKeys: [REGROWTH_SHAMPOO, GRAY_SUPPORT, GRAY_SERUM],
      requiresMedicalReview: true,
      eligibilityStatus: 'requires-review',
      strongerTierNote: i.severityBand === 'established',
      rationaleKey: 'recommend.rationale.both',
    }),
  },
  {
    id: 'thinning-by-severity',
    note: 'Thinning concern — Density program; starting tier suggested by severity, capped at 10.',
    when: (i) => i.concern === 'thinning',
    outcome: (i) => ({
      programKind: 'density',
      densityTier: TIER_BY_SEVERITY[i.severityBand],
      supportingProductKeys: [REGROWTH_SHAMPOO],
      requiresMedicalReview: true,
      eligibilityStatus: 'requires-review',
      strongerTierNote: i.severityBand === 'established',
      rationaleKey: 'recommend.rationale.thinning',
    }),
  },
];

/** Defensive fallback if no rule matches (should be unreachable). */
export const RECOMMENDATION_FALLBACK: RecommendationRule['outcome'] = () => ({
  programKind: 'gray',
  densityTier: null,
  supportingProductKeys: [GRAY_SUPPORT],
  requiresMedicalReview: false,
  eligibilityStatus: 'not-required',
  strongerTierNote: false,
  rationaleKey: 'recommend.rationale.fallback',
});
