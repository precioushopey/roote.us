import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App shell', () => {
  afterEach(() => {
    act(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  });

  it('mounts the marketing shell at /en-us with the real homepage', () => {
    window.history.pushState({}, '', '/en-us');
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your hair is individual');
    expect(
      screen.getAllByRole('link', { name: 'Start free hair analysis' }).length,
    ).toBeGreaterThan(0);
  });

  it('reaches /en-us/program and can sign up to advance to the plan step', async () => {
    const { deriveAnalysis } = await import('@/domain/analysis/deriveAnalysis');
    const answers = { q1_area: 'crown', q2_onset: '1-3y', q3_prior: 'never', q4_family: 'yes', q13_progression: 'gradual' } as const;
    const analysis = deriveAnalysis({ gender: 'male', hairGoal: 'stop-loss', answers });
    localStorage.setItem(
      'roote.session',
      JSON.stringify({
        diagnosis: { gender: 'male', hairGoal: 'stop-loss', photos: [], answers },
        analysis,
        reportId: 'rep-app-1',
        account: { email: null },
        draftDurationDays: null,
        program: null,
      }),
    );
    window.history.pushState({}, '', '/en-us/program');
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<App />);
    const user = userEvent.setup({ delay: null });
    await user.type(await screen.findByLabelText(/email/i), 'route-test@roote.us');
    await user.type(screen.getByLabelText(/password/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
    expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
  });
});
