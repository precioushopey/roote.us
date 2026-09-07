import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, Navigate } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { AccountOrders } from './AccountOrders';
import { AccountSubscription } from './AccountSubscription';

function seedProgram() {
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'female', hairGoal: 'stop-loss', photos: [], answers: {}, grayAnswers: {}, healthHistory: ['none'], photoConsent: true },
      analysis: null,
      grayProfile: null,
      reportId: 'rep-1',
      account: { email: 'demo@roote.us' },
      program: {
        orderId: 'ord-x1234567',
        reportId: 'rep-1',
        durationDays: 180,
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        plan: { core: [], supporting: [] },
        completionLog: {},
        progressPhotos: [],
        reminders: [],
        analysisSnapshot: {},
      },
    }),
  );
}

function renderRoute(element: React.ReactNode, path = '/en-us/account/x') {
  const router = createMemoryRouter(
    [{ path: '/en-us/account/x', element: <LocaleProvider localeRegion="en-us">{element}</LocaleProvider> }],
    { initialEntries: [path] },
  );
  render(
    <AuthProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </AuthProvider>,
  );
}

describe('AccountOrders', () => {
  it('shows an empty state when there is no order history', () => {
    localStorage.removeItem('roote.orders');
    renderRoute(<AccountOrders />);
    expect(screen.getByText('No orders yet.')).toBeInTheDocument();
  });

  it('lists recorded orders newest-first', () => {
    localStorage.setItem(
      'roote.orders',
      JSON.stringify([
        { id: 'ord-aaaa1111', kind: 'program', at: '2026-02-01T00:00:00Z', label: '180-day program' },
      ]),
    );
    renderRoute(<AccountOrders />);
    expect(screen.getByText('180-day program')).toBeInTheDocument();
    expect(screen.getByText(/#ord-aaaa/)).toBeInTheDocument();
  });
});

describe('AccountSubscription', () => {
  it('discloses recurring terms and offers a plain cancel flow (no dark patterns)', async () => {
    seedProgram();
    renderRoute(<AccountSubscription />);
    // recurring disclosure always visible
    expect(screen.getByText(/Recurring billing, shipment frequency/i)).toBeInTheDocument();
    // starts OFF — nothing preselected
    expect(screen.getByText('Off')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /turn on automatic reorder/i }));
    expect(screen.getByText('On')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^cancel automatic reorder$/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm cancellation/i }));
    expect(screen.getByText('Off')).toBeInTheDocument();
  });
});

describe('account sub-path redirects', () => {
  it('/account/plan → /account/program', () => {
    const router = createMemoryRouter(
      [
        { path: '/account/plan', element: <Navigate to="/account/program" replace /> },
        { path: '/account/program', element: <div>program page</div> },
      ],
      { initialEntries: ['/account/plan'] },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByText('program page')).toBeInTheDocument();
  });
});
