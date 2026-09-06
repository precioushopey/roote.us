# ROOTÉ.US Redesign — Progress & Decisions

Living tracker for the full redesign/rebrand toward **"Personalized Hair Growth System"**
(premium medical-tech). Not committed by Claude (user commits). Read this first when resuming.

Brief: the 38-section product-owner brief in the kickoff message.
Baseline before work: `main` @ `09f68e4`, 207 tests green, typecheck clean.

---

## Locked decisions (from kickoff Q&A, 2026-09-04)

1. **Sequencing** — execute all 11 work packages (WP0–WP10) in the brief's phase order.
   Keep `pnpm typecheck` + `pnpm test` + `pnpm build` green at every WP boundary.
2. **i18n depth** — N-locale architecture now. Ship **en + he** fully. Register
   **fr / ru / ar / es** as machine-draft scaffolds (empty `Partial` maps, runtime falls
   back to `en`), excluded from the parity test until professionally reviewed.
3. **Route architecture** — adopt the brief's IA as canonical
   (`/analysis`, `/solutions/*`, `/system`, `/results`, `/program`, `/account/*`,
   `/products/:slug`, legal pages). Add redirect stubs from every old path
   (`/diagnosis`, `/start`, `/app`, …). Update all internal links + tests.
4. **Commits** — Claude does **not** commit. Tree kept coherent + green at WP boundaries.

## Standing product-owner decisions (made by Claude per the brief, not open questions)

- **Primary CTA colour** = deep teal (`--primary` = teal-800). Gold is accent only,
  non-text / ≥24px (brief §6). CTA label text stays sentence-case in the string;
  ALL-CAPS is CSS `text-transform`, disabled under `he`/`ar` (no case in those scripts).
- **Display face** = Bodoni Moda (Didot lineage — medical-luxury register, not the
  Playfair default). Body = Montserrat. Hebrew display = Frank Ruhl Libre, body = Heebo
  (+ Noto Sans Hebrew fallback). Arabic = Noto Sans Arabic (loaded now, cheap).
- **Hero motif** = precise inline-SVG follicle / three-strand cross-section (medical-diagram
  register), reused at multiple scales. Not a product beauty shot, not a big-number stat.
- **Numbered markers** only on the two genuine sequences: Analyze→Understand→Personalize→
  Treat→Track, and the Day 0→180 progress timeline. Nowhere else.
- **Glass** is for genuine depth only (sticky nav, floating result card, modals).
  Most cards are flat cream/white + hairline.
- **`[PENDING]` guardrail preserved.** All efficacy / % / claim values stay `null` →
  `<PendingChip>` or `claimStatus: 'requires-review'`. The brief's supplier/competitor
  ingredient lists enter config as descriptive content with
  `claimStatus: 'working'` / `sourceType: 'supplier-reference'`; no efficacy language.
- **Density 6/10/15** eligibility routed through a config rule set with a
  `requiresMedicalReview` flag and an insertable clinician-review step. Never
  auto-prescribed from a cosmetic score.
- **Tests are living** — assertions updated to the new IA/copy per WP, each test's
  intent preserved (guards, domain purity, i18n parity, pending-safety).
- **PDF report** stays out of scope; the report view is built PDF-ready (one resolved
  model, `ReportSection` blocks) so a renderer can be added later.
- **Dark theme** — no toggle (unchanged posture). `.dark` block repointed to coherent
  deep-teal so `tone="ink"` / dark-glass surfaces are correct.

---

## Design tokens (WP0)

### Core palette (brief §6 — pinned)
```
--roote-teal-950 #062E31   --roote-cream-50  #FCF9F3   --roote-gold-500 #C6A15A
--roote-teal-900 #093A3D   --roote-cream-100 #F6EFE4   --roote-gold-600 #A98343
--roote-teal-800 #0D494C   --roote-cream-200 #EDE1CF
--roote-teal-700 #155A5D
--roote-ink #172022   --roote-body #333A3C   --roote-muted #6F7676   --roote-line rgba(23,32,34,.14)
```
### Semantic mapping (onto existing shadcn var names — utilities keep working)
| var | value | role |
|---|---|---|
| `--background` | `#FCF9F3` | cream page ground |
| `--foreground` | `#172022` | ink body text |
| `--primary` / `-foreground` | `#0D494C` / `#FCF9F3` | the one filled CTA (deep teal) |
| `--secondary` / `--muted` | `#F6EFE4` / `#EDE1CF` | cream surfaces |
| `--muted-foreground` | `#6F7676` | secondary text |
| `--accent` / `-foreground` | `#C6A15A` / `#172022` | rules, numerals, active state, three-strand mark — **non-text / ≥24px** |
| `--border` / `--input` | `#E6DAC6` | sand hairline |
| `--ink` / `-foreground` | `#062E31` / `#F6EFE4` | dark editorial band (deep teal, ≈13:1) |
| `--ring` | `#C6A15A` | focus ring |
| `--destructive` | `#B3261E` | unchanged |

### Glass
`--surface-glass rgba(255,255,255,.62)` · `--surface-glass-dark rgba(6,46,49,.70)` ·
`--surface-glass-border rgba(255,255,255,.18)` · `--glass-blur 20px`
→ `.glass` / `.glass-dark` utilities in `marketing.css`.

### Gender packaging (presentation only — `data-pack` attr, NOT a theme)
`[data-pack="men"]` → teal-900 pack surfaces · `[data-pack="women"]` → cream-200 + gold detail.
Drives product-mockup cards only. Never affects treatment strength.

### Type scale (brief §6)  12 14 16 18 22 28 36 48 64 80 — `clamp()` for display.
### Radius  base `--radius: 16px` → sm 8 / md 12 / lg 16 / xl 24 / 2xl 32 / pill.
### Layout widths  marketing 1280 · content 1160 · readable 720.

---

## Work-package tracker

| WP | Scope | Status |
|---|---|---|
| **0 · Foundations** | tokens, fonts, N-locale i18n, MediaPlaceholder, analytics adapter, recommendation engine, content layer (`brand/products/solutions/programs/faqs/legal/assessment/claims`) | ✅ **done** — typecheck clean, 259 tests green (+52), build OK |
| 1 · Primitives | ~40 reusable components | ✅ **done** — `src/app/components/roote/*`, 272 tests green (+13), typecheck + build OK |
| 2 · Shell & IA | header/nav/footer/drawer, route rewrite + redirects, popup, SEO meta | ✅ **done** — 277 tests green, typecheck + build OK |
| 3 · Homepage | 14 sections | ✅ **done** — 287 tests green, typecheck + build OK, visually verified (EN + HE) |
| 4 · Solutions/Science/Results/System/Products (+6 detail) | marketing pages; catalog → 6 SKUs | ✅ **done** — 300 tests green, typecheck + build OK, spot-checked |
| 5 · Assessment flow | 8 split screens, provider iface + mock, gray branch, consent, pack theme | ✅ **done** — 296 tests green, typecheck + build OK, spot-checked |
| 6 · Report | 13-section web report, PDF-ready model | ✅ **done** — 297 tests green, typecheck + build OK |
| 7 · Program + checkout | `/program` durations, recommendation output, program-first checkout | ✅ **done** — 297 tests green, typecheck + build OK |
| 8 · Account / My ROOTÉ | 8 account routes, timeline, final scan, Before/After | ✅ **done** — 301 tests green, typecheck + build OK |
| 9 · Legal | 9 policy pages from `content/legal.ts` | ✅ **done** — 305 tests green, typecheck + build OK |
| 10 · Cross-cutting + QA | a11y AA, RTL sweep incl. Arabic, perf, analytics wiring, full test update, completion report | ✅ **done** — lint 0 errors, 302 tests green, typecheck + build OK |

### WP0 file checklist
- [x] `docs/REDESIGN-PROGRESS.md` (this file)
- [x] `src/styles/theme.css` · `tokens.ts` · `tokens.test.ts` · `fonts.css` · `marketing.css`
- [x] `src/app/components/marketing/displayScale.ts` (retuned; added `displayClamp` steps)
- [x] `src/i18n/locales.ts` · `messages/index.ts` · `messages/{fr,ru,ar,es}.ts` · `LocaleProvider.tsx` · `messages.test.ts` · `localized.ts`
- [x] `src/app/components/media/MediaPlaceholder.tsx` (+ test)
- [x] `src/analytics/{events.ts,analytics.ts,analytics.test.ts}`
- [x] `src/domain/recommendation/{types.ts,rules.ts,recommend.ts,recommend.test.ts}`
- [x] `src/content/{claims.ts,brand.ts,products.ts,programs.ts,solutions.ts,faqs.ts,legal.ts,assessment.ts,content.test.ts}`

**WP0 notes for resume:**
- Token architecture unchanged (shadcn var names + `@theme inline` + `tokens.ts` mirror). Palette
  re-pointed to teal/cream/gold; `--primary` is now teal-800. `--text-*` Tailwind keys deliberately
  NOT overridden (avoids drift on pages pending a WP); brief's display scale is `--display-*` +
  `displayClamp`. New Tailwind colours: `teal-{950..600}`, `cream-{50..300}`, `gold-{500,600}`,
  `text-display-{sm..2xl}`. New utilities: `.glass`, `.glass-dark`, `.u-caps` (i18n-safe caps),
  `.text-display`.
- i18n: `LocaleProvider` still 2-locale (`en`/`he`); registry (`locales.ts`) is 6-wide and ready.
  WP2 widens the provider + call sites to `LocaleCode` + `contentLocaleOf()` and wires
  `CountryLanguageSelector`. Scaffold locale files are empty `Partial` maps; parity test only
  covers en/he.
- Content modules use inline `{en,he}` via `content/localized.ts` `L()` — same pattern as
  `roote.config.ts`. `roote.config.ts` + `catalog.ts` still power the current (pre-redesign)
  routes; migrate in WP4/6/7.
- `containsForbiddenClaim()` in `content/claims.ts` is a dev/test guardrail — `content.test.ts`
  runs it over all product/solution/FAQ copy.

**WP1 notes for resume:**
- New primitive system: `src/app/components/roote/` with `index.ts` barrel. Import from
  `@/app/components/roote`.
- Built: `StrandMark` (the motif), `Button`/`IconButton`, `Card`/`GlassCard`, `Eyebrow`/
  `DisplayTitle`/`Prose`/`TextLink`, `Badge`/`Pill`, `Stat`, `Section`, `Accordion`,
  `RadioCard`/`SegmentedControl`, `Stepper`, `Modal`/`Drawer`, `ToastProvider`/`useToast`,
  `Tooltip`, `LegalNotice`/`ConsentPanel`, `ConcernCard`/`ProductCard`/`ProgramCard`/
  `IngredientCard`, `AnalysisMetric`/`ScanCard`/`ScanGuide`, `Timeline`/`TreatmentChecklist`/
  `ProgressPhotoCard`, `BeforeAfterSlider`, `ReportSection`, `CountryLanguageSelector`.
- Old marketing primitives (`components/marketing/*`) still power the current routes; pages
  migrate onto `roote/*` in WP3–WP8, then the old set is removed in WP10.
- Domain cards take already-resolved string props (not content objects) — routes resolve
  content → props (keeps renderers dumb, CLAUDE.md rule #4).
- `.u-caps` used for CTA/eyebrow caps; safe under he/ar.

**WP2 notes for resume:**
- **Route folders kept their names** (`routes/diagnosis/`, `routes/start/`, `routes/app/`) — only the
  URL strings changed. `src/app/paths.ts` (`PATHS`) is the single source of truth for links.
- New IA live: `/analysis`, `/program`, `/account`, `/solutions*`, `/results`, `/system`,
  `/products/:slug` (placeholder), 9 legal pages (`/shipping`…`/cookies` via `LegalPageView`;
  `/terms`, `/terms-of-sale`, `/privacy` keep their existing components).
- **Redirects**: `App.tsx` `PrefixRedirect` splats `/diagnosis/*`→`/analysis/*`, `/start/*`→`/program/*`,
  `/app/*`→`/account/*`. Tested in `routes/redirects.test.tsx`.
- Funnel step sub-paths NOT yet renamed (still `analyzing`/`ready` under `/analysis`; `plan`/`rescan`/
  `care`/`profile` under `/account`). WP5 / WP8 rename them.
- `LocaleProvider` now `LocaleCode`-wide + exposes `country`, `currency`, `contentLocale`,
  `setCountry`. `useContentLocale()` for `buildReport`/config. `roote.country` localStorage key.
- New shells: `Header` (translucent, `Drawer` mobile, `CountryLanguageSelector`), `Footer` (6 cols),
  `MarketingShell` mounts `AnalysisPrompt` (popup, provider-free, reads localStorage) on `/` +
  `useDocumentMeta` (SEO: `src/seo/`).
- Home / Science / Products / About / Faq / Support pages are still the PRE-redesign editorial
  components — WP3 (Home) and WP4 (rest) rebuild them on `roote/*` primitives.
- i18n keys added: `marketing.nav.{solutions,system,shop,account,secondaryCta}`,
  `marketing.region.*`, `marketing.footer.{solutions,account}`, `marketing.popup.*`.
  `marketing.nav.cta` value changed → "Start free hair analysis"; `meta.title` changed.

**WP3 notes for resume:**
- **Tailwind collision fixed:** a custom `teal-*` scale collided with Tailwind v4's built-in
  `teal` palette (utilities fell back to the default desaturated teal). Renamed the primitive
  scale to **`deep-{950..600}`** everywhere (`--color-deep-*` in `theme.css` `@theme inline`,
  all `roote/*` + shell components). `cream-*` / `gold-*` don't collide. **Rule for new work:
  never add a custom Tailwind color whose name matches a built-in palette** (slate, gray, zinc,
  neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue,
  indigo, violet, purple, fuchsia, pink, rose). Semantic tokens (`bg-ink`, `bg-primary`,
  `text-accent`, …) are unaffected and preferred.
- `Home.tsx` fully rebuilt: 14 sections on `roote/*` primitives + content modules
  (`brand`, `assessment`, `products`, `solutions`, `programs`, `faqs`). Old `Home` editorial
  components no longer used by `/`.
- Hero + system strip pass `animate={false}` (not gated behind the scroll-reveal — above the
  fold must be instant). `.text-display` bumped to `font-weight: 600` (Bodoni reads light).
- `Header` is now always `.glass` (translucent), condenses padding + adds a border on scroll.
- `marketing.home.*` i18n block replaced with the new section copy (+ a small "legacy" tail
  still consumed by About/Products/AppProgress until WP4/WP8).
- `Home.test.tsx` added (11 tests): positioning, CTA dominance, concern paths, 5-step sequence,
  PENDING-safety on the scan card + durations, honest results empty state, 12-Q FAQ, HE.

**WP4 notes for resume:**
- New/rebuilt pages: `SolutionPage.tsx` (`SolutionPage` + `SolutionsIndex`), `Science.tsx`,
  `Results.tsx`, `SystemPage.tsx`, `Products.tsx`, `ProductDetail.tsx`, `Faq.tsx` — all on
  `roote/*` + content modules. `About.tsx` / `Support.tsx` NOT rebuilt (still old editorial
  primitives; render in the new palette/font automatically; low priority — WP10 or skip).
- `catalog.ts` rewritten to derive from `products.ts` (6 SKUs). `CatalogProduct` shape changed:
  `{sku, name, subtitle: LocalizedText, concern, requiresMedicalReview, price}` — no more
  `photo` / `descKey`. `bag/BagPage.tsx` + `bag/BagCheckout.tsx` patched (StrandMark tile
  instead of `product.photo`, `pickLocalized(subtitle)` instead of `t(descKey)`).
- `Products.tsx`: cosmetic SKUs get "Add to bag"; Density SKUs get a review note (no cart).
- i18n keys added: `marketing.sol.*`, `marketing.sci.*`, `marketing.results.*`, `marketing.sys.*`,
  `marketing.shop.*`, `marketing.pdp.*`.
- `vite.config.ts`: `testTimeout`/`hookTimeout` bumped to 20000 — full-app integration tests
  (`App.test`, `diagnosis` e2e) exceed the 5s default under worker load now that the route graph
  is heavier. Not a regression (they pass in isolation).
- Tests: `marketingRoutes.test.tsx` extended with the new route h1s; `wp4pages.test.tsx` added
  (7 tests — PENDING prices, Density review-gating, concern hint, honest Results, no forbidden
  claims, HE).

**WP5 notes for resume:**
- New folder `src/app/routes/analysis/` — `AnalysisShell` (Stepper rail, `data-pack` from gender),
  `guards.ts` (`redirectForAnalysisStep`), `Steps1to3.tsx` (Intro/Gender/Concern), `PhotosScreen`,
  `ScanningScreen`, `QuestionsScreen`, `ResultsScreen`, `analysisRoutes.tsx`. Wired into `App.tsx`
  as `analysisRoutes` (replaces the old DiagnosisLayout subtree). `/analysis/{analyzing,ready,intro}`
  redirect to the new step names.
- **`src/app/routes/diagnosis/` DELETED** (dead after the swap). `src/app/components/diagnosis/*`
  KEPT — `PhotoUpload` is used by `PhotosScreen`; `questions.ts` is referenced by
  `content/content.test.ts`; `QuestionCard`/`AnalyzingStrip` are now unused but still have tests
  (prune in WP10).
- **`HairAnalysisProvider`** seam: `src/domain/analysis/provider.ts` — interface +
  `mockHairAnalysisProvider` (delegates to `analyzeHair`) + `get/setAnalysisProvider`.
  `QuestionsScreen` finishes through `getAnalysisProvider().analyze({gender, answers, images})`.
- **Gray branch**: `src/domain/analysis/grayProfile.ts` (`deriveGrayProfile`, `GrayAnswers`,
  `GrayProfile`). `sessionStore.diagnosis` gained `concern`, `grayAnswers`, `photoConsent`;
  session gained `grayProfile`. `hydrate()` merges old stored shapes over `EMPTY`.
  Gray-only path also sets a gray-neutral `deriveAnalysis` so `/report` + `/program` stay
  reachable — **WP6 must render gray content from `session.grayProfile` when `concern === 'gray'`**.
- `buildReport` param narrowed to `Pick<SessionState['diagnosis'], 'photos'>`.
- New i18n: `analysis.intro/gender/concern/photos/consent/scanning/results.*`, `gray.area/pace/summary.*`.
- `vite.config.ts` testTimeout already at 20000 from WP4.

**WP6 notes for resume:**
- `ReportView.tsx` re-skinned on `roote/*` as a numbered medical-summary `<article>` (13 `Sec`
  blocks), PDF-ready (one flowing doc, semantic, no interactive-only content). Own glass header +
  disclaimer footer.
- `buildReport` + `ReportModel` **unchanged** (still the tested pure builder). `ReportView` renders
  `model.plan.*` / `model.analysis.*` / `model.pricing.*` etc. The model's `regimen` / `actives` /
  `expect` / `faq` fields are now unused by `ReportView` (kept for `ReportEmailPreview`; trim in WP10).
- `ReportPage` now also computes `recommend(...)` and passes `grayProfile` (when `concern` is
  `gray`/`both`) — drives the safety/eligibility section + the gray profile section.
- `buildReport` cta href changed `/start?report=` → `/program?report=`.
- New i18n: `report.section.{observations,productsIncluded,safety}`, `report.gray.*`,
  `report.safety.*`.

**WP7 notes for resume:**
- `PlanStep` re-skinned on `ProgramCard` (was radios). `PlanStep.test` updated to
  `button[aria-pressed]` instead of `role="radio"`.
- `CheckoutStep` rebuilt as the brief §16 program-first summary: recommended-for concern,
  includes list, packaging (from `recommend().packaging`), treatment-review status, an **opt-in**
  subscription checkbox (unchecked by default — "no preselected recurring billing"), + a
  `LegalNotice`. `CheckoutStep.test` updated.
- `AccountStep` / `SuccessStep` / `StartLayout` (→ `Stepper`) re-skinned; behaviour unchanged.
- New i18n: `program.plan.*`, `program.checkout.*`.
- `buildReport` / `submitPayment` / `buildProgram` unchanged.

**WP8 notes for resume:**
- `AppShell` re-skinned; nav now the brief's 9 tabs (`today/program/progress/photos/scans/orders/
  subscription/care/profile`) + `data-pack` theme. `AppToday` re-skinned on `TreatmentChecklist` /
  `Stat` / `Card`.
- New: `AccountOrders` (from `store/orders`), `AccountSubscription` (recurring-terms disclosure +
  plain cancel flow, opt-in, `subscription_*` analytics). Both routed under `/account`.
- Route remap: `/account/program` (was `plan`), `+photos` (→ AppProgress for now), `+scans`
  (was `rescan`), `+orders`, `+subscription`. `/account/{plan,rescan}` redirect to the new names.
- `AppPlan` / `AppProgress` / `AppRescan` / `AppCare` / `AppProfile` still on OLD marketing
  primitives — render in the new palette/font but not fully re-skinned. **WP10 finishes these**
  (+ split `/account/photos` into its own component with `BeforeAfterSlider`, build the final-scan
  flow in `/account/scans`).
- `account.test.tsx` added (4 tests).

**WP9 notes for resume:**
- `content/legal.ts` gained `LEGAL_BODIES` (9 pages × drafted `{en,he}` sections) +
  `getLegalBody()`. Operational-pattern copy only, nothing copied; every operator-set
  specific carries an inline `[TODO: confirm …]` note.
- `LegalPageView` renders the real bodies + the dev review marker + the entity block.
- `containsForbiddenClaim()` hardened to word-boundary matching ("secure" no longer trips "cure").
- `legal.test.tsx` added (4 tests): all 9 render, no forbidden claims, TODO markers present, HE.

**WP10 notes for resume:**
- Deleted dead: `routes/diagnosis/` (WP5), `components/diagnosis/{QuestionCard,AnalyzingStrip}` + tests.
- Pruned orphaned i18n keys: `landing.*` + `marketing.blog.*` (already gone from WP3),
  `diagnosis.rail.*`, `diagnosis.intro.*`, `analysis.facet.*`.
- SEO: `ROUTE_META` extended (solutions, program, account); `metaForPath` does prefix fallback;
  `useDocumentMeta` wired into `AnalysisShell` too. `index.html` stays `noindex`.
- `containsForbiddenClaim` word-boundary fix.
- ESLint: `eslint.config.js` exempts `roote/Toast.tsx` from `react-refresh/only-export-components`.
  **`pnpm lint` = 0 errors, 0 warnings.**
- `analytics/wiring.test.tsx` — proves the assessment emits `analysis_started` / `gender_selected`
  / `concern_selected` through the installed adapter.
- Completion report: `docs/REDESIGN-COMPLETION.md`.

---

## Track 2 — Results Dashboard rebuild (spec pasted 2026-09-04)

A separate CRITICAL spec: rebuild `/account/*` as a before→after tracking system.
Supersedes the WP8 account work + the "deferred polish" account items below.

**Locked decisions (Q&A 2026-09-04):**
1. **Metrics: qualitative only** until a real analysis provider. No numeric %
   anywhere (`HairMetric` model carries a numeric slot for later, but the UI
   renders qualitative status / [PENDING] while `isMock`).
2. **Canonical `store/tracking.tsx`** (`roote.tracking` JSON + IndexedDB blobs for
   photos/scans). Migrates `Program.completionLog` / `progressPhotos` on first
   mount. `buildProgram` stays stable. `domain/tracking/` holds the pure model +
   builders; `buildUserProgram(program, tracking, diagnosis)` is the derived
   "backend-contract" view the UI reads.
3. **Checkpoint schedule** — I set the table (`[TODO: confirm with client]` in
   `domain/tracking/checkpoints.ts`): 90(photo 30,60/scan 45/final 90),
   120(photo 30,60,90/scan 60/final 120), 180(photo 30,60,90,120/scan 60,120/
   final 180), 270(photo q30/scan 90,180/final 270),
   360(photo q30/scan 90,180,270/final 360).

**Work packages:**

| WP | Covers (spec §) | Status |
|---|---|---|
| **A · Tracking domain + store** | §3, §15, §16 | ✅ **done** — 319 tests, typecheck/lint/build OK |
| B · Dashboard home (Overview + Today) | §1, §2, §12–14 | ✅ **done** — 321 tests, typecheck/lint/build OK, spot-checked |
| C · Baseline + Photos + Scans capture | §4, §5, §6 | ✅ **done** — 332 tests, typecheck/lint/build OK |
| D · Progress over time + Before/After tracker | §7, §8 | ✅ **done** — 336 tests, typecheck/lint/build OK, spot-checked |
| E · Final scan + Results report | §9, §10 | ✅ **done** — 338 tests, typecheck/lint/build OK, spot-checked |
| F · Reminders UI + final nav + prune dead screens | §11, §14, §15 | ✅ **done** — 340 tests, typecheck/lint/build OK, spot-checked |

**Track 2 is complete.** Deferred (documented below): full visual re-skin of the
three surviving pre-redesign screens (`AppPlan` / `AppCare` / `AppProfile`) onto
`roote/*` primitives — they work and inherit the palette; real notification
*delivery* (push / email / SMS) behind the reminders model; the `[TODO: confirm
with client]` markers on `CHECKPOINT_SCHEDULE` / `SLOTS` / `ADHERENCE_THRESHOLD`.

**WP-A notes:** `domain/tracking/` — `types.ts` (UserProgram, TreatmentTask,
ProgressCheckpoint, HairPhoto, HairScan, HairMetric, Reminder + enums),
`checkpoints.ts` (`CHECKPOINT_SCHEDULE` `[TODO: confirm]`, `buildCheckpoints`,
`nextCheckpoint`, `checkpointState`; scan wins over photo on a shared day),
`schedule.ts` (`SLOTS` `[TODO: confirm]` product→time-of-day, `tasksForDay` →
`{morning,evening,shampoo}`, `migrateTaskKeys`), `status.ts` (`programDay`,
`deriveStatus` on-track/catch-up/behind/complete — adherence only counts after
day 7, `ADHERENCE_THRESHOLD = 60` `[TODO: confirm]`), `reminders.ts`,
`buildUserProgram.ts` (the aggregated dashboard view). All pure + tested
(`tracking.test.ts`, 17). `store/tracking.tsx` — `roote.tracking` JSON;
`useTrackingMigration()` (called from `AppShell`) seeds it once per program from
the legacy `Program.completionLog` / `progressPhotos`. `TrackingProvider` mounted
in `App.tsx` (inside Cart, outside Toast).

**WP-B notes:** `/account` index → `AccountOverview` (MY ROOTÉ hero: Day X of Y,
status badge, `ProgramProgressBar` with checkpoint ticks, "Continue today's plan"
+ "View my progress", next-checkpoint card, reorder card). `/account/today` →
`AccountToday` (MORNING/EVENING/SHAMPOO groups from `tasksForDay`, per-task
done/skip, adherence). `useUserProgram()` hook is the single data source for
dashboard screens. `ProgramProgressBar` primitive added. `AppShell` nav → §11
(Overview/Today/My Program/Progress/Photos/Scans/Before & After/Orders/
Subscription/Support); Profile route kept but off the primary nav.
`/account/progress/before-after` route added (placeholder → WP-D).
`dashboard.test.tsx` (2 tests). `AppToday.tsx` is now dead (replaced) — prune in WP-F.

**WP-C notes:** three new `/account` screens, all reading `useUserProgram()` and
organised by checkpoint.
- `domain/tracking/metrics.ts` — `qualitativeMetrics({analysis, grayProfile,
  provider, isMock, capturedAt})` maps the deterministic analysis → `HairMetric[]`
  whose `status` is an i18n key and `value`/`unit` stay `null` while `isMock`
  (locked decision #1). `compareMetric(baseline, latest)` only reports
  `numericChange` when both sides are real (non-mock) numbers. Tested
  (`metrics.test.ts`, 5).
- `components/tracking/GuidedPhotoCapture.tsx` — one guided slot (spec §5):
  `<ScanGuide>` silhouette + previous checkpoint's photo as a faint ghost overlay,
  client-side downscale (`downscaleImage`), blob → IndexedDB, caller stores the
  ref. i18n `photo.*` + `common.remove`.
- `AccountBaseline.tsx` (`/account/baseline`, spec §4) — Day 0 eyebrow, "Before"
  badge, baseline/start dates, the four assessment views, `ScanCard` of qualitative
  reads, `app.baseline.metricsNote` ("numeric measurements appear once an analysis
  service is connected").
- `AccountPhotos.tsx` (`/account/photos`, spec §5) — every non-final checkpoint;
  the baseline is forced to `completed` (captured at program start); a checkpoint
  that is `due`/`overdue` swaps its read-only figures for `GuidedPhotoCapture`
  (ghost = previous checkpoint's shot); "Save this checkpoint" once all four views
  are present → `tracking.completeCheckpoint`.
- `AccountScans.tsx` (`/account/scans`, spec §6, replaces `AppRescan`) — when a
  `scan`/`final-scan` checkpoint is due: capture 4 views → "Analyzing your
  progress…" → `getAnalysisProvider().analyze()` (fallback `deriveAnalysis`) →
  `HairScan` with `qualitativeMetrics` + `Demo data` badge while `isMock`; scan
  history list. If earlier scans were skipped, the *earliest* overdue one is
  prompted first (do the one you missed), then the final.
- Routes: `baseline`→`AccountBaseline`; `photos`→`AccountPhotos` (was
  `AppProgress`); `scans`→`AccountScans` (was `AppRescan`). `useTrackingMigration`
  seeds baseline `HairPhoto`s from `session.diagnosis.photos`.
- i18n added (en+he parity): `app.metric.*`, `app.baseline.*`, `app.photos.*`,
  `app.scans.*`, `photo.retake`.
- Tests: `photos.test.tsx` (6) — baseline BEFORE state + qualitative-only guard,
  checkpoint-organised photo list + due-state capture UI, scans empty/prompt/final.
- Still on `roote/*` primitives but `AppProgress` (now behind `/account/progress`)
  and `AppRescan` are superseded for the `/account/photos` + `/account/scans`
  surfaces; `AppProgress` stays as the interim `/account/progress` until WP-D,
  `AppRescan` is dead — prune in WP-F.

**WP-D notes:** two screens under `/account/progress`, both reading `store/tracking`.
- `metricLabels.ts` — the metric-key → i18n-label map (+ `METRIC_LABEL_FALLBACK`),
  now shared by Baseline / Scans / Progress (was duplicated three ways).
- `AccountProgress.tsx` (`/account/progress`, spec §7, **replaces `AppProgress`**) —
  "Progress over time". One card per baseline metric showing its baseline read
  beside the latest scan's read, both qualitative (`compareMetric`); a numeric
  delta renders *only* when `compareMetric` returns one (both sides real + non-mock
  — never in the mock path). A `SegmentedControl` picks which scan is "latest" when
  there is more than one. `Timeline` primitive shows baseline + each scan + the
  remaining scan/final checkpoints. `app.progress.metricsNote` restates
  qualitative-only. Link out to before/after.
- `AccountBeforeAfter.tsx` (`/account/progress/before-after`, spec §8, **replaces the
  `PagePlaceholder`**) — baseline photos vs. a chosen checkpoint, `view` × `mode`
  matrix. `view`: front/top/crown/hairline `SegmentedControl`. `mode`: slider /
  side-by-side / timeline. Slider = `BeforeAfterSlider` primitive (native
  `<input type=range>` → pointer + touch + keyboard, `aria-valuetext`, RTL-aware,
  no auto motion). Side-by-side = two captioned frames. Timeline = one horizontal
  strip of the active view across every checkpoint that has it. Baseline photos
  fall back to `session.diagnosis.photos`. Photos shown as captured — no filter or
  enhancement (spec §8). Empty state → link to `/account/photos`. A checkpoint
  selector appears only with ≥2 comparable checkpoints.
- Routes in `App.tsx`: `progress`→`AccountProgress`, `progress/before-after`→
  `AccountBeforeAfter`. `AppProgress` + `PagePlaceholder` imports dropped from
  `App.tsx` (`PagePlaceholder` still used by legal / product / solution 404s;
  `AppProgress.tsx` file is now dead — prune in WP-F).
- i18n added (en+he parity): `app.progress.*` (metricsTitle, baselineLabel,
  latestLabel, compareWith, noScanYet, noBaseline, metricsNote, scanTimelineTitle,
  openBeforeAfter) + `app.beforeAfter.*` (title, body, compareLabel, viewLabel,
  modeLabel, mode.slider/sideBySide/timeline, reveal, missingBaseline,
  missingCompare, empty, addPhotos). `app.progress.title` reworded to
  "Progress over time"; old `app.progress.add/compare/timeline.*` kept (still used
  by the dead `AppProgress`/`AppRescan` until WP-F).
- Tests: `progressOverTime.test.tsx` (4) — metric pairing + qualitative-only guard,
  no-scan-yet message, before/after empty state, view × mode matrix incl. the
  slider role.

**WP-E notes:** the end-of-program payoff (spec §9–§10).
- `AccountResults.tsx` (`/account/results`) — "ROOTÉ PROGRAM RESULTS". Gated: shows a
  "being prepared" state until `up.status === 'complete'` **or** a `type:'final'`
  scan exists. When ready: summary card (length + dates); `ReportSection`s (no
  numbered markers — not a sequence) for **Before and after** (a `BeforeAfterSlider`
  on the front view + a 4-view initial/final grid + link to the full tracker),
  **Initial and final analysis** (a 3-col table: label · initial status · final
  status, all via `compareMetric` — a numeric delta shows *only* if both sides are
  real non-mock numbers, i.e. never in the mock path; `Demo data` badge while
  `isMock`), **Adherence** (`Stat` + "a routine measure, not a clinical result"),
  **What you used** (core + supporting treatments), **Your program timeline**
  (`Timeline`), **What's next is your choice** (explicitly *no* auto medical
  recommendation — three neutral user actions: start a new program → `/program`,
  new analysis → `/analysis`, care team → `/account/care`).
- "Download report" = `window.print()` (the PDF renderer was removed pre-redesign;
  this is the honest client-only stand-in) with a "save as PDF" hint.
- `AccountScans.runScan` now also writes the 4 scan shots as `HairPhoto`s at the
  scan's checkpoint id (deduped) — so scan imagery shows on Photos / Before-After /
  Results, not just the blob store.
- Entry points: `AccountOverview` shows a "Your program is complete" card →
  `/account/results` when `status === 'complete'`; `AccountScans` shows a "View your
  program results" button once a final scan exists. No permanent nav tab.
- Analytics: added `program_results_viewed` + `next_program_started`; wired the
  pre-existing `before_after_viewed` into `AccountBeforeAfter` (missed in WP-D).
- i18n `app.results.*` + `app.overview.programComplete/programCompleteBody/viewResults`
  (en+he parity). Tests: `results.test.tsx` (2).

**WP-F notes:** reminders surface + cleanup (spec §11, §14, §15).
- `AccountReminders.tsx` (`/account/reminders`) — "Coming up" list from
  `generateReminders({checkpoints, endDate, reorderDate, settings})` filtered to
  enabled; a toggle per `ReminderType` bound to `tracking.setReminder` /
  `isReminderEnabled`; a "delivery connects later" note. The reminder domain model
  (`domain/tracking/reminders.ts`) was already built in WP-A; this is its UI.
- Nav: added a **Reminders** tab to `AppShell` `TABS` (11 items now). Deviates from
  spec §11's literal list, which omits Reminders — but §15 wants it as a first-class
  architected surface and §14 wants it reachable on mobile, so it goes in the
  primary nav rather than a desktop-only footer link. `Results` stays off the nav
  (reached from Overview / Scans, per WP-E).
- Pruned the three now-dead pre-redesign screens: **deleted** `AppToday.tsx`,
  `AppProgress.tsx`, `AppRescan.tsx` (all unrouted, replaced by `Account*`; grep
  confirmed zero imports). The `app.progress.add/compare/timeline.*` keys they used
  are now fully orphaned — left in place (parity-neutral), flagged here.
- i18n `app.reminders.*` (title/subtitle/upcoming/none/settingsTitle/deliveryNote/
  on/off + `type.*` ×9) + `app.nav.reminders` (en+he parity). Tests:
  `reminders.test.tsx` (2) — category toggles + upcoming-list wiring.
- **Not done in WP-F** (kept as deferred polish, below): the full visual re-skin of
  `AppPlan` / `AppCare` / `AppProfile`. They render correctly and inherit the
  palette; a rushed swap of their `components/marketing/*` primitives at the end of
  the track carried more regression risk than value.

---

## Track 3 — Product-owner decisions (locked 2026-09-04)

The PO answered the 26 open questions. These are now build spec. Five items stay
`[PENDING]` (launch blockers): program/SKU pricing + COGS, Density medical/pharmacy
pathway, legal policies + EN/HE approval, HairHealth.ai API contract, final EN/HE
medical + consent copy. Everything else below is implementable now.

**T3 batches — all ✅ done (green at each boundary, no commits). ~346 tests.**

| Batch | Items | Status |
|---|---|---|
| 1 · Tracking model | #14 checkpoints · #16 adherence tiers · #17 missed checkpoints · #20 reorder 21/14/7 | ✅ |
| 2 · Dashboard IA | #22 reminders → Profile · #21 channels copy · #19 Review-Next-Program flow | ✅ |
| 3 · Config & catalogue | #3 currency USD+ILS · #2 shipping · #1 renewal customer-initiated · #5 supporting = Regrowth Shampoo / optional scalp guidance · #6 six SKU descriptors · #26 locale roadmap EN→HE→AR→RU→FR→ES · #23 HairHealth.ai naming | ✅ |
| 4 · Assessment flow | #24 gender +"Prefer not to say" + packaging chooser · #25 photo min = 4 to analyse · #11 marketing consent split at results-email gate | ✅ |
| 5 · PDF layer | #18 real Initial + Results PDF via `jspdf` (lazy chunk; Download works, Email = stub) | ✅ |

**T3 implementation notes (files):**
- **#14** `domain/tracking/checkpoints.ts` `poSchedule()` — photos /30, scans at 90/180/270, final on the last day. `[TODO: confirm]` comment replaced with "PO #14".
- **#16** `domain/tracking/status.ts` — `ProgramStatus` is now `on-track | keep-going | catch-up | complete`; `deriveStatus(currentDay, durationDays, adherencePct)` (checkpoints no longer feed status); `ADHERENCE_ON_TRACK = 80`, `ADHERENCE_GRACE_DAYS = 7`. `AccountOverview` `STATUS_TONE` → success/info/neutral (no red).
- **#17** `TrackingState.skippedCheckpoints: string[]` + `store/tracking` `skipCheckpoint` (toggle) + `SKIP_CHECKPOINT`. `checkpointState(cp, day, skipped?)` → new `'skipped'` state; `'overdue'` label is now "Past due". `nextCheckpoint(cps, day, skipped[])`. `AccountPhotos` + `AccountScans` show Skip / Un-skip on past-due; `AccountScans.dueCheckpoint` prefers the final scan, then the one actually due — never forces the oldest missed scan.
- **#20** `roote.config` `reorderReminderLeadDays: [14, 7]` (card still at 21). `generateReminders({..., reorderDates: string[], skipped?})` emits a reorder nudge per date; skipped checkpoints get none.
- **#19** `AccountRenew.tsx` (`/account/renew`) — carried-forward profile + Continue / Maintain / Re-assess (`RadioCard`), clinician-review `LegalNotice`, CTA → `/program/plan` (or `/analysis` for re-assess). `AccountResults` "Start a new program" → this flow. i18n `app.renew.*`.
- **#22** `AppShell` TABS drops `reminders`; `AppProfile` gains a "Notifications & reminders" section linking `/account/reminders`; `AccountToday` shows the next ≤2 upcoming reminders. Screen renamed "Notifications & reminders" (`app.reminders.title`, `app.nav.reminders`).
- **#21** `app.reminders.deliveryNote` → "in the app and by email" at launch; push/SMS later phases.
- **#3** `i18n/locales.ts` `LAUNCH_CURRENCIES = ['USD','ILS']` + `launchCurrencyFor(country)` (non-launch → USD); `roote.config.currency` `'ILS'` → `'USD'`.
- **#2** `CheckoutStep` program shipping line → "Free standard shipping" (`start.checkout.shippingFree`), not `[PENDING]`. **#1** the subscribe checkbox already defaulted off — confirmed.
- **#5** `roote.config.treatments`: core = `roote-density` ("ROOTÉ Density", `frequency.daily-evening`); supporting = `regrowth-shampoo` (`frequency.wash-day`) + `derma-stim` relabelled "Scalp-care guidance (optional)" with a no-regrowth-claim usage string. `SLOTS` already matched (density→evening, etc.). Gray Support / Gray Serum are concern-branched — NOT in the universal list (branched-routine follow-up noted).
- **#6** `content/products.ts` six SKU `subtitle`s updated to the PO's public descriptors; "Color Restore" already archived; formula % still `displayFormulaDetail: false`.
- **#26** `LOCALES` reordered to EN→HE→AR→RU→FR→ES (= picker order); `LOCALE_ROADMAP` const added; `ar` already `dir: 'rtl'`.
- **#23** `domain/analysis/provider.ts` doc comment: target = HairHealth.ai HairScan, contract `[PENDING]`, don't guess, qualitative-only in prod, don't surface ScalpScan trichoscope metrics from selfies.
- **#24** `Gender` type += `'unspecified'`; `deriveAnalysis` `scale = gender === 'female' ? 'ludwig' : 'norwood'`. `assessment.ts` `GENDER_OPTIONS` +"Prefer not to say" + `PACKAGING_OPTIONS`. `GenderScreen` shows a packaging sub-choice for "unspecified". `sessionStore.diagnosis.packagingPreference` + `setPackagingPreference`. `AppShell` `data-pack` uses it.
- **#25** `routes/analysis/guards.ts` — `scanning`/`questions` need `photos.length >= 4` (was `>= 1`).
- **#11** `ResultsScreen` — two checkboxes: "Email me my ROOTÉ results" (operational, pre-checked, blocks submit if off) + "ROOTÉ news and offers" (optional, off, never blocks). `sessionStore.account.marketingConsent` + `setMarketingConsent`; `SET_EMAIL` no longer drops the account object.
- **#18** `jspdf@2.5.2` (dynamic `import()` → lazy chunk, main bundle unaffected). `src/pdf/reportPdf.ts` `buildRootePdf({title, subtitle, sections, disclaimer, filename})` — dumb renderer, Latin-only (Hebrew PDF font embedding is a `[TODO]`). "Download PDF" on `/report` (`ReportView`) + `/account/results`; "Email PDF" = toast stub.

**T3 open items still `[PENDING]` (launch blockers):** program/SKU pricing + COGS · Density medical/pharmacy pathway · legal policies + EN/HE approval · HairHealth.ai API contract · final EN/HE medical + consent copy. Plus follow-ups: Hebrew PDF font, real reminder/email delivery, geo→currency wiring at checkout, gender-neutral report-scale copy polish for "Prefer not to say".

---

## Track 3.1 — concern-branched routine fix (2026-09-04)

**The gap:** `resolvePlanTreatments()` / `buildReport()` read one universal
treatment list regardless of `diagnosis.concern` — so a gray-only customer's
Today/My Program/PDF/results all showed the thinning Density routine, and a
thinning-only customer never saw Gray Support/Serum for a "both" plan. The
recommendation engine (`domain/recommendation/recommend.ts` + `rules.ts`,
already concern-aware — `gray-only` → Gray Support+Serum, no Density; `both` →
Density + Regrowth Shampoo + Gray Support+Serum; `thinning` → Density +
Regrowth Shampoo) existed but was only used for the packaging label, never for
the product set itself.

**Fix:**
- `content/roote.config.ts`: `treatments.{core,supporting}` (two fixed arrays)
  → `treatmentRegistry: Record<slug, TreatmentDef>` covering all 6 product keys
  (`density-6/10/15`, `regrowth-shampoo`, `gray-support`, `gray-serum`,
  `derma-stim`) plus their name/usage/frequency/zones. New i18n:
  `usage.gray-support`, `usage.gray-serum`, `frequency.daily-morning` (en+he).
- `domain/recommendation/planKeys.ts` (new) — `planKeysFor(outcome)` turns a
  `RecommendationOutcome` into `{core: string[], supporting: string[]}`
  registry keys (density tier if any + supporting keys + `derma-stim` riding
  along only when a Density component is present).
- `domain/report/buildReport.ts` — now takes `diagnosis.gender` + `.concern`
  too, runs `recommend()` + `planKeysFor()` internally, and resolves
  `plan.core/supporting` + `regimen.items` from `treatmentRegistry` via the
  branched keys instead of the old universal list. This also fixes the
  **pre-purchase report and the frozen `Program.plan`** (checkout freezes
  whatever `buildReport` computed), not just the post-purchase dashboard.
- `app/routes/app/programProgress.ts` — new `planKeysForProgram(diagnosis,
  analysis)` (wraps `recommend()`+`planKeysFor()`); `resolvePlanTreatments`
  now takes those keys explicitly instead of reading the config directly, so
  it stays a pure "keys → display strings" resolver.
- Callers updated: `useUserProgram.ts`, `useTrackingMigration.ts`,
  `AppPlan.tsx` all compute `planKeysForProgram(session.diagnosis,
  program.analysisSnapshot)` before resolving. `marketing/HowItWorks.tsx`'s
  kit showcase (pre-assessment, not concern-specific) points at 3 explicit
  registry keys instead of the old universal list.
- Tests: `programProgress.test.ts` (`planKeysForProgram` branches thinning /
  gray / both correctly, `gender: null` → empty), `buildReport.test.ts` (same
  three branches end-to-end through the report model, asserting Density and
  Gray products never mix). **345 tests passing.** Spot-checked live —
  switching `diagnosis.concern` between thinning/gray/both on the same seeded
  program correctly swaps Today's tasks and My Program's treatment cards with
  no console errors.
- Known remaining minor gap: `recommend()`'s `packagingFor(gender)` still maps
  `'unspecified'` → `'women'` internally (domain-pure, doesn't know about
  `packagingPreference`); the app-layer override already used in `AppShell`
  isn't threaded into `CheckoutStep`/`ReportView`'s packaging label. Cosmetic,
  not a product-set bug.

**Locked values (Track 3):**
- **Checkpoints (#14 — supersedes the ⅓/⅔ model):** photos every 30d, formal
  scan every 90d, final scan at completion. 90: P30·P60·F90. 120: P30·P60·S90·F120.
  180: P30·P60·S90·P120·P150·F180. 270: +S180·P210·P240·F270. 360: +S270·P300·P330·F360.
- **Adherence (#16):** 80–100 On Track · 60–79 Keep Going · <60 Catch Up. Status only
  after day 7. No red/error styling for routine adherence.
- **Missed checkpoints (#17):** never block, never hide. Label **Past Due**; allow
  *Complete now* / *Skip* (skipped state recorded). Final Scan always reachable — do
  not force the oldest missed scan first.
- **Reorder (#20):** dashboard card at end−21d; email + in-app at −14d; final at −7d.
- **Renewal (#1):** v1 programs do **not** auto-renew. Completed → scan → results →
  **Review My Next Program** flow → checkout. Renewal price = `N/A — customer initiated`.
- **Shipping (#2):** free standard shipping folded into the program price at launch
  (no post-recommendation surprise charge). À-la-carte shipping `[PENDING]`.
- **Currency (#3):** launch **USD + ILS** (`en-US→USD`, `he-IL→ILS`); `en-GB→GBP`
  when UK commerce activates; EUR later; **no RUB at launch**.
- **Re-scan window (#4):** formal 90d; progress photos ~30d. No effectiveness %, no
  "results in X days", no guarantees. No separate physician fee (fold into price).
- **Supporting treatments (#5):** "Gentle scalp cleanser" **is** ROOTÉ Regrowth
  Shampoo (not a distinct SKU). "Scalp stimulation routine" → optional scalp-care
  guidance, no regrowth claim. Oral component = ROOTÉ Gray Support. No separate oral
  Density supplement.
- **Routine slots (#15):** Density → evening (clinician-approved timing) · Gray
  Support → morning/with meal · Gray Serum → evening · Regrowth Shampoo → wash day.
  **Do not auto-stack** a Density topical + Gray Serum — `[PENDING CLINICAL
  COMPATIBILITY REVIEW]`.
- **Six SKUs (#6):** DENSITY 6 / 10 / 15 ("Personalized / Advanced / Intensive
  Density Treatment") · GRAY SUPPORT ("Daily Pigment Support") · REGROWTH SHAMPOO
  ("Scalp & Density Support Cleanser") · GRAY SERUM ("Daily Pigment Support Serum").
  ("Color Restore Shampoo" is dropped.) Formula % stays hidden from public marketing.
- **Testimonials/press/advisers (#7):** production hides the section or shows
  "Verified ROOTÉ results coming soon." Never fabricate.
- **Gender (#24):** Male / Female / **Prefer not to say**. "Prefer not to say" → ask
  packaging (Dark Teal / Cream). Recommendation must not depend solely on
  gender/packaging.
- **Photo minimum (#25):** all four views (front/top/crown/hairline) required to run
  the full analysis; a draft may hold fewer.
- **Consent (#11):** "Email me my ROOTÉ results" = operational/required; "ROOTÉ news
  and offers" = separate, optional. Marketing consent is never a condition of the report.
- **Locales (#26):** EN → HE → AR → RU → FR → ES. AR is next (RTL already needed).
- **Provider (#23):** target = **HairHealth.ai**; API contract `[PENDING]` — adapter
  + mock in dev + qualitative production bands only, no fabricated %. Design for
  HairScan fields (hair type, density estimate, thickness, loss stage, volume,
  overall score, image-quality confidence); do **not** surface trichoscope-grade
  ScalpScan metrics from phone selfies unless the signed contract confirms them.
- **Reminder channels (#21):** v1 = in-app + email. Push = phase 1.1. SMS = phase 2,
  opt-in, transactional only. Keep transactional vs promotional consent separate.
- **Reminders nav (#22):** remove from primary nav; live under **Profile / Settings**
  as "Notifications & Reminders"; surface upcoming ones on Overview + Today.

---

### Deferred polish (not blockers — for a follow-up pass)
- Full re-skin of `AppPlan` / `AppProfile` / `AppCare` on `roote/*` (they work +
  inherit the palette but still use `components/marketing/*` primitives).
- Wire real notification delivery (push / email / SMS) behind the reminders model.
- `buildReport` model: trim now-unused `regimen` / `actives` / `expect` fields.
- Remove the remaining unused `components/marketing/*` once the app routes are re-skinned.
- `About.tsx` / `Support.tsx` full rebuild on `roote/*`.
- Professional review of FR/RU/AR/ES scaffolds; then add to the parity test.
- Reduce the global `[data-animate]` reveal (frontend-design: per-section fade-up reads as a tell);
  scope it to one orchestrated moment.
- `ScanGuide` ghost-overlay + real camera framing in the photo step.

### Deferred out of WP0 (done in their consuming WP)
- `src/content/catalog.ts` 17→6 SKUs — **WP4** (with `/products`)
- `src/content/roote.config.ts` migration into new content modules — **WP4/WP6/WP7**
- Route table / redirects — **WP2**
- `LocaleToggle` → full `CountryLanguageSelector` — **WP2**
