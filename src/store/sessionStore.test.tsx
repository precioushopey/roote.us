import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SessionProvider, useSession } from './sessionStore';

let api: ReturnType<typeof useSession>;
function Harness() {
  api = useSession();
  return <span data-testid="gender">{api.diagnosis.gender ?? 'none'}</span>;
}

function setup() {
  render(<SessionProvider><Harness /></SessionProvider>);
}

describe('sessionStore', () => {
  it('starts empty', () => {
    setup();
    expect(screen.getByTestId('gender')).toHaveTextContent('none');
    expect(api.analysis).toBeNull();
    expect(api.reportId).toBeNull();
  });

  it('sets gender and answers, and de-dupes photos by angle', () => {
    setup();
    act(() => api.setGender('male'));
    expect(api.diagnosis.gender).toBe('male');

    act(() => api.setAnswer('q1_area', 'crown'));
    expect(api.diagnosis.answers.q1_area).toBe('crown');

    act(() => api.addPhoto({ id: 'a', angleKey: 'front', thumb: 'x', blobId: 'b1' }));
    act(() => api.addPhoto({ id: 'b', angleKey: 'front', thumb: 'y', blobId: 'b2' }));
    expect(api.diagnosis.photos).toHaveLength(1);
    expect(api.diagnosis.photos[0].id).toBe('b');
  });

  it('persists to localStorage and rehydrates', () => {
    setup();
    act(() => api.setGender('female'));
    act(() => api.setReportId('r-1'));

    // Re-mount a fresh provider — state should come back from storage.
    render(<SessionProvider><Harness /></SessionProvider>);
    expect(api.diagnosis.gender).toBe('female');
    expect(api.reportId).toBe('r-1');
  });

  it('reset clears everything', () => {
    setup();
    act(() => api.setGender('male'));
    act(() => api.reset());
    expect(api.diagnosis.gender).toBeNull();
  });

  it('stores a draft duration and, separately, a full program', () => {
    setup();
    act(() => api.setDraftDurationDays(180));
    expect(api.draftDurationDays).toBe(180);

    const program = {
      orderId: 'ord-1',
      reportId: 'rep-1',
      analysisSnapshot: {
        scale: 'norwood' as const,
        stage: 3,
        severityBand: 'moderate' as const,
        flaggedZones: [{ zone: 'crown-vertex' as const, severity: 'moderate' as const, noteKey: 'zone-note.crown-vertex' }],
        densityByZone: [{ zone: 'crown-vertex' as const, level: 'medium' as const }],
        metrics: [{ key: 'pattern-stage' as const, level: 'medium' as const }],
        notes: [],
        planEmphasis: 'stabilize-regrow' as const,
        summaryPlainKey: 'summary.norwood.moderate',
        recommendedDurationDays: 270 as const,
      },
      durationDays: 180 as const,
      startDate: '2026-09-02',
      endDate: '2027-03-01',
      plan: { core: [], supporting: [] },
      completionLog: {},
      progressPhotos: [],
      reminders: [],
    };
    act(() => api.setProgram(program));
    expect(api.program?.orderId).toBe('ord-1');

    // program mutations used by the post-purchase app
    act(() => api.toggleProgramTask('2026-09-05', 'core:0'));
    expect(api.program?.completionLog['2026-09-05']).toEqual(['core:0']);
    act(() => api.toggleProgramTask('2026-09-05', 'core:0'));
    expect(api.program?.completionLog['2026-09-05']).toEqual([]);

    act(() =>
      api.addProgramPhoto({ id: 'ph1', isoDate: '2026-09-05', angleKey: 'front', blobId: 'b1', thumb: 't' }),
    );
    expect(api.program?.progressPhotos).toHaveLength(1);
  });
});
