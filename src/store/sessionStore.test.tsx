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
});
