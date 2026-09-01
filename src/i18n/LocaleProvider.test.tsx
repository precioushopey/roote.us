import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider, useLocale, useT } from './LocaleProvider';

function Probe() {
  const { locale, dir, setLocale } = useLocale();
  const t = useT();
  return (
    <div>
      <span data-testid="loc">{locale}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="cta">{t('landing.cta')}</span>
      <button onClick={() => setLocale('en')}>to-en</button>
    </div>
  );
}

describe('LocaleProvider', () => {
  it('defaults to Hebrew / RTL and sets the document dir', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    expect(screen.getByTestId('loc')).toHaveTextContent('he');
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('cta')).toHaveTextContent('אבחון שיער חינם');
  });

  it('switches to English, persists, and updates the document dir', async () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    await userEvent.click(screen.getByText('to-en'));
    expect(screen.getByTestId('loc')).toHaveTextContent('en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(screen.getByTestId('cta')).toHaveTextContent('Start Free Diagnosis');
    expect(localStorage.getItem('roote.locale')).toBe('en');
  });
});
