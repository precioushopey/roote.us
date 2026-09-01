import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Wordmark } from './Wordmark';
import { LocaleToggle } from './LocaleToggle';
import { PendingChip } from './PendingChip';
import { ProgressRail } from './ProgressRail';

const wrap = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe('brand components', () => {
  it('Wordmark renders ROOTÉ text', () => {
    wrap(<Wordmark />);
    expect(screen.getByText('ROOTÉ')).toBeInTheDocument();
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
