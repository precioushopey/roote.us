import { describe, it, expect } from 'vitest';
import { buildReport } from './buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { isPending } from '@/content/pending';
import type { Answers, Gender } from '@/domain/analysis/types';
import type { SessionState } from '@/store/sessionStore';

function personaDiagnosis(gender: Gender, answers: Answers): SessionState['diagnosis'] {
  return {
    gender,
    photos: [
      { id: 'p1', angleKey: 'front', thumb: 'data:image/jpeg;base64,AAA', blobId: 'b1' },
      { id: 'p2', angleKey: 'crown', thumb: 'data:image/jpeg;base64,BBB', blobId: 'b2' },
    ],
    answers,
  };
}

const mildMaleHairline: Answers = {
  q1_area: 'hairline', q2_onset: 'lt-1y', q3_prior: 'never', q4_family: 'no', q5_goal: 'stop',
};
const establishedMaleEntireScalp: Answers = {
  q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both',
};
const mildFemaleCrown: Answers = {
  q1_area: 'crown', q2_onset: 'lt-1y', q3_prior: 'partial', q4_family: 'not-sure', q5_goal: 'regrow',
};

const personas = [
  { name: 'mild male hairline', gender: 'male' as const, answers: mildMaleHairline },
  { name: 'established male entire-scalp', gender: 'male' as const, answers: establishedMaleEntireScalp },
  { name: 'mild female crown', gender: 'female' as const, answers: mildFemaleCrown },
];

function build(gender: Gender, answers: Answers, locale: 'en' | 'he' = 'en') {
  const analysis = deriveAnalysis({ gender, answers });
  return buildReport({
    diagnosis: personaDiagnosis(gender, answers),
    analysis,
    content: rooteContent,
    locale,
    reportId: 'rep-test-1',
  });
}

describe('buildReport', () => {
  it.each(personas)('produces every section for $name', ({ gender, answers }) => {
    const model = build(gender, answers);
    expect(model.meta.reportId).toBe('rep-test-1');
    expect(model.meta.locale).toBe('en');
    expect(model.meta.dir).toBe('ltr');
    expect(model.photos).toHaveLength(2);
    expect(model.photos[0]).toMatchObject({ angleKey: 'front', dataUrl: 'data:image/jpeg;base64,AAA' });
    expect(model.analysis.scaleStrip.length).toBeGreaterThan(0);
    expect(model.analysis.flagged.length).toBeGreaterThan(0);
    expect(model.analysis.densityMap).toHaveLength(4);
    expect(model.analysis.metrics.length).toBeGreaterThanOrEqual(3);
    expect(model.hairLossType.areaLabels.length).toBeGreaterThan(0);
    expect(model.currentSituation.paragraphs).toHaveLength(2);
    expect(model.plan.core.length).toBeGreaterThan(0);
    expect(model.plan.supporting.length).toBeGreaterThan(0);
    expect(model.recommendedDuration.days).toBe(deriveAnalysis({ gender, answers }).recommendedDurationDays);
    expect(model.claims).toHaveLength(3);
    expect(model.cta.href).toBe('/start?report=rep-test-1');
  });

  it('sets dir=rtl for the he locale', () => {
    const model = build('male', mildMaleHairline, 'he');
    expect(model.meta.dir).toBe('rtl');
    expect(model.meta.locale).toBe('he');
  });

  it('never re-emits meta.scaleLine as hairLossType.title, nor paragraphs[0] as patternNote (I4)', () => {
    for (const locale of ['en', 'he'] as const) {
      for (const { gender, answers } of personas) {
        const model = build(gender, answers, locale);
        expect(model.hairLossType.title).not.toBe(model.meta.scaleLine);
        expect(model.hairLossType.patternNote).not.toBe(model.currentSituation.paragraphs[0]);
      }
    }
  });

  it('renders unresolved pricing/claims as PENDING, never invents a number', () => {
    const model = build('male', mildMaleHairline);
    expect(isPending(model.pricing.price)).toBe(true);
    expect(isPending(model.pricing.perDay)).toBe(true);
    expect(model.pricing.compareAll).toHaveLength(5);
    for (const row of model.pricing.compareAll) expect(isPending(row.price)).toBe(true);
    for (const claim of model.claims) expect(isPending(claim.valueLabel)).toBe(true);
  });

  it('marks the recommended duration as the recommended row in compareAll', () => {
    const model = build('male', establishedMaleEntireScalp); // established:stabilize-regrow -> 360
    const recommendedRow = model.pricing.compareAll.find((r) => r.days === model.recommendedDuration.days);
    expect(recommendedRow?.isRecommended).toBe(true);
    expect(model.pricing.compareAll.filter((r) => r.isRecommended)).toHaveLength(1);
  });

  it('treats an empty-string LocalizedText the same as null — PENDING, not a blank', () => {
    const model = build('male', mildMaleHairline, 'he');
    // roote.config.ts's supporting-treatment names have he: '' today.
    for (const s of model.plan.supporting) {
      expect(isPending(s.name)).toBe(true);
    }
    // disclaimers.medical / notADiagnosis also have he: '' today.
    expect(isPending(model.disclaimers.medical)).toBe(true);
    expect(isPending(model.disclaimers.notADiagnosis)).toBe(true);
    // demo and formulaPending ARE fully populated in both languages — must resolve to real strings.
    expect(typeof model.disclaimers.demo).toBe('string');
    expect(model.disclaimers.demo.length).toBeGreaterThan(0);
  });

  it('hides formula percentages when displayPercentagesPublicly is false', () => {
    const model = build('male', mildMaleHairline);
    expect(rooteContent.formula.displayPercentagesPublicly).toBe(false);
    expect(model.plan.formula).not.toBeNull();
    for (const ing of model.plan.formula!.ingredients) {
      expect(ing.percentage).toBeUndefined();
    }
  });

  it('is pure — same input, deep-equal output (ignoring meta.generatedAt)', () => {
    const a = build('male', mildMaleHairline);
    const b = build('male', mildMaleHairline);
    const { generatedAt: ga, ...metaA } = a.meta;
    const { generatedAt: gb, ...metaB } = b.meta;
    expect(metaA).toEqual(metaB);
    expect({ ...a, meta: metaA }).toEqual({ ...b, meta: metaB });
  });

  it('collects every PENDING slot into model.pending', () => {
    const model = build('male', mildMaleHairline);
    expect(model.pending.length).toBeGreaterThan(0);
    const paths = model.pending.map((p) => p.path);
    expect(paths.some((p) => p.includes('pricing'))).toBe(true);
    expect(paths.some((p) => p.includes('claims'))).toBe(true);
  });
});
