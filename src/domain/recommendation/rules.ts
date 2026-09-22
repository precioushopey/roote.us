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
 *   thicker-fuller → M1-M5/F1-F4 density tier (core, live) + 'regrowth-shampoo' (supporting) —
 *                    2026-09-22: replaces the original 'density-serum' + 'derma-stim' keys, which
 *                    were never added as real src/content/products.ts SKUs (recommending them
 *                    meant recommending an unpurchasable product). Same tier family as the
 *                    Hair Growth goal below — severity/pattern drives the main product, Regrowth
 *                    Shampoo is the additional one. Gender=unspecified has no pattern set (client
 *                    rule 4), so there's no tier to use as core; falls back to Regrowth Shampoo
 *                    alone rather than blocking the whole recommendation the way hair-growth-
 *                    strength does for that same case.
 *   slow-graying   → ROOTE_ANTI_GRAY_CAPSULES → 'gray-support' (+ 'gray-serum' companion)
 *   stop-loss      → same M1-M5/F1-F4 density tier as thicker-fuller/hair-growth (core, live) +
 *                    'regrowth-shampoo' (supporting) — 2026-09-22: was 'regrowth-shampoo' alone;
 *                    a visitor with active shedding needs the density treatment as the primary
 *                    product, not just a maintenance shampoo. Same no-pattern fallback as
 *                    thicker-fuller.
 *   hair-growth    → ROOTE_HAIR_GROWTH_06/10/15 → 'density-6' / '-10' / '-15', live
 *   other          → REQUIRES_REVIEW, no product (client instruction — do not guess)
 *
 * `productionActive` for the Hair Growth tier family (the `hair-growth`, `thicker-fuller`, and
 * `stop-loss` rules below) was flipped live 2026-09-22 on explicit confirmation that its
 * clinical approval has cleared — including the pattern→concentration (6%/10%/15%) direction,
 * separately confirmed correct from the unrelated displayed-stage-direction fix made the same
 * day (see `hairGrowthTable.ts`'s `stageForPattern` docblock for that other, already-fixed bug).
 */
export const RECOMMENDATION_RULESET_STATUS = 'client-confirmed-2026-09-07' as const;

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'thicker-fuller-density-tier',
    note: 'Thicker/Fuller Hair goal → the same M1-M5/F1-F4 density tier as Hair Growth (core), '
      + 'plus Regrowth Shampoo (supporting) — live (see the file-level comment above). No pattern '
      + '(unspecified gender) falls back to Regrowth Shampoo alone as core, still live.',
    when: (i) => i.hairGoal === 'thicker-fuller',
    outcome: (i) => {
      const tier = hairGrowthTierFor(i.gender, i.stage);
      return {
        status: 'standard',
        coreProductKey: tier ? tier.productKey : 'regrowth-shampoo',
        supportingProductKeys: tier ? ['regrowth-shampoo'] : [],
        productionActive: true,
        hairGrowthTier: tier,
        requiresMedicalReview: false,
        rationaleKey: tier ? 'recommend.rationale.thickerFullerActive' : 'recommend.rationale.thickerFuller',
      };
    },
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
    id: 'stop-loss-density-tier',
    note: 'Stop Hair Loss goal → the same M1-M5/F1-F4 density tier as Hair Growth/Thicker-Fuller '
      + '(core), plus Regrowth Shampoo (supporting) — 2026-09-22: recommending the shampoo alone '
      + 'left a visitor with active shedding no density treatment at all; the shampoo is a '
      + 'supporting/maintenance product here, same as it is for Thicker/Fuller, never the sole '
      + "recommendation. No pattern (unspecified gender) falls back to Regrowth Shampoo alone as "
      + "core, same as Thicker/Fuller's equivalent edge case — there's no tier to use as core there either.",
    when: (i) => i.hairGoal === 'stop-loss',
    outcome: (i) => {
      const tier = hairGrowthTierFor(i.gender, i.stage);
      return {
        status: 'standard',
        coreProductKey: tier ? tier.productKey : 'regrowth-shampoo',
        supportingProductKeys: tier ? ['regrowth-shampoo'] : [],
        productionActive: true,
        hairGrowthTier: tier,
        requiresMedicalReview: false,
        rationaleKey: tier ? 'recommend.rationale.hairGrowthActive' : 'recommend.rationale.stopLoss',
      };
    },
  },
  {
    id: 'hair-growth-strength',
    note: 'Hair Growth goal → M1-M5/F1-F4 strength tier, live (see the file-level comment above — '
      + 'clinical approval confirmed cleared 2026-09-22; was production_active=false before that). '
      + 'Gender=unspecified has no pattern set (client rule 4) → REQUIRES_REVIEW still applies, '
      + 'since there is no tier-based product to recommend at all in that case.',
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
        coreProductKey: tier.productKey,
        supportingProductKeys: [],
        productionActive: true,
        hairGrowthTier: tier,
        requiresMedicalReview: false,
        rationaleKey: 'recommend.rationale.hairGrowthActive',
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
