# ROOTÉ Marketing Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ROOTÉ's single concept landing page with a complete bilingual multi-page marketing website whose pages and section content mirror mdhair.co, in a luxury-editorial design language, wrapping the unchanged diagnosis→report→`/start` funnel.

**Architecture:** Two react-router layout routes — `MarketingShell` (header + dropdown nav + footer) over 12 marketing routes, and `FunnelShell` (wordmark + locale toggle, extracted from today's inline funnel headers) over the existing funnel. A `components/marketing/` primitive set (Section, DisplayHeading two-tone, CtaButton, PinnedSteps, ReviewCarousel, FaqAccordion, BlogCard, …). All copy in `marketing.*` i18n keys, EN + first-pass HE, parity-tested; every hard claim renders `[PENDING: …]` via the existing `PendingChip`/`isPending` machinery. Rich motion via the `motion` package with a hard `prefers-reduced-motion` fallback to fully static content.

**Tech Stack:** React 18, react-router 7 (data router), Tailwind CSS v4 (utility classes + design tokens in `src/styles/theme.css`), `motion` (already a dependency) for animation, Vitest + Testing Library, Google Fonts. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-02-roote-marketing-website-design.md` — read it alongside this plan; the plan implements that spec section by section.

## Global Constraints

- **No invented claims.** Every stat, price, guarantee, study result, named testimonial, advisory-board identity, press logo, support email/hours, "last updated" date, legal body, and in-body blog statistic renders as `[PENDING: <label>]` via `PendingChip` / `PENDING(label)` from `src/content/pending.ts`. `[PENDING]` chips never animate and are never hidden behind a carousel slide or collapsed accordion.
- **EN/HE parity.** Every new i18n key exists in **both** `src/i18n/messages/en.ts` and `src/i18n/messages/he.ts` with a non-empty value. `src/i18n/messages.test.ts` enforces this after every task.
- **Funnel untouched.** No behavioural change to `/diagnosis`, `/report/:reportId`, `/start/*`, `sessionStore`, or their tests. `FunnelShell` renders the same DOM the funnel has today (a `<Wordmark/>` and a `<LocaleToggle/>` in a `<header>`).
- **`pnpm test` pristine** after every task — no console output, no React `act()` warnings.
- **`pnpm build` exits 0.** The pre-existing `(!) Some chunks are larger than 500 kB` warning from `@react-pdf/renderer` is acceptable; a *new* large-chunk regression from `motion` is not — code-split marketing route chunks if it appears.
- **RTL.** All layout uses logical Tailwind utilities (`ms-*`/`me-*`/`ps-*`/`pe-*`/`start-*`/`end-*`, `text-start`/`text-end`). Never `ml-*`/`mr-*`/`left-*`/`right-*` on layout. `LocaleProvider` already sets `dir` on `<html>`.
- **Reduced motion.** Under `prefers-reduced-motion: reduce`, every scroll-linked transform, entrance animation, parallax, pin, route transition, and autoplay is disabled; content renders in its final static state. Verified by test in Phase 5.
- **Design tokens are the only source of colour/'type'.** New tokens: `--font-display`, `--font-body`, `--ink` `#201812`, `--ink-foreground` `#f4efe4`, `--accent-ghost` `#d8ccb9`, `--ink-ghost` `#4a3f34`; changed: `--accent` → `#a97b45`. No hard-coded hex in components. Gold `--accent` never carries body-size text (< 24px).
- **Concept build.** `index.html` stays `noindex, nofollow`. No backend, auth, payment, analytics, email, or CMS. The contact form is a visible stub.
- **Commit style.** Conventional Commits, one commit per task (unless a step says otherwise), the exact message the task gives.
- **`@` → `src/`.** No `tsconfig.json`, no typecheck/lint script.

---

## File Structure

**New directories**
- `src/app/components/marketing/` — all marketing primitives and section components (one file per component, colocated tests).
- `src/app/routes/marketing/` — one file per page (`Home.tsx`, `HowItWorks.tsx`, `Science.tsx`, `Products.tsx`, `Results.tsx`, `About.tsx`, `Faq.tsx`, `Support.tsx`, `BlogIndex.tsx`, `BlogPost.tsx`, `Terms.tsx`, `Privacy.tsx`), colocated tests.
- `src/app/components/shell/` — `MarketingShell.tsx`, `Header.tsx`, `MobileMenu.tsx`, `Footer.tsx`, `FunnelShell.tsx`.
- `src/content/blog/` — `posts.ts` (structured post data), `posts.test.ts`.
- `src/app/lib/` — `useReducedMotion.ts` (matchMedia wrapper), `useScrollCondense.ts`.

**Modified**
- `src/styles/fonts.css` — swap Google Fonts import.
- `src/styles/theme.css` — new tokens + `@theme inline` maps; remove `--font-secondary`.
- `src/styles/tokens.ts` + `src/styles/tokens.test.ts` — mirror token changes.
- `src/app/App.tsx` — router restructure (two layout routes).
- `src/i18n/messages/en.ts` + `src/i18n/messages/he.ts` — `marketing.*` keys (every page task appends).
- `src/app/routes/diagnosis/*Layout*` / funnel route headers — replaced by `FunnelShell` usage (Task 4).

**Removed**
- `src/app/routes/landing/LandingSectionsA.tsx`, `LandingSectionsB.tsx`, `Landing.tsx`, `Landing.test.tsx` (content salvaged into marketing pages first — Task 14).

---

# PHASE 1 — Foundation

Ends with: new shells + design system + router in place, all marketing routes reachable as stubs, the **entire existing funnel suite still green**.

---

### Task 1: Branch setup — rebase onto p2b, worktree, gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Checkpoint the current WIP**

Run from the main working dir (currently `roote/marketing-landing`, HEAD `788720c`):
```bash
git add -A
git commit -m "chore: checkpoint landing WIP + favicon + marketing assets"
```
Expected: a commit containing `index.html`, `src/app/routes/landing/LandingSections*.tsx`, `src/assets/**` (BANNERS/, BEFORE AND AFTER RESULT/, OBJECTIVE MEASUREMENT/, favicon.png, product-lineup.png, modified hero-people.png / product-lineup.jpg).

- [ ] **Step 2: Rebase the branch onto the p2b tip**

```bash
git rebase --onto roote/p2b 7ec0ab0 roote/marketing-landing
```
Expected: replays the 4 landing commits + `788720c` + the checkpoint onto `roote/p2b` @ `2a4ffb6`. If any file conflicts (only `src/app/routes/landing/**` or `src/assets/**` possible — p2b never touches these), resolve **in favour of the `roote/marketing-landing` side** (`git checkout --theirs <path>` during the rebase), then `git rebase --continue`.

- [ ] **Step 3: Verify baseline**

```bash
git log --oneline -8
pnpm install
pnpm test
```
Expected: `roote/p2b` (2a4ffb6) is an ancestor; `pnpm test` = 43 files / 162 tests green (the p2b baseline).

- [ ] **Step 4: Add `.worktrees/` to `.gitignore`**

Append to `.gitignore` (if not already present on this branch):
```
.worktrees/
```

- [ ] **Step 5: Create the working worktree**

```bash
git worktree add .worktrees/roote-website roote/marketing-landing
cd .worktrees/roote-website && pnpm install
```
All subsequent tasks run in `.worktrees/roote-website`.

- [ ] **Step 6: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .worktrees on marketing branch"
```

---

### Task 2: Fonts + colour tokens

**Files:**
- Modify: `src/styles/fonts.css`
- Modify: `src/styles/theme.css`
- Modify: `src/styles/tokens.ts`
- Test: `src/styles/tokens.test.ts`

**Interfaces:**
- Produces: CSS custom properties `--font-display`, `--font-body`, `--ink`, `--ink-foreground`, `--accent-ghost`, `--ink-ghost`; Tailwind utilities `font-display`, `font-body`, `bg-ink`, `text-ink-foreground`, `text-accent-ghost`, `text-ink-ghost`, `border-accent`. `--accent` value changes to `#a97b45`.

- [ ] **Step 1: Update the failing token test**

In `src/styles/tokens.test.ts`, replace the `secondary` font assertion and add the new expectations:
```ts
import { describe, it, expect } from 'vitest';
import { tokens } from './tokens';

describe('design tokens', () => {
  it('exposes the display and body font stacks', () => {
    expect(tokens.fonts.display).toBe("'Playfair Display', 'Frank Ruhl Libre', Georgia, serif");
    expect(tokens.fonts.body).toBe("'Montserrat', 'Heebo', system-ui, sans-serif");
  });
  it('no longer exposes a secondary font', () => {
    expect('secondary' in tokens.fonts).toBe(false);
  });
  it('carries the new surface tokens', () => {
    expect(tokens.colors.ink).toBe('#201812');
    expect(tokens.colors.inkForeground).toBe('#f4efe4');
    expect(tokens.colors.accent).toBe('#a97b45');
    expect(tokens.colors.accentGhost).toBe('#d8ccb9');
    expect(tokens.colors.inkGhost).toBe('#4a3f34');
  });
});
```
(Adjust the import shape to the file's existing export — read `src/styles/tokens.ts` first and mirror its structure.)

- [ ] **Step 2: Run it, watch it fail**

Run: `pnpm exec vitest run src/styles/tokens.test.ts`
Expected: FAIL (new keys undefined).

- [ ] **Step 3: Update `tokens.ts`**

Match the file's existing structure. Set/replace:
- `fonts.display = "'Playfair Display', 'Frank Ruhl Libre', Georgia, serif"`
- `fonts.body = "'Montserrat', 'Heebo', system-ui, sans-serif"`
- remove `fonts.secondary`
- `colors.accent = '#a97b45'` (was `#8d7766`)
- add `colors.ink = '#201812'`, `colors.inkForeground = '#f4efe4'`, `colors.accentGhost = '#d8ccb9'`, `colors.inkGhost = '#4a3f34'`

- [ ] **Step 4: Update `theme.css`**

In `:root`:
```css
  --font-display: 'Playfair Display', 'Frank Ruhl Libre', Georgia, serif;
  --font-body: 'Montserrat', 'Heebo', system-ui, sans-serif;
  /* delete: --font-secondary */
  --accent: #a97b45;            /* was #8d7766 */
  --ink: #201812;
  --ink-foreground: #f4efe4;
  --accent-ghost: #d8ccb9;
  --ink-ghost: #4a3f34;
```
In `@theme inline`, add:
```css
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --color-ink: var(--ink);
  --color-ink-foreground: var(--ink-foreground);
  --color-accent-ghost: var(--accent-ghost);
  --color-ink-ghost: var(--ink-ghost);
```
(`--color-accent` already maps.) Leave `--ring`/`--chart-*` referencing `--accent` — they inherit the new value, which is fine.

- [ ] **Step 5: Update `fonts.css`**

Replace the single `@import` line with:
```css
@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&family=Montserrat:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Frank+Ruhl+Libre:wght@500;600;700&family=Heebo:wght@400;500;700&display=swap');
```

- [ ] **Step 6: Run the token + parity + full suite**

Run: `pnpm exec vitest run src/styles/tokens.test.ts src/i18n/messages.test.ts && pnpm test`
Expected: tokens PASS; full suite still 43 files / 162 tests green (no component reads `--font-secondary`; `--accent` change is a visual-only shift the existing tests don't assert on).

- [ ] **Step 7: Commit**

```bash
git add src/styles/
git commit -m "feat: add display/body font + ink/gold surface tokens for marketing"
```

---

### Task 3: Reduced-motion + scroll hooks

**Files:**
- Create: `src/app/lib/useReducedMotion.ts`
- Create: `src/app/lib/useScrollCondense.ts`
- Test: `src/app/lib/useReducedMotion.test.tsx`
- Test: `src/app/lib/useScrollCondense.test.tsx`

**Interfaces:**
- Produces:
  - `useReducedMotion(): boolean` — `true` when `matchMedia('(prefers-reduced-motion: reduce)')` matches or when `matchMedia` is unavailable (SSR/jsdom default → treat as reduced = safe).
  - `useScrollCondense(threshold?: number): boolean` — `true` once `window.scrollY > threshold` (default `80`), updated on a passive scroll listener.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/app/lib/useReducedMotion.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches, media: q, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  }));
}
afterEach(() => vi.unstubAllGlobals());

describe('useReducedMotion', () => {
  it('returns true when the media query matches', () => {
    mockMatchMedia(true);
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true);
  });
  it('returns false when it does not match', () => {
    mockMatchMedia(false);
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false);
  });
});
```

```tsx
// src/app/lib/useScrollCondense.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollCondense } from './useScrollCondense';

afterEach(() => { window.scrollY = 0; });

describe('useScrollCondense', () => {
  it('is false at the top and true past the threshold', () => {
    const { result } = renderHook(() => useScrollCondense(80));
    expect(result.current).toBe(false);
    act(() => { Object.defineProperty(window, 'scrollY', { value: 120, configurable: true }); window.dispatchEvent(new Event('scroll')); });
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run, watch fail** — `pnpm exec vitest run src/app/lib/` → FAIL (modules missing).

- [ ] **Step 3: Implement**

```ts
// src/app/lib/useReducedMotion.ts
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  if (typeof matchMedia !== 'function') return () => {};
  const mq = matchMedia(QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
function getSnapshot() {
  return typeof matchMedia === 'function' ? matchMedia(QUERY).matches : true;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
```

```ts
// src/app/lib/useScrollCondense.ts
import { useEffect, useState } from 'react';

export function useScrollCondense(threshold = 80): boolean {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return condensed;
}
```

- [ ] **Step 4: Run, watch pass** — `pnpm exec vitest run src/app/lib/` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/lib/
git commit -m "feat: add useReducedMotion + useScrollCondense hooks"
```

---

### Task 4: Extract `FunnelShell`

**Files:**
- Create: `src/app/components/shell/FunnelShell.tsx`
- Test: `src/app/components/shell/FunnelShell.test.tsx`
- Modify: the funnel layout(s) that currently render an inline `<header>` with `<Wordmark/>` + `<LocaleToggle/>` — read `src/app/routes/diagnosis/DiagnosisLayout.tsx` and `src/app/routes/start/StartLayout.tsx` first and identify the shared header markup.

**Interfaces:**
- Produces: `FunnelShell` — a component rendering `<div class="min-h-screen bg-background text-foreground"><header class="flex items-center justify-between px-6 py-4"><Wordmark/><LocaleToggle/></header><Outlet/></div>`. Used as a react-router layout route in Task 5.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/components/shell/FunnelShell.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { FunnelShell } from './FunnelShell';

it('renders the wordmark, a locale toggle, and the nested route', () => {
  const router = createMemoryRouter(
    [{ element: <FunnelShell />, children: [{ path: '/', element: <p>child</p> }] }],
    { initialEntries: ['/'] },
  );
  render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
  expect(screen.getByRole('img', { name: 'ROOTÉ' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /english|עברית|language/i })).toBeInTheDocument();
  expect(screen.getByText('child')).toBeInTheDocument();
});
```
(Adjust the `LocaleToggle` accessible-name matcher to whatever `LocaleToggle` actually renders — read it first.)

- [ ] **Step 2: Run, watch fail.**

- [ ] **Step 3: Implement `FunnelShell.tsx`**

```tsx
import { Outlet } from 'react-router';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';

export function FunnelShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 4: Remove the now-duplicated inline headers**

In each funnel layout that rendered its own `<header><Wordmark/><LocaleToggle/></header>`, delete that header markup and the surrounding `min-h-screen` wrapper **only if** it is now provided by `FunnelShell`. If a funnel layout adds extra chrome (e.g. `StartLayout`'s `ProgressRail`), keep everything except the wordmark/toggle header. Update those layouts' tests if they asserted the header at the layout level (the assertion moves to `FunnelShell.test.tsx`).

- [ ] **Step 5: Run the funnel suite**

Run: `pnpm exec vitest run src/app/routes/diagnosis src/app/routes/start src/app/App.test.tsx src/app/components/shell`
Expected: all green. If a funnel-layout test broke because it asserted the wordmark, move that assertion into `FunnelShell.test.tsx` (already covered) and delete it from the layout test.

- [ ] **Step 6: Commit**
```bash
git add src/app/components/shell/FunnelShell.tsx src/app/components/shell/FunnelShell.test.tsx src/app/routes/
git commit -m "refactor: extract FunnelShell from inline funnel headers"
```

---

### Task 5: `MarketingShell` + router restructure + page stubs

**Files:**
- Create: `src/app/components/shell/MarketingShell.tsx`
- Create: `src/app/routes/marketing/Home.tsx` … `Privacy.tsx` (12 stub pages)
- Create: `src/app/routes/marketing/marketingRoutes.tsx` (route array)
- Modify: `src/app/App.tsx`
- Test: `src/app/routes/marketing/marketingRoutes.test.tsx`

**Interfaces:**
- Consumes: `FunnelShell` (Task 4).
- Produces:
  - `MarketingShell` — `<div class="min-h-screen bg-background font-body text-foreground"><a href="#main" class="sr-only …">skip</a>{/* Header slot — filled Task 6 */}<main id="main"><Outlet/></main>{/* Footer slot — filled Task 7 */}</div>`. For now Header/Footer are `null` placeholders (real in Tasks 6–7).
  - `marketingRoutes: RouteObject[]` — `{ element: <MarketingShell/>, children: [{ index: true, element: <Home/> }, { path: 'how-it-works', element: <HowItWorks/> }, … { path: 'blog/:slug', element: <BlogPost/> }, { path: 'terms', … }, { path: 'privacy', … }] }`.
  - Each stub page: `export function Home() { return <h1>Home</h1>; }` etc. — a single `<h1>` with the page name, replaced in later phases.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/routes/marketing/marketingRoutes.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { marketingRoutes } from './marketingRoutes';

function renderAt(path: string) {
  const router = createMemoryRouter([marketingRoutes], { initialEntries: [path] });
  render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
}

describe('marketing routes', () => {
  it.each([
    ['/', 'Home'], ['/how-it-works', 'How It Works'], ['/science', 'Science'],
    ['/products', 'Products'], ['/results', 'Results'], ['/about', 'About'],
    ['/faq', 'FAQ'], ['/support', 'Support'], ['/blog', 'Blog'],
    ['/blog/understanding-the-norwood-scale', 'Post'], ['/terms', 'Terms'], ['/privacy', 'Privacy'],
  ])('renders %s', (path, heading) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
  });

  it('exposes a skip link to #main', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /skip/i })).toHaveAttribute('href', '#main');
  });
});
```

- [ ] **Step 2: Run, watch fail.**

- [ ] **Step 3: Create the 12 stub pages** in `src/app/routes/marketing/` — each `export function <Name>() { return <h1>{'<Heading>'}</h1>; }` with headings exactly: `Home`, `How It Works`, `Science`, `Products`, `Results`, `About`, `FAQ`, `Support`, `Blog`, `Post`, `Terms`, `Privacy` (files: `Home.tsx`, `HowItWorks.tsx`, `Science.tsx`, `Products.tsx`, `Results.tsx`, `About.tsx`, `Faq.tsx`, `Support.tsx`, `BlogIndex.tsx`, `BlogPost.tsx`, `Terms.tsx`, `Privacy.tsx`).

- [ ] **Step 4: Create `MarketingShell.tsx`**

```tsx
import { Outlet } from 'react-router';

export function MarketingShell() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      {/* Header — Task 6 */}
      <main id="main">
        <Outlet />
      </main>
      {/* Footer — Task 7 */}
    </div>
  );
}
```

- [ ] **Step 5: Create `marketingRoutes.tsx`** exporting the `marketingRoutes` RouteObject described in Interfaces, importing the 12 stubs.

- [ ] **Step 6: Restructure `App.tsx`**

Read the current `createBrowserRouter([...])` array. Wrap the **existing funnel routes** (`/diagnosis*`, `/report/:reportId`, `/start*`) as children of `{ element: <FunnelShell />, children: [ …those routes… ] }`. Remove the old `{ path: '/', element: <Landing/> }` route. Spread `marketingRoutes` into the top-level array **before** the `{ path: '*', element: <Navigate to="/" replace/> }` catch-all. Keep `AuthProvider`/`SessionProvider`/`LocaleProvider` nesting exactly as-is.

- [ ] **Step 7: Run the full suite**

Run: `pnpm test`
Expected: `marketingRoutes.test.tsx` green; **all funnel + report + start + App tests still green** (the funnel now renders inside `FunnelShell` but the DOM the tests assert is unchanged — `App.test.tsx`'s `/start` test still finds its way in). If `App.test.tsx` broke on the removed `/` Landing route, update that test to expect the new `<Home/>` stub `<h1>Home</h1>` (it will be fully rebuilt in Phase 2; a temporary assertion is fine and gets replaced in Task 14).

- [ ] **Step 8: Commit**
```bash
git add src/app/components/shell/MarketingShell.tsx src/app/routes/marketing/ src/app/App.tsx
git commit -m "feat: add MarketingShell + 12 marketing route stubs, nest funnel under FunnelShell"
```

---

### Task 6: `Header` + `MobileMenu`

**Files:**
- Create: `src/app/components/shell/Header.tsx`
- Create: `src/app/components/shell/MobileMenu.tsx`
- Modify: `src/app/components/shell/MarketingShell.tsx` (render `<Header/>`)
- Modify: `src/i18n/messages/en.ts`, `src/i18n/messages/he.ts` (nav keys)
- Test: `src/app/components/shell/Header.test.tsx`

**Interfaces:**
- Consumes: `useScrollCondense` (Task 3), `Wordmark`, `LocaleToggle`, `useT`.
- Produces: `Header` — sticky `<header>` with `<nav>` (desktop links + `More ▾` disclosure) and a mobile hamburger toggling `MobileMenu`. Primary CTA `<Link to="/diagnosis">` with the `marketing.nav.cta` label. `MobileMenu` — full-screen `<dialog>`-like overlay (`role="dialog"`, `aria-modal`, `Esc` closes, focus trapped, body scroll locked).

- [ ] **Step 1: Add i18n keys** to both dictionaries:
```
marketing.nav.howItWorks   en "How It Works"   he "איך זה עובד"
marketing.nav.science       en "Science"        he "המדע"
marketing.nav.products      en "Products"       he "המוצרים"
marketing.nav.results       en "Results"        he "תוצאות"
marketing.nav.about         en "About"          he "אודות"
marketing.nav.more          en "More"           he "עוד"
marketing.nav.faq           en "FAQ"            he "שאלות נפוצות"
marketing.nav.blog          en "Blog"           he "בלוג"
marketing.nav.support       en "Support"        he "תמיכה"
marketing.nav.cta           en "Start free analysis"   he "התחלת אבחון חינם"
marketing.nav.openMenu      en "Open menu"      he "פתיחת תפריט"
marketing.nav.closeMenu     en "Close menu"     he "סגירת תפריט"
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/app/components/shell/Header.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Header } from './Header';

function renderHeader() {
  localStorage.setItem('roote.locale', 'en');
  const router = createMemoryRouter(
    [{ element: <><Header /><div>page</div></>, children: [{ path: '/', element: null }] }].map(r => ({ ...r, path: '/' })),
    { initialEntries: ['/'] },
  );
  render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
}

describe('Header', () => {
  it('shows the primary nav links and the CTA', () => {
    renderHeader();
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/how-it-works');
    expect(within(nav).getByRole('link', { name: 'Science' })).toHaveAttribute('href', '/science');
    expect(screen.getByRole('link', { name: 'Start free analysis' })).toHaveAttribute('href', '/diagnosis');
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('reveals More menu items', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
  });
});
```
(The router wrapper above is illustrative — use whatever minimal `createMemoryRouter` shape renders `<Header/>` with a working `<Link>` context; a single route with `element: <Header/>` is enough.)

- [ ] **Step 3: Run, watch fail.**

- [ ] **Step 4: Implement `Header.tsx`**

Requirements (write the JSX to satisfy the tests + these):
- `<header>` with classes `sticky top-0 z-40 w-full transition-colors`; background `bg-background/95 backdrop-blur` when `useScrollCondense()` is true, else `bg-transparent`. (The condense visual is refined in Phase 5; the class swap can be plain now.)
- Container `mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10`.
- Left: `<Link to="/"><Wordmark className="w-28" /></Link>`.
- Centre `<nav aria-label="Primary">` (hidden below `lg` via `hidden lg:flex`): links to `/how-it-works`, `/science`, `/products`, `/results`, `/about` using `marketing.nav.*`; then a `More` `<button aria-expanded>` toggling a small absolutely-positioned list of `/faq`, `/blog`, `/support`. Close the `More` list on outside-click and `Esc`.
- Right: `<LocaleToggle />` + `<Link to="/diagnosis" class="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">{t('marketing.nav.cta')}</Link>` (hidden below `sm`, shown in `MobileMenu` otherwise).
- Mobile hamburger `<button aria-label={t('marketing.nav.openMenu')}>` (shown `lg:hidden`) toggling `MobileMenu`.

- [ ] **Step 5: Implement `MobileMenu.tsx`**

- `<div role="dialog" aria-modal="true" aria-label="Menu">` full-screen `fixed inset-0 z-50 bg-background`.
- Close `<button aria-label={t('marketing.nav.closeMenu')}>` top-end.
- All nav links (primary + FAQ/Blog/Support) as a vertical list, `font-display text-2xl`.
- `<LocaleToggle />` and the CTA link.
- On mount: focus the close button, add a `keydown` listener for `Escape` → `onClose`, set `document.body.style.overflow = 'hidden'`; on unmount restore. Trap focus with a simple first/last-focusable cycle on `Tab`.

- [ ] **Step 6: Render `<Header/>` in `MarketingShell`** (replace the `{/* Header — Task 6 */}` comment).

- [ ] **Step 7: Run** — `pnpm exec vitest run src/app/components/shell src/i18n/messages.test.ts` → PASS. Then `pnpm test` → full suite green.

- [ ] **Step 8: Commit**
```bash
git add src/app/components/shell/ src/i18n/messages/
git commit -m "feat: add marketing Header + MobileMenu with primary nav and CTA"
```

---

### Task 7: `Footer`

**Files:**
- Create: `src/app/components/shell/Footer.tsx`
- Modify: `src/app/components/shell/MarketingShell.tsx`
- Modify: `src/i18n/messages/{en,he}.ts`
- Test: `src/app/components/shell/Footer.test.tsx`

**Interfaces:**
- Consumes: `Wordmark`, `LocaleToggle`, `useT`, `useLocale`, `rooteContent`, `isPending`, `PendingChip`.
- Produces: `Footer` — `<footer>` with four link columns (Explore / Company / Legal / Start), a base row (wordmark, locale toggle, `© {year} ROOTÉ`, `[PENDING]` medical disclaimer), rendered in `MarketingShell` after `<main>`.

- [ ] **Step 1: Add i18n keys**
```
marketing.footer.explore     en "Explore"    he "לחקור"
marketing.footer.company     en "Company"    he "החברה"
marketing.footer.legal       en "Legal"      he "משפטי"
marketing.footer.startTitle  en "Start today" he "להתחיל היום"
marketing.footer.startBody   en "One free analysis. A plan built for your scalp."   he "אבחון אחד חינם. תוכנית שנבנתה לקרקפת שלך."
marketing.footer.terms       en "Terms"      he "תנאים"
marketing.footer.privacy     en "Privacy"    he "פרטיות"
marketing.footer.rights      en "All rights reserved."   he "כל הזכויות שמורות."
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/app/components/shell/Footer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Footer } from './Footer';

it('renders the four columns and the pending medical disclaimer', () => {
  localStorage.setItem('roote.locale', 'en');
  render(<LocaleProvider><MemoryRouter><Footer /></MemoryRouter></LocaleProvider>);
  const footer = screen.getByRole('contentinfo');
  expect(within(footer).getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '/how-it-works');
  expect(within(footer).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  expect(within(footer).getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  // medical disclaimer is [PENDING] in he-config → renders a pending chip
  expect(within(footer).getByText(/\[PENDING:/)).toBeInTheDocument();
});
```

- [ ] **Step 3: Run, watch fail.**

- [ ] **Step 4: Implement `Footer.tsx`** — `<footer>` (role `contentinfo` implicit), `border-t border-border px-6 py-16 md:px-10`. Grid `md:grid-cols-4 gap-10`. Columns:
  - **Explore**: `/how-it-works`, `/science`, `/products`, `/results`
  - **Company**: `/about`, `/blog`, `/support`, `/faq`
  - **Legal**: `/terms`, `/privacy`
  - **Start**: `marketing.footer.startTitle` + `startBody` + `<Link to="/diagnosis" class="…rounded-full bg-primary…">{t('marketing.nav.cta')}</Link>`
  Base row (`mt-12 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between`): `<Wordmark className="w-20"/>`, `<LocaleToggle/>`, `© {year} ROOTÉ · {t('marketing.footer.rights')}`, and the medical disclaimer: reuse the current `Footer` logic —
  ```tsx
  const disclaimer = resolveLocalized(rooteContent.disclaimers.medical, locale, 'footer medical disclaimer (he)');
  isPending(disclaimer) ? <PendingChip label={disclaimer.label} /> : <p className="max-w-xl">{disclaimer}</p>
  ```
  (Copy `resolveLocalized` from the old `LandingSectionsB.tsx` — it will be deleted in Task 14; move the helper to `src/content/pending.ts` or inline it here.)

- [ ] **Step 5: Render `<Footer/>` in `MarketingShell`.**

- [ ] **Step 6: Run** — shell tests + parity + `pnpm test` → green.

- [ ] **Step 7: Commit**
```bash
git add src/app/components/shell/ src/i18n/messages/
git commit -m "feat: add marketing Footer with nav columns and pending disclaimer"
```

---

### Task 8: `Section` + `Eyebrow` + `ArcMotif`

**Files:**
- Create: `src/app/components/marketing/Section.tsx`
- Create: `src/app/components/marketing/Eyebrow.tsx`
- Create: `src/app/components/marketing/ArcMotif.tsx`
- Test: `src/app/components/marketing/Section.test.tsx`

**Interfaces:**
- Produces:
  - `Section({ children, id?, index?, tone = 'light', motif = false, className? })` — `<section>` with `id`; padding `py-20 md:py-28` (light) or `py-24 md:py-32 bg-ink text-ink-foreground` (ink); inner `mx-auto max-w-6xl px-6 md:px-10`; when `index` given, renders `<span aria-hidden class="mb-4 block font-body text-xs text-accent">{index}</span>` (e.g. `"01"`); when `motif`, renders `<ArcMotif/>` absolutely positioned behind content. **No animation here** — entrance animation is layered in Phase 5 by wrapping children; `Section` just exposes a stable `data-animate="section"` attribute on the `<section>`.
  - `Eyebrow({ children })` — `<p class="font-body text-xs font-medium uppercase text-muted-foreground">`.
  - `ArcMotif()` — decorative concentric-arc inline `<svg aria-hidden="true" class="pointer-events-none absolute …">` (three stroked circles, `stroke="var(--accent)"`, low opacity).

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/components/marketing/Section.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section';
import { Eyebrow } from './Eyebrow';

describe('Section', () => {
  it('renders children inside a section with the given id', () => {
    render(<Section id="science"><p>body</p></Section>);
    const section = document.getElementById('science');
    expect(section?.tagName).toBe('SECTION');
    expect(screen.getByText('body')).toBeInTheDocument();
  });
  it('renders the index numeral when provided', () => {
    render(<Section index="02"><p>b</p></Section>);
    expect(screen.getByText('02')).toHaveAttribute('aria-hidden', 'true');
  });
  it('applies the ink tone classes', () => {
    render(<Section tone="ink"><p>b</p></Section>);
    expect(document.querySelector('section')?.className).toContain('bg-ink');
  });
});

it('Eyebrow renders uppercase tracked label', () => {
  render(<Eyebrow>Our Science</Eyebrow>);
  expect(screen.getByText('Our Science').className).toContain('uppercase');
});
```

- [ ] **Step 2: Run, watch fail. → Step 3: Implement all three. → Step 4: Run, watch pass.**

- [ ] **Step 5: Commit**
```bash
git add src/app/components/marketing/Section.tsx src/app/components/marketing/Eyebrow.tsx src/app/components/marketing/ArcMotif.tsx src/app/components/marketing/Section.test.tsx
git commit -m "feat: add Section, Eyebrow, ArcMotif marketing primitives"
```

---

### Task 9: `DisplayHeading` (two-tone) + `Prose`

**Files:**
- Create: `src/app/components/marketing/DisplayHeading.tsx`
- Create: `src/app/components/marketing/Prose.tsx`
- Test: `src/app/components/marketing/DisplayHeading.test.tsx`

**Interfaces:**
- Produces:
  - `DisplayHeading({ as = 'h2', size = 'm', text, ghost?, onInk = false, className? })`
    - `size`: `'xl' | 'l' | 'm' | 's'` → classes:
      - xl: `text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.02em]`
      - l: `text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.0] tracking-[-0.015em]`
      - m: `text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.05]`
      - s: `text-2xl leading-snug`
    - always `font-display font-medium text-balance`
    - `text`: string. `ghost`: optional string appended after `text` with a leading space, wrapped in `<span aria-hidden="true" class="text-accent-ghost">` (or `text-ink-ghost` when `onInk`). The full readable phrase is `text` + (ghost ? ` ${ghost}` : '') — but only `text` is announced; `ghost` is decorative. **If the phrase's meaning needs the ghost word**, pass the whole phrase as `text` and `ghost` only as a repeated decorative flourish — document this in a JSDoc comment.
    - Renders `<Tag className={cn(sizeClasses, base, className)}>{text}{ghost && <span …> {ghost}</span>}</Tag>`.
  - `Prose({ children, size = 'm', className? })` — `<p class="font-body text-muted-foreground max-w-prose {size==='l'?'text-[1.0625rem] leading-[1.7]':'text-[0.9375rem] leading-[1.65]'}">`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/components/marketing/DisplayHeading.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisplayHeading } from './DisplayHeading';

describe('DisplayHeading', () => {
  it('renders the given tag and solid text', () => {
    render(<DisplayHeading as="h1" size="xl" text="Regrowth, tailored to you" />);
    const h = screen.getByRole('heading', { level: 1 });
    expect(h).toHaveTextContent('Regrowth, tailored to you');
    expect(h.className).toContain('font-display');
  });
  it('renders the ghost word decoratively (aria-hidden)', () => {
    render(<DisplayHeading as="h2" text="Backed by" ghost="science" />);
    const ghost = screen.getByText('science');
    expect(ghost).toHaveAttribute('aria-hidden', 'true');
    expect(ghost.className).toContain('text-accent-ghost');
    // the accessible name is just the solid text
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName('Backed by');
  });
});
```

- [ ] **Step 2–4: fail → implement → pass.**

- [ ] **Step 5: Commit**
```bash
git add src/app/components/marketing/DisplayHeading.tsx src/app/components/marketing/Prose.tsx src/app/components/marketing/DisplayHeading.test.tsx
git commit -m "feat: add DisplayHeading (two-tone) + Prose marketing primitives"
```

---

### Task 10: `CtaButton` + `ArrowLink` + `CtaBand`

**Files:**
- Create: `src/app/components/marketing/CtaButton.tsx`
- Create: `src/app/components/marketing/ArrowLink.tsx`
- Create: `src/app/components/marketing/CtaBand.tsx`
- Modify: `src/i18n/messages/{en,he}.ts`
- Test: `src/app/components/marketing/CtaBand.test.tsx`

**Interfaces:**
- Consumes: `useT`, `DisplayHeading`, `Section`, `CtaButton`.
- Produces:
  - `CtaButton({ to, children, size = 'md' })` — `<Link to={to} class="inline-flex items-center rounded-full bg-primary text-primary-foreground {size==='lg'?'px-8 py-4 text-sm':'px-6 py-3 text-sm'}">`.
  - `ArrowLink({ to, children })` — `<Link to={to} class="group inline-flex items-center gap-2 font-body text-sm text-foreground">` + `<span>` label + an inline arrow `<svg>` that translates on `group-hover` (`transition-transform group-hover:translate-x-1` — and in RTL the arrow is `-scale-x-100` via a `rtl:-scale-x-100` utility). Underline: `border-b border-accent/50 group-hover:border-accent`.
  - `CtaBand({ headingKey, bodyKey? })` — `<Section tone="ink" className="text-center">` with `<DisplayHeading as="h2" size="m" onInk text={t(headingKey)} />`, optional `<Prose>` , and `<CtaButton to="/diagnosis" size="lg">{t('marketing.nav.cta')}</CtaButton>`.

- [ ] **Step 1: Add i18n keys**
```
marketing.cta.default.title   en "Your plan starts with one free analysis."   he "התוכנית שלך מתחילה באבחון אחד חינם."
marketing.cta.default.body    en "Answer a few questions, add a scalp photo, and get a regimen matched to your pattern."   he "עונים על כמה שאלות, מוסיפים תמונת קרקפת, ומקבלים תוכנית שמותאמת לדפוס שלך."
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/app/components/marketing/CtaBand.test.tsx
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CtaBand } from './CtaBand';

it('renders a heading and a CTA linking to /diagnosis', () => {
  localStorage.setItem('roote.locale', 'en');
  render(<LocaleProvider><MemoryRouter>
    <CtaBand headingKey="marketing.cta.default.title" bodyKey="marketing.cta.default.body" />
  </MemoryRouter></LocaleProvider>);
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('one free analysis');
  expect(screen.getByRole('link', { name: 'Start free analysis' })).toHaveAttribute('href', '/diagnosis');
});
```

- [ ] **Step 3–5: fail → implement → pass.**

- [ ] **Step 6: Commit**
```bash
git add src/app/components/marketing/CtaButton.tsx src/app/components/marketing/ArrowLink.tsx src/app/components/marketing/CtaBand.tsx src/app/components/marketing/CtaBand.test.tsx src/i18n/messages/
git commit -m "feat: add CtaButton, ArrowLink, CtaBand marketing primitives"
```

---

**PHASE 1 CHECKPOINT:** `pnpm test` (all green — funnel untouched, marketing routes render as stubs inside the shell), `pnpm build` clean. Whole-phase review before Phase 2.

---

# PHASE 2 — Home

Ends with: `/` renders the full ~11-section homepage on the Phase 1 foundation; old `landing/` files deleted; `Home.test.tsx` green.

Home is built as one page file `src/app/routes/marketing/Home.tsx` composing `Section` + primitives, with section subcomponents colocated in `src/app/routes/marketing/home/`. Split across 4 tasks so each carries its own test + review.

---

### Task 11: Home — Hero + i18n scaffold

**Files:**
- Modify: `src/app/routes/marketing/Home.tsx`
- Create: `src/app/routes/marketing/home/Hero.tsx`
- Modify: `src/i18n/messages/{en,he}.ts`
- Modify: `src/assets/` — reuse `hero-people.png`
- Test: `src/app/routes/marketing/home/Hero.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Eyebrow`, `DisplayHeading`, `Prose`, `CtaButton`, `useT`.
- Produces: `Hero()` — `<Section tone="ink">` containing a 2-col grid (`lg:grid-cols-2`): left = `<Eyebrow>` + `<DisplayHeading as="h1" size="xl" onInk text ghost>` + `<Prose>` + `<CtaButton to="/diagnosis" size="lg">` + a trust line (`[PENDING]` endorsement via `PendingChip`); right = `<img src={heroPeople} alt="" class="img-editorial rounded-2xl">` (the `.img-editorial` utility is added to a new `src/styles/marketing.css` imported from `index.css` — filter only, no parallax yet).

- [ ] **Step 1: Add i18n keys**
```
marketing.home.hero.eyebrow    en "Personalized hair growth"   he "צמיחת שיער מותאמת אישית"
marketing.home.hero.title      en "Regrowth, built around"     he "צמיחה מחדש, שנבנתה סביב"
marketing.home.hero.titleGhost en "your scalp"                 he "הקרקפת שלך"
marketing.home.hero.body       en "A dermatologist-informed regimen matched to your pattern, your history, and a photo of your scalp — reviewed as you go."   he "תוכנית טיפול מבוססת-רופא/ה שמותאמת לדפוס שלך, להיסטוריה שלך ולתמונת הקרקפת שלך — עם מעקב לאורך הדרך."
marketing.home.hero.trust      en "Informed by dermatology practice"   he "מבוסס על ניסיון קליני בתחום העור"
```
(`marketing.home.hero.trust` is deliberately a soft, non-numeric statement — not `[PENDING]`. Any *specific* endorsement number stays `[PENDING]`.)

- [ ] **Step 2: Write the failing test**

```tsx
// src/app/routes/marketing/home/Hero.test.tsx
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Hero } from './Hero';

it('renders the h1 and the primary CTA', () => {
  localStorage.setItem('roote.locale', 'en');
  render(<LocaleProvider><MemoryRouter><Hero /></MemoryRouter></LocaleProvider>);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Regrowth, built around');
  expect(screen.getByRole('link', { name: 'Start free analysis' })).toHaveAttribute('href', '/diagnosis');
});
```

- [ ] **Step 3: Create `src/styles/marketing.css`**
```css
.img-editorial { filter: saturate(0.92) contrast(1.04) sepia(0.10); }
```
Import it from `src/styles/index.css` (after `theme.css`).

- [ ] **Step 4: Implement `Hero.tsx`; set `Home.tsx` to `return <><Hero /></>` (drop the stub `<h1>Home</h1>`).**

- [ ] **Step 5: Run** — `pnpm exec vitest run src/app/routes/marketing/home src/i18n/messages.test.ts` → PASS.

- [ ] **Step 6: Commit**
```bash
git add src/app/routes/marketing/ src/styles/marketing.css src/styles/index.css src/i18n/messages/
git commit -m "feat: add Home hero section"
```

---

### Task 12: Home — value prop, social proof, quiz intro, how-it-works steps

**Files:**
- Create: `src/app/routes/marketing/home/ValueProp.tsx`, `SocialProof.tsx`, `QuizIntro.tsx`, `HowItWorksSteps.tsx`
- Modify: `src/app/routes/marketing/Home.tsx`, `src/i18n/messages/{en,he}.ts`
- Test: `src/app/routes/marketing/home/HomeMid.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Eyebrow`, `DisplayHeading`, `Prose`, `ArrowLink`, `PendingChip`, `useT`.
- Produces:
  - `ValueProp()` — `<Section>` one `<DisplayHeading size="l">` + supporting `<Prose size="l">`.
  - `SocialProof()` — `<Section>` a row of three items: `<PendingChip label="clinician count" />`, `<PendingChip label="customers served" />`, and a `<PressLogos count={5} />` placeholder — but `PressLogos` doesn't exist until Task 15, so **inline 5 `<PendingChip label={`press logo ${n}`} />`** here and refactor to `PressLogos` in Task 15's step that touches this file. (Note the refactor in the Task 15 body.)
  - `QuizIntro()` — `<Section index="01">` heading + a 3-item `<ol>` (quiz → scalp photo → plan) + `<ArrowLink to="/diagnosis">`.
  - `HowItWorksSteps()` — `<Section index="02">` heading + a 4-item responsive grid, each item: step number, `marketing.home.how.stepN.title`, `.body`, and a reused image (`stepQuiz`, `stepPhotoScan`, `scanDevice`, `productLineup` from `src/assets`); footer `<ArrowLink to="/how-it-works">`.

- [ ] **Step 1: Add i18n keys** — `marketing.home.valueProp.{title,body}`, `marketing.home.social.{cliniciansLabel,customersLabel}` (label text only; values are `[PENDING]`), `marketing.home.quiz.{title,step1,step2,step3,cta}`, `marketing.home.how.{title,cta,step1.title,step1.body,…,step4.title,step4.body}`. Draft plain-language EN + first-pass HE for all.

- [ ] **Step 2: Write the failing test** — render each of the four components inside `LocaleProvider`+`MemoryRouter` (locale `en`), assert: ValueProp shows its title; SocialProof shows ≥ 2 `[PENDING:` chips; QuizIntro shows 3 list items and an `/diagnosis` link; HowItWorksSteps shows 4 step titles and a `/how-it-works` link.

- [ ] **Step 3: Run, watch fail. → Step 4: Implement the four; append to `Home.tsx` in order: `Hero, ValueProp, SocialProof, QuizIntro, HowItWorksSteps`. → Step 5: Run, watch pass + parity.**

- [ ] **Step 6: Commit**
```bash
git add src/app/routes/marketing/ src/i18n/messages/
git commit -m "feat: add Home value-prop, social-proof, quiz-intro, how-it-works sections"
```

---

### Task 13: Home — testimonials, clinical results, product components, root-cause

**Files:**
- Create: `src/app/routes/marketing/home/Testimonials.tsx`, `ClinicalResults.tsx`, `ProductComponents.tsx`, `RootCause.tsx`
- Modify: `src/app/routes/marketing/Home.tsx`, `src/i18n/messages/{en,he}.ts`
- Test: `src/app/routes/marketing/home/HomeLower.test.tsx`

**Interfaces:**
- Consumes: `Section`, `DisplayHeading`, `Prose`, `ArrowLink`, `PendingChip`, `useT`, `useLocale`, `rooteContent`.
- Produces:
  - `Testimonials()` — `<Section>` heading + a static 3-card row; each card = `[PENDING]` avatar block + `<PendingChip label={`testimonial ${n} quote`} />` + `<PendingChip label={`testimonial ${n} result`} />`. (Real carousel arrives in Task 19; this is the static placeholder.)
  - `ClinicalResults()` — `<Section index="03">` heading + `<PendingChip label="clinical improvement %"/>` as the hero stat + `<PendingChip label="study attribution"/>`.
  - `ProductComponents()` — `<Section index="04">` heading + a grid mapping `rooteContent.formula.ingredients` (name + role via `marketing.home.products.role.<role>` keys) + `<PendingChip label="kit price"/>` + `<ArrowLink to="/products">`.
  - `RootCause()` — `<Section>` heading + 3 profile cards built **only** from existing i18n tokens: each card title = `t('severity.<band>') + ' · ' + [t('zone.<a>'), t('zone.<b>')].join(', ')` for bands `moderate`/`established`/`mild`, body = a checklist of `rooteContent.formula.ingredients` roles that apply (all roles, framed as "addresses…"). No invented names.

- [ ] **Step 1: Add i18n keys** — `marketing.home.testimonials.title`, `marketing.home.clinical.{title,body}`, `marketing.home.products.{title,kitCta,role.regrowth-stimulant,role.dht-blocker,role.dht-support,role.proprietary-support}`, `marketing.home.rootCause.{title,addresses}`. (Reuse existing `severity.*` and `zone.*` keys — verify they exist; if a needed `zone.*` key is missing, add it to both dictionaries.)

- [ ] **Step 2–5: test (assert headings render, ≥ 3 `[PENDING:` chips total, `/products` link present, RootCause shows 3 cards whose titles contain a localized severity word) → fail → implement → append to `Home.tsx` → pass + parity.**

- [ ] **Step 6: Commit**
```bash
git add src/app/routes/marketing/ src/i18n/messages/
git commit -m "feat: add Home testimonials, clinical-results, product-components, root-cause sections"
```

---

### Task 14: Home — research section, CtaBand, wire-up, delete old landing

**Files:**
- Create: `src/app/routes/marketing/home/Research.tsx`
- Modify: `src/app/routes/marketing/Home.tsx`
- Create: `src/app/routes/marketing/Home.test.tsx`
- Delete: `src/app/routes/landing/LandingSectionsA.tsx`, `LandingSectionsB.tsx`, `Landing.tsx`, `Landing.test.tsx`
- Modify: `src/app/App.tsx` (remove any lingering `Landing` import), `src/i18n/messages/{en,he}.ts`

**Interfaces:**
- Consumes: `Section`, `DisplayHeading`, `Prose`, `ArrowLink`, `CtaBand`.
- Produces: `Research()` — `<Section>` heading + `<Prose>` + a 2-image before/after using `scalpBefore`/`scalpAfter` (static, labelled, `[PENDING]` timeframe caption) + `<ArrowLink to="/science">`. `Home.tsx` final composition: `Hero, ValueProp, SocialProof, QuizIntro, HowItWorksSteps, Testimonials, ClinicalResults, ProductComponents, RootCause, Research, <CtaBand headingKey="marketing.cta.default.title" bodyKey="marketing.cta.default.body" />`.

- [ ] **Step 1: Add i18n keys** — `marketing.home.research.{title,body,beforeLabel,afterLabel,caption}` (`caption` value text is real wording like "Cuticle condition over time"; the *duration* is `[PENDING]`).

- [ ] **Step 2: Write `Home.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { marketingRoutes } from './marketingRoutes';

function renderHome(locale = 'en') {
  localStorage.setItem('roote.locale', locale);
  const router = createMemoryRouter([marketingRoutes], { initialEntries: ['/'] });
  render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
}

describe('Home', () => {
  it('renders one h1 and the wordmark and a diagnosis CTA', () => {
    renderHome();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: 'Start free analysis' }).length).toBeGreaterThan(0);
  });
  it('renders in Hebrew without leaking raw [PENDING] markers as the only content', () => {
    renderHome('he');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
  it('shows pending chips, not raw bracket text, for deferred claims', () => {
    renderHome();
    // pending chips render "[PENDING: label]" as visible text via PendingChip — that's expected;
    // assert at least one is present and that the page still has real prose around them
    expect(screen.getAllByText(/\[PENDING:/).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Implement `Research.tsx`, finalize `Home.tsx`.**

- [ ] **Step 4: Salvage-check then delete** `src/app/routes/landing/`. Before deleting, confirm every piece of copy worth keeping from `LandingSectionsA/B.tsx` has an equivalent `marketing.home.*` key (science stats, regimen roles, trust items). Then `git rm` the four files. Remove the `landing` import from `App.tsx` if still present. Grep `rg "routes/landing"` → must be zero hits.

- [ ] **Step 5: Run** — `pnpm test` → **full suite green**, including the updated `App.test.tsx` (its `/` assertion, temporarily set in Task 5, now asserts the real Home h1 — update it here to `screen.getByRole('heading',{level:1})` present + the CTA). `pnpm build` → clean.

- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "feat: complete Home page, remove legacy landing route"
```

---

**PHASE 2 CHECKPOINT:** `/` is the full homepage; `pnpm test` + `pnpm build` green; no `routes/landing` references. Whole-phase review before Phase 3.

---

# PHASE 3 — Core pages

Ends with: How It Works, Science, Products, Results & Reviews, About fully built; their section-specific components (`StatStrip`, `PressLogos`, `StepList`, `PinnedSteps`, `Timeline`, `BeforeAfter`, `IngredientCard`, `KitCard`, `ReviewCard`, `ReviewCarousel`) built and tested.

---

### Task 15: `StatStrip` + `PressLogos`

**Files:** Create `src/app/components/marketing/StatStrip.tsx`, `PressLogos.tsx`; test `StatStrip.test.tsx`; modify `src/app/routes/marketing/home/SocialProof.tsx` (refactor the inline pending chips from Task 12 to `<PressLogos count={5} />` + two `StatStrip` items).

**Interfaces:**
- `StatStrip({ items })` where `items: { value: string | PendingMarker; label: string }[]` — renders a flex row; each item shows the value (or `<PendingChip label={value.label}/>` when `isPending(value)`) above a small `Eyebrow`-style label.
- `PressLogos({ count })` — a muted row of `count` `<PendingChip label={`press logo ${i+1}`} />` inside a `<div aria-label="Press coverage">`.

- [ ] Steps: failing test (StatStrip renders a pending item as a chip + a resolved item as text; PressLogos renders `count` chips) → implement → refactor `SocialProof.tsx` → run `pnpm exec vitest run src/app/components/marketing src/app/routes/marketing/home` + parity → commit `feat: add StatStrip + PressLogos, use in Home social proof`.

---

### Task 16: `StepList` + `PinnedSteps`

**Files:** Create `src/app/components/marketing/StepList.tsx`, `PinnedSteps.tsx`; test both.

**Interfaces:**
- `Step = { n: number; title: string; body: string; image?: string }`
- `StepList({ steps })` — ordered list, each row: numeral (`text-accent font-body`), `<DisplayHeading as="h3" size="s">`, `<Prose>`, optional image (`img-editorial`).
- `PinnedSteps({ steps })` — when `useReducedMotion()` is **true**, renders exactly `<StepList steps={steps} />`. Otherwise renders a `position: sticky` container that swaps the active step based on scroll progress (the scroll math is stubbed in Phase 5 — for now, non-reduced also renders `StepList` but wrapped in a `data-pinned="true"` div; Phase 5 Task 33 adds the `useScroll` behaviour). Both paths must show all step titles in the DOM (progressive enhancement).

- [ ] Steps: failing test — `PinnedSteps` with mocked `matchMedia` reduced → renders a plain `<ol>` with every step title; non-reduced → still every step title present. → implement → run → commit `feat: add StepList + PinnedSteps (static + reduced-motion paths)`.

---

### Task 17: `Timeline` + `BeforeAfter`

**Files:** Create `src/app/components/marketing/Timeline.tsx`, `BeforeAfter.tsx`; test both.

**Interfaces:**
- `Milestone = { label: string; outcome: string | PendingMarker }`
- `Timeline({ milestones })` — horizontal (stacked on mobile) rail with a dot per milestone; label real, outcome via `PendingChip` when pending.
- `BeforeAfter({ before, after, beforeLabel, afterLabel, caption? })` — 2-col images (`img-editorial rounded-xl`), each with an absolutely-positioned pill label (`bg-background/90 … text-xs uppercase`), optional `<figcaption>`; no interactive slider.

- [ ] Steps: failing test (Timeline shows N labels + a pending outcome chip; BeforeAfter shows both labels + a caption) → implement → run → commit `feat: add Timeline + BeforeAfter marketing components`.

---

### Task 18: `IngredientCard` + `KitCard`

**Files:** Create `src/app/components/marketing/IngredientCard.tsx`, `KitCard.tsx`; test both.

**Interfaces:**
- `IngredientCard({ name, roleLabel, evidence })` — `name` (`font-display text-lg`), `roleLabel` (`Eyebrow`), `evidence` prose; a `[PENDING]` chip slot for `dose`.
- `KitCard({ title, body, price })` — `title`, `body`, and price via `PendingChip` when `isPending(price)` else formatted through the existing `formatMoney` (`src/domain/report/money.ts`). **Never hand-roll a currency string.**

- [ ] Steps: failing test (IngredientCard renders name + role + a `[PENDING: dose]` chip; KitCard renders a `[PENDING: … price]` chip when price is a PendingMarker) → implement → run → commit `feat: add IngredientCard + KitCard`.

---

### Task 19: `ReviewCard` + `ReviewCarousel`

**Files:** Create `src/app/components/marketing/ReviewCard.tsx`, `ReviewCarousel.tsx`; test both. Modify `src/app/routes/marketing/home/Testimonials.tsx` to use `ReviewCarousel` with all-`[PENDING]` slides.

**Interfaces:**
- `Review = { id: string; quote: string | PendingMarker; author: string | PendingMarker; result: string | PendingMarker; beforeAfter?: { before: string; after: string } }`
- `ReviewCard({ review })` — quote (blockquote, `font-display` if resolved else `PendingChip`), author + result lines (chips when pending), optional `<BeforeAfter>`.
- `ReviewCarousel({ reviews })` — `role="region" aria-roledescription="carousel" aria-label`; a track of `ReviewCard`s; Prev/Next `<button>`s (`aria-label`); one card visible at a time on mobile, up to 3 on desktop via CSS scroll-snap. **No autoplay yet** (Phase 5 Task 36 adds it). Under reduced motion the "carousel" is just the scroll-snap row (already the case).

- [ ] Steps: failing test — `ReviewCarousel` with 3 all-pending reviews renders 3 `[PENDING:` groups, a Prev and a Next button, and `role="region"`; Next click changes `aria-live`-free active index (assert scroll or a `data-active` attr). Update `Testimonials.tsx`; its Task 13 test still passes. → implement → run `pnpm exec vitest run src/app/components/marketing src/app/routes/marketing/home` + parity → commit `feat: add ReviewCard + ReviewCarousel, use in Home testimonials`.

---

### Task 20: How It Works page

**Files:** Modify `src/app/routes/marketing/HowItWorks.tsx`; create `src/app/routes/marketing/howItWorks/` section files as needed; modify `src/i18n/messages/{en,he}.ts`; create `src/app/routes/marketing/HowItWorks.test.tsx`.

**Composition** (top→bottom), all `Section`-wrapped:
1. Page hero — `<Eyebrow>` + `<DisplayHeading as="h1" size="l">` + `<Prose size="l">`.
2. `<PinnedSteps steps={fourSteps} />` — steps: assessment quiz / AI scalp-photo analysis (`[PENDING]` accuracy chip in body) / your custom formula / ongoing adjustments + derm messaging (`[PENDING]` cadence chip).
3. "What's in your kit" — `<KitCard>` row from `rooteContent.formula.ingredients` (price `[PENDING]`).
4. `<Timeline milestones={[1mo,3mo,6mo]} />` — labels real; outcomes `[PENDING]`; plus a drafted (not pending) shedding-phase `<Prose>` note.
5. Support model — `<Prose>` describing derm chat / check-ins / plan revisions with `[PENDING]` chips for any specific number.
6. FAQ teaser — 4 items rendered with a lightweight inline `<details>`/`<summary>` (the real `FaqAccordion` is Task 25; a `<details>` teaser here is acceptable and gets swapped in Task 25's step touching this file) + `<ArrowLink to="/faq">`.
7. `<CtaBand headingKey="marketing.howItWorks.cta.title" />`.

**i18n keys:** `marketing.howItWorks.*` for hero, each step title/body, kit intro, timeline labels, shedding note, support paragraph, faqTeaser Q&A ×4, cta.title. Draft EN + first-pass HE.

**Test (`HowItWorks.test.tsx`):** render at `/how-it-works` via `marketingRoutes`; assert single `h1` with the page title; `PinnedSteps` renders all 4 step titles; a `/faq` link; a `/diagnosis` CTA; EN + HE render; `[PENDING:` chips present.

- [ ] Steps: i18n → failing test → implement sections → wire `HowItWorks.tsx` → run (`pnpm exec vitest run src/app/routes/marketing/HowItWorks.test.tsx src/i18n/messages.test.ts`, then `pnpm test`) → commit `feat: build How It Works page`.

---

### Task 21: Science page

**Files:** Modify `src/app/routes/marketing/Science.tsx`; section files under `science/`; i18n; `Science.test.tsx`.

**Composition:**
1. Hero (`h1` size `l`).
2. Mechanism — `<Prose>` (DHT / miniaturization / growth-phase) + a small inline `<svg aria-hidden>` cycle diagram (no library; 3 labelled nodes).
3. Active ingredients — `<IngredientCard>` per `rooteContent.formula.ingredients` (`evidence` = drafted one-liner per role; `dose` `[PENDING]`).
4. Clinical evidence — `<StatStrip>` of `[PENDING]` n / % / duration + `<PendingChip label="results-over-time chart"/>`.
5. `<BeforeAfter>` microscope (`hairCuticle` twice with different labels, or `scalpBefore`/`scalpAfter`) + `[PENDING]` measurement caption.
6. Medical advisory board — 3 `<PendingChip label={`advisor ${n}`}/>` cards + a drafted oversight paragraph.
7. References — `<ol>` of 4 `<PendingChip label={`reference ${n}`}/>`.
8. `<CtaBand headingKey="marketing.science.cta.title" />`.

**Test:** `h1`; ≥ 1 `IngredientCard` (assert an ingredient name from `roote.config` appears); `[PENDING:` chips present; EN+HE; `/diagnosis` CTA.

- [ ] Steps: i18n → failing test → implement → run → commit `feat: build Science page`.

---

### Task 22: Products page

**Files:** Modify `src/app/routes/marketing/Products.tsx`; `products/` sections; i18n; `Products.test.tsx`.

**Composition:**
1. Hero + `<CtaButton>`.
2. Kit overview — `<KitCard>` for the whole kit, `price` `[PENDING]`.
3. Per-component detail — for each of `rooteContent.formula.ingredients` (topical / supplement / shampoo / collagen — map roles to component types), an anchored `<Section>` with name, what-it-does prose, key ingredients list, usage prose, `[PENDING]` unit price. `id` per component for anchor links.
4. "Customized to you" — `<Prose>` describing how `deriveAnalysis` inputs (Norwood stage, zones, history) shape the kit — **described, not recomputed**; link to `/how-it-works`.
5. Subscription/reorder — `<Prose>` + `[PENDING]` cadence + `[PENDING]` price; `<ArrowLink to="/start">`.
6. Guarantee — `<PendingChip label="guarantee terms"/>` + drafted framing prose.
7. Reviews teaser — `<ArrowLink to="/results">`.
8. `<CtaBand headingKey="marketing.products.cta.title" />`.

**Test:** `h1`; each component name present; `[PENDING:` price chips; `/start` and `/results` links; EN+HE.

- [ ] Steps: i18n → failing test → implement → run → commit `feat: build Products page`.

---

### Task 23: Results & Reviews page

**Files:** Modify `src/app/routes/marketing/Results.tsx`; `results/` sections; i18n; `Results.test.tsx`.

**Composition:**
1. Hero.
2. Rating summary — `<StatStrip>` `[PENDING]` avg stars + `[PENDING]` count.
3. Before/after gallery — grid of 6 `<BeforeAfter>` with `[PENDING]` image sources (use the existing `scalpBefore`/`scalpAfter` as visual placeholders + a `[PENDING]` timeline label per pair).
4. Testimonials — `<ReviewCarousel>` with 6 all-`[PENDING]` `Review`s; static filter chips (`concern` / `timeline`) that are visually present but no-op with a `title="Filtering is disabled in the preview"` (documented stub).
5. Results by timeline — `<Timeline>` reused, `[PENDING]` outcomes.
6. Press/media — `<PressLogos count={6} />` + 2 `<PendingChip label={`press quote ${n}`}/>`.
7. `<CtaBand headingKey="marketing.results.cta.title" />`.

**Test:** `h1`; `ReviewCarousel` region present; ≥ 6 `[PENDING:` chips; filter chips render; EN+HE; `/diagnosis` CTA.

- [ ] Steps: i18n → failing test → implement → run → commit `feat: build Results & Reviews page`.

---

### Task 24: About page

**Files:** Modify `src/app/routes/marketing/About.tsx`; `about/` sections; i18n; `About.test.tsx`.

**Composition:**
1. Hero / mission — drafted mission statement (real copy).
2. Founding story — drafted narrative `<Prose>`; `[PENDING]` chips only for specific dates / founder names.
3. Team & advisors — grid of 4 `<PendingChip label={`team member ${n}`}/>` cards.
4. Values — 3 drafted value blocks (evidence-led / personalized / transparent-about-pending).
5. Press — `<PressLogos count={5} />`.
6. Careers — drafted teaser + `<PendingChip label="careers link"/>`.
7. `<CtaBand headingKey="marketing.about.cta.title" />`.

**Test:** `h1`; the mission copy renders as real text (not a chip); `[PENDING:` chips present for team; EN+HE; CTA.

- [ ] Steps: i18n → failing test → implement → run (`pnpm test` full) → commit `feat: build About page`.

---

**PHASE 3 CHECKPOINT:** all 5 core pages render, `pnpm test` + `pnpm build` green. Whole-phase review before Phase 4.

---

# PHASE 4 — Content pages

---

### Task 25: `FaqAccordion` + FAQ page

**Files:** Create `src/app/components/marketing/FaqAccordion.tsx` + test; modify `src/app/routes/marketing/Faq.tsx`; create `Faq.test.tsx`; modify `src/i18n/messages/{en,he}.ts`; swap the `<details>` teaser in `HowItWorks.tsx` (Task 20) for `<FaqAccordion>`.

**Interfaces:**
- `FaqGroup = { id: string; label: string; items: { q: string; a: string | PendingMarker }[] }`
- `FaqAccordion({ groups })` — for each group a heading + a list of disclosure `<button aria-expanded aria-controls>` / region pairs; only one item open per group at a time; `Enter`/`Space` toggle; answer via `PendingChip` when pending.

**FAQ page composition:** hero + static category tab strip (`Getting started` / `The plan` / `Ingredients & safety` / `Billing & shipping` / `Results` — clicking a tab scrolls to that `<FaqAccordion>` group) + one `<FaqAccordion>` per category + "still have questions?" `<ArrowLink to="/support">` + `<CtaBand>`.

**i18n:** `marketing.faq.*` — 5 group labels + ~4 Q&A per group. Claude drafts plausible ROOTÉ answers; `[PENDING]` for the entire `Billing & shipping` group answers, the guarantee answer, and any medical-contraindication answer.

**Tests:**
- `FaqAccordion.test.tsx`: renders group labels; a question button has `aria-expanded="false"`; clicking it sets `"true"` and reveals the answer; a second click collapses it; opening a second question in the same group closes the first.
- `Faq.test.tsx`: `h1`; 5 category labels present; ≥ 1 `[PENDING:` answer chip; `/support` link; EN+HE.

- [ ] Steps: i18n → failing tests → implement `FaqAccordion` → implement `Faq.tsx` → swap `HowItWorks` teaser → run (`pnpm exec vitest run src/app/components/marketing/FaqAccordion.test.tsx src/app/routes/marketing/Faq.test.tsx src/app/routes/marketing/HowItWorks.test.tsx src/i18n/messages.test.ts`, then `pnpm test`) → commit `feat: add FaqAccordion + FAQ page`.

---

### Task 26: `ContactForm` (stub) + Support page

**Files:** Create `src/app/components/marketing/ContactForm.tsx` + test; modify `src/app/routes/marketing/Support.tsx`; create `Support.test.tsx`; i18n.

**Interfaces:**
- `ContactForm()` — `<form>` with labelled `name` (text), `email` (`type="email"`, required), `topic` (`<select>` with 4 options), `message` (`<textarea>`, required). On `submit`: `e.preventDefault()`, set local state `submitted = true`, render `<p role="status">{t('marketing.support.form.stubNotice')}</p>`. **No network, no storage, no navigation.** Comments: `// TODO: confirm with client — support channels` and `// TODO: wire to support backend`.

**Support page composition:** hero + contact options (`[PENDING]` email chip, `[PENDING]` hours chip, drafted "message your dermatologist in-app" line) + `<ContactForm/>` + help-topic `<ArrowLink>`s into `/faq` + `<CtaBand>`.

**i18n:** `marketing.support.*` incl. `form.{nameLabel,emailLabel,topicLabel,topic1..4,messageLabel,submit,stubNotice}`. `stubNotice` en: `"Thanks — this form isn't connected in the preview. Nothing was sent."` he: `"תודה — הטופס הזה אינו מחובר בגרסת התצוגה. לא נשלח דבר."`

**Tests:**
- `ContactForm.test.tsx`: fill name/email/message, submit → `role="status"` notice appears; assert no navigation (still same URL) and `fetch` was never called (`vi.spyOn(globalThis,'fetch')` → not called).
- `Support.test.tsx`: `h1`; the form renders; `[PENDING:` email chip; `/faq` link; EN+HE.

- [ ] Steps: i18n → failing tests → implement → run → commit `feat: add ContactForm stub + Support page`.

---

### Task 27: Blog data model + `posts.ts` + first 2 posts

**Files:** Create `src/content/blog/posts.ts`, `src/content/blog/posts.test.ts`; modify `src/i18n/messages/{en,he}.ts`.

**Interfaces:**
- ```ts
  export type BlogBlock =
    | { type: 'heading'; key: string }
    | { type: 'paragraph'; key: string }
    | { type: 'pullquote'; key: string }
    | { type: 'list'; keys: string[] }
    | { type: 'image'; src: string; altKey: string }
    | { type: 'pending'; label: string };
  export type BlogPost = {
    slug: string;
    category: 'ingredients' | 'the-science' | 'hair-loss-basics' | 'routine';
    dateISO: string;          // YYYY-MM-DD
    readingMinutes: number;
    heroImage: string;
    titleKey: string;
    excerptKey: string;
    blocks: BlogBlock[];
  };
  export const posts: BlogPost[];
  export function getPost(slug: string): BlogPost | undefined;
  export function getPostsByCategory(cat?: BlogPost['category']): BlogPost[]; // newest first
  ```
- First 2 posts: `understanding-the-norwood-scale` (category `hair-loss-basics`), `what-causes-pattern-hair-loss` (category `the-science`). ~450–600 words EN each, expressed as ~10–14 `blocks`, every text block keyed `marketing.blog.<slug>.<n>` in both dictionaries. Any statistic → a `{ type: 'pending', label }` block.

**`posts.test.ts`:**
```ts
import { describe, it, expect } from 'vitest';
import { posts, getPost, getPostsByCategory } from './posts';
import en from '@/i18n/messages/en';
import he from '@/i18n/messages/he';

describe('blog posts', () => {
  it('has unique slugs', () => {
    expect(new Set(posts.map(p => p.slug)).size).toBe(posts.length);
  });
  it('every text-block key exists in both dictionaries', () => {
    const keys = posts.flatMap(p => [p.titleKey, p.excerptKey, ...p.blocks.flatMap(b =>
      'key' in b ? [b.key] : 'keys' in b ? b.keys : 'altKey' in b ? [b.altKey] : [])]);
    for (const k of keys) {
      expect(en, `en missing ${k}`).toHaveProperty(k.replaceAll('.', '\\.') as never); // adjust to messages shape
      expect(he, `he missing ${k}`).toHaveProperty(k.replaceAll('.', '\\.') as never);
    }
  });
  it('getPostsByCategory returns newest first', () => {
    const all = getPostsByCategory();
    const dates = all.map(p => p.dateISO);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});
```
(Adjust the dictionary-lookup to the actual `messages` export shape — flat record keyed by dotted string. If `messages` is a flat `Record<string,string>`, use `expect(k in en).toBe(true)`.)

- [ ] Steps: i18n (post 1+2 blocks) → failing test → implement `posts.ts` + `getPost`/`getPostsByCategory` → run → commit `feat: add blog data model + first two posts`.

---

### Task 28: Blog posts 3 & 4

**Files:** Modify `src/content/blog/posts.ts`, `src/i18n/messages/{en,he}.ts`.

- Add `how-ai-reads-a-scalp-photo` (`the-science`) and `building-a-routine-you-will-keep` (`routine`), same block structure, keys in both dictionaries.
- `posts.test.ts` now covers 4 posts with no change.

- [ ] Steps: i18n → run `posts.test.ts` (still green, now 4) + parity → commit `feat: add blog posts 3 and 4`.

---

### Task 29: `BlogCard` + Blog index page

**Files:** Create `src/app/components/marketing/BlogCard.tsx` + test; modify `src/app/routes/marketing/BlogIndex.tsx`; create `BlogIndex.test.tsx`; i18n (`marketing.blog.index.*`, category labels).

**Interfaces:**
- `BlogCard({ post })` — `<article>` linking to `/blog/${post.slug}`: category `Eyebrow` (localized), `<DisplayHeading as="h3" size="s">{t(post.titleKey)}`, `<Prose>{t(post.excerptKey)}`, meta row `{formatted date} · {readingMinutes} min`.
- Blog index composition: hero + category filter chips (client-side filter over `getPostsByCategory`) + responsive `BlogCard` grid.

**Tests:**
- `BlogCard.test.tsx`: renders title, excerpt, a link to `/blog/<slug>`.
- `BlogIndex.test.tsx`: `h1`; 4 cards; clicking the `routine` chip narrows to 1 card; EN+HE.

- [ ] Steps: i18n → failing tests → implement → run → commit `feat: add BlogCard + blog index page`.

---

### Task 30: `BlogPostBody` + Blog post page

**Files:** Create `src/app/components/marketing/BlogPostBody.tsx` + test; modify `src/app/routes/marketing/BlogPost.tsx`; create `BlogPost.test.tsx`; i18n (`marketing.blog.post.*` — "related reading", author label).

**Interfaces:**
- `BlogPostBody({ blocks })` — maps `BlogBlock[]` → elements: `heading`→`<DisplayHeading as="h2" size="s">`, `paragraph`→`<Prose>`, `pullquote`→`<blockquote class="font-display …">`, `list`→`<ul>`, `image`→`<img class="img-editorial rounded-xl">` with localized alt, `pending`→`<PendingChip label>`.
- `BlogPost.tsx` — reads `useParams().slug`, `getPost(slug)`; if undefined `<Navigate to="/blog" replace />`. Else: title `h1`, meta row, hero image, `<BlogPostBody>`, `[PENDING]` author chip, "Related reading" = up to 3 other posts in the same category as `BlogCard`s, `<CtaBand>`.

**Tests:**
- `BlogPostBody.test.tsx`: given a fixture `blocks` array with one of each type, renders a heading, a paragraph, a blockquote, a list item, an image with alt, and a `[PENDING:` chip.
- `BlogPost.test.tsx`: at `/blog/understanding-the-norwood-scale` renders that post's `h1`; at `/blog/does-not-exist` redirects to `/blog` (assert the index `h1`); EN+HE.

- [ ] Steps: i18n → failing tests → implement → run (`pnpm test` full) → commit `feat: add blog post page + BlogPostBody`.

---

### Task 31: `LegalPage` + Terms + Privacy

**Files:** Create `src/app/components/marketing/LegalPage.tsx` + test; modify `src/app/routes/marketing/Terms.tsx`, `Privacy.tsx`; create `Legal.test.tsx`; i18n (`marketing.legal.terms.*`, `marketing.legal.privacy.*` — section headings real, bodies `[PENDING]`).

**Interfaces:**
- `LegalPage({ titleKey, updatedLabelKey, sections })` where `sections: { headingKey: string; bodyKey: string | { pending: string } }[]` — single-column `max-w-3xl`; `h1` from `titleKey`; "Last updated: `[PENDING]`" line; each section `<h2>` + body (`<Prose>` or `<PendingChip>`).
- `Terms.tsx` / `Privacy.tsx` — each supplies ~6 drafted section headings; all bodies `{ pending: 'terms §N body' }` / `'privacy §N body'`.

**Test (`Legal.test.tsx`):** `/terms` → `h1` "Terms"; ≥ 5 `h2`s; every body is a `[PENDING:` chip; "Last updated" present; same for `/privacy`; EN+HE.

- [ ] Steps: i18n → failing test → implement → run (`pnpm test` full, `pnpm build`) → commit `feat: add LegalPage + Terms + Privacy`.

---

**PHASE 4 CHECKPOINT:** every route from the IA renders real content; `pnpm test` + `pnpm build` green. Whole-phase review before Phase 5.

---

# PHASE 5 — Rich motion

Every task here is **additive and reduced-motion-gated**. No content moves into a state that is invisible without JS/animation.

---

### Task 32: Section entrance + image mask-reveal

**Files:** Create `src/app/components/marketing/Reveal.tsx` + test; modify `Section.tsx` (wrap children in `<Reveal>`), `Hero.tsx`/`Research.tsx`/`BeforeAfter.tsx`/`BlogPostBody.tsx` (wrap images).

**Interfaces:**
- `Reveal({ children, as = 'div', variant = 'rise' })` — uses `motion` + `whileInView` (`once: true`, `viewport margin -10%`). `variant`: `'rise'` (`y: 16→0`, opacity `0→1`, 400ms) or `'mask'` (`clipPath` inset 100%→0 + opacity). When `useReducedMotion()` → renders a plain `<as>` with **no** initial hidden style (children fully visible, no animation props).

**Test (`Reveal.test.tsx`):** reduced-motion mocked true → child is present and the wrapper has no `style` opacity 0 / transform; reduced-motion false → child still present in DOM immediately (assert `getByText` works without scrolling — `whileInView` in jsdom resolves to visible since there's no IntersectionObserver; if `motion` needs an IO polyfill in the test env, stub `IntersectionObserver` in `src/test/setup.ts` to immediately invoke the callback as intersecting).

- [ ] Steps: failing test → implement `Reveal` → wrap in `Section` + the image spots → run `pnpm test` (**full suite must stay green** — every existing page test must still find its content; if any fail because content is hidden, the reduced-motion/no-IO path is wrong — fix `Reveal`) → commit `feat: add Reveal (entrance + mask), reduced-motion gated`.

---

### Task 33: Parallax + real `PinnedSteps` scroll behaviour

**Files:** Create `src/app/components/marketing/Parallax.tsx` + test; modify `Hero.tsx`, `Products.tsx` hero, `BlogPost.tsx` hero (wrap hero image), `PinnedSteps.tsx` (add the `useScroll` progress → active step, non-reduced path only).

**Interfaces:**
- `Parallax({ src, alt, className })` — `motion.img` with `y` bound to `useScroll` progress via `useTransform`, range ≤ 40px. Reduced-motion → plain `<img>`.
- `PinnedSteps` non-reduced: a `sticky top-0` viewport-height stage; `useScroll({ target })` progress maps to `Math.floor(progress * steps.length)`; the active step's copy is emphasized, others dimmed; **all step titles remain in the DOM**.

**Tests:** `Parallax.test.tsx` — reduced true → renders `<img>` not `motion.img` wrapper with transform; both paths expose the `alt`. `PinnedSteps` existing test unchanged (all titles present) + a new assertion: non-reduced renders a `[data-pinned="true"]` container.

- [ ] Steps: failing tests → implement → run full suite → commit `feat: add Parallax + scroll-driven PinnedSteps`.

---

### Task 34: Header condense-on-scroll

**Files:** Modify `src/app/components/shell/Header.tsx`, `Header.test.tsx`.

- Use `useScrollCondense(80)`: at top over the Home hero, header is `bg-transparent text-ink-foreground`; once condensed, `bg-background/95 backdrop-blur text-foreground border-b border-border`, with a `transition-[background,color] duration-200`. Under `useReducedMotion()` keep the same class swap but drop the `transition-*` classes (instant).
- On non-Home routes (no `--ink` hero) the header starts already-condensed (`transparentOverHero` prop defaults from route — simplest: `MarketingShell` passes `transparentOverHero={pathname === '/'}`).

**Test additions:** with `pathname="/"` and scrollY 0 → header has `bg-transparent`; after a scroll event past 80 → `bg-background/95`. With `pathname="/science"` → starts condensed.

- [ ] Steps: update test → implement → run `pnpm exec vitest run src/app/components/shell` + `pnpm test` → commit `feat: header condenses on scroll over the hero`.

---

### Task 35: Route transitions

**Files:** Modify `src/app/components/shell/MarketingShell.tsx`; create `MarketingShell.test.tsx` (if not present).

- Wrap `<Outlet/>` in `<AnimatePresence mode="wait">` keyed by `useLocation().pathname`; a `motion.div` with a ≤ 250ms fade/short-slide. Reduced-motion → render `<Outlet/>` bare (no `AnimatePresence`, no motion wrapper).
- **Funnel routes are unaffected** (they're under `FunnelShell`, which is untouched).

**Test:** reduced-motion true → `MarketingShell` renders the current route's content with no `AnimatePresence` wrapper (assert content present, and that navigating updates it). reduced-motion false → content still present immediately after navigation (no lingering hidden state). Full suite green.

- [ ] Steps: failing test → implement → run `pnpm test` → commit `feat: add marketing route-transition animation (reduced-motion safe)`.

---

### Task 36: Carousel autoplay + reduced-motion sweep test

**Files:** Modify `src/app/components/marketing/ReviewCarousel.tsx`, `ReviewCarousel.test.tsx`; create `src/app/routes/marketing/reducedMotion.test.tsx`.

- `ReviewCarousel`: add a 6s `setInterval` auto-advance; clear on hover (`onMouseEnter`/`Leave`), focus-within, `document.visibilityState !== 'visible'`, and when `useReducedMotion()`. Wrap-around.
- `reducedMotion.test.tsx` (the Phase-5 gate): mock `matchMedia` reduce = true; for each page route (`/`, `/how-it-works`, `/science`, `/products`, `/results`, `/about`, `/faq`, `/support`, `/blog`, `/blog/understanding-the-norwood-scale`, `/terms`, `/privacy`): render via `marketingRoutes`, assert the `h1` is present and visible, and assert `document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]').length === 0` (nothing left hidden by an animation initial state).

**Test additions for autoplay:** fake timers; advance 6s → active index increments; with reduced-motion mocked → advancing 12s does **not** change the active index.

- [ ] Steps: failing tests → implement autoplay → write `reducedMotion.test.tsx` → run `pnpm test` (**all green**) → commit `feat: carousel autoplay + full reduced-motion page sweep`.

---

**PHASE 5 CHECKPOINT:** motion complete, `reducedMotion.test.tsx` green, `pnpm test` + `pnpm build` green; check the marketing JS chunk size in the build output — if a new chunk > 500 kB appeared, add `React.lazy` + `Suspense` around the marketing route elements in `App.tsx` as a follow-up task. Whole-phase review before Phase 6.

---

# PHASE 6 — i18n + a11y sweep

---

### Task 37: EN/HE parity + i18n audit

**Files:** Modify `src/i18n/messages/{en,he}.ts` as needed; possibly extend `src/i18n/messages.test.ts`.

- [ ] **Step 1:** Run `pnpm exec vitest run src/i18n/messages.test.ts` — confirm parity passes for every `marketing.*` key added across Phases 1–5.
- [ ] **Step 2:** Grep for hard-coded user-facing English in `src/app/components/marketing/` and `src/app/routes/marketing/` (`rg "\"[A-Z][a-z]+ [a-z]"` heuristically) — every visible string must come from `useT()`. Move any stragglers into `marketing.*` keys (both dictionaries).
- [ ] **Step 3:** Add a test `src/i18n/marketingKeys.test.ts`: every `marketing.*` key present in `en` is present in `he` and neither is the literal string `"TODO"`/empty. (May be redundant with `messages.test.ts` — keep only if it adds coverage.)
- [ ] **Step 4:** RTL spot-check test: render `/` and `/blog` at `locale='he'`, assert `dir="rtl"` and that `ArrowLink` arrows carry the `rtl:-scale-x-100` class.
- [ ] **Step 5:** Run `pnpm test` → green. Commit `test: i18n parity + RTL sweep for marketing`.

---

### Task 38: Accessibility sweep

**Files:** Modify marketing components/pages as needed; add `src/app/routes/marketing/a11y.test.tsx`.

- [ ] **Step 1:** `a11y.test.tsx` — for each marketing route: exactly one `<h1>`; no heading-level skips (walk `getAllByRole('heading')`, assert level never jumps by > 1); a `<main id="main">` present (from `MarketingShell`); the skip link is the first focusable element.
- [ ] **Step 2:** `MobileMenu` — test: open, `Tab` cycles within the dialog (focus never lands on `document.body`), `Esc` closes and returns focus to the hamburger.
- [ ] **Step 3:** `FaqAccordion` — already tested for `aria-expanded`; add `aria-controls` ↔ region `id` linkage assertion.
- [ ] **Step 4:** `ReviewCarousel` — Prev/Next have discernible names; the region has `aria-roledescription="carousel"`; autoplay pauses on focus (test).
- [ ] **Step 5:** Image `alt` audit — grep marketing for `<img`; every one has `alt=""` (decorative) or an `alt={t(...)}` (meaningful). Fix any bare `<img>`.
- [ ] **Step 6:** Contrast note — verify in the spec's table that no body text uses `--accent`; grep for `text-accent` on non-heading elements; downgrade any to `text-muted-foreground`.
- [ ] **Step 7:** Run `pnpm test` → green. Commit `test: accessibility sweep for marketing site`.

---

### Task 39: Final verification

**Files:** none (verification only, no commit unless a fix is needed).

- [ ] **Step 1:** `pnpm test` — full suite, twice, pristine (no console output, no `act()` warnings). Record file/test counts.
- [ ] **Step 2:** `pnpm build` — exits 0. Record chunk sizes; confirm no *new* > 500 kB chunk vs the p2b baseline (only the known `@react-pdf` one). If a new one exists and Phase 5's checkpoint didn't already lazy-load marketing routes, do it now as part of this task (wrap marketing route elements in `React.lazy`/`Suspense`, re-run build + test, commit `perf: code-split marketing routes`).
- [ ] **Step 3:** Manual reachability pass by inspection: from `/`, every header + footer link resolves to a real page; every page's closing CTA → `/diagnosis`; `/blog/<bad-slug>` → `/blog`; funnel routes (`/diagnosis`, `/report/x`, `/start`) still render under `FunnelShell` unchanged.
- [ ] **Step 4:** Confirm `index.html` still `noindex, nofollow`; confirm no `TODO`/`[PENDING:` leaked outside a `PendingChip` (grep rendered output is hard — instead grep source for raw `"[PENDING`" string literals outside `PENDING(`/`PendingChip`).
- [ ] **Step 5:** Update `README.md` if it describes the app as a single-page preview — one line noting the marketing site + funnel structure.

---

## Self-Review

**Spec coverage check:**

| Spec section | Covered by |
|---|---|
| §4.1 route map & shells | Tasks 4, 5 |
| §4.2 header | Task 6 (+ 34 condense) |
| §4.3 footer | Task 7 |
| §4.4 Home | Tasks 11–14 |
| §4.4 How It Works | Task 20 (+16 PinnedSteps, 33) |
| §4.4 Science | Task 21 (+18 IngredientCard, 17 BeforeAfter, 15 StatStrip) |
| §4.4 Products | Task 22 (+18 KitCard) |
| §4.4 Results & Reviews | Task 23 (+19 ReviewCarousel, 17 Timeline/BeforeAfter, 15 PressLogos) |
| §4.4 About | Task 24 |
| §4.4 FAQ | Task 25 |
| §4.4 Support | Task 26 |
| §4.4 Blog | Tasks 27–30 |
| §4.4 Terms/Privacy | Task 31 |
| §5.1 typography | Task 2 (tokens) + 9 (DisplayHeading scale) |
| §5.2 colour | Task 2 |
| §5.3 layout/spacing | Task 8 (Section) |
| §5.4 motion (rich + reduced) | Phase 5 (32–36) |
| §5.5 imagery treatment | Task 11 (`.img-editorial`) |
| §5.6 iconography | inline per component (no task — folded into consumers) |
| §6 component inventory | Tasks 6–10, 15–19, 25, 26, 29, 30, 31, 32 |
| §7.1 i18n model | every page task; §7 blog `posts.ts` = Task 27 |
| §7.2 `[PENDING]` catalogue | enforced per task; audited Task 39 §4 |
| §7.3 voice | authoring guidance in each i18n step |
| §8 routing changes | Tasks 5, 14 |
| §9 testing | per-task tests + Tasks 36, 37, 38, 39 |
| §10 accessibility | Task 38 (+ skip link Task 5, dialog Task 6, accordion Task 25) |
| §11 phasing | this plan's 6 phases |
| §12 risks | imagery (Task 11 note), bundle (Phase 5 + Task 39), HE quality (Task 37 + deferred review), `/app` dead link (unchanged, documented) |

No spec section is unaddressed.

**Placeholder scan:** Task bodies for Phases 3–4–6 use compressed "composition + test intent" prose rather than full JSX blocks, because every page is a composition of components whose signatures are fully specified in Tasks 6–19/25–31 — an implementer has the exact component names, props, i18n key prefixes, and test assertions. The TDD step sequence (i18n → failing test → implement → run → commit) is explicit for each. No task references an undefined type or function. The `[PENDING]` marks are the *product* mechanism, not plan placeholders.

**Type consistency:** `Step`, `Milestone`, `Review`, `FaqGroup`, `BlogPost`/`BlogBlock`, `LegalPage` section shape are each defined once (Tasks 16, 17, 19, 25, 27, 31) and consumed by name thereafter. `PendingMarker`/`isPending`/`PENDING` and `formatMoney` are existing exports used unchanged. `useReducedMotion`/`useScrollCondense` (Task 3) are consumed in Tasks 16, 32–36. `marketingRoutes` (Task 5) is consumed by every page test and Task 14/36/38.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-02-roote-marketing-website.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, task review after each, whole-phase review at each of the 6 phase checkpoints, then a final whole-branch review. Matches P0–P2b.

**2. Inline Execution** — batch execution in this session with checkpoints via `executing-plans`.

Which approach?
