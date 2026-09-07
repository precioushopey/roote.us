import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Footer } from './Footer';

function renderFooter(locale: 'en' | 'he') {
  const localeRegion = locale === 'he' ? 'he-il' : 'en-us';
  render(
    <MemoryRouter>
      <LocaleProvider localeRegion={localeRegion}>
        <Footer />
      </LocaleProvider>
    </MemoryRouter>,
  );
  return screen.getByRole('contentinfo');
}

describe('Footer', () => {
  it('renders the explore + legal links and the year (en)', () => {
    const footer = renderFooter('en');
    expect(within(footer).getByRole('link', { name: 'Process' })).toHaveAttribute('href', '/en-us/how-it-works');
    expect(within(footer).getByRole('link', { name: 'Science' })).toHaveAttribute('href', '/en-us/science');
    expect(within(footer).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en-us/about');
    expect(within(footer).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/en-us/privacy');
    expect(within(footer).getByRole('link', { name: 'Medical Disclaimer' })).toHaveAttribute('href', '/en-us/medical-disclaimer');
    expect(within(footer).getAllByRole('link', { name: 'Start free hair analysis' })[0]).toHaveAttribute('href', '/en-us/analysis');
    expect(within(footer).getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });

  it('does not render the report medical disclaimer body copy', () => {
    const footer = renderFooter('en');
    expect(within(footer).queryByText(/preliminary, photo-based visual assessment/i)).not.toBeInTheDocument();
  });
});
