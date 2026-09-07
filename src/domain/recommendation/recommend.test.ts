import { describe, it, expect } from 'vitest';
import { recommend, packagingFor } from './recommend';
import type { RecommendationInput } from './types';

const base: RecommendationInput = {
  hairGoal: 'stop-loss',
  gender: 'male',
  scale: 'norwood',
  stage: 4,
  severityBand: 'moderate',
  planEmphasis: 'stabilize',
  progression: 'gradual',
  recommendedDurationDays: 180,
};

describe('recommend()', () => {
  it('maps gender to a packaging theme, never to treatment strength', () => {
    expect(packagingFor('male')).toBe('men');
    expect(packagingFor('female')).toBe('women');
    expect(recommend({ ...base, gender: 'female' }).packaging).toBe('women');
  });

  it('Thicker/Fuller Hair → Root Density Serum, standard + production-active', () => {
    const out = recommend({ ...base, hairGoal: 'thicker-fuller' });
    expect(out.status).toBe('standard');
    expect(out.coreProductKey).toBe('density-serum');
    expect(out.supportingProductKeys).toEqual(['derma-stim']);
    expect(out.productionActive).toBe(true);
    expect(out.requiresMedicalReview).toBe(false);
    expect(out.ruleId).toBe('thicker-fuller-density-serum');
  });

  it('Slow Hair Graying → Anti-Gray Capsules core + gray serum companion', () => {
    const out = recommend({ ...base, hairGoal: 'slow-graying' });
    expect(out.coreProductKey).toBe('gray-support');
    expect(out.supportingProductKeys).toEqual(['gray-serum']);
    expect(out.status).toBe('standard');
  });

  it('Stop Hair Loss → the ROOTÉ shampoo', () => {
    const out = recommend({ ...base, hairGoal: 'stop-loss' });
    expect(out.coreProductKey).toBe('regrowth-shampoo');
    expect(out.status).toBe('standard');
  });

  it('Hair Goal = Other → REQUIRES_REVIEW, no automatic product', () => {
    const out = recommend({ ...base, hairGoal: 'other' });
    expect(out.status).toBe('requires-review');
    expect(out.coreProductKey).toBeNull();
    expect(out.supportingProductKeys).toEqual([]);
  });

  describe('Hair Growth (client-confirmed table, production_active=false)', () => {
    it('computes the confirmed male tier but never surfaces it as a core product', () => {
      // stage 4 (norwood) → M3 → 6%
      const out = recommend({ ...base, hairGoal: 'hair-growth', gender: 'male', scale: 'norwood', stage: 4 });
      expect(out.status).toBe('standard');
      expect(out.productionActive).toBe(false);
      expect(out.coreProductKey).toBeNull();
      expect(out.hairGrowthTier).toEqual({ pattern: 'M3', strengthPct: 6, productKey: 'density-6' });
    });

    it('matches the full confirmed male table M1-M5', () => {
      const expected = { 2: ['M1', 15], 3: ['M2', 10], 4: ['M3', 6], 5: ['M4', 10], 6: ['M5', 6] } as const;
      for (const [stage, [pattern, pct]] of Object.entries(expected)) {
        const out = recommend({ ...base, hairGoal: 'hair-growth', gender: 'male', scale: 'norwood', stage: Number(stage) });
        expect(out.hairGrowthTier?.pattern).toBe(pattern);
        expect(out.hairGrowthTier?.strengthPct).toBe(pct);
      }
    });

    it('matches the full confirmed female table F1-F4', () => {
      const expected = { 1: ['F1', 6], 2: ['F2', 6], 3: ['F3', 10], 4: ['F4', 15] } as const;
      for (const [stage, [pattern, pct]] of Object.entries(expected)) {
        const out = recommend({ ...base, hairGoal: 'hair-growth', gender: 'female', scale: 'ludwig', stage: Number(stage) });
        expect(out.hairGrowthTier?.pattern).toBe(pattern);
        expect(out.hairGrowthTier?.strengthPct).toBe(pct);
      }
    });

    it('Gender=unspecified + Hair Growth → REQUIRES_REVIEW, no pattern (client rule 4)', () => {
      const out = recommend({ ...base, hairGoal: 'hair-growth', gender: 'unspecified', stage: 4 });
      expect(out.status).toBe('requires-review');
      expect(out.hairGrowthTier).toBeNull();
      expect(out.coreProductKey).toBeNull();
    });

    it('does not affect the other goals’ production-active state', () => {
      for (const hairGoal of ['thicker-fuller', 'slow-graying', 'stop-loss', 'other'] as const) {
        expect(recommend({ ...base, hairGoal }).productionActive).toBe(true);
      }
    });
  });

  describe('Q13 progression — safety escalation overrides any product recommendation', () => {
    it('sudden or patchy → PROFESSIONAL_REVIEW_RECOMMENDED, holds an otherwise-standard product', () => {
      for (const progression of ['sudden', 'patchy'] as const) {
        const out = recommend({ ...base, hairGoal: 'stop-loss', progression });
        expect(out.status).toBe('professional-review-recommended');
        expect(out.coreProductKey).toBeNull();
        expect(out.supportingProductKeys).toEqual([]);
      }
    });

    it('professional-review-recommended outranks requires-review (goal=other)', () => {
      const out = recommend({ ...base, hairGoal: 'other', progression: 'sudden' });
      expect(out.status).toBe('professional-review-recommended');
    });

    it('unsure sets analysisContextUncertain but does not change status or hold the product', () => {
      const out = recommend({ ...base, hairGoal: 'stop-loss', progression: 'unsure' });
      expect(out.analysisContextUncertain).toBe(true);
      expect(out.status).toBe('standard');
      expect(out.coreProductKey).toBe('regrowth-shampoo');
    });

    it('gradual leaves the base outcome untouched', () => {
      const out = recommend({ ...base, hairGoal: 'stop-loss', progression: 'gradual' });
      expect(out.analysisContextUncertain).toBe(false);
      expect(out.status).toBe('standard');
    });
  });

  it('passes the analysis duration through untouched', () => {
    expect(recommend({ ...base, recommendedDurationDays: 270 }).recommendedDurationDays).toBe(270);
  });

  it('is pure — same input, deep-equal output', () => {
    expect(recommend(base)).toEqual(recommend(base));
  });

  it('records which rule fired for traceability', () => {
    expect(recommend({ ...base, hairGoal: 'slow-graying' }).ruleId).toBe('slow-graying-anti-gray-capsules');
    expect(recommend({ ...base, hairGoal: 'hair-growth' }).ruleId).toBe('hair-growth-strength');
    expect(recommend({ ...base, hairGoal: 'other' }).ruleId).toBe('other-requires-review');
  });
});
