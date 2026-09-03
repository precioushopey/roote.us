import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CtaBand } from './CtaBand';

it('renders a heading and a CTA linking to /diagnosis', () => {
  localStorage.setItem('roote.locale', 'en');
  render(<LocaleProvider><MemoryRouter>
    <CtaBand headingKey="marketing.cta.default.title" bodyKey="marketing.cta.default.body" />
  </MemoryRouter></LocaleProvider>);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('one free analysis');
  expect(screen.getByRole('link', { name: 'Start Free Diagnosis' })).toHaveAttribute('href', '/diagnosis');
});
