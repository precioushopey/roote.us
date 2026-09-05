# International URL & hreflang Architecture — Design Spec

**Date:** 2026-09-05
**Status:** Draft for review
**Relation:** Sub-project 2 of the SEO engagement (`SEO-AUDIT.md`, step 1 of 7). Resolves C4 ("no locale
in the URL — hreflang is structurally impossible today") and the first-visit-locale half of C3.
Explicitly does **not** resolve C3's SSR/prerendering gap (non-JS crawlers still see static
`index.html` until a later, separate sub-project) — see §7. Builds directly on top of the
already-scaffolded (uncommitted) locale/country/currency registry in `src/i18n/locales.ts` and the
`PATHS` registry in `src/app/paths.ts`; does not replace either.

---

## 1. Goal

Give every page a real, distinct URL per language + region, so:

- `hreflang` annotations become possible (C4) — each language/region variant is a real, linkable,
  bookmarkable, shareable URL instead of the same URL rendering different content from hidden
  `localStorage` state.
- A first-visit crawler or user with no stored preference lands on a URL that reflects a real
  signal (browser `Accept-Language`) instead of always seeing whatever `DEFAULT_LOCALE` happens to
  be today.
- The already-scaffolded 6-locale / 8-country roadmap (`src/i18n/locales.ts`) has somewhere to go:
  today `ENABLED_LOCALES`, `COUNTRY_DEFAULTS`, and `CountryLanguageSelector` exist but locale/country
  are pure client state with no URL representation at all.

### Non-goals

- **No SSR/prerendering.** This stays a client-rendered SPA; static `index.html` served to non-JS
  crawlers is unaffected. See §7 and SEO-AUDIT.md C3.
- **No new countries or locales.** Scoped to the 6 locales / 8 countries already in
  `src/i18n/locales.ts` (`LOCALES`, `COUNTRY_DEFAULTS`) — this spec is about giving that existing
  roadmap a URL contract, not expanding it.
- **No host-level redirects.** Bare/legacy-path redirection stays a client-side `<Navigate>`, same
  limitation SEO-AUDIT.md H6 already documents for the pre-existing `/diagnosis`→`/analysis` style
  legacy redirects. A real 301 at the hosting layer is a future decision once a deployment target is
  chosen.
- **No copy, IA, or domain-logic changes.** `ROUTE_META`, `PATHS`, route guards, and all page content
  stay exactly as they are today — only how a URL maps to a locale/country changes.

---

## 2. Locked scope decisions

| Decision | Choice |
|---|---|
| Locale scope | Design for the full 6-locale / 8-country roadmap now (`LOCALES`, `COUNTRY_DEFAULTS`), even though only `en`/`he` ship real content today. Avoids a second URL migration when `ar`/`ru`/`fr`/`es` ship. |
| URL shape | Language **+ region** path prefix: `/en-us/`, `/en-gb/`, `/he-il/`, `/ar-ae/`, etc. — not language-only, not subdomains, not ccTLDs. Matches the existing `COUNTRY_DEFAULTS` country→currency table 1:1 in spirit, but language and country are **independently selectable** (see below), so the real space is the cross-product of `ENABLED_LOCALES × COUNTRY_DEFAULTS` keys, not just the 8 curated default pairs. |
| Prerendering | Out of scope for this sub-project (see Non-goals, §7). |
| Bare-path detection | Auto-detect from browser `Accept-Language` + fall back to that locale's default country, with manual selection always overriding and persisting. Applies once, on redirect from a bare/invalid URL. |
| Routing mechanism | **Approach A** — a single dynamic `/:localeRegion` route param wrapping the existing route tree, plus one `useLocalizedPath()` hook for link generation. (Rejected: per-locale duplicated static route trees — no benefit without prerendering; converting all internal links to relative paths — larger, less uniform migration.) |

---

## 3. The locale-region URL segment

Format: `{locale}-{country}`, both lowercase, e.g. `en-us`, `he-il`, `ar-ae`. A segment is **valid**
if and only if:

- `locale` ∈ `ENABLED_LOCALES` (already gates scaffold locales behind `VITE_I18N_SHOW_SCAFFOLDS`, so
  by default only `en`/`he` prefixes validate — no new gating logic needed), **and**
- `country` ∈ `Object.keys(COUNTRY_DEFAULTS)`.

These two axes are validated **independently**, not as a fixed pair — confirmed by
`CountryLanguageSelector.tsx`, which already offers language and country/region as two separate
pickers (`onChangeCountry`, `onChangeLocale`). So `en-il` (English content, ILS pricing) is a valid,
reachable URL today even though `IL`'s curated default locale is `he` — `COUNTRY_DEFAULTS` only seeds
the *default* pairing for first-visit detection, it does not restrict what a user can manually combine.

`currency` is derived purely from the `country` half (`countryDefault(country).currency`, already the
case in `LocaleProvider`'s current — uncommitted — implementation); `contentLocale` (which of `en`/`he`
actually has translated content) is derived purely from the `locale` half via the existing
`contentLocaleOf()`.

---

## 4. Routing architecture

One new top-level route wraps the entire existing route tree, unchanged in shape:

```
{ path: '/:localeRegion', element: <LocaleGate />, children: [ ...today's full top-level route array... ] }
```

`<LocaleGate>` validates `params.localeRegion` per §3 before rendering `<Outlet/>`. If invalid, it
redirects instead of rendering children — this covers the case where a bare single-segment legacy path
(e.g. `/products`) structurally matches `/:localeRegion` with no remainder and would otherwise render
whatever the tree's index route is.

A trailing top-level catch-all (`{ path: '*', ... }`, after the `/:localeRegion` entry) covers the true
root (`/`, which has zero segments and never matches `/:localeRegion` at all) and deeper mismatches
(e.g. `/products/density-6`, where `products` gets consumed as the — invalid — region and `density-6`
matches no remaining child). Exact `createBrowserRouter` wiring for these two cases is verified with
tests during implementation, not pinned down further here.

Both call sites share one pure, unit-testable function:

```
resolveLocaleRedirect(pathname, storedRegion, acceptLanguage): string | null
```

Returns `null` if `pathname`'s first segment is already a valid locale-region; otherwise returns the
corrected full path — `storedRegion` if one is persisted, else an `Accept-Language`-detected locale
paired with that locale's default country from `COUNTRY_DEFAULTS` — **prepended onto the entire
original path**, never stripping or rewriting anything else. If `Accept-Language` matches nothing in
`ENABLED_LOCALES` (e.g. a browser locale outside the 6-language roadmap entirely), the ultimate
fallback is today's `DEFAULT_LOCALE` + `DEFAULT_COUNTRY` (`he-il`) — same behavior as today's
unconditional default, just now expressed as a redirect target instead of an initial state.

**Composes with the existing legacy-prefix redirects.** `LEGACY_PREFIX_REDIRECTS` (`/diagnosis`→
`/analysis`, `/start`→`/program`, `/app`→`/account`) currently mount as separate `<Navigate>` routes in
`App.tsx`. Left alone, a bare legacy link like `/diagnosis/gender` would take two redirect hops
(`/diagnosis/gender` → `/{region}/diagnosis/gender` → `/{region}/analysis/gender`). `resolveLocaleRedirect`
instead applies `LEGACY_PREFIX_REDIRECTS` to the rest-of-path portion in the same pass, producing one
hop directly to `/{region}/analysis/gender`.

---

## 5. `LocaleProvider` — reads from the URL, keeps its existing shape

`useParams().localeRegion` becomes the single source of truth, split into `locale`/`country` per §3.
`localStorage` stops being read on every render — it becomes write-only "last known preference,"
consulted only by `resolveLocaleRedirect` for future bare-path visits.

The context's public shape is **unchanged**: `setLocale(code)` and `setCountry(country)` keep the exact
signatures `LocaleToggle.tsx` and `CountryLanguageSelector.tsx` already call. Only their
implementation changes — from a state + `localStorage` write to a `navigate()` call that rewrites just
the locale or country half of the *current* URL's region segment, preserving the rest of the path (e.g.
calling `setCountry('US')` while on `/en-il/products` navigates to `/en-us/products`, not back to
home). **Net effect: zero changes required in `LocaleToggle.tsx` or `CountryLanguageSelector.tsx`.**

---

## 6. `PATHS` and internal links

`PATHS` (`src/app/paths.ts`), `ROUTE_META` (`src/seo/meta.ts`), and every route guard
(`redirectForStartStep`, etc.) stay **exactly as they are** — bare, locale-agnostic paths, as today.
Guards are pure functions with no hook access, so wrapping happens at the render/navigation call site,
not inside guards or `PATHS` itself.

One new hook:

```ts
function useLocalizedPath(): (path: string) => string  // withLocale(path) => `/${localeRegion}${path}`
```

Every `<Link to={PATHS.x}>`, `navigate(PATHS.x)`, and `<Navigate to={PATHS.x}>` call site becomes
`<Link to={withLocale(PATHS.x)}>` — the same shape everywhere, mechanically greppable
(`grep -rn "PATHS\." src/app` gives the full call-site inventory for the implementation plan), so
completeness is easy to verify. This is the widest-touching change in this spec (every shell, every
route file that links anywhere) but it is uniform and low-risk — no call site's logic changes, only
which string gets passed to `to`/`navigate`.

---

## 7. Metadata & hreflang

`useDocumentMeta` (`src/seo/useDocumentMeta.ts`) strips the current `localeRegion` prefix from
`location.pathname` before calling `metaForPath()` — which keeps operating on bare paths, completely
unchanged. The canonical `<link rel="canonical">` continues using the *full* pathname exactly as today
(`SITE_ORIGIN + pathname`), which now naturally includes the region prefix — each locale/region variant
gets its own correct, self-referencing canonical with no special-casing.

For every render, emit one `<link rel="alternate" hreflang="{locale}-{country}">` per **shipped**-locale
× `COUNTRY_DEFAULTS` combination that's actually reachable (not all 48 theoretical
locale × country pairs — only ones with real, shipped content: today that's `en` × all 8 countries,
`he` × all 8 countries), each pointing at that combination's URL for the current logical route, plus one
`hreflang="x-default"` pointing at the bare/undecorated URL that triggers `resolveLocaleRedirect`. Today
that's 2 × 8 = 16 alternate tags + 1 `x-default` = 17 `<link>` tags per page — an explicit, acknowledged
consequence of "independent locale/country axes across the full roadmap" (§2), not an oversight. This
count only shrinks the other direction (more shipped locales × 8 countries) as the roadmap progresses,
so it's worth the implementation plan double-checking there's no practical `<head>`-size concern before
building it.

**Why this doesn't need SSR to be worth doing (re: C3):** Googlebot executes JavaScript before
extracting `<head>` content (already noted in SEO-AUDIT.md C3), so JS-injected hreflang is picked up by
the crawler that actually consumes hreflang for ranking/indexing purposes. Social-media crawlers don't
execute JS and don't consume hreflang either way — they're unaffected by this sub-project either
direction, which is exactly why C3 (SSR) and C4 (hreflang) were split into separate sub-projects in the
first place.

---

## 8. Files touched (implementation-plan will enumerate exactly)

- `src/app/App.tsx` — new `/:localeRegion` wrapper route, `<LocaleGate>`, top-level catch-all; existing
  `LEGACY_PREFIX_REDIRECTS` `<Navigate>` routes removed (folded into `resolveLocaleRedirect`, §4)
- New: `src/i18n/localeRegion.ts` (or similar) — `resolveLocaleRedirect`, segment parsing/validation
  (§3), `<LocaleGate>`
- `src/i18n/LocaleProvider.tsx` — read from `useParams()` instead of `localStorage` on render;
  `setLocale`/`setCountry` become navigate-based (§5)
- New: `useLocalizedPath()` hook (likely co-located with `LocaleProvider` or `paths.ts`)
- `src/seo/useDocumentMeta.ts` — strip prefix before `metaForPath()`; add hreflang alternates (§7)
- Every file with a `<Link to={PATHS.x}>` / `navigate(PATHS.x)` / `<Navigate to={PATHS.x}>` call site
  (§6) — wide but mechanical; full inventory belongs in the implementation plan
- `LocaleToggle.tsx`, `CountryLanguageSelector.tsx` — **unchanged** (§5)
- `PATHS`, `ROUTE_META`, route guards — **unchanged**

---

## 9. Out of scope, noted for later

- **SSR/prerendering (C3)** — this sub-project makes it *possible* later (every URL is now fully
  deterministic: locale-region + route), but doesn't implement it. Worth revisiting once/if a
  prerendering sub-project is scheduled; the dynamic `:localeRegion` param this spec introduces could
  be swapped for statically-generated per-region branches at that point without changing the URL
  contract itself.
- **Real HTTP 301s at the hosting layer (H6)** — depends on a deployment target that doesn't exist yet.
- **Structured data / `Organization`, `WebSite` schema** — sub-project 3's scope, unaffected by URL
  shape either way.
- **Expanding beyond the current 6 locales / 8 countries** — this spec gives the existing roadmap a URL
  contract; adding more locales/countries later is additive (new `LOCALES`/`COUNTRY_DEFAULTS` entries,
  no architecture change).

---

## 10. Testing impact

- `resolveLocaleRedirect` — full unit coverage: valid segment (no-op), invalid locale, invalid country,
  missing segment entirely (bare root), stored-preference-present vs. `Accept-Language`-detected
  fallback, legacy-prefix composition (§4).
- `LocaleProvider.test.tsx` (or wherever its current coverage lives) — adapted to route through a
  `MemoryRouter` with a `:localeRegion` param instead of seeding `localStorage`; `setLocale`/`setCountry`
  tests assert on the resulting navigated path rather than on stored state.
- One or two integration tests confirming a `<Link>` round-trips correctly through `withLocale()`, and
  that switching locale or country via `CountryLanguageSelector`/`LocaleToggle` preserves the current
  route rather than bouncing to home.
- Every existing route test that renders via `createMemoryRouter` with a bare path (`/program`,
  `/report/:reportId`, `/account`, etc. — see `src/app/routes/**/*.test.tsx`) needs its `initialEntries`
  updated to include a locale-region prefix, since bare paths will now redirect instead of rendering
  directly. This is the other wide-but-mechanical touch point, alongside §6's link migration.
- `pnpm typecheck` — unaffected beyond the new hook/module's own types.
