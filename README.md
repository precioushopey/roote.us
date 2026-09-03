# ROOTÉ.US

**Personalized hair-growth system — concept web app.**
Marketing site → free AI-style hair diagnosis → personalized report → account + plan + checkout → post-purchase program app, plus a standalone product shop.

Hebrew / RTL first, English available. React 18 · React Router 7 · Tailwind v4 · Vite 6. **No backend** — every server concern is a clearly-marked stub, and every unverified price or claim renders as a visible `[PENDING: …]` chip. The site is `noindex`.

> **New to this repo?** Read [`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md) first. It is the source of truth for scope, requirements, and open questions. `CLAUDE.md` is the short "how to work here" version.

---

## Overview

ROOTÉ is a hair-loss brand operated by **91 ENTERPRISE LLC** (Los Angeles, California), serving primarily Israeli customers — hence Hebrew/RTL is the default UI, English is a toggle.

The product guides a customer through **Diagnosis → Analysis → Report → Purchase → Program → Follow-up**, so the experience reads as "ROOTÉ analysed my hair and built me a plan", not "I filled in a quiz so they could sell me shampoo."

This repository is a **stakeholder-review + developer-handoff artefact**: the whole journey is built and navigable, backed only by the browser's `localStorage` + IndexedDB. It contains no real auth, payment, email, storage, notifications, or computer vision.

## Objectives

- One navigable artefact representing the intended product end-to-end.
- Nothing unverified in the UI — prices, effectiveness figures, testimonials, etc. are `[PENDING]` until the client supplies legally-cleared values.
- Handoff-ready: clear seams for a development team to wire real backends without redesigning the UX.
- Israel-first: `he` default, RTL, `he-IL` number/date formatting.

## Scope

**In:** full marketing site; product catalogue + cart + "bag" checkout; mock auth (`/login`, sign-up); 5-step diagnosis funnel; personalized web report; account → plan → checkout → success; post-purchase app (Today / My Plan / Progress / Care Team / Re-scan / Profile); i18n (he/en, parity-enforced); design tokens; `[PENDING]` system; deterministic analysis engine; optional env-gated hairhealth.ai seam.

**Out:** all real backends; the PDF report (built then removed); `/results` and `/blog` pages (designed, not built); a dark theme; SEO.

See [`docs/DESIGN-SPECIFICATION.md` §3](docs/DESIGN-SPECIFICATION.md#3-scope) for the full list.

## Target Users

Prospective customer (IL / EN), returning account holder, program member, à-la-carte shopper, internal reviewer, and developer (DEV build). There is **no** staff/admin/clinician role and no server-side identity — "roles" are client-side gate states. See [`docs/DESIGN-SPECIFICATION.md` §5](docs/DESIGN-SPECIFICATION.md#5-user-roles--permissions).

## Key Features

| Area | What's there |
|---|---|
| Marketing | Home, How It Works, Science, Products, About, FAQ, Support, Terms of Service, **Terms of Sale**, Privacy (drafted for the preview build; production specifics are TODOs) |
| Shop | 17-SKU catalogue with category filter → cart (persisted, qty 1–20) → `/bag` → stub `/bag/checkout` → `/bag/success` |
| Diagnosis | `/diagnosis`: intro → gender → 4 guided photos (downscaled, blobs to IndexedDB) → gated questionnaire + "analyzing" strip → email capture |
| Analysis | `deriveAnalysis()` — pure, deterministic, questionnaire-based. Optional hairhealth.ai overlay when `VITE_HAIRHEALTH_API_URL` is set. |
| Report | `/report/:reportId` — one localized, pending-flagged `ReportModel` rendered as ~11 sections. Web only (no PDF). |
| Purchase | `/start`: sign-up → plan selector (5 durations, AI pick pre-selected) → stub checkout → success → `/app`. Card fields shape-validated only; no card number/CVC retained. |
| Program app | `/app`: day counter, routine checklist + completion log, 7-day adherence %, reorder prompt, progress photos, care-team messages (day-gated), re-scan (unlocks day 90), profile + password change. |
| Cross-cutting | he/en with RTL; `[PENDING]` chips; `prefers-reduced-motion` fallbacks; route-change reveal animation; strict `pnpm typecheck`. |

Full status-classified inventory: [`docs/DESIGN-SPECIFICATION.md` §10](docs/DESIGN-SPECIFICATION.md#10-feature-inventory).

## User Roles

Client-side gate states only:

- **Anonymous** — marketing, shop, diagnosis (step-guarded), own report, sign-up.
- **Account holder** (`auth.email` set) — plus `/start/plan` + `/start/checkout`.
- **Program member** (`session.program` set) — plus all of `/app/*`.
- **Developer** (`import.meta.env.DEV`) — dev seed on `/start`; `roote.debug.forceCheckoutFailure` switch.

Permission matrix: [`docs/DESIGN-SPECIFICATION.md` §5.1](docs/DESIGN-SPECIFICATION.md#51-permission-matrix-route-access).

## User Flows

15 flows with Mermaid diagrams in [`docs/USER-FLOWS.md`](docs/USER-FLOWS.md): first-time visit → report, step guards/resume, photo capture, analyzing+questionnaire, email → report, report/not-found, account → plan → checkout → app, sign-in, daily loop, progress/re-scan, care messages, reorder, shop → bag → success, locale toggle, error recovery.

## Requirements

Functional (`FR-*`), non-functional (`NFR-*`), and user stories (`US-*`) in [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md). Acceptance criteria (`Given/When/Then`) in [`docs/DESIGN-SPECIFICATION.md` §18](docs/DESIGN-SPECIFICATION.md#18-acceptance-criteria-major-features) and per-story in the requirements doc.

## Business Rules

Analysis derivation, program lifecycle, pending/claims governance, mock auth, checkout, localization, and media handling — all traceable to code — in [`docs/BUSINESS-RULES.md`](docs/BUSINESS-RULES.md).

## Technical Architecture

Client-only SPA. Four nested React context providers (`LocaleProvider` → `AuthProvider` → `SessionProvider` → `CartProvider`) over `react-router` 7. Pure domain layer (`deriveAnalysis`, `buildReport`, `buildProgram`, `programProgress`, `collectPending`, `formatMoney`) with no React/DOM/storage imports. Content pipeline: `roote.config.ts` (facts) + `i18n/messages/{en,he}.ts` (copy) → builders → resolved view-models → dumb renderers.

Full detail — stack, routing table, data model, integrations, and the 12 backend seams to implement — in [`docs/TECHNICAL-SPECIFICATION.md`](docs/TECHNICAL-SPECIFICATION.md).

## Project Structure

```
src/
  main.tsx                     createRoot(#root) + styles/index.css
  app/
    App.tsx                    providers + router
    routes/
      marketing/               Home, HowItWorks, Science, Products, About, Faq,
                               Support, Terms, TermsOfSale, Privacy, marketingRoutes
      bag/                      BagPage, BagCheckout, BagSuccess
      auth/                    LoginPage
      diagnosis/               DiagnosisLayout, IntroStep, GenderStep, PhotosStep,
                               AnalyzingStep, ReadyStep, guards
      start/                   StartLayout, AccountStep, PlanStep, CheckoutStep,
                               SuccessStep, guards
      report/                  ReportPage, ReportNotFound, ReportEmailPreview (unrouted)
      app/                     AppShell, AppToday, AppPlan, AppProgress, AppCare,
                               AppRescan, AppProfile, programProgress
    components/
      shell/                   MarketingShell, FunnelShell, Header, MobileMenu, Footer
      marketing/               Section, SectionHeading, DisplayHeading, Prose, Eyebrow,
                               ArrowLink, CtaButton, CtaBand, ArcMotif, CompanyDetails, displayScale
      brand/                   Wordmark, LocaleToggle, PendingChip, ProgressRail
      diagnosis/               PhotoUpload, QuestionCard, AnalyzingStrip, downscaleImage, questions
      report/                  ReportView
      checkout/                CheckoutFields (shared program + bag checkout form)
      funnel/                  funnelStyles
      ui/                      shadcn/ui primitives + cn() (mostly unused)
    lib/                       useRevealOnRoute, useReducedMotion, useScrollCondense
  content/
    roote.config.ts            brand + company + formula + durations + treatments + disclaimers
    catalog.ts                 17-SKU product catalogue
    pending.ts                 PENDING / isPending / collectPending
  domain/
    analysis/                  deriveAnalysis, analyzeHair, hairhealthAdapter, types
    report/                    buildReport, types, money
    program/                   types
  i18n/
    LocaleProvider.tsx, interpolate.ts, messages/{en,he,index}.ts
  store/
    sessionStore.tsx, auth.tsx, cart.tsx, checkout.ts, orders.ts,
    program.ts, persistence.ts, devSeed.ts
  styles/
    index.css → fonts.css, tailwind.css, theme.css, marketing.css ; tokens.ts
  assets/                      images (+ figma:asset/<file> → src/assets/<file>)
  test/setup.ts

docs/
  DESIGN-SPECIFICATION.md      ← start here
  REQUIREMENTS.md  BUSINESS-RULES.md  USER-FLOWS.md  TECHNICAL-SPECIFICATION.md
  superpowers/                 original phase specs + plans (some superseded)
```

## Design & UX

Light-only editorial/luxury language. Tokens live in `src/styles/theme.css` (shadcn variable names) + a Tailwind v4 `@theme inline` map, mirrored in `src/styles/tokens.ts`.

- **Palette:** ivory `#f9f6ef` ground · near-black `#2a2320` text · gray-brown `#745f50` primary CTA · brass/gold `#a97b45` accent (non-text / ≥24px only) · ink `#201812` dark bands.
- **Type:** Playfair Display / Frank Ruhl Libre (display) · Montserrat / Heebo (body) · Libre Franklin / Heebo (legacy default). Google Fonts `@import`.
- **Motion:** `motion`; every effect has a `prefers-reduced-motion` static fallback.
- Reusable component inventory (do not re-invent): [`docs/DESIGN-SPECIFICATION.md` §13.4](docs/DESIGN-SPECIFICATION.md#134-reusable-ui-inventory-do-not-re-invent).

## Development Setup

```bash
pnpm install
```

- The repo is a pnpm workspace. `pnpm-workspace.yaml` pins `supportedArchitectures` to linux glibc — a plain install can misbehave on Windows; `pnpm add react@18.3.1 react-dom@18.3.1` if `dev`/`build` complains about React.
- No `.env` is required. To exercise the hairhealth.ai seam, copy `.env.example` and set `VITE_HAIRHEALTH_API_URL` (and optionally `VITE_HAIRHEALTH_API_KEY`).

## Environment Variables

| Var | Required | Effect |
|---|---|---|
| `VITE_HAIRHEALTH_API_URL` | no | When set, `/diagnosis/analyzing` POSTs photos + questionnaire to `${URL}/v1/analyze` via `hairhealthAdapter` (placeholder contract — confirm before relying on it). Unset → deterministic local model. |
| `VITE_HAIRHEALTH_API_KEY` | no | Optional `Authorization: Bearer` token for the above. |

`import.meta.env.DEV` (set by Vite in `pnpm dev`) enables the dev seed on `/start` and honours `localStorage['roote.debug.forceCheckoutFailure'] = '1'` (forces both checkout stubs to fail).

## Running the Project

```bash
pnpm dev         # Vite dev server
pnpm build       # production build → dist/  (single ~640 kB chunk; chunk-size warning is expected)
```

There is **no** deployment config in the repo (no Dockerfile / CI / host config). Deployment target is `TBD`.

## Testing

```bash
pnpm test        # Vitest — 52 files, 206 tests
pnpm test:watch
pnpm typecheck   # tsc --noEmit (strict) — 0 diagnostics
```

- Vitest + Testing Library + jsdom; `src/test/setup.ts` polyfills `matchMedia`, `URL.createObjectURL`, `Blob.arrayBuffer/text`, `scrollTo`, and a `Request` shim.
- CI-critical invariants: EN/HE key parity + no empty strings (`messages.test.ts`), `tokens.ts` mirrors `theme.css` (`tokens.test.ts`), no claim/price renders from raw null (`pending.test.ts`).
- **No lint or format tooling** exists (`CLAUDE.md` historically discouraged it; adding ESLint + a `lint` script is the recommended next infra step).

## Build & Deployment

`pnpm build` emits a static `dist/`. No hosting/CI configuration is committed. Route-level code-splitting is a documented option (the marketing bundle triggers Vite's >500 kB warning) but not implemented.

## Documentation

| Doc | Purpose |
|---|---|
| [`docs/DESIGN-SPECIFICATION.md`](docs/DESIGN-SPECIFICATION.md) | **Master.** Brief, objectives, scope, users, roles, IA, feature inventory, edge cases, UI/UX, design system, acceptance criteria, traceability, assumptions, **open questions**, dev-readiness. Includes an "Implementation vs. intent" delta against the original specs. |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | `FR-*` / `NFR-*` / `US-*` with acceptance criteria. |
| [`docs/BUSINESS-RULES.md`](docs/BUSINESS-RULES.md) | `BR-*`, each traceable to code. |
| [`docs/USER-FLOWS.md`](docs/USER-FLOWS.md) | `UF-01`…`UF-15` with Mermaid diagrams. |
| [`docs/TECHNICAL-SPECIFICATION.md`](docs/TECHNICAL-SPECIFICATION.md) | Architecture, stack, data model, integrations, backend seams (`BE-1`…`BE-12`), risks. |
| `docs/superpowers/specs/*`, `docs/superpowers/plans/*` | Original phase design intent. Partially superseded — see the "Implementation vs. intent" table in the master spec. |
| `CLAUDE.md` | Short "how to work here" brief for Claude Code — commands, hard rules, architecture, gotchas. |

## Known Limitations

- No backend anywhere: auth, payment, email, storage, notifications, support, geo-locale are all stubs. See [`docs/TECHNICAL-SPECIFICATION.md` §7](docs/TECHNICAL-SPECIFICATION.md#7-backend-requirements-not-yet-implemented).
- Privacy Policy bodies are drafted and accurate to the preview build's client-only data handling, but carry `TODO`s for production (retention periods, applicable data-protection framework, sub-processor list) and need formal legal review; all legal HE copy is first-pass.
- All pricing and effectiveness/timing claims are `[PENDING]` and must not be invented.
- The PDF report was built (P2a) then removed. `ReportEmailPreview` exists but isn't routed.
- `/app/rescan` has no Before/After delta model; `/app` reminders are "coming soon"; there is no dev seed that mints a `Program` (so `/app/*` needs a full checkout in DEV).
- The à-la-carte shop (`/bag`) is kept as a secondary "refills & add-ons" surface: it shares one checkout with the program funnel (`CheckoutFields`, `Order` union, `submitPayment`, order history on `/app/profile`), and is reachable from a header cart icon + a "Shop products" link in the `/app` sidebar. Confirming real prices + the fulfilment model is part of the payment backend (BE-4); full removal is still possible if the client wants demo-only.
- Photo-guard inconsistency: the route guard needs ≥1 photo, the Photos screen requires all 4.
- Program-day math is UTC-only (off-by-one for non-UTC users late in their day).
- Orphaned i18n keys: `landing.*` (~60), `marketing.blog.*`.
- Single ~640 kB JS bundle; no code-splitting. `favicon.png` is ~590 kB.
- The working tree on `main` carries a large uncommitted change set — confirm the branch strategy before new work.

## Open Questions

24 prioritised items in [`docs/DESIGN-SPECIFICATION.md` §20](docs/DESIGN-SPECIFICATION.md#20-open-questions--clarifications) (OQ-TECH-4 and OQ-UX-5 have since been resolved). **3 hard blockers remain:** program pricing (all 5 durations + shipping + renewal); substantiated effectiveness/timing figures (or confirm they stay out); medical / consent / data-handling copy for formal legal review.

## Development Readiness

**READY WITH CONDITIONS.** The codebase is coherent, tested (206), and typechecks clean; every screen in the journey exists and is navigable, with clear backend seams. Blocked area: anything touching product/legal **content** until the three blocker questions are answered. Confirm the branch/commit strategy before the first new commit. Full checklist: [`docs/DESIGN-SPECIFICATION.md` §22](docs/DESIGN-SPECIFICATION.md#22-development-readiness).

## Change Log

| Date | Change |
|---|---|
| 2026-09-03 | *(follow-up 3)* OQ-BIZ-7 direction: **keep the à-la-carte shop as a secondary refills/add-ons surface.** Made it discoverable — a bag icon + count badge in the marketing header (→ `/bag`) and a "Shop products" link in the `/app` sidebar (→ `/products`). |
| 2026-09-03 | *(follow-up 2)* Consolidated the program + bag checkouts: one `Order` discriminated union + `submitPayment`, one shared `CheckoutFields` form, one order-id scheme, order history (`store/orders.ts`) shown on `/app/profile`; removed `store/bagCheckout.ts`; unified the `checkout.*` i18n namespace. |
| 2026-09-03 | *(follow-up 1)* Filled the Privacy Policy bodies (preview-build data handling, production TODOs); added a "you agree to the Terms of Sale" line above both checkout submit buttons; fixed RTL bidi on the legal-entity name / phone in the Hebrew company block, Support page, and footer. |
| 2026-09-03 | README + `CLAUDE.md` rewritten from a full repository audit; added `docs/DESIGN-SPECIFICATION.md`, `docs/REQUIREMENTS.md`, `docs/BUSINESS-RULES.md`, `docs/USER-FLOWS.md`, `docs/TECHNICAL-SPECIFICATION.md`. (Discovery/documentation pass.) |
| 2026-09-03 | *(prior, same day)* Added `tsconfig.json` + `pnpm typecheck` (strict); added `/terms-of-sale` + company details from `roote.config.company`; cream text-halo on grid sections. |
| ≤ 2026-09-02 | Marketing site, diagnosis→report→start funnel, post-purchase app, product shop; PDF report removed. See `docs/superpowers/plans/*`. |
