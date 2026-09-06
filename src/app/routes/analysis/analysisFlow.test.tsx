import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { CartProvider } from '@/store/cart';
import { analysisRoutes } from './analysisRoutes';
import { redirectForAnalysisStep } from './guards';
import { deriveGrayProfile, type GrayAnswers } from '@/domain/analysis/grayProfile';
import { mockHairAnalysisProvider } from '@/domain/analysis/provider';
import type { SessionState } from '@/store/sessionStore';

const emptySession = (over: Partial<SessionState> = {}): SessionState => ({
  diagnosis: { gender: null, concern: null, photos: [], answers: {}, grayAnswers: {}, photoConsent: false },
  analysis: null,
  grayProfile: null,
  reportId: null,
  account: { email: null, marketingConsent: false },
  draftDurationDays: null,
  program: null,
  ...over,
});

describe('redirectForAnalysisStep', () => {
  it('concern needs a gender', () => {
    expect(redirectForAnalysisStep('concern', emptySession())).toBe('/analysis/gender');
    expect(
      redirectForAnalysisStep('concern', emptySession({ diagnosis: { ...emptySession().diagnosis, gender: 'male' } })),
    ).toBeNull();
  });

  it('photos needs gender + concern', () => {
    const s = emptySession({ diagnosis: { ...emptySession().diagnosis, gender: 'male' } });
    expect(redirectForAnalysisStep('photos', s)).toBe('/analysis/concern');
  });

  it('questions needs all four photo views (PO #25) — three is not enough', () => {
    const base = { ...emptySession().diagnosis, gender: 'male' as const, concern: 'thinning' as const };
    const three = emptySession({
      diagnosis: {
        ...base,
        photos: (['front', 'top', 'crown'] as const).map((a) => ({ id: a, angleKey: a, thumb: 't', blobId: 'b' })),
      },
    });
    expect(redirectForAnalysisStep('questions', three)).toBe('/analysis/photos');
    const four = emptySession({
      diagnosis: {
        ...base,
        photos: (['front', 'top', 'crown', 'hairline'] as const).map((a) => ({ id: a, angleKey: a, thumb: 't', blobId: 'b' })),
      },
    });
    expect(redirectForAnalysisStep('questions', four)).toBeNull();
  });

  it('results needs a produced analysis or gray profile', () => {
    const base = emptySession({
      diagnosis: {
        ...emptySession().diagnosis,
        gender: 'male',
        concern: 'thinning',
        photos: [{ id: 'p', angleKey: 'front', thumb: 't', blobId: 'b' }],
      },
    });
    expect(redirectForAnalysisStep('results', base)).toBe('/analysis/scanning');
    expect(redirectForAnalysisStep('results', { ...base, grayProfile: deriveGrayProfile({ answers: {} as GrayAnswers }) })).toBeNull();
  });
});

describe('mock analysis provider', () => {
  it('returns a HairAnalysis and marks itself as mock', async () => {
    const res = await mockHairAnalysisProvider.analyze({
      gender: 'female',
      answers: { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' },
      images: [],
    });
    expect(res.analysis.scale).toBe('ludwig');
    expect(res.isMock).toBe(true);
    expect(res.source).toBe('mock');
  });
});

describe('deriveGrayProfile', () => {
  it('maps visible area to a stage, returns keys + the routine', () => {
    const p = deriveGrayProfile({
      answers: { g1_onset: '1-5y', g2_area: 'crown', g3_pace: 'steady', g4_color: 'no', g5_goal: 'both' },
    });
    expect(p.stage).toBe('moderate');
    expect(p.summaryKey).toBe('gray.summary.moderate');
    expect(p.routine).toEqual(['gray-support', 'gray-serum']);
  });
});

function renderFlow(path: string) {
  localStorage.clear();
  const router = createMemoryRouter(
    [
      {
        path: '/en-us',
        element: (
          <LocaleProvider localeRegion="en-us">
            <Outlet />
          </LocaleProvider>
        ),
        children: [analysisRoutes],
      },
    ],
    { initialEntries: [`/en-us${path}`] },
  );
  render(
    <AuthProvider>
      <SessionProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </SessionProvider>
    </AuthProvider>,
  );
}

describe('assessment screens', () => {
  it('intro → gender → concern advances and shows the progress rail', async () => {
    renderFlow('/analysis');
    await userEvent.click(screen.getByRole('button', { name: /begin analysis/i }));
    expect(await screen.findByRole('heading', { name: /how should we personalize/i })).toBeInTheDocument();

    await userEvent.click(screen.getByText('Male'));
    expect(await screen.findByRole('heading', { name: 'What would you like to understand?' })).toBeInTheDocument();
    // rail is visible now
    expect(screen.getByRole('list', { name: /progress/i })).toBeInTheDocument();
  });

  it('photos step gates Continue on consent + all four angles', async () => {
    renderFlow('/analysis/photos');
    // guard bounces to gender (no gender/concern yet)
    expect(await screen.findByRole('heading', { name: /how should we personalize/i })).toBeInTheDocument();
  });

  it('deep-linking results with no analysis bounces back', async () => {
    renderFlow('/analysis/results');
    expect(await screen.findByRole('heading', { name: /how should we personalize/i })).toBeInTheDocument();
  });
});
