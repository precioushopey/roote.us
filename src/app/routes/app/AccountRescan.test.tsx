import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { AccountRescan } from './AccountRescan';

function seedSignedInProgram() {
  localStorage.setItem('roote.locale', 'en');
  localStorage.setItem('roote.authSession', JSON.stringify({ email: 'demo@roote.us', since: '2026-01-01T00:00:00Z' }));
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

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/en-us/account/hairhealth-rescan',
        element: (
          <LocaleProvider localeRegion="en-us">
            <AccountRescan />
          </LocaleProvider>
        ),
      },
      { path: '/en-us', element: <div>home</div> },
      { path: '/en-us/login', element: <div>login</div> },
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

afterEach(() => {
  localStorage.clear();
});

describe('AccountRescan', () => {
  it('redirects home when there is no program', () => {
    localStorage.setItem('roote.locale', 'en');
    renderAt('/en-us/account/hairhealth-rescan');
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('redirects to login when there is a program but no signed-in email', () => {
    localStorage.setItem('roote.locale', 'en');
    localStorage.setItem(
      'roote.session',
      JSON.stringify({
        diagnosis: { gender: 'female', hairGoal: 'stop-loss', photos: [], answers: {}, grayAnswers: {}, healthHistory: ['none'], photoConsent: true },
        analysis: null,
        grayProfile: null,
        reportId: 'rep-1',
        account: {},
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
    renderAt('/en-us/account/hairhealth-rescan');
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('renders the rescan page for a signed-in patient with an active program', () => {
    seedSignedInProgram();
    renderAt('/en-us/account/hairhealth-rescan');
    expect(screen.getByRole('heading', { level: 1, name: 'Rescan with HairHealth.ai' })).toBeInTheDocument();
    expect(screen.getByText(/powered by our partner, HairHealth\.ai/)).toBeInTheDocument();
    expect(screen.getByText("Rescans aren't connected yet — please check back soon.")).toBeInTheDocument();
  });
});
