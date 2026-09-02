import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Footer } from './Footer';

function renderFooter(locale: 'en' | 'he') {
  localStorage.setItem('roote.locale', locale);
  render(<LocaleProvider><MemoryRouter><Footer /></MemoryRouter></LocaleProvider>);
  return screen.getByRole('contentinfo');
}

describe('Footer', () => {
  it('renders the four link columns and the year (en)', () => {
    const footer = renderFooter('en');
    expect(within(footer).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/how-it-works');
    expect(within(footer).getByRole('link', { name: 'Science' })).toHaveAttribute('href', '/science');
    expect(within(footer).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(within(footer).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(within(footer).getByRole('link', { name: 'Start free analysis' })).toHaveAttribute('href', '/diagnosis');
    expect(within(footer).getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });

  it('shows the real medical disclaimer text at en', () => {
    const footer = renderFooter('en');
    expect(within(footer).getByText(/preliminary, photo-based visual assessment/i)).toBeInTheDocument();
    expect(within(footer).queryByText(/\[PENDING:/)).not.toBeInTheDocument();
  });

  it('falls back to a pending chip for the medical disclaimer at he (he value is empty)', () => {
    const footer = renderFooter('he');
    expect(within(footer).getByText(/\[PENDING:/)).toBeInTheDocument();
  });
});
