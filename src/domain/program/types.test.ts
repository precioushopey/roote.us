import { describe, it, expect } from 'vitest';
import type { Program } from './types';

describe('Program type', () => {
  it('round-trips through JSON without losing fields', () => {
    const program: Program = {
      orderId: 'ord-1',
      reportId: 'rep-1',
      analysisSnapshot: {
        scale: 'norwood',
        stage: 3,
        severityBand: 'moderate',
        flaggedZones: [{ zone: 'crown-vertex', severity: 'moderate', noteKey: 'zone-note.crown-vertex' }],
        densityByZone: [{ zone: 'crown-vertex', level: 'medium' }],
        metrics: [{ key: 'pattern-stage', level: 'medium' }],
        notes: [],
        planEmphasis: 'stabilize-regrow',
        summaryPlainKey: 'summary.norwood.moderate',
        recommendedDurationDays: 270,
      },
      durationDays: 270,
      startDate: '2026-09-02',
      endDate: '2027-05-29',
      plan: { core: [], supporting: [] },
      completionLog: {},
      progressPhotos: [],
      reminders: [],
    };
    const round = JSON.parse(JSON.stringify(program)) as Program;
    expect(round).toEqual(program);
  });
});
