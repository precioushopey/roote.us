import { describe, it, expect } from 'vitest';
import { CHECKPOINT_SCHEDULE, buildCheckpoints, nextCheckpoint, checkpointState } from './checkpoints';
import { tasksForDay, migrateTaskKeys, type ResolvedTreatment } from './schedule';
import { deriveStatus, adherencePct, programDay } from './status';
import { generateReminders, isReminderEnabled } from './reminders';
import { buildUserProgram } from './buildUserProgram';
import type { Program, ProgramDurationDays } from '@/domain/program/types';
import type { HairAnalysis } from '@/domain/analysis/types';

const DURATIONS: ProgramDurationDays[] = [90, 120, 180, 270, 360];

describe('checkpoint schedule (spec §3)', () => {
  it('every supported duration has a baseline and a final scan on the right days', () => {
    for (const d of DURATIONS) {
      const cps = buildCheckpoints(d, '2026-01-01');
      expect(cps[0]).toMatchObject({ day: 0, type: 'baseline' });
      expect(cps[cps.length - 1]).toMatchObject({ day: d, type: 'final-scan' });
    }
  });

  it('is a distinct, ascending day list per duration', () => {
    for (const d of DURATIONS) {
      const days = CHECKPOINT_SCHEDULE[d].map((c) => c.day);
      expect(days).toEqual([...days].sort((a, b) => a - b));
      expect(new Set(days).size).toBe(days.length);
    }
  });

  it('is photos every 30d, formal scans at 90/180/270, final on the last day (PO #14)', () => {
    const scanDays = (d: ProgramDurationDays) =>
      CHECKPOINT_SCHEDULE[d].filter((c) => c.type === 'scan').map((c) => c.day);
    expect(scanDays(90)).toEqual([]);
    expect(scanDays(120)).toEqual([90]);
    expect(scanDays(180)).toEqual([90]);
    expect(scanDays(270)).toEqual([90, 180]);
    expect(scanDays(360)).toEqual([90, 180, 270]);
    // day 90 is a scan, so no photo also lands there
    expect(CHECKPOINT_SCHEDULE[180].filter((c) => c.day === 90)).toHaveLength(1);
  });

  it('nextCheckpoint returns the earliest upcoming, or the earliest overdue, skipping skipped', () => {
    const cps = buildCheckpoints(180, '2026-01-01');
    expect(nextCheckpoint(cps, 10)?.day).toBe(30);
    expect(nextCheckpoint(cps, 200)?.day).toBe(30); // all overdue → earliest
    expect(nextCheckpoint(cps, 200, [cps[1].id])?.day).toBe(60); // day-30 skipped
  });

  it('checkpointState: skipped, overdue after +7 days, due within -3, else upcoming', () => {
    const cps = buildCheckpoints(180, '2026-01-01');
    const d60 = cps.find((c) => c.day === 60)!;
    expect(checkpointState(d60, 40)).toBe('upcoming');
    expect(checkpointState(d60, 58)).toBe('due');
    expect(checkpointState(d60, 70)).toBe('overdue');
    expect(checkpointState(d60, 70, true)).toBe('skipped');
    expect(checkpointState({ ...d60, completedDate: '2026-03-01' }, 70)).toBe('completed');
  });
});

const TREATMENTS: { core: ResolvedTreatment[]; supporting: ResolvedTreatment[] } = {
  core: [{ key: 'density-10', name: 'ROOTÉ Density 10', frequency: 'Twice daily' }],
  supporting: [
    { key: 'regrowth-shampoo', name: 'Regrowth Shampoo', frequency: 'Daily' },
    { key: 'gray-support', name: 'Gray Support', frequency: 'Daily' },
  ],
};

describe('daily schedule (spec §2)', () => {
  it('groups tasks into morning / evening / shampoo', () => {
    const routine = tasksForDay(TREATMENTS, '2026-02-10');
    expect(routine.morning.map((t) => t.productId)).toContain('gray-support');
    expect(routine.evening.map((t) => t.productId)).toContain('density-10');
    expect(routine.shampoo.map((t) => t.productId)).toContain('regrowth-shampoo');
  });

  it('reads status from the task log, defaulting to pending', () => {
    const routine = tasksForDay(TREATMENTS, '2026-02-10', { '2026-02-10': { 'gray-support': 'done' } });
    expect(routine.morning.find((t) => t.productId === 'gray-support')!.status).toBe('done');
    expect(routine.evening[0].status).toBe('pending');
  });

  it('migrates old flat completion keys by position', () => {
    const mapped = migrateTaskKeys(['core:0', 'support:0'], TREATMENTS);
    expect(mapped).toContain('density-10');
    expect(mapped).toContain('regrowth-shampoo');
  });
});

describe('program status (spec §1; PO #16) — a routine-completion tier, not a medical outcome', () => {
  it('complete once the last day is reached', () => {
    expect(deriveStatus(180, 180, 100)).toBe('complete');
  });
  it('on-track inside the 7-day grace window regardless of adherence', () => {
    expect(deriveStatus(5, 180, 0)).toBe('on-track');
  });
  it('tiers on rolling adherence after the grace window: 80+ on-track, 60-79 keep-going, <60 catch-up', () => {
    expect(deriveStatus(30, 180, 90)).toBe('on-track');
    expect(deriveStatus(30, 180, 70)).toBe('keep-going');
    expect(deriveStatus(30, 180, 40)).toBe('catch-up');
  });
  it('missed checkpoints do not set the status', () => {
    // day 80, day-60 checkpoint 20 days overdue, but adherence is perfect
    expect(deriveStatus(80, 180, 100)).toBe('on-track');
  });

  it('adherence counts done tasks over the rolling window, ignoring skipped', () => {
    const log = {
      '2026-02-10': { a: 'done', b: 'skipped' },
      '2026-02-09': { a: 'done', b: 'done' },
    };
    expect(adherencePct(log, 2, '2026-02-10', 7)).toBe(Math.round((3 / (2 * 7)) * 100));
  });

  it('programDay is 1-based and clamped', () => {
    expect(programDay('2026-01-01', 180, '2026-01-01')).toBe(1);
    expect(programDay('2026-01-01', 180, '2027-01-01')).toBe(180);
  });
});

describe('reminders (spec §15)', () => {
  it('generates photo / scan / final / reorder / completion reminders from the schedule', () => {
    const cps = buildCheckpoints(180, '2026-01-01');
    const reminders = generateReminders({
      checkpoints: cps,
      endDate: '2026-06-30',
      reorderDates: ['2026-06-16', '2026-06-23'],
      settings: {},
    });
    const types = new Set(reminders.map((r) => r.type));
    expect(types.has('progress-photo')).toBe(true);
    expect(types.has('progress-scan')).toBe(true);
    expect(types.has('final-scan')).toBe(true);
    expect(reminders.filter((r) => r.type === 'reorder')).toHaveLength(2); // PO #20: −14 and −7
    expect(types.has('program-completion')).toBe(true);
  });

  it('skips reminders for skipped checkpoints (PO #17)', () => {
    const cps = buildCheckpoints(180, '2026-01-01');
    const photo30 = cps.find((c) => c.type === 'photo')!;
    const reminders = generateReminders({
      checkpoints: cps,
      endDate: '2026-06-30',
      reorderDates: ['2026-06-16'],
      skipped: [photo30.id],
      settings: {},
    });
    expect(reminders.some((r) => r.id === `progress-photo-${photo30.id}`)).toBe(false);
  });

  it('respects saved settings over the defaults', () => {
    expect(isReminderEnabled('daily-treatment', {})).toBe(true);
    expect(isReminderEnabled('daily-treatment', { 'daily-treatment': false })).toBe(false);
    expect(isReminderEnabled('shipment', {})).toBe(false);
  });
});

describe('buildUserProgram (the dashboard view)', () => {
  const program: Program = {
    orderId: 'ord-1',
    reportId: 'rep-1',
    analysisSnapshot: {} as HairAnalysis,
    durationDays: 180,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    plan: { core: [], supporting: [] },
    completionLog: {},
    progressPhotos: [],
    reminders: [],
  };

  it('answers the dashboard questions: which day, how much done, next checkpoint', () => {
    const up = buildUserProgram({
      program,
      tracking: { programId: 'ord-1', taskLog: {}, photos: [], scans: [], checkpointLog: {}, skippedCheckpoints: [], reminderSettings: {} },
      today: '2026-01-05',
      reorderLeadDays: 21,
      taskCountPerDay: 3,
    });
    expect(up.currentDay).toBe(5);
    expect(up.daysCompleted).toBe(4);
    expect(up.daysRemaining).toBe(176);
    expect(up.pct).toBe(Math.round((4 / 180) * 100));
    expect(up.nextCheckpoint?.day).toBe(30);
    expect(up.status).toBe('on-track');
  });

  it('flags reorder when within the lead window', () => {
    const up = buildUserProgram({
      program,
      tracking: { programId: 'ord-1', taskLog: {}, photos: [], scans: [], checkpointLog: {}, skippedCheckpoints: [], reminderSettings: {} },
      today: '2026-06-20',
      reorderLeadDays: 21,
      taskCountPerDay: 3,
    });
    expect(up.reorderDue).toBe(true);
    expect(up.status).toBe('catch-up'); // empty task log → 0% adherence past the grace window
  });
});
