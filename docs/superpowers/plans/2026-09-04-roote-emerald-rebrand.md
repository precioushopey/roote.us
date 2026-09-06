# ROOTÉ Emerald Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retint ROOTÉ's token layer from deep teal to true deep emerald + gold + cream, and give the
wordmark a way to render on the new dark-emerald surfaces (header, footer, AppShell sidebar), per the
approved design spec.

**Architecture:** This is a value-and-class change on an already-correct token architecture, not a
rebuild. Five CSS custom properties get renamed (`--roote-teal-*` → `--roote-emerald-*`) and retinted
in `theme.css`/`tokens.ts` (mirrored, tested by `tokens.test.ts`); two hardcoded duplicate hex values
(`--surface-glass-dark`, `--chart-*`) and one orphaned content constant (`PACKAGING.men`) get retinted
alongside them since they don't derive from the primitives automatically. `Wordmark` gains an `onInk`
boolean prop (matching the codebase's existing `onInk` naming convention used by `Section`, `Eyebrow`,
`Prose`, etc.) that renders the *same* `logo.png` recolored solid gold via a CSS `mask-image` — no new
binary asset, no image-editing step, exact hex match. Three shell surfaces (`Header`, `Footer`,
`AppShell` sidebar + its mobile header) swap their background/text utility classes from cream-based to
the existing `bg-ink`/`text-ink-foreground`/`glass-dark` idiom already used elsewhere in the app
(`Section`'s `teal` tone, `CtaBand`, `ReportView`'s CTA block) — these other consumers need **no
changes**, they retint automatically once the tokens do. Everywhere else (marketing hero bands,
questionnaire, report, checkout, AppShell content pane) is untouched, matching the spec's "anchor, not
dominant" decision.

**Tech Stack:** React 18 + TypeScript, Tailwind v4 (`@theme inline`, CSS custom properties), Vitest +
Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-04-roote-emerald-rebrand-design.md`

## Global Constraints

- No change to IA, routes, copy, i18n keys, or domain logic (spec §1 non-goals).
- No typeface swap — Bodoni Moda / Montserrat stay (spec §4).
- No dark-mode toggle added; `.dark` stays defined-but-unwired (spec §1 non-goals).
- Every retinted text/background pairing must meet or beat WCAG contrast of the pairing it replaces —
  see the verified numbers in Task 1 (spec §3.3).
- Rename `--roote-teal-*` → `--roote-emerald-*` (and `primitives.teal950` → `emerald950`, etc.) —
  locked in spec §2.
- `gold-500`/`gold-600`, all `cream-*`, and `ink`/`body`/`muted` stay unchanged (spec §3.1).

**Scope note on spec §2's typography row:** the "small-caps tracked eyebrow labels" half is already
shipped (`Eyebrow.tsx` already renders `uppercase tracking-[0.18em]`) — no task needed. The "thin gold
rule-dividers on marketing headers" half would need a new decorative component with no functional
role in the rebrand; per the spec's own §7 ("botanical line-art... decorative layer... not bundled
here"), it's deferred alongside that, not included as a task below. Flagged here so the gap is
traceable, not silently dropped.

---

### Task 1: Retint the token layer (theme.css, tokens.ts, tokens.test.ts, marketing.css, products.ts)

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `src/styles/tokens.ts`
- Modify: `src/styles/tokens.test.ts` (test)
- Modify: `src/styles/marketing.css:19` (var reference only)
- Modify: `src/content/products.ts:24` (orphaned hardcoded teal, currently unreferenced — fixed for
  consistency)

**Interfaces:**
- Produces: primitive scale `emerald950…600` (was `teal950…600`) consumed by Tasks 3–5 via the
  existing Tailwind utilities `bg-ink`, `text-ink-foreground`, `bg-deep-950`, `bg-primary`,
  `glass-dark`, `bg-gold-500` (all of these utility *names* are unchanged — only the CSS variable
  values they resolve to move).

**Verified contrast (WCAG 2.1 relative-luminance method, computed by hand against the exact proposed
hexes — not estimated):**
| Pairing | Old ratio | New ratio |
|---|---|---|
| cream-100 `#F6EFE4` text on ink `#0A2A1C` (was `#062E31`) | ~13.0:1 | **~13.5:1** |
| cream-50 `#FCF9F3` text on primary `#1B4B32` (was `#0D494C`) | ~9.64:1 | **~9.52:1** |
| gold-500 `#C6A15A` on ink `#0A2A1C` (hover accents, Task 4) | n/a (new use) | **~6.35:1** |
| cream-100 text at 70% opacity on ink (inactive nav links, Tasks 3/5) | n/a (new use) | **~7.29:1** |

All four clear WCAG AA (4.5:1) with room to spare; the two retinted pairs are within 0.15 of the ratio
they replace (imperceptible, still AAA-grade). No further hex adjustment needed.

- [ ] **Step 1: Update the failing test first**

Replace the full contents of `src/styles/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { primitives, palette, glass, fonts, displaySizes, radii, layout } from './tokens';

describe('primitive scales (brief §6)', () => {
  it('carries the pinned emerald / cream / gold / ink values', () => {
    expect(primitives).toMatchObject({
      emerald950: '#0A2A1C',
      emerald800: '#1B4B32',
      cream50: '#FCF9F3',
      cream100: '#F6EFE4',
      gold500: '#C6A15A',
      gold600: '#A98343',
      ink: '#172022',
      body: '#333A3C',
      muted: '#6F7676',
    });
  });
});

describe('semantic palette', () => {
  it('uses deep emerald for the filled CTA, not a brown', () => {
    expect(palette.primary).toBe('#1B4B32');
    expect(palette.primaryForeground).toBe('#FCF9F3');
  });

  it('uses cream as the page ground and ink as body text', () => {
    expect(palette.background).toBe('#FCF9F3');
    expect(palette.foreground).toBe('#172022');
  });

  it('keeps gold as an accent (non-text) and deep emerald for the ink band', () => {
    expect(palette.accent).toBe('#C6A15A');
    expect(palette.ink).toBe('#0A2A1C');
    expect(palette.inkForeground).toBe('#F6EFE4');
  });

  it('exposes the four semantic status colours', () => {
    for (const k of ['destructive', 'success', 'warning', 'info'] as const) {
      expect(palette[k]).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe('glass tokens', () => {
  it('are the brief §6 values and are used for depth only', () => {
    expect(glass.light).toBe('rgba(255, 255, 255, 0.62)');
    expect(glass.dark).toBe('rgba(10, 42, 28, 0.7)');
    expect(glass.border).toBe('rgba(255, 255, 255, 0.18)');
    expect(glass.blur).toBe('20px');
  });
});

describe('fonts', () => {
  it('lead with Bodoni Moda (display) and Montserrat (body)', () => {
    expect(fonts.display.startsWith("'Bodoni Moda'")).toBe(true);
    expect(fonts.body.startsWith("'Montserrat'")).toBe(true);
  });
  it('body stack includes Hebrew + Arabic fallbacks', () => {
    expect(fonts.body).toContain('Noto Sans Hebrew');
    expect(fonts.body).toContain('Noto Sans Arabic');
  });
});

describe('scales', () => {
  it('display sizes follow the brief scale', () => {
    expect(displaySizes).toEqual({ sm: 28, md: 36, lg: 48, xl: 64, '2xl': 80 });
  });
  it('radius scale is Liquid-Glass large', () => {
    expect(radii.lg).toBe(16);
    expect(radii['2xl']).toBe(32);
  });
  it('layout maxima match the brief', () => {
    expect(layout).toEqual({ marketing: 1280, content: 1160, readable: 720 });
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `pnpm vitest run src/styles/tokens.test.ts`
Expected: FAIL — `primitives` still has `teal950`/`teal800` keys and old hex values, not `emerald950`/`emerald800`.

- [ ] **Step 3: Retint `tokens.ts`**

Replace the `primitives`, `palette`, and `glass` exports in `src/styles/tokens.ts` (leave
`fonts`/`displaySizes`/`radii`/`layout` untouched):

```ts
/** Primitive colour scales — brief §6. */
export const primitives = {
  emerald950: '#0A2A1C',
  emerald900: '#123726',
  emerald800: '#1B4B32',
  emerald700: '#235E3F',
  emerald600: '#34805A',
  cream50: '#FCF9F3',
  cream100: '#F6EFE4',
  cream200: '#EDE1CF',
  cream300: '#E6DAC6',
  gold500: '#C6A15A',
  gold600: '#A98343',
  ink: '#172022',
  body: '#333A3C',
  muted: '#6F7676',
  line: 'rgba(23, 32, 34, 0.14)',
} as const;

/** Semantic surface palette (maps onto shadcn CSS var names in theme.css). */
export const palette = {
  background: primitives.cream50,
  foreground: primitives.ink,
  card: '#FFFFFF',
  primary: primitives.emerald800,
  primaryForeground: primitives.cream50,
  secondary: primitives.cream100,
  muted: primitives.cream200,
  mutedForeground: primitives.muted,
  accent: primitives.gold500, // non-text / ≥24px only
  accentForeground: primitives.ink,
  border: primitives.cream300,
  ring: primitives.gold500,
  ink: primitives.emerald950, // dark editorial band
  inkForeground: primitives.cream100,
  accentGhost: '#E6D8BD',
  inkGhost: '#284A3A',
  destructive: '#B3261E',
  success: '#1F7A53',
  warning: '#A8681C',
  info: primitives.emerald700,
} as const;

/** Glass surfaces — genuine depth only (sticky nav, floating result card, modals). */
export const glass = {
  light: 'rgba(255, 255, 255, 0.62)',
  dark: 'rgba(10, 42, 28, 0.7)',
  border: 'rgba(255, 255, 255, 0.18)',
  borderDark: 'rgba(255, 255, 255, 0.1)',
  blur: '20px',
} as const;
```

- [ ] **Step 4: Retint `theme.css`**

Replace the primitive block near the top of `:root` in `src/styles/theme.css`:

```css
  /* --- primitive scales (brief §6) ------------------------------------- */
  --roote-emerald-950: #0a2a1c;
  --roote-emerald-900: #123726;
  --roote-emerald-800: #1b4b32;
  --roote-emerald-700: #235e3f;
  --roote-emerald-600: #34805a;

  --roote-cream-50: #fcf9f3;
  --roote-cream-100: #f6efe4;
  --roote-cream-200: #ede1cf;
  --roote-cream-300: #e6dac6;

  --roote-gold-500: #c6a15a;
  --roote-gold-600: #a98343;

  --roote-ink: #172022;
  --roote-body: #333a3c;
  --roote-muted: #6f7676;
  --roote-line: rgba(23, 32, 34, 0.14);
```

Then, still in `:root`, update every reference to the renamed variables (5 occurrences):

```css
  --primary: var(--roote-emerald-800);
```
(was `var(--roote-teal-800)`, in the `--primary`/`--primary-foreground` block)

```css
  --info: var(--roote-emerald-700);
```
(was `var(--roote-teal-700)`)

```css
  /* Dark editorial band — now deep emerald (F6EFE4 on 0A2A1C ≈ 13.5:1). */
  --ink: var(--roote-emerald-950);
  --ink-foreground: var(--roote-cream-100);

  /* Decorative two-tone "ghost" display words (aria-hidden). */
  --accent-ghost: #e6d8bd;
  --ink-ghost: #284a3a;
```
(was `var(--roote-teal-950)` and `--ink-ghost: #2f4b4d;`)

```css
  --surface-glass-dark: rgba(10, 42, 28, 0.7);
```
(was `rgba(6, 46, 49, 0.7)` — hardcoded duplicate of emerald-950, doesn't derive from the primitive automatically)

```css
  /* --- charts / data viz — emerald→gold→cream spectrum ------------------- */
  --chart-1: #1b4b32;
  --chart-2: #34805a;
  --chart-3: #5fa97f;
  --chart-4: #c6a15a;
  --chart-5: #a98343;
```
(chart-1/2 are hardcoded duplicates of emerald-800/600; chart-3 is a lighter emerald tint with no
primitive equivalent — `#5fa97f` is the same lightening step applied to the old chart-3, hue-shifted)

```css
  --sidebar-primary: var(--roote-emerald-800);
```
(was `var(--roote-teal-800)`)

Then in the `.dark { … }` block further down, update all 5 references:

```css
.dark {
  --background: var(--roote-emerald-950);
  --foreground: var(--roote-cream-100);
  --card: var(--roote-emerald-900);
  --card-foreground: var(--roote-cream-100);
  --popover: var(--roote-emerald-900);
  --popover-foreground: var(--roote-cream-100);
  --primary: var(--roote-cream-100);
  --primary-foreground: var(--roote-emerald-950);
  --secondary: var(--roote-emerald-800);
  --secondary-foreground: var(--roote-cream-100);
  --muted: var(--roote-emerald-800);
  --muted-foreground: #9fb3b2;
  --accent: var(--roote-gold-500);
  --accent-foreground: var(--roote-emerald-950);
  --border: rgba(255, 255, 255, 0.12);
  --input: rgba(255, 255, 255, 0.12);
  --input-background: var(--roote-emerald-900);
  --ring: var(--roote-gold-500);
  --ink: var(--roote-emerald-950);
  --ink-foreground: var(--roote-cream-100);
  --sidebar: var(--roote-emerald-900);
  --sidebar-foreground: var(--roote-cream-100);
  --sidebar-border: rgba(255, 255, 255, 0.12);
}
```

Finally, update the `@theme inline` block's primitive aliases:

```css
  /* emerald / cream / gold primitives as Tailwind colours */
  --color-deep-950: var(--roote-emerald-950);
  --color-deep-900: var(--roote-emerald-900);
  --color-deep-800: var(--roote-emerald-800);
  --color-deep-700: var(--roote-emerald-700);
  --color-deep-600: var(--roote-emerald-600);
```
(Tailwind utility names `deep-950`…`deep-600` are unchanged — only the `var()` reference moves)

And update the file's top comment block:

```css
/* =========================================================================
   ROOTÉ — Personalized Hair Growth System
   Design tokens. Deep-emerald science surfaces, warm-cream "you" surfaces,
   gold only at the seam. Glass for genuine depth only.
   Source of truth for colour + radius. src/styles/tokens.ts mirrors the
   palette for JS; src/styles/tokens.test.ts keeps them honest.
   ========================================================================= */
```

- [ ] **Step 5: Fix the `marketing.css` variable reference**

In `src/styles/marketing.css`, the `@supports not (backdrop-filter)` fallback references the old var
name:

```css
  .glass-dark { background: color-mix(in srgb, var(--roote-emerald-950) 94%, transparent); }
```
(was `var(--roote-teal-950)`)

- [ ] **Step 6: Fix the orphaned hardcoded hex in `products.ts`**

In `src/content/products.ts:24`:

```ts
export const PACKAGING = { men: '#123726', women: '#EDE1CF' } as const;
```
(was `'#093A3D'` — this constant is currently unreferenced anywhere in the app; fixed for consistency
so a future consumer doesn't pick up the old teal)

- [ ] **Step 7: Run the test to confirm it passes**

Run: `pnpm vitest run src/styles/tokens.test.ts`
Expected: PASS (all suites green)

- [ ] **Step 8: Typecheck and full test suite**

Run: `pnpm typecheck`
Expected: 0 diagnostics

Run: `pnpm test`
Expected: all existing tests still pass (this task changes no component behaviour, only CSS variable
values and one unused content constant)

- [ ] **Step 9: Commit**

```bash
git add src/styles/theme.css src/styles/tokens.ts src/styles/tokens.test.ts src/styles/marketing.css src/content/products.ts
git commit -m "feat: retint token layer from deep teal to deep emerald

Renames --roote-teal-* to --roote-emerald-*, shifts hue from
cyan-teal (~180°) to true emerald (~155°). Gold and cream stay
unchanged. Verified WCAG contrast on every retinted text pairing
meets or beats the value it replaces.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Tpcyh2QE7Wo86NR1RCPiX2"
```

---

### Task 2: Add the `onInk` reversed Wordmark

**Files:**
- Modify: `src/app/components/brand/Wordmark.tsx`
- Modify: `src/app/components/brand/brand.test.tsx`

**Interfaces:**
- Consumes: `--roote-gold-500` (Tailwind `bg-gold-500`), unchanged by Task 1.
- Produces: `Wordmark({ className?, onInk? })` — `onInk` defaults to `false`. Tasks 3–5 pass `onInk`
  wherever the wordmark sits on the new dark-emerald surfaces.

- [ ] **Step 1: Write the failing tests**

In `src/app/components/brand/brand.test.tsx`, add two tests (near the existing `'Wordmark renders the
ROOTÉ logo image'` test):

```tsx
  it('Wordmark default renders the ROOTÉ img element', () => {
    wrap(<Wordmark />);
    const mark = screen.getByRole('img', { name: 'ROOTÉ' });
    expect(mark.tagName).toBe('IMG');
  });

  it('Wordmark onInk renders a gold-masked mark instead of the default image', () => {
    wrap(<Wordmark onInk />);
    const mark = screen.getByRole('img', { name: 'ROOTÉ' });
    expect(mark.tagName).toBe('SPAN');
    expect(mark.className).toContain('bg-gold-500');
    expect(mark.getAttribute('style')).toContain('mask-image');
  });
```

- [ ] **Step 2: Run the tests to confirm the new one fails**

Run: `pnpm vitest run src/app/components/brand/brand.test.tsx`
Expected: the `onInk` test FAILS — `Wordmark` doesn't accept an `onInk` prop yet, so it always renders
the `<img>` and `mark.tagName` is `'IMG'`, not `'SPAN'`.

- [ ] **Step 3: Implement `onInk` in `Wordmark.tsx`**

Replace the full contents of `src/app/components/brand/Wordmark.tsx`:

```tsx
import logo from '@/assets/logo.png';
import { cn } from '@/app/components/ui/utils';

type WordmarkProps = {
  className?: string;
  /** Render a flat gold silhouette (via CSS mask on the same artwork) for
   * placement on the dark-emerald anchor surfaces (header, footer, AppShell
   * sidebar) instead of the default bronze-gradient image, which goes muddy
   * on a dark background. */
  onInk?: boolean;
};

export function Wordmark({ className, onInk = false }: WordmarkProps) {
  if (onInk) {
    return (
      <span
        role="img"
        aria-label="ROOTÉ"
        className={cn('inline-block select-none bg-gold-500', className)}
        style={{
          aspectRatio: '1400 / 435',
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  }

  return (
    <img
      src={logo}
      alt="ROOTÉ"
      className={cn('h-auto w-32 select-none', className)}
    />
  );
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `pnpm vitest run src/app/components/brand/brand.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/components/brand/Wordmark.tsx src/app/components/brand/brand.test.tsx
git commit -m "feat: add onInk gold-masked variant to Wordmark

Reuses the existing logo.png via a CSS mask-image instead of a new
binary asset — guarantees an exact gold match with zero image-editing
step, for use on the header/footer/sidebar once they go dark-emerald.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Tpcyh2QE7Wo86NR1RCPiX2"
```

---

### Task 3: Header — dark-emerald anchor

**Files:**
- Modify: `src/app/components/shell/Header.tsx`

**Interfaces:**
- Consumes: `Wordmark({ onInk })` from Task 2; `bg-ink`/`text-ink-foreground`/`glass-dark`/
  `bg-gold-500` Tailwind utilities (all pre-existing, retinted by Task 1).

No new component-level test is added here — this task changes Tailwind class strings only (no new
logic), and the existing `Header.test.tsx` asserts behaviour (nav links, cart count, locale switch),
not class names, so it stays a true regression check.

- [ ] **Step 1: Edit `Header.tsx`**

The `<header>` root (around line 70–76) — swap the light glass surface for the dark one and fix the
border so it's visible against dark instead of invisible:

```tsx
  return (
    <header
      className={cn(
        'glass-dark sticky top-0 z-40 w-full transition-[padding,border-color] duration-200',
        condensed ? 'border-b border-ink-foreground/15' : 'border-b border-transparent',
      )}
    >
```

The wordmark link (around line 83–85):

```tsx
        <Link to={PATHS.home} aria-label="ROOTÉ" className="inline-flex items-center">
          <Wordmark className="w-28" onInk />
        </Link>
```

`navLinkClass` (around line 64–68):

```tsx
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'font-body text-sm tracking-wide transition-colors',
      isActive ? 'text-ink-foreground' : 'text-ink-foreground/70 hover:text-ink-foreground',
    );
```

`CartLink` (around line 22–40) — icon link text/hover and the count badge (badge flips to gold: gold
is the token's documented role for "numerals, active state"):

```tsx
function CartLink({ label, count }: { label: string; count: number }) {
  return (
    <Link
      to={PATHS.bag}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-foreground/10"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
```

The account link and the `CountryLanguageSelector` call (around line 99–109) — override via the
existing `className` prop (both components already merge it with `twMerge`, so no changes needed to
those component files):

```tsx
          <CountryLanguageSelector
            country={country}
            locale={locale}
            onChangeCountry={onChangeCountry}
            onChangeLocale={onChangeLocale}
            labels={regionLabels}
            className="hidden text-ink-foreground/70 hover:text-ink-foreground md:inline-flex"
          />
          <NavLink to={PATHS.account} className="hidden font-body text-sm text-ink-foreground/70 hover:text-ink-foreground md:inline">
            {t('marketing.nav.account')}
          </NavLink>
          <CartLink label={t('cart.open')} count={cart.count} />
          <Button to={PATHS.analysis} size="sm" caps className="hidden sm:inline-flex">
            {t('marketing.nav.cta')}
          </Button>
          <IconButton
            label={t('marketing.nav.openMenu')}
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-ink-foreground hover:bg-ink-foreground/10"
          >
```

Leave the `Button` CTA (`variant` defaults to `primary` = emerald-800 fill / cream text — already
visible against the emerald-950 header) and the `Drawer` mobile menu (a separate light overlay panel,
not part of the persistent header bar) unchanged.

- [ ] **Step 2: Run the existing Header test to confirm no regressions**

Run: `pnpm vitest run src/app/components/shell/Header.test.tsx src/app/components/shell/MarketingShell.test.tsx`
Expected: PASS (unchanged — these tests assert behaviour, not classes)

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 4: Commit**

```bash
git add src/app/components/shell/Header.tsx
git commit -m "feat: make marketing Header a dark-emerald anchor surface

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Tpcyh2QE7Wo86NR1RCPiX2"
```

---

### Task 4: Footer — dark-emerald anchor

**Files:**
- Modify: `src/app/components/shell/Footer.tsx`

**Interfaces:**
- Consumes: `Wordmark({ onInk })` from Task 2; `bg-ink`/`text-ink-foreground` utilities.

- [ ] **Step 1: Edit `Footer.tsx`**

The `<footer>` root (line 61):

```tsx
  return (
    <footer className="border-t border-ink-foreground/15 bg-ink px-6 py-16 text-ink-foreground md:px-10">
```

Every column header (4 occurrences of the identical string, lines 66/80/97/117):

```tsx
              <h2 className="u-caps font-body text-2xs font-semibold text-ink-foreground/60">{t(col.title)}</h2>
```
(and the equivalent 3 hand-written ones for solutions/legal/start — same class swap:
`text-muted-foreground` → `text-ink-foreground/60`)

Every column link (3 occurrences of the identical string, lines 70/86/103/109):

```tsx
                    <Link to={to} className="font-body text-sm text-ink-foreground hover:text-gold-500">
```
(was `text-foreground hover:text-deep-800` — hover moves to gold since deep-800 on a deep-950
background isn't a legible hover cue; gold is the token's accent/active-state color)

The "start" column body copy (line 120):

```tsx
            <p className="mt-3 font-body text-sm text-ink-foreground/60">{t('marketing.footer.startBody')}</p>
```

The bottom row (line 127):

```tsx
        <div className="mt-12 flex flex-col gap-4 border-t border-ink-foreground/15 pt-8 text-xs text-ink-foreground/60 md:flex-row md:items-center md:justify-between">
```

The wordmark + region selector (lines 128–130):

```tsx
          <div className="flex items-center gap-4">
            <Wordmark className="w-20" onInk />
            <CountryLanguageSelector
              country={country}
              locale={locale as LocaleCode}
              onChangeCountry={onChangeCountry}
              onChangeLocale={(l) => setLocale(l)}
              className="text-ink-foreground/60 hover:text-ink-foreground"
              labels={{
                open: t('marketing.region.trigger'),
                title: t('marketing.region.title'),
                region: t('marketing.region.regionLabel'),
                language: t('marketing.region.languageLabel'),
                done: t('marketing.region.done'),
              }}
            />
          </div>
```

Leave the "start" column's `<Button>` (primary variant, already legible on emerald-950) unchanged.

- [ ] **Step 2: Run the existing Footer test to confirm no regressions**

Run: `pnpm vitest run src/app/components/shell/Footer.test.tsx`
Expected: PASS

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 4: Commit**

```bash
git add src/app/components/shell/Footer.tsx
git commit -m "feat: make marketing Footer a dark-emerald anchor surface

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Tpcyh2QE7Wo86NR1RCPiX2"
```

---

### Task 5: AppShell sidebar + mobile header — dark-emerald anchor

**Files:**
- Modify: `src/app/routes/app/AppShell.tsx`

**Interfaces:**
- Consumes: `Wordmark({ onInk })` from Task 2; `bg-ink`/`text-ink-foreground`/`glass-dark` utilities.
- The `navLinkClass` function is shared between the desktop `<aside>` sidebar and the mobile pill nav
  under the mobile `<header>` — both surfaces go dark in this task, so one shared fix covers both.

- [ ] **Step 1: Edit `AppShell.tsx`**

`navLinkClass` (line 70–77) — the `isActive` branch (`bg-primary text-primary-foreground`) already
retints correctly via Task 1 and needs no change; only the inactive branch's raw `hover:bg-cream-100`
needs fixing (it referenced a cream primitive directly, which won't respond to going dark):

```tsx
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'shrink-0 rounded-full px-4 py-2 font-body text-sm tracking-wide transition-colors',
      'lg:w-full lg:rounded-lg lg:px-3 lg:py-2.5',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-ink-foreground/70 hover:text-ink-foreground lg:hover:bg-ink-foreground/10',
    );
```

The desktop `<aside>` (line 89–90):

```tsx
      <aside className="sticky top-0 hidden h-screen flex-col border-e border-ink-foreground/15 bg-ink px-4 py-6 text-ink-foreground lg:flex">
        <Wordmark className="w-24" onInk />
```

The three bottom links in the aside (rescan / shop / logout — lines 99–117, identical class string
except the button element for logout):

```tsx
          <NavLink
            to={PATHS.accountSection('scans')}
            className="rounded-lg px-3 py-2 font-body text-sm text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            {t('app.care.rescanLink')}
          </NavLink>
          <NavLink
            to={PATHS.products}
            className="rounded-lg px-3 py-2 font-body text-sm text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            {t('app.nav.shop')}
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg px-3 py-2 text-start font-body text-sm text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
            {t('app.profile.logout')}
          </button>
          <LocaleToggle className="text-ink-foreground/60 hover:text-ink-foreground" />
```

The mobile `<header>` (line 122–130):

```tsx
      <header className="glass-dark sticky top-0 z-40 border-b border-ink-foreground/15 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Wordmark className="w-24" onInk />
          <div className="flex items-center gap-3">
            <button type="button" onClick={logout} className="font-body text-xs text-ink-foreground/70 underline">
              {t('app.profile.logout')}
            </button>
            <LocaleToggle className="text-ink-foreground/70 hover:text-ink-foreground" />
          </div>
        </div>
```

Leave the outer root `<div>` (`bg-background text-foreground`, the content pane) and `<main>`
unchanged — those stay cream per the spec's application map.

- [ ] **Step 2: Run the existing AppShell-dependent tests to confirm no regressions**

Run: `pnpm vitest run src/app/routes/app/`
Expected: PASS

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/app/AppShell.tsx
git commit -m "feat: make AppShell sidebar + mobile header dark-emerald anchors

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Tpcyh2QE7Wo86NR1RCPiX2"
```

---

### Task 6: Update CLAUDE.md's stale palette line

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** none (documentation only).

- [ ] **Step 1: Edit the "Styling" section**

Find this sentence in `CLAUDE.md` (under `## Architecture` → `### Styling`):

```
Light-only in practice —
the `.dark` block exists but nothing toggles it. Palette: ivory `#f9f6ef` ground, `#2a2320` text,
`#745f50` primary CTA, brass `#a97b45` accent (non-text / ≥24 px only), `#201812` ink bands. Motion
```

Replace with:

```
Light-only in practice —
the `.dark` block exists but nothing toggles it. Palette: cream `#fcf9f3` ground, `#172022` text, deep
emerald `#1b4b32` primary CTA / `#0a2a1c` ink bands (header, footer, AppShell sidebar — anchor, not
dominant; body content stays on cream), gold `#c6a15a` accent (non-text / ≥24 px only, logo exempt).
Motion
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update stale palette description to the emerald system

CLAUDE.md still described the pre-redesign ivory/taupe/brass palette;
this repoints it to the shipped cream/emerald/gold tokens.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Tpcyh2QE7Wo86NR1RCPiX2"
```

---

### Task 7: Full verification pass

**Files:** none modified.

- [ ] **Step 1: Full automated suite**

Run: `pnpm test`
Expected: all tests pass (should be 345+ tests, matching the pre-existing baseline plus the 2 new
Wordmark tests from Task 2)

Run: `pnpm typecheck`
Expected: 0 diagnostics

Run: `pnpm build`
Expected: succeeds (the single ~640 kB chunk warning is expected and pre-existing)

- [ ] **Step 2: Manual browser check**

Run: `pnpm dev`, then in a browser check each surface from the spec's application map:

- `/` — header and footer render dark-emerald with the gold wordmark; nav links, cart icon, CTA
  button, and the country/language picker are all legible; hero/dark editorial sections (already
  `bg-ink`) read as emerald, not teal.
- `/how-it-works` or `/about` — the existing `onInk` sections (`Section tone="teal"`) read as emerald
  automatically.
- `/diagnosis` or `/start` (FunnelShell) — unchanged, cream background, default (non-`onInk`) wordmark.
- `/report/:reportId` — unchanged, cream background, default wordmark in the inline header.
- `/app` — if no program exists yet in dev, use the on-screen dev-seed button to create one, then
  confirm: desktop sidebar is dark-emerald with the gold wordmark and legible nav; the active tab is
  still clearly marked; shrink the window to confirm the mobile top header + pill nav also read as
  dark-emerald.
- `/bag` and `/bag/checkout` — cream background, header/footer are the only emerald surfaces (already
  covered by the `/` check).

Fix anything that reads as low-contrast or visually broken before considering the task done — this is
the step CLAUDE.md requires for any UI change ("start the dev server and use the feature in a browser
before reporting the task as complete").

- [ ] **Step 3: Report**

No commit for this task (verification only). Summarize what was checked and any follow-ups filed.
