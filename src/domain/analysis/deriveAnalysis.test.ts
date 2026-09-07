import { describe, it, expect } from 'vitest';
import { deriveAnalysis } from './deriveAnalysis';
import type { Answers, Gender, HairGoal } from './types';

const base: Answers = {
  q1_area: 'hairline', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'no', q13_progression: 'gradual',
};
const run = (gender: Gender, over: Partial<Answers> = {}, hairGoal: HairGoal = 'hair-growth') =>
  deriveAnalysis({ gender, hairGoal, answers: { ...base, ...over } });

describe('deriveAnalysis', () => {
  it('is pure — same input, deep-equal output', () => {
    expect(run('male')).toEqual(run('male'));
  });

  it('picks the scale from gender', () => {
    expect(run('male').scale).toBe('norwood');
    expect(run('female').scale).toBe('ludwig');
  });

  it('maps onset to severity band and keeps stage within scale bounds', () => {
    expect(run('male', { q2_onset: 'lt-6mo' }).severityBand).toBe('mild');
    expect(run('male', { q2_onset: '6-12mo' }).severityBand).toBe('mild');
    expect(run('male', { q2_onset: '1-3y' }).severityBand).toBe('moderate');
    expect(run('male', { q2_onset: 'gt-3y' }).severityBand).toBe('established');
    for (const onset of ['lt-6mo', '6-12mo', '1-3y', 'gt-3y'] as const) {
      const nw = run('male', { q2_onset: onset });
      expect(nw.stage).toBeGreaterThanOrEqual(2);
      expect(nw.stage).toBeLessThanOrEqual(6);
      const lw = run('female', { q2_onset: onset });
      expect(lw.stage).toBeGreaterThanOrEqual(1);
      expect(lw.stage).toBeLessThanOrEqual(4);
    }
  });

  it('flags zones from q1_area', () => {
    expect(run('male', { q1_area: 'hairline' }).flaggedZones.map((z) => z.zone).sort())
      .toEqual(['frontal-hairline', 'temples']);
    expect(run('male', { q1_area: 'crown' }).flaggedZones.map((z) => z.zone))
      .toEqual(['crown-vertex']);
    expect(run('male', { q1_area: 'entire-scalp' }).flaggedZones).toHaveLength(4);
  });

  it('always returns a density level for all four zones', () => {
    const d = run('male', { q1_area: 'crown' }).densityByZone;
    expect(d.map((x) => x.zone).sort()).toEqual(
      ['crown-vertex', 'frontal-hairline', 'mid-scalp', 'temples'],
    );
    expect(d.every((x) => ['low', 'medium', 'high'].includes(x.level))).toBe(true);
  });

  it('derives plan emphasis from the Hair Goal (q5_goal was removed — redundant with it)', () => {
    expect(run('male', {}, 'stop-loss').planEmphasis).toBe('stabilize');
    expect(run('male', {}, 'hair-growth').planEmphasis).toBe('regrow');
    expect(run('male', {}, 'thicker-fuller').planEmphasis).toBe('stabilize-regrow');
    expect(run('male', {}, 'other').planEmphasis).toBe('stabilize-regrow');
  });

  it('recommends a duration from the (severity:emphasis) table', () => {
    expect(run('male', { q2_onset: 'lt-6mo' }, 'stop-loss').recommendedDurationDays).toBe(120);
    expect(run('male', { q2_onset: 'gt-3y' }, 'hair-growth').recommendedDurationDays).toBe(360);
    expect([90, 120, 180, 270, 360]).toContain(run('female', { q2_onset: '1-3y' }).recommendedDurationDays);
  });

  it('emits note keys for prior treatment and family history', () => {
    expect(run('male', { q3_prior: 'never' }).notes).toContain('note.treatment-naive');
    expect(run('male', { q3_prior: 'no-success' }).notes).toContain('note.prior-no-response');
    expect(run('male', { q3_prior: 'partial' }).notes).toContain('note.prior-partial');
    expect(run('male', { q4_family: 'yes' }).notes).toContain('note.family-history-positive');
  });

  it('summaryPlainKey is scoped by scale and severity', () => {
    expect(run('male', { q2_onset: 'lt-6mo' }).summaryPlainKey).toBe('summary.norwood.mild');
    expect(run('female', { q2_onset: 'gt-3y' }).summaryPlainKey).toBe('summary.ludwig.established');
  });

  it('progression (Q13) never changes the visual analysis — it is a routing/safety signal, not a diagnosis input', () => {
    for (const progression of ['gradual', 'sudden', 'patchy', 'unsure'] as const) {
      expect(run('male', { q13_progression: progression })).toEqual(run('male', { q13_progression: 'gradual' }));
    }
  });

  // Exhaustive: every gender × goal × Q1/Q2/Q3/Q4 combo produces a structurally valid result.
  it('produces a valid analysis for all 2×5×3×4×3×3 = 1080 input combinations', () => {
    const opts = {
      hairGoal: ['thicker-fuller', 'slow-graying', 'stop-loss', 'hair-growth', 'other'],
      q1_area: ['hairline', 'crown', 'entire-scalp'],
      q2_onset: ['lt-6mo', '6-12mo', '1-3y', 'gt-3y'],
      q3_prior: ['never', 'no-success', 'partial'],
      q4_family: ['yes', 'no', 'not-sure'],
    } as const;
    let count = 0;
    for (const gender of ['male', 'female'] as const)
      for (const hairGoal of opts.hairGoal)
        for (const q1_area of opts.q1_area)
          for (const q2_onset of opts.q2_onset)
            for (const q3_prior of opts.q3_prior)
              for (const q4_family of opts.q4_family) {
                const a = deriveAnalysis({
                  gender, hairGoal, answers: { q1_area, q2_onset, q3_prior, q4_family, q13_progression: 'gradual' },
                });
                expect(a.flaggedZones.length).toBeGreaterThan(0);
                expect(a.densityByZone).toHaveLength(4);
                expect(a.metrics.length).toBeGreaterThanOrEqual(3);
                expect([90, 120, 180, 270, 360]).toContain(a.recommendedDurationDays);
                count++;
              }
    expect(count).toBe(1080);
  });
});
