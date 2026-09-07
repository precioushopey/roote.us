import { describe, it, expect } from 'vitest';
import { en } from './messages/en';
import { he } from './messages/he';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers, Gender, HairGoal } from '@/domain/analysis/types';

const opts = {
  hairGoal: ['thicker-fuller', 'slow-graying', 'stop-loss', 'hair-growth', 'other'],
  q1_area: ['hairline', 'crown', 'entire-scalp'],
  q2_onset: ['lt-6mo', '6-12mo', '1-3y', 'gt-3y'],
  q3_prior: ['never', 'no-success', 'partial'],
  q4_family: ['yes', 'no', 'not-sure'],
} as const;

function everyKeyEmitted(): Set<string> {
  const keys = new Set<string>();
  for (const gender of ['male', 'female'] as Gender[])
    for (const hairGoal of opts.hairGoal as readonly HairGoal[])
      for (const q1_area of opts.q1_area)
        for (const q2_onset of opts.q2_onset)
          for (const q3_prior of opts.q3_prior)
            for (const q4_family of opts.q4_family) {
              const answers = { q1_area, q2_onset, q3_prior, q4_family, q13_progression: 'gradual' } as Answers;
              const a = deriveAnalysis({ gender, hairGoal, answers });
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
