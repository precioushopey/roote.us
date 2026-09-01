// src/app/routes/start/StartLayout.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { StartLayout } from './StartLayout';

function renderAt(path: string, seed?: Record<string, unknown>) {
  if (seed) localStorage.setItem('roote.session', JSON.stringify(seed));
  const router = createMemoryRouter(
    [{ path: '/start', element: <StartLayout />, children: [{ index: true, element: <div>account-step</div> }] }],
    { initialEntries: [path] },
  );
  return render(
    <LocaleProvider>
      <AuthProvider>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </AuthProvider>
    </LocaleProvider>,
  );
}

describe('StartLayout', () => {
  it('shows a no-resolvable-report state with no reportId and no ?report= param', () => {
    renderAt('/start');
    // no-report state renders exactly one control: the dev-only seed button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('resolves the report from the ?report= query param and renders the nested route', () => {
    renderAt('/start?report=rep-123');
    expect(screen.getByText('account-step')).toBeInTheDocument();
  });

  it('resolves the report from the persisted session when there is no query param', () => {
    renderAt('/start', { reportId: 'rep-456', diagnosis: { gender: 'male', photos: [], answers: {} }, analysis: null, account: { email: null }, draftDurationDays: null, program: null });
    expect(screen.getByText('account-step')).toBeInTheDocument();
  });
});
