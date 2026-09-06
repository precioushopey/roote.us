# ROOTÉ.US Redesign — Completion Report

**Date:** 2026-09-04
**Scope:** the 38-section product-owner brief — transform the repo into a premium,
medically-inclined, AI-powered *Personalized Hair Growth System*.
**Status:** WP0–WP10 complete. `pnpm lint` 0/0 · `pnpm typecheck` clean ·
`pnpm test` 302 passing (55 files) · `pnpm build` OK.
**Nothing committed** (per instruction) — all changes are in the working tree.
Day-to-day tracker + resume notes: [`REDESIGN-PROGRESS.md`](./REDESIGN-PROGRESS.md).

---

## 1. Summary of the redesign

The site now sells a **process and a solution**, not products. Every surface
points to one action — **Start free hair analysis** — and the journey is one
connected loop: concern → analysis → personalized program → daily routine →
progress → final scan → result.

- **New visual system:** deep-teal "science" surfaces + warm-cream "you"
  surfaces, gold only at the seam; Bodoni Moda display + Montserrat UI; a
  precise three-strand follicle mark as the recurring motif; glass reserved for
  genuine depth (sticky nav, the floating result card, modals).
- **New information architecture:** `/analysis`, `/solutions/*`, `/science`,
  `/results`, `/system`, `/program`, `/account/*`, `/products/:slug`, and 9 legal
  pages — with redirects from every old path.
- **New homepage:** 14 sections that explain Analyze → Understand → Personalize →
  Treat → Track before showing a single product.
- **New assessment:** an 8-screen guided flow with a gender step (packaging
  theme only), a concern step, a photo-consent gate, a gray-hair question
  branch, a provider seam, and a calm result card.
- **New report, program funnel, and My ROOTÉ tracker**, all on the primitive
  system, all `[PENDING]`-safe.
- **Regulatory guardrail intact and extended:** no invented prices, %s, or
  claims; a claim-status system; a recommendation engine that never
  auto-prescribes a Density tier; 9 draft policy pages with review markers.

## 2. Important architectural decisions

| Decision | Why |
|---|---|
| **Kept the existing architecture** (React 18 + react-router data router, Tailwind v4 `@theme inline`, domain-purity layers, the `[PENDING]` system, the content→view-model→dumb-renderer pipeline, mock stores). | The brief said don't change frameworks; the bones were sound. |
| **Re-pointed the shadcn CSS-var token layer** to the brief's palette rather than replacing it; added `deep-*` / `cream-*` / `gold-*` primitive scales. | Every existing utility keeps working; one file (`theme.css`) is the source of truth. `deep-*` (not `teal-*`) because a custom `teal` collides with Tailwind v4's built-in palette. |
| **New primitive library** at `src/app/components/roote/` (~30 components) instead of extending the Figma-era `components/ui/`. | A coherent, intentional system; the old shadcn set stays available but unused. |
| **N-locale i18n architecture, ship 2.** `src/i18n/locales.ts` registry (dir, BCP-47, country→locale/currency); `en` + `he` complete; `fr/ru/ar/es` registered as empty scaffolds that fall back to English and are excluded from the parity test. | The brief wants architecture for 6; hand-writing 4 machine-quality translations across ~1,100 keys is a separate, reviewable task. |
| **New IA is canonical; old paths redirect.** Route folders keep their names; only URL strings changed; `src/app/paths.ts` is the single link source. | The site is `noindex` (no live SEO), but internal/bookmark links must not break. |
| **`HairAnalysisProvider` seam** (`src/domain/analysis/provider.ts`) — interface + `mockHairAnalysisProvider`; the assessment finishes through `getAnalysisProvider().analyze(...)`. | A real CV service (hairhealth.ai or other) drops in via `setAnalysisProvider`. |
| **Recommendation engine as config** (`src/domain/recommendation/`) — pure, rule-list, `requiresMedicalReview`, **never emits `density-15`**, any Density outcome forces a review. | Brief §9/§14: no auto-prescription from a cosmetic score; an insertable clinician step. |
| **Gray branch is additive.** `deriveGrayProfile` (pure) + `session.grayProfile`; gray-only path also stores a gray-neutral `deriveAnalysis` so `/report` + `/program` stay reachable. | Bounded scope without forking the whole funnel. |
| **Report re-skinned, model unchanged.** `ReportView` is now a numbered medical-summary `<article>` (PDF-ready); `buildReport`/`ReportModel` (the tested pure builder) were not touched. | Lowest-risk path to the brief's 13-section report. |
| **Analytics + subscription + all backends stay mocked** with clean seams + `TODO` boundaries. | Brief §0: build the interface, adapter, mock, TODO. |

## 3. Routes created / changed

**Marketing (`MarketingShell`)** — `/` (14-section rebuild) · `/how-it-works` ·
`/solutions` (new hub) · `/solutions/thinning` (new) · `/solutions/gray-hair`
(new) · `/science` (rebuild) · `/results` (new) · `/system` (new) · `/about` ·
`/faq` (rebuild) · `/support` · `/products` (rebuild, 6 SKUs) ·
`/products/:slug` (new) · `/bag`, `/bag/checkout`, `/bag/success` (kept).

**Legal (`MarketingShell`)** — `/terms`, `/terms-of-sale`, `/privacy` (kept) +
`/shipping`, `/returns`, `/cancellation`, `/subscription-terms`,
`/medical-disclaimer`, `/accessibility`, `/cookies` (new, from
`content/legal.ts`).

**Assessment (`AnalysisShell`)** — `/analysis` (intro) · `/analysis/gender` ·
`/analysis/concern` (new) · `/analysis/photos` · `/analysis/scanning` (new) ·
`/analysis/questions` (new) · `/analysis/results` (new). Aliases:
`/analysis/{intro,analyzing,ready}` → new step names.

**Program (`StartLayout`)** — `/program` (account) · `/program/plan` (rebuild) ·
`/program/checkout` (rebuild, program-first summary) · `/program/success`.

**Account (`AppShell`)** — `/account` (Today, rebuild) · `/account/program`
(was `plan`) · `/account/progress` · `/account/photos` (new route) ·
`/account/scans` (was `rescan`) · `/account/orders` (new) ·
`/account/subscription` (new) · `/account/care` · `/account/profile`.

**Report** — `/report/:reportId` (rebuild).

**Redirects** — `/diagnosis/*`→`/analysis/*`, `/start/*`→`/program/*`,
`/app/*`→`/account/*`, `/account/{plan,rescan}`→`/account/{program,scans}`,
`*`→`/`.

## 4. Components created

`src/app/components/roote/` — `StrandMark`, `Button`/`IconButton`,
`Card`/`GlassCard`, `Eyebrow`/`DisplayTitle`/`Prose`/`TextLink`, `Badge`/`Pill`,
`Stat`, `Section`, `Accordion`, `RadioCard`/`SegmentedControl`, `Stepper`,
`Modal`/`Drawer`, `ToastProvider`/`useToast`, `Tooltip`,
`LegalNotice`/`ConsentPanel`, `ConcernCard`/`ProductCard`/`ProgramCard`/
`IngredientCard`, `AnalysisMetric`/`ScanCard`/`ScanGuide`,
`Timeline`/`TreatmentChecklist`/`ProgressPhotoCard`, `BeforeAfterSlider`,
`ReportSection`, `CountryLanguageSelector`.

Other new components: `MediaPlaceholder` (labelled, no-fetch image slot),
`AnalysisPrompt` (homepage exit aid), `AnalysisShell`, 7 assessment screens,
`AccountOrders`, `AccountSubscription`, `PagePlaceholder`, `LegalPageView`.

## 5. Files changed (high level)

- **Tokens/CSS:** `styles/theme.css`, `tokens.ts`, `tokens.test.ts`, `fonts.css`,
  `marketing.css`, `marketing/displayScale.ts`.
- **i18n:** `i18n/locales.ts` (new), `messages/index.ts`, `messages/{en,he}.ts`
  (large), `messages/{fr,ru,ar,es}.ts` (new scaffolds), `LocaleProvider.tsx`,
  `messages.test.ts`.
- **Content:** `content/{claims,brand,products,programs,solutions,faqs,legal,
  assessment,localized,catalog}.ts` (new/rewritten), `content.test.ts`.
- **Domain:** `analysis/{provider,grayProfile}.ts` (new),
  `recommendation/{types,rules,recommend}.ts` (new), `report/buildReport.ts`
  (cta href only), `store/sessionStore.tsx` (concern/gray/consent fields).
- **Infra:** `analytics/*` (new), `seo/*` (new), `app/paths.ts` (new).
- **Shells + routes:** `App.tsx`, all shells, all marketing pages, the whole
  `routes/analysis/` tree (new), `routes/start/*`, `routes/app/*`,
  `components/report/ReportView.tsx`.
- **Deleted:** `routes/diagnosis/*`, `components/diagnosis/{QuestionCard,
  AnalyzingStrip}` (+ tests).
- **Tooling:** `eslint.config.js` (one exempt glob), `vite.config.ts`
  (`testTimeout: 20000`).

## 6. Mocked integrations (interface + adapter + mock + TODO)

| Capability | Seam |
|---|---|
| Hair-analysis CV | `HairAnalysisProvider` + `mockHairAnalysisProvider` (`domain/analysis/provider.ts`); still also honours the env-gated `hairhealthAdapter`. |
| Analytics | `AnalyticsAdapter` + noop/console adapters + `track()` (`analytics/`). 25 normalized events; no vendor. |
| Auth | `store/auth.tsx` — localStorage, non-crypto digest. |
| Payment + orders | `store/checkout.ts` `submitPayment` — one call for program + bag. |
| Email delivery | `/analysis/results` submit stores the address only. |
| Photo upload / storage | `PhotoUpload` → IndexedDB blob (local). |
| Notifications / reminders | `/account` reminders card ("coming soon"). |
| Support ticketing | `/support` + `/account/care` compose — inert. |
| Subscription mechanics | `AccountSubscription` owns the disclosure + cancel UI; billing is a backend concern. |
| Geo-IP locale | `CountryLanguageSelector` is manual; `COUNTRY_DEFAULTS` seeds nothing automatically. |
| Recommendation rules | `RECOMMENDATION_RULES` — **placeholder**, must be clinically + legally approved. |

## 7. Legal / regulatory review items

- **All 9 policy pages** (`content/legal.ts` `LEGAL_BODIES`) are drafts. Every
  operator-set specific carries an inline `[TODO: confirm …]` note (return
  window, return postage, processing times, carriers, retention periods,
  data-protection framework, sub-processor list, renewal-price policy, reminder
  policy). Hebrew is flagged pending formal review. Terms of Sale (12 clauses)
  and Privacy carry their earlier `TODO: confirm with client` markers.
- **Medical / consent copy** — the medical disclaimer, "not a diagnosis"
  language, the photo-consent panel text, and the marketing-consent line at the
  results email gate are all draft (EN + HE).
- **Recommendation ruleset** (`domain/recommendation/rules.ts`) is
  `RECOMMENDATION_RULESET_STATUS = 'placeholder'` — not medical advice.
- **Density 6/10/15 eligibility pathway** is architected for an insertable
  clinician/pharmacy review step; the app never auto-prescribes.
- **Claim status** — `content/claims.ts`: ingredient/formula copy is `working` /
  `supplier-reference`; a dev/test guard (`containsForbiddenClaim`) blocks
  "clinically proven", "FDA-approved", "guaranteed", "cure", regrowth/reversal,
  "100%", etc. across product, solution, FAQ, and legal copy.

## 8. Content still requiring owner confirmation

- **All pricing** — the 5 program durations, per-day, renewal price, shipping,
  bag prices. Everything renders `[PENDING]`.
- **Substantiated figures** — effectiveness %, time-to-visible-results, re-scan
  window, physician-follow-up cost: supply real values or keep them out.
- **Currency** — `roote.config.currency = 'ILS'` placeholder; `COUNTRY_DEFAULTS`
  proposes USD/GBP/ILS/EUR/RUB.
- **Supporting-treatment identity** — what "Scalp stimulation routine" and
  "Gentle scalp cleanser" actually are; whether there is an oral component.
- **Product copy** — the six SKUs' names/subtitles/hero copy are working drafts;
  the formula references (6%/10%/15% etc.) are supplier-reference and hidden
  publicly (`displayFormulaDetail: false`).
- **Gender step** — Male/Female only, or add a third / "prefer not to say"?
- **Photo minimum** — guard needs ≥1, the UI requires all 4.
- **Real imagery** — every image is a `MediaPlaceholder` with a semantic
  art-direction label; nothing is fetched or generated.
- **Results / testimonials / press / advisory board** — all empty states
  ("Verified ROOTÉ results coming soon").
- **Hebrew copy** — competent first pass throughout; legal HE needs formal review.

## 9. Run & test locally

```bash
pnpm install
pnpm dev          # Vite dev server
pnpm build        # -> dist/  (one ~640 kB chunk; the >500 kB warning is expected)
pnpm test         # vitest run — 55 files / 302 tests, must stay green
pnpm typecheck    # tsc --noEmit (strict) — 0 diagnostics
pnpm lint         # eslint . — 0 problems
```

- **See the account dashboard in dev:** open `/account`, click *Load a demo
  program (dev only)*.
- **See the report / program funnel:** walk `/analysis`, or on `/program` click
  the dev seed.
- **Preview a scaffold locale (RTL Arabic, the picker):** run with
  `VITE_I18N_SHOW_SCAFFOLDS=1`.

## 10. Migrations / environment variables

- **No migrations.** `sessionStore` gained `diagnosis.{concern,grayAnswers,
  photoConsent}` + `grayProfile`; `hydrate()` merges older stored shapes over
  the new defaults, so an existing `localStorage['roote.session']` loads
  cleanly.
- **New localStorage keys:** `roote.country`, `roote.popup.analysis.dismissed`.
- **Env vars:** unchanged — `VITE_HAIRHEALTH_API_URL` / `VITE_HAIRHEALTH_API_KEY`
  (optional CV provider). Added: `VITE_I18N_SHOW_SCAFFOLDS=1` (optional, dev —
  reveal the FR/RU/AR/ES picker options).
- **`index.html`** stays `noindex,nofollow`; the SEO metadata layer
  (`src/seo/`) is inert scaffolding for launch.
