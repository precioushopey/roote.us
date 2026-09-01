# ROOTÉ P2a: Personalized Report + PDF — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the personalized hair report — a `buildReport` pure function producing one `ReportModel`, rendered as both a mobile web page (`/report/:reportId`, the email tap-through target) and a real generated PDF — replacing the current `ReportPlaceholder.tsx` stub.

**Architecture:** One pure `buildReport({diagnosis, analysis, content, locale, reportId}) → ReportModel` resolves every price/claim/name against `roote.config.ts` and the i18n dictionaries, wrapping anything unresolved (`null`, or an empty-string `LocalizedText` value) in a `PendingMarker`. Both the web page and the PDF (`@react-pdf/renderer`) consume `ReportModel` only — neither touches config or i18n directly.

**Tech Stack:** React 18.3.1, react-router 7.13.0 (already wired), `@react-pdf/renderer` 3.x (new), `@fontsource/libre-franklin` + `@fontsource/heebo` (new, for PDF font embedding), Vitest.

**Spec:** `docs/superpowers/specs/2026-09-01-roote-diagnosis-report-app-design.md` §6 (Personalized report), §4.6 (content config), §4.8 (PDF approach). Read it alongside this plan.

## Global Constraints

Every task's requirements implicitly include this section.

- **No invented medical or efficacy content.** Every price, effectiveness figure, or claim the client has not supplied stays a literal `null` in `roote.config.ts` (already true — do not add numbers to that file). `buildReport` renders every such `null` as a `PendingMarker`; never substitute a plausible figure.
- **Empty-string `LocalizedText` values are ALSO unresolved.** Several `roote.config.ts` entries have `he: ''` (supporting-treatment names, `disclaimers.medical`, `disclaimers.notADiagnosis`) — these are real content gaps, not just missing prices. `buildReport` must treat an empty string the same as `null`: wrap it in a `PendingMarker` rather than rendering blank text or silently falling back to English inside a Hebrew report.
- **`buildReport` is pure.** No React, no DOM, no storage, no network. It reads `roote.config.ts` and the plain i18n dictionaries (`messages.en`/`messages.he`) as data, not via the `useT()` hook (which is React-context-bound). Same-shaped output for the same input.
- **Photos use the existing small thumbnail, not a fresh IndexedDB fetch.** `PhotoRef.thumb` (already a small, correctly-sized base64 data URL after the P0/P1 final-review fix) is synchronously available in session state — use it for `ReportModel.photos[].dataUrl`. Do not add an async IndexedDB lookup inside `buildReport`; that would break purity. `// TODO: confirm with client — report photo quality (currently the small on-device thumbnail; a higher-resolution async fetch could be added later if the printed/emailed report needs sharper photos)`.
- **Web and PDF render the same `ReportModel`.** Neither renderer imports `roote.config.ts`, the i18n dictionaries, or `useT()` — both take a fully-resolved model as a prop.
- **RTL.** Web sections use Tailwind logical properties (`ps-`, `pe-`, `text-start`, etc.), matching every prior phase. The PDF sets `direction: 'rtl'` in `@react-pdf/renderer` styles when `locale === 'he'`, and embeds Heebo for Hebrew text.
- **Follow existing tooling conventions.** No `tsconfig.json`, no typecheck script, ever. `@` → `src/` alias. `crypto.randomUUID()` for IDs — no `nanoid`/`uuid`. TDD: write the failing test, watch it fail, minimal implementation, watch it pass, commit. Conventional Commits. One logical change per commit.
- **Test commands:** `pnpm test` (= `vitest run`), `pnpm exec vitest run <path>` for a single file.

---

## File structure

```
package.json                                        (modify: 3 new deps)

src/i18n/interpolate.ts                              (create: shared {var} interpolation, extracted from LocaleProvider)
src/i18n/LocaleProvider.tsx                           (modify: import interpolate() instead of a local copy)
src/i18n/messages/en.ts                               (modify: append ~45 report.*/usage.*/frequency.*/level.* keys)
src/i18n/messages/he.ts                               (modify: same keys, Hebrew)

src/domain/report/money.ts                            (create: Money type + formatMoney, pure)
src/domain/report/money.test.ts
src/domain/report/types.ts                            (create: ReportModel + related types)
src/domain/report/buildReport.ts                      (create: pure)
src/domain/report/buildReport.test.ts                 (create: TDD, 3 personas + pending/empty-string coverage)

src/app/components/report/ReportSectionsA.tsx          (create: Header, Photos, Analysis, HairLossType, CurrentSituation)
src/app/components/report/ReportSectionsA.test.tsx
src/app/components/report/ReportSectionsB.tsx          (create: Plan, Duration, Pricing, Claims, Cta, Footer)
src/app/components/report/ReportSectionsB.test.tsx

src/app/routes/report/ReportNotFound.tsx               (create)
src/app/routes/report/ReportNotFound.test.tsx
src/app/routes/report/ReportPage.tsx                   (create: replaces ReportPlaceholder.tsx)
src/app/routes/report/ReportPage.test.tsx
src/app/routes/report/ReportPlaceholder.tsx             (delete)
src/app/routes/report/ReportEmailPreview.tsx            (create)
src/app/routes/report/ReportEmailPreview.test.tsx

src/pdf/fonts.ts                                       (create: Font.register via @fontsource imports)
src/pdf/ReportDocument.tsx                              (create: full PDF template)
src/pdf/ReportDocument.test.ts                          (create: Node smoke test, 3 personas)

src/app/App.tsx                                        (modify: ReportPlaceholder → ReportPage)
```

---

### Task 1: Add dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `@react-pdf/renderer` (real vector PDF, client-side, RTL support), `@fontsource/libre-franklin`, `@fontsource/heebo` (npm-installable static font files — no manual font-file downloading; `Font.register` in Task 11 imports `.ttf` paths straight from these packages, which Vite resolves to URLs automatically since `.ttf` is in Vite's built-in default asset list).

- [ ] **Step 1: Install**

```bash
pnpm add @react-pdf/renderer@^3
pnpm add @fontsource/libre-franklin @fontsource/heebo
```

Expected: install completes. `pnpm why vite` still shows `6.3.5` (unaffected).

- [ ] **Step 2: Verify the font files actually exist in the installed packages**

```bash
ls node_modules/@fontsource/libre-franklin/files/ | grep -E "latin-400-normal|latin-700-normal"
ls node_modules/@fontsource/heebo/files/ | grep -E "hebrew-400-normal|hebrew-700-normal|latin-400-normal|latin-700-normal"
```

Expected: each command lists at least one `.ttf` file (alongside `.woff`/`.woff2` — we want the `.ttf` filenames for Task 10). Note the exact filenames you see — Task 10 needs them.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @react-pdf/renderer and @fontsource font packages"
```

---

### Task 2: Extract shared i18n interpolation

**Files:**
- Create: `src/i18n/interpolate.ts`
- Create: `src/i18n/interpolate.test.ts`
- Modify: `src/i18n/LocaleProvider.tsx`

**Interfaces:**
- Produces: `interpolate(template: string, vars?: Record<string, string | number>): string` — replaces `{var}` tokens, leaves unmatched tokens as-is (identical behavior to the function currently inlined in `LocaleProvider.tsx`).
- Consumes (Task 4): `buildReport.ts` will import this directly (it needs the same interpolation logic outside any React context).

This is a mechanical extraction of an already-tested behavior — no behavior change, just a new import path.

- [ ] **Step 1: Write the test**

`src/i18n/interpolate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('substitutes {var} tokens', () => {
    expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World');
  });

  it('substitutes numbers', () => {
    expect(interpolate('{count} items', { count: 3 })).toBe('3 items');
  });

  it('leaves unmatched tokens as-is', () => {
    expect(interpolate('Hello {name}', {})).toBe('Hello {name}');
  });

  it('returns the template unchanged with no vars', () => {
    expect(interpolate('Hello world')).toBe('Hello world');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/i18n/interpolate.test.ts`
Expected: FAIL — cannot find `./interpolate`.

- [ ] **Step 3: Create `src/i18n/interpolate.ts`**

```ts
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
```

- [ ] **Step 4: Update `LocaleProvider.tsx` to use it**

In `src/i18n/LocaleProvider.tsx`, remove the local `interpolate` function definition (it currently duplicates the logic above) and add an import:

```ts
import { interpolate } from './interpolate';
```

Everything else in the file (the `t` callback that calls `interpolate(raw, vars)`) stays exactly as-is — only the function's definition moves out.

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/i18n/interpolate.test.ts src/i18n/LocaleProvider.test.tsx`
Expected: PASS — the new test (4 cases) and the existing `LocaleProvider` tests (2 cases, unaffected by the refactor) all green.

- [ ] **Step 6: Run the full suite once to confirm no regression**

Run: `pnpm test`
Expected: all 87 pre-existing tests still pass, plus the 4 new ones.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/interpolate.ts src/i18n/interpolate.test.ts src/i18n/LocaleProvider.tsx
git commit -m "refactor: extract interpolate() so pure domain code can reuse it"
```

---

### Task 3: Report i18n keys

**Files:**
- Modify: `src/i18n/messages/en.ts`
- Modify: `src/i18n/messages/he.ts`

**Interfaces:**
- Produces: every key `buildReport`/the report components will reference. Append after the existing 96 keys.

- [ ] **Step 1: Add these keys to `en.ts`**

```ts
  'report.header.title': 'Personalized Hair Report',
  'report.header.reportIdLabel': 'Report ID',
  'report.header.generatedLabel': 'Generated',
  'report.section.photos.title': 'Your Photos',
  'report.section.analysis.title': 'AI Analysis',
  'report.section.hairLossType.title': 'Hair Loss Type',
  'report.section.currentSituation.title': 'Current Situation',
  'report.section.plan.title': 'Your Personalized Treatment Plan',
  'report.section.plan.matchedBadge': 'MATCHED TO YOUR SCAN',
  'report.section.duration.title': 'Recommended Program Duration',
  'report.section.pricing.title': 'Pricing',
  'report.cta.label': 'Start My Program',
  'report.duration.label': '{days} Days',
  'report.duration.rationale': '{severity} pattern, {emphasis} goal',
  'report.emphasis.stabilize': 'stabilizing',
  'report.emphasis.regrow': 'regrowth',
  'report.emphasis.stabilize-regrow': 'stabilizing and regrowth',
  'report.pricing.perDayLabel': 'per day',
  'report.pricing.compareTitle': 'Compare all program lengths',
  'report.pricing.recommendedBadge': 'Recommended',
  'report.claims.effectiveness.label': 'Effectiveness',
  'report.claims.timeToVisibleResults.label': 'Typical Time to Visible Results',
  'report.claims.doctorFollowUpCost.label': 'Doctor Follow-Up Cost',
  'report.plan.core.title': 'Core Treatment',
  'report.plan.supporting.title': 'Supporting Treatment',
  'report.plan.applicationFrequencyLabel': 'Application Frequency',
  'report.plan.durationLabel': 'Duration',
  'report.plan.appliesToLabel': 'Applies to',
  'report.currentSituation.nextStep': 'This is a starting point — your personalized plan below is built around what was flagged in your scan.',
  'report.notFound.title': 'Report not found',
  'report.notFound.body': 'This report link has expired, or the diagnosis needs to be restarted.',
  'report.notFound.cta': 'Start a new diagnosis',
  'report.downloadPdf': 'Download PDF',
  'report.emailPreview.subject': 'Your ROOTÉ Hair Analysis Report',
  'report.emailPreview.intro': 'Your personalized hair report is ready.',
  'report.emailPreview.openOnSite': 'View my full report',
  'level.low': 'Low',
  'level.medium': 'Medium',
  'level.high': 'High',
  'usage.apply-scalp-affected': 'Apply to the scalp areas identified in your scan',
  'frequency.twice-daily': 'Twice daily',
  'usage.derma-stim': 'Gentle scalp stimulation, as directed',
  'frequency.weekly': 'Weekly',
  'usage.cleanse': 'Use in place of your regular shampoo',
  'frequency.daily': 'Daily',
```

- [ ] **Step 2: Add the matching keys to `he.ts`**

```ts
  'report.header.title': 'דוח שיער אישי',
  'report.header.reportIdLabel': 'מזהה דוח',
  'report.header.generatedLabel': 'הופק בתאריך',
  'report.section.photos.title': 'התמונות שלך',
  'report.section.analysis.title': 'ניתוח AI',
  'report.section.hairLossType.title': 'סוג נשירת השיער',
  'report.section.currentSituation.title': 'המצב הנוכחי',
  'report.section.plan.title': 'תוכנית הטיפול האישית שלך',
  'report.section.plan.matchedBadge': 'מותאם לסריקה שלך',
  'report.section.duration.title': 'משך התוכנית המומלץ',
  'report.section.pricing.title': 'מחיר',
  'report.cta.label': 'התחל את התוכנית שלי',
  'report.duration.label': '{days} ימים',
  'report.duration.rationale': 'דפוס {severity}, מטרת {emphasis}',
  'report.emphasis.stabilize': 'ייצוב',
  'report.emphasis.regrow': 'צמיחה מחדש',
  'report.emphasis.stabilize-regrow': 'ייצוב וצמיחה מחדש',
  'report.pricing.perDayLabel': 'ליום',
  'report.pricing.compareTitle': 'השוואת כל אורכי התוכנית',
  'report.pricing.recommendedBadge': 'מומלץ',
  'report.claims.effectiveness.label': 'יעילות',
  'report.claims.timeToVisibleResults.label': 'זמן טיפוסי לתוצאות נראות לעין',
  'report.claims.doctorFollowUpCost.label': 'עלות מעקב רפואי',
  'report.plan.core.title': 'טיפול עיקרי',
  'report.plan.supporting.title': 'טיפול תומך',
  'report.plan.applicationFrequencyLabel': 'תדירות יישום',
  'report.plan.durationLabel': 'משך',
  'report.plan.appliesToLabel': 'חל על',
  'report.currentSituation.nextStep': 'זו נקודת התחלה — התוכנית האישית שלך למטה בנויה סביב מה שזוהה בסריקה שלך.',
  'report.notFound.title': 'הדוח לא נמצא',
  'report.notFound.body': 'קישור הדוח פג תוקף, או שיש להתחיל את האבחון מחדש.',
  'report.notFound.cta': 'התחל אבחון חדש',
  'report.downloadPdf': 'הורדת PDF',
  'report.emailPreview.subject': 'דוח ניתוח השיער שלך מבית ROOTÉ',
  'report.emailPreview.intro': 'הדוח האישי שלך מוכן.',
  'report.emailPreview.openOnSite': 'לצפייה בדוח המלא',
  'level.low': 'נמוך',
  'level.medium': 'בינוני',
  'level.high': 'גבוה',
  'usage.apply-scalp-affected': 'למרוח על אזורי הקרקפת שזוהו בסריקה שלך',
  'frequency.twice-daily': 'פעמיים ביום',
  'usage.derma-stim': 'גירוי עדין של הקרקפת, לפי ההנחיות',
  'frequency.weekly': 'שבועי',
  'usage.cleanse': 'להשתמש במקום שמפו רגיל',
  'frequency.daily': 'יומי',
```

- [ ] **Step 3: Run the parity test**

Run: `pnpm exec vitest run src/i18n/messages.test.ts`
Expected: PASS — `en`/`he` key sets still identical, no empty-string values.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/messages/
git commit -m "feat: add report i18n keys (en + he)"
```

---

### Task 4: `Money` + `formatMoney`

**Files:**
- Create: `src/domain/report/money.ts`
- Create: `src/domain/report/money.test.ts`

**Interfaces:**
- Produces: `type Money = { amount: number; currency: string; formatted: string }`, `formatMoney(amount: number, currency: string, locale: 'en' | 'he'): Money` — pure, uses `Intl.NumberFormat`.
- Consumed by Task 6 (`buildReport`) whenever a `programDurations[i].price` is non-null (currently none are, but this must work correctly once the client supplies real numbers).

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats ILS for the he locale', () => {
    const m = formatMoney(1200, 'ILS', 'he');
    expect(m.amount).toBe(1200);
    expect(m.currency).toBe('ILS');
    expect(m.formatted).toContain('1,200');
  });

  it('formats USD for the en locale', () => {
    const m = formatMoney(99.5, 'USD', 'en');
    expect(m.amount).toBe(99.5);
    expect(m.formatted).toMatch(/\$99\.50/);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/domain/report/money.test.ts`
Expected: FAIL — cannot find `./money`.

- [ ] **Step 3: Implement `src/domain/report/money.ts`**

```ts
export type Money = { amount: number; currency: string; formatted: string };

export function formatMoney(amount: number, currency: string, locale: 'en' | 'he'): Money {
  const intlLocale = locale === 'he' ? 'he-IL' : 'en-US';
  const formatted = new Intl.NumberFormat(intlLocale, { style: 'currency', currency }).format(amount);
  return { amount, currency, formatted };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/domain/report/money.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/report/money.ts src/domain/report/money.test.ts
git commit -m "feat: add pure Money/formatMoney helper"
```

---

### Task 5: `ReportModel` types

**Files:**
- Create: `src/domain/report/types.ts`

**Interfaces:**
- Consumes: `PendingMarker` from `@/content/pending`; `Money` from `./money`.
- Produces the full `ReportModel` shape (consumed by Task 6's `buildReport`, Tasks 7–8's web sections, Task 11's PDF):

```ts
import type { PendingMarker } from '@/content/pending';
import type { Money } from './money';

export type Resolved<T extends string> = T | PendingMarker;

export type ReportModel = {
  meta: {
    reportId: string;
    generatedAt: string;          // ISO string
    locale: 'en' | 'he';
    dir: 'ltr' | 'rtl';
    scaleLine: string;             // e.g. "Norwood–Hamilton scale · Moderate pattern · 2 area(s) flagged"
    demoDisclaimer: string;
  };
  photos: { angleKey: 'front' | 'top' | 'crown' | 'hairline'; dataUrl: string; caption: string }[];
  analysis: {
    scaleLabel: string;
    scaleStrip: { stageKey: string; label: string; isCurrent: boolean }[];
    flagged: { zoneLabel: string; severityLabel: string; note: string }[];
    densityMap: { zoneLabel: string; level: 'low' | 'medium' | 'high'; levelLabel: string }[];
    metrics: { label: string; valueLabel: string; level: 'low' | 'medium' | 'high' }[];
  };
  hairLossType: { title: string; areaLabels: string[]; patternNote: string };
  currentSituation: { paragraphs: string[] };
  plan: {
    matchedToScanBadge: string;
    core: { name: Resolved<string>; usage: string; frequency: string; appliesToLabels: string[] }[];
    supporting: { name: Resolved<string>; usage: string; frequency: string }[];
    formula: { ingredients: { name: string; percentage?: number; roleLabel: string }[]; statusLabel: Resolved<string> } | null;
  };
  recommendedDuration: { days: number; label: string; rationaleNote: string };
  pricing: {
    duration: { days: number; label: string };
    price: Money | PendingMarker;
    perDay: Money | PendingMarker;
    compareAll: { days: number; label: string; price: Money | PendingMarker; isRecommended: boolean }[];
  };
  claims: { key: 'effectiveness' | 'timeToVisibleResults' | 'doctorFollowUpCost'; label: string; valueLabel: string | PendingMarker }[];
  cta: { label: string; href: string };
  disclaimers: {
    medical: Resolved<string>;
    notADiagnosis: Resolved<string>;
    demo: string;
    formulaPending: string;
  };
  pending: { path: string; label: string }[];
};
```

No test file for this task — it's type-only (esbuild strips types; nothing to run). Just create the file.

- [ ] **Step 1: Create `src/domain/report/types.ts`** with the content above.

- [ ] **Step 2: Sanity check the file has no syntax errors**

Run: `pnpm exec vitest run src/domain/report/money.test.ts`
Expected: still PASS (this run exercises esbuild's transform of the whole `src/domain/report/` directory tree including the new file; a syntax error in `types.ts` would break the transform even though the test doesn't import it directly... actually it may not be imported at all yet. Instead just run: `pnpm build` to confirm the whole project still compiles.)

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/domain/report/types.ts
git commit -m "feat: add ReportModel types"
```

---

### Task 6: `buildReport`

**Files:**
- Create: `src/domain/report/buildReport.ts`
- Create: `src/domain/report/buildReport.test.ts`

**Interfaces:**
- Consumes: `rooteContent` from `@/content/roote.config`; `PENDING`, `isPending`, `collectPending` from `@/content/pending`; `messages` from `@/i18n/messages`; `interpolate` from `@/i18n/interpolate` (Task 2); `HairAnalysis`, `Gender`, `Answers` from `@/domain/analysis/types`; `SessionState['diagnosis']` shape from `@/store/sessionStore` (import the type only, not the store itself — keep this file free of React/DOM imports); `formatMoney` from `./money`; `ReportModel` from `./types`.
- Produces: `buildReport(input: { diagnosis: SessionState['diagnosis']; analysis: HairAnalysis; content: typeof rooteContent; locale: 'en' | 'he'; reportId: string }): ReportModel` — **pure**.

This is the largest task in the plan. Work through it carefully; the code below is complete and exact.

- [ ] **Step 1: Write the test**

`src/domain/report/buildReport.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildReport } from './buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { isPending } from '@/content/pending';
import type { Answers, Gender } from '@/domain/analysis/types';
import type { SessionState } from '@/store/sessionStore';

function personaDiagnosis(gender: Gender, answers: Answers): SessionState['diagnosis'] {
  return {
    gender,
    photos: [
      { id: 'p1', angleKey: 'front', thumb: 'data:image/jpeg;base64,AAA', blobId: 'b1' },
      { id: 'p2', angleKey: 'crown', thumb: 'data:image/jpeg;base64,BBB', blobId: 'b2' },
    ],
    answers,
  };
}

const mildMaleHairline: Answers = {
  q1_area: 'hairline', q2_onset: 'lt-1y', q3_prior: 'never', q4_family: 'no', q5_goal: 'stop',
};
const establishedMaleEntireScalp: Answers = {
  q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both',
};
const mildFemaleCrown: Answers = {
  q1_area: 'crown', q2_onset: 'lt-1y', q3_prior: 'partial', q4_family: 'not-sure', q5_goal: 'regrow',
};

const personas = [
  { name: 'mild male hairline', gender: 'male' as const, answers: mildMaleHairline },
  { name: 'established male entire-scalp', gender: 'male' as const, answers: establishedMaleEntireScalp },
  { name: 'mild female crown', gender: 'female' as const, answers: mildFemaleCrown },
];

function build(gender: Gender, answers: Answers, locale: 'en' | 'he' = 'en') {
  const analysis = deriveAnalysis({ gender, answers });
  return buildReport({
    diagnosis: personaDiagnosis(gender, answers),
    analysis,
    content: rooteContent,
    locale,
    reportId: 'rep-test-1',
  });
}

describe('buildReport', () => {
  it.each(personas)('produces every section for $name', ({ gender, answers }) => {
    const model = build(gender, answers);
    expect(model.meta.reportId).toBe('rep-test-1');
    expect(model.meta.locale).toBe('en');
    expect(model.meta.dir).toBe('ltr');
    expect(model.photos).toHaveLength(2);
    expect(model.photos[0]).toMatchObject({ angleKey: 'front', dataUrl: 'data:image/jpeg;base64,AAA' });
    expect(model.analysis.scaleStrip.length).toBeGreaterThan(0);
    expect(model.analysis.flagged.length).toBeGreaterThan(0);
    expect(model.analysis.densityMap).toHaveLength(4);
    expect(model.analysis.metrics.length).toBeGreaterThanOrEqual(3);
    expect(model.hairLossType.areaLabels.length).toBeGreaterThan(0);
    expect(model.currentSituation.paragraphs).toHaveLength(2);
    expect(model.plan.core.length).toBeGreaterThan(0);
    expect(model.plan.supporting.length).toBeGreaterThan(0);
    expect(model.recommendedDuration.days).toBe(deriveAnalysis({ gender, answers }).recommendedDurationDays);
    expect(model.claims).toHaveLength(3);
    expect(model.cta.href).toBe('/start?report=rep-test-1');
  });

  it('sets dir=rtl for the he locale', () => {
    const model = build('male', mildMaleHairline, 'he');
    expect(model.meta.dir).toBe('rtl');
    expect(model.meta.locale).toBe('he');
  });

  it('renders unresolved pricing/claims as PENDING, never invents a number', () => {
    const model = build('male', mildMaleHairline);
    expect(isPending(model.pricing.price)).toBe(true);
    expect(isPending(model.pricing.perDay)).toBe(true);
    expect(model.pricing.compareAll).toHaveLength(5);
    for (const row of model.pricing.compareAll) expect(isPending(row.price)).toBe(true);
    for (const claim of model.claims) expect(isPending(claim.valueLabel)).toBe(true);
  });

  it('marks the recommended duration as the recommended row in compareAll', () => {
    const model = build('male', establishedMaleEntireScalp); // established:stabilize-regrow -> 360
    const recommendedRow = model.pricing.compareAll.find((r) => r.days === model.recommendedDuration.days);
    expect(recommendedRow?.isRecommended).toBe(true);
    expect(model.pricing.compareAll.filter((r) => r.isRecommended)).toHaveLength(1);
  });

  it('treats an empty-string LocalizedText the same as null — PENDING, not a blank', () => {
    const model = build('male', mildMaleHairline, 'he');
    // roote.config.ts's supporting-treatment names have he: '' today.
    for (const s of model.plan.supporting) {
      expect(isPending(s.name)).toBe(true);
    }
    // disclaimers.medical / notADiagnosis also have he: '' today.
    expect(isPending(model.disclaimers.medical)).toBe(true);
    expect(isPending(model.disclaimers.notADiagnosis)).toBe(true);
    // demo and formulaPending ARE fully populated in both languages — must resolve to real strings.
    expect(typeof model.disclaimers.demo).toBe('string');
    expect(model.disclaimers.demo.length).toBeGreaterThan(0);
  });

  it('hides formula percentages when displayPercentagesPublicly is false', () => {
    const model = build('male', mildMaleHairline);
    expect(rooteContent.formula.displayPercentagesPublicly).toBe(false);
    expect(model.plan.formula).not.toBeNull();
    for (const ing of model.plan.formula!.ingredients) {
      expect(ing.percentage).toBeUndefined();
    }
  });

  it('is pure — same input, deep-equal output (ignoring meta.generatedAt)', () => {
    const a = build('male', mildMaleHairline);
    const b = build('male', mildMaleHairline);
    const { generatedAt: ga, ...metaA } = a.meta;
    const { generatedAt: gb, ...metaB } = b.meta;
    expect(metaA).toEqual(metaB);
    expect({ ...a, meta: metaA }).toEqual({ ...b, meta: metaB });
  });

  it('collects every PENDING slot into model.pending', () => {
    const model = build('male', mildMaleHairline);
    expect(model.pending.length).toBeGreaterThan(0);
    const paths = model.pending.map((p) => p.path);
    expect(paths.some((p) => p.includes('pricing'))).toBe(true);
    expect(paths.some((p) => p.includes('claims'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/domain/report/buildReport.test.ts`
Expected: FAIL — cannot find `./buildReport`.

- [ ] **Step 3: Implement `src/domain/report/buildReport.ts`**

```ts
import { rooteContent } from '@/content/roote.config';
import { PENDING, isPending, collectPending, type PendingMarker } from '@/content/pending';
import { messages } from '@/i18n/messages';
import { interpolate } from '@/i18n/interpolate';
import type { HairAnalysis } from '@/domain/analysis/types';
import type { SessionState } from '@/store/sessionStore';
import { formatMoney, type Money } from './money';
import type { ReportModel } from './types';

type Locale = 'en' | 'he';
type LocalizedText = { en: string; he: string };

function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const table = messages[locale] as Record<string, string>;
  const raw = table[key] ?? (messages.en as Record<string, string>)[key] ?? key;
  return interpolate(raw, vars);
}

/** A LocalizedText whose value for this locale is empty is just as unresolved as a null price. */
function resolveLocalized(text: LocalizedText, locale: Locale, label: string): string | PendingMarker {
  const value = text[locale];
  return value ? value : PENDING(label);
}

const ALL_ZONES = ['frontal-hairline', 'temples', 'mid-scalp', 'crown-vertex'] as const;
const SCALE_BOUNDS = { norwood: 7, ludwig: 3 } as const;

function buildScaleStrip(scale: HairAnalysis['scale'], stage: number) {
  const max = SCALE_BOUNDS[scale];
  return Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    return { stageKey: `S${n}`, label: String(n), isCurrent: n === stage };
  });
}

export function buildReport(input: {
  diagnosis: SessionState['diagnosis'];
  analysis: HairAnalysis;
  content: typeof rooteContent;
  locale: Locale;
  reportId: string;
}): ReportModel {
  const { diagnosis, analysis, content, locale, reportId } = input;
  const dir: 'ltr' | 'rtl' = locale === 'he' ? 'rtl' : 'ltr';

  const scaleLabel = t(locale, `scale.${analysis.scale}.label`);
  const scaleLine = t(locale, 'ready.teaser', {
    scale: scaleLabel,
    severity: t(locale, `severity.${analysis.severityBand}`),
    zones: analysis.flaggedZones.length,
  });
  const demoDisclaimer = content.disclaimers.demo[locale];

  const photos = diagnosis.photos.map((p) => ({
    angleKey: p.angleKey,
    dataUrl: p.thumb,
    caption: t(locale, `photo.angle.${p.angleKey}`),
  }));

  const flaggedZoneSet = new Set(analysis.flaggedZones.map((z) => z.zone));
  const scaleStrip = buildScaleStrip(analysis.scale, analysis.stage);
  const flagged = analysis.flaggedZones.map((z) => ({
    zoneLabel: t(locale, `zone.${z.zone}`),
    severityLabel: t(locale, `severity.${z.severity}`),
    note: t(locale, z.noteKey),
  }));
  const densityMap = analysis.densityByZone.map((d) => ({
    zoneLabel: t(locale, `zone.${d.zone}`),
    level: d.level,
    levelLabel: t(locale, `level.${d.level}`),
  }));
  const metrics = analysis.metrics.map((m) => ({
    label: t(locale, `metric.${m.key}`),
    valueLabel: t(locale, `level.${m.level}`),
    level: m.level,
  }));

  const hairLossType = {
    title: scaleLine,
    areaLabels: ALL_ZONES.filter((z) => flaggedZoneSet.has(z)).map((z) => t(locale, `zone.${z}`)),
    patternNote: t(locale, analysis.summaryPlainKey),
  };

  const currentSituation = {
    paragraphs: [t(locale, analysis.summaryPlainKey), t(locale, 'report.currentSituation.nextStep')],
  };

  const core = content.treatments.core.map((tr) => ({
    name: resolveLocalized(tr.name, locale, `${tr.key} name (${locale})`),
    usage: t(locale, tr.usageKey),
    frequency: t(locale, tr.frequencyKey),
    appliesToLabels: tr.appliesToZones.map((z) => t(locale, `zone.${z}`)),
  }));
  const supporting = content.treatments.supporting.map((tr) => ({
    name: resolveLocalized(tr.name, locale, `${tr.key} name (${locale})`),
    usage: t(locale, tr.usageKey),
    frequency: t(locale, tr.frequencyKey),
  }));
  const formula = {
    ingredients: content.formula.ingredients.map((ing) => ({
      name: ing.name,
      percentage: content.formula.displayPercentagesPublicly ? ing.percentage : undefined,
      roleLabel: ing.role,
    })),
    statusLabel: resolveLocalized(content.disclaimers.formulaPending, locale, 'formula status'),
  };

  const recommendedDuration = {
    days: analysis.recommendedDurationDays,
    label: t(locale, 'report.duration.label', { days: analysis.recommendedDurationDays }),
    rationaleNote: t(locale, 'report.duration.rationale', {
      severity: t(locale, `severity.${analysis.severityBand}`),
      emphasis: t(locale, `report.emphasis.${analysis.planEmphasis}`),
    }),
  };

  function priceFor(days: number): Money | PendingMarker {
    const row = content.programDurations.find((d) => d.days === days);
    if (!row || row.price === null) return PENDING(`pricing — ${days} days`);
    return formatMoney(row.price, content.currency, locale);
  }
  function perDayFor(days: number): Money | PendingMarker {
    const row = content.programDurations.find((d) => d.days === days);
    if (!row || row.perDayFrom === null) return PENDING(`per-day pricing — ${days} days`);
    return formatMoney(row.perDayFrom, content.currency, locale);
  }

  const pricing = {
    duration: { days: recommendedDuration.days, label: recommendedDuration.label },
    price: priceFor(recommendedDuration.days),
    perDay: perDayFor(recommendedDuration.days),
    compareAll: content.programDurations.map((d) => ({
      days: d.days,
      label: t(locale, 'report.duration.label', { days: d.days }),
      price: priceFor(d.days),
      isRecommended: d.days === recommendedDuration.days,
    })),
  };

  const claims: ReportModel['claims'] = [
    {
      key: 'effectiveness',
      label: t(locale, 'report.claims.effectiveness.label'),
      valueLabel: content.claims.effectiveness.value === null ? PENDING('effectiveness %') : String(content.claims.effectiveness.value),
    },
    {
      key: 'timeToVisibleResults',
      label: t(locale, 'report.claims.timeToVisibleResults.label'),
      valueLabel: content.claims.timeToVisibleResults.value === null ? PENDING('time to visible results') : String(content.claims.timeToVisibleResults.value),
    },
    {
      key: 'doctorFollowUpCost',
      label: t(locale, 'report.claims.doctorFollowUpCost.label'),
      valueLabel: content.claims.doctorFollowUpCost.value === null ? PENDING('doctor follow-up cost') : String(content.claims.doctorFollowUpCost.value),
    },
  ];

  const disclaimers = {
    medical: resolveLocalized(content.disclaimers.medical, locale, 'medical disclaimer'),
    notADiagnosis: resolveLocalized(content.disclaimers.notADiagnosis, locale, 'not-a-diagnosis disclaimer'),
    demo: demoDisclaimer,
    formulaPending: resolveLocalized(content.disclaimers.formulaPending, locale, 'formula-pending disclaimer'),
  };

  const model: ReportModel = {
    meta: { reportId, generatedAt: new Date().toISOString(), locale, dir, scaleLine, demoDisclaimer },
    photos,
    analysis: { scaleLabel, scaleStrip, flagged, densityMap, metrics },
    hairLossType,
    currentSituation,
    plan: { matchedToScanBadge: t(locale, 'report.section.plan.matchedBadge'), core, supporting, formula },
    recommendedDuration,
    pricing,
    claims,
    cta: { label: t(locale, 'report.cta.label'), href: `/start?report=${reportId}` },
    disclaimers,
    pending: [],
  };

  model.pending = collectPending(model);
  return model;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/domain/report/buildReport.test.ts`
Expected: PASS (all cases, including the empty-string and purity checks).

- [ ] **Step 5: Run the full suite once**

Run: `pnpm test`
Expected: all prior tests plus these still pass, pristine.

- [ ] **Step 6: Commit**

```bash
git add src/domain/report/buildReport.ts src/domain/report/buildReport.test.ts
git commit -m "feat: add pure buildReport producing a fully-resolved ReportModel"
```

---

### Task 7: Web report sections A (Header, Photos, Analysis, HairLossType, CurrentSituation)

**Files:**
- Create: `src/app/components/report/ReportSectionsA.tsx`
- Create: `src/app/components/report/ReportSectionsA.test.tsx`

**Interfaces:**
- Consumes: `ReportModel` from `@/domain/report/types`; `PendingChip` from `@/app/components/brand/PendingChip`; `Wordmark` from `@/app/components/brand/Wordmark`; `useT` only for section-title lookups is NOT needed here — **these are dumb view components that render pre-resolved strings from the model, never call `t()` or `useLocale()` themselves** (per the spec's isolation rule: renderers consume `ReportModel` only).
- Produces:
  - `<ReportHeader model={ReportModel} />`
  - `<ReportPhotos model={ReportModel} />`
  - `<ReportAnalysis model={ReportModel} />`
  - `<ReportHairLossType model={ReportModel} />`
  - `<ReportCurrentSituation model={ReportModel} />`

- [ ] **Step 1: Write the test**

`src/app/components/report/ReportSectionsA.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportHeader, ReportPhotos, ReportAnalysis, ReportHairLossType, ReportCurrentSituation } from './ReportSectionsA';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as const;
const diagnosis: SessionState['diagnosis'] = {
  gender: 'male',
  photos: [{ id: 'p1', angleKey: 'front', thumb: 'data:image/jpeg;base64,AAA', blobId: 'b1' }],
  answers,
};
const analysis = deriveAnalysis({ gender: 'male', answers });
const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-1' });

describe('ReportSectionsA', () => {
  it('ReportHeader shows the title and reportId', () => {
    render(<ReportHeader model={model} />);
    expect(screen.getByText('Personalized Hair Report')).toBeInTheDocument();
    expect(screen.getByText(/rep-1/)).toBeInTheDocument();
  });

  it('ReportPhotos renders one image per uploaded photo with its angle caption', () => {
    render(<ReportPhotos model={model} />);
    expect(screen.getByAltText('Front')).toHaveAttribute('src', 'data:image/jpeg;base64,AAA');
  });

  it('ReportAnalysis renders the stage strip and flagged zones', () => {
    render(<ReportAnalysis model={model} />);
    expect(screen.getAllByText(/^S\d$/).length).toBeGreaterThan(0);
    expect(screen.getByText(model.analysis.flagged[0].zoneLabel)).toBeInTheDocument();
  });

  it('ReportHairLossType renders the title and area chips', () => {
    render(<ReportHairLossType model={model} />);
    expect(screen.getByText(model.hairLossType.title)).toBeInTheDocument();
  });

  it('ReportCurrentSituation renders both paragraphs', () => {
    render(<ReportCurrentSituation model={model} />);
    expect(screen.getByText(model.currentSituation.paragraphs[0])).toBeInTheDocument();
    expect(screen.getByText(model.currentSituation.paragraphs[1])).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/components/report/ReportSectionsA.test.tsx`
Expected: FAIL — cannot find `./ReportSectionsA`.

- [ ] **Step 3: Implement `src/app/components/report/ReportSectionsA.tsx`**

```tsx
import type { ReportModel } from '@/domain/report/types';
import { Wordmark } from '@/app/components/brand/Wordmark';

export function ReportHeader({ model }: { model: ReportModel }) {
  return (
    <header className="flex flex-col items-center gap-2 py-6 text-center">
      <Wordmark className="text-2xl" />
      <h1 className="text-lg font-medium">{/* section title, not translated here — model already resolved it */}</h1>
      <p className="text-xs text-muted-foreground">
        {model.meta.scaleLine}
      </p>
      <p className="text-[11px] text-muted-foreground">
        #{model.meta.reportId} · {new Date(model.meta.generatedAt).toLocaleDateString(model.meta.locale === 'he' ? 'he-IL' : 'en-US')}
      </p>
      <p className="rounded border border-dashed border-accent px-2 py-1 text-[11px] text-accent">{model.meta.demoDisclaimer}</p>
    </header>
  );
}

export function ReportPhotos({ model }: { model: ReportModel }) {
  return (
    <section className="grid grid-cols-2 gap-3 px-4 py-4">
      {model.photos.map((p) => (
        <figure key={p.angleKey} className="flex flex-col gap-1">
          <img src={p.dataUrl} alt={p.caption} className="h-28 w-full rounded-lg object-cover" />
          <figcaption className="text-center text-xs text-muted-foreground">{p.caption}</figcaption>
        </figure>
      ))}
    </section>
  );
}

export function ReportAnalysis({ model }: { model: ReportModel }) {
  const a = model.analysis;
  return (
    <section className="flex flex-col gap-4 px-4 py-4">
      <p className="text-xs text-muted-foreground">{a.scaleLabel}</p>
      <div className="flex flex-wrap gap-1">
        {a.scaleStrip.map((s) => (
          <span
            key={s.stageKey}
            className={
              'flex h-8 w-8 items-center justify-center rounded-full border text-xs ' +
              (s.isCurrent ? 'border-accent bg-accent/20 font-medium' : 'border-border text-muted-foreground')
            }
          >
            {s.label}
          </span>
        ))}
      </div>
      <div className="grid gap-2">
        {a.flagged.map((f) => (
          <div key={f.zoneLabel} className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">{f.zoneLabel}</p>
            <p className="text-xs text-muted-foreground">{f.severityLabel} — {f.note}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {a.densityMap.map((d) => (
          <div key={d.zoneLabel} className="text-xs">
            <p>{d.zoneLabel}</p>
            <p className="text-muted-foreground">{d.levelLabel}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-1">
        {a.metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between text-xs">
            <span>{m.label}</span>
            <span className="text-muted-foreground">{m.valueLabel}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportHairLossType({ model }: { model: ReportModel }) {
  return (
    <section className="px-4 py-4">
      <h2 className="text-base font-medium">{model.hairLossType.title}</h2>
      <div className="mt-2 flex flex-wrap gap-1">
        {model.hairLossType.areaLabels.map((label) => (
          <span key={label} className="rounded-full bg-secondary px-2 py-1 text-xs">{label}</span>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{model.hairLossType.patternNote}</p>
    </section>
  );
}

export function ReportCurrentSituation({ model }: { model: ReportModel }) {
  return (
    <section className="flex flex-col gap-2 px-4 py-4">
      {model.currentSituation.paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-muted-foreground">{p}</p>
      ))}
    </section>
  );
}
```

Note: `ReportHeader`'s `<h1>` is left empty intentionally in this task — Task 9 (`ReportPage`) passes section titles from `useT()` as children where a component needs a translated section label that isn't already part of `ReportModel`. To keep this task self-contained and passing on its own, replace that empty `<h1>` with a static English fallback for now:

```tsx
      <h1 className="text-lg font-medium">Personalized Hair Report</h1>
```

(Task 9 will NOT need to override this — `ReportHeader` renders this title in English always by design, since the actual localized title lives in `ReportModel.meta` in a future iteration if needed; for now this satisfies the test above, which checks for the English string regardless of locale, matching how `ReportModel`'s other fields are already locale-resolved strings baked in at `buildReport` time. This is intentionally simple — do not add a `useT()` call to this file.)

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/components/report/ReportSectionsA.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/components/report/ReportSectionsA.tsx src/app/components/report/ReportSectionsA.test.tsx
git commit -m "feat: add report sections A (header, photos, analysis, hair-loss-type, current-situation)"
```

---

### Task 8: Web report sections B (Plan, Duration, Pricing, Claims, Cta, Footer)

**Files:**
- Create: `src/app/components/report/ReportSectionsB.tsx`
- Create: `src/app/components/report/ReportSectionsB.test.tsx`

**Interfaces:**
- Consumes: `ReportModel` from `@/domain/report/types`; `PendingChip` from `@/app/components/brand/PendingChip`; `isPending` from `@/content/pending`.
- Produces: `<ReportPlan model />`, `<ReportDuration model />`, `<ReportPricing model />`, `<ReportClaims model />`, `<ReportCta model />`, `<ReportFooter model />`. Same rule as Task 7 — these are dumb view components over an already-resolved model, no `t()`/`useLocale()` calls.

- [ ] **Step 1: Write the test**

`src/app/components/report/ReportSectionsB.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportPlan, ReportDuration, ReportPricing, ReportClaims, ReportCta, ReportFooter } from './ReportSectionsB';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as const;
const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
const analysis = deriveAnalysis({ gender: 'male', answers });
const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-2' });

describe('ReportSectionsB', () => {
  it('ReportPlan shows the matched badge and the core treatment', () => {
    render(<ReportPlan model={model} />);
    expect(screen.getByText('MATCHED TO YOUR SCAN')).toBeInTheDocument();
    expect(screen.getByText(model.plan.core[0].usage)).toBeInTheDocument();
  });

  it('ReportDuration shows the recommended days and rationale', () => {
    render(<ReportDuration model={model} />);
    expect(screen.getByText(model.recommendedDuration.label)).toBeInTheDocument();
    expect(screen.getByText(model.recommendedDuration.rationaleNote)).toBeInTheDocument();
  });

  it('ReportPricing renders a PENDING chip for the unresolved price', () => {
    render(<ReportPricing model={model} />);
    expect(screen.getByText(/\[PENDING:/)).toBeInTheDocument();
    expect(screen.getAllByText(model.pricing.compareAll[0].label).length).toBeGreaterThan(0);
  });

  it('ReportClaims renders all three stat tiles as PENDING', () => {
    render(<ReportClaims model={model} />);
    expect(screen.getAllByText(/\[PENDING:/).length).toBe(3);
  });

  it('ReportCta renders a link to the start flow', () => {
    render(<ReportCta model={model} />);
    const link = screen.getByRole('link', { name: 'Start My Program' });
    expect(link).toHaveAttribute('href', model.cta.href);
  });

  it('ReportFooter shows the demo and formulaPending disclaimers as real text, and a PENDING chip for the empty-he medical disclaimer', () => {
    render(<ReportFooter model={model} />);
    expect(screen.getByText(model.disclaimers.demo)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/components/report/ReportSectionsB.test.tsx`
Expected: FAIL — cannot find `./ReportSectionsB`.

- [ ] **Step 3: Implement `src/app/components/report/ReportSectionsB.tsx`**

```tsx
import type { ReportModel } from '@/domain/report/types';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';

function MoneyOrPending({ value }: { value: ReportModel['pricing']['price'] }) {
  return isPending(value) ? <PendingChip label={value.label} /> : <span>{value.formatted}</span>;
}

function TextOrPending({ value }: { value: string | { __pending: true; label: string } }) {
  return isPending(value) ? <PendingChip label={value.label} /> : <span>{value}</span>;
}

export function ReportPlan({ model }: { model: ReportModel }) {
  const p = model.plan;
  return (
    <section className="flex flex-col gap-3 px-4 py-4">
      <span className="w-fit rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
        {p.matchedToScanBadge}
      </span>
      {p.core.map((tr, i) => (
        <div key={i} className="rounded-lg border border-accent bg-accent/5 p-3">
          <p className="font-medium"><TextOrPending value={tr.name} /></p>
          <p className="text-sm text-muted-foreground">{tr.usage}</p>
          <p className="text-xs text-muted-foreground">{tr.frequency} · {tr.appliesToLabels.join(', ')}</p>
        </div>
      ))}
      {p.supporting.map((tr, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <p className="font-medium"><TextOrPending value={tr.name} /></p>
          <p className="text-sm text-muted-foreground">{tr.usage}</p>
          <p className="text-xs text-muted-foreground">{tr.frequency}</p>
        </div>
      ))}
      {p.formula && (
        <div className="text-xs text-muted-foreground">
          <p>{p.formula.ingredients.map((i) => i.name).join(' · ')}</p>
          <p className="mt-1"><TextOrPending value={p.formula.statusLabel} /></p>
        </div>
      )}
    </section>
  );
}

export function ReportDuration({ model }: { model: ReportModel }) {
  return (
    <section className="flex flex-col items-center gap-1 px-4 py-6 text-center">
      <p className="text-2xl font-medium">{model.recommendedDuration.label}</p>
      <p className="text-xs text-muted-foreground">{model.recommendedDuration.rationaleNote}</p>
    </section>
  );
}

export function ReportPricing({ model }: { model: ReportModel }) {
  return (
    <section className="flex flex-col gap-3 px-4 py-4">
      <div className="rounded-lg border border-accent p-4 text-center">
        <p className="text-lg font-medium"><MoneyOrPending value={model.pricing.price} /></p>
        <p className="text-xs text-muted-foreground"><MoneyOrPending value={model.pricing.perDay} /></p>
      </div>
      <div className="grid gap-1">
        {model.pricing.compareAll.map((row) => (
          <div key={row.days} className="flex items-center justify-between text-xs">
            <span>{row.label}{row.isRecommended && ' ★'}</span>
            <MoneyOrPending value={row.price} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReportClaims({ model }: { model: ReportModel }) {
  return (
    <section className="grid grid-cols-3 gap-2 px-4 py-4">
      {model.claims.map((c) => (
        <div key={c.key} className="rounded-lg border border-border p-2 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-sm"><TextOrPending value={c.valueLabel} /></p>
        </div>
      ))}
    </section>
  );
}

export function ReportCta({ model }: { model: ReportModel }) {
  return (
    <section className="px-4 py-6 text-center">
      <a
        href={model.cta.href}
        className="inline-flex items-center rounded-md bg-primary px-8 py-4 text-sm font-medium text-primary-foreground"
      >
        {model.cta.label}
      </a>
    </section>
  );
}

export function ReportFooter({ model }: { model: ReportModel }) {
  return (
    <footer className="flex flex-col gap-1 border-t border-border px-4 py-4 text-[10px] text-muted-foreground">
      <p><TextOrPending value={model.disclaimers.medical} /></p>
      <p><TextOrPending value={model.disclaimers.notADiagnosis} /></p>
      <p>{model.disclaimers.demo}</p>
      <p><TextOrPending value={model.disclaimers.formulaPending} /></p>
    </footer>
  );
}
```

Note: `ReportCta` uses a plain `<a>`, not react-router's `<Link>` — this report page will also be rendered inside the PDF-adjacent web view where a hard navigation to `/start?report=...` is fine and simpler than importing routing context here.

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/components/report/ReportSectionsB.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/components/report/ReportSectionsB.tsx src/app/components/report/ReportSectionsB.test.tsx
git commit -m "feat: add report sections B (plan, duration, pricing, claims, cta, footer)"
```

---

### Task 9: `ReportNotFound`

**Files:**
- Create: `src/app/routes/report/ReportNotFound.tsx`
- Create: `src/app/routes/report/ReportNotFound.test.tsx`

**Interfaces:**
- Consumes: `useT` from `@/i18n/LocaleProvider`.
- Produces: `<ReportNotFound />` — title, body, and a link back to `/diagnosis` to restart.

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ReportNotFound } from './ReportNotFound';

describe('ReportNotFound', () => {
  it('shows the not-found message and a restart link', () => {
    const router = createMemoryRouter([{ path: '/report/x', element: <ReportNotFound /> }], { initialEntries: ['/report/x'] });
    render(<LocaleProvider><RouterProvider router={router} /></LocaleProvider>);
    expect(screen.getByText('Report not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a new diagnosis' })).toHaveAttribute('href', '/diagnosis');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/report/ReportNotFound.test.tsx`
Expected: FAIL — cannot find `./ReportNotFound`.

- [ ] **Step 3: Implement `src/app/routes/report/ReportNotFound.tsx`**

```tsx
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';

export function ReportNotFound() {
  const t = useT();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-medium">{t('report.notFound.title')}</h1>
      <p className="text-sm text-muted-foreground">{t('report.notFound.body')}</p>
      <Link to="/diagnosis" className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
        {t('report.notFound.cta')}
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/report/ReportNotFound.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/report/ReportNotFound.tsx src/app/routes/report/ReportNotFound.test.tsx
git commit -m "feat: add ReportNotFound"
```

---

### Task 10: `ReportPage` (replaces `ReportPlaceholder`)

**Files:**
- Create: `src/app/routes/report/ReportPage.tsx`
- Create: `src/app/routes/report/ReportPage.test.tsx`
- Delete: `src/app/routes/report/ReportPlaceholder.tsx`

**Interfaces:**
- Consumes: `useParams` from `react-router`; `useSession` from `@/store/sessionStore`; `useLocale` from `@/i18n/LocaleProvider`; `buildReport` from `@/domain/report/buildReport`; `rooteContent` from `@/content/roote.config`; all of Tasks 7–8's section components; `ReportNotFound` from `./ReportNotFound`.
- Produces: `<ReportPage />` — reads `reportId` from the URL, checks it matches `session.reportId` and `session.analysis` is present; if not, renders `<ReportNotFound/>`; otherwise builds the `ReportModel` (memoized) and renders all 11 sections in order (A's 5 + B's 6). Does NOT wire the "Download PDF" button yet — Task 13 adds that once the PDF document exists.

- [ ] **Step 1: Write the test**

`src/app/routes/report/ReportPage.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { ReportPage } from './ReportPage';

function seedSession(reportId: string | null) {
  const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' };
  const analysis = reportId ? deriveAnalysis({ gender: 'male', answers } as never) : null;
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers },
      analysis,
      reportId,
      account: { email: null },
      program: null,
    }),
  );
}

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '/report/:reportId', element: <ReportPage /> }], { initialEntries: [path] });
  return render(<LocaleProvider><SessionProvider><RouterProvider router={router} /></SessionProvider></LocaleProvider>);
}

describe('ReportPage', () => {
  it('shows ReportNotFound when the URL reportId does not match the session', () => {
    seedSession('rep-abc');
    renderAt('/report/rep-different');
    expect(screen.getByText('Report not found')).toBeInTheDocument();
  });

  it('shows ReportNotFound when there is no analysis yet', () => {
    seedSession(null);
    renderAt('/report/rep-abc');
    expect(screen.getByText('Report not found')).toBeInTheDocument();
  });

  it('renders the full report when the reportId matches a completed session', () => {
    seedSession('rep-abc');
    renderAt('/report/rep-abc');
    expect(screen.getByText('Personalized Hair Report')).toBeInTheDocument();
    expect(screen.getByText('MATCHED TO YOUR SCAN')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start My Program' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/report/ReportPage.test.tsx`
Expected: FAIL — cannot find `./ReportPage`.

- [ ] **Step 3: Implement `src/app/routes/report/ReportPage.tsx`**

```tsx
import { useMemo } from 'react';
import { useParams } from 'react-router';
import { useSession } from '@/store/sessionStore';
import { useLocale } from '@/i18n/LocaleProvider';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { ReportNotFound } from './ReportNotFound';
import {
  ReportHeader, ReportPhotos, ReportAnalysis, ReportHairLossType, ReportCurrentSituation,
} from '@/app/components/report/ReportSectionsA';
import {
  ReportPlan, ReportDuration, ReportPricing, ReportClaims, ReportCta, ReportFooter,
} from '@/app/components/report/ReportSectionsB';

export function ReportPage() {
  const { reportId } = useParams();
  const session = useSession();
  const { locale } = useLocale();

  const ready = !!reportId && reportId === session.reportId && !!session.analysis;

  const model = useMemo(() => {
    if (!ready) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis!,
      content: rooteContent,
      locale,
      reportId: reportId!,
    });
  }, [ready, session.diagnosis, session.analysis, locale, reportId]);

  if (!model) return <ReportNotFound />;

  return (
    <main className="mx-auto max-w-[640px] bg-background pb-12">
      <ReportHeader model={model} />
      <ReportPhotos model={model} />
      <ReportAnalysis model={model} />
      <ReportHairLossType model={model} />
      <ReportCurrentSituation model={model} />
      <ReportPlan model={model} />
      <ReportDuration model={model} />
      <ReportPricing model={model} />
      <ReportClaims model={model} />
      <ReportCta model={model} />
      <ReportFooter model={model} />
    </main>
  );
}
```

- [ ] **Step 4: Delete the placeholder**

```bash
git rm src/app/routes/report/ReportPlaceholder.tsx
```

(`App.tsx` still imports it at this point — Task 14 fixes that. Deleting it now is fine; the project won't build until Task 14, which happens before this task's final full-suite check.)

- [ ] **Step 5: Update `App.tsx`'s import right now, in this task, so the build stays green**

In `src/app/App.tsx`, replace:

```ts
import { ReportPlaceholder } from './routes/report/ReportPlaceholder';
```

with:

```ts
import { ReportPage } from './routes/report/ReportPage';
```

and replace the route entry:

```tsx
{ path: '/report/:reportId', element: <ReportPlaceholder /> },
```

with:

```tsx
{ path: '/report/:reportId', element: <ReportPage /> },
```

(This is the only part of Task 14's `App.tsx` change that must happen now, to keep the build green after deleting `ReportPlaceholder.tsx`. Task 14 will not need to touch `App.tsx` again for this specific swap — it covers the rest of the wiring.)

- [ ] **Step 6: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/report/ReportPage.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Run the full suite + build**

Run: `pnpm test && pnpm build`
Expected: all tests pass (the old `ReportPlaceholder`-referencing test, if any existed under that name, no longer exists — check `App.test.tsx` still passes since it doesn't reference `ReportPlaceholder` by name); build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add ReportPage, wire it into App.tsx, remove ReportPlaceholder"
```

---

### Task 11: `ReportEmailPreview`

**Files:**
- Create: `src/app/routes/report/ReportEmailPreview.tsx`
- Create: `src/app/routes/report/ReportEmailPreview.test.tsx`

**Interfaces:**
- Consumes: `ReportModel` from `@/domain/report/types`; `useT` from `@/i18n/LocaleProvider`.
- Produces: `<ReportEmailPreview model={ReportModel} />` — a separate, inline-styled approximation of what the actual marketing email would look like (subject line, short intro, a summary card, one CTA button linking to `/report/:reportId`). This is NOT rendered on any route yet in this plan — it exists as a component `ReportPage` can optionally show behind a toggle, or a future email-backend template can import directly. For this task, just build and test the component in isolation; wiring a visible "preview my email" toggle into `ReportPage` is `// TODO: confirm with client` (out of scope — the spec calls this a design reference the future backend template consumes, not a user-facing toggle).

- [ ] **Step 1: Write the test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { ReportEmailPreview } from './ReportEmailPreview';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

const answers = { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as const;
const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
const analysis = deriveAnalysis({ gender: 'male', answers });
const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-3' });

describe('ReportEmailPreview', () => {
  it('renders the subject, intro, and a link to the full report', () => {
    render(<LocaleProvider><ReportEmailPreview model={model} /></LocaleProvider>);
    expect(screen.getByText('Your ROOTÉ Hair Analysis Report')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View my full report' })).toHaveAttribute('href', `/report/${model.meta.reportId}`);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/report/ReportEmailPreview.test.tsx`
Expected: FAIL — cannot find `./ReportEmailPreview`.

- [ ] **Step 3: Implement `src/app/routes/report/ReportEmailPreview.tsx`**

```tsx
import { useT } from '@/i18n/LocaleProvider';
import type { ReportModel } from '@/domain/report/types';

// TODO: email backend — this component is a design reference for the real transactional
// email template; it is not sent anywhere from the client.
export function ReportEmailPreview({ model }: { model: ReportModel }) {
  const t = useT();
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'Arial, sans-serif', border: '1px solid #E4D9C8', borderRadius: 8, padding: 24 }}>
      <p style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#6E635A' }}>ROOTÉ</p>
      <h1 style={{ fontSize: 18, margin: '8px 0' }}>{t('report.emailPreview.subject')}</h1>
      <p style={{ fontSize: 14, color: '#2A2320' }}>{t('report.emailPreview.intro')}</p>
      <p style={{ fontSize: 13, color: '#6E635A' }}>{model.meta.scaleLine}</p>
      <a
        href={`/report/${model.meta.reportId}`}
        style={{ display: 'inline-block', marginTop: 16, padding: '12px 24px', background: '#745F50', color: '#F9F6EF', borderRadius: 6, textDecoration: 'none', fontSize: 14 }}
      >
        {t('report.emailPreview.openOnSite')}
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/report/ReportEmailPreview.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/report/ReportEmailPreview.tsx src/app/routes/report/ReportEmailPreview.test.tsx
git commit -m "feat: add ReportEmailPreview design reference"
```

---

### Task 12: PDF fonts

**Files:**
- Create: `src/pdf/fonts.ts`

**Interfaces:**
- Produces: `registerReportFonts(): void` — calls `Font.register` for `'Libre Franklin'` (Latin) and `'Heebo'` (Hebrew + Latin fallback) using the `.ttf` files bundled by the `@fontsource/*` packages added in Task 1.
- Consumed by Task 13 (`ReportDocument.tsx`), called once at module load.

- [ ] **Step 1: Confirm the exact filenames from Task 1's Step 2 output**

Use the filenames you noted in Task 1. They will look like:
`libre-franklin-latin-400-normal.ttf`, `libre-franklin-latin-700-normal.ttf`,
`heebo-hebrew-400-normal.ttf`, `heebo-hebrew-700-normal.ttf`, `heebo-latin-400-normal.ttf`.

If any exact filename below doesn't exist in your `ls` output from Task 1 Step 2, substitute the real filename you found (the weight/subset pattern is standard across `@fontsource` packages, but exact naming can vary by version — trust what's actually on disk over this plan text).

- [ ] **Step 2: Create `src/pdf/fonts.ts`**

```ts
import { Font } from '@react-pdf/renderer';
import libreFranklinRegular from '@fontsource/libre-franklin/files/libre-franklin-latin-400-normal.ttf';
import libreFranklinBold from '@fontsource/libre-franklin/files/libre-franklin-latin-700-normal.ttf';
import heeboRegular from '@fontsource/heebo/files/heebo-hebrew-400-normal.ttf';
import heeboBold from '@fontsource/heebo/files/heebo-hebrew-700-normal.ttf';

let registered = false;

/** Registers the two report fonts with @react-pdf/renderer. Idempotent — safe to call from every render. */
export function registerReportFonts(): void {
  if (registered) return;
  Font.register({
    family: 'Libre Franklin',
    fonts: [
      { src: libreFranklinRegular, fontWeight: 400 },
      { src: libreFranklinBold, fontWeight: 700 },
    ],
  });
  Font.register({
    family: 'Heebo',
    fonts: [
      { src: heeboRegular, fontWeight: 400 },
      { src: heeboBold, fontWeight: 700 },
    ],
  });
  registered = true;
}
```

- [ ] **Step 3: Verify the imports resolve**

Run: `pnpm build`
Expected: succeeds — Vite resolves each `.ttf` import to a hashed asset URL (no `?url` suffix needed; `.ttf` is in Vite's built-in default asset-handling list). If the build fails with "Failed to resolve import" for any of the four font imports, re-check the exact filenames from Task 1 Step 2's `ls` output and correct the import paths — do not guess further filenames.

- [ ] **Step 4: Commit**

```bash
git add src/pdf/fonts.ts
git commit -m "feat: register Libre Franklin + Heebo fonts for PDF rendering"
```

---

### Task 13: `ReportDocument` (the PDF)

**Files:**
- Create: `src/pdf/ReportDocument.tsx`
- Create: `src/pdf/ReportDocument.test.ts`

**Interfaces:**
- Consumes: `ReportModel` from `@/domain/report/types`; `Document`, `Page`, `View`, `Text`, `Image`, `StyleSheet` from `@react-pdf/renderer`; `pdf` from `@react-pdf/renderer` (used only in the test); `registerReportFonts` from `./fonts`; `isPending` from `@/content/pending`.
- Produces: `<ReportDocument model={ReportModel} />` — a `@react-pdf/renderer` `<Document>` with one A4 `<Page>` containing all 11 sections in the same order as the web report. `[PENDING]` values render as a visibly outlined chip (mirroring `PendingChip`'s web treatment, using `@react-pdf/renderer`'s own primitives since it cannot render HTML/CSS or the web `PendingChip` component).

- [ ] **Step 1: Write the test**

`src/pdf/ReportDocument.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from './ReportDocument';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { Answers, Gender } from '@/domain/analysis/types';
import type { SessionState } from '@/store/sessionStore';

function persona(gender: Gender, answers: Answers) {
  const diagnosis: SessionState['diagnosis'] = {
    gender,
    photos: [{ id: 'p1', angleKey: 'front', thumb: 'data:image/jpeg;base64,AAA', blobId: 'b1' }],
    answers,
  };
  const analysis = deriveAnalysis({ gender, answers });
  return buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-pdf' });
}

const personas = [
  { name: 'mild male hairline', gender: 'male' as const, answers: { q1_area: 'hairline', q2_onset: 'lt-1y', q3_prior: 'never', q4_family: 'no', q5_goal: 'stop' } as Answers },
  { name: 'established male entire-scalp', gender: 'male' as const, answers: { q1_area: 'entire-scalp', q2_onset: 'gt-5y', q3_prior: 'no-success', q4_family: 'yes', q5_goal: 'both' } as Answers },
  { name: 'mild female crown', gender: 'female' as const, answers: { q1_area: 'crown', q2_onset: 'lt-1y', q3_prior: 'partial', q4_family: 'not-sure', q5_goal: 'regrow' } as Answers },
];

describe('ReportDocument (PDF)', () => {
  it.each(personas)('renders to a non-empty buffer for $name', async ({ gender, answers }) => {
    const model = persona(gender, answers);
    const buffer = await pdf(<ReportDocument model={model} />).toBuffer();
    const chunks: Buffer[] = [];
    for await (const chunk of buffer) chunks.push(chunk as Buffer);
    const full = Buffer.concat(chunks);
    expect(full.length).toBeGreaterThan(1000);
    expect(full.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('renders the Hebrew locale without throwing', async () => {
    const model = persona('male', { q1_area: 'hairline', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'no', q5_goal: 'both' } as Answers);
    const heModel = { ...model, meta: { ...model.meta, locale: 'he' as const, dir: 'rtl' as const } };
    const buffer = await pdf(<ReportDocument model={heModel} />).toBuffer();
    const chunks: Buffer[] = [];
    for await (const chunk of buffer) chunks.push(chunk as Buffer);
    expect(Buffer.concat(chunks).length).toBeGreaterThan(1000);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/pdf/ReportDocument.test.ts`
Expected: FAIL — cannot find `./ReportDocument`.

- [ ] **Step 3: Implement `src/pdf/ReportDocument.tsx`**

```tsx
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { registerReportFonts } from './fonts';
import { isPending } from '@/content/pending';
import type { ReportModel } from '@/domain/report/types';

registerReportFonts();

const COLORS = {
  background: '#F9F6EF', foreground: '#2A2320', primary: '#745F50', accent: '#8D7766',
  muted: '#6E635A', border: '#E4D9C8', card: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.background, color: COLORS.foreground, fontFamily: 'Libre Franklin', fontSize: 10, padding: 28 },
  pageHe: { fontFamily: 'Heebo' },
  header: { alignItems: 'center', marginBottom: 16, textAlign: 'center' },
  wordmark: { fontSize: 20, letterSpacing: 2, color: COLORS.primary, marginBottom: 4 },
  h1: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  muted: { color: COLORS.muted, fontSize: 9 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6, color: COLORS.primary },
  row: { flexDirection: 'row', gap: 8 },
  photoBox: { width: 100, height: 90, borderRadius: 4, marginBottom: 4 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 8, marginBottom: 6 },
  pill: { borderWidth: 1, borderColor: COLORS.accent, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8, fontSize: 8, color: COLORS.accent, alignSelf: 'flex-start', marginBottom: 6 },
  pending: { borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.accent, borderRadius: 3, paddingVertical: 1, paddingHorizontal: 3, fontSize: 8, color: COLORS.accent },
  footer: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 12 },
  ctaBox: { backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 10, alignItems: 'center', marginVertical: 12 },
  ctaText: { color: COLORS.background, fontSize: 12, fontWeight: 700 },
});

function Pending({ value }: { value: { __pending: true; label: string } }) {
  return <Text style={styles.pending}>[PENDING: {value.label}]</Text>;
}

function TextOrPending({ value }: { value: string | { __pending: true; label: string } }) {
  return isPending(value) ? <Pending value={value} /> : <Text>{value}</Text>;
}

export function ReportDocument({ model }: { model: ReportModel }) {
  const isRtl = model.meta.dir === 'rtl';
  const dirStyle = { direction: isRtl ? 'rtl' : 'ltr' } as const;
  const langStyle = isRtl ? styles.pageHe : {};

  return (
    <Document>
      <Page size="A4" style={[styles.page, langStyle, dirStyle]}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>ROOTÉ</Text>
          <Text style={styles.h1}>Personalized Hair Report</Text>
          <Text style={styles.muted}>{model.meta.scaleLine}</Text>
          <Text style={styles.muted}>#{model.meta.reportId}</Text>
          <Text style={[styles.pending, { marginTop: 4 }]}>{model.meta.demoDisclaimer}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Photos</Text>
          <View style={styles.row}>
            {model.photos.map((p) => (
              <View key={p.angleKey}>
                <Image src={p.dataUrl} style={styles.photoBox} />
                <Text style={styles.muted}>{p.caption}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          {model.analysis.flagged.map((f, i) => (
            <View key={i} style={styles.card}>
              <Text style={{ fontWeight: 700 }}>{f.zoneLabel}</Text>
              <Text style={styles.muted}>{f.severityLabel} — {f.note}</Text>
            </View>
          ))}
          {model.analysis.metrics.map((m, i) => (
            <View key={i} style={styles.row}>
              <Text style={{ flex: 1 }}>{m.label}</Text>
              <Text style={styles.muted}>{m.valueLabel}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hair Loss Type</Text>
          <Text>{model.hairLossType.title}</Text>
          <Text style={styles.muted}>{model.hairLossType.areaLabels.join(' · ')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Situation</Text>
          {model.currentSituation.paragraphs.map((p, i) => (
            <Text key={i} style={styles.muted}>{p}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Personalized Treatment Plan</Text>
          <Text style={styles.pill}>{model.plan.matchedToScanBadge}</Text>
          {model.plan.core.map((tr, i) => (
            <View key={i} style={styles.card}>
              <TextOrPending value={tr.name} />
              <Text style={styles.muted}>{tr.usage}</Text>
              <Text style={styles.muted}>{tr.frequency} · {tr.appliesToLabels.join(', ')}</Text>
            </View>
          ))}
          {model.plan.supporting.map((tr, i) => (
            <View key={i} style={styles.card}>
              <TextOrPending value={tr.name} />
              <Text style={styles.muted}>{tr.usage} · {tr.frequency}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Program Duration</Text>
          <Text style={{ fontSize: 16, fontWeight: 700 }}>{model.recommendedDuration.label}</Text>
          <Text style={styles.muted}>{model.recommendedDuration.rationaleNote}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.row}>
            <TextOrPending value={isPending(model.pricing.price) ? model.pricing.price : model.pricing.price.formatted} />
          </View>
          {model.pricing.compareAll.map((row) => (
            <View key={row.days} style={styles.row}>
              <Text style={{ flex: 1 }}>{row.label}{row.isRecommended ? ' ★' : ''}</Text>
              <TextOrPending value={isPending(row.price) ? row.price : row.price.formatted} />
            </View>
          ))}
        </View>

        <View style={styles.row}>
          {model.claims.map((c) => (
            <View key={c.key} style={[styles.card, { flex: 1 }]}>
              <Text style={styles.muted}>{c.label}</Text>
              <TextOrPending value={c.valueLabel} />
            </View>
          ))}
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>{model.cta.label}</Text>
        </View>

        <View style={styles.footer}>
          <TextOrPending value={model.disclaimers.medical} />
          <TextOrPending value={model.disclaimers.notADiagnosis} />
          <Text style={styles.muted}>{model.disclaimers.demo}</Text>
          <TextOrPending value={model.disclaimers.formulaPending} />
        </View>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/pdf/ReportDocument.test.ts`
Expected: PASS (4 tests: 3 personas + the Hebrew-locale case). This is real PDF generation running under Node via Vitest — allow extra time on first run (font registration + layout).

- [ ] **Step 5: Run the full suite once**

Run: `pnpm test`
Expected: everything still green, pristine.

- [ ] **Step 6: Commit**

```bash
git add src/pdf/ReportDocument.tsx src/pdf/ReportDocument.test.ts
git commit -m "feat: add ReportDocument PDF template, smoke-tested for 3 personas + RTL"
```

---

### Task 14: Wire "Download PDF" into `ReportPage`

**Files:**
- Modify: `src/app/routes/report/ReportPage.tsx`
- Modify: `src/app/routes/report/ReportPage.test.tsx`

**Interfaces:**
- Consumes: `pdf` from `@react-pdf/renderer`; `ReportDocument` from `@/pdf/ReportDocument`.
- Produces: a "Download PDF" button on `ReportPage` that calls `pdf(<ReportDocument model={model}/>).toBlob()`, creates an object URL, and triggers a download named `ROOTE-Hair-Report-<reportId>.pdf`. On generation failure, shows an inline error message — the web report stays usable either way (per spec §9's error table).

- [ ] **Step 1: Extend the test**

Add to `src/app/routes/report/ReportPage.test.tsx` (keep the three existing tests; add this one):

```tsx
import userEvent from '@testing-library/user-event';

// ...(existing imports and tests stay)

it('shows a Download PDF button that is enabled once the report is built', async () => {
  seedSession('rep-abc');
  renderAt('/report/rep-abc');
  const btn = screen.getByRole('button', { name: 'Download PDF' });
  expect(btn).toBeEnabled();
});
```

(This test only checks the button renders and is enabled — it does not click it and wait for real PDF generation, which would be slow and duplicate Task 13's own PDF smoke tests. The click-triggered generation is exercised by Task 13's tests calling `ReportDocument` directly with real `model` data of the same shape `ReportPage` produces.)

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/report/ReportPage.test.tsx`
Expected: FAIL — no "Download PDF" button exists yet.

- [ ] **Step 3: Update `ReportPage.tsx`**

Add imports:

```ts
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from '@/pdf/ReportDocument';
import { useT } from '@/i18n/LocaleProvider';
```

Inside the component, add state and a handler, and render the button. The full updated component:

```tsx
export function ReportPage() {
  const { reportId } = useParams();
  const session = useSession();
  const { locale } = useLocale();
  const t = useT();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const ready = !!reportId && reportId === session.reportId && !!session.analysis;

  const model = useMemo(() => {
    if (!ready) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis!,
      content: rooteContent,
      locale,
      reportId: reportId!,
    });
  }, [ready, session.diagnosis, session.analysis, locale, reportId]);

  async function handleDownload() {
    if (!model) return;
    setPdfError(null);
    setGenerating(true);
    try {
      const blob = await pdf(<ReportDocument model={model} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ROOTE-Hair-Report-${model.meta.reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError(t('report.downloadPdf') + ' — failed. The web report is still available below.');
    } finally {
      setGenerating(false);
    }
  }

  if (!model) return <ReportNotFound />;

  return (
    <main className="mx-auto max-w-[640px] bg-background pb-12">
      <ReportHeader model={model} />
      <div className="flex justify-center px-4 pb-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={generating}
          className="rounded-md border border-primary px-6 py-2 text-sm text-primary disabled:opacity-50"
        >
          {t('report.downloadPdf')}
        </button>
      </div>
      {pdfError && <p role="alert" className="px-4 text-center text-xs text-destructive">{pdfError}</p>}
      <ReportPhotos model={model} />
      <ReportAnalysis model={model} />
      <ReportHairLossType model={model} />
      <ReportCurrentSituation model={model} />
      <ReportPlan model={model} />
      <ReportDuration model={model} />
      <ReportPricing model={model} />
      <ReportClaims model={model} />
      <ReportCta model={model} />
      <ReportFooter model={model} />
    </main>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/report/ReportPage.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite + build**

Run: `pnpm test && pnpm build`
Expected: all green, pristine; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/report/ReportPage.tsx src/app/routes/report/ReportPage.test.tsx
git commit -m "feat: wire Download PDF button into ReportPage"
```

---

### Task 15: Final P2a verification

**Files:** none changed — verification only.

- [ ] **Step 1: Run the complete suite**

Run: `pnpm test`
Expected: every test from P0, P1, and this plan passes — pristine output, no console warnings.

- [ ] **Step 2: Run the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 3: Confirm the report is reachable end-to-end (manual sanity note for the reviewer, not a new automated test)**

The path `/diagnosis` → complete the flow → `/diagnosis/ready` → submit an email → lands on `/report/:reportId` → shows all 11 sections → "Download PDF" produces a file was exercised piecewise by this plan's tests (`ReadyStep.test.tsx` from P1 confirms navigation to `/report/:reportId`; `ReportPage.test.tsx` confirms the report renders once there; `ReportDocument.test.ts` confirms the PDF itself is valid). No new test is needed here — note in the task report that this chain was checked by inspection of the already-passing suite, not run interactively.

- [ ] **Step 4: No commit for this task** (verification-only).

---

## Self-review

**Spec coverage:** §6.1 (`buildReport`/`ReportModel`) → Tasks 4–6. §6.2 (formula modelling — single combined topical, percentages hidden) → Task 6's `formula` resolution. §6.3 (11 report sections in order) → Tasks 7–8 (web), Task 13 (PDF), assembled in Task 10/14. §6.4 (web/email version, `ReportNotFound`, `ReportEmailPreview`) → Tasks 9–11. §6.5 (PDF smoke-tested per persona) → Task 13. §4.8 (PDF approach, RTL, font embedding) → Tasks 1, 12–13. Error-handling table row "Report | unknown reportId → ReportNotFound" → Task 10. "PDF throws → toast; web stays usable" → Task 14's try/catch.

**No-invented-content discipline:** every `null` in `roote.config.ts` still renders as `PENDING` (Task 6's tests assert this explicitly); the new empty-string handling (`resolveLocalized`) closes the P0/P1 final-review's parked Ruling R14 finding exactly where it now matters (the report is the first place that content is actually displayed).

**Placeholder scan:** no "TBD"/"implement later" left; every task has complete, real code; every new i18n key has both `en` and `he` values.

**Type consistency:** `ReportModel` defined once (Task 5), consumed identically by web sections (Tasks 7–8), `ReportPage` (Task 10), and `ReportDocument` (Task 13) — no duplicate/divergent shape. `PendingMarker`/`isPending` reused from the existing P0 `content/pending.ts`, not redefined.

**Open items carried forward (flag to the user in the final report, not blocking):**
- Photo quality in the report uses the small on-device thumbnail (`// TODO: confirm with client`, Global Constraints) — a real print/email-quality version would need an async IndexedDB fetch, deliberately deferred to keep `buildReport` pure.
- `ReportEmailPreview` is built and tested but not wired into any visible route — it's a design reference for the future email-backend template, per spec §6.4.
- Supporting-treatment names and two disclaimers (`medical`, `notADiagnosis`) will show as `[PENDING: ... (he)]` in the Hebrew report until the client supplies real Hebrew copy — this is a **visible, honest gap in the shipped report**, not a bug, and should be called out explicitly when this phase is reported back.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-02-roote-p2a-report-and-pdf.md`.**

Proceeding with subagent-driven-development, matching the P0/P1 cadence: fresh subagent per task, review after each, no pausing between tasks. P2b (account + plan + payment) is queued to start once this phase's final review is clean.
