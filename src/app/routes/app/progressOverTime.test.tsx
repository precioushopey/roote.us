import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { TrackingProvider } from '@/store/tracking';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { PHOTO_VIEWS } from '@/domain/tracking/types';
import { AccountProgress } from './AccountProgress';
import { AccountBeforeAfter } from './AccountBeforeAfter';

const ANALYSIS = deriveAnalysis({
  gender: 'male',
  answers: { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' },
});
const THUMB = 'data:image/png;base64,iVBORw0KGgo=';
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

function seed({ daysAgo = 95, withTracking = false }: { daysAgo?: number; withTracking?: boolean } = {}) {
  localStorage.clear();
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', concern: 'thinning', photos: [], answers: {}, grayAnswers: {}, photoConsent: true },
      analysis: ANALYSIS,
      grayProfile: null,
      reportId: 'rep-1',
      account: { email: 'demo@roote.us' },
      program: {
        orderId: 'ord-1', reportId: 'rep-1', durationDays: 180,
        startDate: iso(-daysAgo), endDate: iso(180 - daysAgo),
        plan: { core: [], supporting: [] }, completionLog: {}, progressPhotos: [], reminders: [], analysisSnapshot: {},
      },
    }),
  );
  if (withTracking) {
    const photo = (checkpointId: string, view: string, day: number) => ({
      id: `${checkpointId}-${view}`, checkpointId, view, capturedAt: iso(-daysAgo + day), blobId: `b-${checkpointId}-${view}`, thumb: THUMB,
    });
    const metric = (key: string, status: string) => ({
      key, status, value: null, unit: null, provider: 'mock', isMock: true, confidence: null, capturedAt: iso(-daysAgo + 90),
    });
    localStorage.setItem(
      'roote.tracking',
      JSON.stringify({
        programId: 'ord-1',
        taskLog: {},
        photos: [
          ...PHOTO_VIEWS.map((v) => photo('baseline-d0', v, 0)),
          ...PHOTO_VIEWS.map((v) => photo('scan-d90', v, 90)),
        ],
        scans: [
          {
            id: 'scan-1', type: 'progress', provider: 'mock', isMock: true, capturedAt: `${iso(-daysAgo + 90)}T00:00:00Z`,
            metrics: [metric('hair-density', 'app.metric.level.medium'), metric('visible-thinning', 'app.metric.level.high')],
            imageRefs: [], grayProfile: null,
          },
        ],
        checkpointLog: { 'scan-d90': iso(-daysAgo + 90) },
        skippedCheckpoints: [],
        reminderSettings: {},
      }),
    );
  }
}

function renderScreen(el: React.ReactNode) {
  const router = createMemoryRouter(
    [{ path: '/en-us', element: <LocaleProvider localeRegion="en-us">{el}</LocaleProvider> }],
    { initialEntries: ['/en-us'] },
  );
  return render(
    <AuthProvider>
      <SessionProvider>
        <TrackingProvider>
          <RouterProvider router={router} />
        </TrackingProvider>
      </SessionProvider>
    </AuthProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe('AccountProgress (spec §7 — progress over time)', () => {
  it('pairs each baseline read with the latest scan read, qualitative only', () => {
    seed({ withTracking: true });
    const { container } = renderScreen(<AccountProgress />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Progress over time');
    // metric card: baseline + latest, both qualitative words
    const density = screen.getByText('Hair density').closest('div')!;
    expect(within(density).getByText('Baseline')).toBeInTheDocument();
    expect(within(density).getByText('Latest')).toBeInTheDocument();
    // latest status rendered qualitatively (app.metric.level.medium → "Moderate")
    expect(within(density).getAllByText('Moderate').length).toBeGreaterThanOrEqual(1);
    // locked decision: no numbers / percentages
    expect(container.textContent).not.toMatch(/\d\s*%/);
    expect(screen.getByText(/qualitative reads/i)).toBeInTheDocument();
    expect(screen.getByText('Scan timeline')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /before & after/i })).toHaveAttribute(
      'href',
      '/en-us/account/progress/before-after',
    );
  });

  it('tells the user nothing is measured yet when no scan exists', () => {
    seed({ withTracking: false });
    renderScreen(<AccountProgress />);
    expect(screen.getByText(/first checkpoint scan will fill this in/i)).toBeInTheDocument();
  });
});

describe('AccountBeforeAfter (spec §8 — before/after tracker)', () => {
  it('points the user to add photos when there is nothing to compare', () => {
    seed({ withTracking: false });
    renderScreen(<AccountBeforeAfter />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Before & after');
    expect(screen.getByRole('link', { name: /add progress photos/i })).toHaveAttribute('href', '/en-us/account/photos');
  });

  it('offers slider / side-by-side / timeline across the four views', async () => {
    seed({ withTracking: true });
    renderScreen(<AccountBeforeAfter />);
    // view + mode controls
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    const modes = screen.getByRole('radiogroup', { name: 'Comparison style' });
    expect(within(modes).getByRole('radio', { name: 'Slider' })).toBeInTheDocument();

    // slider mode: a keyboard/pointer/touch range control
    expect(screen.getByRole('slider')).toBeInTheDocument();

    // side by side: two labelled frames
    await userEvent.click(within(modes).getByRole('radio', { name: 'Side by side' }));
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('Day 90')).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();

    // timeline: baseline + the checkpoint in one strip
    await userEvent.click(within(modes).getByRole('radio', { name: 'Timeline' }));
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('Day 90')).toBeInTheDocument();
  });
});
