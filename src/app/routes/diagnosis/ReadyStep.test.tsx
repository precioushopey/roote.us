import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider, useSession } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { ReadyStep } from './ReadyStep';

let api: ReturnType<typeof useSession>;
function Spy() {
  api = useSession();
  return null;
}

function seedReadyState() {
  const analysis = deriveAnalysis({
    gender: 'male',
    answers: { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' },
  });
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers: {} },
      analysis,
      reportId: 'rep-123',
      account: { email: null },
      program: null,
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
});

function renderReady() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/ready', element: <><Spy /><ReadyStep /></> },
      { path: '/report/:reportId', element: <div>report page</div> },
      { path: '/diagnosis/analyzing', element: <div>analyzing page</div> },
    ],
    { initialEntries: ['/diagnosis/ready'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

describe('ReadyStep', () => {
  it('rejects an invalid email', async () => {
    seedReadyState();
    renderReady();
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await userEvent.type(input, 'not-an-email');
    // Trigger form submission by calling onSubmit directly
    const form = input.closest('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    await waitFor(() => {
      expect(screen.getByText(/תקינה|valid/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('report page')).not.toBeInTheDocument();
  });

  it('accepts a valid email, stores it, and routes to the report', async () => {
    seedReadyState();
    renderReady();
    await userEvent.type(screen.getByRole('textbox'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: /send|שליחת/i }));
    expect(api.account.email).toBe('a@b.com');
    expect(screen.getByText('report page')).toBeInTheDocument();
  });
});
