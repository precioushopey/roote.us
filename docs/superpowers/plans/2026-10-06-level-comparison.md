# Level 6/10/15 Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship a shared `LevelComparison` (view-model + renderer) that makes Level 6/10/15 understandable in seconds, shown on `/products` and the three Level product pages, with Minoxidil / Finasteride / DHT explainer snippets.

**Architecture:** A pure content-layer module (`src/content/levelComparison.ts`) derives numbers and ingredient notes from `products.ts` and exposes `buildLevelComparison(locale)` returning a resolved, localized, pending-flagged view-model. A presentational component renders it; a thin section wrapper builds the model for the current locale. Chrome strings live in the six `i18n/messages/*.ts` files.

**Tech Stack:** React 18, Vite, Tailwind v4 (logical utilities), `motion/react`, existing `roote` component set.

**Spec:** `docs/superpowers/specs/2026-10-06-level-comparison-design.md`

## Global Constraints

- Mechanism-only copy: no efficacy %, no "regrows hair", no time-to-results.
- Never invent product content; unsupplied data → `PENDING(label)` / `[PENDING: label]`.
- Six-locale parity (`en/he/ar/ru/fr/es`), no empty values; `pnpm i18n:check` and `pnpm content:check` green.
- `src/content/levelComparison.ts` is pure: no React, DOM, storage, i18n provider.
- Renderer consumes the view-model only (no `roote.config`, no `t()` for domain content).
- RTL-safe: logical utilities only (`ms/me/ps/pe`, `text-start`), never `ml/mr/left/right`.
- Every motion effect has a `prefers-reduced-motion` static fallback (`useReducedMotion` from `@/app/lib/useReducedMotion`).
- Finasteride is its own row/scale (0.3 / 0.1 / 0.1) — never one rising scale. No "best/recommended" badge on any level.
- `pnpm typecheck` stays at 0 diagnostics. No tests are added (project rule). No commits (project rule: only when asked).

## Review Focus

- Missing ingredient strength on a Level → shows `[PENDING]`, meter renders empty, no crash/NaN.
- Hebrew/Arabic: meters fill from the inline-start edge, tabs/columns order flips correctly.
- `prefers-reduced-motion`: meters appear already filled, no animation.
- Phone width: only the selected level is visible; tab control reachable and labelled.
- Level 6 has no extras: shows "None added", not an empty box.

## File Structure

- Create `src/content/levelComparison.ts` — raw six-locale copy + `buildLevelComparison`.
- Create `src/app/components/marketing/LevelComparison.tsx` — `LevelComparison` (presentational) + `LevelComparisonSection` (wrapper).
- Create `src/app/components/marketing/SnippetIllustration.tsx` — small decorative SVGs.
- Modify `src/i18n/messages/{en,he,ar,ru,fr,es}.ts` — `marketing.levels.*` keys.
- Modify `src/app/routes/marketing/Products.tsx`, `ProductDetail.tsx` — mount the section.

---

### Task 1: Content model and builder

**Files:** Create `src/content/levelComparison.ts`

**Interfaces:**
- Produces:
  ```ts
  export type LevelSlug = 'density-6' | 'density-10' | 'density-15';
  export const LEVEL_SLUGS: readonly LevelSlug[];
  export type Meter = { value: number | PendingMarker; unit: '%'; fill: number }; // fill 0..1
  export type LevelExtra = { name: string; strength: string | PendingMarker; note: string };
  export type LevelColumn = {
    slug: LevelSlug; name: string; tagline: string; suits: string; claimStatus: ClaimStatus;
    minoxidil: Meter; finasteride: Meter; extras: LevelExtra[];
  };
  export type LevelSnippet = { id: 'minoxidil' | 'finasteride' | 'dht'; title: string; body: string; claimStatus: ClaimStatus };
  export type LevelComparisonModel = {
    columns: LevelColumn[]; notARanking: string; snippets: LevelSnippet[]; pendingMedia: PendingMarker[];
  };
  export function buildLevelComparison(locale: LocaleCode): LevelComparisonModel;
  ```

- [ ] **Step 1: Write the file.** Imports: `L6, pickLocalized, type LocalizedText` from `./localized`; `getProduct` from `./products`; `PENDING, type PendingMarker` from `./pending`; `ClaimStatus` from `./claims`; `LocaleCode` type from `@/i18n/locales`.
- [ ] **Step 2: Raw copy.** `TAGLINE: Record<LevelSlug, LocalizedText>` (EN: "Lower Minoxidil level" / "Stronger / advanced level" / "Highest Minoxidil level"); `SUITS: Record<LevelSlug, LocalizedText>` — ≤2 short plain lines each, generic, derived from the products' `role` field, no patient profiles (e.g. Level 6: "A lower-strength starting point."; Level 10: "A stronger, more advanced formula for those whose professional advises a step up."; Level 15: "The highest Minoxidil level, for those whose professional advises the strongest option."); `NOT_A_RANKING` (EN: "Higher isn't automatically better. Different people suit different levels, and each needs medical review before use. Talk to a clinician about which fits you."); `SNIPPETS` for `minoxidil`, `finasteride`, `dht` (2–3 mechanism-only sentences each, e.g. Minoxidil: "A topical ingredient that is understood to widen small blood vessels in the scalp and help hair stay longer in its growth phase."; Finasteride: "An ingredient that is understood to reduce DHT, a hormone linked to follicles shrinking over time."; DHT: "A hormone made from testosterone. In people who are sensitive to it, it is linked to hair follicles gradually getting smaller."). All `L6({en,he,ar,ru,fr,es})`, real translations, `he` as reference; medical-sounding lines noted "pending formal legal review" in a comment, as `legal.ts` does.
- [ ] **Step 3: Builder.** For each slug: `p = getProduct(slug)`; strength via `p.ingredients.find(i => i.name === 'Minoxidil')?.strength`; `parsePct = (s?: string) => { const n = s ? parseFloat(s) : NaN; return Number.isFinite(n) ? n : null }`. `meter(strength, max)` → `n === null ? { value: PENDING('<slug> <ingredient> strength'), unit:'%', fill: 0 } : { value: n, unit:'%', fill: Math.min(1, n / max) }`; Minoxidil max 15, Finasteride max 0.3. `extras = p.ingredients.filter(i => i.name !== 'Minoxidil' && i.name !== 'Finasteride').map(i => ({ name: i.name, strength: i.strength ?? PENDING(`${i.name} strength`), note: pickLocalized(i.note, locale) }))`. `claimStatus` = 'working'. `pendingMedia = [PENDING('Level lifestyle photo'), PENDING('Level explainer video'), PENDING('Before/after (real consented results only)')]`. Unknown slug → `PENDING` meters (never throw).
- [ ] **Step 4: Verify.** `pnpm typecheck` → 0 diagnostics. `pnpm content:check` → no gaps in `levelComparison.ts`.

### Task 2: i18n chrome keys (six locales)

**Files:** Modify the six `src/i18n/messages/*.ts` (append before the closing `}` / `} as const;`).

**Produces keys (EN):**
`marketing.levels.title` "Level 6, 10 or 15?" · `marketing.levels.body` "Three strengths for different people. See what each one contains." · `marketing.levels.tabsLabel` "Choose a level" · `marketing.levels.minoxidilLabel` "Minoxidil level" · `marketing.levels.finasterideLabel` "Finasteride (its own scale)" · `marketing.levels.extrasLabel` "Added ingredients" · `marketing.levels.noExtras` "None added" · `marketing.levels.suitsLabel` "May suit" · `marketing.levels.stripTitle` "Different people, different levels" · `marketing.levels.thisLevel` "This level" · `marketing.levels.snippetsTitle` "The basics, simply" · `marketing.levels.meterAria` "{label}: {value}%" · `marketing.levels.legalNote` "General information, not medical advice. Pending formal legal review."

- [ ] **Step 1:** Add all 13 keys to `en.ts`, then real translations to `he/ar/ru/fr/es` (keep `{label}`/`{value}` placeholders intact).
- [ ] **Step 2:** `pnpm i18n:check` → green (key parity, no empties, placeholder integrity).

### Task 3: Renderer

**Files:** Create `LevelComparison.tsx`, `SnippetIllustration.tsx` in `src/app/components/marketing/`.

**Interfaces:**
- Consumes: `LevelComparisonModel`, `LevelColumn` (Task 1); `useT`, `useLocale`, `useLocalizedPath`; `Section, SectionIntro, SegmentedControl, Accordion, Button, PendingChip, MediaPlaceholder` from `@/app/components/roote`; `INGREDIENT_PHOTOS`; `isPending`.
- Produces: `LevelComparison({ model, highlight? }: { model: LevelComparisonModel; highlight?: LevelSlug })`, `LevelComparisonSection({ highlight? }: { highlight?: LevelSlug })`, `SnippetIllustration({ id }: { id: LevelSnippet['id'] })`.

- [ ] **Step 1: `Meter`** — track `div` (`h-2 rounded-full bg-border`, `role="img"`, `aria-label` from `marketing.levels.meterAria`), inner fill `motion.div` with `style`/animate `width: ${fill*100}%` via `whileInView` once; when `useReducedMotion()` is true render a plain `div` at final width. Value shown as text beside it; if `isPending(value)` show `<PendingChip label=…/>` and width 0.
- [ ] **Step 2: Column** — product photo (same `PRODUCT_PHOTOS` map as Products), name, tagline, Minoxidil meter, Finasteride meter (separate label), extras (icon from `INGREDIENT_PHOTOS[name]`, name, strength, note; "None added" when empty), "May suit" card. Highlighted column gets a neutral `ring-1 ring-border` + `thisLevel` text, no accent/"best" styling. Mobile: `SegmentedControl` over the three slugs sets `active`; columns use `className={active===slug ? 'block' : 'hidden md:block'}`; grid `md:grid-cols-3`.
- [ ] **Step 3: Strip + snippets** — `stripTitle` + `model.notARanking` + `Button to={withLocale(PATHS.analysis)}` using existing `marketing.nav.cta`; `Accordion` of snippets (`SnippetIllustration` + body); `legalNote` small text; one `MediaPlaceholder` per `model.pendingMedia` entry (kind image/video).
- [ ] **Step 4: `SnippetIllustration`** — three decorative inline SVGs (follicle, follicle with narrowing, DHT molecule dot), `aria-hidden`, colours via `currentColor`/theme tokens only.
- [ ] **Step 5: `LevelComparisonSection`** — `const cl = useLocale().locale; const model = useMemo(() => buildLevelComparison(cl), [cl]);` wrapped in `<Section tone="cream" width="content" gap={8}>` with `SectionIntro` (`title`/`body`).
- [ ] **Step 6: Verify** `pnpm typecheck` → 0 diagnostics.

### Task 4: Wire into pages

**Files:** Modify `Products.tsx` (after `<Hero …/>`, before the catalog `<Section>`), `ProductDetail.tsx` (after the "fit" `<Section>`, only when `LEVEL_SLUGS.includes(product.slug as LevelSlug)`, passing `highlight`).

- [ ] **Step 1:** Add imports and mount both.
- [ ] **Step 2:** `pnpm typecheck` → 0; `pnpm build` → succeeds (chunk-size warning expected).

### Task 5: Browser verification and docs

- [ ] **Step 1:** `pnpm dev`; check `/en/products`, `/en/products/density-6`, `/density-10`, `/density-15` at desktop and ~390px: three columns on desktop, tabs on phone, Finasteride row shows 0.3 / 0.1 / 0.1, Level 6 shows "None added", no console errors.
- [ ] **Step 2:** Check `/he/products` (RTL): fill from the inline-start edge, layout mirrored. Emulate `prefers-reduced-motion: reduce`: meters pre-filled.
- [ ] **Step 3:** `pnpm i18n:check`, `pnpm content:check`, `pnpm typecheck`, `pnpm build` all clean.
- [ ] **Step 4:** Add one line to `CLAUDE.md` (content layer list) mentioning `levelComparison.ts` and `LevelComparison`; update i18n key count there to the new total printed by `pnpm i18n:check`.
