// src/app/routes/start/SuccessStep.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { SuccessStep } from './SuccessStep';

function renderAt() {
  localStorage.setItem('roote.locale', 'en');
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers: {} },
      analysis: null,
      reportId: 'rep-1',
      account: { email: 'demo@roote.us' },
      draftDurationDays: 180,
      program: {
        orderId: 'ord-777',
        reportId: 'rep-1',
        analysisSnapshot: {},
        durationDays: 180,
        startDate: '2026-09-02',
        endDate: '2027-03-01',
        plan: { core: [], supporting: [] },
        completionLog: {},
        progressPhotos: [],
        reminders: [],
      },
    }),
  );
  const router = createMemoryRouter(
    [
      { path: '/start/success', element: <SuccessStep /> },
      { path: '/app', element: <div>app-home</div> },
    ],
    { initialEntries: ['/start/success'] },
  );
  return render(
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>,
  );
}

describe('SuccessStep', () => {
  it('shows the order confirmation and links to /app', () => {
    renderAt();
    expect(screen.getByText(/ord-777/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /program/i })).toHaveAttribute('href', '/app');
  });
});
