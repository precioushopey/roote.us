import { describe, it, expect } from 'vitest';
import { qualitativeMetrics, compareMetric } from './metrics';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { deriveGrayProfile } from '@/domain/analysis/grayProfile';
import type { HairMetric } from './types';

const analysis = deriveAnalysis({
  gender: 'male',
  hairGoal: 'stop-loss',
  answers: { q1_area: 'crown', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'yes', q13_progression: 'gradual' },
});

const grayProfile = deriveGrayProfile({
  answers: { g1_onset: '1-5y', g2_area: 'crown', g3_pace: 'steady', g4_color: 'no' },
});

describe('qualitativeMetrics (locked decision: no numbers until a real provider)', () => {
  it('emits qualitative status keys with null value/unit while isMock', () => {
    const metrics = qualitativeMetrics({ analysis, provider: 'mock', isMock: true, capturedAt: '2026-02-01T00:00:00Z' });
    expect(metrics.length).toBeGreaterThan(0);
    for (const m of metrics) {
      expect(m.value).toBeNull();
      expect(m.unit).toBeNull();
      expect(m.isMock).toBe(true);
      expect(typeof m.status).toBe('string');
    }
    expect(metrics.map((m) => m.key)).toContain('hair-density');
  });

  it('adds a gray-pattern metric only when a gray profile is present', () => {
    const withGray = qualitativeMetrics({
      analysis,
      grayProfile,
      provider: 'mock',
      isMock: true,
      capturedAt: '2026-02-01T00:00:00Z',
    });
    expect(withGray.some((m) => m.key === 'gray-pattern')).toBe(true);
    const noGray = qualitativeMetrics({ analysis, provider: 'mock', isMock: true, capturedAt: '2026-02-01T00:00:00Z' });
    expect(noGray.some((m) => m.key === 'gray-pattern')).toBe(false);
  });

  it('carries the provider name and mock flag through unchanged', () => {
    const real = qualitativeMetrics({ analysis, provider: 'hairhealth.ai', isMock: false, capturedAt: 'x' });
    expect(real.every((m) => m.provider === 'hairhealth.ai' && m.isMock === false)).toBe(true);
  });
});

describe('compareMetric', () => {
  const base: HairMetric = {
    key: 'hair-density', status: 's', value: 58, unit: '%',
    provider: 'p', isMock: false, confidence: null, capturedAt: '',
  };

  it('reports a numeric change only when both sides are real (non-mock) numbers', () => {
    expect(compareMetric(base, { ...base, value: 63 }).numericChange).toBe(5);
    expect(compareMetric({ ...base, isMock: true }, { ...base, value: 63, isMock: true }).numericChange).toBeNull();
    expect(compareMetric({ ...base, value: null }, { ...base, value: null }).numericChange).toBeNull();
  });

  it('still surfaces qualitative status on both sides when numbers are absent', () => {
    const b: HairMetric = { ...base, value: null, status: 'app.metric.level.high' };
    const l: HairMetric = { ...base, value: null, status: 'app.metric.level.medium' };
    const cmp = compareMetric(b, l);
    expect(cmp).toMatchObject({
      key: 'hair-density',
      baselineStatus: 'app.metric.level.high',
      latestStatus: 'app.metric.level.medium',
      numericChange: null,
    });
  });
});
