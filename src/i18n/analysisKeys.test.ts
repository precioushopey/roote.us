import { describe, it, expect } from 'vitest';
import { en } from './messages/en';
import { he } from './messages/he';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers, Gender } from '@/domain/analysis/types';

const opts = {
  q1_area: ['hairline', 'crown', 'entire-scalp'],
  q2_onset: ['lt-1y', '1-5y', 'gt-5y'],
  q3_prior: ['never', 'no-success', 'partial'],
  q4_family: ['yes', 'no', 'not-sure'],
  q5_goal: ['stop', 'regrow', 'both'],
} as const;

function everyKeyEmitted(): Set<string> {
  const keys = new Set<string>();
  for (const gender of ['male', 'female'] as Gender[])
    for (const q1_area of opts.q1_area)
      for (const q2_onset of opts.q2_onset)
        for (const q3_prior of opts.q3_prior)
          for (const q4_family of opts.q4_family)
            for (const q5_goal of opts.q5_goal) {
              const a = deriveAnalysis({ gender, answers: { q1_area, q2_onset, q3_prior, q4_family, q5_goal } as Answers });
              a.flaggedZones.forEach((z) => { keys.add(z.noteKey); keys.add(`zone.${z.zone}`); });
              a.densityByZone.forEach((d) => keys.add(`zone.${d.zone}`));
              a.metrics.forEach((m) => keys.add(`metric.${m.key}`));
              a.notes.forEach((n) => keys.add(n));
              keys.add(a.summaryPlainKey);
              keys.add(`severity.${a.severityBand}`);
              keys.add(`scale.${a.scale}.label`);
            }
  return keys;
}

describe('analysis keys resolve in both locales', () => {
  const emitted = [...everyKeyEmitted()];
  it.each(emitted)('key "%s" exists in en and he', (key) => {
    expect(en, `en missing ${key}`).toHaveProperty(key);
    expect(he, `he missing ${key}`).toHaveProperty(key);
  });
});
