import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { TrackingProvider } from '@/store/tracking';
import { REMINDER_TYPES } from '@/domain/tracking/reminders';
import { AccountReminders } from './AccountReminders';

const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

function seed(daysAgo = 20) {
  localStorage.clear();
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', concern: 'thinning', photos: [], answers: {}, grayAnswers: {}, photoConsent: true },
      analysis: null, grayProfile: null, reportId: 'rep-1', account: { email: 'demo@roote.us' },
      program: {
        orderId: 'ord-1', reportId: 'rep-1', durationDays: 180,
        startDate: iso(-daysAgo), endDate: iso(180 - daysAgo),
        plan: { core: [], supporting: [] }, completionLog: {}, progressPhotos: [], reminders: [], analysisSnapshot: {},
      },
    }),
  );
}

function renderScreen() {
  const router = createMemoryRouter(
    [{ path: '/en-us', element: <LocaleProvider localeRegion="en-us"><AccountReminders /></LocaleProvider> }],
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

describe('AccountReminders (spec §15 — reminders data + surface, no delivery)', () => {
  it('lists what is coming up and every reminder category as a toggle', () => {
    seed();
    renderScreen();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Notifications & reminders');

    const settings = screen.getByText('What to remind me about').closest('section')!;
    expect(within(settings).getAllByRole('checkbox')).toHaveLength(REMINDER_TYPES.length);
    expect(within(settings).getByText('Daily treatment')).toBeInTheDocument();

    const comingUp = screen.getByText('Coming up').closest('section')!;
    expect(within(comingUp).getByText('Program completion')).toBeInTheDocument();

    // honest about delivery
    expect(screen.getByText(/reminders arrive in the app and by email/i)).toBeInTheDocument();
  });

  it('turning a category off drops it from the upcoming list', async () => {
    seed();
    renderScreen();
    const settings = screen.getByText('What to remind me about').closest('section')!;
    const comingUp = screen.getByText('Coming up').closest('section')!;

    // progress-photo is index 3 in REMINDER_TYPES and on by default
    expect(within(comingUp).getAllByText('Progress photos').length).toBeGreaterThan(0);
    const boxes = within(settings).getAllByRole('checkbox');
    expect(boxes[3]).toBeChecked();

    await userEvent.click(boxes[3]);

    expect(within(settings).getAllByRole('checkbox')[3]).not.toBeChecked();
    expect(within(comingUp).queryByText('Progress photos')).not.toBeInTheDocument();
  });
});
