# LocalizedText Full Translation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Translate every customer-visible `LocalizedText` string in `src/content/*` and
`roote.config.ts` into `ar`, `ru`, `fr`, `es` (~283 entries × 4 ≈ 1,132 strings), so all marketing /
product / analysis / report surfaces render in the active locale on `/ar /ru /fr /es`.

**Architecture:** Widen `LocalizedText` from `{en,he}` to `{en; he; ar?; ru?; fr?; es?}` (new fields
optional → non-breaking); `pickLocalized` / `resolveLocalized` take `LocaleCode` and fall back to
`en`. One infra task does the type + call-site sweep (~35 files); then one translation task per
content module, `he` string as the per-entry reference, guarded by a new `pnpm content:check`.

**Tech Stack:** TypeScript strict (`tsc --noEmit`), Vite, React 18 + react-router, plain-Node scripts.

**Spec:** `docs/superpowers/specs/2026-09-10-localizedtext-full-translation-design.md`

## Global Constraints

- **No `git commit`, no `git push`, no branch.** This stacks on the prior rework's staged, uncommitted
  changeset. Each task ends with a **Checkpoint** = `git add` of that task's files (staging is the
  boundary; nothing enters history). Commit messages are pre-written per task for when the hold lifts.
- **No test suite / no test files.** Verification = `pnpm typecheck` (0), `node scripts/check-content-parity.mjs`
  (`pnpm content:check`), `pnpm build`, `pnpm i18n:check` (must stay 0 — untouched), browser matrix.
- **Never invent product content.** `[PENDING: …]` marker text and `{var}` placeholders are copied
  **verbatim** into every locale — translate only surrounding words. `null` config facts stay `null`.
- **`he` is the per-entry reference.** Each `LocalizedText` already carries a Hebrew string — match its
  tone, brand-token handling, and `[PENDING]`/legal treatment when writing `ar/ru/fr/es`.
- **Legal / medical strings** (`legal.ts`, `roote.config` `disclaimers.*`, any Terms/medical copy)
  carry a "pending formal legal review" hedge in each new locale, mirroring `he`.
- **Brand tokens** stay Latin-script verbatim: `ROOTÉ`, `91 ENTERPRISE LLC`, product names,
  `ABN Complex™`, `HairHealth.ai`, `HubSpot`, `Landbot`, `Level 6/10/15`.
- **RTL:** `ar` copy is plain text (global `dir="rtl"`); only wrap a Latin/URL/number run in
  `<span dir="ltr">…</span>` where the `he` string for the same entry already does.
- **Domain purity:** `src/domain/**` and `src/content/**` still import no React/DOM/storage/i18n-provider.
  `localized.ts` importing `type LocaleCode` from `@/i18n/locales` is allowed (`locales.ts` is a pure
  data module — verified: no such imports).
- `pnpm i18n:check` and `pnpm content:check` locale lists must both read `en he ar ru fr es`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/content/localized.ts` | Widen `LocalizedText`; `pickLocalized(text, locale: LocaleCode)`; add `L6({...})` passthrough for filled entries. |
| `src/content/roote.config.ts` | Widen its own local `type LocalizedText` identically. Its 13 entries are Task 12's content. |
| `src/domain/report/buildReport.ts` | `type Locale` → `LocaleCode`; `resolveLocalized` param widens; body unchanged. |
| `src/app/routes/report/ReportPage.tsx`, `src/app/routes/start/PlanStep.tsx`, `src/app/routes/start/CheckoutStep.tsx`, `src/store/devSeed.ts` | Feed `buildReport`/`resolvePlanTreatments` the full `locale`, not `contentLocale`. |
| `src/seo/meta.ts`, `src/seo/useDocumentMeta.ts` | `pickLocalized(meta.*, locale)` with full `LocaleCode`. |
| ~30 components holding `const cl = useContentLocale()` | → `const cl = useLocale().locale` (§4 inventory in spec). |
| `src/i18n/LocaleProvider.tsx` | `useContentLocale()` — keep (harmless) or delete if no consumer remains; decide in Task 1. `contentLocale` stays on the context. |
| `scripts/check-content-parity.mjs` (NEW) | Plain Node. Per content file: entries missing `ar/ru/fr/es` or with an empty new value. Exit ≠ 0 on any; `--allow-missing`, `--file <name>`. |
| `package.json` | `+ "content:check": "node scripts/check-content-parity.mjs"`. |
| `src/content/{catalog,bundles,brand,programs,solutions,products,faqs,magazine,legal}.ts` | Tasks 2–10: fill `ar/ru/fr/es` per entry. |
| `roote.config.ts` `LocalizedText` entries | Task 11: tagline + 7 treatment names + 4 disclaimers. |
| `src/content/assessment.ts` | Task 12: ~83 entries, sub-chunk by exported const, resumable. |

---

## Phase A — Infra

### Task 1: Widen `LocalizedText`, sweep call sites, add the parity script

**Files:** `src/content/localized.ts`, `src/content/roote.config.ts` (type line only),
`src/domain/report/buildReport.ts`, `src/app/routes/report/ReportPage.tsx`,
`src/app/routes/start/PlanStep.tsx`, `src/app/routes/start/CheckoutStep.tsx`, `src/store/devSeed.ts`,
`src/seo/meta.ts`, `src/seo/useDocumentMeta.ts`, the ~30 `useContentLocale()` components,
`scripts/check-content-parity.mjs` (create), `package.json`.

**Interfaces produced:**
- `type LocalizedText = { en: string; he: string; ar?: string; ru?: string; fr?: string; es?: string }` (both declarations)
- `pickLocalized(text: LocalizedText, locale: LocaleCode): string`
- `L6 = (t: LocalizedText): LocalizedText => t`
- `node scripts/check-content-parity.mjs [--allow-missing] [--file <basename>]` — prints per-file
  `missing-ar/ru/fr/es` + `empty` counts; exit 2 on any gap (unless `--allow-missing`).

- [ ] **Step 1: widen the two `LocalizedText` type declarations** (`localized.ts`, `roote.config.ts`) — add the four optional fields; in `localized.ts` add the `LocaleCode` import + `L6` + widen `pickLocalized`'s `locale` param to `LocaleCode`.
- [ ] **Step 2: `buildReport.ts`** — `type Locale = LocaleCode` (import it); `resolveLocalized(text: LocalizedText, locale: Locale, …)` — body already does `text[locale] ?? pending`, unchanged.
- [ ] **Step 3: feed the full locale** — `ReportPage.tsx` / `PlanStep.tsx` / `CheckoutStep.tsx`: the `buildReport(...)` / `resolvePlanTreatments(...)` call gets `locale` from `useLocale()` instead of `contentLocale`/`cl`. `devSeed.ts` — `seedProgram(locale)` already takes a `LocaleCode`; pass it straight through to `buildReport` (drop the `contentLocaleOf` narrowing there).
- [ ] **Step 4: `seo/meta.ts` + `useDocumentMeta.ts`** — `pickLocalized(meta.title/description, locale)` with the full `LocaleCode` (`useDocumentMeta` already destructures `locale`).
- [ ] **Step 5: call-site sweep** — every `const cl = useContentLocale()` → `const cl = useLocale().locale` (add `useLocale` to the `@/i18n/LocaleProvider` import; drop `useContentLocale` from it where now unused). Inventory: `grep -rn "useContentLocale" src`. Leave `useContentLocale`'s definition in `LocaleProvider.tsx` if anything still imports it after the sweep, else delete it and its export.
- [ ] **Step 6: `scripts/check-content-parity.mjs`** — plain Node, no deps. Read each `src/content/*.ts` + `src/content/roote.config.ts`; strip comments (reuse the `stripComments` approach from `check-i18n-parity.mjs`); find every `{ … en: <str> … he: <str> … }` object (also `L('…','…')` and `L6({…})` forms); for each, check `ar`/`ru`/`fr`/`es` present + non-empty. Print `file: missing-ar=N missing-ru=N missing-fr=N missing-es=N empty=N`. Exit 2 if any non-zero (unless `--allow-missing`). `--file <basename>` scopes to one. Add `"content:check"` to `package.json`.
- [ ] **Step 7: verify** — `pnpm typecheck` → 0. `node scripts/check-content-parity.mjs --allow-missing` → exit 0, every content file shows large `missing-*` (nothing translated yet) but `empty=0`. `node scripts/check-content-parity.mjs` → exit 2. `pnpm build` → ✓. `pnpm i18n:check` → still 0. `grep -rn "useContentLocale" src` → only the definition or nothing.
- [ ] **Step 8: Checkpoint** — `git add` the touched files.
  `feat(content): widen LocalizedText to six locales; add content-parity check`

---

## Phase B — Translations (one content module per task)

Every Phase B task follows the **same method**:
1. Open the module. For **every** `LocalizedText` entry (`L('en','he')`, `L6({...})`, or inline
   `{ en, he }`), add `ar` / `ru` / `fr` / `es` — real translations, `he` string as the reference,
   Global-Constraints rules applied. Convert `L('a','b')` → `L6({ en:'a', he:'b', ar:…, ru:…, fr:…, es:… })`
   (or add keys to the inline object) — the parity check enforces completeness, not form.
2. `node scripts/check-content-parity.mjs --file <basename>` → `missing-ar/ru/fr/es = 0`, `empty = 0`.
3. `pnpm typecheck` → 0.
4. Checkpoint (`git add` the one file).

If a module is too large for one pass, stop at an exported-const boundary, leave the file
`typecheck`-clean, report DONE_WITH_CONCERNS with the `--file` counts and the last-done const.

### Task 2: `src/content/catalog.ts` (~3 entries)
Checkpoint msg: `i18n(content): translate catalog.ts`

### Task 3: `src/content/bundles.ts` (~12)
Checkpoint msg: `i18n(content): translate bundles.ts`

### Task 4: `src/content/brand.ts` (~21) — **the home hero headline is `brandLines.headline`**
Keep the `*word*` emphasis markers (Hero's `renderWithEmphasis` splits on them); the emphasised word
may sit at a different position per language, as the existing `he` string already does. `\n` line
break preserved. Also covers `descriptor`, `promise`, `secondary`, `supporting[]`, `cta.*`,
`threeStrand.*`, `systemSteps[].title/.body`.
Checkpoint msg: `i18n(content): translate brand.ts (home hero, system steps, CTAs)`

### Task 5: `src/content/programs.ts` (~15)
Checkpoint msg: `i18n(content): translate programs.ts`

### Task 6: `src/content/solutions.ts` (~22)
Checkpoint msg: `i18n(content): translate solutions.ts`

### Task 7: `src/content/products.ts` (~41)
Product `name` fields keep `ROOTÉ` / trademark tokens verbatim; translate `subtitle` / `heroCopy` /
`usage` / `safety` / `formulaReference` / FAQ `q`/`a` / ingredient `note`.
Checkpoint msg: `i18n(content): translate products.ts`

### Task 8: `src/content/faqs.ts` (~28)
Checkpoint msg: `i18n(content): translate faqs.ts`

### Task 9: `src/content/magazine.ts` (~25)
Checkpoint msg: `i18n(content): translate magazine.ts`

### Task 10: `src/content/legal.ts` (~20)
**Every** new-locale value carries the `he`-style "pending formal legal review" hedge; keep the
call-site pending flag. Registry slugs / section ids are not `LocalizedText` — don't touch them.
Checkpoint msg: `i18n(content): translate legal.ts (with formal-review hedge)`

### Task 11: `roote.config.ts` `LocalizedText` entries (~13)
`brand.tagline`; 7 `treatments[].name` (keep `ROOTÉ`, `ABN Complex™`; several are the identical
`"ROOTÉ Hair Growth Treatment"` — translate consistently); 4 `disclaimers.*` (`medical`,
`notADiagnosis`, `demo`, `formulaPending` — all get the hedge). Leave the `// TODO: confirm medical HE`
comments; add an equivalent note for the new locales.
Checkpoint msg: `i18n(content): translate roote.config LocalizedText (tagline, treatments, disclaimers)`

### Task 12: `src/content/assessment.ts` (~83) — sub-chunk, resumable
The analysis-flow questions, help text, and answer options. Work one exported const at a time; after
each, run `node scripts/check-content-parity.mjs --file assessment` + `pnpm typecheck`. Stop at a
const boundary if low on room; resume marker = the first const with `missing-* > 0`.
Checkpoint msg (final): `i18n(content): translate assessment.ts (analysis questions & options)`

---

## Phase C — Final verification

### Task 13: Full gate + browser matrix + doc sync

- [ ] **Step 1:** `node scripts/check-content-parity.mjs` (no flags) → exit 0; every content file
  `missing-ar/ru/fr/es = 0`, `empty = 0`.
- [ ] **Step 2:** `pnpm typecheck` → 0. `pnpm i18n:check` → 0. `pnpm build` → ✓.
- [ ] **Step 3:** `grep -rn "useContentLocale" src` → only its definition, or nothing.
- [ ] **Step 4: browser matrix** — `pnpm dev`, for each of `/ar /ru /fr /es`:
  home hero **headline** translated (the original bug), system-steps section translated, a PDF-less
  report's disclaimer line translated, a PDP (`/…/products/<slug>`) translated, `/…/faq` translated,
  a `/…/<legal-slug>` page translated, `/…/analysis/questions` first question translated. `/en` and
  `/he` visually unchanged. No console errors; `ar` still RTL.
- [ ] **Step 5: doc sync** — `CLAUDE.md`: the `### i18n` subsection currently says *"Config
  `LocalizedText` (`brand.ts`, `roote.config.ts`) stays `{en, he}` only — `ar/ru/fr/es` fall back to
  English for … content"* — update to reflect that content is now six-locale too, guarded by
  `pnpm content:check`. Also the `### Content pipeline` line and Hard rule 2 (add `content:check`
  alongside `i18n:check`).
- [ ] **Step 6: Checkpoint** — `git add`.
  `docs: note six-locale content layer + content-parity gate`

---

## Self-Review

**Spec coverage:** §1 goal → Tasks 2–12 + browser matrix (13). §3 data model → Task 1 Steps 1–2.
§3 domain feed → Task 1 Steps 3–4. §4 call-site sweep → Task 1 Step 5. §5 per-module tasks → Tasks
2–12 (table row → task 1:1). §6 verification → Task 1 Step 6 (script), Task 13 (gates + matrix).
§7 out-of-scope (`formatMoney`, `[PENDING]` facts) → untouched, noted. No spec section unimplemented.

**Placeholder scan:** No "TBD"/"handle X". Translation *content* is authored in Tasks 2–12 (1,132
strings can't be inlined); the method, rules, per-module verification, and resume protocol are fully
specified — correct level for this plan.

**Type consistency:** `LocalizedText` shape (Task 1 S1) — consumed by `pickLocalized`/`resolveLocalized`
(S1–S2) and every Phase B task. `pickLocalized(text, locale: LocaleCode)` — every swept call site
(S5) passes `useLocale().locale: LocaleCode`. `type Locale = LocaleCode` in `buildReport` (S2) —
matches the `locale` fed at S3. `L6(t: LocalizedText): LocalizedText` — Phase B tasks emit it or
inline-object equivalent; parity check accepts both.

---

## Execution Handoff

Two options:
1. **Subagent-Driven (recommended)** — fresh subagent per task, review between, resumable Phase B chunks.
2. **Inline Execution** — batched with checkpoints.

Which approach?
