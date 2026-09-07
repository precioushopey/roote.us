import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { CartProvider } from '@/store/cart';
import { analysisRoutes } from '@/app/routes/analysis/analysisRoutes';
import {
  setAnalyticsAdapter,
  noopAnalyticsAdapter,
  type AnalyticsAdapter,
} from './analytics';
import type { AnalyticsEventName } from './events';

afterEach(() => setAnalyticsAdapter(noopAnalyticsAdapter));

function withSpy() {
  const events: AnalyticsEventName[] = [];
  const spy: AnalyticsAdapter = { track: (e) => events.push(e.name) };
  setAnalyticsAdapter(spy);
  return events;
}

describe('analytics is wired into the real flows', () => {
  it('the assessment emits normalized events as the user advances', async () => {
    const events = withSpy();
    localStorage.clear();
    const router = createMemoryRouter(
      [
        {
          path: '/en-us',
          element: (
            <LocaleProvider localeRegion="en-us">
              <Outlet />
            </LocaleProvider>
          ),
          children: [analysisRoutes],
        },
      ],
      { initialEntries: ['/en-us/analysis'] },
    );
    render(
      <AuthProvider>
        <SessionProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </SessionProvider>
      </AuthProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /begin analysis/i }));
    await userEvent.click(await screen.findByText('Male'));
    await userEvent.click(await screen.findByText('Stop hair loss'));

    expect(events).toContain('analysis_started');
    expect(events).toContain('gender_selected');
    expect(events).toContain('hair_goal_selected');
  });
});
