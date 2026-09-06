// src/app/routes/program/PlanStep.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { PlanStep } from './PlanStep';

function seedSession() {
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
      { path: '/en-us/program/plan', element: <LocaleProvider localeRegion="en-us"><PlanStep /></LocaleProvider> },
      { path: '/en-us/program/checkout', element: <LocaleProvider localeRegion="en-us"><div>checkout-step</div></LocaleProvider> },
    ],
    { initialEntries: ['/en-us/program/plan'] },
  );
  return render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
}

describe('PlanStep', () => {
  it('pre-selects the AI-recommended duration and lets the user change it', async () => {
    const analysis = seedSession();
    renderAt();
    const group = screen.getByRole('radiogroup');
    const recommendedCard = screen
      .getByText(new RegExp(`^${analysis.recommendedDurationDays}\\b`))
      .closest('div[class*="rounded-xl"]')!;
    const recommendedBtn = recommendedCard.querySelector('button[aria-pressed]')!;
    expect(recommendedBtn).toHaveAttribute('aria-pressed', 'true');

    const otherBtn = Array.from(group.querySelectorAll('button[aria-pressed]')).find(
      (b) => b !== recommendedBtn,
    ) as HTMLElement;
    const user = userEvent.setup();
    await user.click(otherBtn);
    expect(otherBtn).toHaveAttribute('aria-pressed', 'true');
    expect(recommendedBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('advances to checkout with the selected duration stored as the draft', async () => {
    const analysis = seedSession();
    renderAt();
    const user = userEvent.setup();
    // the sticky footer Continue button (there are per-card ones too)
    const buttons = screen.getAllByRole('button', { name: /continue to payment/i });
    await user.click(buttons[buttons.length - 1]);
    expect(await screen.findByText('checkout-step')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('roote.session')!);
    expect(stored.draftDurationDays).toBe(analysis.recommendedDurationDays);
  });
});
