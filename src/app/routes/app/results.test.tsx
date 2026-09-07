import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { TrackingProvider } from '@/store/tracking';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { PHOTO_VIEWS } from '@/domain/tracking/types';
import { AccountResults } from './AccountResults';
import { AccountRenew } from './AccountRenew';

const ANALYSIS = deriveAnalysis({
  gender: 'male',
  hairGoal: 'stop-loss',
  answers: { q1_area: 'crown', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'yes', q13_progression: 'gradual' },
});
const THUMB = 'data:image/png;base64,iVBORw0KGgo=';
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

function seed({ daysAgo = 60, withFinal = false }: { daysAgo?: number; withFinal?: boolean } = {}) {
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
        orderId: 'ord-1', reportId: 'rep-1', durationDays: 180,
        startDate: iso(-daysAgo), endDate: iso(180 - daysAgo),
        plan: { core: [], supporting: [] }, completionLog: {}, progressPhotos: [], reminders: [], analysisSnapshot: {},
      },
    }),
  );
  if (withFinal) {
    const photo = (checkpointId: string, view: string) => ({
      id: `${checkpointId}-${view}`, checkpointId, view, capturedAt: `${iso(-daysAgo + 180)}T00:00:00Z`, blobId: `b-${view}`, thumb: THUMB,
    });
    const metric = (key: string, status: string) => ({
      key, status, value: null, unit: null, provider: 'mock', isMock: true, confidence: null, capturedAt: `${iso(-1)}T00:00:00Z`,
    });
    localStorage.setItem(
      'roote.tracking',
      JSON.stringify({
        programId: 'ord-1',
        taskLog: {},
        photos: [
          ...PHOTO_VIEWS.map((v) => ({ ...photo('baseline-d0', v), capturedAt: `${iso(-daysAgo)}T00:00:00Z` })),
          ...PHOTO_VIEWS.map((v) => photo('final-scan-d180', v)),
        ],
        scans: [
          {
            id: 'final-1', type: 'final', provider: 'mock', isMock: true, capturedAt: `${iso(-1)}T00:00:00Z`,
            metrics: [metric('hair-density', 'app.metric.level.medium'), metric('visible-thinning', 'app.metric.level.low')],
            imageRefs: [], grayProfile: null,
          },
        ],
        checkpointLog: { 'final-scan-d180': iso(-1) },
        reminderSettings: {},
      }),
    );
  }
}

function renderScreen(el: React.ReactNode = <AccountResults />) {
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

describe('AccountResults (spec §10 — ROOTÉ PROGRAM RESULTS)', () => {
  it('holds back the report until the program (or a final scan) is done', () => {
    seed({ daysAgo: 40, withFinal: false });
    renderScreen();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('results report is being prepared');
    expect(screen.getByRole('link', { name: /back to overview/i })).toHaveAttribute('href', '/en-us/account');
    expect(screen.queryByText('Adherence')).not.toBeInTheDocument();
  });

  it('assembles before/after, initial-vs-final, adherence, products, timeline and neutral next steps', () => {
    seed({ withFinal: true });
    renderScreen();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your ROOTÉ program results');
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument();
    expect(screen.getByText('180 days')).toBeInTheDocument();

    for (const heading of [
      'Before and after',
      'Initial and final analysis',
      'Adherence',
      'What you used',
      'Your program timeline',
      "What's next is your choice",
    ]) {
      expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
    }

    // initial vs final analysis is qualitative — no fabricated numbers
    const analysis = screen.getByText('Initial and final analysis').closest('section')!;
    expect(within(analysis).getAllByText('Initial').length).toBeGreaterThan(0);
    expect(within(analysis).getAllByText('Final').length).toBeGreaterThan(0);
    expect(within(analysis).getAllByText('Moderate').length).toBeGreaterThan(0); // hair-density read
    expect(analysis.textContent).not.toMatch(/\d\s*%/);

    // ROOTÉ never auto-picks a medical next step — the actions are the user's choice.
    // A completed customer goes to the Review-My-Next-Program flow (PO #19), not the generic picker.
    expect(screen.getAllByRole('link', { name: 'Review my next program' })[0]).toHaveAttribute(
      'href',
      '/en-us/account/renew',
    );
    expect(screen.getByRole('link', { name: 'Run a new hair analysis' })).toHaveAttribute('href', '/en-us/analysis');
    expect(screen.getByRole('link', { name: 'Message the care team' })).toHaveAttribute('href', '/en-us/account/care');

    // PO #18: a real PDF download (+ an email stub), not a browser-print button
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email PDF' })).toBeInTheDocument();
  });
});

describe('AccountRenew (PO #19 — Review My Next Program)', () => {
  it('carries the profile forward and offers continue / maintain / re-assess', () => {
    seed({ withFinal: true });
    renderScreen(<AccountRenew />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Review my next program');
    expect(screen.getByText('Your hair profile now')).toBeInTheDocument();
    for (const path of ['Continue the same program', 'Move to maintenance', 'Re-assess first']) {
      expect(screen.getByText(path)).toBeInTheDocument();
    }
    // never auto-picks a medical step
    expect(screen.getByText(/ROOTÉ does not select a medical next step/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose a plan' })).toHaveAttribute('href', '/en-us/program/plan');
  });
});
