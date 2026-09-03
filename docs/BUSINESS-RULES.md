# ROOTÉ.US — Business Rules

Companion to [`DESIGN-SPECIFICATION.md`](./DESIGN-SPECIFICATION.md). Every rule below is **traceable to code**; the "Source" column is the file/function that implements or enforces it. Rules with no code evidence are marked `TBD — Business clarification required`.

Conventions: durations in whole days; dates are ISO `YYYY-MM-DD` computed in **UTC** (`programDay`, `buildProgram` use `toISOString().slice(0,10)` — a known UTC-vs-local edge, see BR-PR-12).

---

## 1. Analysis derivation (`BR-AN-*`)

**Source:** `src/domain/analysis/deriveAnalysis.ts`, `src/domain/analysis/types.ts`, `src/app/components/diagnosis/questions.ts`. All pure and deterministic — same input always yields the same `HairAnalysis`. The engine returns **keys**, not display strings.

### BR-AN-01 — Scale by gender
```
IF gender = 'male'   THEN scale = 'norwood'
IF gender = 'female' THEN scale = 'ludwig'
```

### BR-AN-02 — Severity band from onset (Q2)
```
q2_onset = 'lt-1y'  → severityBand = 'mild'
q2_onset = '1-5y'   → severityBand = 'moderate'
q2_onset = 'gt-5y'  → severityBand = 'established'
```
`severityFromOnset()`. Index map: mild=0, moderate=1, established=2.

### BR-AN-03 — Stage
```
bump = (q1_area = 'entire-scalp') ? 1 : 0
norwood: stage = clamp(2 + sevIndex[severityBand] + bump, 2, 6)
ludwig : stage = clamp(1 + sevIndex[severityBand],        1, 3)
```
So Norwood stages range 2–6 (never 1 or 7), Ludwig 1–3.

### BR-AN-04 — Flagged zones from affected area (Q1)
```
q1_area = 'hairline'      → flaggedZones = ['frontal-hairline', 'temples']
q1_area = 'crown'         → flaggedZones = ['crown-vertex']
q1_area = 'entire-scalp'  → flaggedZones = ['frontal-hairline', 'temples', 'mid-scalp', 'crown-vertex']
```
Zone severity: `mild` when `severityBand = 'mild'`, otherwise `moderate`. Each flagged zone gets `noteKey = 'zone-note.<zone>'`.

### BR-AN-05 — Density by zone (all four zones always reported)
```
FOR each zone:
  flagged AND zoneSeverity = 'mild'      → level = 'medium'
  flagged AND zoneSeverity = 'moderate'  → level = 'low'
  NOT flagged AND severityBand='established' → level = 'medium'
  NOT flagged otherwise                  → level = 'high'
```

### BR-AN-06 — Metrics (word-band levels only; never numeric)
```
pattern-stage    : mild→low   | moderate→medium | established→high
relative-density : mild→high  | moderate→medium | established→low
thickness-caliber: established→low | else medium
scalp-visibility : flaggedCount ≥ 3 → high | = 2 → medium | else low
```

### BR-AN-07 — Notes
```
q3_prior = 'never'      → 'note.treatment-naive'
q3_prior = 'no-success' → 'note.prior-no-response'
q3_prior = 'partial'    → 'note.prior-partial'

q4_family = 'yes'      → 'note.family-history-positive'
q4_family = 'not-sure' → 'note.family-history-unknown'
q4_family = 'no'       → 'note.family-history-negative'
```

### BR-AN-08 — Plan emphasis from goal (Q5)
```
q5_goal = 'stop'   → planEmphasis = 'stabilize'
q5_goal = 'regrow' → planEmphasis = 'regrow'
q5_goal = 'both'   → planEmphasis = 'stabilize-regrow'
```

### BR-AN-09 — Recommended program duration
```
recommendedDurationDays = RECOMMENDED_DURATION_TABLE[`${severityBand}:${planEmphasis}`]
```
Table (`RECOMMENDED_DURATION_TABLE`, also mirrored as `rooteContent.recommendedDurationTable`):

| severity \ emphasis | stabilize | regrow | stabilize-regrow |
|---|---|---|---|
| mild | 120 | 180 | 180 |
| moderate | 180 | 270 | 270 |
| established | 270 | 360 | 360 |

**BR-AN-09a** — **90 days is a user-selectable purchase duration but is never an AI recommendation** under the current table (minimum recommendation is 120). `ASSUMPTION`: intentional (prior spec §4.7). `TBD` if the client wants a 90-day recommendation for the mildest cases — change the table.

### BR-AN-10 — Summary paragraph selection
```
summaryPlainKey = `summary.${scale}.${severityBand}`   // e.g. 'summary.norwood.moderate'
```

### BR-AN-11 — hairhealth.ai overlay (only when configured + photos present)
`src/domain/analysis/hairhealthAdapter.ts` `mapResponse()`:
```
base = deriveAnalysis(gender, answers)      // fully-populated local model
stage         = raw.norwood_stage|raw.ludwig_stage if numeric, else base.stage
severityBand  = raw.severity if ∈ {mild,moderate,established}, else base.severityBand
recommendedDurationDays = RECOMMENDED_DURATION_TABLE[`${severityBand}:${base.planEmphasis}`] ?? base value
// everything else (zones, density, metrics, notes, planEmphasis) stays from `base`
```
`TBD — Technical clarification required`: the real hairhealth.ai contract (endpoint, field names, auth, vocabulary) is a **placeholder** and must be confirmed before use (OQ-TECH-1).

---

## 2. Program lifecycle (`BR-PR-*`)

**Source:** `src/domain/program/types.ts`, `src/store/program.ts` (`buildProgram`), `src/app/routes/app/programProgress.ts`, `src/content/roote.config.ts`.

### BR-PR-01 — Selectable program durations
`ProgramDurationDays ∈ {90, 120, 180, 270, 360}`. The plan selector shows exactly these five (`rooteContent.programDurations`). The report's "compare all" table lists all five with each price independently `[PENDING]` until supplied.

### BR-PR-02 — Recommended pre-selection
On `/start/plan` first render, the selected duration = `session.draftDurationDays ?? recommendedDuration.days` (from `buildReport`). The recommended row is badged; the user may choose any of the five. Choosing writes `session.draftDurationDays`.

### BR-PR-03 — Program creation (freeze at checkout)
`buildProgram({orderId, reportId, analysis, durationDays, plan, today?})`:
```
startDate = today (default: now), as ISO YYYY-MM-DD
endDate   = startDate + durationDays
analysisSnapshot = analysis        // frozen re-scan baseline
plan.core / plan.supporting = the ReportModel plan rows (frozen)
completionLog = {}   progressPhotos = []   reminders = []
```
A `Program` is created **only** on a successful (stubbed) `/start/checkout` submission.

### BR-PR-04 — Program day (1-based, clamped)
```
programDay(program, today) = clamp(daysBetween(startDate, today) + 1, 1, durationDays)
daysRemaining(program, today) = max(0, daysBetween(today, endDate))
```
Day 1 = start date. After the end date, `programDay` stays at `durationDays` and `daysRemaining` = 0.

### BR-PR-05 — Reorder window
```
reorderLeadDays = 21          // rooteContent.reorderLeadDays — TODO: confirm with client
reorderDate(program) = endDate − 21 days
isReorderDue(program, today) = daysRemaining(program, today) ≤ 21
```
The reorder card on `/app` shows when `isReorderDue` is true (i.e. within 21 days of end, or ended). CTA → `/start/plan`.
`TBD`: renewal skips the account step and pre-selects the same duration (described in the prior spec §8.6) — **not implemented**; the CTA is a plain link to `/start/plan`.

### BR-PR-06 — Re-scan unlock
`src/app/routes/app/AppRescan.tsx`: `RESCAN_UNLOCK_DAY = 90`. The "Start a new analysis" control is disabled (`pointer-events-none`) while `programDay < 90`, showing "Available in {90 − day} days".
`TBD`: `rooteContent.claims.rescanWindow.value` is `null` (`[PENDING]`) — the 90-day constant is a hard-coded UI value, not client-confirmed (OQ-BIZ-2).

### BR-PR-07 — Adherence percentage (rolling 7-day)
```
taskCount = program.plan.core.length + program.plan.supporting.length
IF taskCount = 0 → adherencePct = 0
ELSE:
  done = Σ over i∈[0,6]  (completionLog[today − i] ?? []).length
  adherencePct = min(100, round( done / (taskCount × 7) × 100 ))
```
Window is 7 days by default (`adherencePct(program, days=7, today)`).

### BR-PR-08 — Care-team message unlock schedule
`CARE_MESSAGES` in `programProgress.ts`. A message with `day = D` is visible once `programDay ≥ D`:

| Unlock day | Message key |
|---|---|
| 1 | `app.care.msg.day1` |
| 14 | `app.care.msg.day14` (expected shedding note) |
| 45 | `app.care.msg.day45` (photo check-in) |
| 90 | `app.care.msg.day90` (re-scan available) |
| 180 | `app.care.msg.day180` (six-month review) |

### BR-PR-09 — Daily task list & completion keys
`dailyTasks(resolvePlanTreatments(t, locale))` flattens core then supporting into a single ordered list with stable keys:
```
core[i]       → key = `core:${i}`
supporting[i] → key = `support:${i}`
```
Completing a task toggles that key inside `program.completionLog[isoDate]` (`toggleProgramTask`). There is **no time-of-day** grouping (morning/evening) — the prior spec's `deriveSchedule`/`DailyTask.timeOfDay` was not built.

### BR-PR-10 — Plan is config-derived for display, frozen for counting
`/app/plan` and `/app` render treatment names/usage/frequency from the **live** `rooteContent.treatments` via `resolvePlanTreatments` (so they re-localize on locale switch). `program.plan` (the frozen snapshot) is used only for counts (`taskCount`) and is never shown directly. Consequence: if config treatments change after a program starts, the member's displayed plan changes too. `ASSUMPTION`: acceptable for the demo.

### BR-PR-11 — Program-day reference "today"
"Today" = `isoToday()` = `new Date().toISOString().slice(0,10)` — **UTC calendar date**.

### BR-PR-12 — Known date edge (UTC vs local)
`buildProgram` stamps `startDate`/`endDate` with `toISOString()` (UTC); `programDay`/`isoToday` also use UTC. A user in UTC+n late in their local day sees the *previous* UTC date. `GAP` — carried from the prior spec's parked follow-ups; no local-time handling. `TBD` whether to fix before launch.

### BR-PR-13 — Progress photo model
`program.progressPhotos[]` entries: `{id, isoDate, angleKey, blobId, thumb}`. Blob → IndexedDB; `thumb` (data URL) kept in JSON for gallery render. Baseline for comparison = the diagnosis photo of the same angle (`session.diagnosis.photos`). No editing/deletion of progress photos in the UI.

---

## 3. Pending / claims governance (`BR-PD-*`)

**Source:** `src/content/pending.ts`, `src/content/roote.config.ts`, `src/domain/report/buildReport.ts`, `src/app/components/brand/PendingChip.tsx`.

### BR-PD-01 — Nothing unverified renders as raw null
Any config value the client has not supplied is `null` and must render as `<PendingChip label>` → visible text `[PENDING: <label>]`. `collectPending()` walks any object/`ReportModel` and lists every `null`/`{__pending:true}` slot. A test asserts no claim/price/stat slot renders from a raw nullish value.

### BR-PD-02 — Always-pending values (this build)
```
programDurations[*].price        (×5)   → [PENDING: pricing: N days]
programDurations[*].perDayFrom   (×5)   → [PENDING: per-day pricing: N days]
claims.effectiveness.value              → [PENDING: effectiveness %]
claims.timeToVisibleResults.value       → [PENDING: time to visible results]
claims.rescanWindow.value               → (used for re-scan window messaging)
claims.doctorFollowUpCost.value         → [PENDING: doctor follow-up cost]
report "what to expect" timeline m1/m3/m6 outcomes → [PENDING: reported change at mN]
checkout shipping / total               → [PENDING: shipping] / [PENDING: total]
bag subtotal / shipping / total / per-product price → [PENDING: …]
```
None of these may be filled in by the development team — they require client-supplied, legally-cleared values (brief §5).

### BR-PD-03 — Empty localized string ⇒ pending
`resolveLocalized(text, locale, label)`: if `text[locale]` is falsy (empty string), the value is treated as unresolved → `PENDING(label)`. So a HE string left `''` shows `[PENDING]`, not a blank.

### BR-PD-04 — Formula presentation
```
formula.status = 'pending-regulatory-review'
formula.displayPercentagesPublicly = false   // TODO: confirm with client (regulatory)
```
While false: ingredient **names + roles** are shown, percentages hidden, with a "Formulation under evaluation, pending regulatory review" note. Ingredients: Minoxidil 10%, Finasteride 0.1%, Azelaic Acid 5%, ABN Complex™ 0.8% — all `status: 'proposed'`.

### BR-PD-05 — Demo disclosure
Every report and the analysis-ready screen show `disclaimers.demo`: "Demo: analysis figures are illustrative; production integrates hairhealth.ai." `TBD` how prominent this must be (OQ-LEG-5).

---

## 4. Authentication (`BR-AU-*`)

**Source:** `src/store/auth.tsx`. **Mock only — explicitly not real security.**

### BR-AU-01 — Email format
`EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Fails → `invalid-email` (sign-up) / handled as not-found (sign-in).

### BR-AU-02 — Password length
Minimum 8 characters (sign-up and change-password). Shorter → `weak-password`.

### BR-AU-03 — Duplicate account
Sign-up with an email already in `localStorage['roote.accounts']` → `duplicate-email`, no session created.

### BR-AU-04 — Password "digest"
`digestOf(password)` is a **non-cryptographic** 32-bit rolling hash (`Math.imul(31,h)+charCode`), prefixed `d`. Used only to detect "same password on sign-in" for the demo. Must be replaced by real hashing/auth (BE-2).

### BR-AU-05 — Session
Sign-up and sign-in write `{email, since: ISO}` to `localStorage['roote.authSession']`. Sign-out clears it. `auth.email` / `auth.since` derive from it.

### BR-AU-06 — Sign-in verification
`signIn(email, password)`: account must exist (`not-found`) and `account.digest === digestOf(password)` (`wrong-password`).

### BR-AU-07 — Change password
`changePassword(current, next)`: requires an active session (`not-signed-in`), `current` must match the stored digest (`wrong-password`), `next` ≥ 8 chars (`weak-password`). Updates `accounts[email].digest`.

### BR-AU-08 — Redirects
```
signed in, at /start            → /start/plan
not signed in, at /start/plan|checkout|success → /start
after /login success            → /app if session.program else /
signed out anywhere in /app     → /login (if program present) or / (if not)
```

---

## 5. Checkout & orders (`BR-CO-*`)

**Source:** `src/app/components/checkout/CheckoutFields.tsx` (the shared form), `src/store/checkout.ts` (unified `Order` + `submitPayment`), `src/store/orders.ts` (history); `src/app/routes/start/CheckoutStep.tsx`, `src/app/routes/bag/BagCheckout.tsx`; `src/store/cart.tsx`. *(Consolidated 2026-09-03 — was two parallel stacks; `bagCheckout.ts` removed.)*

### BR-CO-01 — Card field validation (shape only; one shared form)
`CheckoutFields` validates on submit, shape only:
```
card number : /^\d{13,19}$/   (spaces stripped)   → error 'checkout.error.card'
expiry      : /^(0[1-9]|1[0-2])\/\d{2}$/           → error 'checkout.error.expiry'
CVC         : /^\d{3,4}$/                          → error 'checkout.error.cvc'
```
No Luhn check, no expiry-in-future check, no real authorization. Only when all three pass does it hand the route `{ contact, card }`.

### BR-CO-02 — Card data minimisation
`CheckoutFields` builds `card` as `{ last4: digits.slice(-4), expiry }` — the full number and CVC live only in local component state and never enter the `Order`, get stored, logged, or transmitted. The `Order` union (`ProgramOrder | BagOrder`) carries `card: { last4, expiry }` only.

### BR-CO-03 — Stub payment behaviour
`submitPayment(order: Order)` (one function): resolves `{status:'success', orderId}` after a 400 ms delay. In DEV, if `localStorage['roote.debug.forceCheckoutFailure'] === '1'`, it throws. `orderId` = `` `${order.kind === 'program' ? 'ord' : 'bag'}-<epoch>-<n>` `` — the prefix is the only per-kind branch.

### BR-CO-03a — Order history
On a successful payment, the route calls `recordOrder({ id, kind, at: ISO, label })` (`src/store/orders.ts` → `localStorage['roote.orders']`, capped 20, newest first). `label` is the program duration label (`program`) or `"Qty {n}"` (`bag`). Rendered as "Recent orders" on `/app/profile`.

### BR-CO-04 — Checkout country
`country` is fixed to `'IL'` inside `CheckoutFields` (not a form field). `// TODO: confirm with client — IL vs international shipping`. Contact fields: name, email (prefilled from `account.email` on the program flow via `defaultEmail`; blank on the bag flow), phone, city, postal — all `required`.

### BR-CO-05 — Program minting
On stub success, `/start/checkout` calls `buildProgram(...)` (BR-PR-03) with `durationDays = session.draftDurationDays ?? recommendedDuration.days` and `session.setProgram(program)`, then navigates to `/start/success`.

### BR-CO-06 — Cart quantity
`clampQty(n) = max(1, min(20, round(n)))`. Setting a line qty ≤ 0 removes the line. Adding an existing SKU increments (clamped). `cart.count` = Σ line quantities.

### BR-CO-07 — Bag checkout guards
Empty cart at `/bag/checkout` (and no order just placed) → redirect `/bag`. On success: `setPlaced(true)` → navigate `/bag/success` with `state.orderId` → `cart.clear()`. `/bag/success` with no `state.orderId` → redirect `/products`.

### BR-CO-08 — Two purchase flows, one checkout
The **program** funnel (`/start/*` → `ProgramOrder`, `ord-` ids, mints a `Program`) and the **bag** shop (`/bag/*` → `BagOrder`, `bag-` ids, no program) are distinct *flows* but share one order model (`Order` union), one `submitPayment`, one `CheckoutFields` form, and one order-id scheme (prefix by `kind`). They keep separate carts (`draftDurationDays` vs `roote.cart`) and separate success routes. The bag is positioned as a **secondary refills/add-ons surface** (OQ-BIZ-7 direction): discoverable via the marketing-header cart icon (→ `/bag`) and an `/app`-sidebar "Shop products" link (→ `/products`); its orders appear in the `/app/profile` order history (BR-CO-03a).

---

## 6. Localization & formatting (`BR-LO-*`)

**Source:** `src/i18n/LocaleProvider.tsx`, `src/i18n/messages/*`, `src/domain/report/money.ts`.

### BR-LO-01 — Default & persistence
Default locale `he` (`DEFAULT_LOCALE`). Stored in `localStorage['roote.locale']`; only `'en'`/`'he'` accepted, anything else falls back to default. No IP/Accept-Language detection (`// TODO: IP geolocation default (backend)`).

### BR-LO-02 — Direction
`he → dir='rtl'`, `en → dir='ltr'`. `LocaleProvider` sets `document.documentElement.lang` and `dir` on every locale change, and updates `document.title` from the `meta.title` key. `index.html` ships `lang="he" dir="rtl"`.

### BR-LO-03 — Selection mechanism
Locale changes only via the `LocaleToggle` control (toggle + persist). No per-route or query-param override.

### BR-LO-04 — Key parity & non-empty (CI-enforced)
`en.ts` and `he.ts` must have identical key sets and no `""` values (`messages.test.ts`). 705 keys each as of 2026-09-03.

### BR-LO-05 — Fallback resolution
`t(key)`: active-locale table → `en` table → the key string itself. So a missing HE value silently shows the EN string (parity test makes true absence impossible; empty strings are caught by BR-PD-03 in report context and by BR-LO-04 globally).

### BR-LO-06 — Number/currency/date formatting
`formatMoney(amount, currency, locale)` → `Intl.NumberFormat('he-IL'|'en-US', {style:'currency', currency})`. Report dates → `toLocaleDateString('he-IL'|'en-US')`. `currency` = `rooteContent.currency` = `'ILS'` (placeholder; OQ-BIZ-3).

### BR-LO-07 — Orphaned keys
`landing.*` (~60 keys) and `marketing.blog.*` keys exist in both dictionaries with **no runtime consumer** (the `Landing` route and `/blog` were not built / were superseded). They still count toward parity. `TBD` remove or keep (OQ-TECH-5).

---

## 7. Media handling (`BR-MD-*`)

**Source:** `src/app/components/diagnosis/PhotoUpload.tsx`, `downscaleImage.ts`, `src/store/persistence.ts`.

### BR-MD-01 — Accepted files
`file.type` must start with `image/` (`photo.error.type`) and `file.size ≤ 15 MB` (`MAX_BYTES = 15 * 1024 * 1024`, `photo.error.size`). Other failures → `photo.error.generic`.

### BR-MD-02 — Downscale
Each accepted image is processed twice: a full-size version (default max edge, JPEG) and a thumbnail (`maxEdge: 256, quality: 0.6`). The full blob → IndexedDB (`putBlob(uuid, blob)`); the thumbnail data URL → session/program JSON.

### BR-MD-03 — Blob identity & cleanup
Blob key = `crypto.randomUUID()` (also used as the `PhotoRef.id`). Replacing a photo deletes the old blob (`deleteBlob(...).catch(()=>{})` — best-effort). Removing a photo deletes its blob then clears state even if the delete fails.

### BR-MD-04 — Storage locations
- `localStorage['roote.session' | 'roote.accounts' | 'roote.authSession' | 'roote.cart' | 'roote.locale']` — scalar/JSON state, `roote.` prefix.
- IndexedDB `roote` DB, `blobs` object store — `{buffer: ArrayBuffer, type: string}` keyed by uuid.
- `localStorage['roote.debug.forceCheckoutFailure']` — DEV-only debug switch.

### BR-MD-05 — Quota
`lsSet` catches write failures and `console.warn`s; it does **not** throw. The prior spec's "on `QuotaExceededError`, drop oldest progress photos and warn" is **not implemented** (`GAP`).

---

## 8. Report composition (`BR-RP-*`)

**Source:** `src/domain/report/buildReport.ts`.

### BR-RP-01 — Single view-model
`buildReport({diagnosis, analysis, content, locale, reportId, assets?})` returns one fully-resolved, already-localized, pending-flagged `ReportModel`. `ReportView` (and any future renderer) consumes `ReportModel` only — never `roote.config` or i18n for domain content.

### BR-RP-02 — Scale strip
`buildScaleStrip(scale, stage)`: one cell per stage `1..SCALE_BOUNDS[scale]` (norwood 7, ludwig 3); `isCurrent` where `n === analysis.stage`.

### BR-RP-03 — Affected areas
`hairLossType.areaLabels` = the flagged zones, in canonical zone order (`frontal-hairline, temples, mid-scalp, crown-vertex`), localized. `hairLossType.title` is composed from the localized severity band. `patternNote` = the localized `analysis.notes` joined.

### BR-RP-04 — Regimen blocks
One block per core treatment then per supporting treatment. `form`, `addresses`, `mechanism1/2` come from `report.treatment.<key>.*` i18n keys; a mechanism line is dropped if its key is unresolved (`startsWith('report.treatment.')`). `badges` = `report.regimen.badges` split on `|`. `photo` from the optional `assets` map keyed by treatment key.

### BR-RP-05 — Actives
One spotlight per `formula.ingredients` entry: name (literal), role label (`role.<role>`), mechanism (`marketing.science.ingredients.evidence.<role>`), optional `%` only if `displayPercentagesPublicly` (BR-PD-04), photo from `assets`.

### BR-RP-06 — Recommended duration + rationale
`days` = `analysis.recommendedDurationDays`; `label` = `report.duration.label {days}`; `rationaleNote` = `report.duration.rationale` interpolated with the localized severity band and `report.emphasis.<planEmphasis>`.

### BR-RP-07 — Pricing
`price` / `perDay` for a duration come from `programDurations` rows; a missing row or `null` price → `PENDING`. `compareAll` = all five durations, each price independently pending, `isRecommended` on the matching row.

### BR-RP-08 — Claims / expectations
`claims[]` = effectiveness / timeToVisibleResults / doctorFollowUpCost, each `PENDING` while its config value is `null`. The "what to expect" section reuses `claims` as stat tiles, plus a fixed m1/m3/m6 timeline whose outcomes are always `PENDING`, plus the shedding-phase note (`marketing.howItWorks.timeline.shedding`).

### BR-RP-09 — CTA
`cta.href = /start?report=${reportId}`.

### BR-RP-10 — Pending collection
`model.pending = collectPending(model)` after the model is assembled — the authoritative list of every unresolved slot in the report.

---

## 9. Rules that need a client decision (`TBD`)

| Ref | Question |
|---|---|
| BR-AN-09a | Should the mildest cases get a 90-day recommendation? (Table change.) |
| BR-PR-05 | Confirm 21-day reorder lead; define renewal flow (skip account step? pre-select duration?). |
| BR-PR-06 | Confirm the re-scan window (currently a hard-coded 90 days; `claims.rescanWindow` is `[PENDING]`). |
| BR-PD-02 | Supply all pricing (5 durations + per-day + renewal + shipping) and any substantiated effectiveness/timing figures — or confirm they stay out entirely. |
| BR-PD-04 | Show ingredient percentages publicly? Confirm the formula and its regulatory status. |
| BR-CO-04 | Checkout fields and shipping scope (IL only vs international); which payment methods to show. |
| BR-CO-08 | Are both the program funnel and the à-la-carte bag real go-to-market motions? |
| BR-LO-06 | Currency: ILS, USD, or both. |
| BR-LO-07 | Remove or keep the orphaned `landing.*` / `marketing.blog.*` keys. |
| BR-PR-12 | Fix the UTC-vs-local program-day edge before launch? |
