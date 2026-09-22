# Quiz Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconnect marketing "Start Free Hair Analysis" CTAs to ROOTÉ's own `/analysis` flow (reverting the 2026-09-08 external-Landbot detour), then migrate `/analysis`'s question content and step order to match the product-owner-supplied v3.1 questionnaire spec.

**Architecture:** Part A is a mechanical, page-by-page revert of one CTA destination across ~19 files — each task is independently shippable and visually verifiable. Part B extends the existing `Answers` domain type and `content/assessment.ts` question banks additively (no existing field removed or renamed). Part C adds three new wizard screens reusing the existing `RadioCard`/`AnalysisShell` patterns exactly as `Steps1to3.tsx` already does. Part D rewires `guards.ts` and the two screens whose "next step" target changes. No new UI library, no new state-management pattern — every new piece follows a pattern already live in this codebase.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Tailwind v4 + react-router v7, existing `sessionStore` reducer, existing `content/*.ts` six-locale `L6()` content layer.

**Spec:** `docs/superpowers/specs/2026-09-22-quiz-redesign-design.md`

## Global Constraints

- **pnpm only.** Verify with `pnpm typecheck` (must stay at 0 diagnostics) after every task. This repo has **no test suite** (`*.test.ts(x)` files were deliberately removed 2026-09-10, per `CLAUDE.md`) — do not add new test files. Verification is `pnpm typecheck` + `pnpm content:check` + `pnpm i18n:check` (for tasks touching `content/*.ts`) + a manual check in `pnpm dev`, not automated tests.
- **Six-locale parity is mandatory.** Every new `L6({...})` entry needs `en`, `he`, `ar`, `ru`, `fr`, `es`, all non-empty — enforced by `pnpm content:check`. Never invent product/medical content; every string in this plan is either copied from the v3.1 spec or a direct, literal translation of it.
- **RTL-safe styling.** Use `ms/me/ps/pe`, `text-start/-end`, never `ml/mr/left/right`. (No new custom layout is introduced by this plan — every new screen reuses `RadioCard`/`DisplayTitle`/`Prose` exactly as existing screens do, so this should require no new CSS at all.)
- **Domain layer stays pure.** `src/domain/**` gets no React/DOM/storage/i18n-provider imports (Part C, Task C.3 touches `src/domain/recommendation/hairGrowthTable.ts` and `src/domain/analysis/deriveAnalysis.ts` — both stay pure functions of their inputs).
- **Locale-aware internal links.** Every in-app `<Link>`/`<Button to=...>` must be locale-prefixed via `useLocalizedPath()` (commonly bound to a local `withLocale` const) — a bare `to={PATHS.analysis}` without `withLocale(...)` is a bug (it will 404 outside `en`).
- **Commit after each task**, using the message style already used in this repo's history (`feat: ...` / `fix: ...`, one line + a body when the "why" isn't obvious from the diff).

---

# Part A — Reconnect marketing CTAs to `/analysis`

Every task in this part does the same mechanical thing: replace `<Button to={EXTERNAL_ASSESSMENT_URL} external ...>` with `<Button to={withLocale(PATHS.analysis)} ...>` (drop the `external` prop — an in-app `Button` with `to` and no `external` already renders a `react-router` `<Link>`), adding `PATHS` / `useLocalizedPath` imports and a `withLocale` binding only where the file doesn't already have one in scope. `/hair-scan` (`HairScan.tsx`) and everything under `LandbotFullpageEmbed.tsx` / `remoteAnalysisAdapter.ts` are **out of scope** — do not touch them; `/hair-scan`'s own CTA is intentionally left pointing at the external quiz, since that page is *about* that external quiz.

### Task A.1: `paths.ts` comment cleanup + `CtaSection.tsx` (shared component)

**Files:**
- Modify: `src/app/paths.ts:40-52`
- Modify: `src/app/components/roote/CtaSection.tsx`

**Interfaces:**
- Produces: `CtaSection`'s default CTA now resolves to the in-app analysis flow, so every caller that doesn't pass its own `ctaHref` (About.tsx, Faq.tsx, Products.tsx's `ShopFinalCta`, Magazine.tsx) gets the fix for free from this one task.

- [ ] **Step 1: Update the `EXTERNAL_ASSESSMENT_URL` doc comment in `paths.ts`**

It's no longer the marketing default — update the comment so it doesn't claim that. Leave the constant itself defined (still needed if/when `/hair-scan` gets a real `configUrl`, and nothing in this plan removes `/hair-scan`'s own usage of it).

```ts
/**
 * External HairHealth.ai assessment quiz (Landbot fullpage) — used ONLY by
 * `/hair-scan`'s own CTA (`HairScan.tsx`), a separate, secondary lead-gen
 * surface. As of 2026-09-22, every marketing "Start free hair analysis" CTA
 * points at ROOTÉ's own `PATHS.analysis` again (reverting the 2026-09-08
 * decision — see docs/superpowers/specs/2026-09-22-quiz-redesign-design.md).
 * This is still the TEST link Justine shared, not a production one.
 */
export const EXTERNAL_ASSESSMENT_URL = 'https://roote.vercel.app/test/landbot/fullpage';
```

- [ ] **Step 2: Fix `CtaSection.tsx`'s default CTA**

Read the current file first (`src/app/components/roote/CtaSection.tsx`). Replace the top-level default-parameter approach (a hook can't be called outside a component body) with computing the default inside the function body:

```tsx
import type { ReactNode } from 'react';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';
import { cn } from '@/app/components/ui/utils';
import { Button } from './Button';
import { DisplayTitle, Prose } from './Text';
import { Section } from './Section';
import type { DisplayStep } from '@/app/components/marketing/displayScale';
import { useFitTitle } from '@/app/lib/useFitTitle';

export type CtaSectionImage = {
  src: string;
  alt: string;
  className?: string;
};

export type CtaSectionProps = {
  title: ReactNode;
  titleStep?: DisplayStep;
  body?: ReactNode;
  /** Benefit checklist rendered under `body` — only meaningful in the
   *  `image` variant (Home's is the one caller that needs it). */
  items?: ReactNode[];
  /** Defaults cover every current call site: they all point to ROOTÉ's own
   *  analysis flow with the same label. */
  ctaLabel?: ReactNode;
  ctaHref?: string;
  external?: boolean;
  /** Presence switches to the two-column, image-right layout (Home's
   *  richer closing CTA); omit for the centered heading+body+button band
   *  used everywhere else. */
  image?: CtaSectionImage;
  className?: string;
};

/**
 * The site's one closing-CTA band — a `<Section tone="teal">` with a
 * heading, optional body, and a button, used to end a marketing page.
 * Every page's closing CTA should render through this rather than
 * hand-rolling the same markup again.
 */
export function CtaSection({
  title,
  titleStep = 'lg',
  body,
  items,
  ctaLabel,
  ctaHref,
  external = false,
  image,
  className,
}: CtaSectionProps) {
  const t = useT();
  const withLocale = useLocalizedPath();
  const titleRef = useFitTitle<HTMLHeadingElement>(3);
  const label = ctaLabel ?? t('marketing.nav.cta');
  const href = ctaHref ?? withLocale(PATHS.analysis);

  if (image) {
    return (
      <Section tone="teal" width="content" className={cn('border-b border-accent', className)}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <DisplayTitle ref={titleRef} as="h2" step={titleStep}>
              {title}
            </DisplayTitle>
            {body ? <Prose className="text-ink-foreground">{body}</Prose> : null}
            {items?.length ? (
              <ul className="flex flex-col gap-4">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <Button to={href} external={external} caps className="w-full sm:w-auto mt-4">
              {label}
            </Button>
          </div>
          <img src={image.src} alt={image.alt} loading="lazy" className={cn('w-full object-contain shadow-product', image.className)} />
        </div>
      </Section>
    );
  }

  return (
    <Section tone="teal" width="content" className={cn('border-b border-accent text-center', className)}>
      <div className="flex flex-col items-center gap-4">
        <DisplayTitle ref={titleRef} as="h2" step={titleStep} align="center">
          {title}
        </DisplayTitle>
        {body ? <Prose className="mx-auto text-center text-ink-foreground">{body}</Prose> : null}
        <Button to={href} external={external} caps className="w-full sm:w-auto mt-4">
          {label}
        </Button>
      </div>
    </Section>
  );
}
```

Note what changed: `ctaHref`'s default is gone from the destructuring (was `EXTERNAL_ASSESSMENT_URL`, now computed as `href`), `external`'s default flips from `true` to `false`, and the `EXTERNAL_ASSESSMENT_URL` import is dropped in favor of `PATHS` + `useLocalizedPath`.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics (this component's callers — About.tsx, Faq.tsx, Magazine.tsx, Products.tsx — all call `<CtaSection title=... />` with no `ctaHref`/`external` override today, so none of them need edits for this step's effect to reach them).

- [ ] **Step 4: Commit**

```bash
git add src/app/paths.ts src/app/components/roote/CtaSection.tsx
git commit -m "fix: point CtaSection's default CTA at /analysis, not the external Landbot link"
```

### Task A.2: Header + Footer (persistent chrome)

**Files:**
- Modify: `src/app/components/shell/Header.tsx`
- Modify: `src/app/components/shell/Footer.tsx`

**Interfaces:**
- Consumes: `PATHS.analysis` (`src/app/paths.ts`), `useLocalizedPath()` (`src/i18n/LocaleProvider.tsx`) — both already imported in these two files.

- [ ] **Step 1: `Header.tsx`**

Read the file first. Change the import line and the two CTA usages:

```tsx
import { PATHS } from '@/app/paths';
```

(drop `EXTERNAL_ASSESSMENT_URL` from that import — nothing else in this file used it.)

Desktop CTA (around line 94-102):

```tsx
<Button
  to={withLocale(PATHS.analysis)}
  caps
  variant={condensed ? 'primary' : 'secondary'}
  className="hidden min-w-0 sm:inline-flex text-sm"
>
  <span className="min-w-0 truncate">{t('marketing.nav.cta')}</span>
</Button>
```

Mobile drawer CTA (around line 128):

```tsx
<Button to={withLocale(PATHS.analysis)} caps block variant="secondary" className="mt-4 text-xs" onClick={() => setMenuOpen(false)}>
  {t('marketing.nav.cta')}
</Button>
```

(`withLocale` is already bound at the top of `Header()` — no new hook call needed.)

- [ ] **Step 2: `Footer.tsx`**

Read the file first. Change the import line the same way, and the one CTA usage (around line 180):

```tsx
import { PATHS } from '@/app/paths';
```

```tsx
<Button to={withLocale(PATHS.analysis)} caps variant="secondary" className="mt-6">
  {t('marketing.footer.cta')}
</Button>
```

(`withLocale` is already bound at the top of `Footer()`.)

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 4: Manual check**

Run `pnpm dev`, open the homepage, confirm the header CTA and footer CTA both navigate to `/en/analysis` (not a new tab to `roote.vercel.app`).

- [ ] **Step 5: Commit**

```bash
git add src/app/components/shell/Header.tsx src/app/components/shell/Footer.tsx
git commit -m "fix: point Header and Footer CTAs at /analysis, not the external Landbot link"
```

### Task A.3: `Home.tsx` (hero CTA + concern cards)

**Files:**
- Modify: `src/app/routes/marketing/Home.tsx`

- [ ] **Step 1: `HomeHero()` — add the hook, fix the CTA**

`HomeHero` (around line 58) doesn't currently call `useLocalizedPath()`. Add it:

```tsx
function HomeHero() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  return (
    <Hero
      title={renderWithEmphasis(pickLocalized(brandLines.headline, cl))}
      body={t('marketing.home.hero.support')}
      cta={
        <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
          {t('marketing.nav.cta')}
        </Button>
      }
      image={{
        src: heroImage,
        alt: t('marketing.home.hero.mediaAlt'),
        className: 'shadow-product',
      }}
    />
  );
}
```

- [ ] **Step 2: `Concern()` — fix the `ConcernCard` destination**

`Concern()` already binds `withLocale` (used for the "read more" button below the grid). Change the `ConcernCard` usage (around line 158):

```tsx
<ConcernCard
  key={c.value}
  title={pickLocalized(c.title, cl)}
  description={pickLocalized(c.description, cl)}
  to={withLocale(PATHS.analysis)}
  mediaAlt={media[c.value]}
  mediaLabel={`${pickLocalized(c.title, cl)}: clinical crop, no face`}
  image={images[c.value]}
/>
```

(drop the `external` prop — `ConcernCard`'s `external` prop defaults to `false`, which is what we want now.)

- [ ] **Step 3: Drop the now-unused import**

`EXTERNAL_ASSESSMENT_URL` is no longer used anywhere in this file. Change:

```tsx
import { PATHS } from '@/app/paths';
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/marketing/Home.tsx
git commit -m "fix: point Home's hero CTA and concern cards at /analysis"
```

### Task A.4: Shop pages — `Products.tsx`, `ProductDetail.tsx`, `SolutionPage.tsx`, `Magazine.tsx`

**Files:**
- Modify: `src/app/routes/marketing/Products.tsx`
- Modify: `src/app/routes/marketing/ProductDetail.tsx`
- Modify: `src/app/routes/marketing/SolutionPage.tsx`
- Modify: `src/app/routes/marketing/Magazine.tsx`

All four already bind `withLocale = useLocalizedPath()` in the component whose CTA needs fixing.

- [ ] **Step 1: `Products.tsx` — `FindYourMatchCta` and the hero CTA**

`FindYourMatchCta` (around line 68) is a module-level function with no access to `Products()`'s `withLocale`. Give it its own:

```tsx
/* Every product and bundle is assessment-gated — no self-serve add-to-bag.
   Point people at the free hair analysis instead of a buy button. */
function FindYourMatchCta() {
  const t = useT();
  const withLocale = useLocalizedPath();
  return (
    <Link to={withLocale(PATHS.analysis)} className={OUTLINE_CTA_CLASS}>
      {t('marketing.shop.findYourMatchCta')}
    </Link>
  );
}
```

(drop `target="_blank" rel="noopener noreferrer"` — this is now an in-app link.)

`Products()`'s hero CTA (around line 177):

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

Drop `EXTERNAL_ASSESSMENT_URL` from the import line: `import { PATHS } from '@/app/paths';`

- [ ] **Step 2: `ProductDetail.tsx`**

Around line 145:

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

Drop `EXTERNAL_ASSESSMENT_URL` from the import line: `import { PATHS } from '@/app/paths';`

- [ ] **Step 3: `SolutionPage.tsx`**

Around line 106:

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

Drop `EXTERNAL_ASSESSMENT_URL` from the import line: `import { PATHS } from '@/app/paths';`

- [ ] **Step 4: `Magazine.tsx`**

Around line 83:

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

Drop `EXTERNAL_ASSESSMENT_URL` from the import line: `import { PATHS } from '@/app/paths';`

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 6: Manual check**

`pnpm dev` — visit `/en/products`, click a product's "Find your match" link and the hero CTA; visit `/en/products/<any-slug>`, click its CTA; visit `/en/solutions/thinning`, click its CTA; visit `/en/magazine`, click its CTA. All four should land on `/en/analysis`.

- [ ] **Step 7: Commit**

```bash
git add src/app/routes/marketing/Products.tsx src/app/routes/marketing/ProductDetail.tsx src/app/routes/marketing/SolutionPage.tsx src/app/routes/marketing/Magazine.tsx
git commit -m "fix: point shop/solution/magazine CTAs at /analysis"
```

### Task A.5: Pages needing a new `useLocalizedPath` binding — `Terms.tsx`, `Privacy.tsx`, `About.tsx`, `Faq.tsx`, `Support.tsx`

**Files:**
- Modify: `src/app/routes/marketing/Terms.tsx`
- Modify: `src/app/routes/marketing/Privacy.tsx`
- Modify: `src/app/routes/marketing/About.tsx`
- Modify: `src/app/routes/marketing/Faq.tsx`
- Modify: `src/app/routes/marketing/Support.tsx`

None of these five currently call `useLocalizedPath()`. Each needs the import added, the hook bound, and its one hero CTA fixed.

- [ ] **Step 1: `Terms.tsx`**

Change the import line (around line 5):

```tsx
import { PATHS } from '@/app/paths';
```

In `Terms()`, add the binding next to the existing `const cl = useLocale().locale;`:

```tsx
const withLocale = useLocalizedPath();
```

(`useLocalizedPath` must also be added to the `useT, useLocale` import at the top: `import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';`)

Fix the CTA (around line 48):

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

- [ ] **Step 2: `Privacy.tsx`**

This file already imports and binds `useLocalizedPath`/`withLocale` (used for the "see Terms & Conditions" link). Just fix the import line and the hero CTA:

```tsx
import { PATHS } from '@/app/paths';
```

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

- [ ] **Step 3: `About.tsx`**

Change the import line:

```tsx
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';
```

In `About()`, add the binding right after `const t = useT();`:

```tsx
const withLocale = useLocalizedPath();
```

Fix the hero CTA (around line 60):

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

- [ ] **Step 4: `Faq.tsx`**

This file already imports/binds `useLocale`/`cl` but not `useLocalizedPath`. Change:

```tsx
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';
```

In `Faq()`, add next to `const cl = useLocale().locale;`:

```tsx
const withLocale = useLocalizedPath();
```

Fix the CTA (around line 16):

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

- [ ] **Step 5: `Support.tsx`**

Change the import line:

```tsx
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';
```

In `Support()`, add right after `const t = useT();`:

```tsx
const withLocale = useLocalizedPath();
```

Fix the CTA (around line 63):

```tsx
<Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
  {t('marketing.nav.cta')}
</Button>
```

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 7: Commit**

```bash
git add src/app/routes/marketing/Terms.tsx src/app/routes/marketing/Privacy.tsx src/app/routes/marketing/About.tsx src/app/routes/marketing/Faq.tsx src/app/routes/marketing/Support.tsx
git commit -m "fix: point legal/about/faq/support CTAs at /analysis"
```

### Task A.6: Shared components — `PagePlaceholder.tsx`, `AnalysisPrompt.tsx`

**Files:**
- Modify: `src/app/routes/shared/PagePlaceholder.tsx`
- Modify: `src/app/components/shell/AnalysisPrompt.tsx`

- [ ] **Step 1: `PagePlaceholder.tsx`**

Change the imports:

```tsx
import { Section, DisplayTitle, Prose, Eyebrow, Button } from '@/app/components/roote';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';
```

Inside `PagePlaceholder()`, add the binding right after `const t = useT();`:

```tsx
const withLocale = useLocalizedPath();
```

Fix the button (around line 35):

```tsx
<Button to={withLocale(PATHS.analysis)} caps>
  {t('marketing.nav.cta')}
</Button>
```

- [ ] **Step 2: `AnalysisPrompt.tsx`**

Change the imports:

```tsx
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Modal, Button } from '@/app/components/roote';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
```

Inside `AnalysisPrompt()`, add the binding right after `const t = useT();`:

```tsx
const withLocale = useLocalizedPath();
```

Fix the button (around line 82):

```tsx
<Button to={withLocale(PATHS.analysis)} caps block className="mt-2" onClick={dismiss}>
  {returning ? t('marketing.popup.continueCta') : t('marketing.popup.cta')}
</Button>
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 4: Manual check**

`pnpm dev` — visit any not-yet-built route (renders `PagePlaceholder`) and confirm its CTA goes to `/en/analysis`. For `AnalysisPrompt`, the popup only fires after 30s / 45% scroll / exit-intent — the fastest check is temporarily editing the 30000ms timeout to 1000ms locally to eyeball it, then reverting that local-only edit (don't commit it).

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/shared/PagePlaceholder.tsx src/app/components/shell/AnalysisPrompt.tsx
git commit -m "fix: point PagePlaceholder and the exit-intent popup at /analysis"
```

### Task A.7: `LoginPage.tsx` (raw anchor, not a `Button`)

**Files:**
- Modify: `src/app/routes/auth/LoginPage.tsx`

- [ ] **Step 1: Fix the "no account" link**

This is a plain `<a href={EXTERNAL_ASSESSMENT_URL} target="_blank" ...>`, not a `Button`. `withLocale` is already bound in this file (used for the post-login `navigate(...)`). Change the import:

```tsx
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/sessionStore';
import { funnelField, funnelHeading, funnelPrimaryBtn } from '@/app/components/funnel/funnelStyles';
import { PATHS } from '@/app/paths';
import heroImage from '@/assets/heroes/Hero.png';
```

And add `Link` from `react-router` since this becomes an in-app link:

```tsx
import { Link } from 'react-router';
```

Change the anchor (around line 71):

```tsx
<Link to={withLocale(PATHS.analysis)} className="text-accent underline">
  {t('auth.login.startCta')}
</Link>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 3: Commit**

```bash
git add src/app/routes/auth/LoginPage.tsx
git commit -m "fix: point LoginPage's 'no account' link at /analysis"
```

### Task A.8: Stale comment cleanup — `LandbotFullpageEmbed.tsx`

**Files:**
- Modify: `src/app/components/marketing/LandbotFullpageEmbed.tsx:18-22`

- [ ] **Step 1: Fix the now-inaccurate comment**

Read the file first. The comment currently says every "Start free analysis" CTA routes to `EXTERNAL_ASSESSMENT_URL` — no longer true. Update it to something like:

```ts
 * lead-gen (`VITE_LANDBOT_CONFIG_URL`); as of 2026-09-09 that page is a static explainer
 * instead (`HairScan.tsx`), which keeps its own CTA pointing at HairHealth.ai's hosted
 * quiz (`EXTERNAL_ASSESSMENT_URL`) — every OTHER "Start free hair analysis" CTA across
 * the site was reconnected to ROOTÉ's own `/analysis` flow on 2026-09-22 (see
 * docs/superpowers/specs/2026-09-22-quiz-redesign-design.md); this embed component
 * itself is unaffected either way, since it isn't mounted anywhere today.
```

(Match this to whatever the surrounding comment block's exact wording is when you read the file — the point is just correcting the factual claim, not rewriting the whole block.)

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics (comment-only change).

- [ ] **Step 3: Commit**

```bash
git add src/app/components/marketing/LandbotFullpageEmbed.tsx
git commit -m "docs: correct a stale comment about which CTAs route to the Landbot link"
```

---

# Part B — Extend the data model for v3.1 content

### Task B.1: Extend the `Answers` type

**Files:**
- Modify: `src/domain/analysis/types.ts`

**Interfaces:**
- Produces: 8 new optional fields on `Answers`, plus their literal-union value types, importable by `content/assessment.ts` (Task B.2/B.3) and the three new screens (Part C).

- [ ] **Step 1: Add the new types and extend `Answers`**

Read the file first (already read in full above — 57 lines). Add these new exported types near the existing ones (after `HealthCondition`, before `Answers`), and add 8 new **optional** fields to `Answers` (optional so `THINNING_NEUTRAL` in `QuestionsScreen.tsx` and any other existing full-`Answers` literal stays valid without changes):

```ts
export type AgeRange = '18_29' | '30_44' | '45_64' | '65_plus';
export type HairTexture = 'straight' | 'wavy' | 'curly' | 'coily';
export type StressLevel = 'mostly_peaceful' | 'moderately_stressed' | 'very_stressed';
export type VegetableIntake = 'usually_none' | 'one_two' | 'three_plus';
export type GrayHairLevel = 'none' | 'few' | 'about_half' | 'mostly_all';

export type Answers = {
  q1_area: 'hairline' | 'crown' | 'entire-scalp';
  q2_onset: OnsetBucket;
  q3_prior: 'never' | 'no-success' | 'partial';
  q4_family: 'yes' | 'no' | 'not-sure';
  q13_progression: ProgressionPattern;
  /** v3.1 §3 Step 2 — profile context only. */
  age_range?: AgeRange;
  /** v3.1 §3 Step 3 — profile context only. */
  previous_hair_products?: boolean;
  /** v3.1 §3 Step 3A — only asked when `previous_hair_products` is true. */
  satisfied_previous_products?: boolean;
  /** v3.1 §3 Step 5 — image-selected pattern code. Only asked when Hair Goal =
   *  Hair Growth; when present, `deriveAnalysis` uses it directly for `stage`
   *  instead of `q1_area` (design spec §10.1). `PatternCode` lives in
   *  `domain/recommendation/types.ts` — imported via `import type` only, to
   *  avoid a runtime dependency from `domain/analysis` on `domain/recommendation`. */
  hair_pattern_id?: import('@/domain/recommendation/types').PatternCode;
  /** v3.1 §3 Step 6 — profile context only. */
  hair_texture?: HairTexture;
  /** v3.1 §3 Step 8 — profile context only. */
  stress_level?: StressLevel;
  /** v3.1 §3 Step 9 — profile context only. */
  vegetable_intake?: VegetableIntake;
  /** v3.1 §3 Step 10 — profile context only; not the same as `HairGoal =
   *  'slow-graying'`, which is what actually drives the Anti-Gray Capsules
   *  recommendation. */
  gray_hair_level?: GrayHairLevel;
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics. (All 8 new fields are optional, so no existing `Answers`-typed object anywhere in the codebase needs updating for this step alone.)

- [ ] **Step 3: Commit**

```bash
git add src/domain/analysis/types.ts
git commit -m "feat: add v3.1 questionnaire fields to the Answers type (additive, all optional)"
```

### Task B.2: Add the new answer-option content

**Files:**
- Modify: `src/content/assessment.ts`

**Interfaces:**
- Consumes: `L6`, `LocalizedText` from `./localized` (already imported at the top of this file).
- Produces: `AGE_RANGE_OPTIONS`, `YES_NO_OPTIONS`, `TEXTURE_OPTIONS`, `STRESS_OPTIONS`, `VEGETABLE_OPTIONS`, `GRAY_LEVEL_OPTIONS` — each `Array<{ value: <literal>; label: LocalizedText }>`, consumed by Task B.3 (new `AssessmentQuestion` entries) and Part C (the two new standalone screens).

- [ ] **Step 1: Add the option arrays**

Read the file first if you haven't already in this session (646 lines; the new content goes right after `PHOTO_ANGLES`, i.e. after line ~294, before the `/* --- step 5: analysis state categories --- */` comment). Insert:

```ts
/* --- new for v3.1: age, previous-product-use, texture, stress, vegetable,
   gray level (design spec 2026-09-22, §6) --------------------------------- */
import type { AgeRange, HairTexture, StressLevel, VegetableIntake, GrayHairLevel } from '@/domain/analysis/types';

export const AGE_RANGE_OPTIONS: Array<{ value: AgeRange; label: LocalizedText }> = [
  { value: '18_29', label: L6({ en: '18–29', he: '29–18', ar: '18–29', ru: '18–29', fr: '18–29', es: '18–29' }) },
  { value: '30_44', label: L6({ en: '30–44', he: '44–30', ar: '30–44', ru: '30–44', fr: '30–44', es: '30–44' }) },
  { value: '45_64', label: L6({ en: '45–64', he: '64–45', ar: '45–64', ru: '45–64', fr: '45–64', es: '45–64' }) },
  { value: '65_plus', label: L6({ en: '65+', he: '+65', ar: '65+', ru: '65+', fr: '65+', es: '65+' }) },
];

/** Reused for both "Have you tried hair-loss products before?" and,
 *  conditionally, "Were you satisfied with the products you tried?" —
 *  both are plain Yes/No per v3.1 §3 Steps 3/3A. */
export const YES_NO_OPTIONS: Array<{ value: 'yes' | 'no'; label: LocalizedText }> = [
  { value: 'yes', label: L6({ en: 'Yes', he: 'כן', ar: 'نعم', ru: 'Да', fr: 'Oui', es: 'Sí' }) },
  { value: 'no', label: L6({ en: 'No', he: 'לא', ar: 'لا', ru: 'Нет', fr: 'Non', es: 'No' }) },
];

export const TEXTURE_OPTIONS: Array<{ value: HairTexture; label: LocalizedText }> = [
  { value: 'straight', label: L6({ en: 'Straight', he: 'ישר', ar: 'مستقيم', ru: 'Прямые', fr: 'Raides', es: 'Liso' }) },
  { value: 'wavy', label: L6({ en: 'Wavy', he: 'גלי', ar: 'مموّج', ru: 'Волнистые', fr: 'Ondulés', es: 'Ondulado' }) },
  { value: 'curly', label: L6({ en: 'Curly', he: 'מתולתל', ar: 'مجعّد', ru: 'Кудрявые', fr: 'Bouclés', es: 'Rizado' }) },
  { value: 'coily', label: L6({ en: 'Coily', he: 'קווצי', ar: 'مجعّد بشدة', ru: 'Афро-кудри', fr: 'Crépus', es: 'Afro' }) },
];

export const STRESS_OPTIONS: Array<{ value: StressLevel; label: LocalizedText }> = [
  {
    value: 'mostly_peaceful',
    label: L6({
      en: 'Mostly peaceful', he: 'רגוע ברובו', ar: 'هادئة في الغالب', ru: 'В основном спокойная',
      fr: 'Plutôt paisible', es: 'Mayormente tranquila',
    }),
  },
  {
    value: 'moderately_stressed',
    label: L6({
      en: 'Moderately stressed', he: 'לחץ בינוני', ar: 'ضغط متوسط', ru: 'Умеренный стресс',
      fr: 'Modérément stressant', es: 'Moderadamente estresante',
    }),
  },
  {
    value: 'very_stressed',
    label: L6({
      en: 'Very stressed', he: 'לחץ גבוה', ar: 'ضغط شديد', ru: 'Высокий стресс',
      fr: 'Très stressant', es: 'Muy estresante',
    }),
  },
];

export const VEGETABLE_OPTIONS: Array<{ value: VegetableIntake; label: LocalizedText }> = [
  {
    value: 'usually_none',
    label: L6({
      en: 'Usually none', he: 'בדרך כלל ללא', ar: 'عادةً لا شيء', ru: 'Обычно нет',
      fr: 'Généralement aucun', es: 'Generalmente ninguna',
    }),
  },
  {
    value: 'one_two',
    label: L6({
      en: 'One or two servings', he: 'מנה אחת או שתיים', ar: 'حصة أو حصتان', ru: 'Одна-две порции',
      fr: 'Une à deux portions', es: 'Una o dos porciones',
    }),
  },
  {
    value: 'three_plus',
    label: L6({
      en: 'Three or more servings', he: 'שלוש מנות או יותר', ar: 'ثلاث حصص أو أكثر', ru: 'Три порции и более',
      fr: 'Trois portions ou plus', es: 'Tres o más porciones',
    }),
  },
];

export const GRAY_LEVEL_OPTIONS: Array<{ value: GrayHairLevel; label: LocalizedText }> = [
  { value: 'none', label: L6({ en: 'None', he: 'ללא', ar: 'لا يوجد', ru: 'Нет', fr: 'Aucun', es: 'Ninguna' }) },
  { value: 'few', label: L6({ en: 'A few hairs', he: 'כמה שערות', ar: 'بضع شعرات', ru: 'Немного волос', fr: 'Quelques cheveux', es: 'Algunos cabellos' }) },
  { value: 'about_half', label: L6({ en: 'About half', he: 'בערך מחצית', ar: 'حوالي النصف', ru: 'Примерно половина', fr: 'Environ la moitié', es: 'Aproximadamente la mitad' }) },
  {
    value: 'mostly_all',
    label: L6({
      en: 'All or mostly gray', he: 'כולו או רובו אפור', ar: 'كله أو معظمه رمادي', ru: 'Весь или почти весь седой',
      fr: 'Entièrement ou majoritairement gris', es: 'Todo o mayormente cano',
    }),
  },
];
```

- [ ] **Step 2: Six-locale parity check**

Run: `pnpm content:check --file assessment`
Expected: `src/content/assessment.ts: entries=<N> missing-ar=0 missing-ru=0 missing-fr=0 missing-es=0 empty=0`

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 4: Commit**

```bash
git add src/content/assessment.ts
git commit -m "feat: add age/previous-products/texture/stress/vegetable/gray-level option content"
```

### Task B.3: Add the pattern-select option content + extend the question banks

**Files:**
- Modify: `src/content/assessment.ts`

**Interfaces:**
- Consumes: `PatternCode` from `@/domain/recommendation/types` (new import), `AssessmentQuestion` (defined earlier in this same file), `THINNING_QUESTIONS`/`GRAY_QUESTIONS`/`HEALTH_HISTORY_QUESTION` (existing).
- Produces: `MALE_PATTERN_OPTIONS`, `FEMALE_PATTERN_OPTIONS` (each `Array<{ value: PatternCode; label: LocalizedText; imageSrc: string }>`, consumed by the new `PatternScreen` in Part C), `COMMON_CONTEXT_QUESTIONS: AssessmentQuestion[]`, and an updated `questionsForHairGoal` signature (unchanged call sites — `QuestionsScreen.tsx` calls it exactly the same way).

- [ ] **Step 1: Copy the 9 pattern-icon assets into the repo**

The v3.1 docx's embedded images were extracted to the scratchpad this session. Copy the 9 relevant ones into `src/assets/patterns/`, renaming to the pattern codes they represent (confirmed by visual inspection against the spec's own labels: image6=M1 "very advanced/most of scalp affected", image7=M2 "large crown", image8=M3 "small crown", image9=M4 "large temple recession", image10=M5 "small temple/hairline recession" — confirmed, shows a mild widow's-peak-style recession; image11=F1 "fuller coverage/no visible central widening", image12=F2 "narrow central part/early widening", image13=F3 "more pronounced central widening", image14=F4 "advanced central/diffuse visibility" — confirmed, shows pronounced central widening).

Run:

```bash
mkdir -p "src/assets/patterns"
SCRATCH="C:\Users\jumua\AppData\Local\Temp\claude\C--Users-jumua-Documents-TLH-Team-ROOT--US\12a19436-6679-481f-aeae-e14c91f6cd2a\scratchpad\questionnaire_media\word\media"
cp "$SCRATCH/image6.png"  "src/assets/patterns/M1.png"
cp "$SCRATCH/image7.png"  "src/assets/patterns/M2.png"
cp "$SCRATCH/image8.png"  "src/assets/patterns/M3.png"
cp "$SCRATCH/image9.png"  "src/assets/patterns/M4.png"
cp "$SCRATCH/image10.png" "src/assets/patterns/M5.png"
cp "$SCRATCH/image11.png" "src/assets/patterns/F1.png"
cp "$SCRATCH/image12.png" "src/assets/patterns/F2.png"
cp "$SCRATCH/image13.png" "src/assets/patterns/F3.png"
cp "$SCRATCH/image14.png" "src/assets/patterns/F4.png"
```

Before moving on, open each of the 9 files and visually confirm it matches its label (the mapping above was verified for M1/M2/M5/F4 during planning; spot-check the remaining 5 — M3, M4, F1, F2, F3 — since a mislabeled medical-adjacent image is worse than a delayed task). If the scratchpad path above no longer exists (a new session's scratchpad is session-specific), re-extract from the source docx instead: `unzip -o "path/to/ROOTE_Questionnaire_Flow_Full_Specification_EN_v3_1_FINAL (1).docx" "word/media/image6.png" "word/media/image7.png" "word/media/image8.png" "word/media/image9.png" "word/media/image10.png" "word/media/image11.png" "word/media/image12.png" "word/media/image13.png" "word/media/image14.png" -d /tmp/qmedia` and copy from there instead.

- [ ] **Step 2: Add the pattern-select content**

In `src/content/assessment.ts`, add near the top (with the other content imports):

```ts
import type { PatternCode } from '@/domain/recommendation/types';
import m1 from '@/assets/patterns/M1.png';
import m2 from '@/assets/patterns/M2.png';
import m3 from '@/assets/patterns/M3.png';
import m4 from '@/assets/patterns/M4.png';
import m5 from '@/assets/patterns/M5.png';
import f1 from '@/assets/patterns/F1.png';
import f2 from '@/assets/patterns/F2.png';
import f3 from '@/assets/patterns/F3.png';
import f4 from '@/assets/patterns/F4.png';
```

Then, in the same new-content block as Task B.2 (after `GRAY_LEVEL_OPTIONS`):

```ts
/* --- v3.1 §3 Step 5: visual hair-loss pattern selection. Image-select,
   gender-specific set, shown only when Hair Goal = Hair Growth. The
   6%/10%/15% concentration each pattern maps to lives in
   `domain/recommendation/hairGrowthTable.ts` — this array only carries the
   label/image, never the strength, keeping the regulated number in one
   place. */
export const MALE_PATTERN_OPTIONS: Array<{ value: PatternCode; label: LocalizedText; imageSrc: string }> = [
  {
    value: 'M1',
    imageSrc: m1,
    label: L6({
      en: 'Very advanced — most of scalp affected', he: 'מתקדם מאוד — רוב הקרקפת מושפעת',
      ar: 'متقدّم جداً — معظم فروة الرأس متأثرة', ru: 'Очень выраженное — затронута большая часть кожи головы',
      fr: 'Très avancé — la majeure partie du cuir chevelu est touchée', es: 'Muy avanzado — la mayor parte del cuero cabelludo está afectada',
    }),
  },
  {
    value: 'M2',
    imageSrc: m2,
    label: L6({
      en: 'Large crown area', he: 'אזור קודקוד גדול', ar: 'منطقة تاج كبيرة', ru: 'Большая зона на макушке',
      fr: 'Grande zone du vertex', es: 'Zona amplia en la coronilla',
    }),
  },
  {
    value: 'M3',
    imageSrc: m3,
    label: L6({
      en: 'Small crown area', he: 'אזור קודקוד קטן', ar: 'منطقة تاج صغيرة', ru: 'Небольшая зона на макушке',
      fr: 'Petite zone du vertex', es: 'Zona pequeña en la coronilla',
    }),
  },
  {
    value: 'M4',
    imageSrc: m4,
    label: L6({
      en: 'Large temple recession', he: 'נסיגה גדולה ברקות', ar: 'تراجع كبير في الصُدغين', ru: 'Значительное отступление у висков',
      fr: 'Recul important au niveau des tempes', es: 'Retroceso importante en las sienes',
    }),
  },
  {
    value: 'M5',
    imageSrc: m5,
    label: L6({
      en: 'Small temple / hairline recession', he: 'נסיגה קטנה ברקות / בקו השיער', ar: 'تراجع بسيط في الصُدغين / خط الشعر',
      ru: 'Небольшое отступление у висков / линии роста волос', fr: 'Léger recul des tempes / de la ligne d’implantation',
      es: 'Retroceso leve en las sienes / línea del cabello',
    }),
  },
];

export const FEMALE_PATTERN_OPTIONS: Array<{ value: PatternCode; label: LocalizedText; imageSrc: string }> = [
  {
    value: 'F1',
    imageSrc: f1,
    label: L6({
      en: 'Fuller coverage — no visible central widening', he: 'כיסוי מלא יותר — ללא הרחבה מרכזית נראית לעין',
      ar: 'تغطية أكثر امتلاءً — دون اتساع مركزي ظاهر', ru: 'Более полное покрытие — без заметного расширения пробора',
      fr: 'Couverture plus fournie — pas d’élargissement central visible', es: 'Cobertura más completa — sin ensanchamiento central visible',
    }),
  },
  {
    value: 'F2',
    imageSrc: f2,
    label: L6({
      en: 'Narrow central part — early widening', he: 'שביל מרכזי צר — הרחבה ראשונית',
      ar: 'فرق مركزي ضيق — اتساع مبكّر', ru: 'Узкий центральный пробор — раннее расширение',
      fr: 'Raie centrale étroite — élargissement précoce', es: 'Raya central estrecha — ensanchamiento inicial',
    }),
  },
  {
    value: 'F3',
    imageSrc: f3,
    label: L6({
      en: 'More pronounced central widening', he: 'הרחבה מרכזית בולטת יותר',
      ar: 'اتساع مركزي أكثر وضوحاً', ru: 'Более выраженное расширение пробора',
      fr: 'Élargissement central plus marqué', es: 'Ensanchamiento central más pronunciado',
    }),
  },
  {
    value: 'F4',
    imageSrc: f4,
    label: L6({
      en: 'Advanced central / diffuse visibility', he: 'מתקדם במרכז / נראות מפושטת',
      ar: 'متقدّم في المنطقة المركزية / وضوح منتشر', ru: 'Выраженное центральное / диффузное поредение',
      fr: 'Avancé au centre / visibilité diffuse', es: 'Avanzado en el centro / visibilidad difusa',
    }),
  },
];
```

- [ ] **Step 3: Add the four "always asked" context questions**

Right after `HEALTH_HISTORY_QUESTION`'s definition (before `THINNING_QUESTIONS`), add:

```ts
/**
 * v3.1 §3 Steps 6/8/9/10 — "Always" per the spec, regardless of Hair Goal.
 * Spliced into both `THINNING_QUESTIONS` and `GRAY_QUESTIONS` below, right
 * before `HEALTH_HISTORY_QUESTION` (which was already shared by both).
 */
export const COMMON_CONTEXT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'hair_texture',
    prompt: L6({
      en: 'What’s your natural hair texture?', he: 'מהי מרקם השיער הטבעי שלך?',
      ar: 'ما ملمس شعرك الطبيعي؟', ru: 'Какая у вас естественная текстура волос?',
      fr: 'Quelle est la texture naturelle de vos cheveux ?', es: '¿Cuál es la textura natural de su cabello?',
    }),
    options: TEXTURE_OPTIONS,
  },
  {
    id: 'stress_level',
    prompt: L6({
      en: 'How would you describe your daily life?', he: 'כיצד היית מתאר/ת את חיי היומיום שלך?',
      ar: 'كيف تصف حياتك اليومية؟', ru: 'Как бы вы описали свою повседневную жизнь?',
      fr: 'Comment décririez-vous votre vie quotidienne ?', es: '¿Cómo describiría su vida diaria?',
    }),
    options: STRESS_OPTIONS,
  },
  {
    id: 'vegetable_intake',
    prompt: L6({
      en: 'How many green, yellow, or orange vegetables do you eat per week?',
      he: 'כמה ירקות ירוקים, צהובים או כתומים את/ה אוכל/ת בשבוע?',
      ar: 'كم عدد الخضراوات الخضراء أو الصفراء أو البرتقالية التي تتناولها أسبوعياً؟',
      ru: 'Сколько зелёных, жёлтых или оранжевых овощей вы едите в неделю?',
      fr: 'Combien de légumes verts, jaunes ou orange consommez-vous par semaine ?',
      es: '¿Cuántas verduras verdes, amarillas o naranjas come por semana?',
    }),
    options: VEGETABLE_OPTIONS,
  },
  {
    id: 'gray_hair_level',
    prompt: L6({
      en: 'How much of your hair is gray?', he: 'כמה מהשיער שלך אפור?',
      ar: 'ما مقدار الشعر الرمادي لديك؟', ru: 'Какая часть ваших волос седая?',
      fr: 'Quelle proportion de vos cheveux est grise ?', es: '¿Qué proporción de su cabello es cana?',
    }),
    options: GRAY_LEVEL_OPTIONS,
  },
];
```

Note: this list deliberately does **not** include `age_range` / `previous_hair_products` / `satisfied_previous_products` / `hair_pattern_id` — those four are asked on their own dedicated screens **before** `goal` (Part C), not inside this pagination, which only runs after `photos`.

- [ ] **Step 4: Splice `COMMON_CONTEXT_QUESTIONS` into both question banks**

In `THINNING_QUESTIONS`'s definition, replace the trailing `HEALTH_HISTORY_QUESTION,` line (currently the array's last entry) with:

```ts
  ...COMMON_CONTEXT_QUESTIONS,
  HEALTH_HISTORY_QUESTION,
];
```

Do the exact same in `GRAY_QUESTIONS`'s definition — replace its trailing `HEALTH_HISTORY_QUESTION,` line with the same two lines.

- [ ] **Step 5: Update `questionsForHairGoal` to drop `q1_area` for Hair Growth**

Per design spec §10.1: the new pattern-select screen (Part C, Task C.3) captures `hair_pattern_id` directly for Hair-Growth-goal users, replacing the need to also ask `q1_area` (which existed specifically to help derive the pattern/stage). Every other goal still asks `q1_area` exactly as today. Change:

```ts
export function questionsForHairGoal(goal: HairGoal): AssessmentQuestion[] {
  if (goal === 'slow-graying') return GRAY_QUESTIONS;
  return goal === 'hair-growth'
    ? THINNING_QUESTIONS.filter((q) => q.id !== 'q1_area')
    : THINNING_QUESTIONS;
}
```

- [ ] **Step 6: Six-locale parity check**

Run: `pnpm content:check --file assessment`
Expected: `missing-ar=0 missing-ru=0 missing-fr=0 missing-es=0 empty=0`

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics. If `q1_area` is referenced as a **required** field anywhere outside `deriveAnalysis`'s own consumption (it shouldn't be, since `Answers.q1_area` stays required in the type — only the *question that collects it* is conditionally skipped, not the field itself), this step will surface it; the fix in that case is Task C.3's `deriveAnalysis` change (next), which supplies `q1_area` implicitly via the pattern-code path.

- [ ] **Step 8: Commit**

```bash
git add src/content/assessment.ts src/assets/patterns
git commit -m "feat: add pattern-select content and splice the four new context questions into both question banks"
```

---

# Part C — New screens

All three new screens follow `Steps1to3.tsx`'s exact existing pattern: a route-level guard call (`redirectForAnalysisStep`), `RadioCard` options, `session.setAnswer(...)`, and a direct `navigate(withLocale(PATHS.analysisStep(...)))` on selection. None of them introduce a new UI pattern.

### Task C.1: Age screen

**Files:**
- Create: `src/app/routes/analysis/AgeScreen.tsx`
- Modify: `src/content/assessment.ts` (add `'age'` to `AssessmentStepId`/`ASSESSMENT_STEPS`)
- Modify: `src/app/routes/analysis/guards.ts` (add `'age'` to `ANALYSIS_STEPS`/`RAIL_STEPS`/`BACK_STEP`, extend `redirectForAnalysisStep`)
- Modify: `src/app/routes/analysis/analysisRoutes.tsx` (register the route)
- Modify: `src/app/routes/analysis/Steps1to3.tsx` (`GenderScreen` now navigates to `age`, not `goal`)

**Interfaces:**
- Consumes: `AGE_RANGE_OPTIONS` (Task B.2), `redirectForAnalysisStep`/`backPathForAnalysisStep` (this task extends both).
- Produces: `AgeScreen` component; `PATHS.analysisStep('age')` route.

This task also lays down the full new step sequence in `guards.ts` and `content/assessment.ts`'s `ASSESSMENT_STEPS`, since every later task in Part C depends on that sequence already existing — later tasks (C.2, C.3) then only add their own step to what this task establishes, not redo it.

- [ ] **Step 1: Add every new step ID up front in `content/assessment.ts`**

Change `AssessmentStepId` and `ASSESSMENT_STEPS` (near the top of the file) to the full new sequence in one edit, so C.2/C.3 don't need to touch this list again:

```ts
export type AssessmentStepId =
  | 'intro'
  | 'gender'
  | 'age'
  | 'previous-products'
  | 'satisfaction'
  | 'goal'
  | 'pattern'
  | 'photos'
  | 'scanning'
  | 'questions'
  | 'results'
  | 'report';

export type AssessmentStep = {
  id: AssessmentStepId;
  path: string; // relative to /analysis
  /** short label for the progress rail */
  label: LocalizedText;
  /** does this step count toward the visible progress rail? */
  onRail: boolean;
};

export const ASSESSMENT_STEPS: AssessmentStep[] = [
  { id: 'intro', path: '', label: L6({ en: 'Start', he: 'התחלה', ar: 'البداية', ru: 'Начало', fr: 'Début', es: 'Inicio' }), onRail: false },
  { id: 'gender', path: 'gender', label: L6({ en: 'You', he: 'את/ה', ar: 'أنت', ru: 'Вы', fr: 'Vous', es: 'Usted' }), onRail: true },
  { id: 'age', path: 'age', label: L6({ en: 'Age', he: 'גיל', ar: 'العمر', ru: 'Возраст', fr: 'Âge', es: 'Edad' }), onRail: true },
  {
    id: 'previous-products',
    path: 'previous-products',
    label: L6({ en: 'History', he: 'היסטוריה', ar: 'السجل', ru: 'История', fr: 'Antécédents', es: 'Historial' }),
    onRail: true,
  },
  {
    id: 'satisfaction',
    path: 'satisfaction',
    label: L6({ en: 'History', he: 'היסטוריה', ar: 'السجل', ru: 'История', fr: 'Antécédents', es: 'Historial' }),
    onRail: false,
  },
  { id: 'goal', path: 'goal', label: L6({ en: 'Goal', he: 'מטרה', ar: 'الهدف', ru: 'Цель', fr: 'Objectif', es: 'Objetivo' }), onRail: true },
  {
    id: 'pattern',
    path: 'pattern',
    label: L6({ en: 'Pattern', he: 'דפוס', ar: 'النمط', ru: 'Узор', fr: 'Motif', es: 'Patrón' }),
    onRail: false,
  },
  { id: 'photos', path: 'photos', label: L6({ en: 'Scan', he: 'סריקה', ar: 'المسح', ru: 'Сканирование', fr: 'Scan', es: 'Escaneo' }), onRail: true },
  { id: 'scanning', path: 'scanning', label: L6({ en: 'Analysis', he: 'ניתוח', ar: 'التحليل', ru: 'Анализ', fr: 'Analyse', es: 'Análisis' }), onRail: true },
  { id: 'questions', path: 'questions', label: L6({ en: 'Questions', he: 'שאלות', ar: 'أسئلة', ru: 'Вопросы', fr: 'Questions', es: 'Preguntas' }), onRail: true },
  { id: 'results', path: 'results', label: L6({ en: 'Result', he: 'תוצאה', ar: 'النتيجة', ru: 'Результат', fr: 'Résultat', es: 'Resultado' }), onRail: true },
  { id: 'report', path: 'report', label: L6({ en: 'Report', he: 'דוח', ar: 'التقرير', ru: 'Отчёт', fr: 'Rapport', es: 'Informe' }), onRail: false },
];
```

`onRail: false` for `satisfaction` and `pattern` mirrors how `intro`/`report` are already excluded from the progress rail — both are short, conditional, single-purpose interstitials, not worth their own rail dot. `previous-products` reuses the same "History" rail label as `satisfaction` since they're conceptually one step to a rail viewer even though `satisfaction` itself doesn't get its own dot.

- [ ] **Step 2: Rewrite `guards.ts`'s step list and redirect logic for the full new order**

Read the file first (already read above — 62 lines). Replace its contents:

```ts
import type { SessionState } from '@/store/sessionStore';
import { PATHS } from '@/app/paths';

export const ANALYSIS_STEPS = [
  'intro',
  'gender',
  'age',
  'previous-products',
  'satisfaction',
  'goal',
  'pattern',
  'photos',
  'scanning',
  'questions',
  'results',
] as const;
export type AnalysisStep = (typeof ANALYSIS_STEPS)[number];

/** Which steps show on the progress rail (intro, satisfaction, pattern don't). */
export const RAIL_STEPS: AnalysisStep[] = [
  'gender', 'age', 'previous-products', 'goal', 'photos', 'scanning', 'questions', 'results',
];

const BACK_STEP: Partial<Record<AnalysisStep, AnalysisStep | 'intro'>> = {
  gender: 'intro',
  age: 'gender',
  'previous-products': 'age',
  satisfaction: 'previous-products',
  goal: 'previous-products',
  pattern: 'goal',
  photos: 'goal',
  questions: 'photos',
};

/**
 * Back target for a step, or null when the step has no sensible Back
 * (scanning is transient/non-interactive; results→questions would just
 * bounce forward again once analysis is computed — see redirectForAnalysisStep).
 *
 * `goal`'s back target is `previous-products`, not `satisfaction` — Back
 * from `goal` should return to the last step every visitor actually saw,
 * and `satisfaction` is skipped for anyone who answered "No" to
 * `previous-products`, so it can't be a universal back target for `goal`.
 */
export function backPathForAnalysisStep(step: AnalysisStep): string | null {
  const target = BACK_STEP[step];
  if (!target) return null;
  return target === 'intro' ? PATHS.analysis : PATHS.analysisStep(target);
}

export function redirectForAnalysisStep(step: AnalysisStep, s: SessionState): string | null {
  const { gender, hairGoal, photos, answers } = s.diagnosis;
  const hasResult = s.analysis !== null || s.grayProfile !== null;

  switch (step) {
    case 'intro':
    case 'gender':
      return null;
    case 'age':
      return gender ? null : PATHS.analysisStep('gender');
    case 'previous-products':
      if (!gender) return PATHS.analysisStep('gender');
      return answers.age_range !== undefined ? null : PATHS.analysisStep('age');
    case 'satisfaction':
      if (!gender) return PATHS.analysisStep('gender');
      if (answers.age_range === undefined) return PATHS.analysisStep('age');
      if (answers.previous_hair_products === undefined) return PATHS.analysisStep('previous-products');
      // Only reachable at all when the answer was "yes" — see PreviousProductsScreen.
      return answers.previous_hair_products ? null : PATHS.analysisStep('goal');
    case 'goal':
      if (!gender) return PATHS.analysisStep('gender');
      if (answers.age_range === undefined) return PATHS.analysisStep('age');
      return answers.previous_hair_products !== undefined ? null : PATHS.analysisStep('previous-products');
    case 'pattern': {
      if (!gender) return PATHS.analysisStep('gender');
      if (!hairGoal) return PATHS.analysisStep('goal');
      // Gender must be known (male/female) for a pattern set to exist at all
      // (client rule 4 — see `domain/recommendation/rules.ts`). An
      // 'unspecified'-gender Hair Growth visitor skips straight to `photos`;
      // without this check they'd bounce here from `photos` and right back
      // to `photos` from here — an infinite redirect loop.
      const hasPatternSet = gender === 'male' || gender === 'female';
      return hairGoal === 'hair-growth' && hasPatternSet ? null : PATHS.analysisStep('photos');
    }
    case 'photos': {
      if (!gender) return PATHS.analysisStep('gender');
      if (!hairGoal) return PATHS.analysisStep('goal');
      const needsPattern =
        hairGoal === 'hair-growth' && (gender === 'male' || gender === 'female') && answers.hair_pattern_id === undefined;
      return needsPattern ? PATHS.analysisStep('pattern') : null;
    }
    case 'scanning':
    case 'questions':
      if (!gender) return PATHS.analysisStep('gender');
      if (!hairGoal) return PATHS.analysisStep('goal');
      // PO #25 (2026-09-04): all four views are required to run the full analysis.
      // A draft may hold fewer, but it cannot advance past the photo step.
      return photos.length >= 4 ? null : PATHS.analysisStep('photos');
    case 'results':
      return hasResult ? null : PATHS.analysisStep('scanning');
    default:
      return null;
  }
}
```

- [ ] **Step 3: Create `AgeScreen.tsx`**

```tsx
import { Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { AGE_RANGE_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
import type { AgeRange } from '@/domain/analysis/types';

/** v3.1 §3 Step 2 — profile context only, single-select, auto-advance. */
export function AgeScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('age', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const choose = (value: AgeRange) => {
    session.setAnswer('age_range', value);
    track('question_answered', { id: 'age_range' });
    navigate(withLocale(PATHS.analysisStep('previous-products')));
  };

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.age.title')}
      </DisplayTitle>
      <div className="grid gap-4">
        {AGE_RANGE_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="ageRange"
            value={o.value}
            checked={session.diagnosis.answers.age_range === o.value}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add the `analysis.age.title` i18n key (all 6 locales)**

`src/i18n/messages/en.ts` — add near the other `analysis.*` keys:

```ts
'analysis.age.title': 'What is your age range?',
```

`he.ts`:
```ts
'analysis.age.title': 'מה טווח הגיל שלך?',
```

`ar.ts`:
```ts
'analysis.age.title': 'ما هو نطاقك العمري؟',
```

`ru.ts`:
```ts
'analysis.age.title': 'Какой у вас возрастной диапазон?',
```

`fr.ts`:
```ts
'analysis.age.title': 'Quelle est votre tranche d’âge ?',
```

`es.ts`:
```ts
'analysis.age.title': '¿Cuál es su rango de edad?',
```

- [ ] **Step 5: Make `GenderScreen` navigate to `age` instead of `goal`**

In `src/app/routes/analysis/Steps1to3.tsx`, `GenderScreen`'s `choose` function currently does `navigate(withLocale(PATHS.analysisStep('goal')))` on a definite gender, and the packaging-fallback path (`choosePackaging`) also does the same. Change **both** to `'age'`:

```tsx
const choose = (g: Gender) => {
  session.setGender(g);
  track('gender_selected', { gender: g });
  if (g === 'unspecified') {
    setNeedPackaging(true);
    return;
  }
  navigate(withLocale(PATHS.analysisStep('age')));
};

const choosePackaging = (p: 'men' | 'women') => {
  session.setPackagingPreference(p);
  navigate(withLocale(PATHS.analysisStep('age')));
};
```

- [ ] **Step 6: Register the route**

In `src/app/routes/analysis/analysisRoutes.tsx`, add the import and the route entry right after `'gender'`:

```tsx
import { IntroScreen, GenderScreen, GoalScreen } from './Steps1to3';
import { AgeScreen } from './AgeScreen';
```

```tsx
{ path: 'gender', element: <GenderScreen /> },
{ path: 'age', element: <AgeScreen /> },
```

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 8: Six-locale parity check**

Run: `pnpm i18n:check`
Expected: `he/ar/ru/fr/es: missing=0 stray=0 empty=0 placeholder-mismatch=0`

- [ ] **Step 9: Manual check**

`pnpm dev` — start the assessment, pick a gender, confirm you land on a new "What is your age range?" screen with 4 options, confirm picking one advances (there's no "previous-products" screen yet at this point in the plan, so it will 404 or hit the placeholder route until Task C.2 lands — that's expected and fine mid-plan, not a regression to chase down now).

- [ ] **Step 10: Commit**

```bash
git add src/content/assessment.ts src/app/routes/analysis/guards.ts src/app/routes/analysis/AgeScreen.tsx src/app/routes/analysis/Steps1to3.tsx src/app/routes/analysis/analysisRoutes.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts src/i18n/messages/ar.ts src/i18n/messages/ru.ts src/i18n/messages/fr.ts src/i18n/messages/es.ts
git commit -m "feat: add the age-range screen and the full new step sequence to guards/ASSESSMENT_STEPS"
```

### Task C.2: Previous-products + satisfaction screens

**Files:**
- Create: `src/app/routes/analysis/PreviousProductsScreen.tsx`
- Create: `src/app/routes/analysis/SatisfactionScreen.tsx`
- Modify: `src/app/routes/analysis/analysisRoutes.tsx` (register both routes)

**Interfaces:**
- Consumes: `YES_NO_OPTIONS` (Task B.2), `redirectForAnalysisStep`/`ANALYSIS_STEPS`/`RAIL_STEPS`/`BACK_STEP` (already extended in Task C.1 — no further guard changes needed here).

- [ ] **Step 1: Create `PreviousProductsScreen.tsx`**

```tsx
import { Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { YES_NO_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';

/** v3.1 §3 Step 3 — "Have you tried hair-loss products before?" Yes routes to
 *  the conditional satisfaction screen; No skips straight to Goal. */
export function PreviousProductsScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('previous-products', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const choose = (value: 'yes' | 'no') => {
    session.setAnswer('previous_hair_products', value === 'yes');
    track('question_answered', { id: 'previous_hair_products' });
    navigate(withLocale(PATHS.analysisStep(value === 'yes' ? 'satisfaction' : 'goal')));
  };

  const current = session.diagnosis.answers.previous_hair_products;

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.previousProducts.title')}
      </DisplayTitle>
      <div className="grid gap-4">
        {YES_NO_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="previousProducts"
            value={o.value}
            checked={current === (o.value === 'yes')}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `SatisfactionScreen.tsx`**

```tsx
import { Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, RadioCard } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { YES_NO_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';

/** v3.1 §3 Step 3A — only reachable when Step 3 = Yes; see redirectForAnalysisStep. */
export function SatisfactionScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('satisfaction', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const choose = (value: 'yes' | 'no') => {
    session.setAnswer('satisfied_previous_products', value === 'yes');
    track('question_answered', { id: 'satisfied_previous_products' });
    navigate(withLocale(PATHS.analysisStep('goal')));
  };

  const current = session.diagnosis.answers.satisfied_previous_products;

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.satisfaction.title')}
      </DisplayTitle>
      <div className="grid gap-4">
        {YES_NO_OPTIONS.map((o) => (
          <RadioCard
            key={o.value}
            name="satisfaction"
            value={o.value}
            checked={current === (o.value === 'yes')}
            onChange={() => choose(o.value)}
            title={pickLocalized(o.label, cl)}
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add the two i18n keys (all 6 locales)**

`en.ts`:
```ts
'analysis.previousProducts.title': 'Have you tried hair-loss products before?',
'analysis.satisfaction.title': 'Were you satisfied with the products you tried?',
```

`he.ts`:
```ts
'analysis.previousProducts.title': 'האם ניסית בעבר מוצרים לנשירת שיער?',
'analysis.satisfaction.title': 'האם היית מרוצה מהמוצרים שניסית?',
```

`ar.ts`:
```ts
'analysis.previousProducts.title': 'هل جرّبت من قبل منتجات لتساقط الشعر؟',
'analysis.satisfaction.title': 'هل كنت راضياً عن المنتجات التي جرّبتها؟',
```

`ru.ts`:
```ts
'analysis.previousProducts.title': 'Пробовали ли вы раньше средства от выпадения волос?',
'analysis.satisfaction.title': 'Остались ли вы довольны средствами, которые пробовали?',
```

`fr.ts`:
```ts
'analysis.previousProducts.title': 'Avez-vous déjà essayé des produits contre la chute des cheveux ?',
'analysis.satisfaction.title': 'Avez-vous été satisfait(e) des produits essayés ?',
```

`es.ts`:
```ts
'analysis.previousProducts.title': '¿Ha probado antes productos para la caída del cabello?',
'analysis.satisfaction.title': '¿Quedó satisfecho con los productos que probó?',
```

- [ ] **Step 4: Register both routes**

In `src/app/routes/analysis/analysisRoutes.tsx`, add the imports and route entries right after `'age'`:

```tsx
import { PreviousProductsScreen } from './PreviousProductsScreen';
import { SatisfactionScreen } from './SatisfactionScreen';
```

```tsx
{ path: 'age', element: <AgeScreen /> },
{ path: 'previous-products', element: <PreviousProductsScreen /> },
{ path: 'satisfaction', element: <SatisfactionScreen /> },
```

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 6: Six-locale parity check**

Run: `pnpm i18n:check` — expect all 5 locales `missing=0 stray=0 empty=0 placeholder-mismatch=0`.

- [ ] **Step 7: Manual check**

`pnpm dev` — walk through gender → age → previous-products. Answer "No" and confirm you land on `goal` directly. Restart, answer "Yes" on previous-products, confirm you land on `satisfaction`, answer it, confirm you land on `goal`. Use the Back button at each step and confirm it returns to the step you actually came from.

- [ ] **Step 8: Commit**

```bash
git add src/app/routes/analysis/PreviousProductsScreen.tsx src/app/routes/analysis/SatisfactionScreen.tsx src/app/routes/analysis/analysisRoutes.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts src/i18n/messages/ar.ts src/i18n/messages/ru.ts src/i18n/messages/fr.ts src/i18n/messages/es.ts
git commit -m "feat: add previous-products and conditional satisfaction screens"
```

### Task C.3: Pattern-select screen + `deriveAnalysis` wiring

**Files:**
- Create: `src/app/routes/analysis/PatternScreen.tsx`
- Modify: `src/domain/recommendation/hairGrowthTable.ts` (add the inverse lookup)
- Modify: `src/domain/analysis/deriveAnalysis.ts` (use `hair_pattern_id` when present)
- Modify: `src/app/routes/analysis/Steps1to3.tsx` (`GoalScreen` branches to `pattern` or `photos`)
- Modify: `src/app/routes/analysis/analysisRoutes.tsx` (register the route)

**Interfaces:**
- Consumes: `MALE_PATTERN_OPTIONS`/`FEMALE_PATTERN_OPTIONS` (Task B.3), `PatternCode` (`domain/recommendation/types.ts`).
- Produces: `stageForPattern(gender, patternCode): number` — new export from `hairGrowthTable.ts`, consumed by `deriveAnalysis`.

- [ ] **Step 1: Add the inverse stage lookup to `hairGrowthTable.ts`**

Read the file first (already read in full above — 47 lines). Add, right after `patternCodeFor`:

```ts
const MALE_STAGE_BY_PATTERN: Record<string, number> = { M1: 2, M2: 3, M3: 4, M4: 5, M5: 6 };
const FEMALE_STAGE_BY_PATTERN: Record<string, number> = { F1: 1, F2: 2, F3: 3, F4: 4 };

/**
 * Inverse of `patternCodeFor` — used when the visitor picked their pattern
 * directly (the new v3.1 image-select screen) instead of it being derived
 * from `q1_area`/`q2_onset` (design spec 2026-09-22 §10.1). Returns `null`
 * for a mismatched gender/pattern pair (e.g. an `F`-code with `gender:
 * 'male'`), which should never happen from the UI but is guarded here
 * rather than assumed.
 */
export function stageForPattern(gender: 'male' | 'female', pattern: PatternCode): number | null {
  const table = gender === 'male' ? MALE_STAGE_BY_PATTERN : FEMALE_STAGE_BY_PATTERN;
  return table[pattern] ?? null;
}
```

- [ ] **Step 2: Wire `hair_pattern_id` into `deriveAnalysis`**

Read the file first (already read in full above — 97 lines). Change the `stage` computation to prefer `hair_pattern_id` when it's present:

```ts
import type {
  Answers, Gender, HairAnalysis, HairGoal, Level, PlanEmphasis, SeverityBand, ZoneKey,
} from './types';
import { stageForPattern } from '@/domain/recommendation/hairGrowthTable';
```

(add the import at the top, alongside the existing type-only import.)

Then, inside `deriveAnalysis`, replace the `stage` computation:

```ts
export function deriveAnalysis(input: { gender: Gender; hairGoal: HairGoal; answers: Answers }): HairAnalysis {
  const { gender, hairGoal, answers } = input;
  const scale = gender === 'female' ? 'ludwig' : 'norwood'; // male + unspecified → Norwood (PO #24)
  const severityBand = severityFromOnset(answers.q2_onset);

  // Applies to both scales — Ludwig now spans 1–4 so it can carry the F1–F4
  // pattern codes the client's Hair Growth strength table is keyed on.
  const bump = answers.q1_area === 'entire-scalp' ? 1 : 0;
  // v3.1 §10.1: when the visitor picked their pattern directly on the new
  // image-select screen (Hair Goal = Hair Growth, gender known), that pick
  // is authoritative for `stage` — it replaces the q1_area/q2_onset-derived
  // number rather than being layered on top of it. Every other goal, and
  // every Hair-Growth visitor with gender 'unspecified' (who never sees the
  // pattern screen — see `redirectForAnalysisStep`), keeps today's behavior.
  const patternStage =
    answers.hair_pattern_id && (gender === 'male' || gender === 'female')
      ? stageForPattern(gender, answers.hair_pattern_id)
      : null;
  const stage =
    patternStage ??
    (scale === 'norwood'
      ? clamp(2 + sevIndex[severityBand] + bump, 2, 6)
      : clamp(1 + sevIndex[severityBand] + bump, 1, 4));
```

(the rest of the function — `flaggedZoneKeys`, `densityByZone`, `metrics`, `notes`, `planEmphasis`, `recommendedDurationDays`, `summaryPlainKey`, the return — is unchanged.)

- [ ] **Step 3: Create `PatternScreen.tsx`**

```tsx
import { Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { DisplayTitle, Button } from '@/app/components/roote';
import { pickLocalized } from '@/content/localized';
import { MALE_PATTERN_OPTIONS, FEMALE_PATTERN_OPTIONS } from '@/content/assessment';
import { track } from '@/analytics/analytics';
import { PATHS } from '@/app/paths';
import { redirectForAnalysisStep } from './guards';
import type { PatternCode } from '@/domain/recommendation/types';
import { cn } from '@/app/components/ui/utils';

/**
 * v3.1 §3 Step 5 — only reachable when Hair Goal = Hair Growth (see
 * redirectForAnalysisStep). Unlike every other single-select question in
 * this flow, this one does NOT auto-advance — v3.1 §6 is explicit that the
 * visitor should be able to review their image choice before continuing,
 * so this renders its own explicit Continue button instead of navigating
 * inside `choose`.
 */
export function PatternScreen() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const session = useSession();

  const redirect = redirectForAnalysisStep('pattern', session);
  if (redirect) return <Navigate to={withLocale(redirect)} replace />;

  const options = session.diagnosis.gender === 'female' ? FEMALE_PATTERN_OPTIONS : MALE_PATTERN_OPTIONS;
  const current = session.diagnosis.answers.hair_pattern_id;

  const choose = (value: PatternCode) => {
    session.setAnswer('hair_pattern_id', value);
    track('question_answered', { id: 'hair_pattern_id' });
  };

  const proceed = () => {
    navigate(withLocale(PATHS.analysisStep('photos')));
  };

  return (
    <section data-animate className="flex flex-col gap-8">
      <DisplayTitle as="h1" step="md">
        {t('analysis.pattern.title')}
      </DisplayTitle>
      <div className="grid grid-cols-2 gap-4">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-sm border border-border bg-card p-4 text-center transition-colors',
              'hover:ring-1 hover:ring-deep-700 has-[:checked]:ring-1 has-[:checked]:ring-deep-800 has-[:checked]:bg-cream-100',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
            )}
          >
            <input
              type="radio"
              name="pattern"
              value={o.value}
              checked={current === o.value}
              onChange={() => choose(o.value)}
              className="peer sr-only"
            />
            <img src={o.imageSrc} alt={pickLocalized(o.label, cl)} loading="lazy" className="aspect-square w-full rounded-sm object-contain" />
            <span className="font-body text-sm text-foreground">{pickLocalized(o.label, cl)}</span>
          </label>
        ))}
      </div>
      <Button block disabled={!current} onClick={proceed}>
        {t('common.continue')}
      </Button>
    </section>
  );
}
```

Note: this deliberately doesn't reuse `RadioCard` (which is a horizontal title+description row, not an image tile) — it's a small, self-contained variant built the same way `RadioCard` itself is (a `<label>` wrapping a visually-hidden radio, styled via `has-[:checked]`), so it stays consistent with the existing component's visual language without forcing an image prop onto `RadioCard` that none of its other 7+ call sites need.

- [ ] **Step 4: Add the `analysis.pattern.title` i18n key (all 6 locales)**

`en.ts`:
```ts
'analysis.pattern.title': 'Which image looks most similar to your current hair pattern?',
```

`he.ts`:
```ts
'analysis.pattern.title': 'איזו תמונה הכי דומה לדפוס השיער הנוכחי שלך?',
```

`ar.ts`:
```ts
'analysis.pattern.title': 'أي صورة تشبه نمط شعرك الحالي أكثر؟',
```

`ru.ts`:
```ts
'analysis.pattern.title': 'Какое изображение больше всего похоже на ваш текущий узор роста волос?',
```

`fr.ts`:
```ts
'analysis.pattern.title': 'Quelle image ressemble le plus à votre motif capillaire actuel ?',
```

`es.ts`:
```ts
'analysis.pattern.title': '¿Qué imagen se parece más a su patrón capilar actual?',
```

- [ ] **Step 5: Make `GoalScreen` branch to `pattern` or `photos`**

In `src/app/routes/analysis/Steps1to3.tsx`, `GoalScreen`'s `choose` function currently always does `navigate(withLocale(PATHS.analysisStep('photos')))`. Change:

```tsx
const choose = (g: HairGoal) => {
  session.setHairGoal(g);
  track('hair_goal_selected', { hairGoal: g });
  navigate(withLocale(PATHS.analysisStep(g === 'hair-growth' ? 'pattern' : 'photos')));
};
```

- [ ] **Step 6: Register the route**

In `src/app/routes/analysis/analysisRoutes.tsx`, add the import and route entry right after `'goal'`:

```tsx
import { PatternScreen } from './PatternScreen';
```

```tsx
{ path: 'goal', element: <GoalScreen /> },
{ path: 'pattern', element: <PatternScreen /> },
```

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics.

- [ ] **Step 8: Six-locale parity check**

Run: `pnpm i18n:check` — expect all 5 locales `missing=0 stray=0 empty=0 placeholder-mismatch=0`.

- [ ] **Step 9: Defensive render guard for direct URL access**

`redirectForAnalysisStep('pattern', ...)` (fixed in Task C.1, Step 2) already keeps an `'unspecified'`-gender visitor out of this screen via normal navigation. But `PatternScreen` itself falls back to `MALE_PATTERN_OPTIONS` for any non-`'female'` gender, which would be wrong if someone hit `/analysis/pattern` directly by URL with `gender: 'unspecified'` in their session (bypassing the guard's own redirect timing). Add a second, defensive check in `PatternScreen.tsx` right after the `redirect` check:

```tsx
const redirect = redirectForAnalysisStep('pattern', session);
if (redirect) return <Navigate to={withLocale(redirect)} replace />;
if (session.diagnosis.gender !== 'male' && session.diagnosis.gender !== 'female') {
  return <Navigate to={withLocale(PATHS.analysisStep('photos'))} replace />;
}
```

- [ ] **Step 10: Manual check**

`pnpm dev` — walk the full flow choosing Gender=Male, then at Goal pick "Hair growth treatment": confirm you land on the pattern screen with 5 male pattern tiles, that the Continue button stays disabled until you pick one, and that picking one + Continue lands you on `photos`. Restart and pick any other goal (e.g. "Stop hair loss"): confirm you skip straight from `goal` to `photos`, never seeing the pattern screen. Restart once more with Gender="Prefer not to say" (packaging fallback) + Goal="Hair growth treatment": confirm you're sent straight to `photos`, never seeing the pattern screen, and that photos itself doesn't bounce you back to a pattern screen you can never satisfy.

- [ ] **Step 11: Commit**

```bash
git add src/app/routes/analysis/PatternScreen.tsx src/domain/recommendation/hairGrowthTable.ts src/domain/analysis/deriveAnalysis.ts src/app/routes/analysis/Steps1to3.tsx src/app/routes/analysis/analysisRoutes.tsx src/app/routes/analysis/guards.ts src/i18n/messages/en.ts src/i18n/messages/he.ts src/i18n/messages/ar.ts src/i18n/messages/ru.ts src/i18n/messages/fr.ts src/i18n/messages/es.ts
git commit -m "feat: add the image-based pattern-select screen, gated to known-gender Hair Growth visitors"
```

### Task C.4: Reframe the photo-capture step's copy (spec §2/§3 item 6)

**Files:**
- Modify: `src/i18n/messages/en.ts`, `he.ts`, `ar.ts`, `ru.ts`, `fr.ts`, `es.ts` (`analysis.photos.title` / `analysis.photos.body`)

No logic change — `deriveAnalysis` has never used photos for severity, and this task doesn't change that. It only corrects the copy so it stops reading as if the photos drive the analysis, matching design spec §2/§9: photos are a baseline/progress record, not an analysis input.

- [ ] **Step 1: Update `analysis.photos.title` / `.body` in all 6 locale files**

Current (`en.ts`):
```ts
'analysis.photos.title': 'Guided photos',
'analysis.photos.body': 'Four photos from your phone: front, top, crown, and hairline. Each step shows an outline and an example.',
```

New (`en.ts`):
```ts
'analysis.photos.title': 'Your baseline photos',
'analysis.photos.body': 'Four photos from your phone: front, top, crown, and hairline. These become your baseline record for tracking progress over time — your questionnaire answers, not these photos, drive today’s recommendation.',
```

`he.ts` — find the existing `analysis.photos.title`/`.body` pair and replace with:
```ts
'analysis.photos.title': 'תמונות הבסיס שלך',
'analysis.photos.body': 'ארבע תמונות מהטלפון שלך: חזית, מלמעלה, קודקוד וקו השיער. אלו הופכות לרשומת הבסיס שלך למעקב אחר התקדמות לאורך זמן — תשובות השאלון שלך, לא התמונות הללו, הן שמניעות את ההמלצה של היום.',
```

`ar.ts`:
```ts
'analysis.photos.title': 'صور خط الأساس الخاصة بك',
'analysis.photos.body': 'أربع صور من هاتفك: أمامية، علوية، تاج الرأس، وخط الشعر. تصبح هذه الصور سجلّ خط الأساس الخاص بك لتتبّع التقدّم بمرور الوقت — إجاباتك على الاستبيان، وليس هذه الصور، هي ما يحدّد توصية اليوم.',
```

`ru.ts`:
```ts
'analysis.photos.title': 'Ваши исходные фотографии',
'analysis.photos.body': 'Четыре фотографии с телефона: спереди, сверху, макушка и линия роста волос. Они становятся вашей исходной записью для отслеживания прогресса со временем — сегодняшнюю рекомендацию определяют ваши ответы на вопросы, а не эти фотографии.',
```

`fr.ts`:
```ts
'analysis.photos.title': 'Vos photos de référence',
'analysis.photos.body': 'Quatre photos prises avec votre téléphone : face, dessus, vertex et ligne d’implantation. Elles deviennent votre enregistrement de référence pour suivre l’évolution dans le temps — ce sont vos réponses au questionnaire, et non ces photos, qui déterminent la recommandation d’aujourd’hui.',
```

`es.ts`:
```ts
'analysis.photos.title': 'Sus fotos de referencia',
'analysis.photos.body': 'Cuatro fotos desde su teléfono: frente, parte superior, coronilla y línea del cabello. Estas se convierten en su registro de referencia para hacer seguimiento del progreso con el tiempo — sus respuestas al cuestionario, no estas fotos, son las que determinan la recomendación de hoy.',
```

- [ ] **Step 2: Six-locale parity check**

Run: `pnpm i18n:check` — expect all 5 locales `missing=0 stray=0 empty=0 placeholder-mismatch=0`.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck` — expect 0 diagnostics (copy-only change).

- [ ] **Step 4: Manual check**

`pnpm dev` — reach the photos step and confirm the new title/body render correctly in at least English and Hebrew (RTL).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/messages/en.ts src/i18n/messages/he.ts src/i18n/messages/ar.ts src/i18n/messages/ru.ts src/i18n/messages/fr.ts src/i18n/messages/es.ts
git commit -m "fix: reframe the photo-capture step's copy as a baseline/progress record, not an analysis input"
```

---

# Part D — Final verification pass

### Task D.1: Full-flow regression check + card-shape confirmation

**Files:** none modified — verification only.

- [ ] **Step 1: Confirm `RadioCard` already satisfies the spec's card-shape requirement**

Design spec §8 flagged a possible card-shape fix (v3.1's own reference screenshots show pill-shaped buttons, which the spec says to avoid). Direct inspection of `src/app/components/roote/Choice.tsx` during planning found `RadioCard` already uses `rounded-sm` (a small radius), not `rounded-full` — it already matches v3.1 §6's instruction ("cards should visually read as rectangles... a small radius is acceptable") without any change. No task needed; this step is just recording that the check was done, so it isn't silently skipped.

- [ ] **Step 2: Full walkthrough — Hair Growth path**

`pnpm dev`. Start `/en/analysis`, choose a gender (Male), age, previous-products (either), satisfaction if shown, Goal = "Hair growth treatment", a pattern tile, all 4 photos, wait through the scanning interstitial, answer every question in the `questions` pagination (should now include, after any existing goal-specific questions minus the area question, in order: texture, stress, vegetable, gray level, health history), and confirm you land on a results screen without error.

- [ ] **Step 3: Full walkthrough — non-Hair-Growth path**

Restart. Choose any gender, age, previous-products, Goal = "Stop hair loss" (skips the pattern screen entirely), all 4 photos, scanning, then confirm the `questions` pagination includes `q1_area` this time (since it's not Hair Growth) plus texture/stress/vegetable/gray-level/health-history, and reach results.

- [ ] **Step 4: Full walkthrough — Slow Hair Graying path**

Restart. Choose any gender, age, previous-products, Goal = "Slow hair graying" (skips the pattern screen — it's Hair-Growth-only), all 4 photos, scanning, then confirm the `questions` pagination shows the gray branch (`g1_onset`...`g4_color`) plus the new texture/stress/vegetable/gray-level questions plus health-history, and reach results.

- [ ] **Step 5: `pnpm build`**

Run: `pnpm build`
Expected: succeeds (the "main chunk over 500kB" warning is expected per `CLAUDE.md`, not a regression).

- [ ] **Step 6: Final full-repo typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 7: Final content/i18n parity check**

Run: `pnpm content:check && pnpm i18n:check`
Expected: both clean across all six locales.

No commit for this task — it's verification-only. If any step surfaces a bug, fix it as a small follow-up commit referencing which walkthrough step caught it, then re-run the affected steps.
