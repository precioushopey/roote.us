import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App shell', () => {
  afterEach(() => {
    // Restore history for the module-scoped browser router so tests in this file are order-independent.
    // Wrapped in act() because the still-mounted RouterProvider updates in response to the popstate.
    act(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  });

  it('renders the landing route with localized CTA and a working language toggle', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /ROOTÉ/ })).toBeInTheDocument();
    // default he
    expect(screen.getByRole('link', { name: /אבחון שיער חינם/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Switch language/i }));
    expect(screen.getByRole('link', { name: /Start Free Diagnosis/i })).toBeInTheDocument();
  });

  it('reaches /start and can sign up to advance to the plan step', async () => {
    localStorage.setItem('roote.locale', 'en');
    const { deriveAnalysis } = await import('@/domain/analysis/deriveAnalysis');
    const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
    const analysis = deriveAnalysis({ gender: 'male', answers });
    localStorage.setItem(
      'roote.session',
      JSON.stringify({
        diagnosis: { gender: 'male', photos: [], answers },
        analysis,
        reportId: 'rep-app-1',
        account: { email: null },
        draftDurationDays: null,
        program: null,
      }),
    );
    window.history.pushState({}, '', '/start');
    // App's router is a module-scoped createBrowserRouter whose history listener was attached at
    // import; pushState alone does not notify it, so fire the popstate it listens for.
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<App />);
    const user = userEvent.setup({ delay: null });
    await user.type(await screen.findByLabelText(/email/i), 'route-test@roote.us');
    await user.type(screen.getByLabelText(/password/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
    expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
  });
});
