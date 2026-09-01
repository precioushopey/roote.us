import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider, useSession } from '@/store/sessionStore';
import { GenderStep } from './GenderStep';

let api: ReturnType<typeof useSession>;
function Spy() { api = useSession(); return null; }

function renderGender() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/gender', element: <><GenderStep /><Spy /></> },
      { path: '/diagnosis/photos', element: <div>photos page</div> },
    ],
    { initialEntries: ['/diagnosis/gender'] },
  );
  return render(
    <LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>,
  );
}

describe('GenderStep', () => {
  it('stores the gender and advances to photos', async () => {
    renderGender();
    await userEvent.click(screen.getByRole('button', { name: /female|אישה/i }));
    expect(api.diagnosis.gender).toBe('female');
    expect(screen.getByText('photos page')).toBeInTheDocument();
  });
});
