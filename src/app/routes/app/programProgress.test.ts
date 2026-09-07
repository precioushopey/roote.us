import { describe, it, expect } from 'vitest';
import type { Program } from '@/domain/program/types';
import { rooteContent } from '@/content/roote.config';
import {
  adherencePct,
  dailyTasks,
  daysRemaining,
  isReorderDue,
  planKeysForProgram,
  programDay,
  reorderDate,
  resolvePlanTreatments,
} from './programProgress';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';

function makeProgram(over: Partial<Program> = {}): Program {
  return {
    orderId: 'ord-1',
    reportId: 'rep-1',
    analysisSnapshot: {} as Program['analysisSnapshot'],
    durationDays: 180,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    plan: {
      core: [{ name: 'Topical', usage: 'apply', frequency: 'twice daily', appliesToLabels: ['crown'] }],
      supporting: [{ name: 'Cleanser', usage: 'wash', frequency: 'daily' }],
    },
    completionLog: {},
    progressPhotos: [],
    reminders: [],
    ...over,
  };
}

describe('programProgress', () => {
  it('programDay is 1-based and clamped to the program length', () => {
    const p = makeProgram();
    expect(programDay(p, '2026-01-01')).toBe(1);
    expect(programDay(p, '2026-01-11')).toBe(11);
    expect(programDay(p, '2030-01-01')).toBe(180);
    expect(programDay(p, '2020-01-01')).toBe(1);
  });

  it('daysRemaining never goes negative', () => {
    const p = makeProgram();
    expect(daysRemaining(p, '2026-06-20')).toBe(10);
    expect(daysRemaining(p, '2027-01-01')).toBe(0);
  });

  it('reorderDate is endDate minus the configured lead time, and isReorderDue tracks it', () => {
    const p = makeProgram();
    expect(reorderDate(p)).toBe('2026-06-09'); // 21 days before 2026-06-30
    expect(isReorderDue(p, '2026-01-01')).toBe(false);
    expect(isReorderDue(p, '2026-06-15')).toBe(true);
  });

  it('dailyTasks flattens the resolved core + supporting plan with stable keys', () => {
    const tasks = dailyTasks({
      core: [{ key: 'roote-topical', name: 'Topical', usage: 'apply', frequency: 'twice daily', appliesToLabels: ['crown'] }],
      supporting: [{ key: 'cleanser', name: 'Cleanser', usage: 'wash', frequency: 'daily', appliesToLabels: [] }],
    });
    expect(tasks.map((t) => t.key)).toEqual(['core:0', 'support:0']);
    expect(tasks[0].name).toBe('Topical');
  });

  it('resolvePlanTreatments renders names in the active locale and resolves usage/frequency via t', () => {
    const keys = { core: ['density-10'], supporting: ['regrowth-shampoo'] };
    const he = resolvePlanTreatments((k) => `t:${k}`, 'he', keys);
    const en = resolvePlanTreatments((k) => `t:${k}`, 'en', keys);
    expect(he.core[0].name).toBe(rooteContent.treatmentRegistry['density-10'].name.he);
    expect(en.core[0].name).toBe(rooteContent.treatmentRegistry['density-10'].name.en);
    expect(he.core[0].name).not.toBe(en.core[0].name);
    expect(he.supporting[0].name).toBe(rooteContent.treatmentRegistry['regrowth-shampoo'].name.he);
    expect(he.supporting[0].name).not.toBe(en.supporting[0].name);
    expect(he.core[0].usage).toBe('t:usage.apply-scalp-affected');
    expect(he.core[0].frequency).toBe('t:frequency.daily-evening');
  });

  it('planKeysForProgram branches by Hair Goal (client-confirmed) — closes the gray/thinning routine gap', () => {
    const answers = { q1_area: 'crown', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'yes', q13_progression: 'gradual' } as const;
    const analysis = deriveAnalysis({ gender: 'male', hairGoal: 'stop-loss', answers });

    const stopLoss = planKeysForProgram({ hairGoal: 'stop-loss', gender: 'male', answers }, analysis);
    expect(stopLoss.core).toEqual(['regrowth-shampoo']);
    expect(stopLoss.supporting).not.toContain('gray-support');
    expect(stopLoss.supporting).not.toContain('gray-serum');

    const slowGraying = planKeysForProgram({ hairGoal: 'slow-graying', gender: 'female', answers }, analysis);
    expect(slowGraying.core).toEqual(['gray-support']); // core is Anti-Gray Capsules, not a Density component
    expect(slowGraying.supporting).toEqual(expect.arrayContaining(['gray-serum']));
    expect(slowGraying.supporting).not.toContain('regrowth-shampoo');

    const thickerFuller = planKeysForProgram({ hairGoal: 'thicker-fuller', gender: 'male', answers }, analysis);
    expect(thickerFuller.core).toEqual(['density-serum']);
    expect(thickerFuller.supporting).toEqual(expect.arrayContaining(['derma-stim']));

    // Hair Growth is confirmed but not production-active — never a live core recommendation yet.
    const hairGrowth = planKeysForProgram({ hairGoal: 'hair-growth', gender: 'male', answers }, analysis);
    expect(hairGrowth.core).toHaveLength(0);

    expect(planKeysForProgram({ hairGoal: 'stop-loss', gender: null, answers }, analysis)).toEqual({ core: [], supporting: [] });
  });

  it('adherencePct is a rolling completion rate over the window', () => {
    const p = makeProgram({
      completionLog: { '2026-03-10': ['core:0', 'support:0'], '2026-03-09': ['core:0'] },
    });
    // 3 completions / (2 tasks * 7 days) ≈ 21%
    expect(adherencePct(p, 7, '2026-03-10')).toBe(21);
    expect(adherencePct(makeProgram(), 7, '2026-03-10')).toBe(0);
  });
});
