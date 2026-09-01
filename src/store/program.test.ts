import { describe, it, expect } from 'vitest';
import { buildProgram } from './program';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

describe('buildProgram', () => {
  it('freezes plan, analysis, and computes endDate from durationDays', () => {
    const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
    const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
    const analysis = deriveAnalysis({ gender: 'male', answers });
    const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-9' });

    const program = buildProgram({
      orderId: 'ord-9',
      reportId: 'rep-9',
      analysis,
      durationDays: 180,
      plan: model.plan,
      today: new Date('2026-09-02T00:00:00.000Z'),
    });

    expect(program.orderId).toBe('ord-9');
    expect(program.reportId).toBe('rep-9');
    expect(program.durationDays).toBe(180);
    expect(program.startDate).toBe('2026-09-02');
    expect(program.endDate).toBe('2027-03-01'); // 2026-09-02 + 180 days
    expect(program.analysisSnapshot).toEqual(analysis);
    expect(program.plan.core).toEqual(model.plan.core);
    expect(program.plan.supporting).toEqual(model.plan.supporting);
    expect(program.completionLog).toEqual({});
    expect(program.progressPhotos).toEqual([]);
    expect(program.reminders).toEqual([]);
  });

  it('never mutates the analysis object it is given', () => {
    const analysis = deriveAnalysis({ gender: 'female', answers: { q1_area: 'crown', q2_onset: 'lt-1y', q3_prior: 'never', q4_family: 'no', q5_goal: 'regrow' } });
    const before = JSON.stringify(analysis);
    buildProgram({ orderId: 'o', reportId: 'r', analysis, durationDays: 90, plan: { core: [], supporting: [], formula: null } as never, today: new Date() });
    expect(JSON.stringify(analysis)).toBe(before);
  });
});
