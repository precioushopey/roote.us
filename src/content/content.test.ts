import { describe, it, expect } from 'vitest';
import { PRODUCTS, getProduct, ARCHIVED_CONCEPTS } from './products';
import { PROGRAM_DURATIONS, PROGRAMS, HEADLINE_DURATIONS } from './programs';
import { SOLUTIONS } from './solutions';
import { HOME_FAQS, PRODUCT_FAQS_COMMON } from './faqs';
import { LEGAL_PAGES } from './legal';
import { THINNING_QUESTIONS, GRAY_QUESTIONS, HEALTH_HISTORY_QUESTION, questionsForHairGoal } from './assessment';
import { containsForbiddenClaim } from './claims';

const localizedStrings = (v: unknown, acc: string[] = []): string[] => {
  if (v == null) return acc;
  if (typeof v === 'string') {
    acc.push(v);
  } else if (Array.isArray(v)) {
    v.forEach((x) => localizedStrings(x, acc));
  } else if (typeof v === 'object') {
    Object.values(v as Record<string, unknown>).forEach((x) => localizedStrings(x, acc));
  }
  return acc;
};

describe('products (6 launch SKUs, brief §8)', () => {
  it('is exactly the six launch slugs', () => {
    expect(PRODUCTS.map((p) => p.slug).sort()).toEqual(
      ['density-10', 'density-15', 'density-6', 'gray-serum', 'gray-support', 'regrowth-shampoo'],
    );
  });

  it('prices are the confirmed values (competitor-matched, or client-set overrides), never an invented number', () => {
    // Client references, 2026-09-08: ROOTÉ_Personal_design_minoxidilmax.docx + 6-product lineup.docx.
    // density-6/density-10 are client-set overrides (2026-09-08) of the competitor match.
    const expected: Record<string, number> = {
      'density-6': 47,
      'density-10': 50,
      'density-15': 53, // DualGen-15 With PG Plus, minoxidilmax.com
      'gray-support': 38, // Gray Escape, heyhair.co
      'regrowth-shampoo': 40, // ACTIVATE+, heyhair.co
      'gray-serum': 52, // Root Revival, heyhair.co
    };
    for (const p of PRODUCTS) expect(p.price, p.slug).toBe(expected[p.slug]);
  });

  it('gates every Density SKU behind medical review; leaves cosmetic SKUs open', () => {
    for (const p of PRODUCTS) {
      const expected = p.slug.startsWith('density-');
      expect(p.requiresMedicalReview, p.slug).toBe(expected);
    }
  });

  it('does not display numeric formula detail publicly', () => {
    for (const p of PRODUCTS.filter((x) => x.slug.startsWith('density-'))) {
      expect(p.displayFormulaDetail, p.slug).toBe(false);
    }
  });

  it('keeps Color Restore Shampoo archived, not a SKU', () => {
    expect(getProduct('color-restore-shampoo')).toBeUndefined();
    expect(ARCHIVED_CONCEPTS.map((c) => c.slug)).toContain('color-restore-shampoo');
  });

  it('carries no forbidden marketing claim in any copy', () => {
    for (const p of PRODUCTS) {
      for (const s of localizedStrings(p)) {
        expect(containsForbiddenClaim(s), `${p.slug}: "${s}"`).toBe(false);
      }
    }
  });
});

describe('programs & durations', () => {
  it('supports all five durations with no invented money', () => {
    expect(PROGRAM_DURATIONS.map((d) => d.days)).toEqual([90, 120, 180, 270, 360]);
    for (const d of PROGRAM_DURATIONS) {
      expect(d.price).toBeNull();
      expect(d.perDay).toBeNull();
      expect(d.savingsPct).toBeNull();
    }
  });

  it('leads marketing with 90 / 180 / 360', () => {
    expect(HEADLINE_DURATIONS).toEqual([90, 180, 360]);
  });

  it('density + complete programs require medical review; gray does not', () => {
    expect(PROGRAMS.density.requiresMedicalReview).toBe(true);
    expect(PROGRAMS.complete.requiresMedicalReview).toBe(true);
    expect(PROGRAMS.gray.requiresMedicalReview).toBe(false);
  });
});

describe('solutions & FAQs', () => {
  it('has a thinning and a gray-hair page, each routing to the assessment', () => {
    expect(SOLUTIONS.map((s) => s.slug).sort()).toEqual(['gray-hair', 'thinning']);
  });

  it('carries no forbidden marketing claim in solution or FAQ copy', () => {
    const all = [...SOLUTIONS, ...HOME_FAQS, ...PRODUCT_FAQS_COMMON];
    for (const node of all) {
      for (const s of localizedStrings(node)) {
        expect(containsForbiddenClaim(s), `"${s}"`).toBe(false);
      }
    }
  });

  it('answers the twelve questions the brief enumerates', () => {
    expect(HOME_FAQS).toHaveLength(12);
  });
});

describe('legal registry (brief §25)', () => {
  it('registers the nine policy pages', () => {
    expect(LEGAL_PAGES.map((p) => p.slug).sort()).toEqual(
      [
        'accessibility',
        'cancellation',
        'cookies',
        'medical-disclaimer',
        'privacy',
        'returns',
        'shipping',
        'subscription-terms',
        'terms',
      ],
    );
  });

  it('marks every draft as needing legal review', () => {
    for (const p of LEGAL_PAGES) expect(p.reviewRequired, p.slug).toBe(true);
  });
});

describe('assessment question sets', () => {
  it('thinning-style branch matches the deriveAnalysis Answers vocabulary, plus shared Health History', () => {
    expect(THINNING_QUESTIONS.map((q) => q.id)).toEqual([
      'q1_area', 'q2_onset', 'q3_prior', 'q4_family', 'q13_progression', 'health_history',
    ]);
  });

  it('gray branch is its own four questions plus shared Health History', () => {
    expect(GRAY_QUESTIONS.map((q) => q.id)).toEqual(['g1_onset', 'g2_area', 'g3_pace', 'g4_color', 'health_history']);
  });

  it('Health History is multi-select and None-exclusive by option list (enforced in sessionStore)', () => {
    expect(HEALTH_HISTORY_QUESTION.multi).toBe(true);
    expect(HEALTH_HISTORY_QUESTION.options.map((o) => o.value)).toEqual([
      'thyroid', 'anemia', 'autoimmune', 'cancer', 'glp1', 'none',
    ]);
  });

  it('routes Hair Goal → question set (only Slow Hair Graying uses the gray branch)', () => {
    expect(questionsForHairGoal('slow-graying')).toBe(GRAY_QUESTIONS);
    for (const goal of ['thicker-fuller', 'stop-loss', 'hair-growth', 'other'] as const) {
      expect(questionsForHairGoal(goal)).toBe(THINNING_QUESTIONS);
    }
  });
});
