import { describe, it, expect } from 'vitest';
import { HAIR_LOSS_SCIENCE, RESULTS_TIMELINE_CLAIM } from './magazine';
import { containsForbiddenClaim } from './claims';

describe('magazine content — hair-loss science + timeline claim', () => {
  it('hair-loss science copy is real in both languages and carries no forbidden claim', () => {
    expect(HAIR_LOSS_SCIENCE.en.length).toBeGreaterThan(50);
    expect(HAIR_LOSS_SCIENCE.he.length).toBeGreaterThan(50);
    expect(containsForbiddenClaim(HAIR_LOSS_SCIENCE.en)).toBe(false);
    expect(containsForbiddenClaim(HAIR_LOSS_SCIENCE.he)).toBe(false);
  });

  it('results-timeline claim is requires-review (renders [PENDING]), sourced from general literature, not a competitor', () => {
    for (const locale of ['en', 'he'] as const) {
      const c = RESULTS_TIMELINE_CLAIM[locale];
      expect(c.status).toBe('requires-review');
      expect(c.sourceType).toBe('ingredient-literature');
      expect(c.text.length).toBeGreaterThan(20);
      expect(containsForbiddenClaim(c.text)).toBe(false);
    }
  });
});
