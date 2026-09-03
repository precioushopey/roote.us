# ROOTÉ.US — Technical Specification

Companion to [`DESIGN-SPECIFICATION.md`](./DESIGN-SPECIFICATION.md). Describes the architecture, stack, data model, and the backend seams a development team must implement. Reflects the repository at 2026-09-03.

---

## 1. Architecture overview

**Type:** single-page React application, **100% client-side**. No server, no SSR, no API of its own. All persistence is the visitor's browser (`localStorage` + IndexedDB). One optional outbound integration (hairhealth.ai), env-gated and off by default.

```
index.html  (lang="he" dir="rtl", noindex)
  └─ src/main.tsx  → createRoot(#root).render(<App/>) + import "./styles/index.css"
       └─ src/app/App.tsx
            LocaleProvider
              AuthProvider
                SessionProvider
                  CartProvider
                    RouterProvider(router)      // module-scoped createBrowserRouter

router
├─ marketingRoutes         → <MarketingShell> (Header + Outlet + Footer)
├─ <FunnelShell> layout    → /login, /diagnosis/*, /start/* (StartLayout nested)
├─ /report/:reportId       → <ReportPage> (own inline header/footer)
├─ /app  → <AppShell>      → index=Today, plan, progress, care, rescan, profile
└─ *  → <Navigate to="/" replace/>
```

### 1.1 Layering

| Layer | Location | Rule |
|---|---|---|
| **Domain (pure)** | `src/domain/**`, `src/content/pending.ts`, `src/app/routes/app/programProgress.ts`, `src/domain/report/money.ts` | No imports of React, DOM, storage, or i18n *provider*. Reads i18n **dictionaries as data** (`buildReport`) but never a React hook. Deterministic; unit-tested in isolation. |
| **Content config** | `src/content/roote.config.ts`, `src/content/catalog.ts` | Single source of truth for brand/entity facts, formula, durations, treatments, disclaimers, product catalogue. Unsupplied values are literal `null`. |
| **i18n** | `src/i18n/**` | Typed `MessageKey` union (`keyof typeof en`); `he.ts` is `Record<MessageKey, string>`; parity + non-empty enforced by test. `t(key, vars?)` with `{var}` interpolation only. Provider sets `<html lang dir>`. |
| **State (stores)** | `src/store/**` | React context providers over `useReducer`/`useState`, each persisted via `persistence.ts`. Components never touch `localStorage`/IndexedDB directly. |
| **Routing / shells** | `src/app/App.tsx`, `src/app/routes/**`, `src/app/components/shell/**` | react-router 7 data router. Route components read stores via hooks, call domain functions, render view-models. Guards are plain functions returning a redirect path or `null`. |
| **Presentation** | `src/app/components/**` | Prop-driven, i18n-agnostic where practical (receive resolved strings/keys). Consume view-models (`ReportModel`, resolved treatment lists), not raw config. |
| **Styling** | `src/styles/**` | Tailwind v4 via `@tailwindcss/vite`; tokens as CSS custom properties in `theme.css` (+ `@theme inline` map) mirrored in `tokens.ts`. `marketing.css` for bespoke treatments. |

### 1.2 Data flow (report example)

```
diagnosis answers ──▶ deriveAnalysis() ──▶ HairAnalysis (keys)
                                              │
roote.config + i18n(en/he) ───────────────────┤
                                              ▼
                                   buildReport({...}) ──▶ ReportModel (resolved, localized, pending-flagged)
                                              ▼
                                   <ReportView model={...}>   (dumb renderer)
```

The load-bearing boundary: **all content + localisation collapse into typed view-models before any renderer runs**, so "everything from config, nothing invented" is enforced in one place.

---

## 2. Technology stack

| Concern | Choice | Version | Notes |
|---|---|---|---|
| UI library | React + ReactDOM | 18.3.1 (exact) | Now real `dependencies` (were optional peers historically). |
| Routing | `react-router` | 7.13.0 (exact) | `createBrowserRouter` data router, created once at module scope in `App.tsx`. Tests fire `popstate` to drive it. |
| Build / dev server | Vite | 6.3.5 (exact, pinned in `pnpm.overrides`) | Custom `figmaAssetResolver` plugin; `@` → `src/`; `assetsInclude: ['**/*.svg','**/*.csv']`. |
| Styling | Tailwind CSS v4 | 4.1.12 | `@tailwindcss/vite` plugin. **No `tailwind.config`**. `postcss.config.mjs` intentionally empty. `@import 'tailwindcss' source(none)` + explicit `@source '../**/*.{js,ts,jsx,tsx}'` in `tailwind.css`. |
| Animation | `motion` | 12.23.24 | `motion/react`. Reduced-motion fallbacks required. |
| Types | TypeScript | 5.7.3 (`~`) | **`--noEmit` only.** esbuild strips types at build (`@vitejs/plugin-react`). `tsconfig.json` added 2026-09-03 (strict, `moduleResolution: bundler`, `paths` mirror of the Vite alias). |
| Test runner | Vitest | ^3.2.7 | jsdom env, globals on, `setupFiles: ['./src/test/setup.ts']`, `.worktrees/`/`node_modules/`/`dist/` excluded. |
| Test libs | @testing-library/{react,dom,jest-dom,user-event}, jsdom, fake-indexeddb | — | `setup.ts` polyfills `matchMedia`, `URL.createObjectURL`, `Blob.arrayBuffer/text`, `scrollTo`, and a `Request` shim for react-router. |
| Package manager | pnpm workspace | v10.x | `pnpm-workspace.yaml` pins `supportedArchitectures` to linux x64/arm64 glibc — can complicate install on Windows. |
| Fonts | Google Fonts `@import` | — | `src/styles/fonts.css`: Playfair Display, Frank Ruhl Libre, Montserrat, Heebo, Libre Franklin. |
| Lint / format | **none** | — | No ESLint / Prettier config or script. `CLAUDE.md` says not to add tooling unless asked. Recommended: add ESLint + `lint` script (OQ-TECH-6). |

### 2.1 Scripts (`package.json`)

```
pnpm dev         # vite
pnpm build       # vite build → dist/
pnpm test        # vitest run   (52 files / 206 tests)
pnpm test:watch  # vitest
pnpm typecheck   # tsc --noEmit  (0 diagnostics; added 2026-09-03)
```

### 2.2 Dependencies of note

- **Used by app code:** `react`, `react-dom`, `react-router`, `motion` (`motion/react` — only `AnalyzingStep.tsx` + the marketing motion pass), `clsx` + `tailwind-merge` (via `cn()` in `ui/utils.ts`).
- **Shipped but not referenced by `src/`** (verified by grep): `canvas-confetti`, the full `@radix-ui/*` set, `@mui/*`, `@emotion/*`, `recharts`, `react-hook-form`, `lucide-react`, `cmdk`, `embla-carousel-react`, `react-day-picker`, `sonner`, `vaul`, `react-dnd*`, `input-otp`, `next-themes`, `react-slick`, `react-resizable-panels`, `react-responsive-masonry`, `class-variance-authority`, `tw-animate-css`, `@popperjs/core`, `react-popper`, `date-fns`. These arrived with the Figma Make template and/or the shadcn/ui set in `src/app/components/ui/`. Safe to prune once confirmed unreferenced by the `ui/` set too (out of scope here).
- **Removed on the current working tree** (vs `origin/main`): `@react-pdf/renderer`, `@expo-google-fonts/heebo`, `@expo-google-fonts/libre-franklin` (PDF report cut). `@types/node`, `@types/react`, `@types/react-dom`, `typescript` added.

### 2.3 Environment variables

`.env.example`:
```
VITE_HAIRHEALTH_API_URL=      # unset → local questionnaire analysis model
VITE_HAIRHEALTH_API_KEY=      # optional Bearer token for the above
```
No other env vars. `import.meta.env.DEV` gates all dev seed/debug affordances.

### 2.4 Figma Make integration points (must not break)

- `vite.config.ts` `figmaAssetResolver`: `import x from 'figma:asset/<file>'` → `src/assets/<file>`.
- `@` alias → `src/` (Vite `resolve.alias` **and** `tsconfig.json` `paths`).
- `assetsInclude` covers `.svg` / `.csv` (never add `.css`/`.ts`/`.tsx`).
- React + Tailwind Vite plugins both required even if a given file doesn't use them.
- `src/app/components/ui/` holds the shadcn/ui set with `cn()` in `ui/utils.ts` (imported as `./utils`, not `@/lib/utils`) and `useIsMobile()` in `ui/use-mobile.ts`.

---

## 3. Routing map

| Path | Component | Shell | Guard |
|---|---|---|---|
| `/` | `Home` | Marketing | — |
| `/how-it-works` | `HowItWorks` | Marketing | — |
| `/science` | `Science` | Marketing | — |
| `/products` | `Products` | Marketing | — |
| `/about` | `About` | Marketing | — |
| `/faq` | `Faq` | Marketing | — |
| `/support` | `Support` | Marketing | — |
| `/terms` | `Terms` | Marketing | — |
| `/terms-of-sale` | `TermsOfSale` | Marketing | — |
| `/privacy` | `Privacy` | Marketing | — |
| `/bag` | `BagPage` | Marketing | — |
| `/bag/checkout` | `BagCheckout` | Marketing | non-empty cart (else → `/bag`) |
| `/bag/success` | `BagSuccess` | Marketing | `location.state.orderId` (else → `/products`) |
| `/login` | `LoginPage` | Funnel | — |
| `/diagnosis` (index) · `/diagnosis/intro` | `IntroStep` | Funnel | — |
| `/diagnosis/gender` | `GenderStep` | Funnel | — |
| `/diagnosis/photos` | `PhotosStep` | Funnel | gender set (else → `/diagnosis/gender`) |
| `/diagnosis/analyzing` | `AnalyzingStep` | Funnel | gender + ≥1 photo |
| `/diagnosis/ready` | `ReadyStep` | Funnel | analysis present |
| `/start` (index) | `AccountStep` | Funnel / StartLayout | resolvable report; signed-in → `/start/plan` |
| `/start/plan` | `PlanStep` | " | signed in; no program (else → `/start/success`) |
| `/start/checkout` | `CheckoutStep` | " | signed in; `draftDurationDays` set; no program |
| `/start/success` | `SuccessStep` | " | signed in; program present (else → `/start`) |
| `/report/:reportId` | `ReportPage` | own | `reportId === session.reportId` && analysis (else `ReportNotFound`) |
| `/app` (index) | `AppToday` | App | program + auth.email |
| `/app/plan` | `AppPlan` | App | " |
| `/app/progress` | `AppProgress` | App | " |
| `/app/care` | `AppCare` | App | " |
| `/app/rescan` | `AppRescan` | App | " |
| `/app/profile` | `AppProfile` | App | " |
| `*` | `<Navigate to="/" replace/>` | — | — |

**Not routed:** `ReportEmailPreview` (component only). **Not built:** `/results`, `/blog`, `/blog/:slug`, `/app/reminders`.

---

## 4. State management

Four React context providers, nested in `App.tsx` (order: Locale → Auth → Session → Cart). Each initialises from storage and writes back on change.

### 4.1 `LocaleProvider` (`src/i18n/LocaleProvider.tsx`)
- State: `locale: 'he' | 'en'` (default `'he'`), derived `dir`.
- Storage: `localStorage['roote.locale']`.
- Side effects: sets `document.documentElement.lang` / `dir`, `document.title`.
- API: `useLocale() → {locale, dir, setLocale}`, `useT() → t(key, vars?)`.

### 4.2 `AuthProvider` (`src/store/auth.tsx`) — mock
- State: `session: {email, since} | null` (from `localStorage['roote.authSession']`).
- Accounts: `localStorage['roote.accounts']` → `Record<email, {email, digest}>`.
- API: `email`, `since`, `signUp`, `signIn`, `signOut`, `changePassword`.
- Result unions: `signUp → ok | invalid-email | weak-password | duplicate-email`; `signIn → ok | not-found | wrong-password`; `changePassword → ok | not-signed-in | wrong-password | weak-password`.
- **`digestOf` is non-cryptographic.** Replace wholesale (BE-2).

### 4.3 `SessionProvider` (`src/store/sessionStore.tsx`) — `useReducer`
- Storage: `localStorage['roote.session']` (whole `SessionState`, rewritten on every change).
- `SessionState`:
  ```ts
  {
    diagnosis: { gender: 'male'|'female'|null; photos: PhotoRef[]; answers: Partial<Answers> },
    analysis: HairAnalysis | null,
    reportId: string | null,
    account: { email: string | null },
    draftDurationDays: 90|120|180|270|360 | null,
    program: Program | null,
  }
  ```
- `PhotoRef = { id, angleKey: 'front'|'top'|'crown'|'hairline', thumb: string /*data URL*/, blobId: string }`
- Actions: `SET_GENDER`, `ADD_PHOTO` (de-dupes by angle), `REMOVE_PHOTO`, `SET_ANSWER`, `SET_ANALYSIS`, `SET_REPORT_ID`, `SET_EMAIL`, `SET_DRAFT_DURATION`, `SET_PROGRAM`, `TOGGLE_PROGRAM_TASK`, `ADD_PROGRAM_PHOTO`, `SET_PROGRAM_REMINDERS`, `RESET`, `HYDRATE`.

### 4.4 `CartProvider` (`src/store/cart.tsx`) — `useReducer`
- Storage: `localStorage['roote.cart']` → `{ lines: {sku, qty}[] }`.
- Actions: `ADD` (+1, clamp), `SET_QTY` (≤0 removes; else clamp 1–20), `REMOVE`, `CLEAR`.
- Derived: `count` = Σ quantities.

### 4.5 `persistence.ts`
- `lsGet<T>(key, fallback)` / `lsSet(key, value)` / `lsRemove(key)` — `roote.` prefixed, JSON, try/catch (write failure warns, doesn't throw).
- IndexedDB: DB `roote` v1, store `blobs`. `putBlob(id, Blob)` stores `{buffer: ArrayBuffer, type}`; `getBlob(id) → Blob | undefined`; `deleteBlob(id)`.
- **No cross-tab or cross-device sync. No quota-driven eviction** (spec'd, not built).

---

## 5. Data model (entities)

### 5.1 `Answers` (`src/domain/analysis/types.ts`)
```ts
{
  q1_area: 'hairline' | 'crown' | 'entire-scalp',
  q2_onset: 'lt-1y' | '1-5y' | 'gt-5y',
  q3_prior: 'never' | 'no-success' | 'partial',
  q4_family: 'yes' | 'no' | 'not-sure',
  q5_goal: 'stop' | 'regrow' | 'both',
}
```
Required to complete the funnel: all 5. Stored as `Partial<Answers>` during the flow.

### 5.2 `HairAnalysis`
```ts
{
  scale: 'norwood' | 'ludwig',
  stage: number,                       // norwood 2–6, ludwig 1–3 (clamped)
  severityBand: 'mild' | 'moderate' | 'established',
  flaggedZones: { zone: ZoneKey; severity: 'mild'|'moderate'; noteKey: string }[],
  densityByZone: { zone: ZoneKey; level: 'low'|'medium'|'high' }[],   // all 4 zones
  metrics: { key: string; level: 'low'|'medium'|'high' }[],           // 4 fixed metrics
  notes: string[],                     // note keys (prior-treatment + family-history)
  planEmphasis: 'stabilize' | 'regrow' | 'stabilize-regrow',
  summaryPlainKey: string,             // 'summary.<scale>.<severityBand>'
  recommendedDurationDays: 90|120|180|270|360,
}
ZoneKey = 'frontal-hairline' | 'temples' | 'mid-scalp' | 'crown-vertex'
```
Output of `deriveAnalysis` (keys only — no display strings). Frozen into `Program.analysisSnapshot`.

### 5.3 `ReportModel` (`src/domain/report/types.ts`)
Fully-resolved, already-localized view-model built by `buildReport`. Never persisted. Key sub-shapes:
```ts
{
  meta: { reportId, generatedAt: ISO, locale, dir, scaleLine, demoDisclaimer: Resolved<string> },
  titles: { header, cover, scan, photos, analysis, hairLossType, currentSituation, plan, duration, program, pricing, claims },
  ribbon: string,
  intro: { greeting, body },
  photos: { angleKey, dataUrl, caption }[],
  analysis: { scaleLabel, scaleStrip:{stageKey,label,isCurrent}[], flagged:{zoneLabel,severityLabel,note}[], densityMap:{zoneLabel,level,levelLabel}[], metrics:{label,valueLabel,level}[] },
  hairLossType: { title, areaLabels: string[], patternNote },
  currentSituation: { paragraphs: string[] },
  plan: { matchedToScanBadge: string, labels:{core,supporting,applicationFrequency,appliesTo},
          core:{name:Resolved<string>,usage,frequency,appliesToLabels:string[]}[],
          supporting:{name:Resolved<string>,usage,frequency}[],
          formula:{ingredients:{name,percentage?,roleLabel}[],statusLabel:Resolved<string>} | null },
  regimen: { badge, title, items: ReportRegimenItem[] },
  actives: { title, note, items: ReportActive[] },
  expect:  { title, intro, stats:{label,value:Resolved<string>}[], note, timeline:{label,outcome:PendingMarker}[] },
  faq: { title, items:{q,a}[] },
  recommendedDuration: { days, label, rationaleNote },
  pricing: { duration:{days,label}, price: Money|PendingMarker, perDay: Money|PendingMarker, perDayLabel,
             compareTitle, recommendedBadge, compareAll:{days,label,price:Money|PendingMarker,isRecommended}[] },
  claims: { key: 'effectiveness'|'timeToVisibleResults'|'doctorFollowUpCost', label, valueLabel: string|PendingMarker }[],
  cta: { label, href: '/start?report=<id>' },
  disclaimers: { medical, notADiagnosis, demo, formulaPending } as Resolved<string>,
  pending: PendingItem[],   // collectPending(model)
}
Resolved<T> = T | PendingMarker
PendingMarker = { __pending: true, label: string }
Money = { amount: number, currency: string, formatted: string }
```

### 5.4 `Program` (`src/domain/program/types.ts`)
```ts
{
  orderId: string,
  reportId: string,
  analysisSnapshot: HairAnalysis,       // frozen
  durationDays: 90|120|180|270|360,
  startDate: string,                    // YYYY-MM-DD (UTC)
  endDate: string,                      // startDate + durationDays
  plan: { core: Treatment[], supporting: SupportingTreatment[] },   // frozen from ReportModel.plan
  completionLog: Record<string /*isoDate*/, string[] /*taskKey: 'core:N'|'support:N'*/>,
  progressPhotos: { id, isoDate, angleKey, blobId, thumb }[],
  reminders: { taskKey: string, times: string[] /*HH:mm*/, enabled: boolean }[],   // wired, unused
}
Treatment          = ReportModel['plan']['core'][number]        // has appliesToLabels
SupportingTreatment = ReportModel['plan']['supporting'][number] // no appliesToLabels
```
Created by `buildProgram` on checkout success. Lives inside `SessionState.program`.

### 5.5 `roote.config.ts` (`rooteContent`)
`brand`, **`company`** (legalName, representative, address[], registrationNumber, ein, incorporated, legalUpdated, support{email,phone,phoneHref}), `currency` (`'ILS'`), `formula` (status + 4 ingredients, `displayPercentagesPublicly:false`), `treatments` (1 core + 2 supporting; HE names flagged), `programDurations` (5 rows, all `price:null`, `perDayFrom:null`), `claims` (4, all `value:null`), `recommendedDurationTable`, `reorderLeadDays:21`, `disclaimers` (4 `LocalizedText`, HE pending legal review). `as const`.

### 5.6 `catalog.ts` (`CATALOG`)
5 categories (`growth`, `wash`, `supplements`, `lashBrow`, `shower`) / 17 `CatalogProduct { sku, name, descKey: MessageKey, photo }`. `findProduct(sku)` lookup. No prices (rendered `[PENDING]`).

### 5.7 `Order` (transient) + `OrderRecord` (persisted history)
`src/store/checkout.ts` — one discriminated union covering both purchase flows:
```ts
Contact = { name, email, phone, country, city, postal }
CardRef = { last4, expiry }                       // full number + CVC never enter this
ProgramOrder = { kind: 'program'; reportId; durationDays: number; contact: Contact; card: CardRef }
BagOrder     = { kind: 'bag'; lines: CartLine[]; contact: Contact; card: CardRef }
Order        = ProgramOrder | BagOrder
```
`submitPayment(order: Order)` is the single stub for both; `orderId` is prefixed `ord-` (program) or
`bag-` (bag) from `order.kind`. The `Order` itself is built at submit and discarded.

`src/store/orders.ts` — lightweight order history (no React): `recordOrder(rec)` / `readOrders()`.
```ts
OrderRecord = { id: string; kind: 'program' | 'bag'; at: string /*ISO*/; label: string }
```
Written once right after a successful payment (by both checkout routes); rendered as "Recent orders"
on `/app/profile`. Capped at 20, newest first.

### 5.8 Storage key inventory

| Key | Store | Shape |
|---|---|---|
| `localStorage['roote.session']` | sessionStore | `SessionState` |
| `localStorage['roote.accounts']` | auth | `Record<email,{email,digest}>` |
| `localStorage['roote.authSession']` | auth | `{email, since} | null` |
| `localStorage['roote.cart']` | cart | `{lines:{sku,qty}[]}` |
| `localStorage['roote.orders']` | orders | `OrderRecord[]` (max 20, newest first) |
| `localStorage['roote.locale']` | LocaleProvider | `'he' | 'en'` |
| `localStorage['roote.debug.forceCheckoutFailure']` | dev switch | `'1'` |
| IndexedDB `roote` / `blobs` | persistence | `{buffer:ArrayBuffer,type:string}` keyed by uuid |

---

## 6. Integrations

| Integration | Status | Details |
|---|---|---|
| **hairhealth.ai** | Optional, env-gated, placeholder | `isHairhealthConfigured()` = `VITE_HAIRHEALTH_API_URL` non-empty. `requestHairhealthAnalysis`: `POST ${URL}/v1/analyze`, `multipart/form-data` with `gender`, `questionnaire` (JSON string), `photo_<angle>` files; optional `Authorization: Bearer ${VITE_HAIRHEALTH_API_KEY}`. Expected JSON: `{norwood_stage?, ludwig_stage?, severity?, affected_regions?, density_by_region?}`. **Field names, endpoint, auth, and vocabulary are guesses** — confirm against real docs (OQ-TECH-1). `mapResponse` overlays onto the local model (BR-AN-11). |
| **Google Fonts** | Live | `@import` in `src/styles/fonts.css`. |
| Payment / orders | None (stub) | `store/checkout.ts` — one `submitPayment(order: Order)` for both the program and bag flows. |
| Email | None (stub) | `TODO: email backend` at `/diagnosis/ready`. |
| Auth provider | None (mock) | `store/auth.tsx`. |
| Storage / CDN | None | photos in IndexedDB only. |
| Notifications | None (stub) | `/app` reminders card. |
| Analytics | None | — |
| Support desk | None (stub) | `/support` form, `/app/care` compose. |
| CMS | None | copy in `i18n/messages/*`, facts in `roote.config.ts`, catalogue in `catalog.ts`. |

---

## 7. Backend requirements (Not Yet Implemented)

Each capability has a UI that already "talks to" a typed stub. A development team should replace the stub, keeping the same call signature where possible.

### BE-1 — Hair analysis service
- **Consumer:** `src/domain/analysis/analyzeHair.ts` → `hairhealthAdapter.requestHairhealthAnalysis`.
- **Contract (to confirm):** `POST /v1/analyze` multipart (`gender`, `questionnaire` JSON, `photo_front|top|crown|hairline`), Bearer auth. Response should map to `HairAnalysis` fields (`scale/stage/severityBand/flaggedZones/densityByZone/metrics`). Currently only `stage` + `severityBand` are overlaid; expand `mapResponse` once the real schema is known.
- **Failure mode:** must degrade to `deriveAnalysis` (already implemented) — do not block the funnel.
- **Auth/keys:** `VITE_HAIRHEALTH_API_KEY`. Do not log photos or PII.

### BE-2 — Customer accounts & sessions
- **Consumer:** `src/store/auth.tsx` (`signUp`, `signIn`, `signOut`, `changePassword`).
- **Replace:** the `localStorage` accounts map + non-crypto digest with a real IdP (prior TODO names Shopify customer accounts / Supabase / Clerk). Keep the result-union shapes so callers/errors don't change.
- **Add:** password reset, email verification, real session tokens, "sign in instead" already exists in the UI.

### BE-3 — Transactional email
- **Consumer:** `/diagnosis/ready` submit (`ReadyStep.tsx` — `TODO: email backend`).
- **Send:** the report link (`/report/:id`) and, if reinstated, a PDF. The same `ReportModel` can feed a server-side template. Also order confirmations, care-team replies.
- **Consent:** the consent line at email capture is `TODO: confirm with client` (OQ-LEG-1).

### BE-4 — Checkout & orders (one integration, two order kinds)
- **Consumer:** `src/store/checkout.ts` `submitPayment(order: Order)` where `Order = ProgramOrder | BagOrder` (`TODO: Marwell — wire to Shopify/payment backend`). Both `/start/checkout` and `/bag/checkout` call it through the shared `CheckoutFields` form. *(Consolidated 2026-09-03 — was two separate stubs `submitPayment` + `submitBagOrder`; `bagCheckout.ts` is gone.)*
- **Do:** one real payment intent / Shopify Checkout call; branch on `order.kind` server-side only where the fulfilment differs (a `program` order also mints a `Program` client-side via `buildProgram`; a `bag` order ships catalogue SKUs). Return `{status, orderId}`.
- **Also:** persist an order record server-side (the client currently keeps a local `OrderRecord[]` history shown on `/app/profile` — see §5.7).
- **Never:** accept a full card number / CVC in the payload — the client only sends `last4` + `expiry` and expects the processor's own tokenisation.
- **Product decision still open (OQ-BIZ-7):** whether the à-la-carte bag is a real go-to-market motion. Either way, keep the single checkout path — do not re-fork it.

### BE-6 — Photo upload & storage
- **Consumer:** `PhotoUpload.tsx` (currently `putBlob` to IndexedDB).
- **Do:** presigned upload to object storage; store references on the analysis/program record; serve via CDN. Keep the client-side downscale.
- **Privacy:** scalp photos are sensitive personal data — encryption at rest, retention policy, deletion on request (ties to BE-2 + OQ-LEG-2).

### BE-7 — Reminder / notification scheduling
- **Consumer:** `/app` reminders card; `Program.reminders` (`{taskKey, times, enabled}`) is wired but unused.
- **Do:** per-task schedules → push / email / SMS at treatment times. Build the time-picker UI (route + data shape already designed).

### BE-8 — Support / care-team messaging
- **Consumers:** `/support` `ContactForm`; `/app/care` compose.
- **Do:** ticket creation + a real two-way thread in `/app/care` (currently one-directional canned `CARE_MESSAGES` + a stub compose).

### BE-9 — Re-scan analysis & Before/After
- **Consumer:** `/app/rescan` (currently just links back to `/diagnosis`).
- **Do:** run a fresh analysis (BE-1) and compute a coherent delta vs `Program.analysisSnapshot` (stage strip, density map, metric bars, flagged-zone deltas, per-angle photo compare). The prior spec's `deriveRescan` pure function was never built.

### BE-10 — Catalogue, pricing & inventory
- **Consumer:** `catalog.ts` (static), `roote.config.programDurations` (`price:null`).
- **Do:** a product/price service (Shopify or similar); real prices unblock every `[PENDING]` money chip (BR-PD-02). Provide per-duration program prices, per-day figures, renewal price, shipping.

### BE-11 — Locale default by geo-IP
- **Consumer:** `LocaleProvider` (toggle + `localStorage` only; `TODO: IP geolocation default (backend)`).
- **Do:** server/edge geo lookup → initial `he`/`en`; keep the manual toggle authoritative afterwards.

### BE-12 — Content / claims governance
- **Consumer:** `roote.config.ts` `null`s → `[PENDING]`.
- **Do:** supply client-approved, legally-cleared values for: 5 program prices + per-day + renewal + shipping; effectiveness %, time-to-visible-results, re-scan window, doctor-follow-up cost; supporting-treatment identities; final disclaimer wording (EN + HE); currency. **The development team must not invent these** (brief §5).

---

## 8. Testing

- **Runner:** Vitest 3, jsdom, `src/test/setup.ts` polyfills. **52 files / 206 tests, all passing.** `pnpm test`.
- **Pure/unit:** `deriveAnalysis` (table-driven over input combos, key resolution in both locales), `buildReport` (golden `ReportModel`s per persona; pending assertions), `buildProgram` (freezing, endDate math, no snapshot mutation), `programProgress` (day/remaining/reorder/adherence/dailyTasks), `collectPending`/`pending`, `money`, `interpolate`, `auth`, `checkout`/cart stubs, `sessionStore`, `persistence`, `devSeed`, `tokens` (mirror check), `messages` (parity + non-empty), `analysisKeys`, `styles/tokens`.
- **Component/render:** marketing routes (H1 + skip-link + CTA), bag routes (empty/guard/redirect), start steps + guards, diagnosis steps + guards, report page (+ not-found), report view, `ReportEmailPreview`, shells (Header/Footer/MarketingShell/FunnelShell), `Section`/`DisplayHeading`/`CtaBand`, `PhotoUpload`/`QuestionCard`/`AnalyzingStrip`, `App` (mounts `/`, and `/start` sign-up → plan).
- **Motion:** `useReducedMotion` test asserts static fallback.
- **Type gate:** `pnpm typecheck` → `tsc --noEmit`, strict, 0 diagnostics.
- **Gaps:** no lint; no e2e/browser tests; some `/app/*` routes only covered transitively; no visual regression.

---

## 9. Build & deployment

- `pnpm build` → static `dist/` (Vite). Single JS chunk ~640 kB (gzip ~188 kB) → Vite chunk-size warning. Route-level code-splitting is a documented option, not done (NFR-001).
- No deployment config in the repo (`Dockerfile`, `netlify.toml`, `vercel.json`, CI workflow — **none present**). `TBD` deployment target.
- `.gitignore`: `node_modules/`, `dist/`, `.vite/`, `coverage/`, `*.log`, `.superpowers/`, `.worktrees/`, OS cruft.
- Git: remote `github.com/precioushopey/roote.us`; branches `main` (== `origin/main` `64a94ae`), `roote/p0-p1`, `roote/p2b` (worktree), `roote/website` (worktree). **The working tree on `main` carries a large uncommitted change set** (~60 modified, 7 deleted, 32 untracked) — confirm the intended branch/commit strategy before resuming development (OQ-TECH-7).

---

## 10. Technical risks / debt

| Item | Impact | Ref |
|---|---|---|
| Large uncommitted tree on `main` | Unclear starting point for new work | OQ-TECH-7 |
| No lint/format tooling | Style drift; some classes of bug uncaught | OQ-TECH-6 |
| hairhealth.ai contract is a guess | Integration will need rework | OQ-TECH-1 |
| Single large JS bundle | First-load weight | NFR-001 |
| UTC-only date math | Off-by-one program day for non-UTC users | BR-PR-12 |
| No `localStorage` quota eviction | Photo-heavy sessions can silently fail to persist | BR-MD-05 |
| Orphaned i18n keys (`landing.*`, `marketing.blog.*`) | Dead weight; parity noise | OQ-TECH-5 |
| PDF report removed | If unintentional, P2a work is lost | OQ-TECH-8 |
| `favicon.png` ~590 KB | Heavy tab icon | OQ-DES-2 |
| `.dark` tokens with no toggle | Latent, untested code path | OQ-DES-3 |
| Whether the à-la-carte bag (`/bag`) is a real go-to-market motion | Product-scope question (the checkout code itself is now unified) | OQ-BIZ-7 |
| Many unused heavy deps (MUI, Radix set, recharts, …) | Install size, audit surface | §2.2 |
