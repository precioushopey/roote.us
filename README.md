# ROOTÉ.US

**Personalized Hair Growth System — a front-end-only concept web app.**
Marketing site → free questionnaire-based "AI" hair diagnosis → personalized web report →
account + plan + checkout → post-purchase program app, plus a separate à-la-carte product shop.

Ships in **six languages** — English (default), Hebrew, Arabic, Russian, French, Spanish — with
Hebrew and Arabic rendering RTL. React 18 · React Router 7 (data router) · Tailwind v4 · Vite 6.
**No backend of any kind** — every server concern (auth, payment, email, photo storage,
notifications, support, CV analysis) is a typed stub with a `TODO` marker. Every unverified price
or claim renders as a visible `[PENDING: …]` chip, never invented copy. `index.html` is
`noindex, nofollow`.

> **New to this repo? Read in this order:**
> 1. **[`CLAUDE.md`](CLAUDE.md)** — the short, accurate "how to work here" brief: commands, hard
>    rules, current architecture, gotchas. Kept in sync with the live code; if a doc below and
>    `CLAUDE.md` disagree, trust `CLAUDE.md` and the code.
> 2. **[`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md)** — the deep source of truth
>    for scope, requirements, business rules, flows, data model, and open questions.
> 3. **[§ Internationalization](#internationalization-srci18n--srccontent) below**, before you touch
>    any user-facing string. This is the one area with an automated gate (`pnpm i18n:check` /
>    `pnpm content:check`) that will fail your build if you get it wrong.

---

## Overview

ROOTÉ is a hair-loss brand operated by **91 ENTERPRISE LLC** (Los Angeles, California). The product
guides a customer through **Diagnosis → Analysis → Report → Purchase → Program → Follow-up**, so the
experience reads as "ROOTÉ analysed my hair and built me a plan," not "I filled in a quiz so they
could sell me shampoo."

This repository is a **stakeholder-review + developer-handoff artefact**: the whole journey is built
and navigable, backed only by the browser's `localStorage` + IndexedDB. It contains no real auth,
payment, email, storage, notifications, or computer vision — every one of those is a clearly-marked
seam for a real backend team to fill in later.

## Objectives

- One navigable artefact representing the intended product end-to-end, in six languages.
- Nothing unverified in the UI — prices, effectiveness figures, testimonials, study results, etc.
  stay `null` in config and render as `[PENDING]` until the client supplies legally-cleared values.
  This is a **regulatory constraint**, not a style preference — see [Hard rules](#hard-rules).
- Handoff-ready: clear seams for a development team to wire real backends without redesigning the UX.

## Quickstart

```bash
pnpm install
pnpm dev          # Vite dev server
```

- pnpm workspace. `pnpm-workspace.yaml` pins `supportedArchitectures` to `linux`/glibc, so a plain
  install can misbehave on Windows — if `dev`/`build` complains about React, run
  `pnpm add react@18.3.1 react-dom@18.3.1`.
- No `.env` is required to run the app. To exercise the optional remote hair-analysis seam, set
  `VITE_CV_PROVIDER_API_URL` (see [Environment Variables](#environment-variables)).

## Commands

```bash
pnpm dev           # Vite dev server
pnpm build         # vite build -> dist/  (main chunk is well over 500 kB — the warning is expected)
pnpm typecheck     # tsc --noEmit (strict) — must stay at 0 diagnostics
pnpm i18n:check    # node scripts/check-i18n-parity.mjs — UI message-key parity across all 6 locales
pnpm content:check # node scripts/check-content-parity.mjs — content-layer LocalizedText parity
pnpm lint          # eslint . — configured, but not currently clean (see Testing & Quality below)
pnpm test          # vitest run — currently 0 test files by design; see Testing & Quality below
```

## Hard rules

These are load-bearing project constraints, not style preferences — violating them breaks CI gates
or the regulatory posture of the product:

1. **Never invent product content.** Prices, effectiveness %, time-to-results, testimonials, study
   results, advisory names, press logos, medical/legal copy — if the client hasn't supplied it, it
   stays `null` in config and renders as a `<PendingChip>` → `[PENDING: label]`.
2. **Six-locale key parity.** Every key added to `src/i18n/messages/en.ts` needs the same key in
   `he.ts`, `ar.ts`, `ru.ts`, `fr.ts`, and `es.ts`, and no value may be `""` — enforced by
   `pnpm i18n:check`. The same parity requirement applies to `src/content/*.ts` `LocalizedText`
   entries, enforced by `pnpm content:check`. See [Internationalization](#internationalization-srci18n--srccontent).
3. **Domain layer stays pure.** `src/domain/**`, `src/content/pending.ts`,
   `src/domain/report/money.ts`, `src/app/routes/app/programProgress.ts` — no imports of React, the
   DOM, storage, or the i18n *provider*. They take typed inputs and return typed outputs (analysis
   returns **keys**, not display strings).
4. **Renderers consume view-models, not config.** `buildReport()` / `resolvePlanTreatments()`
   produce fully-resolved, already-localized, pending-flagged structures; components render those.
5. **RTL-safe styling.** Use Tailwind logical utilities (`ms/me/ps/pe`, `text-start/-end`,
   `start-*/end-*`) — never `ml/mr/left/right` for layout. `LocaleProvider` flips `dir` on
   `<html>` for `he`/`ar`.

## Routing & Shells

Every path below is served under a `/:locale` prefix (`/en`, `/he`, `/ar`, `/ru`, `/fr`, `/es`); the
table lists the bare paths. `LocaleGate` (the `/:locale` route element) validates the locale segment
and mounts `LocaleProvider` around the routed page tree; a bare or invalid path is 302'd by
`resolveLocaleRedirect` (stored `roote.locale` → browser `Accept-Language` → `en`).

| Shell | Routes | Chrome |
|---|---|---|
| `MarketingShell` | `/`, `/magazine`, `/hair-scan`, `/solutions` (+ `/thinning`, `/gray-hair`), `/faq`, `/support`, `/login`, `/signup`, `/products` (+ `/:slug`), `/terms`, `/terms-of-sale`, `/privacy`, legal registry (`/shipping`, `/returns`, `/cancellation`, `/subscription-terms`, `/medical-disclaimer`, `/accessibility`, `/cookies`), `/bag`, `/bag/checkout`, `/bag/success` | Header + Footer + skip-link |
| `AnalysisShell` | `/analysis` (index) + `gender`/`goal`/`photos`/`scanning`/`questions`/`results` | wordmark (→ `/`) + progress rail + `LanguagePicker` |
| `FunnelShell` | `/account/hairhealth-rescan`; `/program` + `plan`/`checkout`/`success` | wordmark (→ `/`) + `LanguagePicker` only |
| *(own inline)* | `/report/:reportId` | wordmark header + disclaimer footer |
| `AppShell` | `/account` (Today) + `program`/`progress`/`care`/`profile` (5 sidebar items) + contextual sub-pages `baseline`/`results`/`renew`/`reminders` | desktop sidebar / mobile tab bar |
| — | `*` → `<Navigate to="/" replace/>` | — |

Old URLs still work: `/diagnosis`, `/start`, `/app` prefixes redirect to `/analysis`, `/program`,
`/account`; older `/account` sub-paths (`today`, `photos`, `scans`, `orders`, `subscription`, …)
redirect to their consolidated homes. `src/app/paths.ts` (`PATHS`) is the single source of truth for
internal links — always build hrefs from it, never hand-write a path string.

## Internationalization (`src/i18n` + `src/content`)

**This is the part of the codebase most likely to bite a new contributor, and it's the one area
with an automated gate that will actually stop a broken build.** Read this section before adding or
editing any user-facing string.

### The six locales

```ts
// src/i18n/locales.ts — the single source of truth
en (default, LTR) → he (RTL) → ar (RTL) → ru (LTR) → fr (LTR) → es (LTR)
```

`he` and `ar` render right-to-left; `LocaleProvider` sets `<html lang dir>` automatically per route.
There is **one** language control app-wide — `LanguagePicker`
(`src/app/components/roote/LanguagePicker.tsx`) — mounted in every shell (Header, Footer,
`FunnelShell`, `AnalysisShell`, `AppShell`). There is no separate country/currency picker; one
display currency is set once in `src/content/roote.config.ts`.

### Two parity systems — don't confuse them

| | UI strings | Content data |
|---|---|---|
| **Where** | `src/i18n/messages/{en,he,ar,ru,fr,es}.ts` — flat `'namespace.key': 'string'` maps | `src/content/*.ts` + `roote.config.ts` — `LocalizedText` objects (`{ en, he, ar?, ru?, fr?, es? }`) embedded in structured data (products, FAQs, legal bodies, etc.) |
| **Read via** | `t(key, vars?)` from `useT()` — interpolates `{var}` placeholders | `pickLocalized(text, locale)` (falls back to `en` if a field is missing) or `resolveLocalized` in the report pipeline (renders a visible `[PENDING]` marker instead of silently falling back to English) |
| **Checked by** | `pnpm i18n:check` → `scripts/check-i18n-parity.mjs` | `pnpm content:check` → `scripts/check-content-parity.mjs` |
| **Checks for** | missing keys, stray keys, empty strings, `{placeholder}` mismatches between locales | per-entry completeness across all 14 content modules + `src/seo/meta.ts`'s `ROUTE_META` |
| **Reference locale** | `en.ts` is the key set; `he.ts` is the per-key first-pass-translation reference for `ar`/`ru`/`fr`/`es` | each entry's `he` string is the per-entry translation reference |

Both checks currently pass at **zero** missing/stray/empty entries across all six locales — run them
after any content or copy change:

```bash
pnpm i18n:check
pnpm content:check
```

### The rule, concretely

> **Add a key to `en.ts` → add the same key to `he.ts`, `ar.ts`, `ru.ts`, `fr.ts`, `es.ts` in the
> same commit.** No empty strings. No key that exists in one locale but not another. This is
> [Hard rule #2](#hard-rules), and it's enforced, not just requested — `pnpm i18n:check` /
> `pnpm content:check` will fail otherwise. A first-pass real translation is fine (this repo does not
> require professional review before merge); flag legal copy explicitly as "pending formal legal
> review" — see the pattern in `roote.config.disclaimers` / `content/legal.ts`.

### How locale routing works

Every route lives under a `/:locale` URL segment (`/en/products`, `/he/products`, …).
`isValidLocaleSegment` gates the segment; an invalid or missing one is redirected by
`resolveLocaleRedirect` (`src/i18n/localeUrl.ts`) using, in order: the stored `roote.locale`
preference → the browser's `Accept-Language` header → `en`. Switching languages
(`useLocale().setLocale`) re-navigates to the same route under the new locale prefix, preserving the
rest of the path and query string. Build internal links with `useLocalizedPath()` /
`PATHS`, not hand-written strings, so they carry the current locale prefix correctly.

### Where to look when something's wrong

- **A string renders in English when it shouldn't:** check `t()`'s fallback — `useT()` falls back to
  `en` key-by-key if a locale is missing a key (which `pnpm i18n:check` should have already caught —
  if you see this in practice, the parity check has a gap, or you bypassed `t()`).
- **A content field (product name, FAQ answer, legal clause) renders `[PENDING]`:** that's
  `resolveLocalized` in the report pipeline doing its job — the report never silently shows English;
  supply the missing locale field in the content file instead of routing around it.
- **RTL layout looks wrong (mirrored icon, wrong-side padding):** you probably used a physical
  Tailwind utility (`ml-4`, `text-right`) instead of a logical one (`ms-4`, `text-start`) —
  see [Hard rule #5](#hard-rules).
- **You're adding a brand-new locale-aware feature:** decide up front whether the copy is a UI
  string (→ `i18n/messages/*`) or structured content (→ `content/*.ts` `LocalizedText`) — the two
  systems are not interchangeable, and picking the wrong one is the most common way to fail parity
  silently until CI catches it.

## Project Structure

```
src/
  main.tsx                    createRoot(#root) + styles/index.css
  app/
    App.tsx                   AuthProvider › SessionProvider › CartProvider › TrackingProvider ›
                               ToastProvider › RouterProvider (module-scoped createBrowserRouter)
    LocaleGate.tsx             validates /:locale, mounts LocaleProvider; BareOrLegacyPathRedirect
    paths.ts                   PATHS — single source of truth for every internal link
    routes/
      marketing/                Home, Faq, Support, Terms, Privacy, Magazine, HairScan,
                                 Products, ProductDetail, SolutionPage, marketingRoutes
      bag/                      BagPage, BagCheckout, BagSuccess
      auth/                     LoginPage, SignUpPage
      analysis/                 AnalysisShell, guards, Steps1to3, PhotosScreen, ScanningScreen,
                                 QuestionsScreen, ResultsScreen, analysisRoutes
      start/                    StartLayout, AccountStep, PlanStep, CheckoutStep, SuccessStep, guards
      app/                      AppShell, AccountToday/Baseline/Progress/Results/Renew/Reminders/
                                 Rescan, AppPlan, AppCare, AppProfile, programProgress, useUserProgram
      legal/                    LegalPageView (renders content/legal.ts LEGAL_BODIES)
      report/                   ReportPage, ReportNotFound
      shared/                   PagePlaceholder
    components/
      shell/                   MarketingShell, FunnelShell, Header, Footer, AnalysisPrompt, CartLink
      roote/                   ~25-component shared design-system primitives (Button, Card, Section,
                               Stepper, LanguagePicker, Toast, BeforeAfterSlider, ReportSection, …) —
                               import from `@/app/components/roote`; this is the primitive library,
                               not `components/ui`
      marketing/               Section, Prose, Eyebrow, CtaButton, displayScale, and marketing-only pieces
      brand/                   Wordmark, PendingChip
      diagnosis/               PhotoUpload, downscaleImage, questions
      tracking/                GuidedPhotoCapture
      media/                   MediaPlaceholder (labelled, no-fetch image slot)
      report/                  ReportView
      checkout/                CheckoutFields (shared program + bag checkout form)
      funnel/                  funnelStyles
      ui/                      shadcn/ui primitives — mostly unused template baggage; only cn() (utils.ts)
                               is actually imported project-wide
    lib/                       useRevealOnRoute, useReducedMotion, useScrollCondense
  content/
    roote.config.ts            brand + company (entity facts) + formula + programDurations +
                               treatmentRegistry + disclaimers
    catalog.ts                 à-la-carte catalogue view, derived from products.ts (one product
                               source of truth) — do not hand-maintain a second SKU list
    products.ts                the 6 launch SKUs (+ 1 archived concept)
    bundles.ts, programs.ts, solutions.ts, assessment.ts, faqs.ts, legal.ts, magazine.ts, brand.ts
    localized.ts                LocalizedText helpers (L6() etc.)
    pending.ts                  PENDING() / isPending() / collectPending()
  domain/
    analysis/                  deriveAnalysis (pure, deterministic), analyzeHair (orchestrator +
                               fallback), remoteAnalysisAdapter (env-gated, vendor TBD), grayProfile,
                               provider (HairAnalysisProvider seam)
    recommendation/            recommend(), rules, planKeys — never auto-prescribes the top tier
    report/                    buildReport (pure view-model builder), money (Intl currency), types
    tracking/                  checkpoints, schedule, status, metrics, reminders, buildUserProgram —
                               the post-purchase progress-tracking domain model
    program/                   Program / Treatment types
  i18n/                        see Internationalization above
  store/                       sessionStore, auth (mock, non-crypto digest), cart, cartLines,
                               checkout (Order union + submitPayment), orders, program, tracking,
                               persistence (IndexedDB photo blobs), devSeed (DEV only)
  analytics/                   AnalyticsAdapter + normalized events — no vendor wired
  seo/                         ROUTE_META + useDocumentMeta — index.html stays noindex regardless
  pdf/                         reportPdf.ts — jsPDF-based "Download report" renderer (live; do not
                               confuse with the earlier @react-pdf/renderer report, which was removed)
  styles/                      index.css → fonts.css, tailwind.css, theme.css, marketing.css ; tokens.ts
  assets/                      heroes/ concerns/ products/ bundles/ ingredients/ scans/ steps/
                               (figma:asset/<file> imports resolve to src/assets/<file>)
  test/setup.ts                vitest/jsdom polyfills — wired into vite.config.ts even though there
                               are currently no *.test.ts(x) files to run (see Testing & Quality)

docs/
  DESIGN-SPECIFICATION.md      ← deep source of truth; start here for scope/rules/flows
  REQUIREMENTS.md  BUSINESS-RULES.md  USER-FLOWS.md  TECHNICAL-SPECIFICATION.md
  superpowers/                 original phase specs + plans — historical design intent, partially
                               superseded (see "Implementation vs. intent" in DESIGN-SPECIFICATION.md)
```

## State & Persistence

| Store | Key | Notes |
|---|---|---|
| `sessionStore` | `localStorage['roote.session']` | diagnosis, analysis, reportId, account.email, draftDurationDays, program |
| `auth` | `localStorage['roote.accounts' \| 'roote.authSession']` | mock; `digestOf()` is **non-cryptographic** — replace wholesale for real auth |
| `cart` | `localStorage['roote.cart']` | qty clamped 1–20 |
| `LocaleProvider` | `localStorage['roote.locale']` | write-only "last-known locale," read by `resolveLocaleRedirect` on a bare/invalid path |
| `tracking` | `localStorage['roote.tracking']` | post-purchase progress model (checkpoints, photos, scans) |
| `persistence` | IndexedDB `roote`/`blobs` | photo blobs keyed by uuid; thumbnails live in the JSON state |

`import.meta.env.DEV` gates the dev seed on `/program` and the
`localStorage['roote.debug.forceCheckoutFailure'] = '1'` switch (forces both checkout stubs to
throw).

## Environment Variables

| Var | Required | Effect |
|---|---|---|
| `VITE_CV_PROVIDER_API_URL` | no | When set **and** photos exist, `analyzeHair` posts to a remote CV provider via `remoteAnalysisAdapter` (request/response shape is a **guess** — no vendor is under contract; confirm before relying on it) with graceful fallback to the deterministic local model on any failure. Unset → local model only. |
| `VITE_CV_PROVIDER_API_KEY` | no | Optional bearer token for the above. |

## Design & Styling

Light-only in practice (a `.dark` block exists in `theme.css` but nothing toggles it). Tailwind v4
(`@tailwindcss/vite`) — no `tailwind.config`; tokens are CSS custom properties in
`src/styles/theme.css` (shadcn variable names) + an `@theme inline` map, mirrored in
`src/styles/tokens.ts` — **keep the two in sync**.

- **Palette:** cream `#fcf9f3` ground · `#172022` text · deep emerald `#1b4b32` primary CTA /
  `#0a2a1c` ink bands (header, footer, `AppShell` sidebar — anchor, not dominant; body content stays
  on cream) · gold `#c6a15a` accent (non-text / ≥24 px only, logo exempt).
- **Motion:** via `motion`; every effect needs a `prefers-reduced-motion` static fallback
  (`useReducedMotion`).
- **RTL:** always use logical utilities — see [Hard rule #5](#hard-rules).

## Testing & Quality

```bash
pnpm typecheck     # tsc --noEmit (strict) — must be 0 diagnostics
pnpm i18n:check    # message-key parity, all 6 locales
pnpm content:check # content-layer LocalizedText parity, all 6 locales
pnpm lint          # eslint . — configured (eslint.config.js), but not currently clean
pnpm test          # vitest run — currently 0 test files
```

- **`pnpm typecheck`, `pnpm i18n:check`, and `pnpm content:check` are the real, enforced gates** —
  keep all three green.
- **`pnpm lint` is configured but not currently clean** (`eslint.config.js` + ESLint devDependencies
  are present; running it surfaces a small number of real errors/warnings, e.g. unused-expression and
  unused-var lint errors). It's not wired into any script/CI check here, so nothing currently blocks
  on it — but it's real, working tooling, not a stub, and cleaning it up is a reasonable quick win.
- **There is no test suite.** All `*.test.ts(x)` files were deliberately removed; `pnpm test` exits 1
  with "No test files found" by design — don't treat that as a regression to fix. Vitest, Testing
  Library, and `src/test/setup.ts`'s polyfills are still wired into `vite.config.ts` for whenever
  tests come back. There is no automated regression coverage for domain logic or routing — verify
  those by reading the code and exercising the app in a browser.

## Known Limitations

- No backend anywhere: auth, payment, email, photo storage, notifications, support, and CV analysis
  are all typed stubs. See [`docs/TECHNICAL-SPECIFICATION.md`](docs/TECHNICAL-SPECIFICATION.md).
- All pricing and effectiveness/timing claims are `[PENDING]` and must not be invented — see
  [Hard rule #1](#hard-rules).
- `ar`/`ru`/`fr`/`es` are real, first-pass, parity-enforced translations, not yet professionally
  reviewed; `he` legal copy is explicitly flagged "pending formal legal review."
- Program-day math (`programDay`, `isoToday`, `buildProgram`) is **UTC-only** — off-by-one for
  non-UTC users late in their local day. Known; don't "fix" casually.
- Photo-gate inconsistency: the analysis-step guard needs ≥1 photo; `/analysis/photos` requires all
  4 to continue.
- `marketing.nav.blog` is an orphaned i18n key (the `/blog` route was never built) but still counts
  toward the six-locale parity check.
- `lsSet` catches localStorage write failures and warns; there is **no** quota-driven photo eviction.

## Documentation

| Doc | Purpose | Currency note |
|---|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Short "how to work here" brief — commands, hard rules, current architecture, gotchas | Kept current; the most reliable single doc for "what's actually here" |
| [`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md) | **Deep master doc.** Brief, objectives, scope, users, roles, IA, feature inventory, edge cases, acceptance criteria, open questions, an "Implementation vs. intent" delta against the original specs | Predates several later reworks (six-language i18n, account-nav consolidation); has inline "superseded by" callouts in places but not everywhere — cross-check routing/component specifics against `CLAUDE.md` and the live code |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | `FR-*` / `NFR-*` / `US-*` with acceptance criteria | Same caveat as above |
| [`docs/BUSINESS-RULES.md`](docs/BUSINESS-RULES.md) | `BR-*`, each traceable to code | Business/regulatory rules age slower than UI structure — generally reliable |
| [`docs/USER-FLOWS.md`](docs/USER-FLOWS.md) | Flows with Mermaid diagrams | Same caveat as `DESIGN-SPECIFICATION.md` |
| [`docs/TECHNICAL-SPECIFICATION.md`](docs/TECHNICAL-SPECIFICATION.md) | Architecture, stack, data model, integrations, backend seams, risks | Same caveat as `DESIGN-SPECIFICATION.md` |
| `docs/superpowers/specs/*`, `docs/superpowers/plans/*` | Original phase design intent | Historical by design — read via the "Implementation vs. intent" delta table in `DESIGN-SPECIFICATION.md`, not as current fact |

## Open Questions

See [`docs/DESIGN-SPECIFICATION.md` §"Open Questions"](docs/DESIGN-SPECIFICATION.md) for the full,
prioritised list. The standing hard blockers are: program/SKU pricing + shipping + renewal price;
substantiated effectiveness/timing figures (or confirmation they stay out permanently); final
medical/consent/legal copy across all six locales; and the HairHealth.ai API contract for the
optional remote analysis seam.
