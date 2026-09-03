import { describe, it, expect, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { DiagnosisLayout } from './DiagnosisLayout';
import { IntroStep } from './IntroStep';
import { GenderStep } from './GenderStep';
import { PhotosStep } from './PhotosStep';
import { AnalyzingStep } from './AnalyzingStep';
import { ReadyStep } from './ReadyStep';

vi.mock('@/app/components/diagnosis/downscaleImage', () => ({
  computeDownscaledSize: (w: number, h: number) => ({ width: w, height: h }),
  downscaleImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/jpeg' }), dataUrl: 'data:image/jpeg;base64,AAAA', width: 10, height: 10,
  })),
}));
vi.mock('@/app/components/diagnosis/AnalyzingStrip', () => ({
  // Deterministic stub: fires onComplete from an effect (not during render) once the gate
  // opens — AnalyzingStep's real finish() calls navigate(), which must not run mid-render.
  AnalyzingStrip: ({ gateReady, onComplete }: { gateReady: boolean; onComplete: () => void }) => {
    useEffect(() => {
      if (gateReady) onComplete();
    }, [gateReady, onComplete]);
    return <div data-testid="strip" />;
  },
}));

function renderApp() {
  const router = createMemoryRouter(
    [
      {
        path: '/diagnosis',
        element: <DiagnosisLayout />,
        children: [
          { index: true, element: <IntroStep /> },
          { path: 'gender', element: <GenderStep /> },
          { path: 'photos', element: <PhotosStep /> },
          { path: 'analyzing', element: <AnalyzingStep /> },
          { path: 'ready', element: <ReadyStep /> },
        ],
      },
      { path: '/report/:reportId', element: <div>REPORT</div> },
    ],
    { initialEntries: ['/diagnosis'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

describe('diagnosis flow (end to end)', () => {
  it('goes intro → gender → photos → questionnaire → ready → report', async () => {
    // Force English so the question-option button matchers below (English-only regexes)
    // resolve regardless of the app's Hebrew-default locale.
    localStorage.setItem('roote.locale', 'en');
    renderApp();

    await userEvent.click(screen.getByRole('button', { name: /start|התחלה/i }));
    await userEvent.click(screen.getByRole('button', { name: /^male$|^גבר$/i }));

    // photos — all four angles are required
    const photoInputs = screen.getAllByLabelText(/front|top|crown|hairline|קדמי|עליון|קודקוד|קו שיער/i);
    for (const input of photoInputs) {
      await userEvent.upload(input, new File(['b'], 'p.jpg', { type: 'image/jpeg' }));
    }
    const continueBtn = screen.getByRole('button', { name: /continue|המשך/i });
    await waitFor(() => expect(continueBtn).toBeEnabled());
    await userEvent.click(continueBtn);

    // 5 questions
    for (const label of [/hairline/i, /1–5 years|1-5/i, /never/i, /^yes$/i, /both/i]) {
      await userEvent.click(screen.getByRole('button', { name: label }));
    }

    // ready → email → report
    await userEvent.type(screen.getByRole('textbox'), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /results|תוצאות/i }));
    expect(screen.getByText('REPORT')).toBeInTheDocument();
  });

  it('deep-linking to /diagnosis/analyzing with no data bounces back to gender', () => {
    const router = createMemoryRouter(
      [{
        path: '/diagnosis', element: <DiagnosisLayout />,
        children: [
          { index: true, element: <IntroStep /> },
          { path: 'gender', element: <div>GENDER</div> },
          { path: 'analyzing', element: <AnalyzingStep /> },
        ],
      }],
      { initialEntries: ['/diagnosis/analyzing'] },
    );
    render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
    expect(screen.getByText('GENDER')).toBeInTheDocument();
  });
});
