# Six-Language i18n — Language-Only Locale & Full Translation — Design Spec

**Date:** 2026-09-10
**Status:** Draft for review
**Relation:** Reworks the locale half of `2026-09-05-international-url-hreflang-design.md`. That spec
gave the 6-locale / 8-country roadmap a **language + region** URL contract (`/en-us/`, `/he-il/`).
This spec **removes the region axis entirely** — the URL prefix and the picker become language-only
(`/en`, `/he`, `/fr`, `/ru`, `/ar`, `/es`) — makes **English the default**, and commits to a **full
first-pass translation** of the four not-yet-shipped locales (`fr`, `ru`, `ar`, `es`). The hreflang
mechanics from the 2026-09-05 spec survive, re-expressed over 6 language URLs instead of 16
language-region pairs.

**Working constraint:** nothing is committed or pushed during this work — this spec file included —
until the user says otherwise.

---

## 1. Goal

- The language picker offers all six languages — English, עברית, العربية, Русский, Français, Español
  — everywhere it appears, and switching actually changes the UI language.
- English is the default: a first visit with no stored preference and no matching `Accept-Language`
  lands on `/en`.
- URLs carry the language only: `/en/products`, `/he/analysis`, `/ar/account`. No country, no
  region, no currency-by-country.
- `fr` / `ru` / `ar` / `es` carry real, human-readable translated copy for every UI string `en` has
  — not an English fallback.

### Non-goals

- **No SSR/prerendering.** Client-rendered SPA, unchanged. Static `index.html` stays
  `noindex,nofollow`.
- **No new locales beyond these six.** The registry already lists them.
- **No report/plan _body content_ translation for `fr`/`ru`/`ar`/`es`.** Report and plan content is
  built from `roote.config` `LocalizedText`, which only has `en`/`he` (and is partly `[PENDING]`).
  Non-Hebrew locales keep resolving to `en` content via `contentLocaleOf()` — only the UI _chrome_
  around the report localizes. Same behavior `he` already gets for any config gap.
- **No copy/IA/domain-logic changes** beyond the message catalog and the picker.
- **No host-level 301s.** Bare/legacy path correction stays a client-side `<Navigate>`, as today.

---

## 2. Locked scope decisions

| Decision | Choice | Source |
|---|---|---|
| Translation depth | **Full first-pass** — every `en.ts` key translated in `fr`/`ru`/`ar`/`es`. Chunked by namespace, resumable across sessions. | User, 2026-09-10 |
| Region / country axis | **Removed entirely.** URL prefix is `{locale}` only. Country picker and country→currency mapping deleted. Single currency stays `roote.config.currency` (`'USD'`, effectively `[PENDING]`). | User, 2026-09-10 |
| Picker UI | **One dropdown component** used in every location — replaces both `CountryLanguageSelector` (Header ×2, Footer) and `LocaleToggle` (FunnelShell, AnalysisShell, AppShell ×2). | User, 2026-09-10 |
| Default locale | `en` (was `he`). | Screenshot instruction, 2026-09-10 |
| Build order | Structure → picker → translations (one language at a time, chunked). App is fully functional at every checkpoint. | Recommended, approved |

---

## 3. The locale URL segment

Format: a single lowercase segment equal to a `LocaleCode`. Valid **iff** `segment ∈ ENABLED_LOCALES`.

After this change `ENABLED_LOCALES` is all six — the `shipped` / `VITE_I18N_SHOW_SCAFFOLDS` gate is
removed (every locale ships real content once its translation chunk lands; until then the runtime
`t()` English fallback covers partial files, exactly as it does now for the empty scaffolds).

`contentLocale` (`en` | `he`, feeds `buildReport` / `resolvePlanTreatments`) is still derived from the
segment via the unchanged `contentLocaleOf()` — `he → he`, everything else → `en`.

There is no `country`, no `currency` axis in the URL or the context.

---

## 4. Routing architecture

The wrapper route stays; only the param name and the validation narrow:

```
{ path: '/:locale', element: <LocaleGate />, children: [ ...today's full child route array, unchanged... ] }
```

`<LocaleGate>` validates `params.locale ∈ ENABLED_LOCALES`; on failure it `<Navigate>`s to the
corrected path instead of rendering `<Outlet/>`. The trailing top-level `{ path: '*' }` catch-all
handles the true bare root (`/`) and deeper mismatches (e.g. `/products/foo` where `products` is
consumed as an invalid locale).

Both call sites share the pure function, renamed and simplified:

```
resolveLocaleRedirect(pathname, storedLocale, acceptLanguage): string | null
```

- Returns `null` if `pathname`'s first segment is already a valid locale.
- Otherwise returns the corrected full path: `storedLocale` if persisted and valid, else the first
  `Accept-Language` tag whose primary subtag ∈ `ENABLED_LOCALES`, else `DEFAULT_LOCALE` (`en`) —
  prepended onto the whole original path, then `LEGACY_PREFIX_REDIRECTS` applied to the rest-of-path
  in the same pass (one hop, not two — carried over from the 2026-09-05 spec §4).

Persistence: `localStorage['roote.locale']` (renamed from `roote.localeRegion`), write-only "last
known preference," read only by `resolveLocaleRedirect`. Any value stored under the old
`roote.localeRegion` key is simply ignored (a returning visitor re-detects from `Accept-Language` →
`en` once) — no migration, this is a concept build.

---

## 5. `src/i18n/locales.ts` — trimmed to language only

**Keep:** `LocaleCode`, `ContentLocale`, `LocaleMeta` (`code`, `label`, `englishName`, `dir`,
`bcp47`), `LOCALES`, `ALL_LOCALES`, `DEFAULT_LOCALE` (→ `'en'`), `RTL_LOCALES`, `ENABLED_LOCALES`
(→ `ALL_LOCALES`), `isLocaleCode`, `dirOf`, `contentLocaleOf`.

**Delete:** the `shipped` field on `LocaleMeta`, `LOCALE_ROADMAP`, `SHIPPED_LOCALES`, `CurrencyCode`,
`CountryDefault`, `COUNTRY_DEFAULTS`, `DEFAULT_COUNTRY`, `LAUNCH_CURRENCIES`, `launchCurrencyFor`,
`countryDefault`, and the `VITE_I18N_SHOW_SCAFFOLDS` branch inside `ENABLED_LOCALES` (which becomes a
plain `[...ALL_LOCALES]`).

`LOCALES` picker order stays the roadmap order: `en → he → ar → ru → fr → es`.

`src/i18n/localeRegion.ts` → renamed `src/i18n/localeUrl.ts`. `parseLocaleRegion` /
`isValidLocaleRegion` / `formatLocaleRegion` collapse to `isValidLocaleSegment(seg)` (a bare
`ENABLED_LOCALES.includes` check); `PREFERRED_REGION_KEY` → `PREFERRED_LOCALE_KEY`;
`readStoredRegion` / `writeStoredRegion` → `readStoredLocale` / `writeStoredLocale`;
`detectLocaleFromAcceptLanguage` and `applyLegacyRedirects` unchanged; `resolveLocaleRedirect`
signature per §4.

---

## 6. `src/i18n/LocaleProvider.tsx` — narrower context

Context shape:

```ts
type Ctx = {
  locale: LocaleCode;
  contentLocale: ContentLocale;   // en | he — for buildReport etc.
  dir: 'rtl' | 'ltr';
  setLocale: (l: LocaleCode) => void;
  t: (key: MessageKey, vars?) => string;
};
```

**Removed:** `country`, `currency`, `localeRegion`, `setCountry`, `setLocaleRegion`.

`LocaleProvider` takes `locale?: LocaleCode` (was `localeRegion?: string`); default `DEFAULT_LOCALE`.
`setLocale(l)` calls `navigate()` to `/{l}` + the current path's segments after the first + the
existing `search`. `useEffect` sets `documentElement.lang` / `dir` and calls `writeStoredLocale(locale)`.

`useLocalizedPath()` returns `withLocale(path)` = `/{locale}` for `'/'`, otherwise `/{locale}` + `path`.

`useLocale()` returns `{ locale, contentLocale, dir, setLocale }`. `useContentLocale()`, `useT()`
unchanged.

---

## 7. `LanguagePicker` — one component, every location

New: `src/app/components/roote/LanguagePicker.tsx`. Presentational + controlled (takes `locale`,
`onChange`, optional `compact`, `className`, and localized `labels`).

- **Trigger:** `<button aria-haspopup="menu" aria-expanded>` — globe icon + current `LOCALES[locale].label`
  (icon only when `compact`, for the tight header row). `sr-only` text from `labels.open`.
- **Menu:** the six `ENABLED_LOCALES` as a `role="menu"` list; each item shows its endonym
  (`LOCALES[code].label`), active one gets `aria-current` + a check mark. Select → `onChange(code)` +
  close.
- **Behavior:** click-outside + `Esc` close; `↑`/`↓`/`Home`/`End` roving focus; focus returns to the
  trigger on close. Opens as a lightweight popover (not the full `Modal`) — small enough that no
  `Overlay` dependency is needed. `motion` entrance with a `useReducedMotion` static fallback.
- **RTL:** logical utilities only (`ms/me/ps/pe`, `start-*/end-*`, `text-start`). Popover anchors to
  the trigger's `end` edge in both directions.

**Wiring:**

| File | Was | Now |
|---|---|---|
| `Header.tsx` | `<CountryLanguageSelector compact>` (desktop) + `<CountryLanguageSelector>` (drawer) | `<LanguagePicker compact>` + `<LanguagePicker>`; drop `country` / `setLocaleRegion` / `onChangeCountry` / `regionLabels` |
| `Footer.tsx` | `<CountryLanguageSelector>` | `<LanguagePicker>`; drop `country` / `setLocaleRegion` / `onChangeCountry` |
| `FunnelShell.tsx` | `<LocaleToggle />` | `<LanguagePicker compact />` |
| `AnalysisShell.tsx` | `<LocaleToggle />` | `<LanguagePicker compact />` |
| `AppShell.tsx` (×2) | `<LocaleToggle className=... />` | `<LanguagePicker compact className=... />` |

**Deleted:** `src/app/components/brand/LocaleToggle.tsx`,
`src/app/components/roote/CountryLanguageSelector.tsx` (+ its `roote/index.ts` export). `Modal` /
`Overlay` stay — still used by `AnalysisShell` and `AnalysisPrompt`.

**i18n keys:** remove `locale.toggle.toHe` / `locale.toggle.toEn` (already orphaned — `LocaleToggle`
hardcodes its labels) and `marketing.region.*` (5 keys, only used by the two Headers/Footer).
Add `nav.language.open` ("Change language"), `nav.language.title` ("Language"),
`nav.language.current` ("Current language: {name}"). Net catalog change: −7 keys, +3, in all six
files.

---

## 8. `money.ts` / currency

`formatMoney(amount, currency, locale)` today accepts `locale: 'en' | 'he'` and hard-maps to
`he-IL` / `en-US`. Widen to `locale: LocaleCode` and use `LOCALES[locale].bcp47` for the
`Intl.NumberFormat` locale. Currency argument still comes from `rooteContent.currency` (`'USD'`) at
every call site — unchanged. Call sites currently passing `contentLocale` (`cl`) can pass the full
`locale` instead; those passing `contentLocale` for `buildReport` stay on `contentLocale`.

`roote.config.ts` currency comment (lines ~39–42, references the deleted `launchCurrencyFor` /
`en-US→USD` country logic) gets rewritten to "single display currency for the concept build;
`[PENDING]` real pricing."

---

## 9. Translations — the `fr` / `ru` / `ar` / `es` track

### 9.1 Source of truth & rules

- Translate **every key present in `en.ts`** (the `MessageKey` union). `he.ts` is the reference for
  tone on legal/medical strings.
- **Hard rule 1 (no invented product content):** strings that are `[PENDING: …]` markers or that
  interpolate config values stay structurally identical — translate only the surrounding words, keep
  the `{var}` placeholders and any `[PENDING]` text verbatim.
- **Hard rule 2 (parity, no `""`):** every key gets a real non-empty value. Legal / medical / Terms
  strings: translate the meaning, and where `he.ts` carries a "pending formal legal review"-style
  hedge, mirror it in the new locale.
- **Hard rule 5 (RTL):** `ar` copy is plain text; direction is handled by `dir="rtl"` from `LOCALES`.
  Watch for embedded Latin brand tokens / URLs / numbers that need `dir="ltr"` spans — mirror
  whatever `he.ts` already does for the same key.
- Interpolation: `interpolate()` only supports `{var}` — keep placeholder names exactly.
- File shape stays `export const xx: Partial<Record<MessageKey, string>> = { … }` (keep `Partial`
  so a half-finished file still type-checks mid-session; the parity script is the completeness gate).

### 9.2 Chunking (resume unit = one language × one namespace)

Namespaces by size, from `en.ts`:

| Chunk | Approx keys |
|---|---|
| `marketing.*` | 514 |
| `app.*` | 262 |
| `report.*` | 98 |
| `analysis.*` | 41 |
| `start.*` / `checkout.*` / `bag.*` / `cart.*` / `program.*` | ~98 |
| everything else (`common`, `auth`, `photo`, `gray`, `zone`, `diagnosis`, `hairScan`, `metric`, `severity`, `level`, `role`, `accountRescan`, `scale`, `brand`, `meta`, `nav.language`) | ~80 |

Order per language: small tail first (fastest visible payoff — nav, buttons, picker), then
`analysis`, `report`, `start`-group, `app`, `marketing` last. Language order: `ar` → `ru` → `fr` →
`es` (roadmap order; `ar` first so RTL copy is exercised early).

The implementation plan pins each `(language, namespace)` as its own task with an explicit
resume marker, so a session that ends mid-track picks up at a named boundary.

### 9.3 Close the existing `en`/`he` gap

`en.ts` has ~1324 keys, `he.ts` ~1316. During the parity pass, enumerate the diff and fill the
missing `he` keys (first-pass Hebrew, flag legal ones for formal review) so all six files reach
exact key parity.

---

## 10. Files touched

**Structure:**
- `src/i18n/locales.ts` — trim to language-only (§5)
- `src/i18n/localeRegion.ts` → `src/i18n/localeUrl.ts` — rename + simplify (§5)
- `src/i18n/LocaleProvider.tsx` — narrower context, `setLocale` navigate (§6)
- `src/i18n/messages/index.ts` — drop the stale `Locale = 'en' | 'he'` note / widen comment; `messages` map unchanged in shape
- `src/app/LocaleGate.tsx` — `:locale` param, `isValidLocaleSegment`
- `src/app/App.tsx` — route `path: '/:locale'`
- `src/seo/useDocumentMeta.ts` — strip `/${locale}`; hreflang = 6 language alternates + `x-default`
- `src/domain/report/money.ts` — `locale: LocaleCode`, `bcp47` lookup (§8)
- `src/content/roote.config.ts` — currency comment rewrite (§8)
- `src/app/components/shell/{Header,Footer,MarketingShell,FunnelShell}.tsx`,
  `src/app/routes/analysis/AnalysisShell.tsx`, `src/app/routes/app/AppShell.tsx` — picker swap;
  `MarketingShell` `localeRegion` → `locale`
- `src/store/devSeed.ts` — unchanged (`contentLocaleOf` / `LocaleCode` still import from
  `@/i18n/locales`, which keeps its name)
- ~127 `localeRegion` / `useLocalizedPath` / `LocalizedNavigate` references — mechanical
  `.localeRegion` → `.locale` where the field is read; `useLocalizedPath` / `LocalizedNavigate` keep
  working unchanged (only their internal prefix source changes)

**Picker:**
- New `src/app/components/roote/LanguagePicker.tsx` + `roote/index.ts` export
- Delete `src/app/components/brand/LocaleToggle.tsx`,
  `src/app/components/roote/CountryLanguageSelector.tsx`

**Translations:**
- `src/i18n/messages/{ar,ru,fr,es}.ts` — full first-pass content (§9)
- `src/i18n/messages/he.ts` — fill the ~8 missing keys (§9.3)
- New `scripts/check-i18n-parity.mjs` + `package.json` `"i18n:check"` script (§11) — optional,
  recommended; drop if the user declines

---

## 11. Verification (no test suite in the main tree)

- **`scripts/check-i18n-parity.mjs`** (plain Node, not Vitest — the removed suite is not being
  revived): parses each `messages/*.ts`, asserts every locale's key set === `en`'s key set, no stray
  keys, no empty-string values, no `{var}` placeholder present in `en` but missing in a translation.
  Exit 1 on any violation. Run after every translation chunk.
- **`pnpm typecheck`** — must stay at 0. The `MessageKey` union is `en`-derived, so a stray key in a
  translation file is also a type error.
- **`pnpm build`** — must pass.
- **Browser pass** (`pnpm dev`): each of the six languages — picker shows all six; selecting one
  navigates to `/<code>/…` and re-renders; `ar` and `he` flip to RTL; refresh keeps the language;
  a bare `/products` redirects to `/en/products`; deep links (`/fr/analysis`, `/ar/account`) load;
  language switch preserves the current route (doesn't bounce home). Spot-check Header, Footer,
  Analysis flow, an Account page, a report.
- **Manual grep gate:** `grep -rn "localeRegion\|COUNTRY_DEFAULTS\|setLocaleRegion\|CountryLanguageSelector\|LocaleToggle\|marketing\.region\." src` returns nothing after the structure + picker phase.

---

## 12. What this supersedes

`2026-09-05-international-url-hreflang-design.md` §2–§7 (the language **+ region** URL contract):
- §2 "URL shape: `/en-us/`" → language-only `/en`
- §3 locale-region segment → single locale segment (§3 here)
- §5 `setCountry` / country half of the context → removed (§6 here)
- §7 "16 alternate tags + 1 x-default" → 6 language alternates + 1 `x-default`

Everything else from that spec — the `/:param` wrapper route mechanism, `<LocaleGate>`,
`resolveLocaleRedirect` shape, `useLocalizedPath()`, the legacy-redirect composition,
`useDocumentMeta` prefix-stripping, "Googlebot runs JS so client hreflang counts" — carries forward
unchanged.

---

## 13. Out of scope, noted for later

- SSR / prerendering (SEO-AUDIT C3) — still open; this keeps every URL deterministic (locale +
  route) so a later prerender sub-project can swap the dynamic `:locale` param for static per-locale
  branches without changing the URL contract.
- Real HTTP 301s at the hosting layer.
- Re-introducing region / currency-by-country if commerce ever needs it — additive (a separate
  currency control), not a re-merge into the language axis.
- Professional translation review of the first-pass `fr`/`ru`/`ar`/`es` copy, and formal legal
  review of translated Terms / medical disclaimers.
- Translating report/plan **body** content (needs `roote.config` `LocalizedText` to grow beyond
  `en`/`he`, much of which is `[PENDING]`).
