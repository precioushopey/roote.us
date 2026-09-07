// src/app/routes/start/StartLayout.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { StartLayout } from './StartLayout';

const ANSWERS = { q1_area: 'crown', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'yes', q13_progression: 'gradual' } as const;

function completeSeed(overrides: Record<string, unknown> = {}) {
  return {
    diagnosis: { gender: 'male', hairGoal: 'stop-loss', photos: [], answers: ANSWERS },
    analysis: deriveAnalysis({ gender: 'male', hairGoal: 'stop-loss', answers: ANSWERS }),
    reportId: 'rep-123',
    account: { email: null },
    draftDurationDays: null,
    program: null,
    ...overrides,
  };
}

function renderAt(path: string, seed?: Record<string, unknown>) {
  localStorage.setItem('roote.locale', 'en');
  if (seed) localStorage.setItem('roote.session', JSON.stringify(seed));
  const router = createMemoryRouter(
    [
      {
        path: '/en-us/program',
        element: (
          <LocaleProvider localeRegion="en-us">
            <StartLayout />
          </LocaleProvider>
        ),
        children: [{ index: true, element: <div>account-step</div> }],
      },
    ],
    { initialEntries: [path] },
  );
  return render(
    <AuthProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </AuthProvider>,
  );
}

describe('StartLayout', () => {
  it('shows the no-report state with no reportId and no ?report= param', () => {
    renderAt('/en-us/program');
    expect(screen.getByText(/completed hair analysis/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /demo report/i })).toBeInTheDocument();
  });

  it('renders the nested route when a persisted session resolves the report and no query param is present', () => {
    renderAt('/en-us/program', completeSeed({ reportId: 'rep-456' }));
    expect(screen.getByText('account-step')).toBeInTheDocument();
  });

  it('renders the nested route when the ?report= param matches the persisted session', () => {
    renderAt('/en-us/program?report=rep-123', completeSeed({ reportId: 'rep-123' }));
    expect(screen.getByText('account-step')).toBeInTheDocument();
  });

  it('shows the no-report state when the ?report= param does not match the persisted session', () => {
    renderAt('/en-us/program?report=rep-999', completeSeed({ reportId: 'rep-123' }));
    expect(screen.getByText(/completed hair analysis/i)).toBeInTheDocument();
  });

  it('shows the no-report state when the session has a reportId but no analysis', () => {
    renderAt('/en-us/program', completeSeed({ reportId: 'rep-789', analysis: null }));
    expect(screen.getByText(/completed hair analysis/i)).toBeInTheDocument();
  });

  it('sets document.title from the route metadata (SEO-AUDIT.md H2)', () => {
    renderAt('/en-us/program', completeSeed({ reportId: 'rep-456' }));
    expect(document.title).toBe('ROOTÉ — Your ROOTÉ program');
  });
});
