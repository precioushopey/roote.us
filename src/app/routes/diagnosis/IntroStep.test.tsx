import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { IntroStep } from './IntroStep';

function renderIntro() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis', element: <IntroStep /> },
      { path: '/diagnosis/gender', element: <div>gender page</div> },
    ],
    { initialEntries: ['/diagnosis'] },
  );
  return render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
}

describe('IntroStep', () => {
  it('advances to the gender step on CTA click', async () => {
    renderIntro();
    await userEvent.click(screen.getByRole('button', { name: /start|התחלה|המשך/i }));
    expect(screen.getByText('gender page')).toBeInTheDocument();
  });
});
