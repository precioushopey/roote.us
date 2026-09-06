import { describe, it, expect } from 'vitest';
import { PRODUCTS, getProduct, ARCHIVED_CONCEPTS } from './products';
import { PROGRAM_DURATIONS, PROGRAMS, HEADLINE_DURATIONS } from './programs';
import { SOLUTIONS } from './solutions';
import { HOME_FAQS, PRODUCT_FAQS_COMMON } from './faqs';
import { LEGAL_PAGES } from './legal';
import { THINNING_QUESTIONS, GRAY_QUESTIONS, questionsForConcern } from './assessment';
import { containsForbiddenClaim } from './claims';
import { QUESTIONS } from '@/app/components/diagnosis/questions';

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

  it('never invents a price', () => {
    for (const p of PRODUCTS) expect(p.price, p.slug).toBeNull();
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
  it('thinning branch matches the deriveAnalysis Answers vocabulary', () => {
    const byId = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options.map((o) => o.value).sort()]));
    for (const q of THINNING_QUESTIONS) {
      expect(byId[q.id], q.id).toEqual(q.options.map((o) => o.value).sort());
    }
  });

  it('gray branch is its own five questions', () => {
    expect(GRAY_QUESTIONS.map((q) => q.id)).toEqual(['g1_onset', 'g2_area', 'g3_pace', 'g4_color', 'g5_goal']);
  });

  it('routes concern → question set', () => {
    expect(questionsForConcern('thinning')).toBe(THINNING_QUESTIONS);
    expect(questionsForConcern('gray')).toBe(GRAY_QUESTIONS);
    expect(questionsForConcern('both').length).toBeGreaterThan(THINNING_QUESTIONS.length);
  });
});
