import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { TrackingProvider } from '@/store/tracking';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { AccountBaseline } from './AccountBaseline';
import { AccountPhotos } from './AccountPhotos';
import { AccountScans } from './AccountScans';

const ANALYSIS = deriveAnalysis({
  gender: 'male',
  hairGoal: 'stop-loss',
  answers: { q1_area: 'crown', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'yes', q13_progression: 'gradual' },
});

const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

function seed(daysAgo: number, durationDays = 180, tracking?: Record<string, unknown>) {
  localStorage.clear();
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', hairGoal: 'stop-loss', photos: [], answers: {}, grayAnswers: {}, healthHistory: ['none'], photoConsent: true },
      analysis: ANALYSIS,
      grayProfile: null,
      reportId: 'rep-1',
      account: { email: 'demo@roote.us' },
      program: {
        orderId: 'ord-1',
        reportId: 'rep-1',
        durationDays,
        startDate: iso(-daysAgo),
        endDate: iso(durationDays - daysAgo),
        plan: { core: [], supporting: [] },
        completionLog: {},
        progressPhotos: [],
        reminders: [],
        analysisSnapshot: {},
      },
    }),
  );
  if (tracking) localStorage.setItem('roote.tracking', JSON.stringify({ programId: 'ord-1', ...tracking }));
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

describe('AccountBaseline (spec §4 — the BEFORE state)', () => {
  it('labels day 0, shows the four views, and renders qualitative reads only (no numbers)', () => {
    seed(4);
    const { container } = renderScreen(<AccountBaseline />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your baseline');
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('Program start')).toBeInTheDocument();
    expect(screen.getByText('Initial analysis')).toBeInTheDocument();
    // four assessment views, all empty in this seed
    expect(screen.getAllByText('No photo yet')).toHaveLength(4);
    // locked decision: nothing numeric / no percentages until a real provider
    expect(container.textContent).not.toMatch(/\d\s*%/);
    expect(screen.getByText(/qualitative reads/i)).toBeInTheDocument();
  });
});

describe('AccountPhotos (spec §5 — organised by checkpoint)', () => {
  it('lists every non-final checkpoint, marks the baseline done, and offers no capture early', () => {
    seed(4);
    const { container } = renderScreen(<AccountPhotos />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Progress photos');
    expect(screen.getByText(/Initial hair scan · Day 0/)).toBeInTheDocument();
    expect(screen.getByText(/Progress photos · Day 30/)).toBeInTheDocument();
    expect(screen.getByText(/Progress scan · Day 90/)).toBeInTheDocument();
    // the final scan is handled on the Hair Scans screen, not here
    expect(screen.queryByText(/Final hair scan/)).not.toBeInTheDocument();
    // baseline is captured at program start — never "due" again
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    // day 5: nothing is capturable yet
    expect(container.querySelectorAll('input[type="file"]')).toHaveLength(0);
  });

  it('opens the guided capture for a checkpoint that is due', () => {
    seed(31); // currentDay ~32 → the Day 30 photo checkpoint is due
    const { container } = renderScreen(<AccountPhotos />);
    expect(container.querySelectorAll('input[type="file"]').length).toBeGreaterThanOrEqual(4);
  });
});

describe('AccountScans (spec §6 — checkpoint-triggered re-scan)', () => {
  it('shows an empty history and no prompt before any scan checkpoint is due', () => {
    seed(4);
    renderScreen(<AccountScans />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hair scans');
    expect(screen.getByText('No progress scans yet.')).toBeInTheDocument();
    expect(screen.queryByText('Time for your progress scan')).not.toBeInTheDocument();
  });

  it('prompts a progress scan when a scan checkpoint comes due', () => {
    seed(88); // currentDay ~89 → the Day 90 scan checkpoint is due (PO #14 cadence)
    renderScreen(<AccountScans />);
    expect(screen.getByText('Time for your progress scan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start scan' })).toBeInTheDocument();
  });

  it('prompts the FINAL scan at program end once earlier scans are logged', () => {
    seed(182, 180, { checkpointLog: { 'scan-d90': iso(-92) } });
    renderScreen(<AccountScans />);
    expect(screen.getByText('Your final ROOTÉ hair scan')).toBeInTheDocument();
  });
});
