import { describe, it, expect } from 'vitest';
import { deriveAnalysis } from './deriveAnalysis';
import type { Answers, Gender } from './types';

const base: Answers = {
  q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both',
};
const run = (gender: Gender, over: Partial<Answers> = {}) =>
  deriveAnalysis({ gender, answers: { ...base, ...over } });

describe('deriveAnalysis', () => {
  it('is pure — same input, deep-equal output', () => {
    expect(run('male')).toEqual(run('male'));
  });

  it('picks the scale from gender', () => {
    expect(run('male').scale).toBe('norwood');
    expect(run('female').scale).toBe('ludwig');
  });

  it('maps onset to severity band and keeps stage within scale bounds', () => {
    expect(run('male', { q2_onset: 'lt-1y' }).severityBand).toBe('mild');
    expect(run('male', { q2_onset: '1-5y' }).severityBand).toBe('moderate');
    expect(run('male', { q2_onset: 'gt-5y' }).severityBand).toBe('established');
    for (const onset of ['lt-1y', '1-5y', 'gt-5y'] as const) {
      const nw = run('male', { q2_onset: onset });
      expect(nw.stage).toBeGreaterThanOrEqual(1);
      expect(nw.stage).toBeLessThanOrEqual(7);
      const lw = run('female', { q2_onset: onset });
      expect(lw.stage).toBeGreaterThanOrEqual(1);
      expect(lw.stage).toBeLessThanOrEqual(3);
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

  it('derives plan emphasis from the goal', () => {
    expect(run('male', { q5_goal: 'stop' }).planEmphasis).toBe('stabilize');
    expect(run('male', { q5_goal: 'regrow' }).planEmphasis).toBe('regrow');
    expect(run('male', { q5_goal: 'both' }).planEmphasis).toBe('stabilize-regrow');
  });

  it('recommends a duration from the (severity:emphasis) table', () => {
    expect(run('male', { q2_onset: 'lt-1y', q5_goal: 'stop' }).recommendedDurationDays).toBe(120);
    expect(run('male', { q2_onset: 'gt-5y', q5_goal: 'regrow' }).recommendedDurationDays).toBe(360);
    expect([90, 120, 180, 270, 360]).toContain(run('female', { q2_onset: '1-5y' }).recommendedDurationDays);
  });

  it('emits note keys for prior treatment and family history', () => {
    expect(run('male', { q3_prior: 'never' }).notes).toContain('note.treatment-naive');
    expect(run('male', { q3_prior: 'no-success' }).notes).toContain('note.prior-no-response');
    expect(run('male', { q3_prior: 'partial' }).notes).toContain('note.prior-partial');
    expect(run('male', { q4_family: 'yes' }).notes).toContain('note.family-history-positive');
  });

  it('summaryPlainKey is scoped by scale and severity', () => {
    expect(run('male', { q2_onset: 'lt-1y' }).summaryPlainKey).toBe('summary.norwood.mild');
    expect(run('female', { q2_onset: 'gt-5y' }).summaryPlainKey).toBe('summary.ludwig.established');
  });

  // Exhaustive: every gender × Q1..Q5 combo produces a structurally valid result.
  it('produces a valid analysis for all 2×3^5 = 486 input combinations', () => {
    const opts = {
      q1_area: ['hairline', 'crown', 'entire-scalp'],
      q2_onset: ['lt-1y', '1-5y', 'gt-5y'],
      q3_prior: ['never', 'no-success', 'partial'],
      q4_family: ['yes', 'no', 'not-sure'],
      q5_goal: ['stop', 'regrow', 'both'],
    } as const;
    let count = 0;
    for (const gender of ['male', 'female'] as const)
      for (const q1_area of opts.q1_area)
        for (const q2_onset of opts.q2_onset)
          for (const q3_prior of opts.q3_prior)
            for (const q4_family of opts.q4_family)
              for (const q5_goal of opts.q5_goal) {
                const a = deriveAnalysis({ gender, answers: { q1_area, q2_onset, q3_prior, q4_family, q5_goal } });
                expect(a.flaggedZones.length).toBeGreaterThan(0);
                expect(a.densityByZone).toHaveLength(4);
                expect(a.metrics.length).toBeGreaterThanOrEqual(3);
                expect([90, 120, 180, 270, 360]).toContain(a.recommendedDurationDays);
                count++;
              }
    expect(count).toBe(486);
  });
});
