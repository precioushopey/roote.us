# International URL & hreflang Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every page a real, distinct URL per language + region (`/en-us/`, `/he-il/`, etc.) so hreflang becomes possible and first-visit locale detection uses a real signal instead of always defaulting to Hebrew.

**Architecture:** One new dynamic route, `/:localeRegion`, wraps the entire existing route tree unchanged in shape. A `<LocaleGate>` element validates the segment and renders `<LocaleProvider localeRegion={...}>` (which now derives locale/country/currency from that string instead of `localStorage`) or redirects. A `useLocalizedPath()` hook prefixes every internal link; `PATHS`, `ROUTE_META`, and route guards stay bare/unchanged.

**Tech Stack:** React Router v7 (`createBrowserRouter`/`createMemoryRouter`), Vitest + Testing Library, existing `src/i18n/locales.ts` locale/country registry.

**Spec:** `docs/superpowers/specs/2026-09-05-international-url-hreflang-design.md`

## Global Constraints

- `PATHS` (`src/app/paths.ts`), `ROUTE_META` (`src/seo/meta.ts`), and every route guard stay bare/unchanged — locale-region wrapping happens only at render/navigation call sites (spec §6).
- `LocaleProvider`'s public API (`locale`, `dir`, `country`, `currency`, `setLocale`, `setCountry`, `t`) keeps its existing shape; only its internals change. `LocaleToggle.tsx` and `CountryLanguageSelector.tsx` must need zero changes (spec §5).
- Locale-region validity: `locale` ∈ `ENABLED_LOCALES`, `country` ∈ `Object.keys(COUNTRY_DEFAULTS)`, validated independently (spec §3).
- No SSR/prerendering, no host-level redirects, no new locales/countries — out of scope (spec §1, §9).
- This plan touches only files the spec calls for. The repo has a large, separate, already-uncommitted redesign in progress (~84 files) — do not touch anything outside this plan's tasks, and do not assume that WIP is yours to clean up.
- `pnpm test` (355 tests today) and `pnpm typecheck` must stay green after every task, modulo the one pre-existing unrelated typecheck error at `src/domain/report/buildReport.test.ts:140` (not introduced by this plan, not fixed by this plan).
- TDD: every task writes a failing test before implementation code, per this repo's established workflow.
- Commit after every task (small, working, tested increments — matches how the SEO Phase 1 work landed earlier this session).

---

### Task 1: `src/i18n/localeRegion.ts` — parsing, validation, redirect resolution

**Files:**
- Create: `src/i18n/localeRegion.ts`
- Test: `src/i18n/localeRegion.test.ts`

**Interfaces:**
- Consumes: `ENABLED_LOCALES`, `COUNTRY_DEFAULTS`, `DEFAULT_LOCALE`, `DEFAULT_COUNTRY`, `isLocaleCode`, `LocaleCode` from `./locales`; `LEGACY_PREFIX_REDIRECTS`, `LEGACY_EXACT_REDIRECTS` from `@/app/paths`.
- Produces (used by Tasks 2, 3, 6-8): `parseLocaleRegion(segment): { locale: LocaleCode; country: string } | null`, `isValidLocaleRegion(segment): boolean`, `formatLocaleRegion(locale, country): string`, `resolveLocaleRedirect(pathname, storedRegion, acceptLanguage): string | null`, `PREFERRED_REGION_KEY: string`, `readStoredRegion(): string | null`, `writeStoredRegion(region): void`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/i18n/localeRegion.test.ts
import { describe, it, expect } from 'vitest';
import { parseLocaleRegion, isValidLocaleRegion, formatLocaleRegion, resolveLocaleRedirect } from './localeRegion';

describe('parseLocaleRegion', () => {
  it('parses a valid shipped locale + known country', () => {
    expect(parseLocaleRegion('en-us')).toEqual({ locale: 'en', country: 'US' });
    expect(parseLocaleRegion('he-il')).toEqual({ locale: 'he', country: 'IL' });
  });

  it('accepts any enabled-locale + known-country combination, not just curated defaults', () => {
    expect(parseLocaleRegion('en-il')).toEqual({ locale: 'en', country: 'IL' });
  });

  it('rejects a locale outside ENABLED_LOCALES (ar is shipped:false today)', () => {
    expect(parseLocaleRegion('ar-ae')).toBeNull();
  });

  it('rejects an unknown country', () => {
    expect(parseLocaleRegion('en-zz')).toBeNull();
  });

  it('rejects a segment with the wrong shape', () => {
    expect(parseLocaleRegion('en')).toBeNull();
    expect(parseLocaleRegion('products')).toBeNull();
    expect(parseLocaleRegion('en-us-extra')).toBeNull();
  });
});

describe('isValidLocaleRegion', () => {
  it('mirrors parseLocaleRegion as a boolean', () => {
    expect(isValidLocaleRegion('en-us')).toBe(true);
    expect(isValidLocaleRegion('products')).toBe(false);
  });
});

describe('formatLocaleRegion', () => {
  it('lowercases the country', () => {
    expect(formatLocaleRegion('en', 'US')).toBe('en-us');
  });
});

describe('resolveLocaleRedirect', () => {
  it('returns null when the path already has a valid locale-region prefix', () => {
    expect(resolveLocaleRedirect('/en-us/products', null, 'en-US')).toBeNull();
  });

  it('redirects a bare root to the stored preference when one exists', () => {
    expect(resolveLocaleRedirect('/', 'en-us', 'he')).toBe('/en-us');
  });

  it('redirects a bare root using Accept-Language when no preference is stored', () => {
    expect(resolveLocaleRedirect('/', null, 'he-IL,he;q=0.9')).toBe('/he-il');
  });

  it('falls back to he-il when Accept-Language matches no enabled locale', () => {
    expect(resolveLocaleRedirect('/', null, 'ja-JP,ja;q=0.9')).toBe('/he-il');
  });

  it('prepends the resolved region onto a deeper bare path without altering it', () => {
    expect(resolveLocaleRedirect('/products/density-6', null, 'en-US')).toBe('/en-us/products/density-6');
  });

  it('folds a legacy prefix redirect into the same hop', () => {
    expect(resolveLocaleRedirect('/diagnosis/gender', null, 'en-US')).toBe('/en-us/analysis/gender');
  });

  it('ignores a stored preference that is no longer valid', () => {
    expect(resolveLocaleRedirect('/', 'xx-yy', 'en-US')).toBe('/en-us');
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run src/i18n/localeRegion.test.ts`
Expected: FAIL — `Cannot find module './localeRegion'`

- [ ] **Step 3: Implement `src/i18n/localeRegion.ts`**

```ts
import {
  ENABLED_LOCALES,
  COUNTRY_DEFAULTS,
  DEFAULT_LOCALE,
  DEFAULT_COUNTRY,
  isLocaleCode,
  type LocaleCode,
} from './locales';
import { LEGACY_PREFIX_REDIRECTS, LEGACY_EXACT_REDIRECTS } from '@/app/paths';

export type ParsedLocaleRegion = { locale: LocaleCode; country: string };

export function parseLocaleRegion(segment: string): ParsedLocaleRegion | null {
  const parts = segment.split('-');
  if (parts.length !== 2) return null;
  const locale = parts[0].toLowerCase();
  const country = parts[1].toUpperCase();
  if (!isLocaleCode(locale) || !ENABLED_LOCALES.includes(locale)) return null;
  if (!(country in COUNTRY_DEFAULTS)) return null;
  return { locale, country };
}

export function isValidLocaleRegion(segment: string): boolean {
  return parseLocaleRegion(segment) !== null;
}

export function formatLocaleRegion(locale: LocaleCode, country: string): string {
  return `${locale}-${country.toLowerCase()}`;
}

function defaultCountryForLocale(locale: LocaleCode): string {
  if (COUNTRY_DEFAULTS[DEFAULT_COUNTRY]?.locale === locale) return DEFAULT_COUNTRY;
  const match = Object.values(COUNTRY_DEFAULTS).find((c) => c.locale === locale);
  return match ? match.country : DEFAULT_COUNTRY;
}

function detectLocaleFromAcceptLanguage(acceptLanguage: string): LocaleCode {
  const candidates = acceptLanguage
    .split(',')
    .map((tag) => tag.split(';')[0].trim().split('-')[0].toLowerCase());
  for (const candidate of candidates) {
    if (isLocaleCode(candidate) && ENABLED_LOCALES.includes(candidate)) return candidate;
  }
  return DEFAULT_LOCALE;
}

function applyLegacyRedirects(restPath: string): string {
  for (const [from, to] of LEGACY_EXACT_REDIRECTS) {
    if (restPath === from) return to;
  }
  for (const [from, to] of LEGACY_PREFIX_REDIRECTS) {
    if (restPath === from) return to;
    if (restPath.startsWith(`${from}/`)) return to + restPath.slice(from.length);
  }
  return restPath;
}

export const PREFERRED_REGION_KEY = 'roote.localeRegion';

export function readStoredRegion(): string | null {
  try {
    return localStorage.getItem(PREFERRED_REGION_KEY);
  } catch {
    return null;
  }
}

export function writeStoredRegion(region: string): void {
  try {
    localStorage.setItem(PREFERRED_REGION_KEY, region);
  } catch {
    /* ignore */
  }
}

export function resolveLocaleRedirect(
  pathname: string,
  storedRegion: string | null,
  acceptLanguage: string,
): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const [first] = segments;
  if (first && isValidLocaleRegion(first)) return null;

  let region: string;
  if (storedRegion && isValidLocaleRegion(storedRegion)) {
    region = storedRegion;
  } else {
    const detectedLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
    region = formatLocaleRegion(detectedLocale, defaultCountryForLocale(detectedLocale));
  }

  const restPath = applyLegacyRedirects(segments.length ? `/${segments.join('/')}` : '/');
  return restPath === '/' ? `/${region}` : `/${region}${restPath}`;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run src/i18n/localeRegion.test.ts`
Expected: PASS (13 tests)

- [ ] **Step 5: Commit**

```bash
git add src/i18n/localeRegion.ts src/i18n/localeRegion.test.ts
git commit -m "feat: add locale-region parsing, validation, and redirect resolution"
```

---

### Task 2: `LocaleProvider` reads from a `localeRegion` prop, `setLocale`/`setCountry` navigate

**Files:**
- Modify: `src/i18n/LocaleProvider.tsx` (full rewrite of the provider body; keep `useT`/`useContentLocale` shape)
- Modify: `src/i18n/LocaleProvider.test.tsx` (full rewrite)

**Interfaces:**
- Consumes: `parseLocaleRegion`, `formatLocaleRegion` from `./localeRegion` (Task 1); `DEFAULT_LOCALE`, `DEFAULT_COUNTRY`, `contentLocaleOf`, `dirOf`, `countryDefault` from `./locales`.
- Produces (used by Tasks 3-8): `LocaleProvider({ localeRegion?: string; children })` (optional prop, defaults to `he-il` — this is what lets every test that doesn't care about routing keep working unchanged); `useLocale()` returning `{ locale, contentLocale, dir, country, currency, localeRegion, setLocale, setCountry }`; `useT()`; `useContentLocale()`; new `useLocalizedPath(): (path: string) => string`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/i18n/LocaleProvider.test.tsx
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run src/i18n/LocaleProvider.test.tsx`
Expected: FAIL — `useLocalizedPath` is not exported; `localeRegion`/`region` prop not accepted; `setLocale` doesn't navigate.

- [ ] **Step 3: Rewrite `src/i18n/LocaleProvider.tsx`**

```tsx
import { createContext, useCallback, useContext, useMemo, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { messages, type MessageKey } from './messages';
import {
  type LocaleCode,
  type ContentLocale,
  type CurrencyCode,
  DEFAULT_LOCALE,
  DEFAULT_COUNTRY,
  dirOf,
  contentLocaleOf,
  countryDefault,
} from './locales';
import { parseLocaleRegion, formatLocaleRegion, writeStoredRegion } from './localeRegion';
import { interpolate } from './interpolate';

type Ctx = {
  locale: LocaleCode;
  /** the locale that actually has content (en/he) — for `buildReport` etc. */
  contentLocale: ContentLocale;
  dir: 'rtl' | 'ltr';
  country: string;
  currency: CurrencyCode;
  localeRegion: string;
  setLocale: (l: LocaleCode) => void;
  setCountry: (c: string) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

const DEFAULT_REGION = formatLocaleRegion(DEFAULT_LOCALE, DEFAULT_COUNTRY);

export function LocaleProvider({
  localeRegion = DEFAULT_REGION,
  children,
}: {
  /** Already-validated by `<LocaleGate>` in the real app; optional so tests that
   *  don't care about routing can render `<LocaleProvider>` bare, same as today. */
  localeRegion?: string;
  children: ReactNode;
}) {
  const parsed = parseLocaleRegion(localeRegion);
  if (!parsed) {
    throw new Error(`LocaleProvider received an invalid localeRegion: "${localeRegion}"`);
  }
  const { locale, country } = parsed;
  const dir = dirOf(locale);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    writeStoredRegion(localeRegion);
  }, [locale, dir, localeRegion]);

  const navigateToRegion = useCallback(
    (nextRegion: string) => {
      const rest = location.pathname.split('/').slice(2).join('/');
      navigate(`/${nextRegion}${rest ? `/${rest}` : ''}${location.search}`);
    },
    [location.pathname, location.search, navigate],
  );

  const setLocale = useCallback(
    (l: LocaleCode) => navigateToRegion(formatLocaleRegion(l, country)),
    [country, navigateToRegion],
  );

  const setCountry = useCallback(
    (c: string) => navigateToRegion(formatLocaleRegion(locale, c)),
    [locale, navigateToRegion],
  );

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const table = messages[locale] as Record<string, string>;
      const raw = table[key] ?? (messages.en as Record<string, string>)[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<Ctx>(
    () => ({
      locale,
      contentLocale: contentLocaleOf(locale),
      dir,
      country,
      currency: countryDefault(country).currency,
      localeRegion,
      setLocale,
      setCountry,
      t,
    }),
    [locale, dir, country, localeRegion, setLocale, setCountry, t],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useCtx(): Ctx {
  const c = useContext(LocaleContext);
  if (!c) throw new Error('useLocale/useT must be used within <LocaleProvider>');
  return c;
}

export function useLocale() {
  const { locale, contentLocale, dir, country, currency, localeRegion, setLocale, setCountry } = useCtx();
  return { locale, contentLocale, dir, country, currency, localeRegion, setLocale, setCountry };
}

/** The en/he locale to feed content builders (`buildReport` etc). */
export function useContentLocale(): ContentLocale {
  return useCtx().contentLocale;
}

export function useT() {
  return useCtx().t;
}

/** Prefixes a bare `PATHS.x` value with the current locale-region, e.g. `/products` -> `/en-us/products`. */
export function useLocalizedPath() {
  const { localeRegion } = useCtx();
  return useCallback((path: string) => `/${localeRegion}${path}`, [localeRegion]);
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run src/i18n/LocaleProvider.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/i18n/LocaleProvider.tsx src/i18n/LocaleProvider.test.tsx
git commit -m "feat: LocaleProvider reads locale/country from a localeRegion prop, adds useLocalizedPath"
```

---

### Task 3: `<LocaleGate>` and `<BareOrLegacyPathRedirect>`

**Files:**
- Create: `src/app/LocaleGate.tsx`
- Test: `src/app/LocaleGate.test.tsx`

**Interfaces:**
- Consumes: `resolveLocaleRedirect`, `readStoredRegion`, `PREFERRED_REGION_KEY` from `@/i18n/localeRegion` (Task 1); `LocaleProvider` from `@/i18n/LocaleProvider` (Task 2).
- Produces (used by Task 4): `<LocaleGate>` (element for the `/:localeRegion` route — validates, renders `<LocaleProvider><Outlet/></LocaleProvider>` or redirects), `<BareOrLegacyPathRedirect>` (element for the top-level `*` catch-all).

- [ ] **Step 1: Write the failing tests**

```tsx
// src/app/LocaleGate.test.tsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useParams } from 'react-router';
import { LocaleGate, BareOrLegacyPathRedirect } from './LocaleGate';
import { PREFERRED_REGION_KEY } from '@/i18n/localeRegion';

function RegionProbe() {
  const { localeRegion } = useParams();
  return <p>region:{localeRegion}</p>;
}

function renderApp(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/:localeRegion',
        element: <LocaleGate />,
        children: [
          { index: true, element: <RegionProbe /> },
          { path: 'products', element: <p>products page</p> },
        ],
      },
      { path: '*', element: <BareOrLegacyPathRedirect /> },
    ],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('LocaleGate', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('renders children when the segment is a valid locale-region', () => {
    renderApp('/en-us');
    expect(screen.getByText('region:en-us')).toBeInTheDocument();
  });

  it('preserves the rest of the path when redirecting an invalid segment (bare legacy path)', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    renderApp('/products');
    expect(screen.getByText('products page')).toBeInTheDocument();
  });
});

describe('BareOrLegacyPathRedirect', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('redirects the bare root to an Accept-Language-detected region', () => {
    vi.stubGlobal('navigator', { language: 'he-IL' });
    renderApp('/');
    expect(screen.getByText('region:he-il')).toBeInTheDocument();
  });

  it('respects a stored region preference over Accept-Language', () => {
    localStorage.setItem(PREFERRED_REGION_KEY, 'en-us');
    vi.stubGlobal('navigator', { language: 'he-IL' });
    renderApp('/');
    expect(screen.getByText('region:en-us')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run src/app/LocaleGate.test.tsx`
Expected: FAIL — `Cannot find module './LocaleGate'`

- [ ] **Step 3: Implement `src/app/LocaleGate.tsx`**

```tsx
import { Navigate, Outlet, useLocation, useParams } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { resolveLocaleRedirect, readStoredRegion } from '@/i18n/localeRegion';

function acceptLanguage(): string {
  return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'he';
}

/** Element for the `/:localeRegion` route: validates the segment, redirects if
 *  invalid (a bare/legacy path structurally consumed the first real path
 *  segment as if it were the region), otherwise provides locale context. */
export function LocaleGate() {
  const { localeRegion } = useParams();
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredRegion(), acceptLanguage());
  if (redirect) return <Navigate to={redirect} replace />;
  return (
    <LocaleProvider localeRegion={localeRegion}>
      <Outlet />
    </LocaleProvider>
  );
}

/** Element for the top-level `*` catch-all: handles the true bare root and any
 *  path whose first segment isn't a real child under `/:localeRegion`. */
export function BareOrLegacyPathRedirect() {
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredRegion(), acceptLanguage());
  return <Navigate to={redirect ?? '/'} replace />;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run src/app/LocaleGate.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/LocaleGate.tsx src/app/LocaleGate.test.tsx
git commit -m "feat: add LocaleGate and BareOrLegacyPathRedirect route elements"
```

---

### Task 4: Restructure `App.tsx`'s router under `/:localeRegion`

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/routes/analysis/analysisRoutes.tsx:11` (`path: '/analysis'` → `path: 'analysis'` — it's now nested one level deeper, so its own path must become relative)
- Modify: `src/app/App.test.tsx` (both existing tests push a region-prefixed path)

**Interfaces:**
- Consumes: `LocaleGate`, `BareOrLegacyPathRedirect` from `./LocaleGate` (Task 3).
- Produces: the real app router now requires every URL to start with a valid `locale-region` segment; `App.tsx` no longer renders `<LocaleProvider>` directly (it's rendered per-route by `LocaleGate`).

`marketingRoutes` (`src/app/routes/marketing/marketingRoutes.tsx`) needs **no change** — it's already a pathless layout route (`{ element: <MarketingShell/>, children: [...] }`), so nesting it one level deeper under `/:localeRegion` just works: its `index: true` child now matches `/:localeRegion` exactly, and its relative children (`'products'`, `'how-it-works'`, etc.) resolve correctly underneath.

- [ ] **Step 1: Update `App.test.tsx` to expect region-prefixed URLs (the failing test)**

```tsx
// src/app/App.test.tsx — replace both `localStorage.setItem('roote.locale', 'en')` +
// bare-path navigations with an explicit region prefix in the pushed/rendered URL.
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App shell', () => {
  afterEach(() => {
    act(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  });

  it('mounts the marketing shell at /en-us with the real homepage', () => {
    window.history.pushState({}, '', '/en-us');
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your hair is individual');
    expect(
      screen.getAllByRole('link', { name: 'Start free hair analysis' }).length,
    ).toBeGreaterThan(0);
  });

  it('reaches /en-us/program and can sign up to advance to the plan step', async () => {
    const { deriveAnalysis } = await import('@/domain/analysis/deriveAnalysis');
    const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
    const analysis = deriveAnalysis({ gender: 'male', answers });
    localStorage.setItem(
      'roote.session',
      JSON.stringify({
        diagnosis: { gender: 'male', photos: [], answers },
        analysis,
        reportId: 'rep-app-1',
        account: { email: null },
        draftDurationDays: null,
        program: null,
      }),
    );
    window.history.pushState({}, '', '/en-us/program');
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<App />);
    const user = userEvent.setup({ delay: null });
    await user.type(await screen.findByLabelText(/email/i), 'route-test@roote.us');
    await user.type(screen.getByLabelText(/password/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
    expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run src/app/App.test.tsx`
Expected: FAIL — at `/en-us`/`/en-us/program` the current router has no `/:localeRegion` route, so nothing matches (falls through to the existing `*` → `<Navigate to="/">`, landing back at the bare homepage instead of the expected content).

- [ ] **Step 3: Change `analysisRoutes.tsx`'s path to relative**

In `src/app/routes/analysis/analysisRoutes.tsx:11`, change:
```ts
  path: '/analysis',
```
to:
```ts
  path: 'analysis',
```

- [ ] **Step 4: Restructure `src/app/App.tsx`**

```tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { useLocalizedPath } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { CartProvider } from '@/store/cart';
import { TrackingProvider } from '@/store/tracking';
import { ToastProvider } from '@/app/components/roote';
import { LocaleGate, BareOrLegacyPathRedirect } from './LocaleGate';
import { ReportPage } from './routes/report/ReportPage';
import { LoginPage } from './routes/auth/LoginPage';
import { FunnelShell } from './components/shell/FunnelShell';
import { marketingRoutes } from './routes/marketing/marketingRoutes';
import { analysisRoutes } from './routes/analysis/analysisRoutes';
import { StartLayout } from './routes/start/StartLayout';
import { AccountStep } from './routes/start/AccountStep';
import { PlanStep } from './routes/start/PlanStep';
import { CheckoutStep } from './routes/start/CheckoutStep';
import { SuccessStep } from './routes/start/SuccessStep';
import { AppShell } from './routes/app/AppShell';
import { AccountOverview } from './routes/app/AccountOverview';
import { AccountToday } from './routes/app/AccountToday';
import { AccountBaseline } from './routes/app/AccountBaseline';
import { AccountPhotos } from './routes/app/AccountPhotos';
import { AccountScans } from './routes/app/AccountScans';
import { AccountProgress } from './routes/app/AccountProgress';
import { AccountBeforeAfter } from './routes/app/AccountBeforeAfter';
import { AccountResults } from './routes/app/AccountResults';
import { AccountRenew } from './routes/app/AccountRenew';
import { AccountReminders } from './routes/app/AccountReminders';
import { AppPlan } from './routes/app/AppPlan';
import { AppCare } from './routes/app/AppCare';
import { AppProfile } from './routes/app/AppProfile';
import { AccountOrders } from './routes/app/AccountOrders';
import { AccountSubscription } from './routes/app/AccountSubscription';

/** `<Navigate>` for route-config entries that can't call hooks directly
 *  (module-scope route objects) — wraps the target with the current
 *  locale-region at render time. */
function LocalizedNavigate({ to, replace }: { to: string; replace?: boolean }) {
  const withLocale = useLocalizedPath();
  return <Navigate to={withLocale(to)} replace={replace} />;
}

const router = createBrowserRouter([
  {
    path: '/:localeRegion',
    element: <LocaleGate />,
    children: [
      marketingRoutes,
      analysisRoutes,
      {
        element: <FunnelShell />,
        children: [
          { path: 'login', element: <LoginPage /> },
          {
            path: 'program',
            element: <StartLayout />,
            children: [
              { index: true, element: <AccountStep /> },
              { path: 'plan', element: <PlanStep /> },
              { path: 'checkout', element: <CheckoutStep /> },
              { path: 'success', element: <SuccessStep /> },
            ],
          },
        ],
      },
      {
        path: 'account',
        element: <AppShell />,
        children: [
          { index: true, element: <AccountOverview /> },
          { path: 'today', element: <AccountToday /> },
          { path: 'program', element: <AppPlan /> },
          { path: 'baseline', element: <AccountBaseline /> },
          { path: 'progress', element: <AccountProgress /> },
          { path: 'progress/before-after', element: <AccountBeforeAfter /> },
          { path: 'results', element: <AccountResults /> },
          { path: 'renew', element: <AccountRenew /> },
          { path: 'reminders', element: <AccountReminders /> },
          { path: 'photos', element: <AccountPhotos /> },
          { path: 'scans', element: <AccountScans /> },
          { path: 'orders', element: <AccountOrders /> },
          { path: 'subscription', element: <AccountSubscription /> },
          { path: 'care', element: <AppCare /> },
          { path: 'profile', element: <AppProfile /> },
          // WP2-era sub-segment names
          { path: 'plan', element: <LocalizedNavigate to="/account/program" replace /> },
          { path: 'rescan', element: <LocalizedNavigate to="/account/scans" replace /> },
        ],
      },
      { path: 'report/:reportId', element: <ReportPage /> },
    ],
  },
  { path: '*', element: <BareOrLegacyPathRedirect /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <CartProvider>
          <TrackingProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </TrackingProvider>
        </CartProvider>
      </SessionProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npx vitest run src/app/App.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 6: Run the full suite and typecheck**

Run: `pnpm test` and `pnpm typecheck`
Expected: Failures now appear across many other test files that render bare paths without a locale-region prefix through `App`'s real router, or that call `<LocaleProvider>` expecting the old zero-prop/`localStorage`-driven API. **Do not fix these here** — every file that breaks is exactly the work of Tasks 6-8. Note which files newly fail so Tasks 6-8's file lists can be sanity-checked against them.

- [ ] **Step 7: Commit**

```bash
git add src/app/App.tsx src/app/App.test.tsx src/app/routes/analysis/analysisRoutes.tsx
git commit -m "feat: nest the app's route tree under /:localeRegion"
```

---

### Task 5: `useDocumentMeta` — strip the locale-region prefix, emit hreflang alternates

**Files:**
- Modify: `src/seo/useDocumentMeta.ts`
- Test: `src/seo/useDocumentMeta.test.tsx` (new)
- Modify: `src/app/components/report/ReportView.tsx:282` (its CTA link, found by manual audit — see Step 6)
- Modify: `src/app/routes/app/AppShell.test.tsx`, `src/app/routes/start/StartLayout.test.tsx`, `src/app/routes/report/ReportPage.test.tsx` (region-prefix their routes/`<LocaleProvider>` — see Step 5)

**Interfaces:**
- Consumes: `useLocale()` (now returns `localeRegion`, Task 2), `SHIPPED_LOCALES`, `COUNTRY_DEFAULTS` from `@/i18n/locales`, `formatLocaleRegion` from `@/i18n/localeRegion`.
- Produces: `useDocumentMeta()` unchanged signature; now emits `<link rel="alternate" hreflang="...">` tags and canonicalizes against the full (region-prefixed) pathname.

- [ ] **Step 1: Write the failing test**

```tsx
// src/seo/useDocumentMeta.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useDocumentMeta } from './useDocumentMeta';

function Probe() {
  useDocumentMeta();
  return null;
}

function renderAt(path: string, localeRegion: string) {
  const router = createMemoryRouter(
    [{ path: '/:region/*', element: <LocaleProvider localeRegion={localeRegion}><Probe /></LocaleProvider> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('useDocumentMeta', () => {
  it('resolves route metadata from the bare path, stripping the locale-region prefix', () => {
    renderAt('/en-us/products', 'en-us');
    expect(document.title).toBe('ROOTÉ — Products');
  });

  it('canonicalizes against the full (region-prefixed) pathname', () => {
    renderAt('/en-us/products', 'en-us');
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical).toHaveAttribute('href', 'https://roote.us/en-us/products');
  });

  it('emits one hreflang alternate per shipped-locale x country combination, plus x-default', () => {
    renderAt('/en-us/products', 'en-us');
    const alternates = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
    // 2 shipped locales (en, he) x 8 countries + x-default (spec §7)
    expect(alternates.length).toBe(17);
    const heIl = Array.from(alternates).find((el) => el.getAttribute('hreflang') === 'he-il');
    expect(heIl).toHaveAttribute('href', 'https://roote.us/he-il/products');
    const xDefault = Array.from(alternates).find((el) => el.getAttribute('hreflang') === 'x-default');
    expect(xDefault).toHaveAttribute('href', 'https://roote.us/products');
  });

  it('replaces hreflang alternates on route change rather than accumulating them', () => {
    const { rerender } = renderAt('/en-us/products', 'en-us');
    renderAt('/en-us/about', 'en-us');
    const alternates = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
    expect(alternates.length).toBe(17);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/seo/useDocumentMeta.test.tsx`
Expected: FAIL — title includes the raw `/en-us/products` path (unstripped, so `metaForPath` can't resolve it and falls back to the homepage entry), no hreflang tags exist yet.

- [ ] **Step 3: Implement the change in `src/seo/useDocumentMeta.ts`**

```ts
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLocale } from '@/i18n/LocaleProvider';
import { SHIPPED_LOCALES, COUNTRY_DEFAULTS } from '@/i18n/locales';
import { formatLocaleRegion } from '@/i18n/localeRegion';
import { metaForPath, fullTitle } from './meta';
import { pickLocalized } from '@/content/localized';
import logo from '@/assets/logo.png';

const SITE_ORIGIN = 'https://roote.us';
const SHARE_IMAGE = `${SITE_ORIGIN}${logo}`;

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertHreflangAlternates(bareLogicalPath: string) {
  document.head.querySelectorAll('link[data-roote-hreflang]').forEach((el) => el.remove());
  const suffix = bareLogicalPath === '/' ? '' : bareLogicalPath;
  for (const locale of SHIPPED_LOCALES) {
    for (const country of Object.keys(COUNTRY_DEFAULTS)) {
      const region = formatLocaleRegion(locale, country);
      appendAlternate(region, `${SITE_ORIGIN}/${region}${suffix}`);
    }
  }
  appendAlternate('x-default', `${SITE_ORIGIN}${suffix}`);
}

function appendAlternate(hreflang: string, href: string) {
  const el = document.createElement('link');
  el.setAttribute('rel', 'alternate');
  el.setAttribute('hreflang', hreflang);
  el.setAttribute('href', href);
  el.setAttribute('data-roote-hreflang', '');
  document.head.appendChild(el);
}

/**
 * Sets document title + description + canonical + OpenGraph + hreflang on
 * route change from the `ROUTE_META` table. `metaForPath` operates on the
 * bare logical path (locale-region prefix stripped) — it never sees the
 * region segment. `index.html` keeps `noindex,nofollow` for the concept
 * build, so this is inert for crawlers but ready for launch.
 */
export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { contentLocale, localeRegion } = useLocale();

  useEffect(() => {
    const bareLogicalPath = pathname.slice(`/${localeRegion}`.length) || '/';
    const meta = metaForPath(bareLogicalPath);
    const title = fullTitle(pickLocalized(meta.title, contentLocale));
    const description = pickLocalized(meta.description, contentLocale);
    const canonical = `${SITE_ORIGIN}${pathname}`;

    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'ROOTÉ');
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', SHARE_IMAGE);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', SHARE_IMAGE);
    upsertCanonical(canonical);
    upsertHreflangAlternates(bareLogicalPath);
  }, [pathname, contentLocale, localeRegion]);
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run src/seo/useDocumentMeta.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Run the full suite, then fix the three broken shell tests**

Run: `npx vitest run src/seo/meta.test.ts src/app/routes/app/AppShell.test.tsx src/app/routes/start/StartLayout.test.tsx src/app/routes/report/ReportPage.test.tsx`
Expected: the three shell tests from the earlier SEO H2 fix now break — they render `<LocaleProvider>` bare (no `localeRegion` prop, defaulting to `he-il`) inside a router whose own route `path` is still bare (`/account`, `/program`, `/report/:reportId`, not `/he-il`-prefixed), so `useDocumentMeta`'s `pathname.slice('/he-il'.length)` strips the wrong number of characters from a pathname that never had the prefix.

Apply this exact change to each of the three files — prefix the router's own `path` and matching `initialEntries` with `/he-il`, and make the `<LocaleProvider>` wrap explicit (it already defaults to `he-il`, but being explicit documents why the assertions below still expect Hebrew-default English-toggled... i.e. unchanged — content):

`AppShell.test.tsx` — change:
```tsx
function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: '/account', element: <AppShell />, children: [{ index: true, element: <div>overview</div> }] }],
    { initialEntries: [path] },
  );
  return render(
    <LocaleProvider>
```
to:
```tsx
function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: '/he-il/account', element: <AppShell />, children: [{ index: true, element: <div>overview</div> }] }],
    { initialEntries: [path] },
  );
  return render(
    <LocaleProvider localeRegion="he-il">
```
and its one call site `renderAt('/account')` → `renderAt('/he-il/account')`. Its `document.title` assertion (`'ROOTÉ — My ROOTÉ'`) is unchanged — `ROUTE_META` lookups are unaffected by the region prefix.

`StartLayout.test.tsx` — same pattern: router `path: '/program'` → `'/he-il/program'`, `<LocaleProvider>` → `<LocaleProvider localeRegion="he-il">`, and every one of the six `renderAt('/program...', ...)` call sites gets `/he-il` prepended (`renderAt('/he-il/program', ...)`, `renderAt('/he-il/program?report=rep-123', ...)`, etc.) — the query string stays after the prefix, not before it. All existing assertion text is unchanged.

`ReportPage.test.tsx` — router `path: '/report/:reportId'` → `'/he-il/report/:reportId'`, `<LocaleProvider>` → `<LocaleProvider localeRegion="he-il">`, and every `renderAt('/report/...')` call site gets `/he-il` prepended. Its `document.title` assertion is unchanged, but its CTA-href assertion needs updating too — see Step 6.

- [ ] **Step 6: Fix `ReportView.tsx`'s CTA link (found via manual audit, not the Task 6-8 greps)**

`src/app/components/report/ReportView.tsx:282` renders `<Button to={model.cta.href} ...>`, where `model.cta.href` is built by the **pure domain function** `buildReport()` (`src/domain/report/buildReport.ts:322`, `href: \`/program?report=${reportId}\``) — per `CLAUDE.md`'s domain-layer-stays-pure rule, `buildReport` cannot call `useLocalizedPath()` itself, so the wrapping happens where `ReportView` renders it, exactly like every other `to={...}` call site in this plan. This call site was missed by Task 6-8's grep patterns because neither `PATHS.` nor a literal `to="/`/`` to={` `` string appears on that line — it's `to={model.cta.href}`, a property access. Fix it now since Task 5 is already touching this exact file's test:

```tsx
// ReportView.tsx — add the hook alongside its other hooks, then:
<Button to={withLocale(model.cta.href)} size="lg" caps className="mt-6">
```

Then update `ReportPage.test.tsx`'s CTA assertion (now under the `/he-il` region from Step 5):
```tsx
expect(cta).toHaveAttribute('href', '/he-il/program?report=rep-abc');
```
`ReportView.test.tsx`'s own CTA assertion (`expect(model.cta.href).toContain('/program?report=')`) needs **no change** — it asserts on `model.cta.href` directly (the raw domain-layer value, before `withLocale` is applied in the render), not on a rendered element's `href` attribute.

- [ ] **Step 7: Re-run and confirm green**

Run: `npx vitest run src/seo/meta.test.ts src/app/routes/app/AppShell.test.tsx src/app/routes/start/StartLayout.test.tsx src/app/routes/report/ReportPage.test.tsx src/app/components/report/ReportView.test.tsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/seo/useDocumentMeta.ts src/seo/useDocumentMeta.test.tsx src/app/routes/app/AppShell.test.tsx src/app/routes/start/StartLayout.test.tsx src/app/routes/report/ReportPage.test.tsx src/app/components/report/ReportView.tsx
git commit -m "feat: strip locale-region prefix in useDocumentMeta, emit hreflang alternates"
```

---

### Task 6: Migrate marketing + shell component links to `withLocale()`

**Files (exact — from `grep -rn "PATHS\." src/app` and `grep -rn 'to=["'"'"'\`]/' src/app`, run 2026-09-05):**
- Modify: `src/app/components/shell/Header.tsx`, `src/app/components/shell/Footer.tsx`, `src/app/components/shell/AnalysisPrompt.tsx`, `src/app/components/marketing/CtaBand.tsx`, `src/app/components/checkout/CheckoutFields.tsx`, `src/app/components/shell/MobileMenu.tsx`
- Modify: `src/app/routes/marketing/Home.tsx`, `Faq.tsx`, `Products.tsx`, `ProductDetail.tsx`, `SolutionPage.tsx`, `SystemPage.tsx`, `Science.tsx`, `Results.tsx`, `HowItWorks.tsx`, `About.tsx`, `Terms.tsx`, `Privacy.tsx`
- Modify: `src/app/routes/bag/BagPage.tsx`, `BagCheckout.tsx`, `BagSuccess.tsx`
- Modify test files in the same directories that call `localStorage.setItem('roote.locale', 'en')` (found via `grep -rln "roote.locale" src/app/routes/marketing src/app/components/shell src/app/components/marketing`) — at minimum `Header.test.tsx`, `Footer.test.tsx`, `MarketingShell.test.tsx`, `CtaBand.test.tsx`, `Home.test.tsx`, `marketingRoutes.test.tsx`, `wp4pages.test.tsx`

**Interfaces:**
- Consumes: `useLocalizedPath` from `@/i18n/LocaleProvider` (Task 2).

**The transformation rule:** in any component, add `const withLocale = useLocalizedPath();` alongside its other hooks, then wrap every `to=`/`navigate(...)` argument that resolves to an internal path — whether it comes from `PATHS.x`, a template literal built from `PATHS.x`, or a raw string literal like `"/terms-of-sale"` — in `withLocale(...)`. Module-level arrays built from `PATHS` (e.g. `Header.tsx`'s `NAV`, `Footer.tsx`'s `COLUMNS`/`SOLUTION_LINKS`) stay bare (hooks can't run at module scope) — wrap `to` only at the JSX render site, inside the `.map()` callback, which already runs inside the component.

- [ ] **Step 1: Update `Header.test.tsx`'s expected hrefs (the failing test)**

`Header.test.tsx` currently does `localStorage.setItem('roote.locale', 'en')` then asserts bare hrefs (`/how-it-works`, `/`, `/analysis`, etc.). Replace the locale-setting with an explicit `localeRegion` prop and update every expected href to carry the `/en-us` prefix — note `PATHS.home` is bare `/`, so `withLocale('/')` produces `/en-us/` (trailing slash), not `/en-us`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { Header } from './Header';

function renderHeader() {
  const router = createMemoryRouter([{ path: '/', element: <Header /> }], { initialEntries: ['/'] });
  render(
    <LocaleProvider localeRegion="en-us">
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </LocaleProvider>,
  );
}

describe('Header', () => {
  it('shows the primary nav links and the analysis CTA', () => {
    renderHeader();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/en-us/how-it-works');
    expect(within(nav).getByRole('link', { name: 'Solutions' })).toHaveAttribute('href', '/en-us/solutions');
    expect(within(nav).getByRole('link', { name: 'Science' })).toHaveAttribute('href', '/en-us/science');
    expect(within(nav).getByRole('link', { name: 'Results' })).toHaveAttribute('href', '/en-us/results');
    expect(within(nav).getByRole('link', { name: 'Our System' })).toHaveAttribute('href', '/en-us/system');
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en-us/about');
    expect(screen.getByRole('link', { name: 'Start free hair analysis' })).toHaveAttribute('href', '/en-us/analysis');
  });

  it('links the wordmark home', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'ROOTÉ' })).toHaveAttribute('href', '/en-us/');
  });

  it('opens and closes the mobile menu drawer', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/en-us/how-it-works');
    expect(within(dialog).getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/en-us/faq');
    expect(within(dialog).getAllByRole('link', { name: 'Start free hair analysis' })[0]).toHaveAttribute('href', '/en-us/analysis');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the drawer with its close button', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

Apply the identical kind of href-prefix update to `Footer.test.tsx`'s existing assertions (inspect its current hrefs the same way and add `/en-us` — or whatever region that file's other tests already establish — to each one).

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/app/components/shell/Header.test.tsx src/app/components/shell/Footer.test.tsx`
Expected: FAIL — hrefs are still bare (`/`, not `/en-us`).

- [ ] **Step 3: Apply the transformation — worked examples**

`Header.tsx` (add the hook, wrap every render-site `to`):
```tsx
export function Header() {
  const t = useT();
  const withLocale = useLocalizedPath();
  ...
  <Link to={withLocale(PATHS.home)} aria-label="ROOTÉ" className="inline-flex items-center">
  ...
  {NAV.map(([key, to]) => (
    <NavLink key={to} to={withLocale(to)} className={navLinkClass}>
  ...
  <NavLink to={withLocale(PATHS.account)} className="...">
  <Button to={withLocale(PATHS.analysis)} size="sm" caps onInk ...>
  {[...NAV, ...].map(([key, to]) => (
    <Link key={to} to={withLocale(to)} onClick={...}>
```
(add the `import { useLocalizedPath } from '@/i18n/LocaleProvider';` import)

`Footer.tsx` (same pattern, plus the one raw string literal):
```tsx
export function Footer() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  ...
  {col.links.map(([to, label]) => (
    ... <Link to={withLocale(to)} ...>
  {SOLUTION_LINKS.map(([to, kind]) => (
    ... <Link to={withLocale(to)} ...>
  {LEGAL_PAGES.map((p) => (
    ... <Link to={withLocale(PATHS.legal(p.slug))} ...>
  <Link to={withLocale('/terms-of-sale')} className="...">
  <Button to={withLocale(PATHS.analysis)} size="sm" caps onInk ...>
```

`SolutionPage.tsx` (template-literal example):
```tsx
<Button to={withLocale(`${PATHS.analysis}?concern=${concernQuery}`)} caps>
```

Apply the identical rule to every remaining match in the files listed above.

- [ ] **Step 4: Fix any test breakage discovered by running the suite**

Run: `npx vitest run src/app/routes/marketing src/app/components/shell src/app/components/marketing src/app/routes/bag`
For any failure caused by a component now expecting `useLocale()`'s `localeRegion`/`useLocalizedPath` in a tree with no `<LocaleProvider>` ancestor at all: check the test wraps the component in `<LocaleProvider>` already (it should, per the existing `useT()`/`useLocale()` usage) — if so, no route change is needed, since `LocaleProvider`'s default (`he-il`) covers it. For any failure caused by `localStorage.setItem('roote.locale', 'en')` no longer having any effect (that test now silently renders Hebrew and fails an English-text assertion): remove that line and add `localeRegion="en-us"` as a prop on that test's `<LocaleProvider>` wrapper instead.

- [ ] **Step 5: Verify completeness**

Run these three greps and confirm each returns **no matches** in the files this task touched (a bare `PATHS.` or literal `to="/` immediately after `to=` — as opposed to `to={withLocale(...)}` — means a call site was missed):
```bash
grep -rn 'to={PATHS\.' src/app/components/shell src/app/components/marketing src/app/routes/marketing src/app/routes/bag src/app/components/checkout
grep -rn 'to=["'"'"'\`]/' src/app/components/shell src/app/components/marketing src/app/routes/marketing src/app/routes/bag src/app/components/checkout
```

- [ ] **Step 6: Run the full suite and typecheck**

Run: `pnpm test` and `pnpm typecheck`
Expected: only failures remaining are in files Tasks 7-8 haven't touched yet, plus the one pre-existing unrelated typecheck error.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/shell src/app/components/marketing src/app/components/checkout src/app/routes/marketing src/app/routes/bag
git commit -m "feat: prefix marketing/shell/bag internal links with the current locale-region"
```

---

### Task 7: Migrate app/account + start/program + auth links to `withLocale()`

**Files (from the same greps, scoped to these directories):**
- Modify: `src/app/routes/app/AppShell.tsx`, `AccountResults.tsx`, `AccountRenew.tsx`, `AccountScans.tsx`, `AccountOverview.tsx`, `AccountOrders.tsx`, `AccountBeforeAfter.tsx`, `AccountProgress.tsx`, `AppProfile.tsx`, `AccountToday.tsx`, `AppCare.tsx`
- Modify: `src/app/routes/start/AccountStep.tsx`, `PlanStep.tsx`, `CheckoutStep.tsx`, `SuccessStep.tsx`, `StartLayout.tsx`
- Modify: `src/app/routes/auth/LoginPage.tsx`
- Modify test files that set `roote.locale` in these directories (found via `grep -rln "roote.locale" src/app/routes/app src/app/routes/start`)

**Interfaces:**
- Consumes: `useLocalizedPath` from `@/i18n/LocaleProvider` (Task 2).

**Transformation rule:** identical to Task 6. `AppShell.tsx`'s `navigate('/')` (used for `logout()`) and `AppProfile.tsx`'s `navigate('/')` both need `withLocale('/')` too — `navigate()` calls are just as much render-time navigation as `<Link>`/`<NavLink>`.

- [ ] **Step 1: Add a failing test to `AppShell.test.tsx`**

By this point (after Task 5 Step 5), `AppShell.test.tsx`'s `renderAt` mounts its router at `/he-il/account` and wraps `<LocaleProvider localeRegion="he-il">`. Add a test that checks every rendered nav link's `href` — not by link name/text (Hebrew copy, easy to get wrong in a plan document), but by querying all `<a>` elements inside the `<nav>` and asserting each one's `href` starts with the current region:

```tsx
it('prefixes every sidebar nav link with the current locale-region', () => {
  seedSignedInProgram();
  const { container } = renderAt('/he-il/account');
  const navLinks = container.querySelectorAll('aside nav a[href]');
  expect(navLinks.length).toBeGreaterThan(0);
  navLinks.forEach((a) => {
    expect(a.getAttribute('href')).toMatch(/^\/he-il\/account/);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/app/routes/app/AppShell.test.tsx`
Expected: FAIL — hrefs are still bare (`/account/today`, not `/he-il/account/today`).

- [ ] **Step 3: Apply the transformation — worked example**

`AppShell.tsx`:
```tsx
export function AppShell() {
  const t = useT();
  const { locale } = useLocale();
  const withLocale = useLocalizedPath();
  ...
  <NavLink key={to} to={withLocale(to)} end={to === PATHS.account} className={navLinkClass}>
  ...
  <NavLink to={withLocale(PATHS.accountSection('scans'))} className="...">
  <NavLink to={withLocale(PATHS.products)} className="...">
  ...
  function logout() {
    auth.signOut();
    navigate(withLocale('/'));
  }
```
(`end={to === PATHS.account}` stays comparing the **bare** `to` — that comparison is unaffected by the prefix.)

`AccountStep.tsx` (raw-string `navigate()` example):
```tsx
const withLocale = useLocalizedPath();
...
navigate(withLocale('/program/plan'));
```

Apply the identical rule to every remaining match in the files listed above, including the guard-result render sites (e.g. `StartLayout.tsx:49`'s `if (redirect) return <Navigate to={redirect} replace />;` becomes `if (redirect) return <Navigate to={withLocale(redirect)} replace />;` — `redirectForStartStep` itself stays bare, per the spec) and conditional-expression targets (`LoginPage.tsx:29`'s `navigate(session.program ? '/account' : '/')` — a shape the Task 6-8 greps don't catch, since neither `navigate(PATHS` nor `navigate('/` matches literally — becomes `navigate(withLocale(session.program ? '/account' : '/'))`, wrapping the whole ternary's result rather than each branch).

- [ ] **Step 4: Fix any test breakage**

Same two patterns as Task 6 Step 4: missing `<LocaleProvider>` wrap doesn't apply here (all these tests already wrap it for `useT()`), so failures will mostly be `roote.locale`-setting tests needing `localeRegion="en-us"` instead, or a test that clicks through a `withLocale`-wrapped `<Navigate>`/link and needs its own synthetic router's `path`/`initialEntries` updated to match the now-prefixed target (only where the test asserts on the *destination* of a click, not just static render output).

- [ ] **Step 5: Verify completeness**

```bash
grep -rn 'to={PATHS\.' src/app/routes/app src/app/routes/start src/app/routes/auth
grep -rn 'to=["'"'"'\`]/' src/app/routes/app src/app/routes/start src/app/routes/auth
grep -rn "navigate(PATHS\.\|navigate(['\"\`]/" src/app/routes/app src/app/routes/start src/app/routes/auth
```
All three expected to return no matches.

- [ ] **Step 6: Run the full suite and typecheck**

Run: `pnpm test` and `pnpm typecheck`

- [ ] **Step 7: Commit**

```bash
git add src/app/routes/app src/app/routes/start src/app/routes/auth
git commit -m "feat: prefix app/account/start/auth internal links with the current locale-region"
```

---

### Task 8: Migrate analysis-flow links to `withLocale()`

**Files:**
- Modify: `src/app/routes/analysis/AnalysisShell.tsx`, `Steps1to3.tsx`, `ScanningScreen.tsx`, `ResultsScreen.tsx`, `QuestionsScreen.tsx`, `PhotosScreen.tsx`
- Modify test files: `src/app/routes/analysis/analysisFlow.test.tsx`, `src/analytics/wiring.test.tsx`

**Interfaces:**
- Consumes: `useLocalizedPath` from `@/i18n/LocaleProvider` (Task 2). `src/app/routes/analysis/guards.ts` stays bare/unchanged per the spec (Global Constraints) — it's a pure function with no hook access; every one of its call sites already goes through a component that calls `useLocalizedPath()`.

**Transformation rule:** identical to Tasks 6-7. Every `navigate(PATHS.analysisStep(...))` and `<Navigate to={PATHS.analysisStep(...) | redirect}>` in these six files gets its argument wrapped.

- [ ] **Step 1: Fix `analysisFlow.test.tsx`'s `renderFlow` helper (the failing test)**

This file's `renderFlow(path)` helper (around line 95) mounts `analysisRoutes` **standalone** at the router root and calls `localStorage.setItem('roote.locale', 'en')`. Its three tests click through real steps (`intro → gender → concern`, photo-gate redirect, results deep-link redirect) — once `Steps1to3.tsx`/`ScanningScreen.tsx`/etc. wrap their `navigate()` targets in `withLocale()` (this task's Step 3), those targets become `/en-us/analysis/...`, which won't match a router that only knows about bare `/analysis/...`. Nest `analysisRoutes` under a fixed `/en-us` parent so the region-prefixed targets resolve, and drop the now-inert `localStorage` call in favor of the `localeRegion` prop:

```tsx
function renderFlow(path: string) {
  localStorage.clear();
  const router = createMemoryRouter([{ path: '/en-us', children: [analysisRoutes] }], {
    initialEntries: [`/en-us${path}`],
  });
  render(
    <LocaleProvider localeRegion="en-us">
      <AuthProvider>
        <SessionProvider>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </SessionProvider>
      </AuthProvider>
    </LocaleProvider>,
  );
}
```

Every existing call site (`renderFlow('/analysis')`, `renderFlow('/analysis/photos')`, `renderFlow('/analysis/results')`) stays exactly as written — only the helper's internals change. This requires Task 4's `analysisRoutes.tsx` path change (`'/analysis'` → `'analysis'`, already relative) to have landed, since a route object with an absolute `path: '/analysis'` cannot be nested under another path segment.

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/app/routes/analysis/analysisFlow.test.tsx`
Expected: FAIL until Step 3 below actually wraps the navigate/Link targets in `withLocale()` — until then, clicking through still navigates to bare (non-`/en-us`-prefixed) targets that no longer exist anywhere in this test's now-`/en-us`-nested router, so the flow won't advance.

- [ ] **Step 3: Apply the transformation — worked example**

`Steps1to3.tsx`:
```tsx
const navigate = useNavigate();
const withLocale = useLocalizedPath();
...
navigate(withLocale(PATHS.analysisStep('gender')));
...
if (redirect) return <Navigate to={withLocale(redirect)} replace />;
```

Apply identically to `ScanningScreen.tsx`, `ResultsScreen.tsx`, `QuestionsScreen.tsx`, `PhotosScreen.tsx`, and `AnalysisShell.tsx`'s `<Link to={PATHS.home}>`.

- [ ] **Step 4: Fix any test breakage**

Same two patterns as Tasks 6-7.

- [ ] **Step 5: Verify completeness**

```bash
grep -rn 'to={PATHS\.\|navigate(PATHS\.' src/app/routes/analysis
```
Expected: only matches inside `guards.ts` (unchanged, bare, by design) and `analysisRoutes.tsx`'s three `<Navigate to="/analysis...">` WP2-era aliases — **these three also need `withLocale()`**, via a `LocalizedNavigate`-style wrapper component (reuse the one already defined in `App.tsx`, or inline an equivalent in `analysisRoutes.tsx` if importing from `App.tsx` would create a circular import — check before choosing).

- [ ] **Step 6: Run the full suite and typecheck**

Run: `pnpm test` and `pnpm typecheck`

- [ ] **Step 7: Commit**

```bash
git add src/app/routes/analysis src/analytics/wiring.test.tsx
git commit -m "feat: prefix analysis-flow internal links with the current locale-region"
```

---

### Task 9: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full completeness sweep**

Run every grep used across Tasks 6-8 against the whole `src/app` tree at once and confirm zero unexpected matches (only `guards.ts` files and `paths.ts`/`localeRegion.ts` themselves, which stay bare by design):
```bash
grep -rn 'to={PATHS\.' src/app
grep -rn 'to=["'"'"'\`]/' src/app
grep -rn "navigate(PATHS\.\|navigate(['\"\`]/" src/app
```

These three greps only catch call sites where the bare path is written directly at the call site. `ReportView.tsx`'s `to={model.cta.href}` (fixed in Task 5) and `LoginPage.tsx`'s `navigate(session.program ? '/account' : '/')` (fixed in Task 7) are two confirmed examples of call sites these greps structurally cannot find — a property access or a conditional expression, not a literal. Also run this broader (noisier, needs eyeballing) sweep and manually check every result that isn't already `withLocale(...)`-wrapped, isn't inside `guards.ts`/`paths.ts`/`localeRegion.ts`, and isn't a transparent pass-through prop inside `Button.tsx`/`Text.tsx` (`<Link to={to}>` there just renders whatever its caller already passed — no fix needed in those two files themselves):
```bash
grep -rnE "(Link|NavLink|Button|CtaButton|ArrowLink|TextLink) to=\{[a-zA-Z]" src/app
grep -rn "navigate([a-zA-Z]" src/app
```

- [ ] **Step 2: Full test suite**

Run: `pnpm test`
Expected: all tests pass (355 + every test added in Tasks 1-8).

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: zero diagnostics beyond the one pre-existing, unrelated error at `src/domain/report/buildReport.test.ts:140`.

- [ ] **Step 4: Manual smoke check**

Run: `pnpm dev`, open the app, confirm: visiting `/` redirects to a `/xx-yy/` URL; the language/country picker (`CountryLanguageSelector`) switches locale/country without losing the current page; every marketing nav link, footer link, and the AppShell sidebar carry the current locale-region prefix; view source (or the rendered `<head>`) shows 17 `hreflang` `<link>` tags plus a self-referencing canonical.

- [ ] **Step 5: Commit** (only if Step 4 surfaced fixes; otherwise this task has nothing to commit)
