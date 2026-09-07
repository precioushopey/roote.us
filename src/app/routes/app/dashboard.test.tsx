import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { TrackingProvider } from '@/store/tracking';
import { AccountOverview } from './AccountOverview';
import { AccountToday } from './AccountToday';

function seed(daysAgo = 4) {
  localStorage.clear();
  const start = new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10);
  const end = new Date(Date.now() + (180 - daysAgo) * 86_400_000).toISOString().slice(0, 10);
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'female', hairGoal: 'thicker-fuller', photos: [], answers: {}, grayAnswers: {}, healthHistory: ['none'], photoConsent: true },
      analysis: null,
      grayProfile: null,
      reportId: 'rep-1',
      account: { email: 'demo@roote.us' },
      program: {
        orderId: 'ord-1',
        reportId: 'rep-1',
        durationDays: 180,
        startDate: start,
        endDate: end,
        plan: { core: [], supporting: [] },
        completionLog: {},
        progressPhotos: [],
        reminders: [],
        analysisSnapshot: {},
      },
    }),
  );
}

function renderScreen(el: React.ReactNode) {
  const router = createMemoryRouter(
    [{ path: '/en-us', element: <LocaleProvider localeRegion="en-us">{el}</LocaleProvider> }],
    { initialEntries: ['/en-us'] },
  );
  render(
    <AuthProvider>
      <SessionProvider>
        <TrackingProvider>
          <RouterProvider router={router} />
        </TrackingProvider>
      </SessionProvider>
    </AuthProvider>,
  );
}

describe('AccountOverview (MY ROOTÉ)', () => {
  it('answers: which day, status, next checkpoint, and the two primary actions', () => {
    seed(4);
    renderScreen(<AccountOverview />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Day 5 of 180');
    expect(screen.getByText('On track')).toBeInTheDocument();
    expect(screen.getByText(/Progress photos · Day 30/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue today's plan/i })).toHaveAttribute('href', '/en-us/account/today');
    expect(screen.getByRole('link', { name: /view my progress/i })).toHaveAttribute('href', '/en-us/account/progress');
  });
});

describe('AccountToday (routine)', () => {
  it('groups tasks into Morning / Evening / Shampoo and toggles completion', async () => {
    seed(10);
    renderScreen(<AccountToday />);
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    // universal routine (PO #5/#15): Density + scalp-care guidance in the evening,
    // Regrowth Shampoo on wash days. Gray products are concern-branched, not here.
    const evening = screen.getByRole('heading', { name: 'Evening' }).closest('section')!;
    const boxes = within(evening).getAllByRole('button', { name: /mark done/i });
    expect(boxes.length).toBeGreaterThan(0);
    await userEvent.click(boxes[0]);
    // pressed state flips
    expect(within(evening).getAllByRole('button', { name: /mark not done/i }).length).toBe(1);
  });
});
