import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';

vi.mock('@/app/components/diagnosis/downscaleImage', () => ({
  computeDownscaledSize: (w: number, h: number) => ({ width: w, height: h }),
  downscaleImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/jpeg' }), dataUrl: 'data:image/jpeg;base64,AAAA', width: 10, height: 10,
  })),
}));

import { PhotosStep } from './PhotosStep';

function renderPhotos() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/photos', element: <PhotosStep /> },
      { path: '/diagnosis/gender', element: <div>gender page</div> },
      { path: '/diagnosis/analyzing', element: <div>analyzing page</div> },
    ],
    { initialEntries: ['/diagnosis/photos'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

function seedGender(gender: 'male' | 'female') {
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender, photos: [], answers: {} },
      analysis: null,
      reportId: null,
      account: { email: null },
      program: null,
    }),
  );
}

describe('PhotosStep', () => {
  it('redirects to gender when no gender is set', () => {
    renderPhotos();
    expect(screen.getByText('gender page')).toBeInTheDocument();
  });

  it('requires all four angles before Continue enables, then advances to analyzing', async () => {
    seedGender('male');
    renderPhotos();
    const cta = screen.getByRole('button', { name: /continue|המשך/i });
    expect(cta).toBeDisabled();
    const inputs = screen.getAllByLabelText(/front|top|crown|hairline|קדמי|עליון|קודקוד|קו שיער/i);
    expect(inputs).toHaveLength(4);
    // still disabled after 3 of 4
    for (const input of inputs.slice(0, 3)) {
      await userEvent.upload(input, new File(['b'], 'p.jpg', { type: 'image/jpeg' }));
    }
    expect(cta).toBeDisabled();
    await userEvent.upload(inputs[3], new File(['b'], 'p.jpg', { type: 'image/jpeg' }));
    await waitFor(() => expect(cta).toBeEnabled());
    await userEvent.click(cta);
    expect(screen.getByText('analyzing page')).toBeInTheDocument();
  });
});
