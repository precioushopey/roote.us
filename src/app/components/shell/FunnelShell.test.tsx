import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { FunnelShell } from './FunnelShell';

it('renders the wordmark, a language toggle, and the nested route', () => {
  const router = createMemoryRouter(
    [
      {
        element: (
          <LocaleProvider>
            <FunnelShell />
          </LocaleProvider>
        ),
        children: [{ path: '/', element: <p>child content</p> }],
      },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
  expect(screen.getByRole('img', { name: 'ROOTÉ' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /switch language/i })).toBeInTheDocument();
  expect(screen.getByText('child content')).toBeInTheDocument();
});
