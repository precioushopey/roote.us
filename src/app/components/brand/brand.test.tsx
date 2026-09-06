import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useParams } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Wordmark } from './Wordmark';
import { LocaleToggle } from './LocaleToggle';
import { PendingChip } from './PendingChip';
import { ProgressRail } from './ProgressRail';

// Reads the `:localeRegion` route param and feeds it to LocaleProvider — mirrors the real
// LocaleGate so a `setLocale()` navigation (used by the LocaleToggle test below) is reflected
// back into the provider, same pattern as src/i18n/LocaleProvider.test.tsx's `ProviderFromRoute`.
function ProviderFromRoute({ children }: { children: React.ReactNode }) {
  const { localeRegion } = useParams();
  return <LocaleProvider localeRegion={localeRegion}>{children}</LocaleProvider>;
}

const wrap = (ui: React.ReactNode) => {
  const router = createMemoryRouter(
    [{ path: '/:localeRegion/*', element: <ProviderFromRoute>{ui}</ProviderFromRoute> }],
    { initialEntries: ['/he-il/'] },
  );
  return render(<RouterProvider router={router} />);
};

describe('brand components', () => {
  it('Wordmark renders the ROOTÉ logo image', () => {
    wrap(<Wordmark />);
    expect(screen.getByRole('img', { name: 'ROOTÉ' })).toBeInTheDocument();
  });

  it('Wordmark default renders the ROOTÉ img element', () => {
    wrap(<Wordmark />);
    const mark = screen.getByRole('img', { name: 'ROOTÉ' });
    expect(mark.tagName).toBe('IMG');
  });

  it('Wordmark onInk renders a gold-masked mark instead of the default image', () => {
    wrap(<Wordmark onInk />);
    const mark = screen.getByRole('img', { name: 'ROOTÉ' });
    expect(mark.tagName).toBe('SPAN');
    expect(mark.className).toContain('bg-gold-500');
    expect(mark.getAttribute('style')).toContain('mask-image');
  });

  it('LocaleToggle flips he -> en', async () => {
    wrap(<><LocaleToggle /><Wordmark /></>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('English'); // default locale is he, so it offers en
    await userEvent.click(btn);
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(btn).toHaveTextContent('עברית');
  });

  it('PendingChip shows the [PENDING: ...] label', () => {
    wrap(<PendingChip label="pricing — 180 days" />);
    expect(screen.getByText('[PENDING: pricing — 180 days]')).toBeInTheDocument();
  });

  it('ProgressRail marks the current step', () => {
    wrap(<ProgressRail steps={['a', 'b', 'c']} current={1} />);
    const current = screen.getByText('b');
    expect(current).toHaveAttribute('aria-current', 'step');
  });
});
