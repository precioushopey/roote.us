import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CtaBand } from './CtaBand';

it('renders a heading and a CTA linking to /analysis', () => {
  render(<MemoryRouter><LocaleProvider localeRegion="en-us">
    <CtaBand headingKey="marketing.cta.default.title" bodyKey="marketing.cta.default.body" />
  </LocaleProvider></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('one free analysis');
  expect(screen.getByRole('link', { name: 'Start free hair analysis' })).toHaveAttribute('href', '/en-us/analysis');
});
