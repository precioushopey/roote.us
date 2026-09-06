import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { TrackingProvider } from '@/store/tracking';
import { AppShell } from './AppShell';

function seedSignedInProgram() {
  localStorage.setItem('roote.locale', 'en');
  localStorage.setItem('roote.authSession', JSON.stringify({ email: 'demo@roote.us', since: '2026-01-01T00:00:00Z' }));
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'female', concern: 'thinning', photos: [], answers: {}, grayAnswers: {}, photoConsent: true },
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
        path: '/en-us/account',
        element: (
          <LocaleProvider localeRegion="en-us">
            <AppShell />
          </LocaleProvider>
        ),
        children: [{ index: true, element: <div>overview</div> }],
      },
    ],
    { initialEntries: [path] },
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

describe('AppShell', () => {
  it('sets document.title from the route metadata (SEO-AUDIT.md H2)', () => {
    seedSignedInProgram();
    renderAt('/en-us/account');
    expect(screen.getByText('overview')).toBeInTheDocument();
    expect(document.title).toBe('ROOTÉ — My ROOTÉ');
  });

  it('prefixes every sidebar nav link with the current locale-region', () => {
    seedSignedInProgram();
    const { container } = renderAt('/en-us/account');
    const navLinks = container.querySelectorAll('aside nav a[href]');
    expect(navLinks.length).toBeGreaterThan(0);
    navLinks.forEach((a) => {
      expect(a.getAttribute('href')).toMatch(/^\/en-us\/account/);
    });
  });
});
