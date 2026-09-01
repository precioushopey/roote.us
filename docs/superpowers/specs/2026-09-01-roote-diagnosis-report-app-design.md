# ROOTÉ.US — Diagnosis Flow, Personalized Report & Post‑Purchase App

**Design spec** · 2026‑09‑01 · Status: approved for planning

---

## 1. Context

The repository at `C:\Users\jumua\Documents\ROOTÉ.US` currently holds an unrelated
Figma Make export ("Design Etsy Shop Branding" / *PaperlessHope*). Per the decision on
2026‑09‑01, we **repurpose this repo** as the ROOTÉ.US web application, keeping the
build tooling and discarding the Etsy‑branding source.

ROOTÉ.US is an American (California) hair‑loss brand whose customers are currently
mostly in Israel. The product is **not** e‑commerce with a catalogue. It is a
*Personalized Hair Growth System*: the customer is guided through
**Diagnosis → AI Analysis → Personalized Report → Purchase → Post‑purchase app →
Follow‑up**. The guiding UX principle (brief §14): the customer must feel
*"ROOTÉ learned my situation, analysed my hair with AI, gave me a result I understand,
built me a personal plan, and keeps tracking my progress"* — never *"I filled in a
quiz so they could sell me shampoo."*

### Source materials

| Material | Role |
| --- | --- |
| `ROOTÉ.US.docx` (Hebrew brief, 14 sections) | Primary requirements. Sections referenced below as "brief §N". |
| `phoenix-hairscan-report.pdf` | Structural reference for the report (Norwood strip, flagged‑zone cards, density map, metric bars, "What this means", stat tiles with asterisk footnotes, "MATCHED TO YOUR SCAN" pairing card). |
| Brand kit images | Fonts **Libre Franklin** / **DM Sans**; colours Gray Brown `#745F50`, Gray Orange `#8D7766` (accent), Ivory `#F9F6EF`, Cream `#F0E3D3`; "ROOTÉ" wordmark. |

---

## 2. Goals / non‑goals

### Goals

1. **Phase 1 — Diagnosis flow**: intro → gender → hair photos → combined
   AI‑analysis + questionnaire → analysis‑ready + email capture.
2. **Step 1 — Personalized report**: one `ReportModel` rendered as both a mobile web
   page (`/report/:reportId`, the email tap‑through target) and a **real generated
   PDF** (`@react-pdf/renderer`). Every stat, %, price and claim renders from a
   single content config; unspecified values render as visible `[PENDING: …]`.
3. **Step 2 — Account + plan confirm + payment handoff**: mock auth, recommended‑plan
   display (reads report data, no re‑derivation), duration selection
   (90/120/180/270/360, AI pick pre‑selected), ready‑to‑wire checkout UI with a
   clearly‑stubbed payment call, routing to the app on stubbed success.
4. **Step 3 — Post‑purchase app shell**: dashboard, daily plan detail, reminders UI,
   progress photos + gallery, re‑scan Before/After comparison, reorder prompt.
5. Fully **RTL / Hebrew‑default** with an English toggle; single design‑token set;
   shared components across phases.

### Non‑goals (this build)

- Real backend of any kind: no server auth, no real photo upload/storage, no email
  sending, no payment processing, no push/email notifications, no IP‑geolocation
  language routing. Each gets a clean UI plus a marked stub.
- Real computer‑vision / hairhealth.ai integration. Analysis is a deterministic
  local model (see §6).
- The full marketing site (hero videos, animations, before/after showcases,
  AI explainer videos from brief §3). Only a **minimal landing** exists as the
  flow's entry point.
- Any medical claim, effectiveness figure, or result promise not supplied by the
  client (brief §5). These are `[PENDING]`, never invented.
- Production PDF pipeline (server‑rendered + emailed). The client‑side generator
  shares its component tree and is the buildable‑now equivalent.

---

## 3. Constraints & principles

- **No invented medical/efficacy content.** Brief §5: every medical claim, result
  promise or "100 % success"‑style wording must pass regulatory + legal review.
  Build the UX around confidence in the *system*; leave claims as `[PENDING]`.
- **Single source of truth for content.** `src/content/roote.config.ts`. Renderers
  never read config or i18n directly — they consume resolved view‑models.
- **Formula is provisional.** Minoxidil 10 % / Finasteride 0.1 % / Azelaic Acid 5 % /
  ABN Complex™ 0.8 % are stored with `status: 'proposed'` and
  `formulaStatus: 'pending-regulatory-review'`.
- **Honest analysis copy.** With no real CV, report/analysis wording stays
  photo‑truthful ("based on the photos you submitted") and uses word‑band levels
  (`low` / `medium` / `high`), never fabricated numeric measurements. A demo‑mode
  disclaimer states production integrates hairhealth.ai.
- **Design for isolation.** Pure domain functions (`deriveAnalysis`,
  `deriveSchedule`, `deriveRescan`, `buildReport`) with typed inputs/outputs,
  separately testable, no React or storage imports.
- **Follow existing tooling conventions.** Keep the `@` → `src/` alias, the figma
  asset resolver, esbuild type‑stripping (no `tsconfig.json`), Tailwind v4 with the
  existing `@source` setup, and the shadcn/ui set in `src/app/components/ui/`.

---

## 4. Architecture & foundations

### 4.1 Repo repurposing

**Keep:** `vite.config.ts` (Vite 6.3.5, `figmaAssetResolver`, `@` alias,
`assetsInclude`), `postcss.config.mjs`, `pnpm-workspace.yaml`, `package.json`
tooling, `src/app/components/ui/**`, `src/app/components/figma/ImageWithFallback.tsx`,
`src/styles/tailwind.css`.

**Replace:** `src/app/App.tsx` (becomes router + providers).
**Delete:** `src/app/components/ShopBanner.tsx`, `src/app/components/ShopLogo.tsx`.
**Rewrite:** `src/styles/theme.css` (ROOTÉ tokens), `src/styles/fonts.css`
(Libre Franklin + DM Sans + Heebo), `index.html` (`<title>`, meta, lang/dir),
`README.md`, `CLAUDE.md` (document the ROOTÉ architecture; note the Figma Make
provenance is historical).

**Add dependencies:**

| Package | Why |
| --- | --- |
| `react-router` `7.13.0` | Already pinned in `package.json`; activate it. |
| `@react-pdf/renderer` (latest 3.x) | Client‑side real‑vector PDF, font embedding, `direction: 'rtl'`. |
| `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` | No test runner exists today. |

IDs (`reportId` / `orderId`) use `crypto.randomUUID()` — no new dependency. (`nanoid`
exists only as a transitive dep; do not import it directly.)

`react` / `react-dom` `18.3.1` must be installed explicitly (they are optional
peer deps) — add them as real `dependencies`.

Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

### 4.2 Routing map (`react-router` 7 data router)

```
/                       Landing (minimal): wordmark, one line, repeating
                        "Start Free Diagnosis / אבחון שיער חינם" CTA.
/diagnosis/:step        step ∈ intro | gender | photos | analyzing | ready
/report/:reportId       Web/email version of the report + "Download PDF"
/start                  Account creation (mock)            ─┐
/start/plan             Recommended plan + duration select  │ StartLayout
/start/checkout         Checkout UI + payment stub          │ (Account·Plan·Payment rail)
/start/success          Confirmation → CTA to /app         ─┘
/app                    → redirect to /app/today            ─┐
/app/today              Dashboard                            │
/app/plan               Daily plan detail                    │ AppLayout
/app/reminders          Reminders UI                         │ (tabs / side nav,
/app/progress           Progress photos + gallery            │  reorder banner slot)
/app/rescan             Re‑scan Before/After comparison     ─┘
*                       Not‑found → context‑appropriate redirect
```

Guards: `/diagnosis/:step` redirects backward when prerequisites are missing;
`/start/*` requires a resolvable `report` (query param or store); `/app/*` requires
a mock session **and** a `program`.

### 4.3 i18n / RTL

- `src/i18n/LocaleProvider.tsx` — React context; `locale ∈ 'he' | 'en'`, default
  `'he'`; persisted to `localStorage['roote.locale']`; sets `<html lang dir>`.
- `src/i18n/messages/en.ts` + `he.ts` — typed dictionaries; message keys are a
  string‑union type so missing keys fail the build/tests. `t(key, vars?)` helper
  with simple `{var}` interpolation. **No i18next dependency.**
- `src/i18n/keys.ts` — the key union + a test asserting `en` and `he` have identical
  key sets.
- Styling: Tailwind logical utilities (`ps-`, `pe-`, `ms-`, `me-`, `text-start`,
  `text-end`, `start-0`, `end-0`) plus `rtl:` / `ltr:` variants where a property has
  no logical form. Numbers/dates via `Intl`.
- Hebrew typeface: **Heebo** (Google Fonts), pairs with Libre Franklin.
  `// TODO: confirm Hebrew typeface with client`.
- Language is chosen by toggle + persistence only.
  `// TODO: IP geolocation default (backend)`.

### 4.4 Design tokens (`src/styles/theme.css`)

Keep the shadcn CSS‑variable **names** so `ui/` components inherit. Light‑first.

| Token | Value |
| --- | --- |
| `--background` | `#F9F6EF` (Ivory) |
| `--foreground` | `#2A2320` (warm near‑black) |
| `--card` | `#FFFFFF`; `--card-foreground` = `--foreground` |
| `--primary` | `#745F50` (Gray Brown); `--primary-foreground` `#F9F6EF` |
| `--accent` | `#8D7766` (Gray Orange); `--accent-foreground` `#F9F6EF` |
| `--secondary` / `--muted` | `#F0E3D3` (Cream) / warm neutral `#EFE7DA` |
| `--muted-foreground` | `#6E635A` |
| `--border` / `--input` | `#E4D9C8` |
| `--ring` | `#8D7766` |
| `--destructive` | keep shadcn default red |
| `--radius` | `0.5rem` (slightly tighter — "clean / medical") |

`.dark` block retained (brand kit shows a dark logo lockup) with inverted warm
neutrals, but not the focus of this build. `fonts.css` `@import`s Libre Franklin
(400/500/600/700), DM Sans (400/500), Heebo (400/500/700); sets
`--font-sans: 'Libre Franklin', 'Heebo', system-ui, sans-serif` and
`--font-secondary: 'DM Sans', 'Heebo', sans-serif`.

Wordmark: `src/app/components/brand/Wordmark.tsx` — inline SVG/text "ROOTÉ" in a
high‑contrast display style, single‑ and inverted‑colour variants.
`// TODO: confirm exact logo asset with client` (SVG export preferred).

### 4.5 State & persistence (`src/store/`)

- `sessionStore.tsx` — one context provider holding the whole client model:
  `locale`, `diagnosis`, `analysis`, `reportId`, `account`, `program`.
  Exposes typed selectors + actions; components never touch `localStorage`
  directly.
- `persistence.ts` — scalars/JSON to `localStorage['roote.*']`; **photo blobs to
  IndexedDB** via a ~40‑line wrapper (`db 'roote'`, store `blobs`, key = generated
  id). Thumbnails (small data URLs) kept in JSON for quick gallery render.
- Quota handling: on `QuotaExceededError`, drop oldest progress photos, warn.
- Rehydrate on load so refresh and "return from the email link" work.
- `// TODO: real upload / storage / auth / sync (backend)`.

### 4.6 Content config — single source of truth (`src/content/roote.config.ts`)

Typed object. **Any value the client has not supplied is literal `null`** and
renders everywhere as `[PENDING: <label>]`.

```ts
export const rooteContent = {
  brand: { name: 'ROOTÉ', domain: 'ROOTÉ.US',
           tagline: { en: 'Personalized Hair Growth System', he: '…' } },

  currency: 'ILS',                       // TODO: confirm ILS vs USD with client

  formula: {
    status: 'pending-regulatory-review',
    displayPercentagesPublicly: false,   // TODO: confirm with client (regulatory)
    ingredients: [
      { key: 'minoxidil',   name: 'Minoxidil',    percentage: 10.0, role: 'regrowth-stimulant',   status: 'proposed' },
      { key: 'finasteride', name: 'Finasteride',  percentage: 0.1,  role: 'dht-blocker',          status: 'proposed' },
      { key: 'azelaic',     name: 'Azelaic Acid', percentage: 5.0,  role: 'dht-support',          status: 'proposed' },
      { key: 'abn',         name: 'ABN Complex™', percentage: 0.8,  role: 'proprietary-support', status: 'proposed' },
    ],
  },

  treatments: {
    core: [
      { key: 'roote-topical', name: { en: 'ROOTÉ Topical Formula', he: '…' /* TODO medical HE */ },
        form: 'topical', usageKey: 'apply-scalp-affected', frequencyKey: 'twice-daily',
        appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] },
    ],
    supporting: [
      { key: 'derma-stim',  name: { en: '…', he: '…' }, usageKey: '…', frequencyKey: 'weekly' },  // TODO: confirm supporting treatment(s)
      { key: 'cleanser',    name: { en: '…', he: '…' }, usageKey: '…', frequencyKey: 'daily'  },
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
    effectiveness:        { value: null, footnoteKey: 'effectiveness-source' },
    timeToVisibleResults: { value: null, footnoteKey: 'results-timing-source' },
    rescanWindow:         { value: null },
    doctorFollowUpCost:   { value: null },   // TODO: confirm ROOTÉ offers follow‑ups at all
  },

  recommendedDurationTable: {               // (severityBand : mainGoal) → days  — tunable, no inline magic
    'mild:stabilize': 120,        'mild:regrow': 180,        'mild:stabilize-regrow': 180,
    'moderate:stabilize': 180,    'moderate:regrow': 270,    'moderate:stabilize-regrow': 270,
    'established:stabilize': 270, 'established:regrow': 360,  'established:stabilize-regrow': 360,
  },

  reorderLeadDays: 21,                      // TODO: confirm with client

  zones: { 'frontal-hairline': {/* labels */}, 'temples': {}, 'mid-scalp': {}, 'crown-vertex': {} },
  scales: { norwood: { min: 1, max: 7 /* labels */ }, ludwig: { min: 1, max: 3 } },

  disclaimers: {
    medical:        { en: '…not a medical diagnosis…', he: '…' /* TODO medical HE review */ },
    notADiagnosis:  { en: '…', he: '…' },
    demo:           { en: 'Demo — analysis figures are illustrative; production integrates hairhealth.ai.', he: '…' },
    formulaPending: { en: 'Formulation under evaluation, pending regulatory review.', he: '…' },
  },
} as const;
```

`src/content/pending.ts` — `collectPending(x): PendingItem[]` walks config or a
`ReportModel` and returns every `null`/`__pending` slot with a human label.
`<PendingChip label />` is the shared renderer (web + PDF). A test asserts no
claim/price/stat slot is ever rendered from raw `null`/`undefined`.

### 4.7 Deterministic analysis engine (`src/domain/analysis/`)

`deriveAnalysis(input: { gender: 'male'|'female'; answers: Answers }): HairAnalysis`
— pure, no randomness, no imports of React/storage/config text (it returns **keys**;
labels resolve later via config + i18n).

```ts
type HairAnalysis = {
  scale: 'norwood' | 'ludwig';
  stage: number;                         // within scale bounds
  severityBand: 'mild' | 'moderate' | 'established';
  flaggedZones: { zone: ZoneKey; severity: 'mild'|'moderate'; noteKey: string }[];
  densityByZone: { zone: ZoneKey; level: 'low'|'medium'|'high' }[];
  metrics: { key: string; level: 'low'|'medium'|'high' }[];   // Pattern stage, Relative density, Thickness, Scalp visibility
  notes: string[];                       // note keys (family history, prior treatment, …)
  planEmphasis: 'stabilize' | 'regrow' | 'stabilize-regrow';
  summaryPlainKey: string;               // selects a pre‑written EN+HE paragraph set
  recommendedDurationDays: 90|120|180|270|360;
};
```

Mapping (see also §5.6):

| Input | Effect |
| --- | --- |
| gender male / female | `scale` norwood (stage band 2–5) / ludwig (1–3) |
| Q1 hairline / crown / entire‑scalp | zones {frontal‑hairline, temples} / {crown‑vertex} / all four + severity bump |
| Q2 `<1y` / `1–5y` / `>5y` | stage low / mid / high end; `severityBand` mild / moderate / established |
| Q3 never / no‑success / partial | `noteKey` `treatment-naive` / `prior-no-response` / `prior-partial` |
| Q4 yes / no / not‑sure | `family-history-positive` (pattern likelihood ↑) / neutral |
| Q5 stop / regrow / both | `planEmphasis` `stabilize` / `regrow` / `stabilize-regrow` |

`recommendedDurationDays = recommendedDurationTable[`${severityBand}:${planEmphasis}`]`.
The table's current values span 120–360; **90 days** is a user‑selectable duration
in Step 2 but is never the AI‑recommended output under the current mapping (adjust
the table if the client wants a 90‑day recommendation for the mildest cases).
`densityByZone`: flagged → `low`/`medium`, others → `medium`/`high` (deterministic
from zone + severity). `metrics`: derived from stage + zones as `low/medium/high`
bands. Result persisted as `analysis` and later frozen into `program.analysisSnapshot`.

### 4.8 PDF approach

`@react-pdf/renderer`, client‑side. `src/pdf/ReportDocument.tsx` renders from a
`ReportModel` (same input as the web report). Bundle Libre Franklin + Heebo `.ttf`
in `src/assets/fonts/`, `Font.register` both; `direction: 'rtl'` + Heebo for
Hebrew. Embeds customer photos (JPEG data URLs). A4, brand‑styled cover band +
sections in web order, page‑break aware. `[PENDING]` renders as a visible outlined
chip. Trigger: button on `/report/:reportId` → `pdf(<ReportDocument .../>).toBlob()`
→ download `ROOTE-Hair-Report-<id>.pdf`. Generation error → toast; web version
stays available. `// TODO: email backend` marks where server‑side render + attach
belongs (the component tree is reusable under Node).

### 4.9 Folder structure (under `src/`)

```
main.tsx
app/
  App.tsx                      router + providers
  routes/
    landing/                   Landing
    diagnosis/                 IntroStep, GenderStep, PhotosStep, AnalyzingStep, ReadyStep, DiagnosisLayout
    report/                    ReportPage, ReportEmailPreview, ReportNotFound
    start/                     AccountStep, PlanStep, CheckoutStep, SuccessStep, StartLayout
    app/                       AppLayout, TodayPage, PlanPage, RemindersPage, ProgressPage, RescanPage
  components/
    ui/                        (kept) shadcn primitives
    figma/                     (kept) ImageWithFallback
    brand/                     Wordmark, LocaleToggle, PendingChip, StatTile, ProgressRail, ...
    diagnosis/                 PhotoUpload, AnalyzingStrip, QuestionCard      (reused by rescan)
    report/                    section components (web)
content/
  roote.config.ts              single source of truth
  pending.ts                   collectPending, PendingItem
domain/
  analysis/                    deriveAnalysis, deriveRescan, types
  report/                      buildReport, ReportModel types
  program/                     deriveSchedule, tasksForDay, types
i18n/
  LocaleProvider.tsx, keys.ts, messages/{en,he}.ts
pdf/
  ReportDocument.tsx, sections/*
store/
  sessionStore.tsx, persistence.ts, auth.ts, checkout.ts, program.ts
assets/
  fonts/                       Libre Franklin + Heebo ttf (for PDF)
styles/
  theme.css (rewritten), fonts.css (rewritten), tailwind.css (kept)
```

---

## 5. Phase 1 — Diagnosis flow  (brief §§6–10)

`DiagnosisLayout`: wordmark, `LocaleToggle`, 5‑segment `ProgressRail`
(Intro · Gender · Photos · Analysis · Results), RTL‑aware. Each step guards its
prerequisites; back‑nav and refresh preserve answers via `sessionStore.diagnosis`.

### 5.1 Intro (`/diagnosis/intro`, also the `/diagnosis` index)
Headline + three icon cards (*takes a few minutes* · *AI analysis of your hair* ·
*personalized treatment plan*) + one CTA. No input. Brief §7: minimal text.

### 5.2 Gender (`/diagnosis/gender`)
"What is your gender? / מה המין שלך?" — two large visual selectable cards,
**Male / Female** (exactly the brief's two options). Sets `diagnosis.gender`.
Drives Norwood vs Ludwig. `// TODO: confirm with client` — third / "prefer not to
say" option?

### 5.3 Hair photos (`/diagnosis/photos`)
"How to photograph" guidance cards for four angles — **Front, Top, Crown,
Hairline** (brief §7). Four capture/upload slots
(`<input type="file" accept="image/*" capture>` for mobile; drag‑drop on desktop).
Client‑side downscale to ≤ ~1200 px, JPEG ~0.72, before storing (blob → IndexedDB,
thumbnail retained). Require **≥ 1** photo, encourage all four.
`// TODO: confirm with client` — real minimum. Privacy/reassurance line.
`// TODO: real upload + storage (backend)`.

### 5.4 Analyzing + questionnaire (`/diagnosis/analyzing`) — §8/§9 resolution

**One combined screen.** A persistent slim **`AnalyzingStrip`** at the top cycles
the five facets from brief §8 (*hair density · hair loss area · hairline · scalp
condition · hair thinning*), checking each off on a ~12 s timer. Beneath it, the
**questionnaire** occupies the main area — one question per screen, animated
transitions, brand colour. The strip is **gated**: it cannot reach 100 % until all
five questions are answered. Whichever finishes first waits for the other; then the
screen auto‑advances to `ready`. This satisfies both brief sections literally
(§9: the questionnaire runs *while* the AI analyses).
`// TODO: confirm with client` — if §8 and §9 should instead be two separate
sequential screens.

Questions, verbatim from brief §9 (`QuestionCard` component, reused by re‑scan):

1. **Where are you experiencing hair loss?** — Hairline · Crown · Entire scalp
2. **When did you first notice hair loss?** — Less than 1 year · 1–5 years · More than 5 years
3. **Have you previously used hair‑loss treatments?** — Never · Yes, without success · Yes, with partial improvement
4. **Does hair loss run in your family?** — Yes · No · Not sure
5. **What is your main goal?** — Stop hair loss · Regrow lost hair · Both

On completion: `deriveAnalysis(gender, answers)` → persist `diagnosis.analysis`;
generate `reportId`.

### 5.5 Analysis ready + email (`/diagnosis/ready`)
"Your Hair Analysis Is Ready / אבחון השיער שלך הושלם בהצלחה" + a teaser (stage
label, N flagged zones — not the full report). Email field + "Send my personalized
results / שלחו לי את התוצאות". On submit: store `account.email` (pre‑fills signup),
mark report ready, `// TODO: email backend`, route to `/report/:reportId` with copy
noting it was also emailed. Consent checkbox — `// TODO: confirm with client` on
consent/legal copy.

### 5.6 Honesty guard
No real CV exists. Report/analysis copy stays photo‑truthful ("based on the photos
you submitted"), uses word‑band levels, and shows `disclaimers.demo`. No fabricated
measurements. `// TODO: confirm with client` on disclosure wording.

### 5.7 Reused by Step 3
`PhotoUpload`, `AnalyzingStrip`, `QuestionCard`, and `deriveAnalysis` are built
standalone here for `/app/rescan`.

---

## 6. Step 1 — Personalized report  (brief §11)

### 6.1 `buildReport` and `ReportModel`

`buildReport({ diagnosis, analysis, content, locale }): ReportModel` — pure. Produces
a fully‑resolved, already‑localized, pending‑flagged structure. **Web and PDF
renderers consume `ReportModel` only.**

```ts
type PENDING = { __pending: true; label: string };
type Money   = { amount: number; currency: string; formatted: string };

type ReportModel = {
  meta: { reportId; generatedAt; locale; dir; scaleLine; demoDisclaimer };
  photos: { angleKey; dataUrl; caption }[];                                   // §1
  analysis: {                                                                  // §2
    scaleStrip: { stageKey; label; isCurrent }[];
    flagged:    { zoneLabel; severityLabel; note }[];
    densityMap: { zoneLabel; level; levelLabel }[];
    metrics:    { label; valueLabel; level }[];
  };
  hairLossType:     { title; areaLabels: string[]; patternNote };              // §3
  currentSituation: { paragraphs: string[] };                                  // §4
  plan: {                                                                      // §5
    matchedToScanBadge: boolean;
    core:       { name; form; usage; frequency; appliesToLabels: string[] }[];
    supporting: { name; usage; frequency }[];
    formula:    { ingredients: { name; percentage?; roleLabel }[]; statusLabel } | null;
    applicationFrequencyLabel; durationLabel;
  };
  recommendedDuration: { days: number; label: string; rationaleNote: string }; // §6
  pricing: {                                                                   // §7
    duration: { days; label };
    price: Money | PENDING;
    perDay?: Money | PENDING;
    compareAll: { days; label; price: Money | PENDING }[];
  };
  claims: { key: string; valueLabel: string | PENDING; footnote?: string }[];  // stat tiles
  cta: { label: string; href: string };                                       // §8 → /start?report=<id>
  disclaimers: { medical; notADiagnosis; demo; formulaPending };
  pending: PendingItem[];                                                      // collected
};
```

### 6.2 Formula modelling decision
The brief's formula reads as **one combined topical** carrying all four actives
(Finasteride 0.1 % is a topical concentration, not the oral 1 mg tablet). ROOTÉ's
`treatments.core` is therefore a single topical formula — **not** Phoenix's
oral + topical split. "MATCHED TO YOUR SCAN" presents *that formula + a supporting
treatment*. `// TODO: confirm with client` — one combined topical vs. multiple
products; any oral component?

### 6.3 Report sections (shared order; `src/components/report/*` web · `src/pdf/sections/*` PDF)

1. **Header** — wordmark, "Personalized Hair Report / דוח שיער אישי", `generatedAt`,
   `reportId`, gender/scale line, `demo` disclaimer chip.
2. **Your photos** (§1) — uploaded photos with angle captions; PDF embeds JPEGs.
3. **AI analysis** (§2) — Norwood/Ludwig **stage strip** with a "HERE" marker
   (Phoenix pattern); **flagged‑zone cards**; **density map** table (zone → level
   bar); **metric bars**. Word‑band levels only.
4. **Hair loss type / affected area** (§3) — title (e.g. "Early patterned thinning —
   temples & crown"), area chips, one pattern note.
5. **Current situation** (§4) — 1–2 plain‑language paragraphs from
   `summaryPlainKey`. Non‑alarmist, no fabricated claims.
6. **Your personalized treatment plan** (§5) — **"MATCHED TO YOUR SCAN" badge**
   (adopting the Phoenix pattern). Card: ROOTÉ core topical formula → ingredient
   list with roles (percentages shown only if
   `formula.displayPercentagesPublicly`, else names + `formulaPending` note) →
   **application frequency** → **duration** → **supporting treatment**. All from
   config.
7. **Recommended program duration** (§6) — large "Recommended: 180 Days"‑style stat
   + one‑line rationale ("established pattern + regrowth goal").
8. **Pricing** (§7) — price for the recommended program (or `[PENDING: pricing —
   d180]`), optional per‑day, and a compare‑all‑durations table (each price its own
   PENDING).
9. **Stat tiles** — Phoenix‑style trio (effectiveness · time to visible results ·
   follow‑up cost), each rendering `[PENDING: …]` with an asterisk‑footnote slot.
   Placed adjacent to the plan.
10. **CTA** (§8) — large "Start My Program / התחל את התוכנית שלי" →
    `/start?report=<reportId>`.
11. **Footer** — `medical`, `notADiagnosis`, `demo`, `formulaPending` disclaimers.

### 6.4 Web/email version (`/report/:reportId`)
Mobile‑first single column, ~640 px max‑width, brand tokens. Loads `ReportModel`
from `sessionStore` by id; unknown id → `ReportNotFound` ("restart your
diagnosis"). "Download PDF / הורדת דוח PDF" button. A separate inline‑styled
`ReportEmailPreview` approximates the actual email body; real send is
`// TODO: email backend` (same `ReportModel` would feed a server template).

### 6.5 Generated PDF
Per §4.8. Smoke‑tested via `pdf(<ReportDocument/>).toBuffer()` in Node for each
persona.

---

## 7. Step 2 — Account + plan confirm + payment handoff  (brief §12)

Entry `/start?report=<reportId>`; loads `ReportModel`/`analysis` from store.
`StartLayout` with an Account · Plan · Payment rail.

### 7.1 Account (`/start`)
`src/store/auth.ts` — mock, email + password, `localStorage`‑backed.
`signUp(email, password)`: validate (email format, password ≥ 8), reject duplicate
local email, store `{ email, digest }` where `digest` is a **non‑cryptographic**
hash (commented as *not real security*), set `session = { email, since }`.
`signIn`, `signOut`, `useSession()`. Email pre‑filled from §5.5. Magic‑link shown
as a disabled `// TODO` option. `// TODO: real auth (backend) — Shopify customer
accounts / Supabase / Clerk`. An existing session skips to `/start/plan`.

### 7.2 Recommended plan (`/start/plan`)
Reads `analysis.recommendedDurationDays` + `ReportModel.plan` — **never re‑runs
`deriveAnalysis`**. Condensed "MATCHED TO YOUR SCAN" card + a five‑card duration
selector (90/120/180/270/360), each showing days · `price` or `[PENDING: pricing]`
· per‑day. The AI‑recommended card is **pre‑selected and badged "Recommended for
you"**, fully changeable; selection writes `program.durationDays` (draft). →
`/start/checkout`.

### 7.3 Checkout (`/start/checkout`)
Ready‑to‑wire, fully inert.
- **Order summary** — program, duration label, `price`/`[PENDING: pricing]`,
  per‑day, `[PENDING: shipping]`, total. "Change" link → `/start/plan`.
- **Contact / shipping** — name, email (prefilled), phone, country (default
  Israel), city, postal; validated. `// TODO: confirm with client` — exact fields;
  IL vs international shipping.
- **Payment** — card number / expiry / CVC / name, formatted + shape‑validated
  only; visible "test UI — no real processing" note; disabled PayPal / Bit / Apple
  Pay row. `// TODO: confirm with client` — payment methods.
- **Submit** → `src/store/checkout.ts` `submitPayment(order)`:
  ```
  // TODO: Marwell — wire to Shopify/payment backend
  // Stub: resolves { status: 'success', orderId } after a short delay.
  // No card data is stored or logged. Replace with real Shopify Checkout / payment intent.
  ```
  On success → build `program` (§7.5) → `/start/success`.

### 7.4 Success (`/start/success`)
Confirmation (orderId, plan, duration, start = today) + 3‑point "what's next" + CTA
"Go to my program / למעבר לתוכנית שלי" → `/app`.

### 7.5 `program` (`src/store/program.ts`) — spine of Step 3

```ts
type Program = {
  orderId; reportId;
  analysisSnapshot: HairAnalysis;         // frozen re‑scan baseline
  durationDays: number;
  startDate; endDate;                     // endDate = startDate + durationDays
  plan: { core: Treatment[]; supporting: Treatment[] };   // frozen from ReportModel.plan
  completionLog: Record<string /*isoDate*/, string[] /*taskKey*/>;
  progressPhotos: { id; isoDate; angleKey; blobId; thumb }[];
  reminders: { taskKey; times: string[] /*HH:mm*/; enabled: boolean }[];
};
```

`src/domain/program/deriveSchedule.ts` (pure): `plan` + frequency →
`tasksForDay(program, date): DailyTask[]` (computed, not materialized).
`DailyTask = { key; titleKey; instructionKey; timeOfDay: 'morning'|'evening'|'any';
appliesToZones: ZoneKey[] }`. Copy via config + i18n.

---

## 8. Step 3 — Post‑purchase app shell  (brief §13)

`AppLayout` — bottom tab bar (mobile) / side nav (desktop): Today · Plan ·
Reminders · Progress; wordmark; `LocaleToggle`; RTL‑aware; **`ReorderBanner`
slot** at the top. Guarded by `useSession()` + a `program` (else "no active
program" state + dev seed).

### 8.1 `/app/today` — dashboard
"Day 12 of 180" + progress ring; **streak** (consecutive days with all tasks done);
**today's checklist** from `tasksForDay(program, today)` with a **Mark done** toggle
→ `completionLog[today]`; all‑done celebratory state; next‑reminder chip; quick
links to plan / progress.

### 8.2 `/app/plan` — daily plan detail
Full routine — core formula (what / how / when / which zones), supporting
treatment, frequency — from frozen `program.plan` + `deriveSchedule`. Week/day
picker → that day's tasks. Link to the read‑only full report
(`/report/:reportId`).

### 8.3 `/app/reminders`
Per‑task time pickers (add/remove `HH:mm`, enable/disable) → `program.reminders`.
UI only. `// TODO: notification backend`. Visible "reminder delivery coming soon"
note.

### 8.4 `/app/progress` — progress photos
Upload reusing `PhotoUpload` (Front/Top/Crown/Hairline), date‑tagged →
`program.progressPhotos` (blob → IndexedDB, thumb retained). Gallery grouped by
date, filter by angle, tap to enlarge. No editing. "Compare to baseline" →
`/app/rescan`.

### 8.5 `/app/rescan` — re‑scan Before/After
Reuses `PhotoUpload` + `AnalyzingStrip` (photos‑only; optional 1–2 quick
questions). `// TODO: confirm with client` — does re‑scan re‑ask the full
questionnaire? `src/domain/analysis/deriveRescan.ts` (pure, deterministic): derives
the new analysis from `program.analysisSnapshot` nudged by elapsed program days +
`planEmphasis`, bounded by scale, so **Before/After is coherent for the demo**
(flagged as a demo model). Side‑by‑side baseline vs latest: stage strip, density
map, metric bars, flagged zones with **deltas** ("Crown density: Low → Medium");
photos side‑by‑side per angle where available. `// TODO: confirm with client` —
real re‑scan compares physician/hairhealth.ai output, not a simulated delta.

### 8.6 `ReorderBanner`
App‑wide on `/app/*`. Shows when
`today ≥ endDate − content.reorderLeadDays` **or** the program has ended. CTA →
`/start/plan?renew=1` (same duration pre‑selected, account step skipped).
Dismissible per session; reappears next session until acted on. Renewal price is
`[PENDING: pricing]`.

### 8.7 Demo seeding
Dev‑only (`import.meta.env.DEV`) "Load demo program" on `/app` and `/start`:
populates the store with a coherent persona (analysis + program at ~day 12) so
Step 3 screens are reviewable without walking the whole flow.

---

## 9. Error handling

| Area | Condition | Behaviour |
| --- | --- | --- |
| Diagnosis | direct‑nav to a step with unmet prerequisites | redirect to the earliest unmet step |
| Diagnosis | unknown `:step` | redirect to `/diagnosis/intro` |
| Photos | wrong type / too large / downscale failure | inline field error; block continue until ≥ 1 valid photo |
| Analyzing | refresh mid‑analysis | re‑run the timed strip from stored answers; if answers complete, jump to `ready` |
| Ready | invalid email | inline error; block submit |
| Report | unknown `reportId` | `ReportNotFound` with a restart CTA |
| PDF | `@react-pdf` throws | toast; web report stays usable |
| Account | duplicate local email / weak password / wrong password | inline messages; no navigation |
| Start | reach `/start/*` with no resolvable report | prompt to run the diagnosis (dev: seed) |
| Checkout | reach with no selected duration | redirect to `/start/plan` |
| Checkout | stub "failure" path (togglable in dev) | show a retryable error state; nothing persisted |
| App | no session or no `program` | redirect to `/start` or "no active program" + dev seed |
| Persistence | `QuotaExceededError` | drop oldest progress photos; warn |
| i18n | missing key (should be impossible — typed) | test failure in CI; dev overlay flags it |

---

## 10. Testing strategy

Runner: **Vitest** + `@testing-library/react` + `jsdom`. TDD for all pure domain
code.

**Pure / unit**
- `deriveAnalysis` — table‑driven over every `gender × Q1..Q5` combination: assert
  `scale`, `stage` within bounds, `flaggedZones` set, `severityBand`,
  `planEmphasis`, `recommendedDurationDays` matches `recommendedDurationTable`, and
  every returned key resolves in **both** `en` and `he`.
- `deriveRescan` — deterministic; improvement is monotonic‑ish and bounded by
  scale; `analysisSnapshot` never mutated.
- `deriveSchedule` / `tasksForDay` — task counts per frequency; weekly‑task
  placement (days 1, 8, 15…); key resolution.
- `buildReport` — golden `ReportModel`s for three personas (mild male hairline /
  established male entire‑scalp / mild female crown): section presence + order,
  `recommendedDuration` matches the table, `pricing` + `claims` arrive as
  `PENDING`.
- `collectPending` — every `null` in config surfaces; renderers assert no raw
  nullish in a claim/price/stat slot.
- i18n — `en` and `he` key sets are identical.
- `auth` store — signup validation, duplicate email, signin, session persistence.
- `checkout` stub — resolves success, builds a valid `program`, retains no card
  data.
- Reorder window — boundary tests around `endDate − reorderLeadDays`.

**Component / render**
- Smoke render for each route with a seeded store (`/`, all `/diagnosis/:step`,
  `/report/:id`, `/report/:id` unknown‑id fallback, all `/start/*`, all `/app/*`).
- `/diagnosis/photos` — downscale util produces expected dimensions; ≥ 1 photo
  gate.
- Locale toggle flips `dir` and swaps copy.

**PDF**
- `pdf(<ReportDocument model={persona}/>).toBuffer()` resolves without throwing for
  each persona (runs under Node).

---

## 11. Code stub / TODO inventory (markers to place in source)

| Marker | Location |
| --- | --- |
| `// TODO: Marwell — wire to Shopify/payment backend` | `store/checkout.ts` `submitPayment` |
| `// TODO: real auth (backend) — Shopify customer accounts / Supabase / Clerk` | `store/auth.ts` |
| `// TODO: email backend` | `/diagnosis/ready` submit; `pdf/ReportDocument` header comment; `report/ReportEmailPreview` |
| `// TODO: real upload + storage (backend)` | `components/diagnosis/PhotoUpload`, `store/persistence.ts` |
| `// TODO: notification backend` | `/app/reminders` |
| `// TODO: IP geolocation default (backend)` | `i18n/LocaleProvider` |
| `// TODO: confirm Hebrew typeface with client` | `styles/fonts.css` |
| `// TODO: confirm exact logo asset with client` | `components/brand/Wordmark` |
| `// TODO: confirm with client` (§8/§9 sequential vs combined) | `/diagnosis/analyzing` |
| `// TODO: confirm with client` (gender third option) | `/diagnosis/gender` |
| `// TODO: confirm with client` (minimum photo count) | `/diagnosis/photos` |
| `// TODO: confirm with client` (analysis disclosure wording) | report footer / `disclaimers.demo` |
| `// TODO: confirm with client` (one combined topical vs multiple products / oral) | `content/roote.config.ts` `treatments` |
| `// TODO: confirm with client` (supporting treatment identity) | `content/roote.config.ts` `treatments.supporting` |
| `// TODO: confirm with client` (show formula percentages publicly) | `content/roote.config.ts` `formula.displayPercentagesPublicly` |
| `// TODO: confirm with client` (currency ILS vs USD) | `content/roote.config.ts` `currency` |
| `// TODO: confirm with client` (consent / legal copy) | `/diagnosis/ready` |
| `// TODO: confirm with client` (checkout fields, shipping scope, payment methods) | `/start/checkout` |
| `// TODO: confirm with client` (re‑scan re‑asks questionnaire?) | `/app/rescan` |
| `// TODO: confirm with client` (reorder lead days) | `content/roote.config.ts` `reorderLeadDays` |
| `// TODO: confirm with client` (doctor follow‑ups offered?) | `content/roote.config.ts` `claims.doctorFollowUpCost` |

## 12. PENDING content inventory (missing data — render as `[PENDING: …]`, never invented)

| Key | Where used | Notes |
| --- | --- | --- |
| `programDurations[*].price` (×5) | report §7, `/start/plan`, `/start/checkout`, reorder | No pricing anywhere in the brief. |
| `programDurations[*].perDayFrom` (×5) | report §7, `/start/plan` | Derived from price; blocked until price exists. |
| `claims.effectiveness` | report stat tile §6/§9 | Brief §5 forbids inventing. Phoenix's "90 %" is *their own* figure and not transferable. |
| `claims.timeToVisibleResults` | report stat tile | e.g. Phoenix "3–6 mo" — needs ROOTÉ's own substantiated value. |
| `claims.rescanWindow` | `/app/rescan`, report | |
| `claims.doctorFollowUpCost` | report stat tile | Only if ROOTÉ actually offers physician follow‑ups. |
| `currency` | everywhere money renders | Placeholder `ILS`; confirm. |
| `treatments.supporting[*]` names/usage | report §5, `/app/plan` | Identity of supporting treatment(s) not specified. |
| `treatments.core[0].name.he` and all medical HE strings | report, app | Flagged for professional Hebrew review. |
| `disclaimers.*` final wording (EN + HE) | report footer, app | Draft copy only; legal review required. |
| Norwood / Ludwig stage labels, zone labels (final copy) | report §2 | Working labels; confirm terminology. |

## 13. Open questions for the client

1. **§8 / §9 structure** — is the combined analyzing‑strip + questionnaire screen
   acceptable, or should they be two sequential screens (loading, then survey)?
2. **Pricing** for all five durations (90/120/180/270/360) — and the renewal price.
3. **Effectiveness / results‑timing / re‑scan‑window figures** — any substantiated
   values ROOTÉ can publish, or keep them out entirely for now?
4. **Currency** — ILS for Israeli customers, USD, or both?
5. **Formula presentation** — one combined topical (current assumption) vs. multiple
   products; is there an oral component? Show active‑ingredient percentages publicly?
6. **Supporting treatment(s)** — what are they (e.g. derma‑stimulation, cleanser,
   supplement)?
7. **Gender step** — Male/Female only (current), or add a third / "prefer not to
   say"?
8. **Minimum photos** required to proceed (currently ≥ 1 of 4).
9. **Re‑scan** — does it re‑ask the questionnaire, and should the comparison be
   labelled as illustrative until a real analysis provider is wired?
10. **Consent / legal** — marketing‑consent copy at email capture; medical
    disclaimers; "not a diagnosis" language; data‑handling statement.
11. **Checkout** — required fields, domestic vs international shipping, payment
    methods to show (card / PayPal / Bit / Apple Pay).
12. **Doctor follow‑ups** — does ROOTÉ offer them (affects the Phoenix‑style stat
    tile)?
13. **Reorder lead time** — how many days before program end should the reorder
    prompt appear (assumed 21)?
14. **Hebrew typeface** (assumed Heebo) and **logo asset** (SVG export preferred).
15. **Demo disclosure** — how explicitly should the UI state that the analysis is a
    demo model pending hairhealth.ai integration?

---

## 14. Phased implementation outline

Each phase is independently demoable and ends with a review checkpoint.

**P0 — Foundations**
Repurpose the repo; add deps; rewrite `theme.css` / `fonts.css` / `index.html`;
router + providers in `App.tsx`; `LocaleProvider` + `messages/{en,he}` skeleton +
key‑parity test; `sessionStore` + `persistence` (localStorage + IndexedDB
wrapper); `roote.config.ts` + `collectPending` + `PendingChip`; `Wordmark`,
`LocaleToggle`, `ProgressRail`; Vitest wired. Minimal landing page.

**P1 — Diagnosis flow** (brief §§6–10)
`DiagnosisLayout` + five steps; `PhotoUpload`, `AnalyzingStrip`, `QuestionCard`;
`deriveAnalysis` (TDD) + mapping table; email capture. Demo: complete a diagnosis,
land on a `reportId`.

**P2a — Report + PDF** (brief §11)
`buildReport` + `ReportModel` (TDD, 3 personas); web `/report/:reportId` with all
11 sections + "MATCHED TO YOUR SCAN"; `ReportEmailPreview`; `ReportDocument` PDF +
font bundling + Node smoke test; `ReportNotFound`. Demo: view and download the
report for a completed diagnosis.

**P2b — Account + plan + payment** (brief §12)
`store/auth.ts` (TDD); `StartLayout`; `/start`, `/start/plan` (duration selector,
pre‑selected recommendation), `/start/checkout` (order summary + fields + stubbed
`submitPayment`), `/start/success`; `store/program.ts` + `deriveSchedule` (TDD).
Demo: sign up, confirm plan, "pay", reach success.

**P2c — Post‑purchase app** (brief §13)
`AppLayout` + nav + `ReorderBanner`; `/app/today`, `/app/plan`, `/app/reminders`,
`/app/progress`, `/app/rescan`; `deriveRescan` (TDD); dev demo‑seed. Demo: full
post‑purchase shell with a seeded program and a working Before/After.

**P3 — Polish & pass**
RTL sweep, animation/transition pass, `CLAUDE.md` / `README.md` rewrite, full test
run, the PENDING/TODO inventories reconciled against the code, and a written
hand‑off list of the §13 open questions.

---

## 15. Design‑for‑isolation notes

| Unit | Does | Interface | Depends on |
| --- | --- | --- | --- |
| `deriveAnalysis` | gender + answers → analysis keys | `(input) → HairAnalysis` | nothing (pure) |
| `deriveRescan` | baseline + elapsed → new analysis | `(snapshot, elapsedDays, emphasis) → HairAnalysis` | nothing (pure) |
| `buildReport` | diagnosis + analysis + config → view‑model | `(input) → ReportModel` | `roote.config`, i18n messages (as data) |
| `deriveSchedule` | plan + duration → daily tasks | `tasksForDay(program, date) → DailyTask[]` | nothing (pure) |
| `collectPending` | object → list of unresolved slots | `(x) → PendingItem[]` | nothing (pure) |
| `sessionStore` | hold + persist the client model | typed selectors/actions context | `persistence` |
| `persistence` | localStorage + IndexedDB blobs | `get/set/remove`, `putBlob/getBlob` | browser APIs |
| `auth` | mock session | `signUp/signIn/signOut/useSession` | `persistence` |
| `checkout` | stubbed payment | `submitPayment(order) → Promise<Result>` | — (marked TODO) |
| Report renderers (web / PDF) | draw a `ReportModel` | `({ model }) → UI` | `ReportModel` only |
| `PhotoUpload` / `AnalyzingStrip` / `QuestionCard` | reusable flow pieces | props in, callbacks out | i18n, tokens |

The load‑bearing boundary: **all content and localisation collapse into typed
view‑models (`ReportModel`, `DailyTask`, analysis keys) before any renderer runs**,
so screens and the PDF stay dumb and the "everything from config, nothing invented"
rule is enforced in one place.
