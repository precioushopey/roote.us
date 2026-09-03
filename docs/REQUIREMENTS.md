# ROOTÉ.US — Requirements & User Stories

Companion to [`DESIGN-SPECIFICATION.md`](./DESIGN-SPECIFICATION.md). See also [`BUSINESS-RULES.md`](./BUSINESS-RULES.md), [`USER-FLOWS.md`](./USER-FLOWS.md), [`TECHNICAL-SPECIFICATION.md`](./TECHNICAL-SPECIFICATION.md).

**Priority:** P1 = must (present & load-bearing today) · P2 = should · P3 = could / polish.
**Status:** `Implemented` · `Stub` (UI done, inert by design) · `Partial` · `Not built`.
Requirements describe the **intended behaviour**; the Status column says how close the code is.

---

## 1. Functional Requirements

### 1.1 Marketing site & navigation

| ID | Requirement | Actor | Priority | Status | Notes / evidence |
|---|---|---|---|---|---|
| FR-001 | The site shall render a marketing shell (sticky header + footer + skip-link) on all public marketing routes. | Visitor | P1 | Implemented | `MarketingShell`, `Header`, `Footer` |
| FR-002 | The header shall expose primary links (How It Works, Science, Products, About), a "More ▾" dropdown (FAQ, Support), a locale toggle, and a "Start Free Diagnosis" CTA to `/diagnosis`. | Visitor | P1 | Implemented | `Header.tsx` `PRIMARY_LINKS` / `MORE_LINKS` |
| FR-003 | On viewports `< lg`, header navigation shall collapse to a hamburger opening a full-screen menu with all links, the CTA, and the locale toggle; the menu shall trap focus and close on Esc. | Visitor | P1 | Implemented | `MobileMenu.tsx` |
| FR-004 | The header shall visually condense (transparent → solid) after ~80 px of scroll, gated by `prefers-reduced-motion`. | Visitor | P2 | Implemented | `useScrollCondense` |
| FR-005 | The footer shall present Explore / Company / Legal link columns, a "Start today" CTA, the copyright line, and the operating-entity line ("ROOTÉ is a brand of 91 ENTERPRISE LLC · PO BOX 48112, Los Angeles, CA 90036, United States"). | Visitor | P1 | Implemented | `Footer.tsx`, `roote.config.company` |
| FR-006 | The Home page shall present hero, value prop, quiz-intro, 4-step how-it-works, product components, root-cause profiles, research imagery, and a closing CTA band. | Visitor | P1 | Implemented | `Home.tsx` |
| FR-007 | Home hero + feature imagery shall use parallax / mask-reveal motion with a full static fallback under reduced motion. | Visitor | P2 | Implemented | `motion`, `useReducedMotion` |
| FR-008 | How It Works shall present a 4-step sequence, "what's in your kit" (from `roote.config.treatments`), an FAQ teaser, and a CTA band. | Visitor | P1 | Implemented | `HowItWorks.tsx` |
| FR-009 | Science shall present the mechanism narrative, an active-ingredient grid (from `roote.config.formula.ingredients`, doses `[PENDING]`), before/after imagery, and a CTA band. | Visitor | P1 | Implemented | `Science.tsx` |
| FR-010 | About shall present mission, story, and three values, with CTAs to `/diagnosis`. | Visitor | P2 | Implemented | `About.tsx` |
| FR-011 | FAQ shall present grouped Q&A (Getting started / The plan / Ingredients & safety) and a "still have questions?" CTA to `/support`. | Visitor | P2 | Implemented | `Faq.tsx` (static, no accordion) |
| FR-012 | Support shall show contact details (email `support@roote.us`, phone `+1 (310) 651-7283`, hours) and a contact form. | Visitor | P1 | Implemented | `Support.tsx`, `roote.config.company.support` |
| FR-013 | The support contact form shall validate required fields, and on submit shall display an inline `role="status"` "not connected in the preview" notice and perform no navigation, network, or storage. | Visitor | P1 | Stub | `Support.tsx` `ContactForm` |
| FR-014 | `/terms` shall present the Terms of Service (6 numbered sections with real bodies), a company-details block, and a "last updated" date. | Visitor | P1 | Implemented | `Terms.tsx`, `CompanyDetails` |
| FR-015 | `/terms-of-sale` shall present the Terms of Sale (intro + company details + 12 numbered clauses covering orders, prices/taxes, payment, shipping, returns, refunds, subscription auto-renewal, cancellation, medical disclaimer, warranty, liability, governing law) + a contact line + a "pending legal review" note. | Visitor | P1 | Implemented | `TermsOfSale.tsx` |
| FR-016 | `/privacy` shall present the Privacy Policy: intro + 6 sections (information collected, use of photos, retention, your rights, third-party sharing, contact) with bodies that accurately describe the preview build's client-only data handling; a "last updated" date and a "pending legal review" note. | Visitor | P1 | Implemented / Partial | `Privacy.tsx` — bodies drafted 2026-09-03; retention periods, DP framework, and production sub-processor list carry `TODO` markers |
| FR-016b | `/start/checkout` and `/bag/checkout` shall display, above the submit button, "By placing this order you agree to our [Terms of Sale]" with a link to `/terms-of-sale`. | Buyer | P2 | Implemented | `CheckoutStep.tsx`, `BagCheckout.tsx` (`*.checkout.termsAgree` keys) |
| FR-017 | Legal-page company facts (name, entity type, country, reg. number, EIN, incorporation date, authorized representative, address, email, phone) shall come from a single config source. | — | P1 | Implemented | `roote.config.company` + `CompanyDetails` |
| FR-018 | Every marketing page shall have exactly one `<h1>`, ordered headings, and landmark structure. | Visitor (AT) | P1 | Implemented | asserted by `marketingRoutes.test.tsx` |
| FR-019 | The marketing shell shall offer a skip-link to `#main`. | Visitor (AT) | P1 | Implemented | `MarketingShell.tsx` |
| FR-020 | Unknown routes shall redirect to `/`. | Visitor | P1 | Implemented | `App.tsx` `*` route |

### 1.2 Product shop & bag

| ID | Requirement | Actor | Priority | Status | Notes |
|---|---|---|---|---|---|
| FR-011a *(shop)* | `/products` shall render the full catalogue (17 SKUs across 5 categories + the active-ingredients group) with a sticky category filter and an "all" view. | Shopper | P1 | Implemented | `Products.tsx`, `catalog.ts` |
| FR-012a | Each product card shall show name, description, a `[PENDING: <name> price]` chip, and an "Add to bag" button. | Shopper | P1 | Implemented | `Products.tsx` `ProductGrid` |
| FR-013a | "Add to bag" shall add/increment the SKU in the cart (qty clamped 1–20), announce via `aria-live`, and briefly show an "Added" state. | Shopper | P1 | Implemented | `AddToBagButton`, `cart.tsx` |
| FR-014a | The cart shall persist to `localStorage['roote.cart']` and rehydrate on load. | Shopper | P1 | Implemented | `CartProvider` |
| FR-014b | The marketing header shall show a bag icon linking to `/bag`, with a count badge when `cart.count > 0`. | Shopper | P2 | Implemented | `Header.tsx` `BagLink`; aria-label `cart.open` |
| FR-014c | The `/app` desktop sidebar shall include a "Shop products" link to `/products` (positioning the shop as a refills/add-ons surface for program members). | Program member | P3 | Implemented | `AppShell.tsx`; `app.nav.shop` |
| FR-015a | `/bag` shall list cart lines (photo, name, description, qty stepper, remove, `[PENDING]` price) and an order summary (subtotal / shipping / total all `[PENDING]`), with "Checkout" and "Continue shopping" links. | Shopper | P1 | Implemented | `BagPage.tsx` |
| FR-016a | `/bag` with an empty cart shall show an empty state with a "Browse products" link. | Shopper | P1 | Implemented | `BagPage.tsx` |
| FR-017a | `/bag/checkout` shall present a contact form (name, email, phone, city, postal; country fixed to `IL`) and a payment form (card name/number/expiry/CVC), plus an order summary. | Shopper | P1 | Stub | `BagCheckout.tsx` |
| FR-018a | Bag checkout shall use the shared `CheckoutFields` form: validate card fields by **shape only** (`\d{13,19}`, `MM/YY`, `\d{3,4}`), never run real processing, and build a `BagOrder` (`kind:'bag'`) containing only `card.last4` + `card.expiry`. | Shopper | P1 | Stub | `BagCheckout.tsx`, `CheckoutFields.tsx`, `checkout.ts` |
| FR-018b | On a successful payment (either flow), the app shall append an `OrderRecord` (`id`, `kind`, timestamp, label) to local history and display it under "Recent orders" on `/app/profile`. | Buyer | P2 | Implemented | `orders.ts`, `AppProfile.tsx` |
| FR-019a | On successful stub submission, the app shall navigate to `/bag/success` with the order id in route state and clear the cart. | Shopper | P1 | Implemented | `BagCheckout.tsx` |
| FR-020a | `/bag/checkout` reached with an empty cart (and no order just placed) shall redirect to `/bag`; `/bag/success` reached without an order id shall redirect to `/products`. | Shopper | P1 | Implemented | guards in `BagCheckout` / `BagSuccess` |

### 1.3 Diagnosis funnel

| ID | Requirement | Actor | Priority | Status | Notes |
|---|---|---|---|---|---|
| FR-021 | The diagnosis funnel shall run in a minimal shell (wordmark → `/`, locale toggle) with a non-interactive 5-segment progress rail (Intro · Gender · Photos · Analysis · Results). | Visitor | P1 | Implemented | `FunnelShell`, `DiagnosisLayout`, `ProgressRail` |
| FR-022 | `/diagnosis` (index) and `/diagnosis/intro` shall present the value proposition and a single CTA to proceed; no input. | Visitor | P1 | Implemented | `IntroStep.tsx` |
| FR-023 | `/diagnosis/gender` shall present two selectable cards (Male / Female) and persist the choice to `session.diagnosis.gender`. | Visitor | P1 | Implemented | `GenderStep.tsx` |
| FR-024 | `/diagnosis/photos` shall present four guided capture slots (Front, Top, Crown, Hairline) using `<input type="file" accept="image/*" capture>`. | Visitor | P1 | Implemented | `PhotosStep.tsx`, `PhotoUpload` |
| FR-025 | Each photo shall be validated (`image/*`, ≤ 15 MB), client-side downscaled to a full-size JPEG + a 256 px thumbnail, stored as a blob in IndexedDB, with the thumbnail data URL kept in session state. | Visitor | P1 | Implemented | `PhotoUpload`, `downscaleImage`, `persistence.putBlob` |
| FR-026 | Replacing a photo shall delete the previous blob (best-effort); removing a photo shall delete its blob and clear it from state. | Visitor | P1 | Implemented | `PhotoUpload` |
| FR-027 | The Photos step shall block "Continue" until all four angles are present, showing a "have X of 4" hint. | Visitor | P1 | Implemented | `PhotosStep.tsx` — **conflicts with FR-030 guard; see OQ-UX-1** |
| FR-028 | `/diagnosis/analyzing` shall present a gated dual-progress screen: a persistent "analyzing" strip and a one-question-at-a-time questionnaire (5 questions), with animated transitions and a Back control (hidden on Q1). | Visitor | P1 | Implemented | `AnalyzingStep.tsx`, `AnalyzingStrip`, `QuestionCard`, `questions.ts` |
| FR-029 | The "analyzing" strip shall not reach 100% (and the screen shall not advance) until all five questions are answered and the user is on the finalizing view. | Visitor | P1 | Implemented | `gateReady={allAnswered && step >= QUESTIONS.length}` |
| FR-030 | Each diagnosis step shall guard its prerequisites and redirect backward to the earliest unmet step; unknown `:step` behaviour is handled by discrete routes (no catch-all inside `/diagnosis`). | Visitor | P1 | Implemented | `redirectForStep` in `guards.ts` |
| FR-031 | On questionnaire completion, the app shall generate a `reportId` (`crypto.randomUUID()`), run analysis, persist it to `session.analysis`, and navigate to `/diagnosis/ready`. | Visitor | P1 | Implemented | `AnalyzingStep.finish` |
| FR-032 | Analysis shall use the deterministic local model (`deriveAnalysis`) by default; when `VITE_HAIRHEALTH_API_URL` is set **and** photos exist, it shall call hairhealth.ai via `analyzeHair`, falling back to the local model on any failure. | Visitor / System | P1 | Implemented (local) / Stub (remote) | `analyzeHair.ts`, `hairhealthAdapter.ts` |
| FR-033 | `/diagnosis/ready` shall present a teaser (scale label, severity, flagged-zone count), the demo disclaimer, an email field, and a consent line. | Visitor | P1 | Implemented | `ReadyStep.tsx` |
| FR-034 | Submitting a valid email shall persist `session.account.email` and navigate to `/report/:reportId`; invalid email shows an inline error and blocks submit. | Visitor | P1 | Implemented (nav) / Stub (send) | `ReadyStep.tsx` — `TODO: email backend` |
| FR-035 | Answers and photos shall survive back-navigation and page refresh within the funnel. | Visitor | P1 | Implemented | `sessionStore` persistence |

### 1.4 Report

| ID | Requirement | Actor | Priority | Status | Notes |
|---|---|---|---|---|---|
| FR-036 | `/report/:reportId` shall render only when `reportId` matches `session.reportId` and `session.analysis` is present; otherwise `ReportNotFound` with a "restart your diagnosis" CTA. | Visitor | P1 | Implemented | `ReportPage.tsx`, `ReportNotFound.tsx` |
| FR-037 | The report shall be produced by the pure `buildReport({diagnosis, analysis, content, locale, reportId, assets})` returning a single `ReportModel`; renderers shall consume `ReportModel` only. | — | P1 | Implemented | `buildReport.ts` |
| FR-038 | The report view shall render, in order: ribbon, cover (greeting + 3 summary cells), your-scan (photos + Norwood/Ludwig stage strip + flagged-zone cards + situation paragraphs), regimen (core + supporting blocks), actives (ingredient spotlights), what-to-expect (stat tiles + timeline), your-program (recommended duration + compare-all table), FAQ, CTA band, disclaimers footer. | Visitor | P1 | Implemented | `ReportView.tsx` |
| FR-039 | Any value not supplied in `roote.config` (prices, per-day, effectiveness, timing, follow-up cost, unresolved localized strings) shall render as a `[PENDING: label]` chip, never as raw null/empty. | Visitor | P1 | Implemented | `resolveLocalized`, `priceFor`, `PendingChip`; `pending.test.ts` |
| FR-040 | Money shall be formatted with `Intl.NumberFormat` in `he-IL`/`en-US` using `roote.config.currency`. | Visitor | P1 | Implemented | `formatMoney` |
| FR-041 | The report CTA shall link to `/start?report=<reportId>`. | Visitor | P1 | Implemented | `buildReport` `cta.href` |
| FR-042 | The report shall carry medical / not-a-diagnosis / demo / formula-pending disclaimers in the footer. | Visitor | P1 | Implemented | `ReportView` footer, `roote.config.disclaimers` |
| FR-043 | Ingredient percentages shall be shown only if `roote.config.formula.displayPercentagesPublicly` is true (currently false → names + "pending regulatory review" note). | Visitor | P1 | Implemented | `buildReport` `formula` / `actives` |
| FR-044 | Report generation shall localize fully at build time (no renderer touches i18n for domain content). | — | P1 | Implemented | `buildReport` uses `messages` as data |
| FR-045 | A downloadable PDF of the report. | Visitor | P2 | **Not built** (removed) | Was `src/pdf/*`; `@react-pdf/renderer` removed. OQ-TECH-8 |

### 1.5 Account · plan · checkout

| ID | Requirement | Actor | Priority | Status | Notes |
|---|---|---|---|---|---|
| FR-046 | `/start/*` shall run in the funnel shell with a 3-segment rail (Account · Plan · Payment). | Visitor | P1 | Implemented | `StartLayout` |
| FR-047 | `/start/*` shall require a resolvable report (`session.reportId` + `session.analysis`, matching any `?report=` query); otherwise show a "no report" state (with a DEV-only seed button). | Visitor | P1 | Implemented | `StartLayout` |
| FR-048 | `/start` (account) shall present email + password sign-up, a disabled magic-link option, and a link to `/login`. | Visitor | P1 | Stub | `AccountStep.tsx` |
| FR-049 | Sign-up shall validate email format and password length (≥ 8), reject a duplicate local email, store `{email, digest}` (non-cryptographic digest) and set an auth session, then navigate to `/start/plan`. | Visitor | P1 | Stub | `auth.tsx` `signUp` |
| FR-050 | A signed-in visitor reaching `/start` shall be forwarded to `/start/plan`. | Account holder | P1 | Implemented | `redirectForStartStep` |
| FR-051 | `/start/plan` shall show a condensed "matched to your scan" card and a 5-row duration selector (90/120/180/270/360) built from `buildReport(...).pricing.compareAll`, each row showing the duration label and price (`[PENDING]`). | Account holder | P1 | Implemented | `PlanStep.tsx` |
| FR-052 | The AI-recommended duration shall be pre-selected and badged "Recommended for you"; the choice is freely changeable and written to `session.draftDurationDays`. | Account holder | P1 | Implemented | `PlanStep.tsx` |
| FR-053 | `/start/checkout` reached without `draftDurationDays` shall redirect to `/start/plan`. | Account holder | P1 | Implemented | `redirectForStartStep` |
| FR-054 | `/start/checkout` shall show an order summary (duration label, price/per-day `[PENDING]`, shipping/total `[PENDING]`, "Change" → `/start/plan`), a contact form (name, email [prefilled], phone, city, postal; country fixed `IL`), a payment form, a "test UI — no real processing" notice, and a disabled alternate-payment button. | Account holder | P1 | Stub | `CheckoutStep.tsx` |
| FR-055 | Checkout shall validate card fields by shape only and, on stub success, build a `Program` via `buildProgram` and navigate to `/start/success`. | Account holder | P1 | Stub | `CheckoutStep.tsx`, `program.ts`, `checkout.ts` |
| FR-056 | The `Order` object shall contain only `card.last4` + `card.expiry` — never the full card number or CVC. | — | P1 | Implemented | `CheckoutStep.handleSubmit` |
| FR-057 | Checkout failure (stub, DEV-forced) shall show an inline payment error, persist nothing, and remain re-submittable. | Account holder | P1 | Implemented | `CheckoutStep`, `submitPayment` |
| FR-058 | `buildProgram` shall freeze `analysisSnapshot`, `plan` (core + supporting from `ReportModel.plan`), `durationDays`, `startDate` (today) and `endDate` (start + durationDays) into a `Program`. | — | P1 | Implemented | `program.ts` |
| FR-059 | `/start/success` shall confirm the order (order id, duration label, start date), list a 3-point "what's next", and CTA to `/app`. | Account holder | P1 | Implemented | `SuccessStep.tsx` |
| FR-060 | Visiting a `/start/*` step after a `Program` already exists shall forward to `/start/success`. | Account holder | P1 | Implemented | `redirectForStartStep` |

### 1.6 Auth (sign-in / password)

| ID | Requirement | Actor | Priority | Status | Notes |
|---|---|---|---|---|---|
| FR-046a | `/login` shall present email + password sign-in with a link to `/start` for users without an account. | Returning user | P1 | Stub | `LoginPage.tsx` |
| FR-047a | Sign-in shall verify the local account exists and the password digest matches; errors (`not-found`, `wrong-password`) show inline. | Returning user | P1 | Stub | `auth.tsx` `signIn` |
| FR-048a | On successful sign-in, the user shall navigate to `/app` if a `Program` exists, else `/`. | Returning user | P1 | Implemented | `LoginPage.submit` |
| FR-049a | `/app/profile` shall allow changing the password (current + new, new ≥ 8), with inline success/error. | Program member | P2 | Stub | `AppProfile.tsx`, `auth.changePassword` |
| FR-050a | Sign-out (from the app shell or profile) shall clear the auth session and navigate to `/`. | Account holder | P1 | Implemented | `AppShell.logout`, `AppProfile.logout` |

### 1.7 Post-purchase app

| ID | Requirement | Actor | Priority | Status | Notes |
|---|---|---|---|---|---|
| FR-061 | `/app/*` shall require both an auth session and a `Program`; missing program → redirect `/`, missing email → redirect `/login`. | Program member | P1 | Implemented | `AppShell.tsx` |
| FR-062 | The app shell shall provide navigation (desktop sidebar / mobile scrollable tabs): Today · My Plan · Progress · Care Team · Profile, plus "Run a new hair analysis" and "Log out". | Program member | P1 | Implemented | `AppShell.tsx` `TABS` |
| FR-063 | `/app` (Today) shall show the program day ("Day D of total"), a progress bar (D/total), and a KPI strip: today's checklist ratio, rolling 7-day adherence %, and next-order date. | Program member | P1 | Implemented | `AppToday.tsx`, `programProgress.ts` |
| FR-064 | Today shall render the routine checklist from `dailyTasks(resolvePlanTreatments(...))` — core + supporting treatments with name / usage / frequency — each with a completion checkbox writing to `program.completionLog[today]`. | Program member | P1 | Implemented | `AppToday.tsx`, `toggleProgramTask` |
| FR-065 | Today shall show a reorder card when the program is within `reorderLeadDays` (21) of its end date or has ended, with a CTA to `/start/plan`. | Program member | P1 | Implemented | `isReorderDue`, `AppToday.tsx` |
| FR-066 | Today shall show a reminders card describing in-app reminder delivery with a visible "coming soon" note; no scheduling UI. | Program member | P2 | Stub | `AppToday.tsx` — `TODO: notification backend` |
| FR-067 | `/app/plan` (My Plan) shall show core and supporting treatments (name, usage, application frequency, affected zones for core) and the program duration + dates, re-localized live on locale change. | Program member | P1 | Implemented | `AppPlan.tsx`, `resolvePlanTreatments` |
| FR-068 | `/app/progress` shall let the user add dated progress photos per angle (reusing `PhotoUpload`), stored as blobs. | Program member | P1 | Implemented | `AppProgress.tsx`, `addProgramPhoto` |
| FR-069 | `/app/progress` shall show a baseline (diagnosis photo) vs. latest (progress photo) comparison per angle, and a timeline grouped by date (most recent first). | Program member | P1 | Implemented | `AppProgress.tsx` |
| FR-070 | `/app/care` (Care Team) shall show canned guidance messages that unlock as the program advances (program day ≥ 1 / 14 / 45 / 90 / 180). | Program member | P1 | Implemented | `CARE_MESSAGES`, `AppCare.tsx` |
| FR-071 | `/app/care` shall provide a message-compose form that, on submit, shows a stub "will reply here (not connected in this preview)" notice and sends nothing. | Program member | P2 | Stub | `AppCare.tsx` |
| FR-072 | `/app/rescan` shall be locked until program day ≥ 90, showing "Available in N days"; when unlocked, the "Start a new analysis" control links to `/diagnosis`. | Program member | P1 | Partial | `AppRescan.tsx` (`RESCAN_UNLOCK_DAY = 90`) |
| FR-073 | `/app/rescan` shall show a baseline vs. latest photo comparison per angle. | Program member | P2 | Implemented | `AppRescan.tsx` |
| FR-074 | A re-scan shall produce a coherent Before/After analysis delta. | Program member | P2 | **Not built** | `deriveRescan` from prior spec never implemented |
| FR-075 | `/app/profile` shall show account facts (email, member-since), program facts (order id, duration, dates), a link to the report (`/report/:reportId`), a change-password form, and a log-out button. | Program member | P1 | Implemented / Stub | `AppProfile.tsx` |
| FR-076 | Adherence % shall be a rolling completion rate over the last 7 days: `sum(completionLog[day].length) / (taskCount × 7)`, integer, capped at 100. | — | P1 | Implemented | `adherencePct` |
| FR-077 | Program-day computation shall be 1-based and clamped to `[1, durationDays]`; `daysRemaining` shall never be negative. | — | P1 | Implemented | `programDay`, `daysRemaining` |
| FR-078 | Reorder date shall be `endDate − reorderLeadDays`. | — | P1 | Implemented | `reorderDate` |
| FR-079 | Task keys shall be stable (`core:N` / `support:N`) and match `completionLog` entries. | — | P1 | Implemented | `dailyTasks` |
| FR-080 | The `/app/*` routes shall re-play the route-entrance reveal animation on navigation, respecting reduced motion. | Program member | P3 | Implemented | `useRevealOnRoute` in `AppShell` |

### 1.8 Cross-cutting

| ID | Requirement | Actor | Priority | Status | Notes |
|---|---|---|---|---|---|
| FR-081 | The app shall support locales `he` (default) and `en`, persisting the choice to `localStorage['roote.locale']` and setting `<html lang>` + `<html dir>` (`rtl`/`ltr`). | Visitor | P1 | Implemented | `LocaleProvider` |
| FR-082 | A locale toggle shall be available in every shell (marketing header/footer, funnel, app). | Visitor | P1 | Implemented | `LocaleToggle` |
| FR-083 | `en.ts` and `he.ts` shall have identical key sets and no empty values (enforced by test). | — | P1 | Implemented | `messages.test.ts` |
| FR-084 | Message interpolation shall support `{var}` placeholders only. | — | P1 | Implemented | `interpolate.ts` |
| FR-085 | Unresolved config values shall be discoverable programmatically (`collectPending`) and rendered consistently (`PendingChip`). | — | P1 | Implemented | `pending.ts` |
| FR-086 | Scalar/JSON state shall persist to `localStorage` under a `roote.` prefix; photo blobs to IndexedDB (`roote` DB, `blobs` store). | — | P1 | Implemented | `persistence.ts` |
| FR-087 | State shall rehydrate on load so refresh and "return from the email link" work. | Visitor | P1 | Implemented | provider initializers |
| FR-088 | `localStorage` write failure (quota/serialisation) shall be caught and warned, not thrown. | — | P2 | Partial | `lsSet` catches + warns; **no active eviction of oldest photos** (spec'd, not implemented) |
| FR-089 | Route changes shall scroll to top. | Visitor | P2 | Implemented | (commit `c015909`) |
| FR-090 | The diagnosis + start funnels shall share a visual language with the marketing site (Playfair headings, gold accent, pill CTAs). | Visitor | P2 | Implemented | `funnelStyles.ts` |
| FR-091 | `import.meta.env.DEV` shall gate all developer seed/debug affordances. | Developer | P1 | Implemented | `StartLayout`, `checkout.ts` |
| FR-092 | The build shall support `figma:asset/<file>` imports resolving to `src/assets/<file>`. | Developer | P1 | Implemented | `vite.config.ts` `figmaAssetResolver` |
| FR-093 | `@` shall alias to `src/` for both Vite and TypeScript. | Developer | P1 | Implemented | `vite.config.ts`, `tsconfig.json` `paths` |
| FR-094 | `pnpm typecheck` (`tsc --noEmit`, strict) shall pass with zero diagnostics. | Developer | P1 | Implemented | `tsconfig.json`, added 2026-09-03 |
| FR-095 | `pnpm test` (Vitest) and `pnpm build` shall pass. | Developer | P1 | Implemented | 206 tests / 52 files |

---

## 2. Non-Functional Requirements

| ID | Category | Requirement | Status | Notes |
|---|---|---|---|---|
| NFR-001 | Performance | Marketing route JS should be reasonable; the single bundle currently ~640 kB (gzip ~188 kB) with a Vite chunk-size warning. Route-level code-splitting is a documented option, not done. | Partial | `pnpm build` output |
| NFR-002 | Performance | Below-the-fold imagery should be `loading="lazy"`; scroll animations must be transform/opacity only (no layout thrash). | Partial | `motion` transforms; lazy loading not systematically applied |
| NFR-003 | Performance | Photos must be downscaled client-side before storage (full ≤ ~1200 px JPEG, thumb 256 px). | Implemented | `downscaleImage` |
| NFR-004 | Localization | Hebrew is the default; RTL layout must use logical properties (`ms/me/ps/pe/start/end`) and mirror numerals/arrows. | Implemented (broadly) | Tailwind logical utilities throughout |
| NFR-005 | Localization | Numbers, currency, and dates must format via `Intl` for the active locale (`he-IL` / `en-US`). | Implemented | `formatMoney`, `toLocaleDateString` |
| NFR-006 | Localization | Every user-visible string must come from the typed i18n dictionaries (no hard-coded copy in components for domain content). | Mostly | A few decorative literals + `en`-only fallbacks (e.g. `HowItWorks` kit uses `item.name.en`) |
| NFR-007 | Accessibility | One `h1` per page; landmark regions; skip-link on marketing. | Implemented (marketing) / Partial (app routes start at `h2`) | asserted for marketing routes |
| NFR-008 | Accessibility | Interactive controls must have accessible names; form feedback via `role="status"` / `role="alert"`. | Implemented | throughout |
| NFR-009 | Accessibility | `MobileMenu` must trap focus and close on Esc; dropdowns close on Esc + outside click and restore focus. | Implemented | `MobileMenu`, `Header` |
| NFR-010 | Accessibility | Full `prefers-reduced-motion: reduce` support — no animation gates content visibility. | Implemented | `useReducedMotion`, `:root.reveal-enabled` gate; test |
| NFR-011 | Maintainability | Domain logic (`deriveAnalysis`, `buildReport`, `buildProgram`, `programProgress` helpers, `collectPending`, `formatMoney`) must remain pure (no React/DOM/storage imports) and unit-tested. | Implemented | domain tests |
| NFR-012 | Maintainability | Renderers consume resolved view-models only (`ReportModel`, resolved treatment lists); they do not read `roote.config` or i18n for domain content. | Implemented | `buildReport`, `resolvePlanTreatments` |
| NFR-013 | Maintainability | EN/HE key parity and "no empty string" are CI-enforced. | Implemented | `messages.test.ts` |
| NFR-014 | Maintainability | `src/styles/tokens.ts` must mirror `theme.css` custom properties (test-checked). | Implemented | `tokens.test.ts` |
| NFR-015 | Testability | Every route must have at least a smoke render test with a seeded store. | Mostly | 52 test files; some app routes covered indirectly |
| NFR-016 | Security / Privacy | No full card number or CVC may be stored, logged, or placed in an `Order`. | Implemented | checkout handlers keep only `last4` + `expiry` |
| NFR-017 | Security / Privacy | The mock auth digest is explicitly non-cryptographic and must be replaced by real auth before production. | Implemented (as documented) | `auth.tsx` docstring |
| NFR-018 | Security / Privacy | Personal data (photos, email, contact) stays in the visitor's browser only; no transmission except the optional hairhealth.ai call. | Implemented | `persistence.ts`; `index.html` `noindex` |
| NFR-019 | Compatibility | Target current evergreen browsers with ES2022, `IndexedDB`, `crypto.randomUUID`, `Intl`. No IE / legacy support. | Implemented (implicit) | `tsconfig` target ES2022 |
| NFR-020 | Reliability | A hairhealth.ai failure must degrade gracefully to the local model without blocking the user. | Implemented | `analyzeHair` try/catch |
| NFR-021 | Content governance | No price, effectiveness figure, testimonial, study result, advisory name, or press placement may be shown unless supplied by the client; otherwise `[PENDING]`. | Implemented | brief §5; `pending.test.ts` |
| NFR-022 | SEO | The site must remain `noindex,nofollow` for the concept phase. | Implemented | `index.html` |

---

## 3. User Stories

Format: *As a [role], I want [action], so that [outcome].* Each carries priority, related `FR`, acceptance criteria (`Given/When/Then`), and dependencies.

### Marketing & shop

**US-001** — As a prospective customer, I want to land on the homepage and immediately understand what ROOTÉ does and how to start, so that I can decide to try it.
*Priority:* P1 · *FR:* FR-001, FR-002, FR-006 · *Depends:* i18n
*AC:* Given a fresh visit to `/`, when the page loads, then there is one `<h1>`, a clear value proposition, and a visible "Start Free Diagnosis" CTA linking to `/diagnosis`.

**US-002** — As a mobile visitor, I want a usable menu, so that I can navigate on a small screen.
*Priority:* P1 · *FR:* FR-003
*AC:* Given a viewport `< lg`, when I tap the hamburger, then a full-screen menu opens with all links + CTA + locale toggle, focus is trapped, and Esc closes it returning focus to the trigger.

**US-003** — As a visitor, I want to read how it works and the science, so that I trust the plan.
*Priority:* P2 · *FR:* FR-008, FR-009
*AC:* Given `/how-it-works` or `/science`, when rendered, then the 4-step process / mechanism narrative and ingredient list are present, with unverified figures shown as `[PENDING]`.

**US-004** — As a visitor, I want to find contact details and legal terms, so that I know who I'm dealing with.
*Priority:* P1 · *FR:* FR-005, FR-012, FR-014, FR-015, FR-017
*AC:* Given `/support`, then `support@roote.us` and `+1 (310) 651-7283` are shown as `mailto:`/`tel:` links. Given `/terms` or `/terms-of-sale`, then the "Company details" block shows the registered name, entity type, country, registration number, EIN, incorporation date, authorized representative, and address, all from `roote.config.company`.

**US-005** — As a visitor, I want to submit a support question, so that I can get help.
*Priority:* P2 · *FR:* FR-013
*AC:* Given the `/support` form with required fields filled, when I submit, then an inline `role="status"` "not connected in the preview" notice appears and no navigation/network/storage occurs.

**US-006** — As a shopper, I want to browse individual products, so that I can buy specific items.
*Priority:* P1 · *FR:* FR-011a, FR-012a
*AC:* Given `/products`, then a filterable catalogue of 17 SKUs renders, each card with name, description, a `[PENDING: <name> price]` chip, and an "Add to bag" button.

**US-007** — As a shopper, I want to add products to a bag and see it, so that I can review before checkout.
*Priority:* P1 · *FR:* FR-013a, FR-014a, FR-015a
*AC:* Given a product card, when I click "Add to bag", then the SKU is added (qty 1, clamped 1–20), the button briefly reads "Added", and `/bag` lists the line; the bag persists across reload.

**US-008** — As a shopper, I want the bag to guide me when it's empty, so that I don't hit a dead end.
*Priority:* P1 · *FR:* FR-016a
*AC:* Given an empty cart at `/bag`, then an empty state with a "Browse products" link is shown.

**US-009** — As a shopper, I want to "check out" the bag, so that I can complete a (demo) purchase.
*Priority:* P1 · *FR:* FR-017a, FR-018a, FR-019a, FR-020a
*AC:* Given a non-empty bag at `/bag/checkout` with valid-shape card fields, when I submit, then after ~400 ms `/bag/success` shows a `bag-…` order id and the cart is cleared; the built `Order` (`kind:'bag'`) contains only `card.last4` + `card.expiry`.

**US-010** — As a shopper, I want a locale that matches me, so that I can read the shop in Hebrew or English.
*Priority:* P1 · *FR:* FR-081, FR-082
*AC:* Given any page, when I use the locale toggle, then all copy swaps, `<html dir>` flips, and the choice persists across reloads.

### Diagnosis

**US-011** — As a prospective customer, I want a short intro before the quiz, so that I know what to expect.
*Priority:* P1 · *FR:* FR-022
*AC:* Given `/diagnosis`, then a value-prop screen with a single "continue" CTA and no inputs is shown.

**US-012** — As a prospective customer, I want to state my gender, so that the right hair-loss scale is used.
*Priority:* P1 · *FR:* FR-023 · *BR:* BR-AN-01
*AC:* Given `/diagnosis/gender`, when I select Male or Female, then `session.diagnosis.gender` is set and I can proceed; male → Norwood, female → Ludwig downstream.

**US-013** — As a prospective customer, I want guidance on taking scalp photos, so that my photos are usable.
*Priority:* P1 · *FR:* FR-024, FR-025
*AC:* Given `/diagnosis/photos`, then four labelled slots (Front, Top, Crown, Hairline) with how-to guidance and a privacy line are shown; capturing an image downscales it and stores a blob + thumbnail.

**US-014** — As a prospective customer, I want bad files rejected clearly, so that I can fix the problem.
*Priority:* P1 · *FR:* FR-025 · *BR:* BR-MD-01
*AC:* Given a non-image file or a file > 15 MB in a photo slot, then an inline `role="alert"` error appears and no blob is stored.

**US-015** — As a prospective customer, I want to answer a few questions while the analysis "runs", so that it feels efficient.
*Priority:* P1 · *FR:* FR-028, FR-029
*AC:* Given `/diagnosis/analyzing`, then one question shows at a time with animated transitions and a Back control (not on Q1); the "analyzing" strip cannot complete until all five questions are answered.

**US-016** — As a prospective customer, I want my answers kept if I go back or refresh, so that I don't redo work.
*Priority:* P1 · *FR:* FR-035
*AC:* Given answered questions, when I navigate back or reload, then previous answers and photos are still present.

**US-017** — As a prospective customer, I want to be redirected if I skip a step, so that the flow stays coherent.
*Priority:* P1 · *FR:* FR-030
*AC:* Given no gender chosen, when I open `/diagnosis/photos` directly, then I am redirected to `/diagnosis/gender`. Given no analysis, `/diagnosis/ready` → `/diagnosis/analyzing`.

**US-018** — As a prospective customer, I want a deterministic result from my answers, so that the same inputs always give the same plan.
*Priority:* P1 · *FR:* FR-031, FR-032 · *BR:* BR-AN-*
*AC:* Given a fixed `(gender, answers)`, `deriveAnalysis` returns the same `HairAnalysis` every time, with `recommendedDurationDays` matching `RECOMMENDED_DURATION_TABLE[severity:emphasis]`.

**US-019** — As the system, I want to use a real analysis provider when configured, so that production accuracy improves without a code change.
*Priority:* P2 · *FR:* FR-032 · *Depends:* BE-1
*AC:* Given `VITE_HAIRHEALTH_API_URL` set and photos present, `analyzeHair` POSTs to `/v1/analyze` and maps the response; on any failure it falls back to the local model and the user still reaches `/diagnosis/ready`.

**US-020** — As a prospective customer, I want to get my results by email, so that I can return to them later.
*Priority:* P1 · *FR:* FR-033, FR-034
*AC:* Given `/diagnosis/ready` with a valid email, when I submit, then `session.account.email` is stored and I navigate to `/report/:reportId`; an invalid email shows an inline error. (Actual send is `TODO: email backend`.)

### Report

**US-021** — As a prospective customer, I want a clear, personalized report, so that I understand my situation.
*Priority:* P1 · *FR:* FR-037, FR-038
*AC:* Given a completed diagnosis at `/report/:id`, then the report renders cover → scan → regimen → actives → expectations → program → FAQ → CTA → disclaimers, all localized.

**US-022** — As a prospective customer, I want honest wording, so that I'm not misled.
*Priority:* P1 · *FR:* FR-039, FR-042, FR-043 · *NFR:* NFR-021
*AC:* Given the report, then prices, effectiveness, timing, and follow-up cost render as `[PENDING]`, ingredient percentages are hidden (config flag false), and medical/demo disclaimers are in the footer.

**US-023** — As a prospective customer, I want a bad report link to fail gracefully, so that I can recover.
*Priority:* P1 · *FR:* FR-036
*AC:* Given `/report/:id` where `id` isn't my session's `reportId`, then `ReportNotFound` shows with a "restart your diagnosis" CTA.

**US-024** — As a prospective customer, I want a single clear next step from the report, so that I can act.
*Priority:* P1 · *FR:* FR-041
*AC:* Given the report, then the primary CTA links to `/start?report=<reportId>`.

**US-025** — As a prospective customer, I want the report to read correctly in Hebrew, so that RTL and formatting are right.
*Priority:* P1 · *FR:* FR-040, FR-044 · *NFR:* NFR-004, NFR-005
*AC:* Given locale `he`, then the report is RTL, money is `he-IL` formatted, and the generated date is `he-IL`.

**US-026** — *(P2, not built)* As a prospective customer, I want to download my report as a PDF, so that I can keep or print it.
*Priority:* P2 · *FR:* FR-045 · *Status:* Not built — see OQ-TECH-8.

### Account / plan / checkout

**US-027** — As a prospective customer, I want to create an account after seeing my report, so that I can proceed to buy.
*Priority:* P1 · *FR:* FR-048, FR-049 · *BR:* BR-AU-*
*AC:* Given `/start` with valid email + 8+ char password, when I submit, then an account is created, an auth session is set, and I land on `/start/plan`; a duplicate email or weak password shows an inline error.

**US-028** — As a returning user, I want to sign in, so that I can continue where I left off.
*Priority:* P1 · *FR:* FR-046a, FR-047a, FR-048a
*AC:* Given `/login` with a known email + correct password, then I navigate to `/app` (if a program exists) or `/`; wrong password / unknown email shows an inline error.

**US-029** — As an account holder, I want the AI-recommended program duration pre-selected, so that the easy choice is the default.
*Priority:* P1 · *FR:* FR-051, FR-052 · *BR:* BR-PR-01, BR-PR-02
*AC:* Given `/start/plan`, then the recommended duration row is checked and badged "Recommended for you"; I can pick any of 90/120/180/270/360, which writes `session.draftDurationDays`.

**US-030** — As an account holder, I want to be sent back if I jump to checkout without choosing a plan, so that I don't see a broken screen.
*Priority:* P1 · *FR:* FR-053
*AC:* Given no `draftDurationDays`, `/start/checkout` redirects to `/start/plan`.

**US-031** — As an account holder, I want a clear order summary and a payment form that's obviously a demo, so that I'm not confused about real charges.
*Priority:* P1 · *FR:* FR-054
*AC:* Given `/start/checkout`, then the summary shows the duration label, price/per-day/shipping/total as `[PENDING]` where unresolved, a "Change" link to `/start/plan`, a "test UI — no real processing" notice, and a disabled alternate-payment button.

**US-032** — As an account holder, I want my card details protected, so that sensitive data isn't kept.
*Priority:* P1 · *FR:* FR-056 · *NFR:* NFR-016
*AC:* Given a submitted checkout, then the `Order` object holds only `card.last4` + `card.expiry`; the full number and CVC are discarded.

**US-033** — As an account holder, I want "paying" to give me an active program, so that I can start.
*Priority:* P1 · *FR:* FR-055, FR-058, FR-059
*AC:* Given a valid-shape checkout submission, when the stub resolves, then a `Program` is built (start = today, end = today + durationDays, plan + analysis frozen) and I land on `/start/success` with the order id and a CTA to `/app`.

**US-034** — As an account holder, I want a failed payment to be recoverable, so that I can retry.
*Priority:* P1 · *FR:* FR-057
*AC:* Given a forced stub failure, then an inline payment error shows, no `Program` is created, and I can resubmit.

**US-035** — As an account holder who already bought, I want `/start/*` to take me to my confirmation, so that I don't re-buy.
*Priority:* P2 · *FR:* FR-060
*AC:* Given a `Program` exists, any `/start/*` step redirects to `/start/success`.

### Post-purchase app

**US-036** — As a program member, I want a daily view of my routine and progress, so that I stay on track.
*Priority:* P1 · *FR:* FR-063, FR-064 · *BR:* BR-PR-07, BR-PR-09
*AC:* Given `/app` at day D of total, then "Day D of total", a D/total progress bar, a KPI strip (checklist ratio, 7-day adherence %, next-order date), and a checklist of core+supporting tasks render; toggling a task updates `completionLog[today]`.

**US-037** — As a program member, I want to know my full plan, so that I understand what to use and when.
*Priority:* P1 · *FR:* FR-067
*AC:* Given `/app/plan`, then core and supporting treatments (name, usage, frequency, affected zones for core) and the program duration + dates render, re-localized on locale change.

**US-038** — As a program member, I want to log progress photos and compare them, so that I can see change over time.
*Priority:* P1 · *FR:* FR-068, FR-069
*AC:* Given `/app/progress`, then I can add a dated photo per angle, see baseline-vs-latest per angle, and a timeline grouped by date (newest first).

**US-039** — As a program member, I want reminders and care-team guidance to appear at the right time, so that I feel supported.
*Priority:* P1 · *FR:* FR-070, FR-071, FR-066
*AC:* Given `/app/care` at day D, then messages with `unlockDay ≤ D` are visible (days 1/14/45/90/180); the compose form shows a stub notice on submit. The reminders card on `/app` shows "coming soon".

**US-036b** — As a program member, I want a nudge when it's time to reorder, so that my program doesn't lapse.
*Priority:* P1 · *FR:* FR-065, FR-078 · *BR:* BR-PR-05
*AC:* Given `daysRemaining ≤ 21` or the program has ended, then `/app` shows a reorder card with a CTA to `/start/plan`.

**US-036c** — As a program member, I want to re-scan later, so that I can see how I've changed.
*Priority:* P2 · *FR:* FR-072, FR-073, FR-074
*AC:* Given program day < 90 at `/app/rescan`, then the start-analysis control is disabled with "Available in N days"; at day ≥ 90 it links to `/diagnosis`. A Before/After **delta model is not built** (US-026-class gap).

**US-036d** — As a program member, I want a profile page, so that I can see my account/program and change my password.
*Priority:* P2 · *FR:* FR-075, FR-049a
*AC:* Given `/app/profile`, then account facts, program facts, a link to my report, and a change-password form (new ≥ 8) render, with inline success/error.

### Cross-cutting / developer

**US-040** — As a stakeholder, I want every unverified claim visibly marked, so that we don't ship a regulatory problem.
*Priority:* P1 · *FR:* FR-039, FR-085 · *NFR:* NFR-021
*AC:* Given any surface, then unresolved prices/claims render as `[PENDING: label]` chips; a test asserts no claim/price/stat renders from raw null.

**US-041** — As a Hebrew speaker, I want the whole product in Hebrew by default, so that it's usable for me.
*Priority:* P1 · *FR:* FR-081 · *NFR:* NFR-004
*AC:* Given a fresh browser, then locale is `he`, `<html dir="rtl">`, and all copy is Hebrew (first-pass; legal HE flagged for review).

**US-042** — As a translator/QA, I want EN/HE dictionaries kept in lockstep, so that no key is missing at runtime.
*Priority:* P1 · *FR:* FR-083
*AC:* Given `messages.test.ts`, then `Object.keys(en)` and `Object.keys(he)` are identical and no value is `""`.

**US-043** — As a developer, I want a strict typecheck gate, so that regressions surface before merge.
*Priority:* P1 · *FR:* FR-094
*AC:* Given `pnpm typecheck`, then `tsc --noEmit` exits 0.

**US-044** — As a developer, I want to reach deep screens quickly in DEV, so that I can review without walking the whole funnel.
*Priority:* P2 · *FR:* FR-091
*AC:* Given a DEV build at `/start` with no report, then a "load demo" button seeds a diagnosis + analysis + reportId. *(Gap: no equivalent seed mints a `Program` for `/app` — OQ-TECH-3.)*

**US-045** — As a developer, I want a forced-failure switch for checkout, so that I can exercise the error path.
*Priority:* P2 · *FR:* FR-057, FR-091
*AC:* Given `localStorage['roote.debug.forceCheckoutFailure']='1'` in DEV, both checkout stubs throw and the error UI shows.

**US-046** — As a developer, I want the Figma asset import scheme preserved, so that Figma-exported assets keep resolving.
*Priority:* P1 · *FR:* FR-092
*AC:* Given `import x from 'figma:asset/foo.png'`, Vite resolves it to `src/assets/foo.png`.

**US-047** — As a reviewer, I want the site kept out of search indexes during the concept phase, so that unfinished content doesn't leak.
*Priority:* P1 · *NFR:* NFR-022
*AC:* Given `index.html`, then `<meta name="robots" content="noindex, nofollow">` is present.

**US-050**–**US-055** *(handoff readiness — covered by the backend requirements table in [`TECHNICAL-SPECIFICATION.md`](./TECHNICAL-SPECIFICATION.md); each stub `BE-1`…`BE-12` is a "replace this seam" story for the development phase).*
