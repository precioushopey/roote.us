// src/app/routes/program/CheckoutStep.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { CheckoutStep } from './CheckoutStep';

function seedSession(overrides: Record<string, unknown> = {}) {
  const answers = { q1_area: 'crown', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'yes', q13_progression: 'gradual' } as const;
  const analysis = deriveAnalysis({ gender: 'male', hairGoal: 'stop-loss', answers });
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', hairGoal: 'stop-loss', photos: [], answers },
      analysis,
      reportId: 'rep-checkout-1',
      account: { email: 'demo@roote.us' },
      draftDurationDays: 180,
      program: null,
      ...overrides,
    }),
  );
}

function renderAt() {
  const router = createMemoryRouter(
    [
      { path: '/en-us/program/checkout', element: <LocaleProvider localeRegion="en-us"><CheckoutStep /></LocaleProvider> },
      { path: '/en-us/program/success', element: <LocaleProvider localeRegion="en-us"><div>success-step</div></LocaleProvider> },
    ],
    { initialEntries: ['/en-us/program/checkout'] },
  );
  return render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
}

afterEach(() => localStorage.removeItem('roote.debug.forceCheckoutFailure'));

describe('CheckoutStep', () => {
  it('renders the program summary with a pending total, never an invented number', () => {
    seedSession();
    renderAt();
    expect(screen.getByText(/your program/i)).toBeInTheDocument();
    expect(screen.getByText('[PENDING: program total]')).toBeInTheDocument();
    // no preselected recurring billing
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('submits valid contact + payment details and advances to success on stub success', async () => {
    seedSession();
    renderAt();
    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.clear(screen.getByLabelText(/^email/i));
    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone/i), '0500000000');
    await user.type(screen.getByLabelText(/city/i), 'Tel Aviv');
    await user.type(screen.getByLabelText(/postal/i), '1234567');
    await user.type(screen.getByLabelText(/name on card/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry/i), '12/29');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    await user.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => expect(screen.getByText('success-step')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('shows a retryable error and does not navigate on stub failure', async () => {
    localStorage.setItem('roote.debug.forceCheckoutFailure', '1');
    seedSession();
    renderAt();
    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.clear(screen.getByLabelText(/^email/i));
    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone/i), '0500000000');
    await user.type(screen.getByLabelText(/city/i), 'Tel Aviv');
    await user.type(screen.getByLabelText(/postal/i), '1234567');
    await user.type(screen.getByLabelText(/name on card/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry/i), '12/29');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    await user.click(screen.getByRole('button', { name: /place order/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('success-step')).not.toBeInTheDocument();
  });
});
