import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { HairScan } from './HairScan';

function renderHairScan() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <LocaleProvider localeRegion="en-us">
            <HairScan />
          </LocaleProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

describe('HairScan', () => {
  it('renders the title and a disclosure linking to Privacy', () => {
    renderHairScan();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Chat with HairHealth.ai');
    expect(screen.getByText(/powered by our partner, HairHealth\.ai/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See our Privacy Policy' })).toHaveAttribute('href', '/en-us/privacy');
  });

  it('renders the not-yet-configured placeholder when Landbot is unset', () => {
    renderHairScan();
    expect(screen.getByText('Connecting you to HairHealth.ai — please check back soon.')).toBeInTheDocument();
  });
});
