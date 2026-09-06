import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { Header } from './Header';

function renderHeader() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <LocaleProvider localeRegion="en-us">
            <CartProvider>
              <Header />
            </CartProvider>
          </LocaleProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

describe('Header', () => {
  it('shows the primary nav links and the analysis CTA', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/en-us/how-it-works');
    expect(within(nav).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/en-us/solutions');
    expect(within(nav).getByRole('link', { name: 'Science' })).toHaveAttribute('href', '/en-us/science');
    expect(within(nav).getByRole('link', { name: 'Results' })).toHaveAttribute('href', '/en-us/results');
    expect(within(nav).getByRole('link', { name: 'Our System' })).toHaveAttribute('href', '/en-us/system');
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en-us/about');
    expect(screen.getByRole('link', { name: 'Start free hair analysis' })).toHaveAttribute('href', '/en-us/analysis');
  });

  it('links the wordmark home', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'ROOTÉ' })).toHaveAttribute('href', '/en-us/');
  });

  it('opens and closes the mobile menu drawer', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/en-us/how-it-works');
    expect(within(dialog).getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/en-us/faq');
    expect(within(dialog).getAllByRole('link', { name: 'Start free hair analysis' })[0]).toHaveAttribute('href', '/en-us/analysis');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the drawer with its close button', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
