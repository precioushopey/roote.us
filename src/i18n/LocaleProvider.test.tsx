import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, useLocation, useParams } from 'react-router';
import { LocaleProvider, useLocale, useT, useLocalizedPath } from './LocaleProvider';

function Probe() {
  const { locale, dir, localeRegion, setLocale, setCountry } = useLocale();
  const t = useT();
  const withLocale = useLocalizedPath();
  const location = useLocation();
  return (
    <div>
      <span data-testid="loc">{locale}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="region">{localeRegion}</span>
      <span data-testid="cta">{t('marketing.nav.cta')}</span>
      <span data-testid="path">{location.pathname}</span>
      <span data-testid="linked">{withLocale('/products')}</span>
      <button onClick={() => setLocale('he')}>to-he</button>
      <button onClick={() => setCountry('US')}>to-us</button>
    </div>
  );
}

function ProviderFromRoute() {
  const { region } = useParams();
  return (
    <LocaleProvider localeRegion={region}>
      <Probe />
    </LocaleProvider>
  );
}

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '/:region/*', element: <ProviderFromRoute /> }], {
    initialEntries: [path],
  });
  return render(<RouterProvider router={router} />);
}

describe('LocaleProvider', () => {
  it('defaults to Hebrew / RTL / he-il when no localeRegion prop is given', () => {
    const router = createMemoryRouter([{ path: '/', element: <LocaleProvider><Probe /></LocaleProvider> }], {
      initialEntries: ['/'],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('loc')).toHaveTextContent('he');
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
    expect(screen.getByTestId('region')).toHaveTextContent('he-il');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('cta')).toHaveTextContent('להתחלת אבחון שיער חינם');
  });

  it('derives locale/dir from an explicit localeRegion route param', () => {
    renderAt('/en-us/products');
    expect(screen.getByTestId('loc')).toHaveTextContent('en');
    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(screen.getByTestId('cta')).toHaveTextContent('Start free hair analysis');
  });

  it('useLocalizedPath prefixes a bare path with the current localeRegion', () => {
    renderAt('/en-us/products');
    expect(screen.getByTestId('linked')).toHaveTextContent('/en-us/products');
  });

  it('setLocale navigates to the same route under the new locale, preserving country', async () => {
    renderAt('/en-il/products');
    expect(screen.getByTestId('path')).toHaveTextContent('/en-il/products');
    await userEvent.click(screen.getByText('to-he'));
    expect(screen.getByTestId('path')).toHaveTextContent('/he-il/products');
    expect(screen.getByTestId('region')).toHaveTextContent('he-il');
  });

  it('setCountry navigates to the same route under the new country, preserving locale', async () => {
    renderAt('/en-il/products');
    await userEvent.click(screen.getByText('to-us'));
    expect(screen.getByTestId('path')).toHaveTextContent('/en-us/products');
  });
});
