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

Hebrew / RTL is the **default** UI; English is a toggle. There is **no backend of any kind** — every
server concern (auth, payment, email, photo storage, notifications, support, CV analysis) is a typed
stub with a `TODO` marker. `index.html` is `noindex, nofollow`. Operating entity: **91 ENTERPRISE LLC**.

The repo began as a Figma Make export ("Design Etsy Shop Branding") and was fully repurposed. Only
the build tooling lineage remains (Vite config, Tailwind v4 setup, the `figma:asset/*` resolver, the
shadcn/ui set under `src/app/components/ui/`).

## Commands

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm build        # vite build -> dist/  (one ~640 kB chunk; the >500 kB warning is expected)
pnpm test         # vitest run  — 52 files / 206 tests, must stay green
pnpm test:watch
pnpm typecheck    # tsc --noEmit (strict) — must stay at 0 diagnostics
```

- pnpm workspace. `pnpm-workspace.yaml` pins `supportedArchitectures` to linux glibc, so a plain
  install can misbehave on Windows; `pnpm add react@18.3.1 react-dom@18.3.1` if `dev`/`build`
  complains about React. `react`/`react-dom` are real `dependencies` now (were optional peers).
- `tsconfig.json` exists (added 2026-09-03) and is `--noEmit` only — esbuild still strips types at
  build. Keep `pnpm typecheck` green.
- **No lint or format tooling exists.** Don't add ESLint/Prettier unless asked (it's a known gap —
  see `docs/TECHNICAL-SPECIFICATION.md` §10 / OQ-TECH-6).

## Hard rules (do not violate)

1. **Never invent product content.** Prices, effectiveness %, time-to-results, testimonials, study
   results, advisory names, press logos, medical/legal copy — if the client hasn't supplied it, it
   stays `null` in `src/content/roote.config.ts` and renders as a `<PendingChip>` → `[PENDING: label]`.
   `src/content/pending.test.ts` fails if a claim/price/stat renders from raw null. This is a
   regulatory constraint, not a style preference.
2. **EN/HE parity.** Every key added to `src/i18n/messages/en.ts` needs the same key in `he.ts`, and
   no value may be `""`. `src/i18n/messages.test.ts` enforces both. Write real Hebrew (first-pass is
   fine); flag legal HE as "pending formal legal review" (the pattern `roote.config.disclaimers` uses).
3. **Domain layer stays pure.** `src/domain/**`, `src/content/pending.ts`, `src/domain/report/money.ts`,
   `src/app/routes/app/programProgress.ts` — no imports of React, the DOM, storage, or the i18n
   *provider*. They take typed inputs and return typed outputs (analysis returns **keys**, not display
   strings). They have isolated unit tests; add to those when you change behaviour.
4. **Renderers consume view-models, not config.** `buildReport()` / `resolvePlanTreatments()` produce
   fully-resolved, already-localized, pending-flagged structures; components render those. Don't reach
   into `roote.config` or call `t()` for domain content inside a report/plan renderer.
5. **RTL-safe styling.** Use Tailwind logical utilities (`ms/me/ps/pe`, `text-start/-end`,
   `start-*/end-*`) — never `ml/mr/left/right` for layout. `LocaleProvider` flips `dir`.

## Architecture

### Render flow

`index.html` → `src/main.tsx` (`createRoot(#root)` + `import "./styles/index.css"`) →
`src/app/App.tsx` → `LocaleProvider` › `AuthProvider` › `SessionProvider` › `CartProvider` ›
`RouterProvider`.

The router is a **module-scoped `createBrowserRouter`** created once at import. Tests drive it by
`window.history.pushState(...)` **plus** `window.dispatchEvent(new PopStateEvent('popstate'))` — a
bare `pushState` won't notify it. `src/app/App.test.tsx` restores history in `afterEach`.

### Routing & shells

| Shell | Routes | Chrome |
|---|---|---|
| `MarketingShell` | `/`, `/how-it-works`, `/science`, `/products`, `/about`, `/faq`, `/support`, `/terms`, `/terms-of-sale`, `/privacy`, `/bag`, `/bag/checkout`, `/bag/success` | Header (condense-on-scroll, "More ▾" dropdown) + Footer + skip-link |
| `FunnelShell` | `/login`; `/diagnosis` + `intro`/`gender`/`photos`/`analyzing`/`ready`; `/start` + `plan`/`checkout`/`success` (`StartLayout` nested) | wordmark (→ `/`) + `LocaleToggle` only |
| *(own inline)* | `/report/:reportId` | wordmark header + disclaimer footer |
| `AppShell` | `/app` (index = Today), `/app/plan`, `/progress`, `/care`, `/rescan`, `/profile` | desktop sidebar / mobile scrollable tabs; guarded by `session.program` + `auth.email` |
| — | `*` → `<Navigate to="/" replace/>` | — |

Guards are plain functions returning a redirect path or `null`:
`src/app/routes/diagnosis/guards.ts` (`redirectForStep`), `src/app/routes/start/guards.ts`
(`redirectForStartStep`). Route components call them and `<Navigate>` on a non-null result.

### Layers & folders (`src/`)

```
content/roote.config.ts   brand + company (entity facts) + formula + programDurations + treatments + disclaimers
        catalog.ts         17-SKU product catalogue (prices are [PENDING])
        pending.ts          PENDING() / isPending() / collectPending()
domain/analysis/           deriveAnalysis (pure, deterministic), analyzeHair (orchestrator + fallback),
                           hairhealthAdapter (env-gated PLACEHOLDER contract), types
       report/             buildReport (pure view-model builder), types, money (Intl currency)
       program/            types (Program, Treatment)
i18n/                      LocaleProvider, interpolate ({var} only), messages/{en,he,index}
store/                     sessionStore (useReducer, localStorage['roote.session']),
                           auth (mock; non-crypto digest), cart (localStorage['roote.cart']),
                           checkout (unified Order union + stub submitPayment), orders (order history,
                           localStorage['roote.orders']), program (buildProgram), persistence, devSeed
app/routes/                marketing/ · bag/ · auth/ · diagnosis/ · start/ · report/ · app/
app/components/            shell/ · marketing/ · brand/ · diagnosis/ · report/ · funnel/ · checkout/(CheckoutFields) · ui/(shadcn, mostly unused)
app/lib/                   useRevealOnRoute, useReducedMotion, useScrollCondense
styles/                    index.css → fonts.css, tailwind.css, theme.css, marketing.css ; tokens.ts (JS mirror of theme.css)
```

### Content pipeline

`roote.config.ts` (facts, `as const`, `null` = unsupplied) + `i18n/messages/{en,he}` (copy) →
`deriveAnalysis` → `buildReport` / `resolvePlanTreatments` → resolved localized pending-flagged
view-models → dumb renderers. `collectPending(model)` enumerates every unresolved slot.

### State & persistence

Four context providers, each initialised from and written back to storage:

| Store | Key | Notes |
|---|---|---|
| `sessionStore` | `localStorage['roote.session']` | whole `SessionState` (diagnosis, analysis, reportId, account.email, draftDurationDays, program) |
| `auth` | `localStorage['roote.accounts' | 'roote.authSession']` | mock; `digestOf()` is **non-cryptographic** — replace wholesale for real auth |
| `cart` | `localStorage['roote.cart']` | qty clamped 1–20 |
| `LocaleProvider` | `localStorage['roote.locale']` | default `'he'`; sets `<html lang dir>` + `document.title` |
| `persistence` | IndexedDB `roote`/`blobs` | photo blobs keyed by uuid; thumbnails (data URLs) live in the JSON state |

`import.meta.env.DEV` gates the dev seed on `/start` and the
`localStorage['roote.debug.forceCheckoutFailure'] = '1'` switch (forces both checkout stubs to throw).

### Analysis engine

`deriveAnalysis({gender, answers})` — pure, deterministic. Male → Norwood, female → Ludwig;
severity from onset; `recommendedDurationDays` from `RECOMMENDED_DURATION_TABLE[severity:emphasis]`
(90 is user-selectable but never AI-recommended). Full rule table: `docs/BUSINESS-RULES.md` §1.
`analyzeHair` calls hairhealth.ai only when `VITE_HAIRHEALTH_API_URL` is set **and** photos exist,
falling back to the local model on any failure. `hairhealthAdapter`'s request/response shape is a
**guess** — confirm before relying on it.

### Styling

`src/styles/index.css` imports (in order) `fonts.css`, `tailwind.css`, `theme.css`, `marketing.css`.
Tailwind **v4** (`@tailwindcss/vite`) — no `tailwind.config`, `postcss.config.mjs` is intentionally
empty. Tokens are CSS custom properties in `theme.css` (shadcn variable names) + an `@theme inline`
map; **keep `src/styles/tokens.ts` in sync** (`tokens.test.ts` checks it). Light-only in practice —
the `.dark` block exists but nothing toggles it. Palette: ivory `#f9f6ef` ground, `#2a2320` text,
`#745f50` primary CTA, brass `#a97b45` accent (non-text / ≥24 px only), `#201812` ink bands. Motion
via `motion`; every effect needs a `prefers-reduced-motion` static fallback (`useReducedMotion`).

## Gotchas

- **`figma:asset/<file>`** imports resolve to `src/assets/<file>` (custom `vite.config.ts` plugin).
  `@` → `src/` in both `vite.config.ts` and `tsconfig.json` `paths` — keep them aligned.
- `assetsInclude` covers `.svg`/`.csv` only — never add `.css`/`.ts`/`.tsx`.
- Program-day math (`programDay`, `isoToday`, `buildProgram`) is **UTC-only** → off-by-one for
  non-UTC users late in their local day. Known; don't "fix" casually.
- `lsSet` catches write failures and warns; there is **no** quota-driven photo eviction.
- **Orphaned i18n keys:** `landing.*` (~60) and `marketing.blog.*` have no runtime consumer (the
  `Landing` route and `/blog`/`/results` were superseded / not built). They still count toward parity.
- The **PDF report was built then removed** (`src/pdf/*`, `@react-pdf/renderer` gone). `ReportView`
  is web-only. `src/app/routes/report/ReportEmailPreview.tsx` exists but is **not routed**.
- **One checkout, two order kinds.** `store/checkout.ts` has a single `Order` discriminated union
  (`{ kind: 'program' | 'bag', … }`), one `submitPayment(order)` (id prefixed `ord-`/`bag-` from
  `kind`), and both `/start/checkout` and `/bag/checkout` render the shared
  `app/components/checkout/CheckoutFields.tsx` (contact + card form + shape validation). Successful
  orders are appended to `store/orders.ts` history and shown on `/app/profile`. The bag is a **kept,
  secondary "refills & add-ons" surface** (OQ-BIZ-7 direction, 2026-09-03) — discoverable via a cart
  icon + badge in the marketing `Header` and a "Shop products" link in the `/app` sidebar. Keep the
  single checkout machinery; don't fork it again.
- **Card data:** `CheckoutFields` builds `card` as `{ last4, expiry }` only — the full number and CVC
  must never enter the `Order`, be logged, or be stored.
- `/app/*` has no dev seed that mints a `Program`, so in DEV it's only reachable by completing
  `/start/checkout` (or hand-seeding `session.program`).
- Photo gate inconsistency: `redirectForStep` needs ≥1 photo, `/diagnosis/photos` requires all 4 to
  continue.
- `src/app/components/ui/` (shadcn) + many `package.json` deps (MUI, full Radix set, `recharts`,
  `canvas-confetti`, `react-hook-form`, `lucide-react`, …) are **unused** template baggage.

## Other notes

- `guidelines/Guidelines.md` is the untouched Figma Make placeholder — ignore it.
- `main` == `origin/main` == `09f68e4` (pushed 2026-09-03); working tree starts clean. Commit/push
  only when the user asks.
- `docs/superpowers/specs/*` + `plans/*` are the original phase design intent; parts are superseded —
  the "Implementation vs. intent" table in `docs/DESIGN-SPECIFICATION.md` lists the deltas.
