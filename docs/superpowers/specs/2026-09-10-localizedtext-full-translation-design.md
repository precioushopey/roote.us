# LocalizedText Full Translation — Design Spec

**Date:** 2026-09-10
**Status:** Draft for review
**Relation:** Extends `2026-09-10-six-language-i18n-design.md`. That rework translated the i18n
**message-key** copy into all six locales but explicitly scoped out (§Non-goals) the **content
layer** — `src/content/*` and `roote.config.ts` `LocalizedText` (`{ en, he }`), which `ar/ru/fr/es`
fall back to English for via `contentLocaleOf()`. The visible symptom: on `/ar /ru /fr /es` the home
hero **headline** ("A hair growth system, customized for *you*.") renders English while the
sub-paragraph and CTA around it (message-key copy) render translated. **This spec reverses that
non-goal** — every customer-visible `LocalizedText` string gets `ar/ru/fr/es` translations.

**Working constraint (unchanged):** nothing is committed or pushed. The prior rework's staged
changeset stays underneath; this work stacks on top, staged, uncommitted.

---

## 1. Goal

Every `LocalizedText` value a customer can see renders in the active locale on `/en /he /ar /ru /fr
/es`. Concretely: home hero + system steps + concern cards; the product catalogue (names,
descriptions, PDP copy); bundles; programs / solutions; FAQs; the magazine; the legal registry; the
analysis-flow assessment questions & options; the web report's disclaimers and treatment names.

### Non-goals
- **No new `[PENDING]` content invented.** A `LocalizedText` whose value is a `[PENDING: …]` marker
  stays a marker in every locale. `roote.config` facts that are `null` stay `null`.
- **No message-key changes.** `src/i18n/messages/*` is done; untouched here.
- **No routing / picker / `locales.ts` changes.** Pure content-layer work.
- **No commits.**

---

## 2. Locked scope decisions

| Decision | Choice |
|---|---|
| Coverage | **Everything customer-visible** — all ~283 `LocalizedText` entries across `src/content/*` (270) + `roote.config.ts` (13), ×4 languages ≈ **1,132 new strings**. (User, 2026-09-10.) |
| Data-model | **Widen `LocalizedText` to `{ en; he; ar?; ru?; fr?; es? }`** — new locales optional. `pickLocalized` / `resolveLocalized` fall back to `en` for a missing field, so every module is non-breaking until its translations land. |
| Fill order | One content module per task, smallest-blast-radius first, `assessment.ts` (83) last. |
| Reference | The `he` string already in each entry is the per-key translation reference (tone, brand-token handling, `[PENDING]`/legal treatment), exactly as `he.ts` was for the message-key phase. |
| Legal/medical | `legal.ts`, `roote.config` `disclaimers.*`, and any Terms/medical string get the `he`-style "pending formal legal review" hedge in each new locale, and stay flagged at their call site. |
| Verification | Extend the parity tooling to flag `LocalizedText` entries missing any of `ar/ru/fr/es`; `pnpm typecheck` 0; `pnpm build` ✓; browser matrix. |

---

## 3. Data model — `LocalizedText` widening

Two identical type declarations exist and both widen the same way:
- `src/content/localized.ts` — `export type LocalizedText = { en: string; he: string; ar?: string; ru?: string; fr?: string; es?: string };`
- `src/content/roote.config.ts` — its own local `type LocalizedText` (line 1), same widening.

`src/content/localized.ts`:
```ts
import type { LocaleCode } from '@/i18n/locales';   // locales.ts is a pure data module — no cycle
export type LocalizedText = { en: string; he: string; ar?: string; ru?: string; fr?: string; es?: string };
export const L = (en: string, he: string): LocalizedText => ({ en, he });
/** Extended form for entries translated into all six. */
export const L6 = (t: LocalizedText): LocalizedText => t;
export function pickLocalized(text: LocalizedText, locale: LocaleCode): string {
  return text[locale] || text.en;
}
```
`L(en, he)` stays valid (the 4 extra fields are optional) so untranslated modules keep compiling.
A translated entry becomes `L6({ en: '…', he: '…', ar: '…', ru: '…', fr: '…', es: '…' })`, or the
translator may simply add the four keys to an existing inline object literal / `L(...)` call
converted to `L6({...})`. Either shape is fine; the parity check enforces completeness, not form.

`src/domain/report/buildReport.ts`:
- `type Locale = 'en' | 'he'` → `type Locale = LocaleCode` (import from `@/i18n/locales`).
- `resolveLocalized(text: LocalizedText, locale: Locale, label)` — unchanged body; `text[locale] ?? …`
  already falls back, and the `PendingMarker` path is unaffected.
- `buildReport({ locale })` / `resolvePlanTreatments(...)` are called with `contentLocale`
  (`'en'|'he'`) today at `ReportPage.tsx`, `PlanStep.tsx`, `CheckoutStep.tsx`, `devSeed.ts` — switch
  each to the full `locale` from `useLocale()` (`devSeed` takes it as a param already).

`src/seo/meta.ts` + `src/seo/useDocumentMeta.ts` — `ROUTE_META` entries are `LocalizedText`;
`pickLocalized(meta.title, contentLocale)` → pass the full `locale`. (hreflang already emits 6.)

---

## 4. Call-site sweep — `useContentLocale()` → `useLocale().locale`

~30 components hold `const cl = useContentLocale()` and feed `cl` to `pickLocalized`. After §3,
`pickLocalized` takes `LocaleCode` and `ContentLocale ⊂ LocaleCode`, so **they keep compiling
unchanged** — but they'd still only ever pass `'en'|'he'`. To actually render the translations,
every such site switches to `const cl = useLocale().locale`. Inventory (mechanical, greppable —
`grep -rn "useContentLocale" src`):

`Home.tsx` (×4 scopes) · `Products.tsx` (×2) · `ProductDetail.tsx` · `SolutionPage.tsx` (×2) ·
`Faq.tsx` · `Magazine.tsx` · `HairScan.tsx` · `Footer.tsx` · `BagPage.tsx` · `BagCheckout.tsx` ·
`LegalPageView.tsx` · `CheckoutStep.tsx` · `PlanStep.tsx` · `AnalysisShell.tsx` · `Steps1to3.tsx`
(×2) · `QuestionsScreen.tsx` · `ScanningScreen.tsx` · `ResultsScreen.tsx` · `AccountBaseline.tsx` ·
`AccountPhotos.tsx` · `AccountScans.tsx`.

`useContentLocale()` becomes vestigial after this sweep — keep the export (harmless, one line) or
delete it; the plan decides during implementation. `useDocumentMeta` still imports `contentLocale`
via `useLocale()` — that field stays on the context for anything genuinely en/he-bound; nothing is.

---

## 5. Translation tasks — one content module each

`he` string in each entry is the reference. Rules per entry (identical to the message-key phase):
keep `{var}` placeholders verbatim; keep `[PENDING: …]` bracket text verbatim (translate only words
outside brackets); brand tokens (`ROOTÉ`, `91 ENTERPRISE LLC`, product names, `ABN Complex™`,
`HairHealth.ai`, `HubSpot`, `Landbot`) stay Latin-script verbatim; `ar` needs no direction markup
(global `dir="rtl"`) beyond mirroring any `<span dir="ltr">` `he` already uses; legal/medical gets
the formal-review hedge where `he` has one.

| # | Module | ~entries | Notes |
|---|---|---|---|
| 1 | `src/content/catalog.ts` | 3 | smallest — shakes out the infra |
| 2 | `src/content/bundles.ts` | 12 | |
| 3 | `src/content/brand.ts` | 21 | **the hero headline is here** — `brandLines.headline`, `*word*` emphasis markers kept |
| 4 | `src/content/programs.ts` | 15 | |
| 5 | `src/content/solutions.ts` | 22 | |
| 6 | `src/content/products.ts` | 41 | names keep `ROOTÉ`; PDP prose |
| 7 | `src/content/faqs.ts` | 28 | |
| 8 | `src/content/magazine.ts` | 25 | |
| 9 | `src/content/legal.ts` | 20 | formal-review hedge in every new locale |
| 10 | `roote.config.ts` `LocalizedText` entries | 13 | tagline + 7 treatment names (keep `ROOTÉ`) + 4 disclaimers (hedge) |
| 11 | `src/content/assessment.ts` | 83 | largest — the analysis-flow questions & options; likely needs sub-chunking, resumable |

Each task: fill `ar/ru/fr/es` for every entry → run the content-parity check for that module → `pnpm
typecheck` 0 → checkpoint.

---

## 6. Verification

- **New:** `scripts/check-content-parity.mjs` (plain Node, `pnpm content:check`) — walks
  `src/content/*.ts` + `roote.config.ts`, finds every object literal with `en:` + `he:` string
  fields, reports per-file counts of entries missing `ar` / `ru` / `fr` / `es` and any with an empty
  new-locale value. Exit non-zero on any gap; `--allow-missing` for mid-phase. (Mirrors
  `check-i18n-parity.mjs`; a static-parse heuristic — the plan notes hardening if counts look off.)
- `pnpm typecheck` → 0 throughout.
- `pnpm build` → ✓.
- `pnpm i18n:check` → still 0 (untouched).
- **Browser matrix** on `/ar /ru /fr /es`: home hero headline + system steps translated; a PDP; the
  FAQ page; a legal page; the analysis flow's first question screen; a generated report's disclaimer
  line. Plus `/en` and `/he` unchanged.
- **Grep gate:** after the §4 sweep, `grep -rn "useContentLocale" src` returns only the definition
  (or nothing, if deleted).

---

## 7. Out of scope / follow-ups

- Professional linguistic review of the first-pass `ar/ru/fr/es` content copy; formal legal review
  of translated `legal.ts` / disclaimers.
- The `formatMoney` call-site migration (still deferred from the prior rework — prices format
  `en-US` on the four locales; single hardcoded `USD`, multi-currency out of scope).
- `roote.config` `[PENDING]` facts — untouched; they render as pending chips in every locale.
