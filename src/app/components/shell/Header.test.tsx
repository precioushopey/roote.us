import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Header } from './Header';

function renderHeader() {
  localStorage.setItem('roote.locale', 'en');
  const router = createMemoryRouter(
    [{ path: '/', element: <Header /> }],
    { initialEntries: ['/'] },
  );
  render(
    <LocaleProvider>
      <RouterProvider router={router} />
    </LocaleProvider>,
  );
}

describe('Header', () => {
  it('shows the primary nav links and the CTA', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/how-it-works');
    expect(within(nav).getByRole('link', { name: 'Science' })).toHaveAttribute('href', '/science');
    expect(within(nav).getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    expect(within(nav).getByRole('link', { name: 'Results' })).toHaveAttribute('href', '/results');
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Start free analysis' })).toHaveAttribute('href', '/diagnosis');
  });

  it('links the wordmark home', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'ROOTÉ' })).toHaveAttribute('href', '/');
  });

  it('reveals the More menu items and collapses them on Escape', async () => {
    const user = userEvent.setup();
    renderHeader();
    const moreBtn = screen.getByRole('button', { name: 'More' });
    expect(moreBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(moreBtn);
    expect(moreBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support');

    await user.keyboard('{Escape}');
    expect(moreBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Blog' })).not.toBeInTheDocument();
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    renderHeader();
    const openBtn = screen.getByRole('button', { name: /open menu/i });
    expect(openBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(openBtn);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/how-it-works');
    expect(within(dialog).getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq');
    expect(within(dialog).getByRole('link', { name: 'Start free analysis' })).toHaveAttribute('href', '/diagnosis');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the mobile menu with the close button', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByRole('button', { name: /close menu/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
