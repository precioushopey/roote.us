# Six-Language i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ROOTÉ's language+region locale system with a language-only one — six selectable languages (`en` default, `he`, `ar`, `ru`, `fr`, `es`), URLs `/en`…`/es`, one dropdown picker everywhere — and fully translate `fr`/`ru`/`ar`/`es`.

**Architecture:** Three phases. **Phase 1** builds the unified `LanguagePicker` and swaps it in while the region system still exists (low risk — it only calls the existing `setLocale`). **Phase 2** removes the region axis: trims `locales.ts`, renames `localeRegion.ts` → `localeUrl.ts`, narrows `LocaleProvider`'s context, changes the route param `:localeRegion` → `:locale`, updates SEO + money. **Phase 3** fills the four translation files namespace-by-namespace, guarded by a plain-Node parity script; every chunk is an independent resumable checkpoint.

**Tech Stack:** React 18 + react-router (module-scoped `createBrowserRouter`), TypeScript strict (`tsc --noEmit`), Vite + esbuild, Tailwind v4 (logical utilities), `motion`. No test runner, no lint tooling.

**Spec:** `docs/superpowers/specs/2026-09-10-six-language-i18n-design.md`

## Global Constraints

- **Commit hold (user directive, 2026-09-10):** do **not** `git commit` or `git push` anything, this plan and spec included. Each task ends with a **Checkpoint** (run verification, leave changes in the working tree). Suggested commit messages are given per task for when the hold lifts.
- **No test suite.** Do not add `*.test.*` files or revive Vitest. Verification = `pnpm typecheck` (must stay at **0 diagnostics**), `node scripts/check-i18n-parity.mjs`, `pnpm build`, and manual browser passes.
- **EN/HE — and now all six — key parity.** Every key in `src/i18n/messages/en.ts` must exist in `he.ts`, `ar.ts`, `ru.ts`, `fr.ts`, `es.ts` with a non-empty value. No stray keys. `{var}` placeholders present in `en` must appear in every translation of that key.
- **Never invent product content.** `[PENDING: …]` marker text and interpolated config values are copied verbatim into translations — only the surrounding words are translated.
- **Legal / medical strings:** translate the meaning; where `he.ts` carries a "pending formal legal review" hedge, mirror it in the new locale.
- **RTL-safe styling.** Logical utilities only (`ms/me/ps/pe`, `text-start/-end`, `start-*/end-*`). Never `ml/mr/left/right` for layout. `ar` and `he` are `dir="rtl"`.
- **Domain layer stays pure** (`src/domain/**`, `src/content/pending.ts`, `money.ts`, `programProgress.ts`) — no React/DOM/storage/i18n-provider imports.
- `@` → `src/`. `figma:asset/*` → `src/assets/*`. Keep `vite.config.ts` and `tsconfig.json` path aliases aligned.
- Drive the module-scoped router with `history.pushState` **+** `dispatchEvent(new PopStateEvent('popstate'))` when testing programmatically.

---

## File Structure

**Phase 1 — picker**

| File | Responsibility |
|---|---|
| `src/app/components/roote/LanguagePicker.tsx` | *New.* Controlled language dropdown — trigger (globe + endonym) + `role="menu"` popover of the six `ENABLED_LOCALES`. Calls `useT()` for its own 3 labels. Keyboard + click-outside + `Esc`, RTL-safe. No animation library (matches the codebase — `motion` is a dep but imported nowhere in `src`; the `CountryLanguageSelector` it replaces had none). |
| `src/app/components/roote/index.ts` | Swap the `CountryLanguageSelector` export for `LanguagePicker`. |
| `src/i18n/messages/{en,he,ar,ru,fr,es}.ts` | Remove `locale.toggle.toHe/toEn` + `marketing.region.*` (5); add `nav.language.open/title/current` (3). |
| `src/app/components/shell/Header.tsx` | Render `<LanguagePicker>` (desktop compact + drawer). Drop `country` / `setLocaleRegion` / `onChangeCountry` / `regionLabels`. |
| `src/app/components/shell/Footer.tsx` | Render `<LanguagePicker>`. Drop the same. |
| `src/app/components/shell/FunnelShell.tsx` | `<LocaleToggle>` → `<LanguagePicker compact>`. |
| `src/app/routes/analysis/AnalysisShell.tsx` | `<LocaleToggle>` → `<LanguagePicker compact>`. |
| `src/app/routes/app/AppShell.tsx` | `<LocaleToggle>` ×2 → `<LanguagePicker compact>` ×2. |
| `src/app/components/brand/LocaleToggle.tsx` | *Deleted.* |
| `src/app/components/roote/CountryLanguageSelector.tsx` | *Deleted.* |

**Phase 2 — region axis removal**

| File | Responsibility |
|---|---|
| `src/i18n/locales.ts` | Language-only registry: `DEFAULT_LOCALE='en'`, `ENABLED_LOCALES=[...ALL_LOCALES]`. Delete `shipped`, `LOCALE_ROADMAP`, `SHIPPED_LOCALES`, `CurrencyCode`, `CountryDefault`, `COUNTRY_DEFAULTS`, `DEFAULT_COUNTRY`, `LAUNCH_CURRENCIES`, `launchCurrencyFor`, `countryDefault`. |
| `src/i18n/localeRegion.ts` → `src/i18n/localeUrl.ts` | *Renamed.* `isValidLocaleSegment`, `readStoredLocale`/`writeStoredLocale` (`localStorage['roote.locale']`), `resolveLocaleRedirect(pathname, storedLocale, acceptLanguage)`, unchanged `detectLocaleFromAcceptLanguage` + `applyLegacyRedirects`. |
| `src/i18n/LocaleProvider.tsx` | Context: `{ locale, contentLocale, dir, setLocale, t }`. Prop `locale?: LocaleCode`. `setLocale` navigates `/{l}` + rest-of-path + search. `useLocalizedPath` prefixes `/{locale}`. |
| `src/app/LocaleGate.tsx` | `useParams().locale`; validate with `isValidLocaleSegment`; import from `./localeUrl` path. |
| `src/app/App.tsx` | Route `path: '/:locale'`. |
| `src/seo/useDocumentMeta.ts` | Strip `/{locale}` prefix; emit 6 `hreflang` alternates + `x-default`. |
| `src/domain/report/money.ts` | `formatMoney(amount, currency, locale: LocaleCode)` using `LOCALES[locale].bcp47`. |
| `src/content/roote.config.ts` | Rewrite the `currency` comment (drop the `launchCurrencyFor` / country reference). |
| `src/app/components/shell/MarketingShell.tsx` | `useLocale().localeRegion` → `.locale`. |
| `src/i18n/messages/index.ts` | Update the stale `Locale = 'en'|'he'` comment; remove the `Locale` export if unused. |
| ~127 call sites | `.localeRegion` field reads → `.locale`. `useLocalizedPath()` / `LocalizedNavigate` unchanged. |

**Phase 3 — translations**

| File | Responsibility |
|---|---|
| `scripts/check-i18n-parity.mjs` | *New.* Plain Node. Per locale: report `missing`, `stray`, `empty`, `placeholder-mismatch` counts vs `en`. Exit 1 if any non-zero (with `--allow-missing` escape hatch for mid-phase runs). |
| `package.json` | Add `"i18n:check": "node scripts/check-i18n-parity.mjs"`. |
| `src/i18n/messages/he.ts` | Fill the ~8 keys `en` has that `he` lacks. |
| `src/i18n/messages/{ar,ru,fr,es}.ts` | Full first-pass translation of every `en` key, appended namespace-by-namespace. |

---

## Phase 1 — Unified LanguagePicker

### Task 1: Add `nav.language.*` keys + flip defaults

**Files:**
- Modify: `src/i18n/messages/en.ts` (near line 10–12, the `locale.toggle.*` block)
- Modify: `src/i18n/messages/he.ts` (near line 13–14)
- Modify: `src/i18n/messages/ar.ts`, `ru.ts`, `fr.ts`, `es.ts` (empty scaffolds — add the 3 keys)
- Modify: `src/i18n/locales.ts:37-69`

**Interfaces:**
- Produces: message keys `'nav.language.open'`, `'nav.language.title'`, `'nav.language.current'` (the last takes a `{name}` var). `DEFAULT_LOCALE === 'en'`. `ENABLED_LOCALES` deep-equals `['en','he','ar','ru','fr','es']`.

- [ ] **Step 1: Add the three keys to `en.ts`**

Replace the `locale.toggle.*` lines:
```ts
  'nav.language.open': 'Change language',
  'nav.language.title': 'Language',
  'nav.language.current': 'Current language: {name}',
```
(Delete `'locale.toggle.toHe'` and `'locale.toggle.toEn'` — they are already orphaned; `LocaleToggle` hardcodes its labels.)

- [ ] **Step 2: Add the same keys to `he.ts`** (delete its `locale.toggle.*` too)

```ts
  'nav.language.open': 'שינוי שפה',
  'nav.language.title': 'שפה',
  'nav.language.current': 'שפה נוכחית: {name}',
```

- [ ] **Step 3: Add the keys to the four scaffold files**

`ar.ts` (inside the `= {` object):
```ts
  'nav.language.open': 'تغيير اللغة',
  'nav.language.title': 'اللغة',
  'nav.language.current': 'اللغة الحالية: {name}',
```
`ru.ts`:
```ts
  'nav.language.open': 'Сменить язык',
  'nav.language.title': 'Язык',
  'nav.language.current': 'Текущий язык: {name}',
```
`fr.ts`:
```ts
  'nav.language.open': 'Changer de langue',
  'nav.language.title': 'Langue',
  'nav.language.current': 'Langue actuelle : {name}',
```
`es.ts`:
```ts
  'nav.language.open': 'Cambiar idioma',
  'nav.language.title': 'Idioma',
  'nav.language.current': 'Idioma actual: {name}',
```

- [ ] **Step 4: Flip the defaults in `locales.ts`**

- `export const DEFAULT_LOCALE: LocaleCode = 'he';` → `'en'`
- Replace the `ENABLED_LOCALES` IIFE (lines ~57–69) with:
```ts
/** Locales the UI offers in the picker — all registered languages. */
export const ENABLED_LOCALES: LocaleCode[] = [...ALL_LOCALES];
```
(Leave `SHIPPED_LOCALES`, `LOCALE_ROADMAP`, the `shipped` field, and the country block **in place for now** — Phase 2 Task 6 removes them. This keeps `localeRegion.ts` / `LocaleProvider.tsx` compiling.)

- [ ] **Step 5: Verify**

Run: `pnpm typecheck`
Expected: 0 errors. (`ar.ts` etc. are still `Partial<Record<MessageKey,string>>`, so the 3 new keys type-check; the removed `locale.toggle.*` keys are referenced nowhere.)

Run: `pnpm dev`, open `/` → it should redirect to `/en-us` (was `/he-il`), English UI.

- [ ] **Step 6: Checkpoint** (do not commit — hold)

Working tree only. Ready message for later:
```
feat(i18n): add nav.language.* keys, default to English, enable all six locales
```

---

### Task 2: Build `LanguagePicker`

**Files:**
- Create: `src/app/components/roote/LanguagePicker.tsx`
- Modify: `src/app/components/roote/index.ts` (line ~31)

**Interfaces:**
- Consumes: `ENABLED_LOCALES`, `LOCALES`, `type LocaleCode` from `@/i18n/locales`; `useT` from `@/i18n/LocaleProvider`; `cn` from `@/app/components/ui/utils`.
- Produces:
  ```ts
  export function LanguagePicker(props: {
    locale: LocaleCode;
    onChange: (l: LocaleCode) => void;
    compact?: boolean;
    className?: string;
  }): JSX.Element
  ```
  **Deviation from spec §7 (two, both toward matching the codebase):** (1) the component reads its 3 labels via `useT()` internally instead of taking a `labels` prop — removes plumbing from all six call sites; (2) no `motion` / `useReducedMotion` — plain conditional render (nothing in `src` imports `motion`; the `CountryLanguageSelector` it replaces had no animation). Same visual/behavioural contract otherwise.

- [ ] **Step 1: Write the component**

```tsx
import { useEffect, useId, useRef, useState } from 'react';
import { ENABLED_LOCALES, LOCALES, type LocaleCode } from '@/i18n/locales';
import { useT } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';

type Props = {
  locale: LocaleCode;
  onChange: (l: LocaleCode) => void;
  compact?: boolean;
  className?: string;
};

export function LanguagePicker({ locale, onChange, compact = false, className }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();
  const current = LOCALES[locale];

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, ENABLED_LOCALES.indexOf(locale));
    setActiveIndex(idx);
    const raf = requestAnimationFrame(() => itemRefs.current[idx]?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open, locale]);

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDocPointer);
    return () => document.removeEventListener('pointerdown', onDocPointer);
  }, [open]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const last = ENABLED_LOCALES.length - 1;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const n = Math.min(last, activeIndex + 1); setActiveIndex(n); itemRefs.current[n]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.max(0, activeIndex - 1); setActiveIndex(n); itemRefs.current[n]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); itemRefs.current[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); setActiveIndex(last); itemRefs.current[last]?.focus(); }
  }

  function pick(l: LocaleCode) {
    close(false);
    if (l !== locale) onChange(l);
  }

  const Globe = (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          compact
            ? 'inline-flex h-10 w-10 items-center justify-center rounded-xs text-muted-foreground hover:text-foreground'
            : 'inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground',
        )}
      >
        {Globe}
        {!compact && <span>{current.label}</span>}
        <span className="sr-only">
          {t('nav.language.open')} — {t('nav.language.current', { name: current.englishName })}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          id={menuId}
          aria-label={t('nav.language.title')}
          onKeyDown={onMenuKeyDown}
          className="absolute end-0 z-50 mt-2 min-w-44 rounded-sm border border-border bg-white py-1 shadow-lg"
        >
          {ENABLED_LOCALES.map((code, i) => {
            const meta = LOCALES[code];
            const isCurrent = code === locale;
            return (
              <button
                key={code}
                ref={(el) => { itemRefs.current[i] = el; }}
                type="button"
                role="menuitem"
                tabIndex={i === activeIndex ? 0 : -1}
                aria-current={isCurrent ? 'true' : undefined}
                dir={meta.dir}
                onClick={() => pick(code)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-3 py-2 text-start font-body text-sm',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground hover:bg-cream-100 hover:text-foreground',
                )}
              >
                <span>{meta.label}</span>
                {isCurrent && (
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
                    <path d="M5 10.5l3.5 3.5L15 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Export it**

In `src/app/components/roote/index.ts`, change:
```ts
export { CountryLanguageSelector } from './CountryLanguageSelector';
```
to:
```ts
export { LanguagePicker } from './LanguagePicker';
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: errors **only** in `Header.tsx` and `Footer.tsx` (they still import `CountryLanguageSelector`). Those are fixed in Task 3. If any *other* file errors, stop and investigate.

- [ ] **Step 4: Checkpoint** (no commit)

```
feat(i18n): add LanguagePicker dropdown component
```

---

### Task 3: Swap the picker into all six locations; delete the old two

**Files:**
- Modify: `src/app/components/shell/Header.tsx:1-12,23-42,88-100,151-160`
- Modify: `src/app/components/shell/Footer.tsx:1-15,75-90,203-222`
- Modify: `src/app/components/shell/FunnelShell.tsx:1-6,16`
- Modify: `src/app/routes/analysis/AnalysisShell.tsx` (import + the `<LocaleToggle />` at ~line 74)
- Modify: `src/app/routes/app/AppShell.tsx` (import + two `<LocaleToggle .../>` at ~lines 138, 150)
- Delete: `src/app/components/brand/LocaleToggle.tsx`
- Delete: `src/app/components/roote/CountryLanguageSelector.tsx`

**Interfaces:**
- Consumes: `LanguagePicker` from `@/app/components/roote`; `useLocale()` → `{ locale, setLocale }` (still region-shaped in this phase, but these two fields are stable).

- [ ] **Step 1: Header.tsx**

- Import: `Button, Drawer, IconButton, LanguagePicker` from `@/app/components/roote` (drop `CountryLanguageSelector`).
- Remove the `countryDefault` import and the `LocaleCode` import if now unused (keep `MessageKey`).
- In the component body, replace:
  ```ts
  const { locale, country, setLocale, setLocaleRegion } = useLocale();
  ```
  with:
  ```ts
  const { locale, setLocale } = useLocale();
  ```
- Delete the `regionLabels` object, `onChangeCountry`, and `onChangeLocale`.
- Desktop trigger (was `<CountryLanguageSelector compact .../>`):
  ```tsx
  <LanguagePicker
    locale={locale}
    onChange={setLocale}
    compact
    className="text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
  />
  ```
- Drawer trigger (was `<CountryLanguageSelector .../>`):
  ```tsx
  <LanguagePicker locale={locale} onChange={setLocale} />
  ```

- [ ] **Step 2: Footer.tsx**

- Import `LanguagePicker` from `@/app/components/roote`; drop `CountryLanguageSelector`; drop `countryDefault` and unused `LocaleCode`.
- Replace `const { locale, country, setLocale, setLocaleRegion } = useLocale();` with `const { locale, setLocale } = useLocale();`
- Delete `onChangeCountry`.
- Replace the `<CountryLanguageSelector .../>` block with:
  ```tsx
  <LanguagePicker
    locale={locale}
    onChange={setLocale}
    className="text-ink-foreground hover:text-ink-foreground"
  />
  ```

- [ ] **Step 3: FunnelShell.tsx**

- Replace `import { LocaleToggle } from '@/app/components/brand/LocaleToggle';` with `import { LanguagePicker } from '@/app/components/roote';` and add `import { useLocale } from '@/i18n/LocaleProvider';` (merge with the existing `useLocalizedPath` import — both come from `@/i18n/LocaleProvider`).
- In the component: `const { locale, setLocale } = useLocale();` alongside `withLocale`.
- Replace `<LocaleToggle />` with `<LanguagePicker compact locale={locale} onChange={setLocale} />`.

- [ ] **Step 4: AnalysisShell.tsx**

- Remove `import { LocaleToggle } from '@/app/components/brand/LocaleToggle';`; add `LanguagePicker` to the existing `@/app/components/roote` import (`Button, Stepper, Modal, LanguagePicker`).
- It does **not** currently call `useLocale()` — its i18n import is `import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';`. Add `useLocale` to that import, and in the component body add `const { locale, setLocale } = useLocale();`.
- Replace `<LocaleToggle />` with `<LanguagePicker compact locale={locale} onChange={setLocale} />`.

- [ ] **Step 5: AppShell.tsx**

- Remove the `LocaleToggle` import; add `LanguagePicker` to the `@/app/components/roote` import.
- It already has `import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';` and `const { locale } = useLocale();` (line ~36) — change that to `const { locale, setLocale } = useLocale();`.
- Replace **both** `<LocaleToggle className="text-ink-foreground hover:text-ink-foreground" />` with:
  ```tsx
  <LanguagePicker compact locale={locale} onChange={setLocale} className="text-ink-foreground hover:text-ink-foreground" />
  ```

- [ ] **Step 6: Delete the old components**

```bash
git rm src/app/components/brand/LocaleToggle.tsx src/app/components/roote/CountryLanguageSelector.tsx
```
(Or plain `rm` — the point is they are gone. `git rm` just stages the deletion; it is not a commit.)

- [ ] **Step 7: Remove the dead i18n keys**

In **all six** `messages/*.ts`, delete every `'marketing.region.trigger' | .title | .regionLabel | .languageLabel | .done'` line. (`en.ts` ~lines 342–346; `he.ts` ~345–349; the scaffolds don't have them.)

- [ ] **Step 8: Verify**

Run: `pnpm typecheck`
Expected: **0 errors.** If `marketing.region.*` still shows as referenced, grep: `grep -rn "marketing\.region\.\|locale\.toggle\.\|CountryLanguageSelector\|LocaleToggle" src` → must be empty.

Run: `pnpm build` → passes (≈640 kB chunk warning is expected).

Run: `pnpm dev` and check in the browser:
- Header (desktop + mobile drawer), Footer, `/analysis`, `/program`, `/account` (dev-seed a program or complete checkout) each show the globe/endonym trigger.
- Opening it lists all six languages; the current one has a check.
- Picking `עברית` or `العربية` switches copy and flips the layout to RTL; picking `Français` etc. switches the trigger label (body copy still English — translations come in Phase 3).
- Keyboard: Tab to trigger, Enter opens, ↑/↓ moves, Enter selects, Esc closes and returns focus.
- The URL still looks like `/en-us/...` at this point — that changes in Phase 2.

- [ ] **Step 9: Checkpoint** (no commit)

```
feat(i18n): replace LocaleToggle + CountryLanguageSelector with one LanguagePicker
```

---

## Phase 2 — Remove the region axis

> Phase 2 tasks are tightly coupled; `pnpm typecheck` will show **expected** errors between Task 4 and Task 9. Each task lists which files are still expected to be red. Do not "fix" a red file out of order — its owning task handles it.

### Task 4: Rename `localeRegion.ts` → `localeUrl.ts`, collapse to a single segment

**Files:**
- Rename: `src/i18n/localeRegion.ts` → `src/i18n/localeUrl.ts`
- Modify: the new file's contents

**Interfaces:**
- Produces:
  ```ts
  export const PREFERRED_LOCALE_KEY = 'roote.locale';
  export function isValidLocaleSegment(seg: string): boolean;
  export function readStoredLocale(): string | null;
  export function writeStoredLocale(locale: string): void;
  export function resolveLocaleRedirect(pathname: string, storedLocale: string | null, acceptLanguage: string): string | null;
  ```
- Consumes: `ENABLED_LOCALES`, `DEFAULT_LOCALE`, `isLocaleCode`, `type LocaleCode` from `./locales`; `LEGACY_PREFIX_REDIRECTS`, `LEGACY_EXACT_REDIRECTS` from `@/app/paths`.

- [ ] **Step 1: Rename the file**

```bash
git mv src/i18n/localeRegion.ts src/i18n/localeUrl.ts
```

- [ ] **Step 2: Replace the contents**

```ts
import {
  ENABLED_LOCALES,
  DEFAULT_LOCALE,
  isLocaleCode,
  type LocaleCode,
} from './locales';
import { LEGACY_PREFIX_REDIRECTS, LEGACY_EXACT_REDIRECTS } from '@/app/paths';

export function isValidLocaleSegment(seg: string): seg is LocaleCode {
  return isLocaleCode(seg) && ENABLED_LOCALES.includes(seg);
}

function detectLocaleFromAcceptLanguage(acceptLanguage: string): LocaleCode {
  const candidates = acceptLanguage
    .split(',')
    .map((tag) => tag.split(';')[0].trim().split('-')[0].toLowerCase());
  for (const c of candidates) {
    if (isLocaleCode(c) && ENABLED_LOCALES.includes(c)) return c;
  }
  return DEFAULT_LOCALE;
}

function applyLegacyRedirects(restPath: string): string {
  for (const [from, to] of LEGACY_EXACT_REDIRECTS) {
    if (restPath === from) return to;
  }
  for (const [from, to] of LEGACY_PREFIX_REDIRECTS) {
    if (restPath === from) return to;
    if (restPath.startsWith(`${from}/`)) return to + restPath.slice(from.length);
  }
  return restPath;
}

export const PREFERRED_LOCALE_KEY = 'roote.locale';

export function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(PREFERRED_LOCALE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredLocale(locale: string): void {
  try {
    localStorage.setItem(PREFERRED_LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function resolveLocaleRedirect(
  pathname: string,
  storedLocale: string | null,
  acceptLanguage: string,
): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const [first] = segments;
  if (first && isValidLocaleSegment(first)) return null;

  const locale =
    storedLocale && isValidLocaleSegment(storedLocale)
      ? storedLocale
      : detectLocaleFromAcceptLanguage(acceptLanguage);

  const restPath = applyLegacyRedirects(segments.length ? `/${segments.join('/')}` : '/');
  return restPath === '/' ? `/${locale}` : `/${locale}${restPath}`;
}
```

- [ ] **Step 3: Verify (partial)**

Run: `pnpm typecheck`
Expected red files: `src/app/LocaleGate.tsx`, `src/i18n/LocaleProvider.tsx` (import `./localeRegion`, old symbol names). Fixed in Tasks 5–6. No other file imports this module directly — confirm with `grep -rn "localeRegion" src`.

- [ ] **Step 4: Checkpoint** (no commit)

```
refactor(i18n): rename localeRegion.ts to localeUrl.ts, single-segment locale
```

---

### Task 5: Narrow `LocaleProvider`

**Files:**
- Modify: `src/i18n/LocaleProvider.tsx` (whole file)

**Interfaces:**
- Produces:
  ```ts
  type Ctx = {
    locale: LocaleCode;
    contentLocale: ContentLocale;
    dir: 'rtl' | 'ltr';
    setLocale: (l: LocaleCode) => void;
    t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  };
  export function LocaleProvider(props: { locale?: LocaleCode; children: ReactNode }): JSX.Element;
  export function useLocale(): { locale: LocaleCode; contentLocale: ContentLocale; dir: 'rtl' | 'ltr'; setLocale: (l: LocaleCode) => void };
  export function useContentLocale(): ContentLocale;
  export function useT(): Ctx['t'];
  export function useLocalizedPath(): (path: string) => string;
  ```

- [ ] **Step 1: Rewrite the file**

```tsx
import { createContext, useCallback, useContext, useMemo, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { messages, type MessageKey } from './messages';
import {
  type LocaleCode,
  type ContentLocale,
  DEFAULT_LOCALE,
  dirOf,
  contentLocaleOf,
  isLocaleCode,
} from './locales';
import { writeStoredLocale } from './localeUrl';
import { interpolate } from './interpolate';

type Ctx = {
  locale: LocaleCode;
  contentLocale: ContentLocale;
  dir: 'rtl' | 'ltr';
  setLocale: (l: LocaleCode) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({
  locale: localeProp = DEFAULT_LOCALE,
  children,
}: {
  locale?: LocaleCode;
  children: ReactNode;
}) {
  if (!isLocaleCode(localeProp)) {
    throw new Error(`LocaleProvider received an invalid locale: "${localeProp}"`);
  }
  const locale = localeProp;
  const dir = dirOf(locale);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    writeStoredLocale(locale);
  }, [locale, dir]);

  const setLocale = useCallback(
    (l: LocaleCode) => {
      const rest = location.pathname.split('/').slice(2).join('/');
      navigate(`/${l}${rest ? `/${rest}` : ''}${location.search}`);
    },
    [location.pathname, location.search, navigate],
  );

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const table = messages[locale] as Record<string, string>;
      const raw = table[key] ?? (messages.en as Record<string, string>)[key] ?? key;
      return interpolate(raw, vars);
    },
    [locale],
  );

  const value = useMemo<Ctx>(
    () => ({ locale, contentLocale: contentLocaleOf(locale), dir, setLocale, t }),
    [locale, dir, setLocale, t],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useCtx(): Ctx {
  const c = useContext(LocaleContext);
  if (!c) throw new Error('useLocale/useT must be used within <LocaleProvider>');
  return c;
}

export function useLocale() {
  const { locale, contentLocale, dir, setLocale } = useCtx();
  return { locale, contentLocale, dir, setLocale };
}

export function useContentLocale(): ContentLocale {
  return useCtx().contentLocale;
}

export function useT() {
  return useCtx().t;
}

/** Prefixes a bare `PATHS.x` value with the current locale, e.g. `/products` -> `/en/products`. */
export function useLocalizedPath() {
  const { locale } = useCtx();
  return useCallback(
    (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`),
    [locale],
  );
}
```

- [ ] **Step 2: Verify (partial)**

Run: `pnpm typecheck`
Expected red files now: `src/app/LocaleGate.tsx` (Task 6); `src/app/components/shell/MarketingShell.tsx` and `src/seo/useDocumentMeta.ts` (both read `.localeRegion` — Tasks 7 & 9); `src/i18n/locales.ts` consumers of the country exports are still fine (not deleted yet). Anything reading `useLocale().country` / `.currency` / `.setCountry` / `.setLocaleRegion` will be red — inventory them now with `grep -rn "\.country\b\|\.currency\b\|setCountry\|setLocaleRegion\|localeRegion" src` and confirm the list is: `Header.tsx`, `Footer.tsx` (already cleaned in Task 3 — re-verify), `MarketingShell.tsx`, `useDocumentMeta.ts`. If more, they get folded into Task 9.

- [ ] **Step 3: Checkpoint** (no commit)

```
refactor(i18n): narrow LocaleProvider context to language only
```

---

### Task 6: Route param `:localeRegion` → `:locale`

**Files:**
- Modify: `src/app/LocaleGate.tsx` (whole file)
- Modify: `src/app/App.tsx:35,36` (the wrapper route)

**Interfaces:**
- Consumes: `isValidLocaleSegment`, `readStoredLocale`, `resolveLocaleRedirect` from `@/i18n/localeUrl`; `LocaleProvider`, `useLocalizedPath` from `@/i18n/LocaleProvider`.
- Produces: `LocaleGate`, `BareOrLegacyPathRedirect`, `LocalizedNavigate` (unchanged names/signatures).

- [ ] **Step 1: Rewrite `LocaleGate.tsx`**

```tsx
import { Navigate, Outlet, useLocation, useParams } from 'react-router';
import { LocaleProvider, useLocalizedPath } from '@/i18n/LocaleProvider';
import { resolveLocaleRedirect, readStoredLocale, isValidLocaleSegment } from '@/i18n/localeUrl';
import { isLocaleCode } from '@/i18n/locales';

function acceptLanguage(): string {
  return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en';
}

export function LocaleGate() {
  const { locale } = useParams();
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredLocale(), acceptLanguage());
  if (redirect) return <Navigate to={redirect} replace />;
  const safe = locale && isValidLocaleSegment(locale) && isLocaleCode(locale) ? locale : undefined;
  return (
    <LocaleProvider locale={safe}>
      <Outlet />
    </LocaleProvider>
  );
}

export function BareOrLegacyPathRedirect() {
  const location = useLocation();
  const redirect = resolveLocaleRedirect(location.pathname, readStoredLocale(), acceptLanguage());
  return <Navigate to={redirect ?? '/'} replace />;
}

export function LocalizedNavigate({ to, replace }: { to: string; replace?: boolean }) {
  const withLocale = useLocalizedPath();
  return <Navigate to={withLocale(to)} replace={replace} />;
}
```
Note: when `redirect` is `null`, `params.locale` is guaranteed valid (that's exactly `resolveLocaleRedirect`'s no-op condition), so `safe` is always defined on the render path — the `undefined` fallback just satisfies the type.

- [ ] **Step 2: `App.tsx`**

Change:
```tsx
    path: '/:localeRegion',
```
to:
```tsx
    path: '/:locale',
```
(The child route array is unchanged.)

- [ ] **Step 3: Verify (partial)**

Run: `pnpm typecheck`
Expected red: `MarketingShell.tsx`, `useDocumentMeta.ts` only (Tasks 7 & 9). Everything else green.

Run: `pnpm dev` → `/` redirects to `/en`; `/he/analysis` loads the Hebrew analysis intro; `/products` redirects to `/en/products`; an unknown `/xx/products` redirects to `/en/products`.

- [ ] **Step 4: Checkpoint** (no commit)

```
feat(i18n): switch the wrapper route to a language-only :locale param
```

---

### Task 7: SEO — strip prefix, six hreflang alternates

**Files:**
- Modify: `src/seo/useDocumentMeta.ts:60-90` (and the hreflang helper it calls — inspect the file for `upsertHreflangAlternates`)

**Interfaces:**
- Consumes: `useLocale()` → `{ contentLocale, locale }`; `ENABLED_LOCALES` from `@/i18n/locales`.

- [ ] **Step 1: Read the whole file** to see `upsertHreflangAlternates` / `upsertCanonical` and the alternates list it currently builds (per the 2026-09-05 spec it was 16 lang-region pairs + x-default).

- [ ] **Step 2: Replace `.localeRegion` usage**

- `const { contentLocale, localeRegion } = useLocale();` → `const { contentLocale, locale } = useLocale();`
- `const bareLogicalPath = pathname.slice(\`/${localeRegion}\`.length) || '/';` → `pathname.slice(\`/${locale}\`.length) || '/'`
- The `useEffect` dep array: `localeRegion` → `locale`.

- [ ] **Step 3: Rewrite the alternates builder** so it emits, for the current bare logical path, one `<link rel="alternate" hreflang="{code}">` per `code` in `ENABLED_LOCALES` pointing at `${SITE_ORIGIN}/${code}${bareLogicalPath === '/' ? '' : bareLogicalPath}`, plus one `hreflang="x-default"` at `${SITE_ORIGIN}${bareLogicalPath}` (the un-prefixed path that triggers `resolveLocaleRedirect`). Match the file's existing DOM-upsert helper style; remove any country loop.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck` → **0 errors expected now** except `MarketingShell.tsx` (Task 9). 
In the browser, on `/en/products`, inspect `<head>`: 6 `alternate` links (`/en/products` … `/es/products`) + 1 `x-default` (`/products`); `<link rel="canonical">` = `…/en/products`.

- [ ] **Step 5: Checkpoint** (no commit)

```
feat(seo): emit six language hreflang alternates, drop the region axis
```

---

### Task 8: `money.ts` widen + `roote.config` comment

**Files:**
- Modify: `src/domain/report/money.ts` (whole file — it is tiny)
- Modify: `src/content/roote.config.ts:39-42`

**Interfaces:**
- Produces: `formatMoney(amount: number, currency: string, locale: LocaleCode): Money`. Existing callers passing `'en' | 'he'` keep working (`ContentLocale ⊂ LocaleCode`).

- [ ] **Step 1: Rewrite `money.ts`**

```ts
import { LOCALES, type LocaleCode } from '@/i18n/locales';

export type Money = { amount: number; currency: string; formatted: string };

export function formatMoney(amount: number, currency: string, locale: LocaleCode): Money {
  const formatted = new Intl.NumberFormat(LOCALES[locale].bcp47, {
    style: 'currency',
    currency,
  }).format(amount);
  return { amount, currency, formatted };
}
```
Check the domain-purity rule: `money.ts` importing from `@/i18n/locales` is fine — `locales.ts` is a plain data module (no React/DOM/storage/provider). It already imports nothing from the provider. Confirm `locales.ts` stays provider-free after Task 6 (it does).

- [ ] **Step 2: `roote.config.ts`** — replace the comment above `currency: 'USD',`:

```ts
  // Single display currency for the concept build. Real pricing and any
  // multi-currency support are [PENDING] client/commerce decisions.
  currency: 'USD',
```

- [ ] **Step 3: Optional refinement** (same task, no new checkpoint): in `Products.tsx`, `ProductDetail.tsx`, `SolutionPage.tsx`, `BagPage.tsx`, `BagCheckout.tsx` the `formatMoney(..., cl)` calls can pass the full `useLocale().locale` instead of `cl` (`contentLocale`) so French/Russian/Spanish number grouping is correct. Only do this where the component already calls `useLocale()`; otherwise leave `cl`. `buildReport.ts` keeps passing its `Locale` ('en'|'he') — unchanged.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck` → 0 errors except `MarketingShell.tsx`.
Browser: `/fr/products` shows prices like `12,00 $US`; `/en/products` shows `$12.00`; `/he/...` unchanged.

- [ ] **Step 5: Checkpoint** (no commit)

```
feat(i18n): format currency per selected locale; single config currency
```

---

### Task 9: Call-site sweep + full browser pass

**Files:**
- Modify: `src/app/components/shell/MarketingShell.tsx:11,28`
- Modify: `src/i18n/messages/index.ts:23-42`
- Modify: any file still surfaced by the grep gate below

**Interfaces:** none new — this task makes `pnpm typecheck` green and proves the app.

- [ ] **Step 1: MarketingShell.tsx**

- `const { localeRegion } = useLocale();` → `const { locale } = useLocale();`
- `pathname === \`/${localeRegion}\`` → `pathname === \`/${locale}\``

- [ ] **Step 2: `messages/index.ts`**

- Update the block comment on `export type Locale = 'en' | 'he';` (lines ~23–29) — drop the "widens in WP2 / `CountryLanguageSelector`" language; state plainly: "The two locales that carry human-authored **content** (config `LocalizedText`, `buildReport`). UI message locales are the full `LocaleCode` set."
- Run `grep -rn "\bLocale\b" src --include=*.ts --include=*.tsx | grep -i "messages'" ` — if nothing imports `Locale` from `./messages` / `@/i18n/messages`, delete the export. (`buildReport.ts` has its own local `type Locale` — leave it.)

- [ ] **Step 3: Grep gate — must all be empty**

```bash
grep -rn "localeRegion\|COUNTRY_DEFAULTS\|DEFAULT_COUNTRY\|countryDefault\|setLocaleRegion\|setCountry\|\.currency\b\|CurrencyCode\|launchCurrencyFor\|CountryLanguageSelector\|LocaleToggle\|marketing\.region\.\|locale\.toggle\." src
```
Any hit that is **not** inside `src/i18n/locales.ts` (whose country block Task 10 removes) must be fixed here. `roote.config.ts`'s `currency:` key and `money.ts`'s `currency` param are fine (different identifier context) — the `\.currency\b` pattern is for `useLocale().currency`; eyeball hits.

- [ ] **Step 4: Verify — full**

- `pnpm typecheck` → **0 diagnostics.**
- `pnpm build` → passes.
- `pnpm dev` browser matrix, for each of `/en /he /ar /ru /fr /es`:
  - Picker lists all six; active one checked; switching navigates to `/<code>/<same route>` (does **not** bounce to home).
  - `/ar` and `/he` render RTL (`<html dir="rtl">`); the other four LTR.
  - Refresh keeps the language (localStorage `roote.locale`).
  - Bare `/`, `/products`, `/faq` → redirect to `/en/…`. Legacy `/diagnosis/gender` → `/en/analysis/gender` in one hop.
  - Deep link `/fr/analysis`, `/ar/account` (seed a program) load.
  - Report route `/en/report/<id>` renders (complete an analysis to get an id, or dev-seed).
- Old stored key: set `localStorage['roote.localeRegion'] = 'he-il'` in devtools, reload `/` → still lands on `/en` (old key ignored), not a crash.

- [ ] **Step 5: Checkpoint** (no commit)

```
refactor(i18n): finish the region→language sweep; app runs on /<locale> URLs
```

---

### Task 10: Delete the country/currency block from `locales.ts`

**Files:**
- Modify: `src/i18n/locales.ts` (remove lines ~34–53 `shipped`/roadmap bits and ~85–127 country block)

**Interfaces:**
- Produces: `locales.ts` exporting only `LocaleCode`, `ContentLocale`, `LocaleMeta` (no `shipped`), `LOCALES`, `ALL_LOCALES`, `DEFAULT_LOCALE`, `RTL_LOCALES`, `ENABLED_LOCALES`, `isLocaleCode`, `dirOf`, `contentLocaleOf`.

- [ ] **Step 1: Edit `locales.ts`**

- Remove `shipped` from the `LocaleMeta` type and from all six `LOCALES` entries.
- Delete `LOCALE_ROADMAP`, `SHIPPED_LOCALES`.
- Delete everything from the `/* --- country → ... */` comment to end of file: `CurrencyCode`, `CountryDefault`, `COUNTRY_DEFAULTS`, `DEFAULT_COUNTRY`, `LAUNCH_CURRENCIES`, `launchCurrencyFor`, `countryDefault`.
- Keep `ENABLED_LOCALES = [...ALL_LOCALES]`, `RTL_LOCALES`, `isLocaleCode`, `dirOf`, `contentLocaleOf`.
- Update the file's top doc comment: drop the `shipped: true/false` explanation and the "WP2 wires this ... provider stays on en/he" paragraph; describe the six-language, language-only registry.

- [ ] **Step 2: Verify**

- `grep -rn "COUNTRY_DEFAULTS\|countryDefault\|SHIPPED_LOCALES\|LOCALE_ROADMAP\|launchCurrencyFor\|\.shipped\b" src` → empty.
- `pnpm typecheck` → 0. `pnpm build` → passes.

- [ ] **Step 3: Checkpoint** (no commit)

```
refactor(i18n): drop the country/currency registry from locales.ts
```

---

## Phase 3 — Translations

### Task 11: Parity script + `he` gap fill

**Files:**
- Create: `scripts/check-i18n-parity.mjs`
- Modify: `package.json` (`scripts` block)
- Modify: `src/i18n/messages/he.ts`

**Interfaces:**
- Produces: `node scripts/check-i18n-parity.mjs [--locale <code>] [--allow-missing]` — prints a per-locale table of `missing` / `stray` / `empty` / `placeholder-mismatch`; exit 1 if any is non-zero (unless `--allow-missing`, which downgrades `missing` to a warning). `pnpm i18n:check` runs it.

- [ ] **Step 1: Write the script**

```js
// scripts/check-i18n-parity.mjs — plain Node, no deps. Not a test file.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MSG_DIR = resolve(__dirname, '../src/i18n/messages');
const LOCALES = ['en', 'he', 'ar', 'ru', 'fr', 'es'];
const args = process.argv.slice(2);
const only = args.includes('--locale') ? args[args.indexOf('--locale') + 1] : null;
const allowMissing = args.includes('--allow-missing');

// Extract 'key': 'value' pairs from a messages file without importing TS.
// Keys are simple quoted string literals; values may be single- or double-quoted,
// possibly spanning lines with escaped quotes. Good enough for parity accounting.
function parseMessages(code) {
  const src = readFileSync(resolve(MSG_DIR, `${code}.ts`), 'utf8');
  const body = src.slice(src.indexOf('{') + 1);
  const re = /(['"])((?:\\.|(?!\1).)*?)\1\s*:\s*(['"])((?:\\.|(?!\3).)*?)\3\s*,?/gs;
  const out = new Map();
  let m;
  while ((m = re.exec(body))) out.set(m[2], m[4]);
  return out;
}

const en = parseMessages('en');
const enPlaceholders = (v) => new Set([...v.matchAll(/\{(\w+)\}/g)].map((x) => x[1]));

let failed = false;
const rows = [];
for (const code of LOCALES) {
  if (only && code !== only) continue;
  if (code === 'en') continue;
  const loc = parseMessages(code);
  let missing = 0, stray = 0, empty = 0, ph = 0;
  for (const [k, ev] of en) {
    if (!loc.has(k)) { missing++; continue; }
    const lv = loc.get(k);
    if (lv.trim() === '') empty++;
    const want = enPlaceholders(ev), got = enPlaceholders(lv);
    for (const p of want) if (!got.has(p)) { ph++; break; }
  }
  for (const k of loc.keys()) if (!en.has(k)) stray++;
  rows.push({ code, missing, stray, empty, ph });
  const hardFail = stray > 0 || empty > 0 || ph > 0 || (!allowMissing && missing > 0);
  if (hardFail) failed = true;
}

for (const r of rows) {
  console.log(
    `${r.code}: missing=${r.missing} stray=${r.stray} empty=${r.empty} placeholder-mismatch=${r.ph}`,
  );
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Add the npm script**

In `package.json` `"scripts"`: `"i18n:check": "node scripts/check-i18n-parity.mjs",`

- [ ] **Step 3: Baseline run**

Run: `node scripts/check-i18n-parity.mjs --allow-missing`
Expected: `he` shows a small `missing` (~8) and `stray=0 empty=0`; `ar/ru/fr/es` show `missing` ≈ full key count minus the `nav.language.*` you added.
Record `he`'s missing count and, from the script (add a temp `console.log([...en.keys()].filter(k=>!parseMessages('he').has(k)))` if needed), the exact missing `he` keys.

- [ ] **Step 4: Fill the `he` gap**

For each key `en` has that `he` lacks, add a real first-pass Hebrew translation to `he.ts` (in the matching section). Legal/medical ones: translate + keep any "בכפוף לבדיקה משפטית" style hedge consistent with neighbours.

- [ ] **Step 5: Verify**

Run: `node scripts/check-i18n-parity.mjs --locale he`
Expected: `he: missing=0 stray=0 empty=0 placeholder-mismatch=0`
Run: `pnpm typecheck` → 0.

- [ ] **Step 6: Checkpoint** (no commit)

```
test(i18n): add parity check script; close the en/he key gap
```

---

### Tasks 12–15: Translate `ar`, then `ru`, then `fr`, then `es`

> One task per language, in this order (`ar` first so RTL copy is exercised early). **Each task is a sequence of namespace chunks; each chunk is its own resumable checkpoint.** The resume marker is the last line of the checkpoint message: `i18n(<code>): <namespace> done`. To resume, run `node scripts/check-i18n-parity.mjs --locale <code>` and continue at the first namespace with `missing > 0`.

**Files (all four tasks):**
- Modify: `src/i18n/messages/<code>.ts` (append translated keys; keep `export const <code>: Partial<Record<MessageKey, string>> = { … }`)

**Method for every chunk:**
1. From `src/i18n/messages/en.ts`, take all keys in the target namespace (e.g. every key starting `analysis.`).
2. For each, write a real, natural translation into `<code>`. Rules, every time:
   - Keep `{var}` placeholders **verbatim** (same names, same count).
   - Copy any `[PENDING: …]` bracket text **verbatim**; translate only words outside the brackets.
   - Match `he.ts`'s treatment of the *same key* for: embedded `dir="ltr"` Latin/number/URL/email spans, and "pending formal legal review"-style hedges on legal/medical copy.
   - Brand tokens ("ROOTÉ", "91 ENTERPRISE LLC", product names) stay as-is.
   - `ar`: natural Modern Standard Arabic; no direction markup in the string itself (layout `dir` handles it) except the LTR spans `he` also isolates.
3. Append the translated block to `<code>.ts` under a `// --- <namespace> ---` comment.
4. Run `node scripts/check-i18n-parity.mjs --locale <code>` — the namespace's keys should have moved out of `missing`; `stray`, `empty`, `placeholder-mismatch` must stay `0`.
5. Run `pnpm typecheck` → 0 (a stray/misspelled key shows up here as a type error too).
6. Checkpoint (no commit) with message `i18n(<code>): <namespace> done`.

**Namespace order per language** (smallest-impact-first so the visible UI localizes fast, heavy content last):

- [ ] **Chunk A — root & nav & controls:** every key **not** matching `marketing.` / `app.` / `report.` / `analysis.` / `start.` / `checkout.` / `bag.` / `cart.` / `program.` — i.e. `common.*`, `brand.*`, `meta.*`, `nav.*`, `scale.*`, `severity.*`, `level.*`, `role.*`, `zone.*`, `gray.*`, `photo.*`, `diagnosis.*`, `hairScan.*`, `metric.*`, `accountRescan.*`, and any other stragglers. (~80 keys.) Checkpoint: `i18n(<code>): root done`
- [ ] **Chunk B — `analysis.*`** (~41). Checkpoint: `i18n(<code>): analysis done`
- [ ] **Chunk C — `report.*`** (~98). Checkpoint: `i18n(<code>): report done`
- [ ] **Chunk D — funnel money group:** `start.*`, `checkout.*`, `bag.*`, `cart.*`, `program.*` (~98). Checkpoint: `i18n(<code>): funnel done`
- [ ] **Chunk E — `app.*`** (~262). Split into `app.*` sub-prefixes if a single pass is too large; checkpoint each sub-prefix as `i18n(<code>): app.<sub> done`, final `i18n(<code>): app done`.
- [ ] **Chunk F — `marketing.*`** (~514). Split by sub-prefix (`marketing.nav.*`, `marketing.home.*`, `marketing.footer.*`, `marketing.magazine.*`, `marketing.legal.*`, `marketing.faq.*`, `marketing.support.*`, …). Legal/medical sub-trees (`marketing.legal.*`, disclaimers) get the `he`-style formal-review hedge. Checkpoint each sub-prefix, final `i18n(<code>): marketing done`.
- [ ] **Chunk G — language done:** run `node scripts/check-i18n-parity.mjs --locale <code>` → `missing=0 stray=0 empty=0 placeholder-mismatch=0`. `pnpm typecheck` → 0. `pnpm build` → passes. Browser pass on `/<code>`: spot-check Header, Footer, `/​<code>/`, `/<code>/faq`, `/<code>/analysis`, one `/<code>/account/*` page, `/<code>/report/<id>`. For `ar`: verify RTL layout holds across all of those and that prices/brand/emails render LTR correctly. Checkpoint: `i18n(<code>): complete`

- [ ] **Task 12 = `ar`** — all chunks A–G.
- [ ] **Task 13 = `ru`** — all chunks A–G.
- [ ] **Task 14 = `fr`** — all chunks A–G.
- [ ] **Task 15 = `es`** — all chunks A–G.

---

### Task 16: Final verification

- [ ] **Step 1:** `node scripts/check-i18n-parity.mjs` (no flags) → every locale `missing=0 stray=0 empty=0 placeholder-mismatch=0`, exit 0.
- [ ] **Step 2:** `pnpm typecheck` → 0 diagnostics.
- [ ] **Step 3:** `pnpm build` → succeeds (≈640 kB chunk warning expected).
- [ ] **Step 4:** Grep gate empty:
  ```bash
  grep -rn "localeRegion\|COUNTRY_DEFAULTS\|countryDefault\|setLocaleRegion\|CountryLanguageSelector\|LocaleToggle\|marketing\.region\.\|locale\.toggle\.\|VITE_I18N_SHOW_SCAFFOLDS" src
  ```
- [ ] **Step 5:** Browser: full six-language matrix from Task 9 Step 4, now with every language showing translated copy (no English fallback visible on the spot-checked surfaces).
- [ ] **Step 6:** Update `CLAUDE.md` — the i18n paragraphs (the "default `'he'`", "English is a toggle", `localStorage['roote.locale']` default `'he'`, the "Orphaned i18n keys" note if now stale) and the routing table (`/:localeRegion` → `/:locale`, `/en-us` examples). This doc-sync is part of this task, not a separate one.
- [ ] **Step 7: Checkpoint** (no commit)
  ```
  docs: sync CLAUDE.md with the language-only i18n system
  ```

---

## Self-Review

**Spec coverage:**

| Spec section | Task(s) |
|---|---|
| §2 default `en`, six enabled | 1 |
| §3 single-segment validation | 4, 6 |
| §4 routing, `resolveLocaleRedirect` | 4, 6 |
| §5 `locales.ts` trim | 1 (defaults), 10 (delete block) |
| §5 `localeRegion.ts` → `localeUrl.ts` | 4 |
| §6 narrowed `LocaleProvider` | 5 |
| §7 `LanguagePicker`, delete old two, key churn | 1, 2, 3 |
| §8 `money.ts` + config comment | 8 |
| §9.1 translation rules | 12–15 (method block) |
| §9.2 chunk order, resume markers | 12–15 (chunks A–G) |
| §9.3 en/he gap | 11 |
| §10 files-touched | covered across tasks; §10 sweep = Task 9 |
| §11 parity script, typecheck, build, browser, grep gate | 11 (script), 9 & 16 (gates) |
| §12 supersedes region-hreflang spec | 7 (hreflang), 16 (CLAUDE.md) |

No spec section is unimplemented.

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". Translation *content* is necessarily authored during Tasks 12–15 (5,000+ strings can't be inlined here), but the *method, rules, boundaries, and per-chunk verification* are fully specified — that is the correct level for this plan.

**Type consistency:** `isValidLocaleSegment` (Task 4) — used in Task 6. `resolveLocaleRedirect(pathname, storedLocale, acceptLanguage)` — defined Task 4, called Task 6. `readStoredLocale` / `writeStoredLocale` / `PREFERRED_LOCALE_KEY` — Task 4, consumed Tasks 5 (`writeStoredLocale`) & 6. `LanguagePicker` props `{ locale, onChange, compact?, className? }` — Task 2, consumed Task 3 (all six call sites match). `formatMoney(amount, currency, locale: LocaleCode)` — Task 8, back-compatible with existing `'en'|'he'` callers. Context shape `{ locale, contentLocale, dir, setLocale, t }` — Task 5, matches every `useLocale()` destructure after Task 9.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, two-stage review between tasks, fast iteration. Best for the many small Phase 3 chunks.
2. **Inline Execution** — tasks run in this session via executing-plans, batched with checkpoints.

Which approach?
