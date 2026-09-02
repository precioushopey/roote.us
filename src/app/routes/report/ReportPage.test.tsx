import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { ReportPage } from './ReportPage';

vi.mock('@react-pdf/renderer', () => ({ pdf: vi.fn() }));
vi.mock('@/pdf/ReportDocument', () => ({ ReportDocument: () => null }));

function seedSession(reportId: string | null) {
  localStorage.setItem('roote.locale', 'en');
  const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' };
  const analysis = reportId ? deriveAnalysis({ gender: 'male', answers } as never) : null;
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers },
      analysis,
      reportId,
      account: { email: null },
      program: null,
    }),
  );
}

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '/report/:reportId', element: <ReportPage /> }], { initialEntries: [path] });
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

describe('ReportPage', () => {
  it('shows ReportNotFound when the URL reportId does not match the session', () => {
    seedSession('rep-abc');
    renderAt('/report/rep-different');
    expect(screen.getByText('Report not found')).toBeInTheDocument();
  });

  it('shows ReportNotFound when there is no analysis yet', () => {
    seedSession(null);
    renderAt('/report/rep-abc');
    expect(screen.getByText('Report not found')).toBeInTheDocument();
  });

  it('renders the full report when the reportId matches a completed session', () => {
    seedSession('rep-abc');
    renderAt('/report/rep-abc');
    expect(screen.getByText('Personalized Hair Report')).toBeInTheDocument();
    expect(screen.getByText('MATCHED TO YOUR SCAN')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start My Program' })).toBeInTheDocument();
  });

  it('shows a Download PDF button that is enabled once the report is built', () => {
    seedSession('rep-abc');
    renderAt('/report/rep-abc');
    const btn = screen.getByRole('button', { name: 'Download PDF' });
    expect(btn).toBeEnabled();
  });
});
