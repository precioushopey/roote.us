import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { ReportPage } from './ReportPage';

function seedSession(reportId: string | null) {
  localStorage.setItem('roote.locale', 'en');
  const answers = { q1_area: 'hairline', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'no', q13_progression: 'gradual' };
  const analysis = reportId ? deriveAnalysis({ gender: 'male', hairGoal: 'stop-loss', answers } as never) : null;
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', hairGoal: 'stop-loss', photos: [], answers },
      analysis,
      reportId,
      account: { email: null },
      program: null,
    }),
  );
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/en-us/report/:reportId',
        element: (
          <LocaleProvider localeRegion="en-us">
            <ReportPage />
          </LocaleProvider>
        ),
      },
    ],
    { initialEntries: [path] },
  );
  return render(<SessionProvider><RouterProvider router={router} /></SessionProvider>);
}

describe('ReportPage', () => {
  it('shows ReportNotFound when the URL reportId does not match the session', () => {
    seedSession('rep-abc');
    renderAt('/en-us/report/rep-different');
    expect(screen.getByText('Report not found')).toBeInTheDocument();
  });

  it('shows ReportNotFound when there is no analysis yet', () => {
    seedSession(null);
    renderAt('/en-us/report/rep-abc');
    expect(screen.getByText('Report not found')).toBeInTheDocument();
  });

  it('renders the personalized plan when the reportId matches a completed session', () => {
    seedSession('rep-abc');
    renderAt('/en-us/report/rep-abc');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your personalized plan is ready.');
    expect(screen.getByText('MATCHED TO YOUR SCAN')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Start My Program' });
    expect(cta).toHaveAttribute('href', '/en-us/program?report=rep-abc');
  });

  it('renders unresolved figures as PENDING chips, not invented numbers', () => {
    seedSession('rep-abc');
    renderAt('/en-us/report/rep-abc');
    expect(screen.getAllByText(/\[PENDING:/).length).toBeGreaterThan(0);
  });

  it('sets document.title from the route metadata (SEO-AUDIT.md H2)', () => {
    seedSession('rep-abc');
    renderAt('/en-us/report/rep-abc');
    expect(document.title).toBe('ROOTÉ — Personalized Hair Growth System');
  });
});
