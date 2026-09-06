import { describe, it, expect } from 'vitest';
import { recommend, packagingFor } from './recommend';
import type { RecommendationInput } from './types';
import type { SeverityBand } from '@/domain/analysis/types';

const base: RecommendationInput = {
  concern: 'thinning',
  gender: 'male',
  severityBand: 'moderate',
  planEmphasis: 'stabilize-regrow',
  recommendedDurationDays: 180,
};

describe('recommend()', () => {
  it('maps gender to a packaging theme, never to treatment strength', () => {
    expect(packagingFor('male')).toBe('men');
    expect(packagingFor('female')).toBe('women');
    expect(recommend({ ...base, gender: 'female' }).packaging).toBe('women');
  });

  it('gray-only concern → cosmetic gray program, no medical review', () => {
    const out = recommend({ ...base, concern: 'gray' });
    expect(out.programKind).toBe('gray');
    expect(out.densityTier).toBeNull();
    expect(out.requiresMedicalReview).toBe(false);
    expect(out.eligibilityStatus).toBe('not-required');
    expect(out.supportingProductKeys).toEqual(['gray-support', 'gray-serum']);
  });

  it('thinning concern → Density program that always requires medical review', () => {
    const out = recommend({ ...base, concern: 'thinning' });
    expect(out.programKind).toBe('density');
    expect(out.requiresMedicalReview).toBe(true);
    expect(out.eligibilityStatus).toBe('requires-review');
  });

  it('never auto-suggests density-15, whatever the severity', () => {
    for (const severityBand of ['mild', 'moderate', 'established'] as SeverityBand[]) {
      const out = recommend({ ...base, concern: 'both', severityBand });
      expect(out.densityTier).not.toBe('density-15');
      expect(['density-6', 'density-10']).toContain(out.densityTier);
    }
  });

  it('suggested starting tier tracks severity but caps at density-10', () => {
    expect(recommend({ ...base, severityBand: 'mild' }).densityTier).toBe('density-6');
    expect(recommend({ ...base, severityBand: 'moderate' }).densityTier).toBe('density-10');
    expect(recommend({ ...base, severityBand: 'established' }).densityTier).toBe('density-10');
  });

  it('flags a possible stronger-tier discussion only for established severity', () => {
    expect(recommend({ ...base, severityBand: 'moderate' }).strongerTierNote).toBe(false);
    expect(recommend({ ...base, severityBand: 'established' }).strongerTierNote).toBe(true);
  });

  it('both concerns → Complete program with the gray routine attached', () => {
    const out = recommend({ ...base, concern: 'both' });
    expect(out.programKind).toBe('complete');
    expect(out.supportingProductKeys).toEqual(['regrowth-shampoo', 'gray-support', 'gray-serum']);
    expect(out.requiresMedicalReview).toBe(true);
  });

  it('passes the analysis duration through untouched', () => {
    expect(recommend({ ...base, recommendedDurationDays: 270 }).recommendedDurationDays).toBe(270);
  });

  it('is pure — same input, deep-equal output', () => {
    expect(recommend(base)).toEqual(recommend(base));
  });

  it('records which rule fired for traceability', () => {
    expect(recommend({ ...base, concern: 'gray' }).ruleId).toBe('gray-only');
    expect(recommend({ ...base, concern: 'both' }).ruleId).toBe('both-thinning-and-gray');
    expect(recommend({ ...base, concern: 'thinning' }).ruleId).toBe('thinning-by-severity');
  });
});
