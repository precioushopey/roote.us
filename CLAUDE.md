# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

> **Full picture:** [`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md) is the source of truth for
> scope, requirements, business rules, flows, data model, and open questions. Read it (and its four
> companion docs) before any non-trivial change. This file is the short "how to work here" version.

## What this is

**ROOTÉ.US** — a **front-end-only concept web app** for a hair-loss brand ("Personalized Hair
Growth System"). It presents the whole customer journey:

```
marketing site → free questionnaire-based "AI" hair diagnosis → personalized web report
             → account + plan + checkout → post-purchase program app        (+ a separate à-la-carte product shop)
```

The UI ships in six languages — **English (default)**, Hebrew, Arabic, Russian, French, Spanish —
picked from a `LanguagePicker` dropdown; Hebrew and Arabic render RTL. Every route lives under a
`/:locale` URL prefix (`/en`, `/he`, …). There is **no backend of any kind** — every
server concern (auth, payment, email, photo storage, notifications, support, CV analysis) is a typed
stub with a `TODO` marker. `index.html` is `noindex, nofollow`. Operating entity: **91 ENTERPRISE LLC**.

The repo began as a Figma Make export ("Design Etsy Shop Branding") and was fully repurposed. Only
the build tooling lineage remains (Vite config, Tailwind v4 setup, the `figma:asset/*` resolver, the
shadcn/ui set under `src/app/components/ui/`).

## Commands

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm build        # vite build -> dist/  (main chunk is now well over 500 kB — the warning is expected, not a regression)
pnpm typecheck    # tsc --noEmit (strict) — must stay at 0 diagnostics
pnpm i18n:check   # node scripts/check-i18n-parity.mjs — message-key parity across all 6 locales
pnpm content:check # node scripts/check-content-parity.mjs — content-layer LocalizedText parity
```

- pnpm workspace. `pnpm-workspace.yaml` pins `supportedArchitectures` to linux glibc, so a plain
  install can misbehave on Windows; `pnpm add react@18.3.1 react-dom@18.3.1` if `dev`/`build`
  complains about React. `react`/`react-dom` are real `dependencies` now (were optional peers).
- `tsconfig.json` exists (added 2026-09-03) and is `--noEmit` only — esbuild still strips types at
  build. Keep `pnpm typecheck` green.
- **No lint or format tooling exists.** Don't add ESLint/Prettier unless asked (it's a known gap —
  see `docs/TECHNICAL-SPECIFICATION.md` §10 / OQ-TECH-6).
- **No test suite exists.** All `*.test.ts(x)` files were deliberately removed 2026-09-10 (user
  request). Vitest and Testing Library are still `devDependencies` and `pnpm test`/`pnpm test:watch`
  still exist as scripts, but `pnpm test` now exits 1 with "No test files found" — don't treat that
  as a regression to fix. There is no automated regression coverage for domain logic or routing —
  verify those by reading the code and checking the app in a browser. i18n message-key parity and
  content-layer translation completeness ARE gated: `pnpm i18n:check` / `pnpm content:check` (see
  Commands). Don't add tests back unless asked.

## Hard rules (do not violate)

1. **Never invent product content.** Prices, effectiveness %, time-to-results, testimonials, study
   results, advisory names, press logos, medical/legal copy — if the client hasn't supplied it, it
   stays `null` in `src/content/roote.config.ts` and renders as a `<PendingChip>` → `[PENDING: label]`.
   This is a regulatory constraint, not a style preference. (No longer test-enforced — see Commands.)
2. **Six-locale key parity.** Every key added to `src/i18n/messages/en.ts` needs the same key in
   `he.ts`, `ar.ts`, `ru.ts`, `fr.ts`, and `es.ts`, and no value may be `""` — enforced by
   `pnpm i18n:check`. Write real translations (first-pass is fine); flag legal copy as "pending
   formal legal review" (the pattern `roote.config.disclaimers` and `legal.ts` use). The same parity
   requirement applies to `src/content/*.ts` `LocalizedText` entries, enforced by `pnpm content:check`.
3. **Domain layer stays pure.** `src/domain/**`, `src/content/pending.ts`, `src/domain/report/money.ts`,
   `src/app/routes/app/programProgress.ts` — no imports of React, the DOM, storage, or the i18n
   *provider*. They take typed inputs and return typed outputs (analysis returns **keys**, not display
   strings).
4. **Renderers consume view-models, not config.** `buildReport()` / `resolvePlanTreatments()` produce
   fully-resolved, already-localized, pending-flagged structures; components render those. Don't reach
   into `roote.config` or call `t()` for domain content inside a report/plan renderer.
5. **RTL-safe styling.** Use Tailwind logical utilities (`ms/me/ps/pe`, `text-start/-end`,
   `start-*/end-*`) — never `ml/mr/left/right` for layout. `LocaleProvider` flips `dir`.

## Architecture

### Render flow

`index.html` → `src/main.tsx` (`createRoot(#root)` + `import "./styles/index.css"`) →
`src/app/App.tsx` → `AuthProvider` › `SessionProvider` › `CartProvider` › `TrackingProvider` ›
`ToastProvider` › `RouterProvider`. `LocaleProvider` is **not** in that chain — the router's
`/:locale` route element `LocaleGate` validates the locale segment (redirecting a bare/invalid
path via `resolveLocaleRedirect`, with its `*`-route sibling `BareOrLegacyPathRedirect`) and mounts
`LocaleProvider` around the routed page tree.

The router is a **module-scoped `createBrowserRouter`** created once at import. Drive it
programmatically by `window.history.pushState(...)` **plus**
`window.dispatchEvent(new PopStateEvent('popstate'))` — a bare `pushState` won't notify it.

### Routing & shells

Every path below is served under a `/:locale` prefix (`/en`, `/he`, `/ar`, `/ru`, `/fr`, `/es`); the
table lists the bare paths. `src/app/LocaleGate.tsx` validates the segment via `isValidLocaleSegment`
and (with its `*`-route sibling `BareOrLegacyPathRedirect`) redirects a bare or unknown-locale URL —
`resolveLocaleRedirect` picks the target: stored `roote.locale` pref → `navigator.language` → `en`.

| Shell | Routes | Chrome |
|---|---|---|
| `MarketingShell` | `/`, `/magazine`, `/hair-scan`, `/solutions` (+ `/thinning`, `/gray-hair`), `/faq`, `/support`, `/login`, `/signup`, `/products` (+ `/:slug`), `/terms`, `/terms-of-sale`, `/privacy`, legal registry (`/shipping`, `/returns`, `/cancellation`, `/subscription-terms`, `/medical-disclaimer`, `/accessibility`, `/cookies`), `/bag`, `/bag/checkout`, `/bag/success` | Header (condense-on-scroll: bg/border swap only, no longer shrinks padding) + Footer + skip-link |
| `AnalysisShell` | `/analysis` (index) + `gender`/`goal`/`photos`/`scanning`/`questions`/`results` (WP2-era aliases `intro`/`concern`/`analyzing`/`ready` still redirect) | wordmark (→ `/`) + progress rail + `LanguagePicker` |
| `FunnelShell` | `/account/hairhealth-rescan`; `/program` + `plan`/`checkout`/`success` (`StartLayout` nested) | wordmark (→ `/`) + `LanguagePicker` only |
| *(own inline)* | `/report/:reportId` | wordmark header + disclaimer footer |
| `AppShell` | `/account` (index = Today, absorbs the former Overview dashboard), plus `program`/`progress` (Photos/Scans/Before & After are now `?tab=` sections of this one page)/`care`/`profile` (absorbs the former Orders/Subscription pages) — 5 sidebar items total (nav consolidation, 2026-09-11). Also `baseline`/`results`/`renew`/`reminders` (contextual sub-pages, not in the sidebar). Old URLs (`today`, `photos`, `scans`, `progress/before-after`, `orders`, `subscription`, WP2-era `plan`→`program`, `rescan`→`progress?tab=scans`) still redirect. | desktop sidebar / mobile scrollable tabs; guarded by `session.program` + `auth.email` (`/account/profile` is reachable without a program too, for bag-only guests) |
| — | `*` → `<Navigate to="/" replace/>` | — |

`/diagnosis`, `/start`, and `/app` still work as old URLs — `LEGACY_PREFIX_REDIRECTS` in
`src/app/paths.ts` maps each prefix to its new name (`/analysis`, `/program`, `/account`).
`resolveLocaleRedirect` (in `src/i18n/localeUrl.ts`) composes these with the locale prefix, so a bare
`/diagnosis/gender` lands on `/<locale>/analysis/gender` in one hop.

Guards are plain functions returning a redirect path or `null`:
`src/app/routes/analysis/guards.ts` (`redirectForAnalysisStep`), `src/app/routes/start/guards.ts`
(`redirectForStartStep`). Route components call them and `<Navigate>` on a non-null result.

### Layers & folders (`src/`)

```
content/roote.config.ts   brand + company (entity facts) + formula + programDurations + treatments + disclaimers
        catalog.ts         17-SKU product catalogue (prices are [PENDING])
        pending.ts          PENDING() / isPending() / collectPending()
domain/analysis/           deriveAnalysis (pure, deterministic), analyzeHair (orchestrator + fallback),
                           remoteAnalysisAdapter (env-gated PLACEHOLDER contract, vendor TBD), types
       report/             buildReport (pure view-model builder), types, money (Intl currency)
       program/            types (Program, Treatment)
i18n/                      LocaleProvider, locales.ts (6-locale registry), localeUrl.ts (locale-prefix
                           redirects), interpolate ({var} only), messages/{en,he,ar,ru,fr,es,index}
store/                     sessionStore (useReducer, localStorage['roote.session']),
                           auth (mock; non-crypto digest), cart (localStorage['roote.cart']),
                           checkout (unified Order union + stub submitPayment), orders (order history,
                           localStorage['roote.orders']), program (buildProgram), persistence, devSeed
app/routes/                marketing/ · bag/ · auth/ · analysis/ · start/ · report/ · app/ · legal/
app/components/            shell/ · marketing/ · brand/ · diagnosis/ · report/ · funnel/ · checkout/(CheckoutFields) · ui/(shadcn, mostly unused)
app/lib/                   useRevealOnRoute, useReducedMotion, useScrollCondense
styles/                    index.css → fonts.css, tailwind.css, theme.css, marketing.css ; tokens.ts (JS mirror of theme.css)
```

### Content pipeline

`roote.config.ts` (facts, `as const`, `null` = unsupplied) + `src/content/*.ts` +
`i18n/messages/<locale>` (message-key copy) — all six locales throughout → `deriveAnalysis` →
`buildReport` / `resolvePlanTreatments` → resolved localized pending-flagged view-models → dumb
renderers. `collectPending(model)` enumerates every unresolved slot.

### i18n

Six `LocaleCode`s — `en` (`DEFAULT_LOCALE`), `he`, `ar`, `ru`, `fr`, `es`; `ENABLED_LOCALES` = all
six. Every route sits under a `/:locale` URL prefix: `LocaleGate` (the router element for `/:locale`)
mounts `LocaleProvider`, and `resolveLocaleRedirect` / `isValidLocaleSegment` in
`src/i18n/localeUrl.ts` send a bare or bad-locale URL to stored `roote.locale` → `navigator.language`
→ `en`. Copy is one file per locale, `src/i18n/messages/<code>.ts`, held at exact key parity
(1125 keys) by `pnpm i18n:check` (`scripts/check-i18n-parity.mjs` — parity / no-stray / no-empty /
placeholder-integrity, plain Node, not a test); `he.ts` is the per-key reference for the `ar/ru/fr/es`
first-pass translations. **Content-layer `LocalizedText`** (`src/content/*.ts` + `roote.config.ts`)
is likewise fully six-locale — its `LocalizedText` type carries optional `ar?/ru?/fr?/es?`.
`pickLocalized(text, locale)` (everywhere else) falls back to `en` for a missing field;
`resolveLocalized` (report) instead returns a `[PENDING]` marker — the report never silently shows
English. `pnpm content:check` (`scripts/check-content-parity.mjs`) enforces per-file completeness
across all 14 content modules (plus `src/seo/meta.ts`'s `ROUTE_META`, scanned separately). `he`
string in each entry is the per-entry translation reference. The `ing.note` / legal-section `S()`
factory helpers were widened to take a pre-built `LocalizedText` (was positional `en, he`) so the
parity scanner can see them. `buildReport` and `resolvePlanTreatments` both take the full
`LocaleCode` end-to-end — the old `contentLocaleOf` / `ContentLocale` en/he-narrowing helpers and the
`contentLocale` context field they fed have been removed (the web report keeps its own
`ReportModel.meta.locale: LocaleCode`). One `LanguagePicker` dropdown (Header,
Footer, FunnelShell, AnalysisShell, AppShell) is the sole language control — the earlier binary
he↔en toggle and the country + language modal picker are gone, and with them region / country /
per-country currency (one display currency stays in `roote.config`).

### State & persistence

Four context providers, each initialised from and written back to storage:

| Store | Key | Notes |
|---|---|---|
| `sessionStore` | `localStorage['roote.session']` | whole `SessionState` (diagnosis, analysis, reportId, account.email, draftDurationDays, program) |
| `auth` | `localStorage['roote.accounts' | 'roote.authSession']` | mock; `digestOf()` is **non-cryptographic** — replace wholesale for real auth |
| `cart` | `localStorage['roote.cart']` | qty clamped 1–20 |
| `LocaleProvider` | `localStorage['roote.locale']` | default `'en'`; write-only "last-known locale", read by `resolveLocaleRedirect` on a bare/invalid path; sets `<html lang dir>` |
| `persistence` | IndexedDB `roote`/`blobs` | photo blobs keyed by uuid; thumbnails (data URLs) live in the JSON state |

`import.meta.env.DEV` gates the dev seed on `/program` and the
`localStorage['roote.debug.forceCheckoutFailure'] = '1'` switch (forces both checkout stubs to throw).

### Analysis engine

`deriveAnalysis({gender, hairGoal, answers})` — pure, deterministic. Male → Norwood, female → Ludwig;
severity from onset; `recommendedDurationDays` from `RECOMMENDED_DURATION_TABLE[severity:emphasis]`
(90 is user-selectable but never AI-recommended). Full rule table: `docs/BUSINESS-RULES.md` §1.
`analyzeHair` calls a remote CV provider only when `VITE_CV_PROVIDER_API_URL` is set **and** photos
exist, falling back to the local model on any failure. No vendor is under contract for this seam —
`remoteAnalysisAdapter`'s request/response shape is a **guess**, confirm before relying on it. This is
unrelated to HairHealth.ai: their actual, confirmed integration with ROOTÉ is a separate lead-gen
chatbot at `/hair-scan` (`LandbotFullpageEmbed`) whose results go straight to ROOTÉ's own HubSpot —
see `docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md`.

### Styling

`src/styles/index.css` imports (in order) `fonts.css`, `tailwind.css`, `theme.css`, `marketing.css`.
Tailwind **v4** (`@tailwindcss/vite`) — no `tailwind.config`, `postcss.config.mjs` is intentionally
empty. Tokens are CSS custom properties in `theme.css` (shadcn variable names) + an `@theme inline`
map; **keep `src/styles/tokens.ts` in sync**. Light-only in practice —
the `.dark` block exists but nothing toggles it. Palette: cream `#fcf9f3` ground, `#172022` text, deep
emerald `#1b4b32` primary CTA / `#0a2a1c` ink bands (header, footer, AppShell sidebar — anchor, not
dominant; body content stays on cream), gold `#c6a15a` accent (non-text / ≥24 px only, logo exempt).
Motion
via `motion`; every effect needs a `prefers-reduced-motion` static fallback (`useReducedMotion`).

## Gotchas

- **`figma:asset/<file>`** imports resolve to `src/assets/<file>` (custom `vite.config.ts` plugin).
  `@` → `src/` in both `vite.config.ts` and `tsconfig.json` `paths` — keep them aligned.
- `assetsInclude` covers `.svg`/`.csv` only — never add `.css`/`.ts`/`.tsx`.
- Program-day math (`programDay`, `isoToday`, `buildProgram`) is **UTC-only** → off-by-one for
  non-UTC users late in their local day. Known; don't "fix" casually.
- `lsSet` catches write failures and warns; there is **no** quota-driven photo eviction.
- **Orphaned i18n key:** `marketing.nav.blog` has no runtime consumer (the `/blog` route was never
  built) but still counts toward the six-locale parity check (`scripts/check-i18n-parity.mjs`).
- The **PDF report was built then removed** (`src/pdf/*`, `@react-pdf/renderer` gone). `ReportView`
  is web-only. `src/app/routes/report/ReportEmailPreview.tsx` exists but is **not routed**.
- **One checkout, two order kinds.** `store/checkout.ts` has a single `Order` discriminated union
  (`{ kind: 'program' | 'bag', … }`), one `submitPayment(order)` (id prefixed `ord-`/`bag-` from
  `kind`), and both `/program/checkout` and `/bag/checkout` render the shared
  `app/components/checkout/CheckoutFields.tsx` (contact + card form + shape validation). Successful
  orders are appended to `store/orders.ts` history and shown on `/account/profile`. The bag is a
  **kept, secondary "refills & add-ons" surface** (OQ-BIZ-7 direction, 2026-09-03) — discoverable via
  a cart icon + badge in the marketing `Header` and a "Shop products" link in the `/account` sidebar.
  Keep the single checkout machinery; don't fork it again.
- **Card data:** `CheckoutFields` builds `card` as `{ last4, expiry }` only — the full number and CVC
  must never enter the `Order`, be logged, or be stored.
- `/account/*` has no dev seed that mints a `Program`, so in DEV it's only reachable by completing
  `/program/checkout` (or hand-seeding `session.program`).
- Photo gate inconsistency: `redirectForAnalysisStep` needs ≥1 photo, `/analysis/photos` requires all
  4 to continue.
- `src/app/components/ui/` (shadcn) + many `package.json` deps (MUI, full Radix set, `recharts`,
  `canvas-confetti`, `react-hook-form`, `lucide-react`, …) are **unused** template baggage.

## Other notes

- `guidelines/Guidelines.md` is the untouched Figma Make placeholder — ignore it.
- `main` == `origin/main` == `e5b9fa0` (pushed 2026-09-08); working tree starts clean. Commit/push
  only when the user asks.
- `docs/superpowers/specs/*` + `plans/*` are the original phase design intent; parts are superseded —
  the "Implementation vs. intent" table in `docs/DESIGN-SPECIFICATION.md` lists the deltas.
