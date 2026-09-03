import { describe, it, expect } from 'vitest';
import type { Program } from '@/domain/program/types';
import { rooteContent } from '@/content/roote.config';
import {
  adherencePct,
  dailyTasks,
  daysRemaining,
  isReorderDue,
  programDay,
  reorderDate,
  resolvePlanTreatments,
} from './programProgress';

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
    const he = resolvePlanTreatments((k) => `t:${k}`, 'he');
    const en = resolvePlanTreatments((k) => `t:${k}`, 'en');
    expect(he.core[0].name).toBe(rooteContent.treatments.core[0].name.he);
    expect(en.core[0].name).toBe(rooteContent.treatments.core[0].name.en);
    expect(he.core[0].name).not.toBe(en.core[0].name);
    expect(he.supporting[0].name).toBe(rooteContent.treatments.supporting[0].name.he);
    expect(he.supporting[0].name).not.toBe(en.supporting[0].name);
    expect(he.core[0].usage).toBe('t:usage.apply-scalp-affected');
    expect(he.core[0].frequency).toBe('t:frequency.twice-daily');
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
