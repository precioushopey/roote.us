// src/app/routes/start/PlanStep.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { PlanStep } from './PlanStep';

function seedSession() {
  localStorage.setItem('roote.locale', 'en');
  const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
  const analysis = deriveAnalysis({ gender: 'male', answers });
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers },
      analysis,
      reportId: 'rep-plan-1',
      account: { email: 'demo@roote.us' },
      draftDurationDays: null,
      program: null,
    }),
  );
  return analysis;
}

function renderAt() {
  const router = createMemoryRouter(
    [
      { path: '/start/plan', element: <PlanStep /> },
      { path: '/start/checkout', element: <div>checkout-step</div> },
    ],
    { initialEntries: ['/start/plan'] },
  );
  return render(
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>,
  );
}

describe('PlanStep', () => {
  it('pre-selects the AI-recommended duration and lets the user change it', async () => {
    const analysis = seedSession();
    renderAt();
    const recommended = screen.getByRole('radio', { name: new RegExp(`${analysis.recommendedDurationDays}`) });
    expect(recommended).toBeChecked();
    const other = screen.getAllByRole('radio').find((r) => r !== recommended)!;
    const user = userEvent.setup();
    await user.click(other);
    expect(other).toBeChecked();
    expect(recommended).not.toBeChecked();
  });

  it('advances to checkout with the selected duration stored as the draft', async () => {
    const analysis = seedSession();
    renderAt();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByText('checkout-step')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('roote.session')!);
    expect(stored.draftDurationDays).toBe(analysis.recommendedDurationDays);
  });
});
