import { describe, it, expect, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider, useSession } from '@/store/sessionStore';
import { AnalyzingStep } from './AnalyzingStep';

vi.mock('@/app/components/diagnosis/AnalyzingStrip', () => ({
  // Deterministic stub: fires onComplete from an effect (not during render) once the gate
  // opens — AnalyzingStep's real finish() calls navigate(), which must not run mid-render.
  AnalyzingStrip: ({ gateReady, onComplete }: { gateReady: boolean; onComplete: () => void }) => {
    useEffect(() => {
      if (gateReady) onComplete();
    }, [gateReady, onComplete]);
    return <div data-testid="strip">strip gate={String(gateReady)}</div>;
  },
}));

let api: ReturnType<typeof useSession>;
function Spy() {
  api = useSession();
  return null;
}

function seedGenderAndPhoto() {
  localStorage.setItem('roote.locale', 'en');
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: {
        gender: 'male',
        photos: [{ id: 'p', angleKey: 'front', thumb: 't', blobId: 'b' }],
        answers: {},
      },
      analysis: null,
      reportId: null,
      account: { email: null },
      program: null,
    }),
  );
}

function renderAnalyzing() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/analyzing', element: <><Spy /><AnalyzingStep /></> },
      { path: '/diagnosis/ready', element: <div>ready page</div> },
      { path: '/diagnosis/photos', element: <div>photos page</div> },
    ],
    { initialEntries: ['/diagnosis/analyzing'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

const ANSWER_LABELS = [/hairline/i, /1–5 years|1-5/i, /never/i, /^yes$/i, /both/i];

describe('AnalyzingStep', () => {
  it('walks the 5 questions, runs deriveAnalysis, sets a reportId, and advances', async () => {
    seedGenderAndPhoto();
    renderAnalyzing();
    for (const label of ANSWER_LABELS) {
      await userEvent.click(screen.getByRole('button', { name: label }));
    }
    expect(api.analysis).not.toBeNull();
    expect(api.analysis!.scale).toBe('norwood');
    expect(api.reportId).toMatch(/[0-9a-f-]{36}/);
    expect(screen.getByText('ready page')).toBeInTheDocument();
  });
});
