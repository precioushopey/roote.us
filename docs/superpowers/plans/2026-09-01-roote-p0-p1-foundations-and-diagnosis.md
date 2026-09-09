# ROOTÉ P0–P1: Foundations & Diagnosis Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repurpose this Figma Make repo into the ROOTÉ web app and build the complete free-diagnosis flow (intro → gender → hair photos → combined AI-analysis + questionnaire → analysis-ready + email capture) that ends on a persisted `HairAnalysis` and a `reportId`.

**Architecture:** A React 18 + Vite 6 SPA. `react-router` 7 data router. A hand-rolled typed i18n layer (Hebrew default, RTL) and one `sessionStore` context with a localStorage + IndexedDB persistence layer. A single content config (`roote.config.ts`) is the source of truth for every stat/price/claim; unresolved values render as visible `[PENDING: …]`. The diagnosis analysis is a **pure deterministic function** (`deriveAnalysis`) that maps gender + 5 answers to analysis *keys*; all copy resolves through i18n.

**Tech Stack:** Vite 6.3.5, React 18.3.1, react-router 7.13.0, Tailwind CSS v4 (no config file), shadcn/ui primitives (already in repo), Vitest + Testing Library + jsdom, `fake-indexeddb` for tests.

**Spec:** `docs/superpowers/specs/2026-09-01-roote-diagnosis-report-app-design.md` — read it alongside this plan. This plan implements **P0 (Foundations)** and **P1 (Diagnosis flow)** from spec §14. P2a (report + PDF), P2b (account + payment), and P2c (post-purchase app) get their own plans after P1 is reviewed.

## Global Constraints

Every task's requirements implicitly include this section.

- **Vite is pinned to `6.3.5`** via `pnpm.overrides` — never change or upgrade it.
- **React and React DOM are exactly `18.3.1`** — move them from optional `peerDependencies` into real `dependencies`; do not bump.
- **No `tsconfig.json`, no typechecking step ever.** `.tsx`/`.ts` are type-stripped by esbuild via `@vitejs/plugin-react`. Types in source are documentation for humans only. Do not add `typescript`, `tsc`, or any "typecheck" script.
- **Keep `vite.config.ts` plugins** `figmaAssetResolver()`, `react()`, `tailwindcss()` — the comment says Make requires them; do not remove. Keep the `@` → `./src` alias. Never add `.css`, `.ts`, or `.tsx` to `assetsInclude`.
- **Tailwind v4, no config.** No `tailwind.config.*`, no `postcss.config` changes (`postcss.config.mjs` stays empty). Style with utility classes. Use **logical properties** for RTL safety: `ps-`/`pe-`/`ms-`/`me-`, `text-start`/`text-end`, `start-0`/`end-0`, and `rtl:`/`ltr:` variants where no logical form exists.
- **Imports:** shared primitives from `@/app/components/ui/*`; `cn()` from `@/app/components/ui/utils`. Use the `@/` alias for all `src` imports.
- **Default locale is `he` with `dir="rtl"`.** English is a toggle. Persist the choice to `localStorage['roote.locale']`.
- **Brand tokens (exact):** background Ivory `#F9F6EF`; foreground `#2A2320`; card `#FFFFFF`; primary Gray Brown `#745F50` (foreground `#F9F6EF`); accent Gray Orange `#8D7766` (foreground `#F9F6EF`); secondary `#F0E3D3` (Cream); muted `#EFE7DA` (muted-foreground `#6E635A`); border/input `#E4D9C8`; ring `#8D7766`; radius `0.5rem`.
- **Fonts (Google Fonts):** Libre Franklin `400;500;600;700` (Latin display + text), DM Sans `400;500` (secondary), Heebo `400;500;700` (Hebrew).
- **No invented medical or efficacy content.** Any number/claim the client has not supplied is literal `null` in `roote.config.ts` and renders as `[PENDING: <label>]`. Never substitute a plausible figure. The formula (`Minoxidil 10%`, `Finasteride 0.1%`, `Azelaic Acid 5.0%`, `ABN Complex™ 0.8%`) is stored with `status: 'proposed'`.
- **`src/domain/**` is pure:** no imports of React, the DOM, storage, or i18n message text. Pure functions with typed inputs/outputs.
- **IDs** use `crypto.randomUUID()`. No `uuid`/`nanoid` dependency.
- **TDD, every task:** write the failing test → run it and see it fail → minimal implementation → run it and see it pass → commit. One logical change per commit. Conventional Commits (`feat:`, `test:`, `chore:`, `refactor:`, `style:`). Do not add `--no-verify`.
- **Test commands:** `pnpm test` (= `vitest run`), `pnpm test:watch`. Run a single file with `pnpm exec vitest run <path>`.

---

## File structure (P0–P1)

```
.gitignore                                   (create)
package.json                                 (modify: deps + scripts)
vite.config.ts                               (modify: add `test` block)
index.html                                   (modify: title/meta/lang/dir)
src/main.tsx                                  (unchanged)
src/styles/fonts.css                          (rewrite)
src/styles/theme.css                          (rewrite)
src/styles/tokens.ts                          (create: JS-side palette)
src/test/setup.ts                             (create: jsdom stubs + jest-dom + fake-indexeddb)

src/content/roote.config.ts                   (create: single source of truth)
src/content/pending.ts                        (create: collectPending, PendingItem)
src/content/pending.test.ts

src/i18n/messages/en.ts                        (create)
src/i18n/messages/he.ts                        (create)
src/i18n/messages/index.ts                     (create: messages map + Locale type)
src/i18n/messages.test.ts                      (en/he key parity)
src/i18n/LocaleProvider.tsx                    (create: context, t(), dir, persistence)
src/i18n/LocaleProvider.test.tsx

src/store/persistence.ts                       (create: localStorage + IndexedDB blob wrapper)
src/store/persistence.test.ts
src/store/sessionStore.tsx                     (create: context, reducer, hydrate, persist)
src/store/sessionStore.test.tsx

src/app/components/brand/Wordmark.tsx           (create)
src/app/components/brand/LocaleToggle.tsx       (create)
src/app/components/brand/PendingChip.tsx        (create)
src/app/components/brand/ProgressRail.tsx       (create)
src/app/components/brand/brand.test.tsx

src/app/components/ShopBanner.tsx               (delete)
src/app/components/ShopLogo.tsx                 (delete)
src/app/App.tsx                                 (rewrite: providers + router)
src/app/routes/landing/Landing.tsx              (create)
src/app/routes/landing/Landing.test.tsx
src/app/routes/report/ReportPlaceholder.tsx     (create: temporary, replaced in P2a)

src/domain/analysis/types.ts                    (create)
src/domain/analysis/deriveAnalysis.ts           (create: pure)
src/domain/analysis/deriveAnalysis.test.ts

src/app/routes/diagnosis/DiagnosisLayout.tsx     (create)
src/app/routes/diagnosis/guards.ts               (create)
src/app/routes/diagnosis/guards.test.tsx
src/app/routes/diagnosis/IntroStep.tsx           (create)
src/app/routes/diagnosis/GenderStep.tsx          (create)
src/app/routes/diagnosis/PhotosStep.tsx          (create)
src/app/routes/diagnosis/AnalyzingStep.tsx       (create)
src/app/routes/diagnosis/ReadyStep.tsx           (create)
src/app/routes/diagnosis/diagnosis.test.tsx      (full-flow navigation test)

src/app/components/diagnosis/downscaleImage.ts    (create: computeDownscaledSize + downscaleImage)
src/app/components/diagnosis/downscaleImage.test.ts
src/app/components/diagnosis/PhotoUpload.tsx       (create)
src/app/components/diagnosis/PhotoUpload.test.tsx
src/app/components/diagnosis/questions.ts          (create: the 5 questions data)
src/app/components/diagnosis/QuestionCard.tsx      (create)
src/app/components/diagnosis/QuestionCard.test.tsx
src/app/components/diagnosis/AnalyzingStrip.tsx    (create)
src/app/components/diagnosis/AnalyzingStrip.test.tsx
```

---

# PHASE P0 — FOUNDATIONS

### Task 1: Initialize version control

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Confirm not already a repo**

Run: `git rev-parse --is-inside-work-tree`
Expected: fails with "not a git repository". If it succeeds, skip to Step 4.

- [ ] **Step 2: Initialize**

```bash
git init
git config core.autocrlf false
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
node_modules/
dist/
*.local
.DS_Store
Thumbs.db
coverage/
.vite/
*.log
```

- [ ] **Step 4: Baseline commit**

```bash
git add -A
git commit -m "chore: baseline commit of Figma Make export before ROOTÉ repurposing"
```

Expected: commit succeeds; `git log --oneline` shows one commit.

---

### Task 2: Dependencies & test scripts

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `pnpm test` / `pnpm test:watch` scripts; `react`/`react-dom` as real deps; dev deps `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `fake-indexeddb`.

- [ ] **Step 1: Move React into real dependencies**

In `package.json`, add to `"dependencies"` (keep the existing `"peerDependencies"` / `"peerDependenciesMeta"` blocks untouched):

```json
"react": "18.3.1",
"react-dom": "18.3.1",
```

`react-router` `7.13.0` is already in `dependencies` — leave it.

- [ ] **Step 2: Add dev dependencies and scripts**

Add scripts:

```json
"scripts": {
  "build": "vite build",
  "dev": "vite",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Install**

```bash
pnpm add react@18.3.1 react-dom@18.3.1
pnpm add -D vitest@^3 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/user-event@^14 @testing-library/jest-dom@^6 jsdom@^25 fake-indexeddb@^6
```

Expected: install completes. `pnpm why vite` still shows `6.3.5`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add React as direct dep, add Vitest + Testing Library"
```

---

### Task 3: Wire the test runner

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`

**Interfaces:**
- Produces: a working `vitest` config (`jsdom`, globals, setup file). `src/test/setup.ts` stubs `matchMedia`, `URL.createObjectURL`, `URL.revokeObjectURL`, `scrollTo`, and loads `fake-indexeddb/auto` + `@testing-library/jest-dom/vitest`.

- [ ] **Step 1: Write the smoke test**

`src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('test runner', () => {
  it('runs and has jsdom', () => {
    expect(typeof document).toBe('object');
    expect(document.createElement('div')).toBeTruthy();
  });

  it('has fake IndexedDB', () => {
    expect(typeof indexedDB).toBe('object');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm test`
Expected: FAIL — no test config / `indexedDB is not defined`.

- [ ] **Step 3: Add the setup file**

`src/test/setup.ts`:

```ts
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
}

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
```

- [ ] **Step 4: Add the `test` block to `vite.config.ts`**

Add `/// <reference types="vitest/config" />` as the very first line, then add a `test` key to the config object returned by `defineConfig` (a sibling of `plugins`, `resolve`, `assetsInclude`):

```ts
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
```

Do not touch `plugins`, `resolve`, or `assetsInclude`.

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm test`
Expected: PASS — 2 tests in `src/test/smoke.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/test/setup.ts src/test/smoke.test.ts
git commit -m "test: wire Vitest with jsdom, jest-dom, fake-indexeddb"
```

---

### Task 4: Brand tokens & fonts

**Files:**
- Rewrite: `src/styles/fonts.css`
- Rewrite: `src/styles/theme.css`
- Create: `src/styles/tokens.ts`
- Create: `src/styles/tokens.test.ts`
- Modify: `index.html`

**Interfaces:**
- Produces: `src/styles/tokens.ts` exporting `const palette` with the exact brand hex values (consumed later by the PDF renderer and any canvas/SVG work).

- [ ] **Step 1: Write the tokens test**

`src/styles/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { palette } from './tokens';

describe('palette', () => {
  it('exposes the exact brand hex values', () => {
    expect(palette).toMatchObject({
      background: '#F9F6EF',
      foreground: '#2A2320',
      primary: '#745F50',
      accent: '#8D7766',
      secondary: '#F0E3D3',
      border: '#E4D9C8',
    });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/styles/tokens.test.ts`
Expected: FAIL — cannot find `./tokens`.

- [ ] **Step 3: Create `src/styles/tokens.ts`**

```ts
/** JS-side mirror of the CSS custom properties in theme.css. Keep in sync by hand. */
export const palette = {
  background: '#F9F6EF',   // Ivory
  foreground: '#2A2320',
  card: '#FFFFFF',
  primary: '#745F50',      // Gray Brown
  primaryForeground: '#F9F6EF',
  accent: '#8D7766',       // Gray Orange
  accentForeground: '#F9F6EF',
  secondary: '#F0E3D3',    // Cream
  muted: '#EFE7DA',
  mutedForeground: '#6E635A',
  border: '#E4D9C8',
  ring: '#8D7766',
} as const;

export const fonts = {
  sans: "'Libre Franklin', 'Heebo', system-ui, sans-serif",
  secondary: "'DM Sans', 'Heebo', sans-serif",
} as const;
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/styles/tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Rewrite `src/styles/fonts.css`**

Replace the whole file with:

```css
@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&family=DM+Sans:wght@400;500&family=Heebo:wght@400;500;700&display=swap');
```

- [ ] **Step 6: Rewrite `src/styles/theme.css`**

Keep the file's existing structure (`@custom-variant dark`, a `:root` block, a `.dark` block, the `@theme inline` mapping, the `@layer base` block). Replace only the **values** in `:root` and add the font variables. Target `:root`:

```css
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;
  --font-sans: 'Libre Franklin', 'Heebo', system-ui, sans-serif;
  --font-secondary: 'DM Sans', 'Heebo', sans-serif;

  --background: #f9f6ef;
  --foreground: #2a2320;
  --card: #ffffff;
  --card-foreground: #2a2320;
  --popover: #ffffff;
  --popover-foreground: #2a2320;
  --primary: #745f50;
  --primary-foreground: #f9f6ef;
  --secondary: #f0e3d3;
  --secondary-foreground: #2a2320;
  --muted: #efe7da;
  --muted-foreground: #6e635a;
  --accent: #8d7766;
  --accent-foreground: #f9f6ef;
  --destructive: #b3261e;
  --destructive-foreground: #ffffff;
  --border: #e4d9c8;
  --input: #e4d9c8;
  --input-background: #ffffff;
  --switch-background: #cbbfae;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: #8d7766;
  --chart-1: #8d7766;
  --chart-2: #745f50;
  --chart-3: #a89a86;
  --chart-4: #c4b8a4;
  --chart-5: #5b4a3d;
  --radius: 0.5rem;
  --sidebar: #f4efe4;
  --sidebar-foreground: #2a2320;
  --sidebar-primary: #745f50;
  --sidebar-primary-foreground: #f9f6ef;
  --sidebar-accent: #efe7da;
  --sidebar-accent-foreground: #2a2320;
  --sidebar-border: #e4d9c8;
  --sidebar-ring: #8d7766;
}
```

Keep the existing `.dark` block as-is for now (out of scope this phase). In `@layer base`, add `font-family: var(--font-sans);` to the `body` rule and keep everything else. Leave `@theme inline` untouched (it already maps `--color-*` from these variables; add `--font-sans` / `--font-secondary` mappings if the block maps fonts — if it does not, leave it).

- [ ] **Step 7: Update `index.html`**

- `<html lang="en">` → `<html lang="he" dir="rtl">`
- `<title>Design Etsy Shop Branding</title>` → `<title>ROOTÉ — אבחון שיער חינם</title>`
- Replace the `<meta name="description" ...>` content with: `ROOTÉ — Personalized Hair Growth System. Free AI hair analysis and a treatment plan built for you.`
- Keep `<meta name="robots" content="noindex, nofollow" />` and the inline `<style>`.

- [ ] **Step 8: Verify build still works**

Run: `pnpm build`
Expected: build succeeds, `dist/` produced. (It builds the current `App.tsx`, which still renders the Etsy page — that's fine; Task 5 replaces it.)

- [ ] **Step 9: Commit**

```bash
git add src/styles/fonts.css src/styles/theme.css src/styles/tokens.ts src/styles/tokens.test.ts index.html
git commit -m "feat: replace Etsy theme with ROOTÉ brand tokens and fonts"
```

---

### Task 5: Remove Etsy source; minimal app shell + landing route

**Files:**
- Delete: `src/app/components/ShopBanner.tsx`, `src/app/components/ShopLogo.tsx`
- Rewrite: `src/app/App.tsx`
- Create: `src/app/routes/landing/Landing.tsx`
- Create: `src/app/routes/landing/Landing.test.tsx`

**Interfaces:**
- Produces: `App` default export mounting a `createBrowserRouter` with route `/` → `Landing`. `Landing` renders an `<h1>` containing "ROOTÉ" and a link with `href="/diagnosis"`.
- Consumes: nothing yet (providers are added in Task 12).

- [ ] **Step 1: Write the Landing test**

`src/app/routes/landing/Landing.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Landing } from './Landing';

function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: '/', element: <Landing /> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('Landing', () => {
  it('shows the ROOTÉ wordmark and a diagnosis CTA', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: /ROOTÉ/ })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /diagnosis|אבחון/i });
    expect(cta).toHaveAttribute('href', '/diagnosis');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/landing/Landing.test.tsx`
Expected: FAIL — cannot find `./Landing`.

- [ ] **Step 3: Create `Landing.tsx`**

```tsx
import { Link } from 'react-router';

export function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
        Personalized Hair Growth System
      </p>
      <h1 className="text-5xl sm:text-6xl" style={{ fontFamily: "'Libre Franklin', serif", letterSpacing: '0.06em' }}>
        ROOTÉ
      </h1>
      <Link
        to="/diagnosis"
        className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm"
      >
        Start Free Diagnosis · אבחון שיער חינם
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Delete the Etsy components and rewrite `App.tsx`**

```bash
git rm src/app/components/ShopBanner.tsx src/app/components/ShopLogo.tsx
```

`src/app/App.tsx` (full replacement — providers are layered in later tasks):

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Landing } from './routes/landing/Landing';

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/landing/Landing.test.tsx`
Expected: PASS.

- [ ] **Step 6: Verify dev + build**

Run: `pnpm build`
Expected: succeeds. Optionally `pnpm dev` and confirm the page shows the ROOTÉ wordmark on the Ivory background.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: remove Etsy source, add router shell and minimal landing"
```

---

### Task 6: Content config + PENDING scanner

**Files:**
- Create: `src/content/roote.config.ts`
- Create: `src/content/pending.ts`
- Create: `src/content/pending.test.ts`

**Interfaces:**
- Produces:
  - `rooteContent` — typed config object (see spec §4.6).
  - `type PendingItem = { path: string; label: string }`.
  - `isPending(v: unknown): v is { __pending: true; label: string }`.
  - `PENDING(label: string): { __pending: true; label: string }`.
  - `collectPending(node: unknown, basePath?: string): PendingItem[]` — walks an object/array, returns one `PendingItem` per `null` value **and** per `{__pending:true}` marker, with a dotted `path`.
  - `KNOWN_PENDING: string[]` — the labels expected to be unresolved today (pricing ×5, effectiveness, timeToVisibleResults, rescanWindow, doctorFollowUpCost, currency placeholder note).

- [ ] **Step 1: Write the test**

`src/content/pending.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { rooteContent } from './roote.config';
import { collectPending, isPending, PENDING } from './pending';

describe('PENDING helpers', () => {
  it('PENDING() makes a recognisable marker', () => {
    const m = PENDING('pricing — 180 days');
    expect(isPending(m)).toBe(true);
    expect(m.label).toBe('pricing — 180 days');
  });

  it('collectPending finds nulls with dotted paths', () => {
    const found = collectPending({ a: { b: null }, c: [1, null] });
    expect(found.map((f) => f.path)).toEqual(['a.b', 'c.1']);
  });

  it('collectPending finds explicit markers', () => {
    const found = collectPending({ x: PENDING('effectiveness %') });
    expect(found).toEqual([{ path: 'x', label: 'effectiveness %' }]);
  });
});

describe('roote.config', () => {
  it('has all five program durations', () => {
    expect(rooteContent.programDurations.map((d) => d.days)).toEqual([90, 120, 180, 270, 360]);
  });

  it('stores the proposed formula with proposed status, no public percentages by default', () => {
    expect(rooteContent.formula.displayPercentagesPublicly).toBe(false);
    expect(rooteContent.formula.ingredients.map((i) => i.name)).toEqual([
      'Minoxidil', 'Finasteride', 'Azelaic Acid', 'ABN Complex™',
    ]);
    expect(rooteContent.formula.ingredients.every((i) => i.status === 'proposed')).toBe(true);
  });

  it('every price and headline claim is unresolved (null) — none invented', () => {
    const pending = collectPending(rooteContent).map((p) => p.path);
    expect(pending).toEqual(expect.arrayContaining([
      'programDurations.0.price',
      'programDurations.2.price',
      'programDurations.4.price',
      'claims.effectiveness.value',
      'claims.timeToVisibleResults.value',
      'claims.rescanWindow.value',
      'claims.doctorFollowUpCost.value',
    ]));
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/content/pending.test.ts`
Expected: FAIL — cannot find `./roote.config` / `./pending`.

- [ ] **Step 3: Create `src/content/pending.ts`**

```ts
export type PendingMarker = { __pending: true; label: string };
export type PendingItem = { path: string; label: string };

export const PENDING = (label: string): PendingMarker => ({ __pending: true, label });

export function isPending(v: unknown): v is PendingMarker {
  return typeof v === 'object' && v !== null && (v as PendingMarker).__pending === true;
}

export function collectPending(node: unknown, basePath = ''): PendingItem[] {
  if (isPending(node)) return [{ path: basePath, label: node.label }];
  if (node === null) return [{ path: basePath, label: basePath || 'value' }];
  if (Array.isArray(node)) {
    return node.flatMap((child, i) =>
      collectPending(child, basePath ? `${basePath}.${i}` : String(i)));
  }
  if (typeof node === 'object') {
    return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) =>
      collectPending(v, basePath ? `${basePath}.${k}` : k));
  }
  return [];
}
```

- [ ] **Step 4: Create `src/content/roote.config.ts`**

Use the schema from spec §4.6 verbatim. Every unsupplied number is `null`. Include (abbreviated here — write it out in full):

```ts
export type LocalizedText = { en: string; he: string };

export const rooteContent = {
  brand: {
    name: 'ROOTÉ',
    domain: 'ROOTÉ.US',
    tagline: { en: 'Personalized Hair Growth System', he: 'מערכת אישית לצמיחת שיער' } as LocalizedText,
  },

  currency: 'ILS', // TODO: confirm with client — ILS vs USD

  formula: {
    status: 'pending-regulatory-review',
    displayPercentagesPublicly: false, // TODO: confirm with client (regulatory)
    ingredients: [
      { key: 'minoxidil',   name: 'Minoxidil',    percentage: 10.0, role: 'regrowth-stimulant',    status: 'proposed' },
      { key: 'finasteride', name: 'Finasteride',  percentage: 0.1,  role: 'dht-blocker',           status: 'proposed' },
      { key: 'azelaic',     name: 'Azelaic Acid', percentage: 5.0,  role: 'dht-support',           status: 'proposed' },
      { key: 'abn',         name: 'ABN Complex™', percentage: 0.8,  role: 'proprietary-support',  status: 'proposed' },
    ],
  },

  treatments: {
    core: [
      {
        key: 'roote-topical',
        name: { en: 'ROOTÉ Topical Formula', he: 'תרחיף ROOTÉ לקרקפת' } as LocalizedText, // TODO: confirm medical HE
        form: 'topical' as const,
        usageKey: 'usage.apply-scalp-affected',
        frequencyKey: 'frequency.twice-daily',
        appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
      },
    ],
    supporting: [
      // TODO: confirm with client — identity of the supporting treatment(s)
      { key: 'derma-stim', name: { en: 'Scalp stimulation routine', he: '' } as LocalizedText, usageKey: 'usage.derma-stim', frequencyKey: 'frequency.weekly' },
      { key: 'cleanser',   name: { en: 'Gentle scalp cleanser',     he: '' } as LocalizedText, usageKey: 'usage.cleanse',    frequencyKey: 'frequency.daily' },
    ],
  },

  programDurations: [
    { days: 90,  key: 'd90',  price: null, perDayFrom: null },
    { days: 120, key: 'd120', price: null, perDayFrom: null },
    { days: 180, key: 'd180', price: null, perDayFrom: null },
    { days: 270, key: 'd270', price: null, perDayFrom: null },
    { days: 360, key: 'd360', price: null, perDayFrom: null },
  ],

  claims: {
    effectiveness:        { value: null, footnoteKey: 'footnote.effectiveness-source' },
    timeToVisibleResults: { value: null, footnoteKey: 'footnote.results-timing-source' },
    rescanWindow:         { value: null, footnoteKey: null },
    doctorFollowUpCost:   { value: null, footnoteKey: null }, // TODO: confirm ROOTÉ offers follow-ups
  },

  recommendedDurationTable: {
    'mild:stabilize': 120,        'mild:regrow': 180,        'mild:stabilize-regrow': 180,
    'moderate:stabilize': 180,    'moderate:regrow': 270,    'moderate:stabilize-regrow': 270,
    'established:stabilize': 270, 'established:regrow': 360,  'established:stabilize-regrow': 360,
  } as Record<string, 90 | 120 | 180 | 270 | 360>,

  reorderLeadDays: 21, // TODO: confirm with client

  disclaimers: {
    medical:        { en: 'This report is a preliminary, photo-based visual assessment. It is not a medical diagnosis.', he: '' } as LocalizedText, // TODO: legal + HE review
    notADiagnosis:  { en: 'An AI visual estimate, not a medical diagnosis.', he: '' } as LocalizedText,
    demo:           { en: 'Demo — analysis figures are illustrative; production integrates hairhealth.ai.', he: 'הדגמה — הנתונים להמחשה בלבד.' } as LocalizedText,
    formulaPending: { en: 'Formulation under evaluation, pending regulatory review.', he: 'הפורמולה בבחינה, בכפוף לאישור רגולטורי.' } as LocalizedText,
  },
} as const;
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/content/pending.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/
git commit -m "feat: add roote.config content source of truth and PENDING scanner"
```

---

### Task 7: i18n messages + key parity

**Files:**
- Create: `src/i18n/messages/en.ts`
- Create: `src/i18n/messages/he.ts`
- Create: `src/i18n/messages/index.ts`
- Create: `src/i18n/messages.test.ts`

**Interfaces:**
- Produces:
  - `en` / `he` — `Record<string, string>` dictionaries.
  - `messages = { en, he }`.
  - `type Locale = 'en' | 'he'`.
  - `type MessageKey = keyof typeof en`.
  - `DEFAULT_LOCALE: Locale = 'he'`.

- [ ] **Step 1: Write the parity test**

`src/i18n/messages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { en } from './messages/en';
import { he } from './messages/he';

describe('i18n dictionaries', () => {
  it('en and he have identical key sets', () => {
    const enKeys = Object.keys(en).sort();
    const heKeys = Object.keys(he).sort();
    expect(heKeys).toEqual(enKeys);
  });

  it('no value is an empty string', () => {
    for (const [k, v] of Object.entries(en)) expect(v, `en.${k}`).not.toBe('');
    for (const [k, v] of Object.entries(he)) expect(v, `he.${k}`).not.toBe('');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/i18n/messages.test.ts`
Expected: FAIL — cannot find `./messages/en`.

- [ ] **Step 3: Create `src/i18n/messages/en.ts`**

Start with the foundation + landing + generic keys (diagnosis/analysis keys are added in Tasks 14/16–24):

```ts
export const en = {
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.start': 'Start',
  'brand.tagline': 'Personalized Hair Growth System',
  'locale.toggle.toHe': 'עברית',
  'locale.toggle.toEn': 'English',

  'landing.eyebrow': 'Personalized Hair Growth System',
  'landing.cta': 'Start Free Diagnosis',
} as const;

export type MessageKey = keyof typeof en;
```

- [ ] **Step 4: Create `src/i18n/messages/he.ts`**

```ts
import type { MessageKey } from './en';

export const he: Record<MessageKey, string> = {
  'common.continue': 'המשך',
  'common.back': 'חזרה',
  'common.next': 'הבא',
  'common.start': 'התחלה',
  'brand.tagline': 'מערכת אישית לצמיחת שיער',
  'locale.toggle.toHe': 'עברית',
  'locale.toggle.toEn': 'English',

  'landing.eyebrow': 'מערכת אישית לצמיחת שיער',
  'landing.cta': 'אבחון שיער חינם',
};
```

- [ ] **Step 5: Create `src/i18n/messages/index.ts`**

```ts
import { en } from './en';
import { he } from './he';

export type Locale = 'en' | 'he';
export type { MessageKey } from './en';
export const messages = { en, he } as const;
export const DEFAULT_LOCALE: Locale = 'he';
export const LOCALES: Locale[] = ['he', 'en'];
```

- [ ] **Step 6: Run it and watch it pass**

Run: `pnpm exec vitest run src/i18n/messages.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/messages/ src/i18n/messages.test.ts
git commit -m "feat: add typed i18n dictionaries with en/he parity test"
```

---

### Task 8: LocaleProvider

**Files:**
- Create: `src/i18n/LocaleProvider.tsx`
- Create: `src/i18n/LocaleProvider.test.tsx`

**Interfaces:**
- Consumes: `messages`, `Locale`, `MessageKey`, `DEFAULT_LOCALE` from `./messages`.
- Produces:
  - `<LocaleProvider>` — reads `localStorage['roote.locale']` (default `he`) on mount, sets `document.documentElement.lang` + `dir`.
  - `useLocale(): { locale: Locale; dir: 'rtl' | 'ltr'; setLocale(l: Locale): void }`.
  - `useT(): (key: MessageKey, vars?: Record<string, string | number>) => string` — resolves `messages[locale][key]`, falls back to `messages.en[key]`, then to the key string; interpolates `{name}` tokens.

- [ ] **Step 1: Write the test**

`src/i18n/LocaleProvider.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider, useLocale, useT } from './LocaleProvider';

function Probe() {
  const { locale, dir, setLocale } = useLocale();
  const t = useT();
  return (
    <div>
      <span data-testid="loc">{locale}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="cta">{t('landing.cta')}</span>
      <button onClick={() => setLocale('en')}>to-en</button>
    </div>
  );
}

describe('LocaleProvider', () => {
  it('defaults to Hebrew / RTL and sets the document dir', () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    expect(screen.getByTestId('loc')).toHaveTextContent('he');
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByTestId('cta')).toHaveTextContent('אבחון שיער חינם');
  });

  it('switches to English, persists, and updates the document dir', async () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    await userEvent.click(screen.getByText('to-en'));
    expect(screen.getByTestId('loc')).toHaveTextContent('en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(screen.getByTestId('cta')).toHaveTextContent('Start Free Diagnosis');
    expect(localStorage.getItem('roote.locale')).toBe('en');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/i18n/LocaleProvider.test.tsx`
Expected: FAIL — cannot find `./LocaleProvider`.

- [ ] **Step 3: Implement `src/i18n/LocaleProvider.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messages, DEFAULT_LOCALE, type Locale, type MessageKey } from './messages';

const STORAGE_KEY = 'roote.locale';

type Ctx = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

function readStored(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'en' || v === 'he' ? v : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStored);
  const dir = locale === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const table = messages[locale] as Record<string, string>;
      const raw = table[key] ?? (messages.en as Record<string, string>)[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<Ctx>(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useCtx(): Ctx {
  const c = useContext(LocaleContext);
  if (!c) throw new Error('useLocale/useT must be used within <LocaleProvider>');
  return c;
}

export function useLocale() {
  const { locale, dir, setLocale } = useCtx();
  return { locale, dir, setLocale };
}

export function useT() {
  return useCtx().t;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/i18n/LocaleProvider.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/LocaleProvider.tsx src/i18n/LocaleProvider.test.tsx
git commit -m "feat: add LocaleProvider with RTL default and t() helper"
```

---

### Task 9: Persistence layer

**Files:**
- Create: `src/store/persistence.ts`
- Create: `src/store/persistence.test.ts`

**Interfaces:**
- Produces:
  - `lsGet<T>(key: string, fallback: T): T`
  - `lsSet(key: string, value: unknown): void`
  - `lsRemove(key: string): void`
  - `putBlob(id: string, blob: Blob): Promise<void>`
  - `getBlob(id: string): Promise<Blob | undefined>`
  - `deleteBlob(id: string): Promise<void>`
  - All localStorage keys are prefixed `roote.` internally; callers pass the bare key.

- [ ] **Step 1: Write the test**

`src/store/persistence.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { lsGet, lsSet, lsRemove, putBlob, getBlob, deleteBlob } from './persistence';

describe('localStorage helpers', () => {
  it('round-trips JSON with a prefix and honours the fallback', () => {
    expect(lsGet('session', { a: 1 })).toEqual({ a: 1 });
    lsSet('session', { a: 2 });
    expect(lsGet('session', { a: 1 })).toEqual({ a: 2 });
    expect(localStorage.getItem('roote.session')).toBe('{"a":2}');
    lsRemove('session');
    expect(lsGet('session', null)).toBeNull();
  });

  it('returns the fallback on corrupt JSON', () => {
    localStorage.setItem('roote.broken', '{not json');
    expect(lsGet('broken', 'fallback')).toBe('fallback');
  });
});

describe('IndexedDB blob store', () => {
  it('stores, reads, and deletes a blob by id', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    await putBlob('photo-1', blob);
    const got = await getBlob('photo-1');
    expect(got).toBeInstanceOf(Blob);
    expect(await got!.text()).toBe('hello');
    await deleteBlob('photo-1');
    expect(await getBlob('photo-1')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/store/persistence.test.ts`
Expected: FAIL — cannot find `./persistence`.

- [ ] **Step 3: Implement `src/store/persistence.ts`**

```ts
const LS_PREFIX = 'roote.';

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    // Quota or serialization failure — surfaced to callers via console; higher
    // layers (sessionStore) decide what to evict.
    console.warn('[roote] lsSet failed for', key, err);
  }
}

export function lsRemove(key: string): void {
  try { localStorage.removeItem(LS_PREFIX + key); } catch { /* ignore */ }
}

const DB_NAME = 'roote';
const DB_VERSION = 1;
const STORE = 'blobs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export async function putBlob(id: string, blob: Blob): Promise<void> {
  await tx('readwrite', (s) => s.put(blob, id));
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  const result = await tx<Blob | undefined>('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>);
  return result ?? undefined;
}

export async function deleteBlob(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/store/persistence.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/store/persistence.ts src/store/persistence.test.ts
git commit -m "feat: add localStorage + IndexedDB persistence layer"
```

---

### Task 10: sessionStore

**Files:**
- Create: `src/store/sessionStore.tsx`
- Create: `src/store/sessionStore.test.tsx`

**Interfaces:**
- Consumes: `lsGet`, `lsSet` from `./persistence`; `HairAnalysis`, `Gender`, `Answers` from `@/domain/analysis/types` (Task 13 creates this file — **this task depends on Task 13's `types.ts` existing**; do Task 13 first if executing out of order).
- Produces:
  - `type AngleKey = 'front' | 'top' | 'crown' | 'hairline'`
  - `type PhotoRef = { id: string; angleKey: AngleKey; thumb: string; blobId: string }`
  - `type SessionState = { diagnosis: { gender: Gender | null; photos: PhotoRef[]; answers: Partial<Answers> }; analysis: HairAnalysis | null; reportId: string | null; account: { email: string | null }; program: null }`
  - `<SessionProvider>` — hydrates from `localStorage['roote.session']` on mount, persists (photos stored as refs only — blob bytes live in IndexedDB) on every change.
  - `useSession(): SessionState & { setGender; addPhoto; removePhoto; setAnswer; setAnalysis; setReportId; setEmail; reset }`
    - `setGender(g: Gender): void`
    - `addPhoto(p: PhotoRef): void` (replaces any existing photo with the same `angleKey`)
    - `removePhoto(id: string): void`
    - `setAnswer<K extends keyof Answers>(key: K, value: Answers[K]): void`
    - `setAnalysis(a: HairAnalysis): void`
    - `setReportId(id: string): void`
    - `setEmail(email: string): void`
    - `reset(): void`

- [ ] **Step 1: Write the test**

`src/store/sessionStore.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SessionProvider, useSession } from './sessionStore';

let api: ReturnType<typeof useSession>;
function Harness() {
  api = useSession();
  return <span data-testid="gender">{api.diagnosis.gender ?? 'none'}</span>;
}

function setup() {
  render(<SessionProvider><Harness /></SessionProvider>);
}

describe('sessionStore', () => {
  it('starts empty', () => {
    setup();
    expect(screen.getByTestId('gender')).toHaveTextContent('none');
    expect(api.analysis).toBeNull();
    expect(api.reportId).toBeNull();
  });

  it('sets gender and answers, and de-dupes photos by angle', () => {
    setup();
    act(() => api.setGender('male'));
    expect(api.diagnosis.gender).toBe('male');

    act(() => api.setAnswer('q1_area', 'crown'));
    expect(api.diagnosis.answers.q1_area).toBe('crown');

    act(() => api.addPhoto({ id: 'a', angleKey: 'front', thumb: 'x', blobId: 'b1' }));
    act(() => api.addPhoto({ id: 'b', angleKey: 'front', thumb: 'y', blobId: 'b2' }));
    expect(api.diagnosis.photos).toHaveLength(1);
    expect(api.diagnosis.photos[0].id).toBe('b');
  });

  it('persists to localStorage and rehydrates', () => {
    setup();
    act(() => api.setGender('female'));
    act(() => api.setReportId('r-1'));

    // Re-mount a fresh provider — state should come back from storage.
    render(<SessionProvider><Harness /></SessionProvider>);
    expect(api.diagnosis.gender).toBe('female');
    expect(api.reportId).toBe('r-1');
  });

  it('reset clears everything', () => {
    setup();
    act(() => api.setGender('male'));
    act(() => api.reset());
    expect(api.diagnosis.gender).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/store/sessionStore.test.tsx`
Expected: FAIL — cannot find `./sessionStore`.

- [ ] **Step 3: Implement `src/store/sessionStore.tsx`**

```tsx
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';
import type { HairAnalysis, Gender, Answers } from '@/domain/analysis/types';

export type AngleKey = 'front' | 'top' | 'crown' | 'hairline';
export type PhotoRef = { id: string; angleKey: AngleKey; thumb: string; blobId: string };

export type SessionState = {
  diagnosis: { gender: Gender | null; photos: PhotoRef[]; answers: Partial<Answers> };
  analysis: HairAnalysis | null;
  reportId: string | null;
  account: { email: string | null };
  program: null;
};

const EMPTY: SessionState = {
  diagnosis: { gender: null, photos: [], answers: {} },
  analysis: null,
  reportId: null,
  account: { email: null },
  program: null,
};

type Action =
  | { type: 'HYDRATE'; state: SessionState }
  | { type: 'SET_GENDER'; gender: Gender }
  | { type: 'ADD_PHOTO'; photo: PhotoRef }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'SET_ANSWER'; key: keyof Answers; value: Answers[keyof Answers] }
  | { type: 'SET_ANALYSIS'; analysis: HairAnalysis }
  | { type: 'SET_REPORT_ID'; id: string }
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'RESET' };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'SET_GENDER':
      return { ...state, diagnosis: { ...state.diagnosis, gender: action.gender } };
    case 'ADD_PHOTO':
      return {
        ...state,
        diagnosis: {
          ...state.diagnosis,
          photos: [
            ...state.diagnosis.photos.filter((p) => p.angleKey !== action.photo.angleKey),
            action.photo,
          ],
        },
      };
    case 'REMOVE_PHOTO':
      return {
        ...state,
        diagnosis: { ...state.diagnosis, photos: state.diagnosis.photos.filter((p) => p.id !== action.id) },
      };
    case 'SET_ANSWER':
      return {
        ...state,
        diagnosis: { ...state.diagnosis, answers: { ...state.diagnosis.answers, [action.key]: action.value } },
      };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.analysis };
    case 'SET_REPORT_ID':
      return { ...state, reportId: action.id };
    case 'SET_EMAIL':
      return { ...state, account: { email: action.email } };
    case 'RESET':
      return EMPTY;
    default:
      return state;
  }
}

const SessionContext = createContext<
  (SessionState & {
    setGender: (g: Gender) => void;
    addPhoto: (p: PhotoRef) => void;
    removePhoto: (id: string) => void;
    setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
    setAnalysis: (a: HairAnalysis) => void;
    setReportId: (id: string) => void;
    setEmail: (email: string) => void;
    reset: () => void;
  }) | null
>(null);

const STORAGE_KEY = 'session';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY, () => lsGet<SessionState>(STORAGE_KEY, EMPTY));

  useEffect(() => {
    lsSet(STORAGE_KEY, state);
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      setGender: (gender: Gender) => dispatch({ type: 'SET_GENDER', gender }),
      addPhoto: (photo: PhotoRef) => dispatch({ type: 'ADD_PHOTO', photo }),
      removePhoto: (id: string) => dispatch({ type: 'REMOVE_PHOTO', id }),
      setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) =>
        dispatch({ type: 'SET_ANSWER', key, value }),
      setAnalysis: (analysis: HairAnalysis) => dispatch({ type: 'SET_ANALYSIS', analysis }),
      setReportId: (id: string) => dispatch({ type: 'SET_REPORT_ID', id }),
      setEmail: (email: string) => dispatch({ type: 'SET_EMAIL', email }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const c = useContext(SessionContext);
  if (!c) throw new Error('useSession must be used within <SessionProvider>');
  return c;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/store/sessionStore.test.tsx`
Expected: PASS (4 tests). *(Requires `src/domain/analysis/types.ts` from Task 13.)*

- [ ] **Step 5: Commit**

```bash
git add src/store/sessionStore.tsx src/store/sessionStore.test.tsx
git commit -m "feat: add sessionStore with hydrate + persist"
```

---

### Task 11: Brand components

**Files:**
- Create: `src/app/components/brand/Wordmark.tsx`
- Create: `src/app/components/brand/LocaleToggle.tsx`
- Create: `src/app/components/brand/PendingChip.tsx`
- Create: `src/app/components/brand/ProgressRail.tsx`
- Create: `src/app/components/brand/brand.test.tsx`

**Interfaces:**
- Consumes: `useLocale` from `@/i18n/LocaleProvider`; `cn` from `@/app/components/ui/utils`.
- Produces:
  - `<Wordmark className? />` — renders text "ROOTÉ" as an `<span>` (styled, not an image).
  - `<LocaleToggle />` — a `<button>` that flips `he`↔`en` via `useLocale().setLocale`; label is the *other* language's name.
  - `<PendingChip label />` — renders `[PENDING: {label}]` in a visually distinct `<mark>`.
  - `<ProgressRail steps={string[]} current={number} />` — renders `steps.length` segments; the one at `current` has `aria-current="step"`.

- [ ] **Step 1: Write the test**

`src/app/components/brand/brand.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { Wordmark } from './Wordmark';
import { LocaleToggle } from './LocaleToggle';
import { PendingChip } from './PendingChip';
import { ProgressRail } from './ProgressRail';

const wrap = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe('brand components', () => {
  it('Wordmark renders ROOTÉ text', () => {
    wrap(<Wordmark />);
    expect(screen.getByText('ROOTÉ')).toBeInTheDocument();
  });

  it('LocaleToggle flips he -> en', async () => {
    wrap(<><LocaleToggle /><Wordmark /></>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('English'); // default locale is he, so it offers en
    await userEvent.click(btn);
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    expect(btn).toHaveTextContent('עברית');
  });

  it('PendingChip shows the [PENDING: ...] label', () => {
    wrap(<PendingChip label="pricing — 180 days" />);
    expect(screen.getByText('[PENDING: pricing — 180 days]')).toBeInTheDocument();
  });

  it('ProgressRail marks the current step', () => {
    wrap(<ProgressRail steps={['a', 'b', 'c']} current={1} />);
    const current = screen.getByText('b');
    expect(current).toHaveAttribute('aria-current', 'step');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/components/brand/brand.test.tsx`
Expected: FAIL — cannot find `./Wordmark`.

- [ ] **Step 3: Implement the four components**

`Wordmark.tsx`:

```tsx
import { cn } from '@/app/components/ui/utils';

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('select-none', className)}
      style={{ fontFamily: "'Libre Franklin', serif", letterSpacing: '0.08em', fontWeight: 600 }}
    >
      ROOTÉ
    </span>
  );
}
```

`LocaleToggle.tsx`:

```tsx
import { useLocale } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const next = locale === 'he' ? 'en' : 'he';
  const label = next === 'he' ? 'עברית' : 'English';
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className={cn('text-xs underline underline-offset-4 text-muted-foreground', className)}
      aria-label={`Switch language to ${label}`}
    >
      {label}
    </button>
  );
}
```

`PendingChip.tsx`:

```tsx
export function PendingChip({ label }: { label: string }) {
  return (
    <mark className="inline-block rounded border border-dashed border-accent bg-transparent px-1.5 py-0.5 text-xs font-medium text-accent">
      [PENDING: {label}]
    </mark>
  );
}
```

`ProgressRail.tsx`:

```tsx
import { cn } from '@/app/components/ui/utils';

export function ProgressRail({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="progress">
      {steps.map((label, i) => (
        <li
          key={label}
          aria-current={i === current ? 'step' : undefined}
          className={cn(
            'flex-1 rounded-full px-2 py-1 text-center text-[11px]',
            i === current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          {label}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/components/brand/brand.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/components/brand/
git commit -m "feat: add Wordmark, LocaleToggle, PendingChip, ProgressRail"
```

---

### Task 12: Compose the app shell

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/routes/landing/Landing.tsx`
- Create: `src/app/routes/report/ReportPlaceholder.tsx`
- Create: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: `LocaleProvider`, `SessionProvider`, `Landing`, `useT`, `useLocale`.
- Produces: `App` wraps `<RouterProvider>` in `<LocaleProvider><SessionProvider>`. Routes registered so far: `/` → `Landing`, `/report/:reportId` → `ReportPlaceholder`. `Landing` uses `useT()` for its copy and shows `<LocaleToggle/>` + `<Wordmark/>`.
- `ReportPlaceholder` reads `useSession().analysis` and `useParams().reportId`; renders a heading "Report" + the `reportId` + `analysis.stage` when present, and a note that the full report arrives in the next phase. **This file is replaced wholesale in P2a.**

- [ ] **Step 1: Write the test**

`src/app/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App shell', () => {
  it('renders the landing route with localized CTA and a working language toggle', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /ROOTÉ/ })).toBeInTheDocument();
    // default he
    expect(screen.getByRole('link', { name: /אבחון שיער חינם/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Switch language/i }));
    expect(screen.getByRole('link', { name: /Start Free Diagnosis/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/App.test.tsx`
Expected: FAIL — Landing has no toggle / not localized yet.

- [ ] **Step 3: Update `Landing.tsx` to use i18n + brand components**

```tsx
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';

export function Landing() {
  const t = useT();
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">{t('landing.eyebrow')}</p>
        <h1 className="text-5xl sm:text-6xl">
          <Wordmark />
        </h1>
        <Link
          to="/diagnosis"
          className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm"
        >
          {t('landing.cta')}
        </Link>
      </div>
    </main>
  );
}
```

Note: `App.test.tsx` expects the heading name to match `/ROOTÉ/`; `<h1><Wordmark/></h1>` satisfies `getByRole('heading', { name: /ROOTÉ/ })`.

- [ ] **Step 4: Create `ReportPlaceholder.tsx`**

```tsx
import { useParams } from 'react-router';
import { useSession } from '@/store/sessionStore';

export function ReportPlaceholder() {
  const { reportId } = useParams();
  const { analysis } = useSession();
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl mb-4">Report</h1>
      <p className="text-sm text-muted-foreground">Report ID: {reportId}</p>
      {analysis && (
        <p className="text-sm text-muted-foreground">
          Scale {analysis.scale}, stage {analysis.stage}, {analysis.flaggedZones.length} flagged zone(s).
        </p>
      )}
      <p className="mt-6 text-sm">The full personalized report and PDF are built in the next phase (P2a).</p>
    </main>
  );
}
```

- [ ] **Step 5: Rewrite `App.tsx` with providers**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { Landing } from './routes/landing/Landing';
import { ReportPlaceholder } from './routes/report/ReportPlaceholder';

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/report/:reportId', element: <ReportPlaceholder /> },
]);

export default function App() {
  return (
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>
  );
}
```

- [ ] **Step 6: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/App.test.tsx`
Expected: PASS.

- [ ] **Step 7: Full test run + build**

Run: `pnpm test && pnpm build`
Expected: all suites pass; build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: compose app shell with Locale + Session providers"
```

---

# PHASE P1 — DIAGNOSIS FLOW

### Task 13: Analysis types + `deriveAnalysis`

**Files:**
- Create: `src/domain/analysis/types.ts`
- Create: `src/domain/analysis/deriveAnalysis.ts`
- Create: `src/domain/analysis/deriveAnalysis.test.ts`

**Interfaces:**
- Produces (types — consumed by `sessionStore`, later report + app):

```ts
export type Gender = 'male' | 'female';
export type ZoneKey = 'frontal-hairline' | 'temples' | 'mid-scalp' | 'crown-vertex';
export type Level = 'low' | 'medium' | 'high';
export type SeverityBand = 'mild' | 'moderate' | 'established';
export type PlanEmphasis = 'stabilize' | 'regrow' | 'stabilize-regrow';

export type Answers = {
  q1_area: 'hairline' | 'crown' | 'entire-scalp';
  q2_onset: 'lt-1y' | '1-5y' | 'gt-5y';
  q3_prior: 'never' | 'no-success' | 'partial';
  q4_family: 'yes' | 'no' | 'not-sure';
  q5_goal: 'stop' | 'regrow' | 'both';
};

export type HairAnalysis = {
  scale: 'norwood' | 'ludwig';
  stage: number;
  severityBand: SeverityBand;
  flaggedZones: { zone: ZoneKey; severity: 'mild' | 'moderate'; noteKey: string }[];
  densityByZone: { zone: ZoneKey; level: Level }[];
  metrics: { key: string; level: Level }[];
  notes: string[];
  planEmphasis: PlanEmphasis;
  summaryPlainKey: string;
  recommendedDurationDays: 90 | 120 | 180 | 270 | 360;
};
```

- Produces: `deriveAnalysis(input: { gender: Gender; answers: Answers }): HairAnalysis` — **pure**. Also exports `RECOMMENDED_DURATION_TABLE` and `severityFromOnset(onset)`.

- [ ] **Step 1: Write the test**

`src/domain/analysis/deriveAnalysis.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { deriveAnalysis } from './deriveAnalysis';
import type { Answers, Gender } from './types';

const base: Answers = {
  q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both',
};
const run = (gender: Gender, over: Partial<Answers> = {}) =>
  deriveAnalysis({ gender, answers: { ...base, ...over } });

describe('deriveAnalysis', () => {
  it('is pure — same input, deep-equal output', () => {
    expect(run('male')).toEqual(run('male'));
  });

  it('picks the scale from gender', () => {
    expect(run('male').scale).toBe('norwood');
    expect(run('female').scale).toBe('ludwig');
  });

  it('maps onset to severity band and keeps stage within scale bounds', () => {
    expect(run('male', { q2_onset: 'lt-1y' }).severityBand).toBe('mild');
    expect(run('male', { q2_onset: '1-5y' }).severityBand).toBe('moderate');
    expect(run('male', { q2_onset: 'gt-5y' }).severityBand).toBe('established');
    for (const onset of ['lt-1y', '1-5y', 'gt-5y'] as const) {
      const nw = run('male', { q2_onset: onset });
      expect(nw.stage).toBeGreaterThanOrEqual(1);
      expect(nw.stage).toBeLessThanOrEqual(7);
      const lw = run('female', { q2_onset: onset });
      expect(lw.stage).toBeGreaterThanOrEqual(1);
      expect(lw.stage).toBeLessThanOrEqual(3);
    }
  });

  it('flags zones from q1_area', () => {
    expect(run('male', { q1_area: 'hairline' }).flaggedZones.map((z) => z.zone).sort())
      .toEqual(['frontal-hairline', 'temples']);
    expect(run('male', { q1_area: 'crown' }).flaggedZones.map((z) => z.zone))
      .toEqual(['crown-vertex']);
    expect(run('male', { q1_area: 'entire-scalp' }).flaggedZones).toHaveLength(4);
  });

  it('always returns a density level for all four zones', () => {
    const d = run('male', { q1_area: 'crown' }).densityByZone;
    expect(d.map((x) => x.zone).sort()).toEqual(
      ['crown-vertex', 'frontal-hairline', 'mid-scalp', 'temples'],
    );
    expect(d.every((x) => ['low', 'medium', 'high'].includes(x.level))).toBe(true);
  });

  it('derives plan emphasis from the goal', () => {
    expect(run('male', { q5_goal: 'stop' }).planEmphasis).toBe('stabilize');
    expect(run('male', { q5_goal: 'regrow' }).planEmphasis).toBe('regrow');
    expect(run('male', { q5_goal: 'both' }).planEmphasis).toBe('stabilize-regrow');
  });

  it('recommends a duration from the (severity:emphasis) table', () => {
    expect(run('male', { q2_onset: 'lt-1y', q5_goal: 'stop' }).recommendedDurationDays).toBe(120);
    expect(run('male', { q2_onset: 'gt-5y', q5_goal: 'regrow' }).recommendedDurationDays).toBe(360);
    expect([90, 120, 180, 270, 360]).toContain(run('female', { q2_onset: '1-5y' }).recommendedDurationDays);
  });

  it('emits note keys for prior treatment and family history', () => {
    expect(run('male', { q3_prior: 'never' }).notes).toContain('note.treatment-naive');
    expect(run('male', { q3_prior: 'no-success' }).notes).toContain('note.prior-no-response');
    expect(run('male', { q3_prior: 'partial' }).notes).toContain('note.prior-partial');
    expect(run('male', { q4_family: 'yes' }).notes).toContain('note.family-history-positive');
  });

  it('summaryPlainKey is scoped by scale and severity', () => {
    expect(run('male', { q2_onset: 'lt-1y' }).summaryPlainKey).toBe('summary.norwood.mild');
    expect(run('female', { q2_onset: 'gt-5y' }).summaryPlainKey).toBe('summary.ludwig.established');
  });

  // Exhaustive: every gender × Q1..Q5 combo produces a structurally valid result.
  it('produces a valid analysis for all 2×3^5 = 486 input combinations', () => {
    const opts = {
      q1_area: ['hairline', 'crown', 'entire-scalp'],
      q2_onset: ['lt-1y', '1-5y', 'gt-5y'],
      q3_prior: ['never', 'no-success', 'partial'],
      q4_family: ['yes', 'no', 'not-sure'],
      q5_goal: ['stop', 'regrow', 'both'],
    } as const;
    let count = 0;
    for (const gender of ['male', 'female'] as const)
      for (const q1_area of opts.q1_area)
        for (const q2_onset of opts.q2_onset)
          for (const q3_prior of opts.q3_prior)
            for (const q4_family of opts.q4_family)
              for (const q5_goal of opts.q5_goal) {
                const a = deriveAnalysis({ gender, answers: { q1_area, q2_onset, q3_prior, q4_family, q5_goal } });
                expect(a.flaggedZones.length).toBeGreaterThan(0);
                expect(a.densityByZone).toHaveLength(4);
                expect(a.metrics.length).toBeGreaterThanOrEqual(3);
                expect([90, 120, 180, 270, 360]).toContain(a.recommendedDurationDays);
                count++;
              }
    expect(count).toBe(486);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/domain/analysis/deriveAnalysis.test.ts`
Expected: FAIL — cannot find `./deriveAnalysis`.

- [ ] **Step 3: Create `src/domain/analysis/types.ts`**

Paste the full type block from the Interfaces section above.

- [ ] **Step 4: Implement `src/domain/analysis/deriveAnalysis.ts`**

```ts
import type {
  Answers, Gender, HairAnalysis, Level, PlanEmphasis, SeverityBand, ZoneKey,
} from './types';

export const RECOMMENDED_DURATION_TABLE: Record<string, HairAnalysis['recommendedDurationDays']> = {
  'mild:stabilize': 120, 'mild:regrow': 180, 'mild:stabilize-regrow': 180,
  'moderate:stabilize': 180, 'moderate:regrow': 270, 'moderate:stabilize-regrow': 270,
  'established:stabilize': 270, 'established:regrow': 360, 'established:stabilize-regrow': 360,
};

const ALL_ZONES: ZoneKey[] = ['frontal-hairline', 'temples', 'mid-scalp', 'crown-vertex'];

export function severityFromOnset(onset: Answers['q2_onset']): SeverityBand {
  return onset === 'lt-1y' ? 'mild' : onset === '1-5y' ? 'moderate' : 'established';
}

const sevIndex: Record<SeverityBand, number> = { mild: 0, moderate: 1, established: 2 };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function zonesForArea(area: Answers['q1_area']): ZoneKey[] {
  if (area === 'hairline') return ['frontal-hairline', 'temples'];
  if (area === 'crown') return ['crown-vertex'];
  return [...ALL_ZONES];
}

function emphasisForGoal(goal: Answers['q5_goal']): PlanEmphasis {
  return goal === 'stop' ? 'stabilize' : goal === 'regrow' ? 'regrow' : 'stabilize-regrow';
}

export function deriveAnalysis(input: { gender: Gender; answers: Answers }): HairAnalysis {
  const { gender, answers } = input;
  const scale = gender === 'male' ? 'norwood' : 'ludwig';
  const severityBand = severityFromOnset(answers.q2_onset);

  const bump = answers.q1_area === 'entire-scalp' ? 1 : 0;
  const stage =
    scale === 'norwood'
      ? clamp(2 + sevIndex[severityBand] + bump, 2, 6)
      : clamp(1 + sevIndex[severityBand], 1, 3);

  const flaggedZoneKeys = zonesForArea(answers.q1_area);
  const zoneSeverity: 'mild' | 'moderate' = severityBand === 'mild' ? 'mild' : 'moderate';

  const flaggedZones = flaggedZoneKeys.map((zone) => ({
    zone,
    severity: zoneSeverity,
    noteKey: `zone-note.${zone}`,
  }));

  const densityByZone = ALL_ZONES.map((zone) => {
    const flagged = flaggedZoneKeys.includes(zone);
    const level: Level = flagged
      ? zoneSeverity === 'mild' ? 'medium' : 'low'
      : severityBand === 'established' ? 'medium' : 'high';
    return { zone, level };
  });

  const flaggedCount = flaggedZoneKeys.length;
  const metrics: { key: string; level: Level }[] = [
    { key: 'pattern-stage', level: severityBand === 'mild' ? 'low' : severityBand === 'moderate' ? 'medium' : 'high' },
    { key: 'relative-density', level: severityBand === 'mild' ? 'high' : severityBand === 'moderate' ? 'medium' : 'low' },
    { key: 'thickness-caliber', level: severityBand === 'established' ? 'low' : 'medium' },
    { key: 'scalp-visibility', level: flaggedCount >= 3 ? 'high' : flaggedCount === 2 ? 'medium' : 'low' },
  ];

  const notes: string[] = [];
  notes.push(
    answers.q3_prior === 'never' ? 'note.treatment-naive'
      : answers.q3_prior === 'no-success' ? 'note.prior-no-response'
        : 'note.prior-partial',
  );
  notes.push(
    answers.q4_family === 'yes' ? 'note.family-history-positive'
      : answers.q4_family === 'not-sure' ? 'note.family-history-unknown'
        : 'note.family-history-negative',
  );

  const planEmphasis = emphasisForGoal(answers.q5_goal);
  const recommendedDurationDays = RECOMMENDED_DURATION_TABLE[`${severityBand}:${planEmphasis}`];
  const summaryPlainKey = `summary.${scale}.${severityBand}`;

  return {
    scale, stage, severityBand, flaggedZones, densityByZone, metrics,
    notes, planEmphasis, summaryPlainKey, recommendedDurationDays,
  };
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/domain/analysis/deriveAnalysis.test.ts`
Expected: PASS (all, including the 486-combo test).

- [ ] **Step 6: Commit**

```bash
git add src/domain/analysis/
git commit -m "feat: add deterministic deriveAnalysis engine"
```

---

### Task 14: Analysis message keys + resolution test

**Files:**
- Modify: `src/i18n/messages/en.ts`
- Modify: `src/i18n/messages/he.ts`
- Create: `src/i18n/analysisKeys.test.ts`

**Interfaces:**
- Produces: message keys for every key `deriveAnalysis` can emit — `zone-note.<zone>` (×4), `note.<name>` (×5), `summary.<scale>.<band>` (×6), `metric.<key>` (×4), `zone.<zone>` labels (×4), `scale.norwood.label`, `scale.ludwig.label`, `severity.<band>` (×3).

- [ ] **Step 1: Write the test**

`src/i18n/analysisKeys.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { en } from './messages/en';
import { he } from './messages/he';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers, Gender } from '@/domain/analysis/types';

const opts = {
  q1_area: ['hairline', 'crown', 'entire-scalp'],
  q2_onset: ['lt-1y', '1-5y', 'gt-5y'],
  q3_prior: ['never', 'no-success', 'partial'],
  q4_family: ['yes', 'no', 'not-sure'],
  q5_goal: ['stop', 'regrow', 'both'],
} as const;

function everyKeyEmitted(): Set<string> {
  const keys = new Set<string>();
  for (const gender of ['male', 'female'] as Gender[])
    for (const q1_area of opts.q1_area)
      for (const q2_onset of opts.q2_onset)
        for (const q3_prior of opts.q3_prior)
          for (const q4_family of opts.q4_family)
            for (const q5_goal of opts.q5_goal) {
              const a = deriveAnalysis({ gender, answers: { q1_area, q2_onset, q3_prior, q4_family, q5_goal } as Answers });
              a.flaggedZones.forEach((z) => { keys.add(z.noteKey); keys.add(`zone.${z.zone}`); });
              a.densityByZone.forEach((d) => keys.add(`zone.${d.zone}`));
              a.metrics.forEach((m) => keys.add(`metric.${m.key}`));
              a.notes.forEach((n) => keys.add(n));
              keys.add(a.summaryPlainKey);
              keys.add(`severity.${a.severityBand}`);
              keys.add(`scale.${a.scale}.label`);
            }
  return keys;
}

describe('analysis keys resolve in both locales', () => {
  const emitted = [...everyKeyEmitted()];
  it.each(emitted)('key "%s" exists in en and he', (key) => {
    expect(en, `en missing ${key}`).toHaveProperty(key);
    expect(he, `he missing ${key}`).toHaveProperty(key);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/i18n/analysisKeys.test.ts`
Expected: FAIL — keys missing.

- [ ] **Step 3: Add the keys to `en.ts`**

Append to the `en` object (keep it a `const` object; `MessageKey` widens automatically):

```ts
  'scale.norwood.label': 'Norwood–Hamilton scale',
  'scale.ludwig.label': 'Ludwig scale',

  'severity.mild': 'Early',
  'severity.moderate': 'Moderate',
  'severity.established': 'Established',

  'zone.frontal-hairline': 'Frontal hairline',
  'zone.temples': 'Temples',
  'zone.mid-scalp': 'Mid-scalp',
  'zone.crown-vertex': 'Crown / vertex',

  'zone-note.frontal-hairline': 'Recession visible along the frontal hairline.',
  'zone-note.temples': 'Both temple corners have moved back.',
  'zone-note.mid-scalp': 'Reduced coverage across the mid-scalp.',
  'zone-note.crown-vertex': 'Thinning at the crown, with scalp show-through.',

  'metric.pattern-stage': 'Pattern stage',
  'metric.relative-density': 'Relative density',
  'metric.thickness-caliber': 'Thickness / caliber',
  'metric.scalp-visibility': 'Scalp visibility',

  'note.treatment-naive': 'No prior hair-loss treatment.',
  'note.prior-no-response': 'Previous treatment without a noticeable response.',
  'note.prior-partial': 'Previous treatment with partial improvement.',
  'note.family-history-positive': 'Family history of hair loss reported.',
  'note.family-history-unknown': 'Family history uncertain.',
  'note.family-history-negative': 'No reported family history of hair loss.',

  'summary.norwood.mild': 'An early, patterned thinning localised to a few areas. Strand quality still appears healthy.',
  'summary.norwood.moderate': 'A patterned thinning that is now well established in the flagged areas.',
  'summary.norwood.established': 'A long-standing patterned thinning with visible scalp across several zones.',
  'summary.ludwig.mild': 'Early diffuse thinning, most visible along the part.',
  'summary.ludwig.moderate': 'Diffuse thinning with a widening part and reduced volume.',
  'summary.ludwig.established': 'Pronounced diffuse thinning across the mid-scalp.',
```

*(Copy is plain-language and non-diagnostic — see spec §3 honesty guard. Not medical claims.)*

- [ ] **Step 4: Add the matching keys to `he.ts`**

Add the same keys with Hebrew values. **Medical/clinical phrasing:** provide a working Hebrew translation and mark the block with a comment `// TODO: confirm with client — clinical Hebrew phrasing (spec §12 PENDING inventory)`. Example values:

```ts
  'scale.norwood.label': 'סולם נורווד–המילטון',
  'scale.ludwig.label': 'סולם לודוויג',
  'severity.mild': 'מוקדם',
  'severity.moderate': 'בינוני',
  'severity.established': 'מבוסס',
  'zone.frontal-hairline': 'קו השיער הקדמי',
  'zone.temples': 'הרקות',
  'zone.mid-scalp': 'מרכז הקרקפת',
  'zone.crown-vertex': 'קודקוד הראש',
  // TODO: confirm with client — clinical Hebrew phrasing
  'zone-note.frontal-hairline': 'נסיגה לאורך קו השיער הקדמי.',
  'zone-note.temples': 'שתי פינות הרקות נסוגו לאחור.',
  'zone-note.mid-scalp': 'כיסוי מופחת במרכז הקרקפת.',
  'zone-note.crown-vertex': 'דילול בקודקוד עם שקיפות של הקרקפת.',
  'metric.pattern-stage': 'שלב הדפוס',
  'metric.relative-density': 'צפיפות יחסית',
  'metric.thickness-caliber': 'עובי השערה',
  'metric.scalp-visibility': 'חשיפת הקרקפת',
  'note.treatment-naive': 'לא בוצע טיפול קודם לנשירת שיער.',
  'note.prior-no-response': 'טיפול קודם ללא שיפור מורגש.',
  'note.prior-partial': 'טיפול קודם עם שיפור חלקי.',
  'note.family-history-positive': 'קיים רקע משפחתי של נשירת שיער.',
  'note.family-history-unknown': 'רקע משפחתי לא ודאי.',
  'note.family-history-negative': 'אין רקע משפחתי מדווח של נשירת שיער.',
  'summary.norwood.mild': 'דילול מוקדם בדפוס, ממוקד באזורים בודדים. איכות השערה נראית תקינה.',
  'summary.norwood.moderate': 'דילול בדפוס שכבר מבוסס באזורים המסומנים.',
  'summary.norwood.established': 'דילול ותיק בדפוס עם קרקפת חשופה במספר אזורים.',
  'summary.ludwig.mild': 'דילול מפוזר מוקדם, בולט בעיקר לאורך הפסוקת.',
  'summary.ludwig.moderate': 'דילול מפוזר עם התרחבות הפסוקת וירידה בנפח.',
  'summary.ludwig.established': 'דילול מפוזר ניכר במרכז הקרקפת.',
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/i18n/analysisKeys.test.ts src/i18n/messages.test.ts`
Expected: PASS (parity still holds; every emitted key resolves).

- [ ] **Step 6: Commit**

```bash
git add src/i18n/
git commit -m "feat: add analysis i18n keys (en + he) with resolution test"
```

---

### Task 15: DiagnosisLayout + step guards

**Files:**
- Create: `src/app/routes/diagnosis/guards.ts`
- Create: `src/app/routes/diagnosis/guards.test.tsx`
- Create: `src/app/routes/diagnosis/DiagnosisLayout.tsx`

**Interfaces:**
- Consumes: `useSession`, `useT`, `Wordmark`, `LocaleToggle`, `ProgressRail`.
- Produces:
  - `DIAGNOSIS_STEPS = ['intro', 'gender', 'photos', 'analyzing', 'ready'] as const`; `type DiagnosisStep = (typeof DIAGNOSIS_STEPS)[number]`.
  - `redirectForStep(step: DiagnosisStep, s: SessionState): string | null` — returns the path to redirect to when prerequisites are unmet, else `null`. Rules: `gender` needs nothing; `photos` needs `diagnosis.gender`; `analyzing` needs `gender` && `photos.length >= 1`; `ready` needs `analysis`.
  - `<DiagnosisLayout />` — `<Outlet/>` under a header (Wordmark + LocaleToggle) and a `<ProgressRail>` whose `current` comes from the matched child route.

- [ ] **Step 1: Write the guard test**

`src/app/routes/diagnosis/guards.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { redirectForStep } from './guards';
import type { SessionState } from '@/store/sessionStore';

const empty: SessionState = {
  diagnosis: { gender: null, photos: [], answers: {} },
  analysis: null, reportId: null, account: { email: null }, program: null,
};
const withGender: SessionState = { ...empty, diagnosis: { ...empty.diagnosis, gender: 'male' } };
const withPhoto: SessionState = {
  ...withGender,
  diagnosis: { ...withGender.diagnosis, photos: [{ id: 'p', angleKey: 'front', thumb: 't', blobId: 'b' }] },
};

describe('redirectForStep', () => {
  it('intro and gender are always reachable', () => {
    expect(redirectForStep('intro', empty)).toBeNull();
    expect(redirectForStep('gender', empty)).toBeNull();
  });
  it('photos needs a gender', () => {
    expect(redirectForStep('photos', empty)).toBe('/diagnosis/gender');
    expect(redirectForStep('photos', withGender)).toBeNull();
  });
  it('analyzing needs gender + at least one photo', () => {
    expect(redirectForStep('analyzing', withGender)).toBe('/diagnosis/photos');
    expect(redirectForStep('analyzing', withPhoto)).toBeNull();
  });
  it('ready needs an analysis', () => {
    expect(redirectForStep('ready', withPhoto)).toBe('/diagnosis/analyzing');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/diagnosis/guards.test.tsx`
Expected: FAIL — cannot find `./guards`.

- [ ] **Step 3: Implement `guards.ts`**

```ts
import type { SessionState } from '@/store/sessionStore';

export const DIAGNOSIS_STEPS = ['intro', 'gender', 'photos', 'analyzing', 'ready'] as const;
export type DiagnosisStep = (typeof DIAGNOSIS_STEPS)[number];

export function redirectForStep(step: DiagnosisStep, s: SessionState): string | null {
  const hasGender = s.diagnosis.gender !== null;
  const hasPhoto = s.diagnosis.photos.length >= 1;
  const hasAnalysis = s.analysis !== null;

  switch (step) {
    case 'intro':
    case 'gender':
      return null;
    case 'photos':
      return hasGender ? null : '/diagnosis/gender';
    case 'analyzing':
      if (!hasGender) return '/diagnosis/gender';
      return hasPhoto ? null : '/diagnosis/photos';
    case 'ready':
      return hasAnalysis ? null : '/diagnosis/analyzing';
    default:
      return null;
  }
}
```

- [ ] **Step 4: Implement `DiagnosisLayout.tsx`**

```tsx
import { Outlet, useLocation } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { ProgressRail } from '@/app/components/brand/ProgressRail';
import { DIAGNOSIS_STEPS } from './guards';

export function DiagnosisLayout() {
  const t = useT();
  const { pathname } = useLocation();
  const seg = pathname.split('/')[2] ?? 'intro';
  const current = Math.max(0, DIAGNOSIS_STEPS.indexOf(seg as never));
  const labels = [
    t('diagnosis.rail.intro'), t('diagnosis.rail.gender'), t('diagnosis.rail.photos'),
    t('diagnosis.rail.analysis'), t('diagnosis.rail.results'),
  ];
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <div className="px-6 pb-2">
        <ProgressRail steps={labels} current={current} />
      </div>
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Add the six `diagnosis.rail.*` keys to `en.ts` and `he.ts`**

en: `intro: 'Intro'`, `gender: 'You'`, `photos: 'Photos'`, `analysis: 'Analysis'`, `results: 'Results'`.
he: `'הקדמה'`, `'עליך'`, `'תמונות'`, `'ניתוח'`, `'תוצאות'`.

- [ ] **Step 6: Run guard test + parity**

Run: `pnpm exec vitest run src/app/routes/diagnosis/guards.test.tsx src/i18n/messages.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/routes/diagnosis/guards.ts src/app/routes/diagnosis/guards.test.tsx src/app/routes/diagnosis/DiagnosisLayout.tsx src/i18n/
git commit -m "feat: add DiagnosisLayout and step-guard logic"
```

---

### Task 16: Intro step

**Files:**
- Create: `src/app/routes/diagnosis/IntroStep.tsx`
- Create: `src/app/routes/diagnosis/IntroStep.test.tsx`

**Interfaces:**
- Consumes: `useT`, `useNavigate`.
- Produces: `<IntroStep />` — three value cards + a CTA button that calls `navigate('/diagnosis/gender')`.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { IntroStep } from './IntroStep';

function renderIntro() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis', element: <IntroStep /> },
      { path: '/diagnosis/gender', element: <div>gender page</div> },
    ],
    { initialEntries: ['/diagnosis'] },
  );
  return render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
}

describe('IntroStep', () => {
  it('advances to the gender step on CTA click', async () => {
    renderIntro();
    await userEvent.click(screen.getByRole('button', { name: /start|התחלה|המשך/i }));
    expect(screen.getByText('gender page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** — `pnpm exec vitest run src/app/routes/diagnosis/IntroStep.test.tsx` → FAIL.

- [ ] **Step 3: Implement `IntroStep.tsx`**

```tsx
import { useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';

export function IntroStep() {
  const t = useT();
  const navigate = useNavigate();
  const points = [t('diagnosis.intro.point1'), t('diagnosis.intro.point2'), t('diagnosis.intro.point3')];
  return (
    <section className="mx-auto max-w-md text-center flex flex-col gap-8">
      <h1 className="text-2xl">{t('diagnosis.intro.title')}</h1>
      <ul className="grid gap-3">
        {points.map((p) => (
          <li key={p} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">{p}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => navigate('/diagnosis/gender')}
        className="rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm"
      >
        {t('common.start')}
      </button>
    </section>
  );
}
```

- [ ] **Step 4: Add keys** `diagnosis.intro.title`, `diagnosis.intro.point1..3` to `en.ts` + `he.ts`.
  - en: title `'Your free hair diagnosis'`; points: `'Takes just a few minutes'`, `'AI analysis of your hair'`, `'A personalized treatment plan'`.
  - he: `'האבחון החינמי שלך'`; `'לוקח רק כמה דקות'`, `'ניתוח שיער מבוסס AI'`, `'תוכנית טיפול אישית'`.

- [ ] **Step 5: Run it and watch it pass** — test + parity → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/diagnosis/IntroStep.tsx src/app/routes/diagnosis/IntroStep.test.tsx src/i18n/
git commit -m "feat: add diagnosis intro step"
```

---

### Task 17: Gender step

**Files:**
- Create: `src/app/routes/diagnosis/GenderStep.tsx`
- Create: `src/app/routes/diagnosis/GenderStep.test.tsx`

**Interfaces:**
- Consumes: `useSession().setGender`, `useT`, `useNavigate`, `redirectForStep`.
- Produces: `<GenderStep />` — two large option buttons (Male / Female). Selecting one calls `setGender` then `navigate('/diagnosis/photos')`. Includes `// TODO: confirm with client — third / "prefer not to say" option` as a code comment.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider, useSession } from '@/store/sessionStore';
import { GenderStep } from './GenderStep';

let api: ReturnType<typeof useSession>;
function Spy() { api = useSession(); return null; }

function renderGender() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/gender', element: <><GenderStep /><Spy /></> },
      { path: '/diagnosis/photos', element: <div>photos page</div> },
    ],
    { initialEntries: ['/diagnosis/gender'] },
  );
  return render(
    <LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>,
  );
}

describe('GenderStep', () => {
  it('stores the gender and advances to photos', async () => {
    renderGender();
    await userEvent.click(screen.getByRole('button', { name: /female|אישה/i }));
    expect(api.diagnosis.gender).toBe('female');
    expect(screen.getByText('photos page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `GenderStep.tsx`**

```tsx
import { useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import type { Gender } from '@/domain/analysis/types';

// TODO: confirm with client — whether a third / "prefer not to say" option is needed.
const OPTIONS: Gender[] = ['male', 'female'];

export function GenderStep() {
  const t = useT();
  const navigate = useNavigate();
  const { setGender } = useSession();

  const choose = (g: Gender) => {
    setGender(g);
    navigate('/diagnosis/photos');
  };

  return (
    <section className="mx-auto max-w-md text-center flex flex-col gap-8">
      <h1 className="text-2xl">{t('diagnosis.gender.title')}</h1>
      <div className="grid grid-cols-2 gap-4">
        {OPTIONS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => choose(g)}
            className="rounded-xl border border-border bg-card px-4 py-10 text-lg hover:border-accent"
          >
            {t(`diagnosis.gender.${g}` as never)}
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add keys** `diagnosis.gender.title` (en `'What is your gender?'` / he `'מה המין שלך?'`), `diagnosis.gender.male` (`'Male'` / `'גבר'`), `diagnosis.gender.female` (`'Female'` / `'אישה'`).

- [ ] **Step 5: Run it and watch it pass** → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/diagnosis/GenderStep.tsx src/app/routes/diagnosis/GenderStep.test.tsx src/i18n/
git commit -m "feat: add diagnosis gender step"
```

---

### Task 18: Image downscale utility

**Files:**
- Create: `src/app/components/diagnosis/downscaleImage.ts`
- Create: `src/app/components/diagnosis/downscaleImage.test.ts`

**Interfaces:**
- Produces:
  - `computeDownscaledSize(w: number, h: number, maxEdge: number): { width: number; height: number }` — **pure**; preserves aspect ratio; never upscales; rounds to integers.
  - `downscaleImage(file: Blob, opts?: { maxEdge?: number; quality?: number }): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }>` — uses `createImageBitmap` + `OffscreenCanvas`/`<canvas>`; defaults `maxEdge: 1200`, `quality: 0.72`, output `image/jpeg`. (The canvas path is not exercised under jsdom — only `computeDownscaledSize` is unit-tested here; the browser path is covered by manual QA in Task 20's dev check.)

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { computeDownscaledSize } from './downscaleImage';

describe('computeDownscaledSize', () => {
  it('never upscales', () => {
    expect(computeDownscaledSize(800, 600, 1200)).toEqual({ width: 800, height: 600 });
  });
  it('scales the long edge down to maxEdge, keeping aspect ratio', () => {
    expect(computeDownscaledSize(4000, 3000, 1200)).toEqual({ width: 1200, height: 900 });
    expect(computeDownscaledSize(3000, 4000, 1200)).toEqual({ width: 900, height: 1200 });
  });
  it('rounds to integers', () => {
    const { width, height } = computeDownscaledSize(1333, 1000, 1200);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `downscaleImage.ts`**

```ts
export function computeDownscaledSize(w: number, h: number, maxEdge: number): { width: number; height: number } {
  const longEdge = Math.max(w, h);
  if (longEdge <= maxEdge) return { width: Math.round(w), height: Math.round(h) };
  const scale = maxEdge / longEdge;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

export async function downscaleImage(
  file: Blob,
  opts: { maxEdge?: number; quality?: number } = {},
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const maxEdge = opts.maxEdge ?? 1200;
  const quality = opts.quality ?? 0.72;

  const bitmap = await createImageBitmap(file);
  const { width, height } = computeDownscaledSize(bitmap.width, bitmap.height, maxEdge);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality),
  );
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

  return { blob, dataUrl, width, height };
}
```

- [ ] **Step 4: Run it and watch it pass** → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/diagnosis/downscaleImage.ts src/app/components/diagnosis/downscaleImage.test.ts
git commit -m "feat: add image downscale utility"
```

---

### Task 19: PhotoUpload component

**Files:**
- Create: `src/app/components/diagnosis/PhotoUpload.tsx`
- Create: `src/app/components/diagnosis/PhotoUpload.test.tsx`

**Interfaces:**
- Consumes: `useT`; `downscaleImage`; `putBlob`, `deleteBlob` from `@/store/persistence`; `AngleKey`, `PhotoRef` from `@/store/sessionStore`.
- Produces: `<PhotoUpload angleKey value onAdd onRemove />`
  - `angleKey: AngleKey`
  - `value?: PhotoRef`
  - `onAdd(ref: PhotoRef): void` — called after a file is picked, downscaled, and its blob stored (`putBlob(id, blob)`); `ref.thumb` is the data URL, `ref.blobId === ref.id`.
  - `onRemove(id: string): void` — calls `deleteBlob(id)` then `onRemove`.
  - Validation: rejects non-`image/*` and files `> 15 MB` with an inline message; no exception thrown.
- For the test, mock `downscaleImage` via `vi.mock` so no real canvas is needed.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/i18n/LocaleProvider';

vi.mock('./downscaleImage', () => ({
  computeDownscaledSize: (w: number, h: number) => ({ width: w, height: h }),
  downscaleImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/jpeg' }),
    dataUrl: 'data:image/jpeg;base64,AAAA',
    width: 10, height: 10,
  })),
}));

import { PhotoUpload } from './PhotoUpload';

const wrap = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe('PhotoUpload', () => {
  it('accepts an image, downscales it, and reports a PhotoRef', async () => {
    const onAdd = vi.fn();
    wrap(<PhotoUpload angleKey="front" onAdd={onAdd} onRemove={vi.fn()} />);
    const input = screen.getByLabelText(/front|קדמי/i) as HTMLInputElement;
    const file = new File(['bytes'], 'front.jpg', { type: 'image/jpeg' });
    await userEvent.upload(input, file);
    expect(onAdd).toHaveBeenCalledTimes(1);
    const ref = onAdd.mock.calls[0][0];
    expect(ref).toMatchObject({ angleKey: 'front', thumb: 'data:image/jpeg;base64,AAAA' });
    expect(ref.blobId).toBe(ref.id);
  });

  it('rejects a non-image file with an inline message', async () => {
    const onAdd = vi.fn();
    wrap(<PhotoUpload angleKey="front" onAdd={onAdd} onRemove={vi.fn()} />);
    const input = screen.getByLabelText(/front|קדמי/i) as HTMLInputElement;
    await userEvent.upload(input, new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `PhotoUpload.tsx`**

```tsx
import { useId, useState, type ChangeEvent } from 'react';
import { useT } from '@/i18n/LocaleProvider';
import { downscaleImage } from './downscaleImage';
import { putBlob, deleteBlob } from '@/store/persistence';
import type { AngleKey, PhotoRef } from '@/store/sessionStore';

const MAX_BYTES = 15 * 1024 * 1024;

export function PhotoUpload({
  angleKey, value, onAdd, onRemove,
}: {
  angleKey: AngleKey;
  value?: PhotoRef;
  onAdd: (ref: PhotoRef) => void;
  onRemove: (id: string) => void;
}) {
  const t = useT();
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) { setError(t('photo.error.type')); return; }
    if (file.size > MAX_BYTES) { setError(t('photo.error.size')); return; }
    setBusy(true);
    try {
      const { blob, dataUrl } = await downscaleImage(file);
      const id = crypto.randomUUID();
      await putBlob(id, blob);
      onAdd({ id, angleKey, thumb: dataUrl, blobId: id });
    } catch {
      setError(t('photo.error.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!value) return;
    await deleteBlob(value.blobId);
    onRemove(value.id);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-xs font-medium text-muted-foreground">
        {t(`photo.angle.${angleKey}` as never)}
      </label>
      {value ? (
        <div className="relative">
          <img src={value.thumb} alt={t(`photo.angle.${angleKey}` as never)} className="h-32 w-full rounded-lg object-cover" />
          <button type="button" onClick={handleRemove} className="absolute end-2 top-2 rounded bg-background/80 px-2 py-1 text-xs">
            {t('common.remove')}
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground"
        >
          {busy ? t('photo.uploading') : t('photo.add')}
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={handleChange}
      />
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Add keys** to `en.ts` + `he.ts`:
  - `photo.angle.front` (`'Front'` / `'קדמי'`), `photo.angle.top` (`'Top'` / `'עליון'`), `photo.angle.crown` (`'Crown'` / `'קודקוד'`), `photo.angle.hairline` (`'Hairline'` / `'קו שיער'`)
  - `photo.add` (`'Add photo'` / `'הוספת תמונה'`), `photo.uploading` (`'Processing…'` / `'מעבד…'`), `common.remove` (`'Remove'` / `'הסרה'`)
  - `photo.error.type` (`'Please choose an image file.'` / `'יש לבחור קובץ תמונה.'`), `photo.error.size` (`'That image is too large (max 15 MB).'` / `'התמונה גדולה מדי (עד 15MB).'`), `photo.error.generic` (`'Could not process that image. Try another.'` / `'לא ניתן לעבד את התמונה. נסו אחרת.'`)

- [ ] **Step 5: Run it and watch it pass** → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/diagnosis/PhotoUpload.tsx src/app/components/diagnosis/PhotoUpload.test.tsx src/i18n/
git commit -m "feat: add PhotoUpload with downscale + blob storage"
```

---

### Task 20: Photos step

**Files:**
- Create: `src/app/routes/diagnosis/PhotosStep.tsx`
- Create: `src/app/routes/diagnosis/PhotosStep.test.tsx`

**Interfaces:**
- Consumes: `useSession` (`diagnosis.gender`, `diagnosis.photos`, `addPhoto`, `removePhoto`), `redirectForStep`, `useT`, `useNavigate`, `<Navigate>`, `PhotoUpload`.
- Produces: `<PhotosStep />` — four `<PhotoUpload>` slots (front/top/crown/hairline) + a how-to blurb. "Continue" is disabled until `photos.length >= 1`; on click → `navigate('/diagnosis/analyzing')`. If `redirectForStep('photos', state)` returns a path, render `<Navigate to={path} replace />`.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider, useSession } from '@/store/sessionStore';

vi.mock('@/app/components/diagnosis/downscaleImage', () => ({
  computeDownscaledSize: (w: number, h: number) => ({ width: w, height: h }),
  downscaleImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/jpeg' }), dataUrl: 'data:image/jpeg;base64,AAAA', width: 10, height: 10,
  })),
}));

import { PhotosStep } from './PhotosStep';

let api: ReturnType<typeof useSession>;
function Boot({ gender }: { gender: 'male' | 'female' | null }) {
  api = useSession();
  if (gender && api.diagnosis.gender !== gender) api.setGender(gender);
  return null;
}

function renderPhotos(gender: 'male' | 'female' | null) {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/photos', element: <><Boot gender={gender} /><PhotosStep /></> },
      { path: '/diagnosis/gender', element: <div>gender page</div> },
      { path: '/diagnosis/analyzing', element: <div>analyzing page</div> },
    ],
    { initialEntries: ['/diagnosis/photos'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

describe('PhotosStep', () => {
  it('redirects to gender when no gender is set', () => {
    renderPhotos(null);
    expect(screen.getByText('gender page')).toBeInTheDocument();
  });

  it('enables Continue after one photo and advances to analyzing', async () => {
    renderPhotos('male');
    const cta = screen.getByRole('button', { name: /continue|המשך/i });
    expect(cta).toBeDisabled();
    const input = screen.getAllByLabelText(/front|top|crown|hairline|קדמי|עליון|קודקוד|קו שיער/i)[0];
    await userEvent.upload(input, new File(['b'], 'f.jpg', { type: 'image/jpeg' }));
    expect(cta).toBeEnabled();
    await userEvent.click(cta);
    expect(screen.getByText('analyzing page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `PhotosStep.tsx`**

```tsx
import { Navigate, useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { PhotoUpload } from '@/app/components/diagnosis/PhotoUpload';
import { redirectForStep } from './guards';
import type { AngleKey } from '@/store/sessionStore';

const ANGLES: AngleKey[] = ['front', 'top', 'crown', 'hairline'];

export function PhotosStep() {
  const t = useT();
  const navigate = useNavigate();
  const session = useSession();
  const redirect = redirectForStep('photos', session);
  if (redirect) return <Navigate to={redirect} replace />;

  const byAngle = (a: AngleKey) => session.diagnosis.photos.find((p) => p.angleKey === a);
  const canContinue = session.diagnosis.photos.length >= 1;

  return (
    <section className="mx-auto max-w-lg flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl">{t('diagnosis.photos.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('diagnosis.photos.howto')}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ANGLES.map((a) => (
          <PhotoUpload
            key={a}
            angleKey={a}
            value={byAngle(a)}
            onAdd={(ref) => session.addPhoto(ref)}
            onRemove={(id) => session.removePhoto(id)}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t('diagnosis.photos.privacy')}</p>
      {/* TODO: confirm with client — minimum required photo count (currently >= 1 of 4). */}
      <button
        type="button"
        disabled={!canContinue}
        onClick={() => navigate('/diagnosis/analyzing')}
        className="rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm disabled:opacity-40"
      >
        {t('common.continue')}
      </button>
    </section>
  );
}
```

- [ ] **Step 4: Add keys** `diagnosis.photos.title` (`'Add photos of the area'` / `'הוספת תמונות של האזור'`), `diagnosis.photos.howto` (`'Good lighting, hair dry, camera straight on. Front, top, crown, hairline.'` / `'תאורה טובה, שיער יבש, מצלמה ישרה. קדמי, עליון, קודקוד, קו שיער.'`), `diagnosis.photos.privacy` (`'Your photos are used only for your analysis.'` / `'התמונות משמשות אך ורק לאבחון שלך.'`).

- [ ] **Step 5: Run it and watch it pass** → PASS.

- [ ] **Step 6: Dev sanity check (manual, not a test)**

Run `pnpm dev`, walk `/` → `/diagnosis` → gender → photos, upload a real photo from disk, confirm it renders downscaled and "Continue" enables. This exercises the real `downscaleImage` canvas path that jsdom can't.

- [ ] **Step 7: Commit**

```bash
git add src/app/routes/diagnosis/PhotosStep.tsx src/app/routes/diagnosis/PhotosStep.test.tsx src/i18n/
git commit -m "feat: add diagnosis photos step"
```

---

### Task 21: Questions data + QuestionCard

**Files:**
- Create: `src/app/components/diagnosis/questions.ts`
- Create: `src/app/components/diagnosis/QuestionCard.tsx`
- Create: `src/app/components/diagnosis/QuestionCard.test.tsx`

**Interfaces:**
- Produces:
  - `type QuestionId = keyof Answers` (from `@/domain/analysis/types`).
  - `QUESTIONS: { id: QuestionId; promptKey: string; options: { value: string; labelKey: string }[] }[]` — exactly the 5 questions from spec §5.4, options in brief order. `option.value` matches the `Answers` union values (`'hairline'`, `'lt-1y'`, …).
  - `<QuestionCard question index total value onSelect />` — renders the prompt + option buttons; clicking an option calls `onSelect(question.id, value)`. The currently-selected option has `aria-pressed="true"`.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { QUESTIONS } from './questions';
import { QuestionCard } from './QuestionCard';

describe('questions data', () => {
  it('has the five brief questions with the expected ids and option values', () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(['q1_area', 'q2_onset', 'q3_prior', 'q4_family', 'q5_goal']);
    expect(QUESTIONS[0].options.map((o) => o.value)).toEqual(['hairline', 'crown', 'entire-scalp']);
    expect(QUESTIONS[1].options.map((o) => o.value)).toEqual(['lt-1y', '1-5y', 'gt-5y']);
    expect(QUESTIONS[4].options.map((o) => o.value)).toEqual(['stop', 'regrow', 'both']);
  });
});

describe('QuestionCard', () => {
  it('reports the selected option value', async () => {
    const onSelect = vi.fn();
    render(
      <LocaleProvider>
        <QuestionCard question={QUESTIONS[0]} index={0} total={5} value={undefined} onSelect={onSelect} />
      </LocaleProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /crown|קודקוד/i }));
    expect(onSelect).toHaveBeenCalledWith('q1_area', 'crown');
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `questions.ts`**

```ts
import type { Answers } from '@/domain/analysis/types';

export type QuestionId = keyof Answers;
export type Question = {
  id: QuestionId;
  promptKey: string;
  options: { value: string; labelKey: string }[];
};

export const QUESTIONS: Question[] = [
  {
    id: 'q1_area', promptKey: 'q.area.prompt',
    options: [
      { value: 'hairline', labelKey: 'q.area.hairline' },
      { value: 'crown', labelKey: 'q.area.crown' },
      { value: 'entire-scalp', labelKey: 'q.area.entire' },
    ],
  },
  {
    id: 'q2_onset', promptKey: 'q.onset.prompt',
    options: [
      { value: 'lt-1y', labelKey: 'q.onset.lt1' },
      { value: '1-5y', labelKey: 'q.onset.1to5' },
      { value: 'gt-5y', labelKey: 'q.onset.gt5' },
    ],
  },
  {
    id: 'q3_prior', promptKey: 'q.prior.prompt',
    options: [
      { value: 'never', labelKey: 'q.prior.never' },
      { value: 'no-success', labelKey: 'q.prior.nosuccess' },
      { value: 'partial', labelKey: 'q.prior.partial' },
    ],
  },
  {
    id: 'q4_family', promptKey: 'q.family.prompt',
    options: [
      { value: 'yes', labelKey: 'q.family.yes' },
      { value: 'no', labelKey: 'q.family.no' },
      { value: 'not-sure', labelKey: 'q.family.notsure' },
    ],
  },
  {
    id: 'q5_goal', promptKey: 'q.goal.prompt',
    options: [
      { value: 'stop', labelKey: 'q.goal.stop' },
      { value: 'regrow', labelKey: 'q.goal.regrow' },
      { value: 'both', labelKey: 'q.goal.both' },
    ],
  },
];
```

- [ ] **Step 4: Implement `QuestionCard.tsx`**

```tsx
import { useT } from '@/i18n/LocaleProvider';
import type { Question, QuestionId } from './questions';

export function QuestionCard({
  question, index, total, value, onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  value: string | undefined;
  onSelect: (id: QuestionId, value: string) => void;
}) {
  const t = useT();
  return (
    <div className="mx-auto max-w-md flex flex-col gap-6">
      <p className="text-xs text-muted-foreground">{t('q.counter', { index: index + 1, total })}</p>
      <h2 className="text-xl">{t(question.promptKey as never)}</h2>
      <div className="grid gap-3">
        {question.options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onSelect(question.id, o.value)}
            className={
              'rounded-lg border px-4 py-3 text-start text-sm ' +
              (value === o.value ? 'border-accent bg-accent/10' : 'border-border bg-card')
            }
          >
            {t(o.labelKey as never)}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add keys** for `q.counter` (`'Question {index} of {total}'` / `'שאלה {index} מתוך {total}'`) and every `promptKey` / `labelKey` above, in `en.ts` and `he.ts`. Prompts (en): area `'Where are you experiencing hair loss?'`, onset `'When did you first notice hair loss?'`, prior `'Have you previously used hair-loss treatments?'`, family `'Does hair loss run in your family?'`, goal `'What is your main goal?'`. Options en: `Hairline / Crown / Entire scalp`, `Less than 1 year / 1–5 years / More than 5 years`, `Never / Yes, without success / Yes, with partial improvement`, `Yes / No / Not sure`, `Stop hair loss / Regrow lost hair / Both`. He: translate each (non-clinical, no review flag needed).

- [ ] **Step 6: Run it and watch it pass** — test + `pnpm exec vitest run src/i18n/messages.test.ts` → PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/diagnosis/questions.ts src/app/components/diagnosis/QuestionCard.tsx src/app/components/diagnosis/QuestionCard.test.tsx src/i18n/
git commit -m "feat: add the 5 diagnosis questions and QuestionCard"
```

---

### Task 22: AnalyzingStrip

**Files:**
- Create: `src/app/components/diagnosis/AnalyzingStrip.tsx`
- Create: `src/app/components/diagnosis/AnalyzingStrip.test.tsx`

**Interfaces:**
- Consumes: `useT`.
- Produces: `<AnalyzingStrip running gateReady onComplete facetMs? />`
  - `running: boolean` — when `false`, the timer is idle.
  - `gateReady: boolean` — the strip advances through 5 facets; it will **not** fire `onComplete` (and holds at the 5th facet ~92%) until `gateReady` is `true`.
  - `onComplete(): void` — fired once, when all facets are done **and** `gateReady` is `true`.
  - `facetMs?: number` — ms per facet, default `2200` (injectable for tests).
  - Renders the five facet labels (`analysis.facet.density|area|hairline|scalp|thinning`) with a done/active marker each.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { AnalyzingStrip } from './AnalyzingStrip';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const wrap = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe('AnalyzingStrip', () => {
  it('does not complete until the gate is ready, even after all facets elapse', () => {
    const onComplete = vi.fn();
    const { rerender } = wrap(
      <AnalyzingStrip running gateReady={false} onComplete={onComplete} facetMs={100} />,
    );
    act(() => vi.advanceTimersByTime(100 * 6));
    expect(onComplete).not.toHaveBeenCalled();

    rerender(<LocaleProvider><AnalyzingStrip running gateReady onComplete={onComplete} facetMs={100} /></LocaleProvider>);
    act(() => vi.advanceTimersByTime(100 * 6));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders the five analysis facets', () => {
    wrap(<AnalyzingStrip running gateReady={false} onComplete={vi.fn()} facetMs={100} />);
    expect(screen.getByText(/density|צפיפות/i)).toBeInTheDocument();
    expect(screen.getByText(/scalp|קרקפת/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `AnalyzingStrip.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';

const FACETS = ['density', 'area', 'hairline', 'scalp', 'thinning'] as const;

export function AnalyzingStrip({
  running, gateReady, onComplete, facetMs = 2200,
}: {
  running: boolean;
  gateReady: boolean;
  onComplete: () => void;
  facetMs?: number;
}) {
  const t = useT();
  const [done, setDone] = useState(0); // number of completed facets (0..5)
  const firedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    if (done >= FACETS.length) return;
    // Hold on the final facet until the questionnaire gate opens.
    if (done === FACETS.length - 1 && !gateReady) return;
    const id = setTimeout(() => setDone((d) => d + 1), facetMs);
    return () => clearTimeout(id);
  }, [running, done, gateReady, facetMs]);

  useEffect(() => {
    if (done >= FACETS.length && gateReady && !firedRef.current) {
      firedRef.current = true;
      onComplete();
    }
  }, [done, gateReady, onComplete]);

  const pct = Math.min(100, Math.round((done / FACETS.length) * 100) || (running ? 8 : 0));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('analysis.title')}</span>
        <span>{gateReady || done < FACETS.length - 1 ? `${pct}%` : `92%`}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-accent transition-all" style={{ width: `${gateReady ? pct : Math.min(pct, 92)}%` }} />
      </div>
      <ul className="mt-3 grid gap-1 text-xs">
        {FACETS.map((f, i) => (
          <li key={f} className={i < done ? 'text-foreground' : 'text-muted-foreground'}>
            {i < done ? '✓ ' : '• '}{t(`analysis.facet.${f}` as never)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Add keys** `analysis.title` (`'Analyzing your hair'` / `'מנתחים את השיער שלך'`), `analysis.facet.density` (`'Hair density'` / `'צפיפות שיער'`), `analysis.facet.area` (`'Hair loss area'` / `'אזור הנשירה'`), `analysis.facet.hairline` (`'Hairline'` / `'קו השיער'`), `analysis.facet.scalp` (`'Scalp condition'` / `'מצב הקרקפת'`), `analysis.facet.thinning` (`'Hair thinning'` / `'דילול שיער'`).

- [ ] **Step 5: Run it and watch it pass** → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/diagnosis/AnalyzingStrip.tsx src/app/components/diagnosis/AnalyzingStrip.test.tsx src/i18n/
git commit -m "feat: add gated AnalyzingStrip"
```

---

### Task 23: Analyzing step (compose strip + questionnaire)

**Files:**
- Create: `src/app/routes/diagnosis/AnalyzingStep.tsx`
- Create: `src/app/routes/diagnosis/AnalyzingStep.test.tsx`

**Interfaces:**
- Consumes: `useSession`, `redirectForStep`, `QUESTIONS`, `QuestionCard`, `AnalyzingStrip`, `deriveAnalysis`, `useNavigate`, `<Navigate>`.
- Produces: `<AnalyzingStep />`
  - Guards via `redirectForStep('analyzing', state)`.
  - Renders `<AnalyzingStrip running gateReady={allAnswered} onComplete={finish} />` above the current `<QuestionCard>`.
  - Local `step` index 0..4 over `QUESTIONS`; on select → `session.setAnswer(id, value)` then advance.
  - `allAnswered` = all 5 answers present in `session.diagnosis.answers`.
  - `finish()` (fired by the strip's `onComplete`): `const analysis = deriveAnalysis({ gender, answers })` → `session.setAnalysis(analysis)` → `session.setReportId(crypto.randomUUID())` → `navigate('/diagnosis/ready')`.
  - **`finish` reads answers from a ref** (not stale closure) — capture `session.diagnosis` in a ref updated each render.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider, useSession } from '@/store/sessionStore';
import { AnalyzingStep } from './AnalyzingStep';

vi.mock('@/app/components/diagnosis/AnalyzingStrip', () => ({
  // deterministic stub: completes immediately once the gate is ready
  AnalyzingStrip: ({ gateReady, onComplete }: { gateReady: boolean; onComplete: () => void }) => {
    if (gateReady) onComplete();
    return <div data-testid="strip">strip gate={String(gateReady)}</div>;
  },
}));

let api: ReturnType<typeof useSession>;
function Boot() {
  api = useSession();
  if (api.diagnosis.gender !== 'male') api.setGender('male');
  if (api.diagnosis.photos.length === 0) api.addPhoto({ id: 'p', angleKey: 'front', thumb: 't', blobId: 'b' });
  return null;
}

function renderAnalyzing() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/analyzing', element: <><Boot /><AnalyzingStep /></> },
      { path: '/diagnosis/ready', element: <div>ready page</div> },
      { path: '/diagnosis/photos', element: <div>photos page</div> },
    ],
    { initialEntries: ['/diagnosis/analyzing'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

const ANSWER_LABELS = [/hairline/i, /1–5 years|1-5/i, /never/i, /^yes$/i, /both/i];

describe('AnalyzingStep', () => {
  it('walks the 5 questions, runs deriveAnalysis, sets a reportId, and advances', async () => {
    renderAnalyzing();
    for (const label of ANSWER_LABELS) {
      await userEvent.click(screen.getByRole('button', { name: label }));
    }
    expect(api.analysis).not.toBeNull();
    expect(api.analysis!.scale).toBe('norwood');
    expect(api.reportId).toMatch(/[0-9a-f-]{36}/);
    expect(screen.getByText('ready page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `AnalyzingStep.tsx`**

```tsx
import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useSession } from '@/store/sessionStore';
import { redirectForStep } from './guards';
import { QUESTIONS } from '@/app/components/diagnosis/questions';
import { QuestionCard } from '@/app/components/diagnosis/QuestionCard';
import { AnalyzingStrip } from '@/app/components/diagnosis/AnalyzingStrip';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers } from '@/domain/analysis/types';

export function AnalyzingStep() {
  const navigate = useNavigate();
  const session = useSession();
  const [step, setStep] = useState(0);
  const finishedRef = useRef(false);

  // keep latest diagnosis data reachable from the strip's onComplete callback
  const latest = useRef(session.diagnosis);
  latest.current = session.diagnosis;

  const redirect = redirectForStep('analyzing', session);
  if (redirect) return <Navigate to={redirect} replace />;

  const answers = session.diagnosis.answers;
  const allAnswered = useMemo(
    () => QUESTIONS.every((q) => answers[q.id] !== undefined),
    [answers],
  );

  const current = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  const onSelect = (id: keyof Answers, value: string) => {
    session.setAnswer(id, value as Answers[typeof id]);
    setStep((s) => Math.min(s + 1, QUESTIONS.length));
  };

  const finish = () => {
    if (finishedRef.current) return;
    const d = latest.current;
    if (!d.gender) return;
    finishedRef.current = true;
    const analysis = deriveAnalysis({ gender: d.gender, answers: d.answers as Answers });
    session.setAnalysis(analysis);
    session.setReportId(crypto.randomUUID());
    navigate('/diagnosis/ready');
  };

  return (
    <section className="mx-auto max-w-md flex flex-col gap-6">
      <AnalyzingStrip running gateReady={allAnswered} onComplete={finish} />
      {step < QUESTIONS.length ? (
        <QuestionCard
          question={current}
          index={step}
          total={QUESTIONS.length}
          value={answers[current.id] as string | undefined}
          onSelect={onSelect}
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">{/* finalizing */}</p>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run it and watch it pass** → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/diagnosis/AnalyzingStep.tsx src/app/routes/diagnosis/AnalyzingStep.test.tsx
git commit -m "feat: add analyzing step combining strip and questionnaire"
```

---

### Task 24: Ready step + email capture

**Files:**
- Create: `src/app/routes/diagnosis/ReadyStep.tsx`
- Create: `src/app/routes/diagnosis/ReadyStep.test.tsx`

**Interfaces:**
- Consumes: `useSession` (`analysis`, `reportId`, `setEmail`), `redirectForStep`, `useT`, `useNavigate`, `<Navigate>`.
- Produces: `<ReadyStep />`
  - Guards via `redirectForStep('ready', state)`.
  - Teaser: `t('scale.<scale>.label')`, `t('severity.<band>')`, and `analysis.flaggedZones.length`.
  - Email `<input type="email">` + submit. Validates `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; invalid → inline `role="alert"`, no navigation.
  - Valid → `session.setEmail(value)` then `navigate('/report/' + session.reportId)`.
  - `// TODO: email backend` comment where the send would be triggered.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider, useSession } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { ReadyStep } from './ReadyStep';

let api: ReturnType<typeof useSession>;
function Boot() {
  api = useSession();
  if (!api.analysis) {
    api.setGender('male');
    api.setAnalysis(deriveAnalysis({
      gender: 'male',
      answers: { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' },
    }));
    api.setReportId('rep-123');
  }
  return null;
}

function renderReady() {
  const router = createMemoryRouter(
    [
      { path: '/diagnosis/ready', element: <><Boot /><ReadyStep /></> },
      { path: '/report/:reportId', element: <div>report page</div> },
      { path: '/diagnosis/analyzing', element: <div>analyzing page</div> },
    ],
    { initialEntries: ['/diagnosis/ready'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

describe('ReadyStep', () => {
  it('rejects an invalid email', async () => {
    renderReady();
    await userEvent.type(screen.getByRole('textbox'), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /send|שליחה/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('report page')).not.toBeInTheDocument();
  });

  it('accepts a valid email, stores it, and routes to the report', async () => {
    renderReady();
    await userEvent.type(screen.getByRole('textbox'), 'a@b.com');
    await userEvent.click(screen.getByRole('button', { name: /send|שליחה/i }));
    expect(api.account.email).toBe('a@b.com');
    expect(screen.getByText('report page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL.

- [ ] **Step 3: Implement `ReadyStep.tsx`**

```tsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { redirectForStep } from './guards';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ReadyStep() {
  const t = useT();
  const navigate = useNavigate();
  const session = useSession();
  const [email, setEmailValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirect = redirectForStep('ready', session);
  if (redirect) return <Navigate to={redirect} replace />;

  const a = session.analysis!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setError(t('ready.email.invalid')); return; }
    session.setEmail(email.trim());
    // TODO: email backend — trigger the PDF render + send here.
    navigate(`/report/${session.reportId}`);
  }

  return (
    <section className="mx-auto max-w-md text-center flex flex-col gap-6">
      <h1 className="text-2xl">{t('ready.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('ready.teaser', {
          scale: t(`scale.${a.scale}.label` as never),
          severity: t(`severity.${a.severityBand}` as never),
          zones: a.flaggedZones.length,
        })}
      </p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder={t('ready.email.placeholder')}
          className="rounded-md border border-input bg-input-background px-4 py-3 text-sm"
          aria-label={t('ready.email.placeholder')}
        />
        <button type="submit" className="rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm">
          {t('ready.email.submit')}
        </button>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      </form>
      <p className="text-[11px] text-muted-foreground">{t('ready.consent')}{/* TODO: confirm with client — consent/legal copy */}</p>
    </section>
  );
}
```

- [ ] **Step 4: Add keys** `ready.title` (`'Your hair analysis is ready'` / `'אבחון השיער שלך הושלם בהצלחה'`), `ready.teaser` (`'{scale} · {severity} pattern · {zones} area(s) flagged'` / `'{scale} · דפוס {severity} · {zones} אזורים מסומנים'`), `ready.email.placeholder` (`'Email address'` / `'כתובת אימייל'`), `ready.email.submit` (`'Send my personalized results'` / `'שליחת התוצאות האישיות שלי'`), `ready.email.invalid` (`'Please enter a valid email address.'` / `'נא להזין כתובת אימייל תקינה.'`), `ready.consent` (`'We\'ll email your report and may contact you about your plan.'` / `'נשלח לך את הדוח ונוכל ליצור קשר בנוגע לתוכנית.'`).

- [ ] **Step 5: Run it and watch it pass** → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/diagnosis/ReadyStep.tsx src/app/routes/diagnosis/ReadyStep.test.tsx src/i18n/
git commit -m "feat: add analysis-ready step with email capture"
```

---

### Task 25: Wire diagnosis routes + full-flow test

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/app/routes/diagnosis/diagnosis.test.tsx`

**Interfaces:**
- Consumes: `DiagnosisLayout`, `IntroStep`, `GenderStep`, `PhotosStep`, `AnalyzingStep`, `ReadyStep`.
- Produces: nested route `/diagnosis` → `DiagnosisLayout` with children: index → `IntroStep`, `gender` → `GenderStep`, `photos` → `PhotosStep`, `analyzing` → `AnalyzingStep`, `ready` → `ReadyStep`. Plus a catch-all `path: '*'` → `<Navigate to="/" replace />`.

- [ ] **Step 1: Write the full-flow test**

`src/app/routes/diagnosis/diagnosis.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { DiagnosisLayout } from './DiagnosisLayout';
import { IntroStep } from './IntroStep';
import { GenderStep } from './GenderStep';
import { PhotosStep } from './PhotosStep';
import { AnalyzingStep } from './AnalyzingStep';
import { ReadyStep } from './ReadyStep';

vi.mock('@/app/components/diagnosis/downscaleImage', () => ({
  computeDownscaledSize: (w: number, h: number) => ({ width: w, height: h }),
  downscaleImage: vi.fn(async () => ({
    blob: new Blob(['x'], { type: 'image/jpeg' }), dataUrl: 'data:image/jpeg;base64,AAAA', width: 10, height: 10,
  })),
}));
vi.mock('@/app/components/diagnosis/AnalyzingStrip', () => ({
  AnalyzingStrip: ({ gateReady, onComplete }: { gateReady: boolean; onComplete: () => void }) => {
    if (gateReady) onComplete();
    return <div data-testid="strip" />;
  },
}));

function renderApp() {
  const router = createMemoryRouter(
    [
      {
        path: '/diagnosis',
        element: <DiagnosisLayout />,
        children: [
          { index: true, element: <IntroStep /> },
          { path: 'gender', element: <GenderStep /> },
          { path: 'photos', element: <PhotosStep /> },
          { path: 'analyzing', element: <AnalyzingStep /> },
          { path: 'ready', element: <ReadyStep /> },
        ],
      },
      { path: '/report/:reportId', element: <div>REPORT</div> },
    ],
    { initialEntries: ['/diagnosis'] },
  );
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

describe('diagnosis flow (end to end)', () => {
  it('goes intro → gender → photos → questionnaire → ready → report', async () => {
    renderApp();

    await userEvent.click(screen.getByRole('button', { name: /start|התחלה/i }));
    await userEvent.click(screen.getByRole('button', { name: /^male$|^גבר$/i }));

    // photos
    const input = screen.getAllByLabelText(/front|top|crown|hairline|קדמי|עליון|קודקוד|קו שיער/i)[0];
    await userEvent.upload(input, new File(['b'], 'f.jpg', { type: 'image/jpeg' }));
    await userEvent.click(screen.getByRole('button', { name: /continue|המשך/i }));

    // 5 questions
    for (const label of [/hairline/i, /1–5 years|1-5/i, /never/i, /^yes$/i, /both/i]) {
      await userEvent.click(screen.getByRole('button', { name: label }));
    }

    // ready → email → report
    await userEvent.type(screen.getByRole('textbox'), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send|שליחה/i }));
    expect(screen.getByText('REPORT')).toBeInTheDocument();
  });

  it('deep-linking to /diagnosis/analyzing with no data bounces back to gender', () => {
    const router = createMemoryRouter(
      [{
        path: '/diagnosis', element: <DiagnosisLayout />,
        children: [
          { index: true, element: <IntroStep /> },
          { path: 'gender', element: <div>GENDER</div> },
          { path: 'analyzing', element: <AnalyzingStep /> },
        ],
      }],
      { initialEntries: ['/diagnosis/analyzing'] },
    );
    render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
    expect(screen.getByText('GENDER')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail** → FAIL (routes not wired in `App.tsx` — but this test builds its own router, so it should actually pass once the imports resolve; the real purpose is to lock the nested-route shape. If it passes already, still add the wiring in Step 3.)

- [ ] **Step 3: Wire routes in `App.tsx`**

```tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { Landing } from './routes/landing/Landing';
import { ReportPlaceholder } from './routes/report/ReportPlaceholder';
import { DiagnosisLayout } from './routes/diagnosis/DiagnosisLayout';
import { IntroStep } from './routes/diagnosis/IntroStep';
import { GenderStep } from './routes/diagnosis/GenderStep';
import { PhotosStep } from './routes/diagnosis/PhotosStep';
import { AnalyzingStep } from './routes/diagnosis/AnalyzingStep';
import { ReadyStep } from './routes/diagnosis/ReadyStep';

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    path: '/diagnosis',
    element: <DiagnosisLayout />,
    children: [
      { index: true, element: <IntroStep /> },
      { path: 'gender', element: <GenderStep /> },
      { path: 'photos', element: <PhotosStep /> },
      { path: 'analyzing', element: <AnalyzingStep /> },
      { path: 'ready', element: <ReadyStep /> },
    ],
  },
  { path: '/report/:reportId', element: <ReportPlaceholder /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>
  );
}
```

- [ ] **Step 4: Run the whole suite + build**

Run: `pnpm test && pnpm build`
Expected: every suite passes; build succeeds.

- [ ] **Step 5: Dev walkthrough (manual)**

`pnpm dev` → complete the flow end to end in Hebrew, then again in English via the toggle. Confirm RTL layout (progress rail, buttons, form) looks correct in Hebrew and the analysis-ready teaser reads sensibly.

- [ ] **Step 6: Commit**

```bash
git add src/app/App.tsx src/app/routes/diagnosis/diagnosis.test.tsx
git commit -m "feat: wire diagnosis routes end to end"
```

---

## Self-review (completed against the spec)

**Spec coverage (P0–P1 scope):**
- §4.1 repo repurposing → Tasks 1, 2, 5. §4.2 routing → Tasks 5, 12, 15, 25. §4.3 i18n/RTL → Tasks 7, 8; logical-property rule in Global Constraints. §4.4 tokens/fonts → Task 4. §4.5 persistence → Tasks 9, 10. §4.6 content config + PENDING → Task 6. §4.7 deriveAnalysis → Task 13. §4.9 folder structure → followed throughout.
- §5.1–5.5 diagnosis steps → Tasks 16, 17, 20, 23, 24. §5.4 §8/§9 combined screen → Tasks 22, 23. §5.6 honesty guard → Task 14 copy is plain-language/non-diagnostic; Global Constraints. §5.7 reuse-ready components → PhotoUpload/AnalyzingStrip/QuestionCard/deriveAnalysis are standalone (Tasks 13, 19, 21, 22).
- §9 error handling: step guards (Task 15), unknown `:step`/catch-all (Task 25), invalid email (Task 24), photo type/size (Task 19), corrupt-JSON persistence fallback (Task 9). Quota eviction is stubbed with a `console.warn` in Task 9 and fully handled in P2c (progress photos) — noted, not silently dropped.
- §10 testing: Vitest wired (Task 3); pure-domain TDD (Tasks 13, 18); parity + key-resolution (Tasks 7, 14); render + flow tests (Tasks 11, 12, 16–25).
- §11 stub inventory: `// TODO: email backend` (Task 24), `// TODO: confirm with client` for gender third option (Task 17), min photo count (Task 20), consent copy (Task 24), clinical Hebrew (Task 14).
- **Out of P0–P1 scope, deferred to their own plans:** report/`buildReport`/`ReportModel`/PDF (P2a), auth/plan/checkout/`program`/`deriveSchedule` (P2b), app shell/`deriveRescan`/reorder (P2c). `ReportPlaceholder` (Task 12) is the temporary terminus and is explicitly replaced in P2a.

**Placeholder scan:** no "TBD"/"implement later"/"add error handling" left; every code step has real code; every i18n key added has both en + he values specified.

**Type consistency:** `HairAnalysis`, `Answers`, `Gender`, `ZoneKey` defined once in Task 13's `types.ts` and imported everywhere (`sessionStore` Task 10, `guards` Task 15, `questions` Task 21, `AnalyzingStep` Task 23, `ReadyStep` Task 24). `PhotoRef`/`AngleKey` defined once in Task 10 and consumed by `PhotoUpload` (19) and `PhotosStep` (20). `redirectForStep` signature identical across Tasks 15, 20, 23, 24. Message-key helper (`t`) signature identical across all UI tasks. **Task order note:** Task 10 (`sessionStore`) imports from Task 13's `types.ts`; execute Task 13 before Task 10, or create `src/domain/analysis/types.ts` first.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-01-roote-p0-p1-foundations-and-diagnosis.md`.**

Two things before execution:

1. **Task 1 initializes a git repository** in this folder (it is not one today) so the per-task commits in every subsequent task work. If you would rather not, say so and I will drop the commit steps.
2. **P2a / P2b / P2c** (report + PDF, account + payment, post-purchase app) each get their own plan, written after P1 lands and after you have answers to the spec's §13 open questions — especially **pricing** and any **effectiveness figures**, which otherwise render as `[PENDING]`.

Execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — I execute tasks in this session using executing-plans, batch execution with checkpoints for review.

Which approach?
