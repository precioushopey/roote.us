import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ReportNotFound } from './ReportNotFound';

describe('ReportNotFound', () => {
  it('shows the not-found message and a restart link', () => {
    render(
      <MemoryRouter initialEntries={['/en-us/report/x']}>
        <LocaleProvider localeRegion="en-us">
          <ReportNotFound />
        </LocaleProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Report not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a new diagnosis' })).toHaveAttribute('href', '/en-us/analysis');
  });
});
