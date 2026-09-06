// src/app/routes/program/AccountStep.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { AccountStep } from './AccountStep';

function renderAt() {
  const router = createMemoryRouter(
    [
      { path: '/en-us/program', element: <LocaleProvider localeRegion="en-us"><AccountStep /></LocaleProvider> },
      { path: '/en-us/program/plan', element: <LocaleProvider localeRegion="en-us"><div>plan-step</div></LocaleProvider> },
    ],
    { initialEntries: ['/en-us/program'] },
  );
  return render(
    <AuthProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </AuthProvider>,
  );
}

describe('AccountStep', () => {
  it('signs up with a valid email/password and advances to /program/plan', async () => {
    renderAt();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'demo@roote.us');
    await user.type(screen.getByLabelText(/password/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
    expect(await screen.findByText('plan-step')).toBeInTheDocument();
  });

  it('shows an inline error for a too-short password and does not navigate', async () => {
    renderAt();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'demo2@roote.us');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('plan-step')).not.toBeInTheDocument();
  });
});
