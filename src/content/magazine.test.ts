import { describe, it, expect } from 'vitest';
import { HAIR_LOSS_SCIENCE, RESULTS_TIMELINE_CLAIM } from './magazine';
import { containsForbiddenClaim } from './claims';
import { PRODUCTS, type ProductFormat } from './products';
import {
  dedupedIngredients,
  INGREDIENT_CATEGORY,
  INGREDIENT_EXPLANATIONS,
  FORMAT_EXPLANATIONS,
} from './magazine';

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

describe('magazine content — ingredient library', () => {
  const PROPRIETARY = ['Procapil®', 'Greyverse™', 'Darkenyl™', 'Capixyl™'];

  it('dedupedIngredients() has exactly the 24 unique ingredient names from the real catalog', () => {
    const allNames = new Set(PRODUCTS.flatMap((p) => p.ingredients.map((i) => i.name)));
    const deduped = dedupedIngredients();
    expect(deduped.length).toBe(allNames.size);
    expect(new Set(deduped.map((i) => i.name))).toEqual(allNames);
  });

  it('every deduped ingredient has a category assigned', () => {
    for (const ing of dedupedIngredients()) {
      expect(INGREDIENT_CATEGORY[ing.name], ing.name).toBeDefined();
    }
  });

  it('every non-proprietary ingredient has a real explanation in both languages; proprietary ones have none', () => {
    for (const ing of dedupedIngredients()) {
      const explanation = INGREDIENT_EXPLANATIONS[ing.name];
      if (PROPRIETARY.includes(ing.name)) {
        expect(explanation, ing.name).toBeUndefined();
      } else {
        expect(explanation, ing.name).toBeDefined();
        expect(explanation!.en.length, ing.name).toBeGreaterThan(20);
        expect(explanation!.he.length, ing.name).toBeGreaterThan(20);
      }
    }
  });

  it('no ingredient explanation carries a forbidden claim term', () => {
    for (const [name, text] of Object.entries(INGREDIENT_EXPLANATIONS)) {
      expect(containsForbiddenClaim(text.en), name).toBe(false);
      expect(containsForbiddenClaim(text.he), name).toBe(false);
    }
  });

  it('proprietary ingredients keep their real requires-review status untouched (not overridden here)', () => {
    for (const name of PROPRIETARY) {
      const ing = dedupedIngredients().find((i) => i.name === name)!;
      expect(ing.claimStatus, name).toBe('requires-review');
    }
  });
});

describe('magazine content — format explainers', () => {
  const FORMATS: ProductFormat[] = ['topical-solution', 'capsule-supplement', 'shampoo', 'serum'];

  it('has a real explanation in both languages for every product format', () => {
    for (const f of FORMATS) {
      expect(FORMAT_EXPLANATIONS[f], f).toBeDefined();
      expect(FORMAT_EXPLANATIONS[f].en.length, f).toBeGreaterThan(20);
      expect(FORMAT_EXPLANATIONS[f].he.length, f).toBeGreaterThan(20);
      expect(containsForbiddenClaim(FORMAT_EXPLANATIONS[f].en), f).toBe(false);
      expect(containsForbiddenClaim(FORMAT_EXPLANATIONS[f].he), f).toBe(false);
    }
  });
});
