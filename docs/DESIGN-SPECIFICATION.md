# ROOTÉ.US — Design Specification

**Status:** Pre-development discovery / requirements baseline
**Date:** 2026-09-03
**Author role:** Product / UX / BA / Technical analysis pass (no implementation)
**Scope of this document:** the product as it **actually exists in the repository today**, the intent behind it, and what a developer/QA/backend team needs before continuing.

Companion documents (this file links to them; it does not duplicate them):

| Document | Contents |
|---|---|
| [`REQUIREMENTS.md`](./REQUIREMENTS.md) | Functional (`FR-*`) + non-functional (`NFR-*`) requirements, user stories (`US-*`) |
| [`BUSINESS-RULES.md`](./BUSINESS-RULES.md) | Business rules (`BR-*`) with evidence pointers |
| [`USER-FLOWS.md`](./USER-FLOWS.md) | User flows (`UF-*`) with Mermaid diagrams |
| [`TECHNICAL-SPECIFICATION.md`](./TECHNICAL-SPECIFICATION.md) | Architecture, tech stack, data model, API / backend requirements |
| `superpowers/specs/2026-09-01-roote-diagnosis-report-app-design.md` | **Original** design intent for the funnel/report/app (some of it superseded — see §"Implementation vs. intent") |
| `superpowers/specs/2026-09-02-roote-marketing-website-design.md` | **Original** design intent for the marketing site (partially built — see §"Implementation vs. intent") |

> **Terminology in this document**
> `CONFIRMED` — supported by code, tests, or a committed prior spec.
> `ASSUMPTION` — inferred from the code; not independently confirmed.
> `TBD` — cannot be determined from available material; needs a decision.

---

## 1. Project Brief

| Field | Value |
|---|---|
| **Project name** | ROOTÉ.US (repo folder `ROOTÉ.US`, git remote `github.com/precioushopey/roote.us`) |
| **Product name** | ROOTÉ — "Personalized Hair Growth System" |
| **What it is** | A **bilingual (Hebrew-default / English), front-end-only concept web application** for a hair-loss treatment brand. It presents the full customer journey — marketing site → free AI-style hair diagnosis → personalized report → account + plan + checkout → post-purchase program app — plus a secondary direct-to-consumer product shop ("the bag"). |
| **Business problem** | ROOTÉ needs a complete, reviewable, demonstrable product experience to align stakeholders and hand to developers, **before** any backend, real AI, payment, or regulatory-approved content exists. |
| **User problem** | People with pattern hair loss want to understand their situation and get a credible, personalized treatment plan without a clinic visit — and then stay on track. |
| **Proposed solution** | Guide the user through *Diagnosis → Analysis → Report → Purchase → Program → Follow-up*, so the felt experience is "ROOTÉ learned my situation, analysed my hair, explained the result, built me a plan, and tracks my progress" — never "I filled in a quiz so they could sell me shampoo." (Brief §14, carried into `superpowers/specs/2026-09-01`.) |
| **Operating entity** | 91 ENTERPRISE LLC (Los Angeles, California, USA; EIN 46-4692938; reg. 201403110138; incorporated 2014-01-30; authorized representative Asher Elimelech). Rendered on `/terms`, `/terms-of-sale`, and the footer via `src/content/roote.config.ts` → `company`. |
| **Primary market** | Israel (Hebrew, RTL, `he-IL` formatting is the default); English is a toggle. |
| **Current maturity** | **Concept / demo.** `index.html` is `noindex,nofollow`. No backend of any kind. Every server concern is a clearly-marked stub. All prices, effectiveness figures, and unverified claims render as visible `[PENDING: …]` chips. |
| **Repository origin** | A Figma Make export ("Design Etsy Shop Branding" / *PaperlessHope*) that was **fully repurposed** into ROOTÉ. Only the build tooling lineage remains. (`CLAUDE.md` was rewritten for ROOTÉ on 2026-09-03; it previously described the Etsy template.) |
| **Timeline considerations** | `TBD`. Prior specs describe a phased build (P0 foundations → P1 diagnosis → P2a report → P2b account/checkout → P2c app → marketing site). Most phases are implemented; see §"Implementation vs. intent". |

---

## 2. Objectives

### Business objectives
- **BO-1** Give stakeholders a single, navigable artefact that represents the intended product end-to-end. `CONFIRMED`
- **BO-2** Keep every unverified medical/commercial claim out of the UI until legal/regulatory sign-off — represented as `[PENDING]`, never invented. `CONFIRMED` (enforced by `src/content/pending.ts` + `collectPending` + tests)
- **BO-3** Be handoff-ready for a development team to wire real backends without redesigning the UX. `ASSUMPTION` (structure supports it; this doc + companions close the remaining gaps)
- **BO-4** Serve the Israeli market first: Hebrew, RTL, `he-IL` number/date formatting are the default, not an afterthought. `CONFIRMED`

### Product objectives
- **PO-1** A complete marketing site that drives one action: **Start free analysis → `/diagnosis`**. `CONFIRMED`
- **PO-2** A diagnosis funnel that produces a deterministic `HairAnalysis` from a 5-question questionnaire (+ 4 guided photos), with an optional seam to a real provider (hairhealth.ai). `CONFIRMED`
- **PO-3** A personalized web report rendered entirely from one resolved `ReportModel` view-model. `CONFIRMED`
- **PO-4** An account → plan-selection → checkout flow that ends by minting a frozen `Program`. `CONFIRMED`
- **PO-5** A post-purchase app: daily routine checklist, adherence, progress photos, care-team messages, re-scan, profile. `CONFIRMED`
- **PO-6** A standalone product shop (`/bag`) for à-la-carte purchases. `CONFIRMED`

### Non-objectives (this build)
- Any real backend: server auth, photo upload/storage, email send, payment processing, notifications, analytics, CMS, IP-geolocation language routing. Each has a UI + a marked stub. `CONFIRMED`
- Real computer vision / a live hairhealth.ai integration (only an env-gated placeholder adapter). `CONFIRMED`
- A downloadable PDF report. **This was built (P2a) and then removed** — see §"Implementation vs. intent". `CONFIRMED`
- SEO. `index.html` stays `noindex,nofollow`. `CONFIRMED`
- Any medical claim, effectiveness %, price, testimonial, study result, advisory-board identity, or press placement not supplied by the client. `CONFIRMED`
- A dark theme. `.dark` tokens exist in `theme.css` but nothing toggles them; the product is light-only in practice. `CONFIRMED`

---

## 3. Scope

### 3.1 In scope (built and present in `src/`)

| Area | Surface |
|---|---|
| Marketing site | `/`, `/how-it-works`, `/science`, `/products`, `/about`, `/faq`, `/support`, `/terms`, `/terms-of-sale`, `/privacy` |
| Product shop | `/products` (catalogue + add-to-bag), `/bag`, `/bag/checkout`, `/bag/success` |
| Auth | `/login` (mock sign-in) |
| Diagnosis funnel | `/diagnosis`, `/diagnosis/intro`, `/diagnosis/gender`, `/diagnosis/photos`, `/diagnosis/analyzing`, `/diagnosis/ready` |
| Report | `/report/:reportId` (web only) |
| Purchase funnel | `/start`, `/start/plan`, `/start/checkout`, `/start/success` |
| Post-purchase app | `/app` (Today), `/app/plan`, `/app/progress`, `/app/care`, `/app/rescan`, `/app/profile` |
| Cross-cutting | i18n (he/en, 705 keys, parity-enforced), design tokens, `[PENDING]` system, deterministic analysis engine, mock stores (session/auth/cart), `prefers-reduced-motion` support, route-change reveal animation |
| Tooling | Vite 6 build, Vitest suite (52 files / 206 tests), `tsconfig.json` + `pnpm typecheck` (strict; added 2026-09-03) |

### 3.2 Out of scope for this build (documented gaps, not defects)

- All backends listed in §2 non-objectives.
- Marketing pages designed in `superpowers/specs/2026-09-02` but **not built**: `/results` (Results & Reviews), `/blog`, `/blog/:slug`. Their i18n keys (`marketing.blog.*`) are **orphaned** in `en.ts`/`he.ts`.
- The original single-page `Landing` route (superseded by `Home`). Its i18n keys (`landing.*`, ~60) are **orphaned**.
- The PDF report + `ReportEmailPreview` route (component file exists, is not routed).
- `/app/reminders` as its own route (folded into a "coming soon" card on `/app`).
- Real reorder/renewal pricing, subscription auto-renewal mechanics.
- Professional Hebrew copy review (all HE strings are first-pass; legal HE is flagged "pending formal legal review").

### 3.3 Known constraints

- **No `tsconfig.json` history** until 2026-09-03; strict typechecking is new, so latent type debt may still exist beyond what `tsc --noEmit` currently reports (currently clean).
- **No lint/format tooling.** `CLAUDE.md` says not to invent it; a lint script is the highest-leverage remaining infra add.
- `pnpm-workspace.yaml` pins `supportedArchitectures` to linux x64/arm64 glibc, which can complicate `pnpm install` on the Windows dev machine. `react`/`react-dom` are `dependencies` now (were optional peers historically).
- `figma:asset/<file>` imports resolve to `src/assets/<file>` via a custom Vite plugin — must be preserved.
- Tailwind **v4** (`@tailwindcss/vite`), no `tailwind.config`, no PostCSS plugins (`postcss.config.mjs` is intentionally empty).
- The working tree is clean as of 2026-09-03 (everything committed + pushed as `09f68e4`).

### 3.4 Assumptions

See §21. Key ones: the app is a **stakeholder-review + developer-handoff artefact**, not a production deployment; `main` is the current integration branch; and all `[PENDING]`/`TODO: confirm with client` markers represent **genuine open decisions**, not placeholders the team can fill unilaterally.

---

## 4. Target Users

| Segment | Description | Primary need | Evidence |
|---|---|---|---|
| **Prospective customer (IL)** | Hebrew-speaking adult (18+) noticing pattern hair loss; wants a credible remote assessment. | Understand my situation; get a plan I trust. | Default locale `he`, `he-IL` formatting, RTL; funnel copy |
| **Prospective customer (intl / EN)** | Same, English UI via toggle. | Same. | `LocaleProvider` toggle |
| **Returning account holder** | Has created a mock account; returning to continue purchase or (post-purchase) run their program. | Resume where I left off; manage my plan. | `/login`, `auth` store persistence, `/app` guards |
| **Program member** | Completed checkout; has an active `Program`. | Stay on routine; track progress; know when to reorder. | `/app/*`, `programProgress.ts`, reorder banner logic |
| **À-la-carte shopper** | Wants specific products without the program. | Browse catalogue, add to bag, "check out". | `/products` catalogue, `/bag/*`, `cart` store |
| **Internal stakeholder / reviewer** | ROOTÉ team, client ("Sir Ilay" per the prompt), reviewing the concept. | See the whole product; identify what's pending. | `[PENDING]` chips, `noindex`, demo disclaimers |
| **Developer (dev build)** | Engineer running `import.meta.env.DEV`. | Reach deep screens without walking the whole funnel. | Dev seed on `/start`, `roote.debug.*` localStorage flags |

There is **no** staff/admin/clinician user, no role hierarchy, and no server-side identity. "Care team" content is one-directional canned messaging plus a non-functional compose form.

---

## 5. User Roles & Permissions

Roles here are **client-side gate states**, not server-enforced authorization. All data lives in the visitor's own browser (`localStorage` + IndexedDB).

| Role | How you become it | Can access | Cannot access | Key actions |
|---|---|---|---|---|
| **Anonymous visitor** | default | All marketing routes; `/products` + `/bag/*`; `/diagnosis/*` (guarded by progress); `/report/:id` **only for the report id in this browser's session**; `/login`; `/start` (account step). | `/start/plan`, `/start/checkout`, `/start/success` (needs `auth.email`); all `/app/*` (needs `auth.email` **and** `session.program`). | Browse; run diagnosis; capture email at `/diagnosis/ready`; add products to bag; place a stubbed bag order; sign up. |
| **Account holder** | Complete `/start` sign-up **or** `/login` sign-in (mock; `auth.email` set in `localStorage['roote.authSession']`). | Everything an anonymous visitor can, plus `/start/plan` and `/start/checkout`. Reaching `/start` while signed in auto-forwards to `/start/plan`. | `/app/*` until a `Program` exists. | Select a program duration; complete the stubbed checkout (which mints a `Program`); change password (`/app/profile`, only visible once a program exists); sign out. |
| **Program member** | Complete `/start/checkout` (builds `Program` via `buildProgram`) — or a dev seed. | All `/app/*` routes. | — | Tick daily tasks; add progress photos; read unlocked care-team messages; (stub) compose a care message; run a re-scan (unlocks at program day ≥ 90); change password; log out; reorder (CTA appears when within `reorderLeadDays` of end or ended → `/start/plan`). |
| **Developer (DEV build)** | `import.meta.env.DEV` | Dev-seed button on `/start` ("no report" state) that fabricates a diagnosis + analysis + reportId. `localStorage['roote.debug.forceCheckoutFailure']='1'` forces both checkout stubs to throw. | — | Shortcut into `/start/plan` without walking `/diagnosis`. **Note:** there is currently *no* dev seed that mints a `Program`, so `/app/*` is only reachable in dev by completing `/start/checkout` (`ASSUMPTION`: gap — see OQ-TECH-3). |

### 5.1 Permission matrix (route access)

| Route group | Anonymous | Account holder | Program member |
|---|:---:|:---:|:---:|
| Marketing (`/`, `/how-it-works`, …, `/privacy`) | ✅ | ✅ | ✅ |
| Shop (`/products`, `/bag`, `/bag/checkout`, `/bag/success`) | ✅ | ✅ | ✅ |
| `/diagnosis/*` | ✅ (step guards) | ✅ | ✅ |
| `/report/:reportId` | ✅ *iff `reportId === session.reportId` and analysis present* | same | same |
| `/login` | ✅ | ✅ (redirects on success) | ✅ |
| `/start` (account) | ✅ | → `/start/plan` | → `/start/success` |
| `/start/plan`, `/start/checkout` | → `/start` | ✅ (checkout also needs `draftDurationDays`) | → `/start/success` |
| `/start/success` | → `/start` | → `/start` (no program) | ✅ |
| `/app/*` | → `/` (no program) → `/login` (no email) | → `/` (no program) | ✅ |
| `*` (unknown) | → `/` | → `/` | → `/` |

---

## 6. Requirements

Full list in [`REQUIREMENTS.md`](./REQUIREMENTS.md). Summary of coverage:

- **Marketing & shop:** `FR-001`–`FR-020`
- **Diagnosis funnel:** `FR-021`–`FR-035`
- **Report:** `FR-036`–`FR-045`
- **Account / plan / checkout:** `FR-046`–`FR-060`
- **Post-purchase app:** `FR-061`–`FR-080`
- **Cross-cutting (i18n, pending, persistence, motion):** `FR-081`–`FR-095`
- **Non-functional:** `NFR-001`–`NFR-020` (performance, a11y, RTL, privacy, browser support, maintainability, no-backend contract)

---

## 7. User Stories

Full list in [`REQUIREMENTS.md`](./REQUIREMENTS.md) (`US-001`…). Each story carries priority, the related `FR-*`, acceptance criteria (`Given/When/Then`), and dependencies.

---

## 8. User Flows

Full set with Mermaid diagrams in [`USER-FLOWS.md`](./USER-FLOWS.md):

- `UF-01` First-time visitor → diagnosis → report
- `UF-02` Diagnosis step-guard / resume behaviour
- `UF-03` Photo capture (validation, downscale, blob storage)
- `UF-04` Analyzing + questionnaire (gated dual-progress)
- `UF-05` Email capture → report
- `UF-06` Report view / not-found
- `UF-07` Account sign-up → plan → checkout → success → `/app`
- `UF-08` Returning user sign-in (`/login`)
- `UF-09` Post-purchase daily loop (Today checklist, adherence)
- `UF-10` Progress photos + re-scan
- `UF-11` Care-team messages (unlock schedule)
- `UF-12` Reorder / renewal prompt
- `UF-13` Product shop → bag → stubbed checkout → success
- `UF-14` Locale toggle (he ⇄ en, RTL flip)
- `UF-15` Error recovery (checkout failure, quota, unknown routes)

---

## 9. Information Architecture

### 9.1 Shells

```
App (src/app/App.tsx)
├─ LocaleProvider → AuthProvider → SessionProvider → CartProvider → RouterProvider
│
├─ MarketingShell            Header (sticky, condense-on-scroll, dropdown "More") + Footer + skip-link
│   ├─ /                     Home
│   ├─ /how-it-works
│   ├─ /science
│   ├─ /products             catalogue + add-to-bag
│   ├─ /about
│   ├─ /faq
│   ├─ /support              contact details + stub contact form
│   ├─ /terms                Terms of Service + company details
│   ├─ /terms-of-sale        Terms of Sale (12 clauses) + company details
│   ├─ /privacy              Privacy Policy — drafted for the preview build; production specifics are TODOs
│   ├─ /bag                  cart line items (prices [PENDING])
│   ├─ /bag/checkout         contact + card-shape form → stub order
│   └─ /bag/success          order id + next steps
│
├─ FunnelShell               wordmark (→ /) + LocaleToggle only
│   ├─ /login                mock sign-in
│   ├─ /diagnosis            DiagnosisLayout (5-segment ProgressRail)
│   │   ├─ (index) / intro
│   │   ├─ gender
│   │   ├─ photos
│   │   ├─ analyzing         questionnaire + analysis strip
│   │   └─ ready             teaser + email capture
│   └─ /start                StartLayout (3-segment ProgressRail: account · plan · payment)
│       ├─ (index)           account (sign-up)
│       ├─ plan              duration selector (recommended pre-selected)
│       ├─ checkout          order summary + contact + card-shape form
│       └─ success           order confirmation → CTA to /app
│
├─ /report/:reportId         ReportView (own inline header/footer)
│
├─ /app                      AppShell (desktop sidebar / mobile scrollable tabs)
│   ├─ (index)               Today — day counter, KPIs, routine checklist, reorder card, reminders "coming soon"
│   ├─ plan                  My Plan — core + supporting treatments, duration
│   ├─ progress              Progress — add photos, before/after compare, timeline
│   ├─ care                  Care Team — day-gated messages + stub compose
│   ├─ rescan                Re-scan — locked until program day ≥ 90; baseline vs latest photo compare
│   └─ profile               Profile — account, program facts, change password, log out
│
└─ *                         <Navigate to="/" replace />
```

### 9.2 Primary navigation

- **Marketing header:** Wordmark · How It Works · Science · Products · About · **More ▾** (FAQ · Support) · bag icon + count badge (→ `/bag`) · LocaleToggle · **Start Free Diagnosis** (CTA → `/diagnosis`). Mobile: hamburger → full-screen `MobileMenu` with all links + CTA + toggle (the bag icon stays in the top bar).
- **Marketing footer:** *Explore* (How It Works · Science · Products) · *Company* (About · Support · FAQ) · *Legal* (Terms · Terms of Sale · Privacy) · *Start today* (pitch + CTA). Base row: wordmark · LocaleToggle · `© {year} ROOTÉ · All rights reserved.` · `ROOTÉ is a brand of 91 ENTERPRISE LLC · PO BOX 48112, Los Angeles, CA 90036, United States`.
- **Funnel:** no nav — wordmark (→ `/`) + LocaleToggle; progress rails are non-interactive indicators.
- **App:** sidebar (desktop ≥ lg) / horizontally-scrollable tab strip (mobile): Today · My Plan · Progress · Care Team · Profile; the desktop sidebar also has "Run a new hair analysis" (→ `/app/rescan`), "Shop products" (→ `/products`), and "Log out".
- **Report:** wordmark only; in-page CTA → `/start?report=<id>`.

### 9.3 Content hierarchy conventions

Editorial/luxury language: left-aligned section headers, gold margin index numerals (`01 · 02 …`) on multi-step sections, thin `border-accent` rules, `.bg-grid-lines` graph-paper motif on cream sections, oversized fluid `DisplayHeading`/`SectionHeading` (`clamp()`), `--ink` dark bands for hero/CTA/regimen, `CtaBand` as the shared closing section on marketing pages.

---

## 10. Feature Inventory

Status legend: **Existing** (fully implemented, no backend needed) · **Stub** (UI complete, deliberately inert, marked `TODO`) · **Partial** (implemented but with a known gap/inconsistency) · **Planned-not-built** (designed in a prior spec, absent from code) · **Deprecated/orphaned** (code or keys present but unreferenced).

| ID | Feature | Surface | Status | Notes / evidence |
|---|---|---|---|---|
| FEAT-01 | Bilingual he/en with RTL, persisted, `<html lang dir>` sync | global | Existing | `LocaleProvider`; default `he`; `localStorage['roote.locale']` |
| FEAT-02 | `[PENDING: label]` system + parity/`no-raw-null` tests | global | Existing | `pending.ts`, `PendingChip`, `pending.test.ts` |
| FEAT-03 | Design-token theme (shadcn var names) + Tailwind v4 `@theme inline` | global | Existing | `theme.css`, `tokens.ts` mirror, `tokens.test.ts` |
| FEAT-04 | Route-change "rise up" reveal animation, reduced-motion aware | global | Existing | `useRevealOnRoute`, `useReducedMotion`, `marketing.css` |
| FEAT-05 | Marketing site (Home + 6 content pages) | `MarketingShell` | Existing | Rich sections, `motion` parallax/reveal on Home/How-It-Works |
| FEAT-06 | Legal pages: Terms of Service, Terms of Sale (12 clauses), company-details block | `/terms`, `/terms-of-sale` | Existing | `CompanyDetails` reads `roote.config.company`; HE flagged "pending legal review" |
| FEAT-07 | Privacy Policy | `/privacy` | Existing / Partial | All 6 bodies drafted (accurately describe the preview build's client-only data handling); retention periods, applicable DP framework, and production sub-processor list carry `TODO` markers for when a backend exists; HE first-pass, "pending formal legal review" |
| FEAT-08 | Support page: real email/phone/hours + stub contact form | `/support` | Existing / Stub | Contact form shows a `role="status"` "not connected" notice; nothing sent |
| FEAT-09 | Product catalogue (17 SKUs, 5 categories) + tab/filter | `/products` | Existing | `src/content/catalog.ts`; prices `[PENDING]` |
| FEAT-10 | Add-to-bag + cart store (qty clamp 1–20, persisted) | `/products`, marketing header, `/bag` | Existing | `cart.tsx`; `count` derived; **marketing header shows a bag icon + count badge → `/bag`** (added 2026-09-03); `/app` sidebar has a "Shop products" link → `/products` |
| FEAT-11 | Bag page + stub bag checkout + success | `/bag/*` | Existing / Stub | Uses the shared `CheckoutFields` + unified `submitPayment` (400 ms); only last4+expiry retained; totals `[PENDING]`; success records an `OrderRecord` → `/app/profile` |
| FEAT-12 | Mock auth: sign-up, sign-in, sign-out, change password | `/start`, `/login`, `/app/profile` | Stub | `auth.tsx`; non-crypto digest; `localStorage`; explicit `TODO: real auth` |
| FEAT-13 | Diagnosis funnel: intro → gender → photos → analyzing → ready | `/diagnosis/*` | Existing | Step guards in `guards.ts`; `DiagnosisLayout` progress rail |
| FEAT-14 | Guided 4-angle photo capture, client-side downscale, blob → IndexedDB | `/diagnosis/photos`, reused on `/app/*` | Existing / Partial | `PhotoUpload` + `downscaleImage`; **guard requires ≥1, UI requires all 4** (BR-PHOTO) |
| FEAT-15 | 5-question questionnaire with animated transitions + back nav | `/diagnosis/analyzing` | Existing | `questions.ts`, `QuestionCard`, `motion` |
| FEAT-16 | Gated dual-progress "analyzing" strip (can't finish until all Qs answered) | `/diagnosis/analyzing` | Existing | `AnalyzingStrip` `gateReady` prop |
| FEAT-17 | Deterministic analysis engine `deriveAnalysis` | domain | Existing | Pure; table-driven tests over every input combo |
| FEAT-18 | hairhealth.ai adapter (env-gated), `analyzeHair` orchestrator w/ fallback | domain | Stub | `hairhealthAdapter.ts` — "PLACEHOLDER CONTRACT"; inactive unless `VITE_HAIRHEALTH_API_URL` set |
| FEAT-19 | Email capture at analysis-ready | `/diagnosis/ready` | Stub | Stores `account.email`; `TODO: email backend`; consent line `TODO: confirm` |
| FEAT-20 | Personalized report from one `ReportModel` (`buildReport`) | `/report/:reportId` | Existing | Pure builder; fully localized + pending-flagged; golden-model tests |
| FEAT-21 | Report web view (11+ bands: cover, scan, regimen, actives, expectations, program, FAQ, CTA, disclaimers) | `/report/:reportId` | Existing | `ReportView`; `ReportNotFound` fallback |
| FEAT-22 | Report email preview component | — | Deprecated/orphaned | `ReportEmailPreview.tsx` present, **not routed** (only its own test mounts it) |
| FEAT-23 | Downloadable PDF report | — | Deprecated | Built in P2a, then **removed**: `src/pdf/*` deleted; `@react-pdf/renderer` removed from `package.json` |
| FEAT-24 | Account → plan selector (5 durations, AI pick pre-selected + badged) | `/start`, `/start/plan` | Existing | `PlanStep`; reads `buildReport(...).recommendedDuration` |
| FEAT-25 | Checkout: order summary + contact + card-shape form + stub payment | `/start/checkout` | Stub | `submitPayment`; `TODO: Marwell — wire to Shopify/payment backend`; shipping/total `[PENDING]` |
| FEAT-26 | `buildProgram` freezes order → `Program` (plan, analysis snapshot, dates) | domain | Existing | `program.ts`; `types.test.ts` |
| FEAT-27 | Success screen → CTA to `/app` | `/start/success` | Existing | `SuccessStep` |
| FEAT-28 | App shell: sidebar/tabs, program+auth guards, logout | `/app` | Existing | `AppShell` |
| FEAT-29 | Today: day counter, progress bar, KPI strip (checklist / adherence / next order), routine checklist with completion toggle, reorder card | `/app` | Existing | `AppToday`, `programProgress.ts` |
| FEAT-30 | Reminders (per-task times) | `/app` (card) | Stub | "Scheduled notification reminders are coming soon"; `Program.reminders` wired, unused; **no `/app/reminders` route** |
| FEAT-31 | My Plan: core + supporting treatments, usage/frequency/zones, duration | `/app/plan` | Existing | `AppPlan`; `resolvePlanTreatments` re-localizes from config |
| FEAT-32 | Progress: add dated photos, baseline vs latest per angle, timeline by date | `/app/progress` | Existing | `AppProgress`; `program.progressPhotos` (blob → IndexedDB) |
| FEAT-33 | Care Team: day-gated messages (days 1/14/45/90/180) + stub compose | `/app/care` | Existing / Stub | `CARE_MESSAGES`; compose shows a stub notice |
| FEAT-34 | Re-scan: locked < program day 90; baseline vs latest photo compare; CTA to `/diagnosis` | `/app/rescan` | Partial | `AppRescan`; **no `deriveRescan` delta model** (spec'd, not built); re-uses diagnosis photo UI |
| FEAT-35 | Profile: account facts, program facts, link to report, change password, log out | `/app/profile` | Existing / Stub | `AppProfile`; password change hits mock `auth` |
| FEAT-36 | Adherence % (rolling 7-day completion rate) | `/app` | Existing | `adherencePct` |
| FEAT-37 | Reorder-due detection (`daysRemaining ≤ reorderLeadDays` or ended) | `/app` | Existing | `isReorderDue`; CTA → `/start/plan` |
| FEAT-38 | Dev seed (diagnosis+report) on `/start` "no report" state | `/start` | Existing (DEV) | `seedDiagnosisAndReport`; **does not mint a Program** |
| FEAT-39 | Results & Reviews page (`/results`) | — | Planned-not-built | `superpowers/specs/2026-09-02` §4.4 |
| FEAT-40 | Blog index + posts (`/blog`, `/blog/:slug`) | — | Planned-not-built | Keys `marketing.blog.*` orphaned in `en.ts`/`he.ts` |
| FEAT-41 | Original single-page `Landing` | — | Deprecated/orphaned | Replaced by `Home`; `landing.*` keys (~60) orphaned |

---

## 11. Business Rules

Full list with evidence in [`BUSINESS-RULES.md`](./BUSINESS-RULES.md). Categories:

- **Analysis derivation** (`BR-AN-*`) — scale by gender, severity by onset, stage clamps, zone flagging, plan emphasis, recommended-duration table.
- **Program lifecycle** (`BR-PR-*`) — duration options, start/end dates, plan/analysis freezing, task keys, reorder window, re-scan unlock, care-message unlock schedule, adherence formula.
- **Pending/claims** (`BR-PD-*`) — nothing unverified is ever rendered from raw null; prices/effectiveness always `[PENDING]`.
- **Auth** (`BR-AU-*`) — email format, password length, duplicate rejection, non-crypto digest, session persistence, redirect rules.
- **Checkout** (`BR-CO-*`) — card shape validation only; no card number/CVC retained; stub success/failure; program minting; bag qty clamp.
- **i18n/locale** (`BR-LO-*`) — default `he`, RTL, `he-IL` formatting, toggle-only selection, key parity, no empty strings.
- **Media** (`BR-MD-*`) — image type/size limits, downscale, blob storage, best-effort cleanup.

---

## 12. Edge Cases & Exception Handling

Behaviour is stated as **implemented** unless marked `GAP` (no handling found) or `TBD`.

### 12.1 User / session states

| Case | Expected behaviour |
|---|---|
| First-time visitor at `/diagnosis/photos` (no gender) | Redirect to `/diagnosis/gender` (`redirectForStep`). |
| First-time visitor at `/diagnosis/analyzing` (no photos) | Redirect to `/diagnosis/photos`. Note: guard needs ≥1 photo; the Photos UI won't let you continue without 4 — so this branch is only reachable by direct URL. |
| Visitor at `/diagnosis/ready` with no analysis | Redirect to `/diagnosis/analyzing`. |
| Visitor at `/report/:id` where `id !== session.reportId` | `ReportNotFound` (title + "restart your diagnosis" CTA → `/diagnosis`). |
| Visitor at `/report/:id` after `session.reset()` / cleared storage | `ReportNotFound`. |
| Signed-out user at `/start/plan` or `/start/checkout` | Redirect to `/start`. |
| Signed-in user re-visiting `/start` | Redirect to `/start/plan`. |
| Signed-in user at `/start/plan` after already buying (`session.program` set) | Redirect to `/start/success`. |
| At `/start/checkout` with no `draftDurationDays` | Redirect to `/start/plan`. |
| At `/start/success` with no `program` | Redirect to `/start`. |
| At any `/app/*` with no `program` | Redirect to `/`. |
| At any `/app/*` with a `program` but no `auth.email` | Redirect to `/login`. |
| Signing in at `/login` with a program already present | Navigate to `/app`; otherwise `/`. |
| Suspended / deleted user | `GAP` — no such concept (no server). |
| Incomplete profile | `GAP` — no profile completeness concept. |

### 12.2 Data states

| Case | Expected behaviour |
|---|---|
| No progress photos yet (`/app/progress`) | "No photo yet" placeholder cells; timeline section hidden. |
| No completion log entries (`/app` Today) | Checklist all unchecked; adherence `0%`. |
| `completionLog` present but analysis snapshot minimal (tests) | `adherencePct` returns 0 when `taskCount === 0`. |
| Empty cart at `/bag` | Empty-state message + "Browse products" link. |
| `/bag/checkout` with empty cart | `<Navigate to="/bag" replace />` (unless an order was just placed — `placed` flag guards the race). |
| `/bag/success` opened directly (no `location.state.orderId`) | `<Navigate to="/products" replace />`. |
| Cart line SKU no longer in catalogue | Filtered out (`findProduct` returns undefined → line dropped from render). |
| `LocalizedText` with an empty string for the active locale | Treated as unresolved → `[PENDING: <label>]` (`resolveLocalized` in `buildReport`). |
| Large dataset (many progress photos) | `GAP` — no virtualization; `ASSUMPTION`: fine at demo scale. |
| Duplicate account email at sign-up | Inline error `start.account.error.duplicateEmail`; no navigation. |

### 12.3 Network / provider states

| Case | Expected behaviour |
|---|---|
| hairhealth.ai configured but request fails | `analyzeHair` catches, `console.warn`, falls back to `deriveAnalysis` (local). User still reaches `/diagnosis/ready`. |
| hairhealth.ai configured, no photos | Skips remote; uses local model. |
| hairhealth.ai unset (default) | `AnalyzingStep` stays fully synchronous; local model; immediate navigate. |
| Checkout stub "failure" (`roote.debug.forceCheckoutFailure='1'`) | `submitPayment` throws → inline error (`start.checkout.error.payment` / `bag.checkout.error.payment`); nothing persisted; form re-submittable. |
| Offline / real network down | `GAP` for anything real (there are no real network calls except the optional hairhealth.ai fetch). |

### 12.4 Form states

| Case | Expected behaviour |
|---|---|
| Invalid email at `/diagnosis/ready` | Inline `role="alert"` error; submit blocked. |
| Weak password (<8) at sign-up | Inline error `start.account.error.weakPassword`. |
| Invalid email format at sign-up | Inline error `start.account.error.invalidEmail`. |
| Card number not 13–19 digits / expiry not `MM/YY` / CVC not 3–4 digits (either checkout) | Inline error; submit blocked; **shape only — no Luhn, no real auth**. |
| Required contact fields empty (checkout) | Native HTML `required` prevents submit. |
| Unsaved changes on navigation | `GAP` — no "discard changes?" guard anywhere. |
| Double-submit of the analyzing "finish" | Guarded by `finishedRef`. |
| Double-submit of checkout while `submitting` | Submit button `disabled={submitting}`. |

### 12.5 Responsive states

| Breakpoint | Behaviour |
|---|---|
| Mobile (< `lg`) | Marketing header → hamburger + full-screen `MobileMenu` (focus-trapped, Esc closes). App nav → horizontally scrollable tab strip. Funnel/report single-column. |
| Tablet | Grid columns collapse per Tailwind `sm:`/`md:` breakpoints. |
| Desktop (≥ `lg`) | Marketing centre nav + `More ▾` dropdown (click-outside + Esc close). App → 248 px sidebar. |
| Touch | `PhotoUpload` uses `<input type="file" accept="image/*" capture>` for camera capture. |
| Small mobile | `clamp()` display type scales down; hero titles uppercase. `ASSUMPTION`: no dedicated < 360 px handling. |

### 12.6 Motion / accessibility states

| Case | Expected behaviour |
|---|---|
| `prefers-reduced-motion: reduce` | `useReducedMotion` disables route reveal, question transitions, analyzing enter animation, parallax; content renders in final static state. `marketing.css` gates the reveal behind `:root.reveal-enabled`. |
| No-JS | Reveal animation is JS-gated (`reveal-enabled` class added before paint), so content stays visible. Router requires JS (SPA) — no-JS shows an empty `#root`. |
| Keyboard nav | Skip link to `#main` (marketing). `MobileMenu` focus trap + Esc. `More ▾` dropdown Esc + focus return. FAQ is static (no accordion). |
| Screen reader | Landmarks present (`header`/`nav`/`main`/`footer`); one `h1` per page (tests assert this on marketing routes); `aria-live="polite"` on add-to-bag; `role="status"`/`role="alert"` on form feedback. |

---

## 13. UI/UX Specification

### 13.1 Layout principles

- **Containers:** `max-w-6xl` (marketing) / `max-w-3xl` (funnel, report, legal) / `max-w-2xl`–`max-w-5xl` (app). Gutters `px-6` → `md:px-10`.
- **Vertical rhythm:** marketing sections `py-20`/`md:py-28`; `--ink` bands `py-24`/`md:py-32`; report bands `py-14`–`py-20`.
- **Editorial signatures:** left-aligned headers, gold margin numerals on multi-step sections, thin `border-accent` rules, `.bg-grid-lines` graph-paper on cream sections (with a cream text-halo so grid lines never appear to cut through glyphs — `src/styles/marketing.css`).
- **Tone bands:** light (cream `--background`) vs. `--ink` (`#201812`, `--ink-foreground` text). Hero, CTA, regimen, pinned steps use `--ink`.

### 13.2 Interaction patterns

| Pattern | Component | Behaviour |
|---|---|---|
| Primary action | `CtaButton` / `funnelPrimaryBtn` | One filled `bg-primary` pill; `disabled:opacity-40`; always the single most-important action on screen. |
| Secondary action | `funnelSecondaryBtn` / bordered pill | Outline; hover → `border-accent`. |
| Selectable card | `funnelOptionCard` | Visually-hidden radio/button; `has-[:checked]` styling; used for gender + question answers + plan durations. |
| Text input | `funnelField` / marketing `FIELD_CLASS` | `rounded-md`, `focus:border-accent`, no visible label-less inputs (all have `<label>` or `aria-label`). |
| Section header | `SectionHeading` / `DisplayHeading` | Fluid `clamp()` display type; optional two-tone "ghost" word (`aria-hidden` decorative). |
| Body copy | `Prose` | `max-w-prose`, size `l`/`m`, `onInk` variant. |
| Pending value | `PendingChip` | `<mark>` with dashed gold border: `[PENDING: label]`. Never animated; never hidden behind tabs/carousels. |
| Feedback | `role="status"` (success/notice) / `role="alert"` (error) | Inline, adjacent to the control. |
| Progress indicator | `ProgressRail` | Non-interactive step dots (diagnosis: 5, start: 3). |
| Route entrance | `data-animate` + `useRevealOnRoute` | Rise-up + fade on every route change; reduced-motion → static. |

### 13.3 State coverage per interactive surface

| Surface | Loading | Empty | Error | Success | Disabled |
|---|---|---|---|---|---|
| `/diagnosis/photos` | per-slot "Uploading…" | dashed "Add photo" slot | inline `role="alert"` (type/size/generic) | thumbnail + "Remove" | Continue button until 4 photos |
| `/diagnosis/analyzing` | "analyzing" strip ticking; "Finalizing your analysis…" | — | — | auto-advance to `/diagnosis/ready` | Back hidden on Q1 |
| `/diagnosis/ready` | — | — | inline invalid-email | navigate to `/report/:id` | — |
| `/start` sign-up | — | — | inline (email/password/duplicate) | navigate to `/start/plan` | magic-link button permanently disabled |
| `/start/checkout` | "Submitting…" button label | — | inline card/expiry/cvc/payment | navigate to `/start/success` | Submit while `submitting`; alt-payment button always disabled |
| `/bag` | — | empty-bag CTA | — | qty updates live | — |
| `/bag/checkout` | "Submitting…" | redirect if empty | inline card/payment | navigate to `/bag/success` (+ clear cart) | Submit while `submitting` |
| `/app` Today | — | 0/N checklist, 0% adherence | — | checkbox toggle → strike-through | — |
| `/app/progress` | per-slot busy | "No photo yet" | inline upload error | thumbnail appears in compare + timeline | — |
| `/app/care` | — | only day-1 message at start | — | "Thanks…" stub notice after compose | — |
| `/app/rescan` | — | "Available in N days" when locked | — | (locked→) link to `/diagnosis` enabled at day ≥ 90 | CTA `pointer-events-none` while locked |
| `/support` contact form | — | — | native `required` | `role="status"` "not connected" notice | — |

### 13.4 Reusable UI inventory (do not re-invent)

`src/app/components/`:
- **brand/**: `Wordmark` (img logo), `LocaleToggle`, `PendingChip`, `ProgressRail`
- **marketing/**: `Section`, `SectionHeading`, `DisplayHeading`, `Prose`, `Eyebrow`, `ArrowLink`, `CtaButton`, `CtaBand`, `ArcMotif`, `CompanyDetails`, `displayScale` (`DISPLAY_CLAMP`)
- **diagnosis/**: `PhotoUpload`, `QuestionCard`, `AnalyzingStrip`, `downscaleImage`, `questions`
- **shell/**: `MarketingShell`, `FunnelShell`, `Header`, `MobileMenu`, `Footer`
- **report/**: `ReportView`
- **funnel/**: `funnelStyles` (shared class strings)
- **ui/**: full shadcn/ui primitive set + `cn()` (in `ui/utils.ts`) + `useIsMobile()` (in `ui/use-mobile.ts`) — **largely unused by app code**; available.
- **lib/**: `useRevealOnRoute`, `useReducedMotion`, `useScrollCondense`

---

## 14. Design System / Visual Requirements

**Source of truth:** `src/styles/theme.css` (CSS custom properties, shadcn variable names) + `@theme inline` block mapping them to Tailwind v4 utilities. `src/styles/tokens.ts` is a hand-maintained JS mirror (kept honest by `tokens.test.ts`).

### 14.1 Colour (light; the only theme in practice)

| Token | Hex | Role |
|---|---|---|
| `--background` | `#f9f6ef` | Ivory page ground |
| `--foreground` | `#2a2320` | Warm near-black text |
| `--card` | `#ffffff` | Card surface |
| `--primary` / `--primary-foreground` | `#745f50` / `#f9f6ef` | Gray-brown — the single filled CTA |
| `--accent` / `--accent-foreground` | `#a97b45` / `#f9f6ef` | Brass/gold — rules, numerals, active nav, badges; **non-text or ≥24 px only** |
| `--secondary` / `--muted` | `#f0e3d3` / `#efe7da` | Cream / warm neutral |
| `--muted-foreground` | `#6e635a` | Secondary text |
| `--border` / `--input` | `#e4d9c8` | Sand hairlines, grid motif |
| `--destructive` / `-foreground` | `#b3261e` / `#ffffff` | Errors |
| `--ink` / `--ink-foreground` | `#201812` / `#f4efe4` | Dark editorial band + its text (≈13:1) |
| `--accent-ghost` / `--ink-ghost` | `#d8ccb9` / `#4a3f34` | Two-tone "ghost" display words (decorative, `aria-hidden`) |
| `--ring` | `#a97b45` | Focus ring (follows accent) |
| `--radius` | `0.5rem` | Base radius; `sm/md/lg/xl` derived |

`.dark` block exists (oklch values) but **no toggle wires it** — treat the product as light-only unless a dark mode is explicitly commissioned.

### 14.2 Typography

| Role | Latin | Hebrew | Where |
|---|---|---|---|
| Display (`DisplayHeading`, `SectionHeading`, pull-quotes) | Playfair Display | Frank Ruhl Libre | `--font-display`; `font-display` utility |
| Body / UI / nav / buttons (marketing + funnel) | Montserrat | Heebo | `--font-body`; `font-body` on shells |
| Legacy default (`body`, report base) | Libre Franklin | Heebo | `--font-sans` |

Fonts load via Google Fonts `@import` in `src/styles/fonts.css`. Type scale is Tailwind utilities + `clamp()` for fluid display sizes (`displayScale.DISPLAY_CLAMP`, per-page `clamp()` in hero headings). Base element sizes are set in `@layer base` so utilities always win.

### 14.3 Imagery

`.img-editorial` utility: `filter: saturate(.92) contrast(1.04) sepia(.10)`. Assets live in `src/assets/` (+ `BANNERS/`, `BEFORE AND AFTER RESULT/`, `OBJECTIVE MEASUREMENT/`, `PRODUCTS/`). Decorative images `alt=""`; meaningful ones carry i18n-key alt text. Treated stock is a **documented concept stopgap** — true art direction is a follow-up.

### 14.4 Motion

Library: `motion` (`motion/react`). Effects: route-change rise-up (`useRevealOnRoute`), parallax + mask-reveal on Home/How-It-Works, question-card slide transitions, sticky header condense (`useScrollCondense`). **Hard requirement:** every effect has a `prefers-reduced-motion` static fallback (`useReducedMotion` + the `:root.reveal-enabled` gate). Verified by `useReducedMotion.test.tsx`.

### 14.5 Iconography

Inline SVG only (e.g. `CheckIcon` in `CtaBand`, chevrons, hamburger/close in `Header`/`MobileMenu`). No icon library. `lucide-react` is a dependency but not used by app code.

---

## 15. Technical Requirements

Full detail in [`TECHNICAL-SPECIFICATION.md`](./TECHNICAL-SPECIFICATION.md). Headlines:

- **Stack:** React 18.3.1, react-router 7.13.0 (`createBrowserRouter` data router, module-scoped), Vite 6.3.5, Tailwind CSS v4 (`@tailwindcss/vite`, no config), TypeScript 5.7.3 (`--noEmit` only; esbuild strips types at build), Vitest 3 + Testing Library + jsdom. pnpm workspace.
- **No backend.** Every server concern is a typed stub with a `TODO` marker (see `TECHNICAL-SPECIFICATION.md` §"Backend requirements").
- **State:** four React context providers (`LocaleProvider`, `AuthProvider`, `SessionProvider`, `CartProvider`), all persisted to `localStorage` (`roote.*` prefix); photo blobs to IndexedDB (`roote` DB, `blobs` store). No cross-device sync.
- **Domain purity:** `deriveAnalysis`, `buildReport`, `buildProgram`, `programProgress` helpers, `formatMoney`, `collectPending` are pure (no React/DOM/storage imports) and independently unit-tested.
- **Content pipeline:** `roote.config.ts` (facts) + `i18n/messages/{en,he}.ts` (copy) → `buildReport` / `resolvePlanTreatments` → resolved, localized, pending-flagged view-models → dumb renderers. Renderers never read config or i18n for domain content directly.
- **Build/CI gates that must stay green:** `pnpm test` (206 tests), `pnpm build`, `pnpm typecheck` (0 errors). No lint step exists.

---

## 16. Data Requirements

Full entity detail in [`TECHNICAL-SPECIFICATION.md`](./TECHNICAL-SPECIFICATION.md) §"Data model". Principal entities:

| Entity | Home | Key fields | Lifecycle |
|---|---|---|---|
| `SessionState` | `sessionStore.tsx` + `localStorage['roote.session']` | `diagnosis {gender, photos[], answers}`, `analysis`, `reportId`, `account.email`, `draftDurationDays`, `program` | Built up through the funnel; `reset()` clears. |
| `HairAnalysis` | `domain/analysis/types.ts` | `scale`, `stage`, `severityBand`, `flaggedZones[]`, `densityByZone[]`, `metrics[]`, `notes[]`, `planEmphasis`, `summaryPlainKey`, `recommendedDurationDays` | Output of `deriveAnalysis` (keys only); frozen into `Program.analysisSnapshot`. |
| `ReportModel` | `domain/report/types.ts` | `meta`, `titles`, `photos[]`, `analysis`, `hairLossType`, `currentSituation`, `plan`, `regimen`, `actives`, `expect`, `faq`, `recommendedDuration`, `pricing`, `claims[]`, `cta`, `disclaimers`, `pending[]` | Rebuilt on demand by `buildReport`; never persisted. |
| `Program` | `domain/program/types.ts` + `localStorage['roote.session'].program` | `orderId`, `reportId`, `analysisSnapshot`, `durationDays` (90/120/180/270/360), `startDate`, `endDate`, `plan {core[], supporting[]}`, `completionLog {isoDate: taskKey[]}`, `progressPhotos[]`, `reminders[]` | Minted by `buildProgram` at checkout success; mutated by app actions. |
| `CatalogProduct` | `content/catalog.ts` | `sku`, `name`, `descKey`, `photo` | Static; 17 SKUs / 5 categories. |
| `CartLine` | `cart.tsx` + `localStorage['roote.cart']` | `sku`, `qty` (1–20) | Add/setQty/remove/clear. |
| `Account` | `auth.tsx` + `localStorage['roote.accounts']` | `email`, `digest` (non-crypto) | Sign-up creates; change-password updates. |
| `AuthSession` | `auth.tsx` + `localStorage['roote.authSession']` | `email`, `since` | Sign-in/up sets; sign-out clears. |
| `Order` (`ProgramOrder | BagOrder`) | `store/checkout.ts` | `kind`, `reportId`+`durationDays` / `lines`, `contact{…}`, `card{last4, expiry}` | Built at submit, passed to the one `submitPayment` stub, **not persisted**; **full card number and CVC never enter it**. |
| `OrderRecord` | `store/orders.ts` + `localStorage['roote.orders']` | `id`, `kind`, `at` (ISO), `label` | `recordOrder()` on payment success (both flows); max 20, newest first; shown on `/app/profile`. |
| Photo blob | IndexedDB `roote/blobs`, key = uuid | `{buffer: ArrayBuffer, type: string}` | `putBlob` on capture; `deleteBlob` on replace/remove (best-effort). Thumbnails (data URLs) live in JSON. |

`TBD`: real pricing figures, effectiveness/timing claims, supporting-treatment identities, final disclaimer wording, currency. All currently `null` in config → `[PENDING]`.

---

## 17. API / Backend Requirements

There is **no backend**. The following are **Backend Requirements — Not Yet Implemented**, each with a stub the UX already talks to. Full request/response sketches in [`TECHNICAL-SPECIFICATION.md`](./TECHNICAL-SPECIFICATION.md) §"Backend requirements".

| # | Capability | Current stub | Marker |
|---|---|---|---|
| BE-1 | Real hair analysis (photo CV) | `hairhealthAdapter.requestHairhealthAnalysis` — multipart POST to `${VITE_HAIRHEALTH_API_URL}/v1/analyze`, "PLACEHOLDER CONTRACT" | file docstring |
| BE-2 | Auth (customer accounts, sessions, password reset) | `store/auth.tsx` — `localStorage`, non-crypto digest | `TODO: real auth (backend) — Shopify customer accounts / Supabase / Clerk` |
| BE-3 | Email delivery (report link, PDF, transactional) | none; `/diagnosis/ready` submit just stores the address | `TODO: email backend` (ReadyStep) |
| BE-4 | Payment + order creation (**one** integration for program *and* bag) | `store/checkout.ts` `submitPayment(order: Order)` — 400 ms delay, fake `orderId`; both `/start/checkout` and `/bag/checkout` use the shared `CheckoutFields` + this one call | `TODO: Marwell — wire to Shopify/payment backend` |
| BE-6 | Photo upload + storage | `PhotoUpload` → IndexedDB blob (local only) | `TODO: real upload + storage (backend)` |
| BE-7 | Notification / reminder scheduling | `/app` reminders card ("coming soon"); `Program.reminders` unused | `TODO: notification backend` |
| BE-8 | Support ticketing | `/support` contact form + `/app/care` compose — both stubs | `TODO: wire to support backend` |
| BE-9 | Re-scan analysis + Before/After delta | `/app/rescan` links back to `/diagnosis`; no `deriveRescan` | spec `superpowers/specs/2026-09-01` §8.5 |
| BE-10 | Product/price catalogue + inventory | `content/catalog.ts` static; prices `[PENDING]` | — |
| BE-11 | Locale default by geo-IP | toggle + `localStorage` only | `TODO: IP geolocation default (backend)` |
| BE-12 | Pricing / claims / content service | `roote.config.ts` `null`s → `[PENDING]` | brief §5 — client must supply |

---

## 18. Acceptance Criteria (major features)

`Given/When/Then`, testable. Feature-complete list in [`REQUIREMENTS.md`](./REQUIREMENTS.md) alongside each `US-*`. Representative set:

| ID | Criterion |
|---|---|
| AC-01 | **Given** a fresh browser at `/`, **when** the page renders, **then** the `<h1>` reads "Regrowth …" (EN) and at least one link labelled "Start Free Diagnosis" points to `/diagnosis`. *(App.test.tsx)* |
| AC-02 | **Given** locale `he` (default), **when** any page renders, **then** `<html dir>` is `rtl` and `lang` is `he`, and money/dates format `he-IL`. |
| AC-03 | **Given** the diagnosis funnel, **when** the user has not chosen a gender, **then** direct navigation to `/diagnosis/photos` redirects to `/diagnosis/gender`. *(diagnosis guards tests)* |
| AC-04 | **Given** `/diagnosis/photos`, **when** fewer than 4 angle photos are present, **then** the Continue button is disabled and a "have X of 4" hint shows. |
| AC-05 | **Given** an image over 15 MB or a non-image file, **when** selected in a photo slot, **then** an inline `role="alert"` error shows and no blob is stored. |
| AC-06 | **Given** the analyzing screen, **when** not all 5 questions are answered, **then** the progress strip cannot reach 100% and the screen does not advance. |
| AC-07 | **Given** answers `{crown, 1-5y, never, yes, both}` for a male, **when** `deriveAnalysis` runs, **then** `scale='norwood'`, `severityBand='moderate'`, `planEmphasis='stabilize-regrow'`, `flaggedZones=[crown-vertex]`, `recommendedDurationDays=270`. *(deriveAnalysis tests)* |
| AC-08 | **Given** any completed diagnosis, **when** `buildReport` runs, **then** `pricing.price`, all `pricing.compareAll[].price`, and every `claims[].valueLabel` are `PENDING` markers (config has no real values), and `model.pending` is non-empty. *(buildReport tests)* |
| AC-09 | **Given** `/report/:id` where `id` is not the session's `reportId`, **when** the route renders, **then** `ReportNotFound` shows with a restart CTA. |
| AC-10 | **Given** a signed-out visitor, **when** they submit valid email + 8+ char password at `/start`, **then** an account is created, `auth.email` is set, and they land on `/start/plan` with a `radiogroup` of durations. *(App.test.tsx)* |
| AC-11 | **Given** `/start/plan`, **when** it first renders, **then** the AI-recommended duration is pre-selected and badged "Recommended for you". |
| AC-12 | **Given** `/start/checkout` with card `4242…` (16 digits), expiry `12/30`, CVC `123`, **when** submitted, **then** after ~400 ms a `Program` is created (start = today, end = today + durationDays, plan frozen) and the user lands on `/start/success`; **and** the built `Order` contains only `card.last4` + `card.expiry`. *(CheckoutStep / program tests)* |
| AC-13 | **Given** `localStorage['roote.debug.forceCheckoutFailure']='1'` (DEV), **when** checkout is submitted, **then** an inline payment error shows and no `Program` is created. |
| AC-14 | **Given** an active `Program` at program day 12 of 180, **when** `/app` renders, **then** the header shows "Day 12 of 180", the progress bar is ~7%, and the routine checklist reflects `completionLog[today]`. |
| AC-15 | **Given** the routine checklist, **when** a task checkbox is toggled, **then** `program.completionLog[today]` gains/loses that `taskKey` and the label strikes through. *(sessionStore tests)* |
| AC-16 | **Given** `daysRemaining ≤ 21` or the program has ended, **when** `/app` renders, **then** the reorder card shows with a CTA to `/start/plan`. |
| AC-17 | **Given** program day < 90, **when** `/app/rescan` renders, **then** the start-analysis CTA is disabled and copy shows "Available in N days". |
| AC-18 | **Given** `/app/care` at program day 1, **when** it renders, **then** only the day-1 message is visible; the day-14 message appears once program day ≥ 14. |
| AC-19 | **Given** the marketing contact form at `/support`, **when** submitted, **then** a `role="status"` "not connected in the preview" notice shows and no navigation/network/storage occurs. *(spec §9)* |
| AC-20 | **Given** the product catalogue, **when** "Add to bag" is clicked, **then** `cart` gains/increments that SKU (clamped 1–20), the button briefly reads "Added", and `/bag` lists the line with a `[PENDING: … price]` chip. |
| AC-21 | **Given** a non-empty bag, **when** the bag checkout is submitted with valid-shape card fields, **then** `/bag/success` shows a `bag-…` order id and the cart is cleared. |
| AC-22 | **Given** `en.ts` and `he.ts`, **when** `messages.test.ts` runs, **then** their key sets are identical and no value is an empty string. |
| AC-23 | **Given** `prefers-reduced-motion: reduce`, **when** routes change, **then** no transform/opacity animation gates content visibility. *(useReducedMotion.test.tsx)* |
| AC-24 | **Given** the repo, **when** `pnpm typecheck` runs, **then** it exits 0 with no diagnostics. |

---

## 19. Traceability Matrix

`Business objective → Requirement → User story → Feature → User flow → Acceptance criteria`. Condensed; the per-row detail lives in the companion docs.

| BO | FR (range) | US (range) | FEAT | UF | AC |
|---|---|---|---|---|---|
| BO-1 (whole-product artefact) | FR-001–FR-020 | US-001–US-010 | FEAT-05, FEAT-06, FEAT-09 | UF-01, UF-13, UF-14 | AC-01, AC-02, AC-20, AC-22 |
| BO-2 (nothing unverified in UI) | FR-081–FR-085 | US-040–US-043 | FEAT-02, FEAT-07, FEAT-23(removed) | UF-06 | AC-08, AC-19 |
| BO-2 (analysis honesty) | FR-021–FR-035 | US-011–US-020 | FEAT-13–FEAT-19 | UF-02, UF-03, UF-04, UF-05 | AC-03–AC-07 |
| BO-3 (handoff-ready) | FR-090–FR-095, NFR-011–NFR-020 | US-050–US-055 | FEAT-18, FEAT-25, FEAT-30 | UF-15 | AC-12, AC-13, AC-24 |
| BO-4 (IL-first) | FR-081–FR-083, NFR-004–NFR-006 | US-044–US-047 | FEAT-01 | UF-14 | AC-02, AC-22 |
| PO-3 (report) | FR-036–FR-045 | US-021–US-026 | FEAT-20, FEAT-21 | UF-06 | AC-08, AC-09 |
| PO-4 (purchase) | FR-046–FR-060 | US-027–US-035 | FEAT-12, FEAT-24–FEAT-27 | UF-07, UF-08 | AC-10–AC-13 |
| PO-5 (program app) | FR-061–FR-080 | US-036–US-039 | FEAT-28–FEAT-38 | UF-09, UF-10, UF-11, UF-12 | AC-14–AC-18 |
| PO-6 (shop) | FR-011–FR-020 | US-006–US-010 | FEAT-09–FEAT-11 | UF-13 | AC-20, AC-21 |

---

## 20. Open Questions / Clarifications

Blocking items first. `⛔` = blocks meaningful further development in that area; `⚠️` = should be resolved before launch; `ℹ️` = nice to settle.

### Business
- **OQ-BIZ-1 `⛔`** Pricing for all five program durations (90/120/180/270/360) + per-day + renewal price + shipping. Everything money-related is `[PENDING]`.
- **OQ-BIZ-2 `⛔`** Effectiveness %, time-to-visible-results, re-scan window, doctor-follow-up cost — any substantiated values, or keep them out entirely? (Brief §5 forbids inventing.)
- **OQ-BIZ-3 `⚠️`** Currency: ILS (customers), USD (entity), or both? (`roote.config.currency = 'ILS'` placeholder.)
- **OQ-BIZ-4 `⚠️`** Supporting treatment identity — what are "derma-stim" and "cleanser" actually? Is there an oral component? One combined topical vs. multiple products?
- **OQ-BIZ-5 `⚠️`** Does ROOTÉ offer physician follow-ups at all (drives a report stat tile)?
- **OQ-BIZ-6 `ℹ️`** Reorder lead time (assumed 21 days). Subscription auto-renewal: real, or manual reorder only? The Terms of Sale currently *describe* auto-renewal.
- **OQ-BIZ-7 `ℹ️` (direction taken 2026-09-03 — keep the bag as a secondary refills/add-ons surface)** Is the à-la-carte shop (`/bag`) a real go-to-market motion? **Decision:** keep it, positioned as refills & add-ons for people who already have (or don't want) a program — *not* a co-equal storefront. Implemented: (a) the two checkouts were unified — one `Order` discriminated union, one `submitPayment`, one shared `CheckoutFields`, one order-id scheme; (b) bag orders show in an order history on `/app/profile`; (c) the bag is now discoverable — a cart icon + count badge in the marketing header (→ `/bag`), and a "Shop products" link in the `/app` sidebar (→ `/products`). Remaining `⚠️` sub-item: confirm real prices + the sub-processor / fulfilment model when a backend lands (BE-4). Removing the shop entirely is still an option if the client says demo-only (delete `src/app/routes/bag/`, `cart.tsx`, `catalog.ts`, `/bag/*` routes, `cart.*`/`bag.*` keys, the header cart, and the `/app` shop link).

### UX / Product
- **OQ-UX-1 `⚠️`** Minimum photos to proceed: guard says ≥1, the Photos screen requires all 4. Which is the rule?
- **OQ-UX-2 `ℹ️`** Gender step: Male/Female only, or add a third / "prefer not to say" option? (Drives Norwood vs. Ludwig.)
- **OQ-UX-3 `ℹ️`** Should `/diagnosis/analyzing` be one combined screen (current) or two sequential screens (loading, then survey)?
- **OQ-UX-4 `⚠️`** Re-scan: does it re-ask the questionnaire? Should the Before/After be labelled illustrative until a real provider is wired? There is currently no delta model at all.
- **OQ-UX-5 `✅ RESOLVED` (2026-09-03)** The marketing header now has a bag icon + `cart.count` badge linking to `/bag` (no mini-cart flyout — a plain link). A "Shop products" link was also added to the `/app` sidebar.
- **OQ-UX-6 `ℹ️`** Reminders: keep as "coming soon", or build the per-task time-picker UI now (route + `Program.reminders` already exist)?

### Content / Legal / Regulatory
- **OQ-LEG-1 `⛔`** Medical disclaimers, "not a diagnosis" language, marketing-consent copy at email capture, data-handling statement — all draft; need legal review (EN + HE).
- **OQ-LEG-2 `⚠️`** The Privacy Policy is drafted (2026-09-03) and accurate to the preview build's client-only data handling. Before any real data collection it still needs: confirmed retention periods per data type; the applicable data-protection framework(s) and any supervisory-authority details; the production sub-processor list (payment / shipping / email / hosting); and formal legal review (EN + HE). These are marked `TODO: confirm with client` in `src/i18n/messages/en.ts`.
- **OQ-LEG-3 `⚠️`** Terms of Sale (`/terms-of-sale`) is a Claude-drafted standard template with `TODO: confirm with client` on: 30-day return window, who pays return postage, 2–5 business-day handling, subscription renewal term + reminder policy, governing-law venue (currently California / LA County).
- **OQ-LEG-4 `⚠️`** Formula: show active-ingredient percentages publicly? (`displayPercentagesPublicly = false`.) Formula is `status: proposed`, `pending-regulatory-review`.
- **OQ-LEG-5 `⚠️`** How explicitly must the UI state the analysis is a demo model pending hairhealth.ai? (`disclaimers.demo` current wording.)
- **OQ-LEG-6 `ℹ️`** Support hours + timezone on `/support` (`Sunday–Thursday, 9:00–17:00`, `TODO: confirm`). US entity vs. IL customers.

### Design
- **OQ-DES-1 `ℹ️`** Confirm Hebrew display/body typefaces (Frank Ruhl Libre / Heebo assumed).
- **OQ-DES-2 `ℹ️`** Confirm final logo asset (currently `src/assets/logo.png`; SVG preferred). `favicon.png` is ~590 KB — should be downscaled.
- **OQ-DES-3 `ℹ️`** Is a dark theme in scope? Tokens exist, nothing toggles them.
- **OQ-DES-4 `ℹ️`** Imagery is treated stock as a stopgap; commission real art direction?

### Technical
- **OQ-TECH-1 `⚠️`** Confirm the hairhealth.ai request/response contract (`/v1/analyze`, field names, auth scheme, scale vocabulary) against their real API docs before relying on `hairhealthAdapter`.
- **OQ-TECH-2 `⚠️`** Which backend platform for auth/payment/orders? Prior TODOs name Shopify customer accounts / Supabase / Clerk and "Shopify Checkout / payment intent".
- **OQ-TECH-3 `ℹ️`** `/app/*` is only reachable in DEV by completing `/start/checkout` — add a dev "load demo program" seed on `/app` (spec `superpowers/specs/2026-09-01` §8.7 describes one)?
- **OQ-TECH-4 `✅ RESOLVED` (2026-09-03)** `CLAUDE.md` previously described the original Figma Make Etsy template. It has been rewritten to describe ROOTÉ (project summary, commands, hard rules, architecture, gotchas, pointer to these docs).
- **OQ-TECH-5 `ℹ️`** Remove orphaned i18n keys (`landing.*` ~60, `marketing.blog.*`) or keep them for the planned `/blog` + `/results` build?
- **OQ-TECH-6 `ℹ️`** Add an ESLint config + `lint` script? (`tsc --noEmit` now exists; lint is the remaining gap.)
- **OQ-TECH-7 `✅ RESOLVED` (2026-09-03)** The previously-large uncommitted working tree on `main` was committed and pushed as `09f68e4` (`64a94ae..09f68e4`, `github.com/precioushopey/roote.us`). `main` == `origin/main` == `09f68e4`; working tree clean. Future work starts from there.
- **OQ-TECH-8 `ℹ️`** Was removing the PDF report intentional and permanent? (`@react-pdf/renderer` + `src/pdf/` deleted; the original spec treats the PDF as a core deliverable.)

---

## 21. Assumptions

| ID | Assumption | Basis | Risk if wrong |
|---|---|---|---|
| ASSUMPTION-01 | The product is a **stakeholder-review + developer-handoff artefact**, not a production deployment. | `noindex`, no backend, `[PENDING]` everywhere, demo disclaimers. | Low. |
| ASSUMPTION-02 | `main` (at `origin/main` `64a94ae`) plus the current working tree is the intended integration state; `roote/p2b` and `roote/website` worktrees are historical. | Branch list, worktree list, README recency. | Medium — affects where dev work starts. |
| ASSUMPTION-03 | Every `[PENDING]` and `TODO: confirm with client` is a **real open decision**, not something the dev team should fill in. | Brief §5 "no invented content", spec constraints. | High if ignored — regulatory/legal exposure. |
| ASSUMPTION-04 | Hebrew is the primary UX; English is secondary. | Default locale, `he-IL` formatting, `index.html lang="he" dir="rtl"`. | Low. |
| ASSUMPTION-05 | The à-la-carte shop and the program funnel are **both** intended product motions (not one being throwaway). | Both fully built, tested, navigable, and now sharing one checkout. | Medium — still a product call (OQ-BIZ-7), but low technical cost either way. |
| ASSUMPTION-06 | The PDF report removal was deliberate (scope cut), not an accident. | Clean deletion of `src/pdf/*` + dependency removal in the same change set. | Medium — see OQ-TECH-8. |
| ASSUMPTION-07 | No dark theme is required for this build. | Tokens present, no toggle, no consumer. | Low. |
| ASSUMPTION-08 | Analysis "levels" (`low/medium/high`) and word-band metrics are acceptable stand-ins until a real provider gives numbers. | Honesty-guard section of the original spec; no numeric measurements anywhere. | Low. |
| ASSUMPTION-09 | Client-only persistence (localStorage + IndexedDB, single device) is acceptable for the demo. | `persistence.ts`; explicit `TODO: sync (backend)`. | Low for demo; must change for production. |
| ASSUMPTION-10 | The 5-question questionnaire content is final (verbatim from the brief). | `questions.ts` matches brief §9. | Low. |
| ASSUMPTION-11 | `recommendedDurationTable` values (120–360) are tunable business config, and 90 days being non-recommendable is intentional. | Comment in the original spec §4.7. | Low. |
| ASSUMPTION-12 | *(Superseded 2026-09-03.)* The marketing header now carries a bag icon + `cart.count` badge (→ `/bag`), and the `/app` sidebar links to `/products` — the à-la-carte shop is a kept, discoverable secondary surface. | Implemented. | — |

---

## 22. Development Readiness

### Checklist

| Item | State | Note |
|---|---|---|
| Requirements defined | ✅ | `REQUIREMENTS.md` (`FR-*`, `NFR-*`) |
| User roles defined | ✅ | §5 + matrix (client-side gate states; no server roles) |
| User stories defined | ✅ | `REQUIREMENTS.md` (`US-*`) |
| User flows defined | ✅ | `USER-FLOWS.md` (`UF-01`…`UF-15`, Mermaid) |
| Features identified | ✅ | §10 (41 features, status-classified) |
| Business rules defined | ✅ | `BUSINESS-RULES.md` (`BR-*`, evidence-linked) |
| Edge cases considered | ✅ | §12 (incl. `GAP` markers) |
| Acceptance criteria defined | ✅ | §18 + per-story in `REQUIREMENTS.md` |
| Data requirements documented | ✅ | §16 + `TECHNICAL-SPECIFICATION.md` |
| API/backend requirements documented | ✅ | §17 + `TECHNICAL-SPECIFICATION.md` (12 backend capabilities, all stubbed) |
| UI/UX behaviour documented | ✅ | §13 (state tables per surface) |
| Responsive behaviour documented | ✅ | §12.5, §13 |
| Accessibility considerations documented | ✅ | §12.6, §14.4; partial in code (no FAQ accordion a11y, some app-route headings start at `h2`) |
| Dependencies identified | ✅ | `TECHNICAL-SPECIFICATION.md` |
| Open questions identified | ✅ | §20 (prioritised; 3 `⛔` blockers) |
| Technical constraints identified | ✅ | §3.3 |
| Existing implementation understood | ✅ | §10, companion docs, "Implementation vs. intent" below |
| README verified | ✅ | Rewritten 2026-09-03; see change log in README |
| `CLAUDE.md` accurate | ✅ | Rewritten 2026-09-03 to describe ROOTÉ (was the Figma Make Etsy template). OQ-TECH-4 resolved. |
| Lint/format tooling | ❌ | None. OQ-TECH-6. |
| Branch/commit strategy for resuming work | ✅ | Working tree committed + pushed as `09f68e4` (2026-09-03); starts clean. OQ-TECH-7 resolved. |

### Verdict: **READY WITH CONDITIONS**

The codebase is coherent, well-tested (206 tests), typechecks clean, and every screen in the intended journey exists and is navigable. A developer can start wiring backends against clear seams, and `CLAUDE.md` + this doc set now onboard a contributor accurately. **However**, development that touches product/legal content is **blocked** until the three `⛔` open questions are answered (OQ-BIZ-1 pricing, OQ-BIZ-2 substantiated claims, OQ-LEG-1 medical/consent/legal copy review). (OQ-TECH-7 — the uncommitted tree — is resolved: committed + pushed as `09f68e4` on 2026-09-03.)

---

## Implementation vs. intent (delta from the prior specs)

The two `docs/superpowers/specs/*` files are the **approved design intent**. This is where the shipped code diverges:

| Area | Prior spec said | Actually shipped |
|---|---|---|
| Diagnosis routes | `/diagnosis/:step` (one param route) | Discrete child routes: `intro`, `gender`, `photos`, `analyzing`, `ready` |
| Minimum photos | "Require ≥ 1, encourage all four" | Guard: ≥1. UI: all 4 required to continue. |
| Report PDF | Core deliverable (`@react-pdf/renderer`, `src/pdf/`, Node smoke test) | **Built (P2a) then removed.** `src/pdf/*` deleted; dep removed; no "Download PDF" button. |
| `ReportEmailPreview` | Route alongside the report | Component exists; **not routed**. |
| `/app` routes | `today`, `plan`, `reminders`, `progress`, `rescan` | `` (index=Today), `plan`, `progress`, `care`, `rescan`, `profile`. **No `/app/reminders`** (folded into a Today card). **Added `care`, `profile`.** |
| App nav labels | Today · Plan · Reminders · Progress | Today · My Plan · Progress · Care Team · Profile |
| `deriveRescan` | Pure deterministic Before/After delta model (TDD) | **Not built.** `/app/rescan` just compares stored photos and links to `/diagnosis`. |
| `deriveSchedule` / `tasksForDay` | Pure schedule model; `DailyTask` with `timeOfDay` | **Not built as such.** `programProgress.dailyTasks` flattens core+supporting into a flat `core:N`/`support:N` list; no time-of-day. |
| Marketing site | Home + How It Works + Science + Products + **Results & Reviews** + About + FAQ + Support + **Blog (index + 4 posts)** + Terms + Privacy | Home + How It Works + Science + Products + About + FAQ + Support + Terms + **Terms of Sale (new)** + Privacy. **No Results, no Blog.** `marketing.blog.*` keys orphaned. |
| `Landing` route | Minimal landing = funnel entry (P0/P1) | Replaced by full `Home`. `landing.*` keys (~60) orphaned. |
| Auth sign-in | "existing session skips to `/start/plan`"; sign-in mentioned | Full `/login` page added; `signIn`/`signOut` now wired (were dead in P2b). |
| Product shop | "not e-commerce with a catalogue" (original brief) | A 17-SKU catalogue + cart + `/bag/*` checkout **was added** (post-spec). Checkout consolidated with the program flow 2026-09-03 (shared `CheckoutFields`, one `Order` union, one `submitPayment`, order history on `/app/profile`); the product decision (keep as refills surface vs remove) is OQ-BIZ-7. |
| `CLAUDE.md` | To be rewritten for ROOTÉ in the P3 polish phase | **Rewritten 2026-09-03** to describe ROOTÉ. |
| `tsconfig.json` / typecheck | Explicitly *not* added ("esbuild type-stripping, no tsconfig") | **Added 2026-09-03** — `tsconfig.json` (strict) + `pnpm typecheck`. Supersedes that constraint. |
| Accent colour | `#8d7766` (original app spec) → `#a97b45` (marketing spec) | `#a97b45` (marketing spec won). |
