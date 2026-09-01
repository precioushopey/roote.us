import { describe, it, expect } from 'vitest';
import { seedDiagnosisAndReport } from './devSeed';

describe('seedDiagnosisAndReport', () => {
  it('produces a coherent, complete diagnosis + analysis + reportId', () => {
    const seed = seedDiagnosisAndReport();
    expect(seed.diagnosis.gender).not.toBeNull();
    expect(seed.analysis.recommendedDurationDays).toBeGreaterThan(0);
    expect(seed.reportId).toMatch(/^rep-/);
  });
});
