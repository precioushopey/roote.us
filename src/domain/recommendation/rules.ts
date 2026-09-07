import type { RecommendationRule } from './types';
import { hairGrowthTierFor } from './hairGrowthTable';

/**
 * Recommendation rules, keyed by Hair Goal (client-confirmed 2026-09-07 — see
 * `docs/superpowers/specs/2026-09-07-hair-goal-recommendation-alignment-design.md`
 * if present, else the Ilay/Marwell thread). Each goal maps to one internal
 * recommendation key; the *customer-facing* product name lives in
 * `content/roote.config.ts`'s `treatmentRegistry`, and the final commercial
 * SKU/branding is explicitly still open — keep the two separate (client instruction).
 *
 *   thicker-fuller → ROOTE_DENSITY_SERUM      → 'density-serum'
 *   slow-graying   → ROOTE_ANTI_GRAY_CAPSULES → 'gray-support' (+ 'gray-serum' companion)
 *   stop-loss      → ROOTE_STOP_LOSS_SHAMPOO  → 'regrowth-shampoo'
 *   hair-growth    → ROOTE_HAIR_GROWTH_06/10/15 → 'density-6' / '-10' / '-15' (gated, see below)
 *   other          → REQUIRES_REVIEW, no product (client instruction — do not guess)
 */
export const RECOMMENDATION_RULESET_STATUS = 'client-confirmed-2026-09-07' as const;

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'thicker-fuller-density-serum',
    note: 'Thicker/Fuller Hair goal → Root Density Serum. Not tiered, not the Hair Growth product.',
    when: (i) => i.hairGoal === 'thicker-fuller',
    outcome: () => ({
      status: 'standard',
      coreProductKey: 'density-serum',
      supportingProductKeys: ['derma-stim'],
      productionActive: true,
      hairGrowthTier: null,
      requiresMedicalReview: false,
      rationaleKey: 'recommend.rationale.thickerFuller',
    }),
  },
  {
    id: 'slow-graying-anti-gray-capsules',
    note: 'Slow Hair Graying goal → Anti-Gray Capsules (core) + gray serum companion.',
    when: (i) => i.hairGoal === 'slow-graying',
    outcome: () => ({
      status: 'standard',
      coreProductKey: 'gray-support',
      supportingProductKeys: ['gray-serum'],
      productionActive: true,
      hairGrowthTier: null,
      requiresMedicalReview: false,
      rationaleKey: 'recommend.rationale.slowGraying',
    }),
  },
  {
    id: 'stop-loss-shampoo',
    note: 'Stop Hair Loss goal → the ROOTÉ shampoo. Separate from the Hair Growth treatment family.',
    when: (i) => i.hairGoal === 'stop-loss',
    outcome: () => ({
      status: 'standard',
      coreProductKey: 'regrowth-shampoo',
      supportingProductKeys: [],
      productionActive: true,
      hairGrowthTier: null,
      requiresMedicalReview: false,
      rationaleKey: 'recommend.rationale.stopLoss',
    }),
  },
  {
    id: 'hair-growth-strength',
    note: 'Hair Growth goal → M1-M5/F1-F4 strength tier. Gender=unspecified has no pattern set '
      + '(client rule 4) → REQUIRES_REVIEW. Otherwise confirmed but production_active=false '
      + '(client rule 2) → the tier is computed and carried on the outcome for traceability, '
      + 'but never surfaced as a product recommendation yet.',
    when: (i) => i.hairGoal === 'hair-growth',
    outcome: (i) => {
      const tier = hairGrowthTierFor(i.gender, i.stage);
      if (!tier) {
        return {
          status: 'requires-review',
          coreProductKey: null,
          supportingProductKeys: [],
          productionActive: false,
          hairGrowthTier: null,
          requiresMedicalReview: false,
          rationaleKey: 'recommend.rationale.hairGrowthReview',
        };
      }
      return {
        status: 'standard',
        // Confirmed but not production-active — never shown as a live core item.
        coreProductKey: null,
        supportingProductKeys: [],
        productionActive: false,
        hairGrowthTier: tier,
        requiresMedicalReview: false,
        rationaleKey: 'recommend.rationale.hairGrowthPending',
      };
    },
  },
  {
    id: 'other-requires-review',
    note: 'Hair Goal = Other → REQUIRES_REVIEW, no automatic product (client instruction). '
      + 'The questionnaire, AI analysis, and general results still complete normally.',
    when: (i) => i.hairGoal === 'other',
    outcome: () => ({
      status: 'requires-review',
      coreProductKey: null,
      supportingProductKeys: [],
      productionActive: true,
      hairGrowthTier: null,
      requiresMedicalReview: false,
      rationaleKey: 'recommend.rationale.other',
    }),
  },
];

/** Defensive fallback if no rule matches (should be unreachable — HairGoal is exhaustive). */
export const RECOMMENDATION_FALLBACK: RecommendationRule['outcome'] = () => ({
  status: 'requires-review',
  coreProductKey: null,
  supportingProductKeys: [],
  productionActive: true,
  hairGrowthTier: null,
  requiresMedicalReview: false,
  rationaleKey: 'recommend.rationale.fallback',
});
