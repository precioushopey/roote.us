# ROOTÉ.US — User Flows

Companion to [`DESIGN-SPECIFICATION.md`](./DESIGN-SPECIFICATION.md). Flows describe **implemented behaviour** (route guards, state transitions, error paths) unless a step is marked `GAP` / `stub`. Rule references point to [`BUSINESS-RULES.md`](./BUSINESS-RULES.md).

Legend for the diagrams: rectangles = screen/state, diamonds = decision, rounded = terminal, `» text` on an edge = system response.

---

## UF-01 — First-time visitor → diagnosis → report

**Start:** any marketing page. **Success:** the personalized report. **Actor:** anonymous visitor.

```mermaid
flowchart TD
    A[Marketing page] -->|"Start Free Diagnosis"| B["/diagnosis (intro)"]
    B -->|Continue| C["/diagnosis/gender"]
    C -->|Select Male/Female » session.diagnosis.gender set| D["/diagnosis/photos"]
    D -->|Add 4 angle photos » blobs to IndexedDB, thumbs to state| E{All 4 photos present?}
    E -->|No| D
    E -->|Yes » Continue| F["/diagnosis/analyzing"]
    F -->|Answer Q1..Q5 + analyzing strip completes| G{All 5 answered AND on finalize view?}
    G -->|No| F
    G -->|Yes » reportId = randomUUID(); deriveAnalysis(); session.analysis set| H["/diagnosis/ready"]
    H -->|Enter email| I{Valid email?}
    I -->|No » inline error| H
    I -->|Yes » session.account.email set; TODO email backend| J["/report/:reportId"]
    J --> K((Report shown))
```

Notes: with `VITE_HAIRHEALTH_API_URL` set and photos available, step G runs `analyzeHair` (async) instead of the synchronous local path (BR-AN-11); on any failure it falls back to `deriveAnalysis` and still lands on `/diagnosis/ready`.

---

## UF-02 — Diagnosis step guards & resume

**Purpose:** what happens on direct URL entry / refresh. **Source:** `redirectForStep` (`src/app/routes/diagnosis/guards.ts`).

```mermaid
flowchart TD
    Start[Direct nav to /diagnosis/:step] --> S{step?}
    S -->|intro or gender| OK((render step))
    S -->|photos| G1{gender set?}
    G1 -->|no| RG["» redirect /diagnosis/gender"]
    G1 -->|yes| OK
    S -->|analyzing| G2{gender set?}
    G2 -->|no| RG
    G2 -->|yes| P1{≥1 photo?}
    P1 -->|no| RP["» redirect /diagnosis/photos"]
    P1 -->|yes| OK
    S -->|ready| A1{analysis present?}
    A1 -->|no| RA["» redirect /diagnosis/analyzing"]
    A1 -->|yes| OK
```

- Refresh mid-questionnaire: answers persist (`sessionStore`), the local step counter resets to 0 but answered questions are pre-filled and the strip re-gates on `allAnswered`.
- The guard needs **≥1** photo, but `/diagnosis/photos` won't let you *continue* without **4** (BR conflict → OQ-UX-1). So the "analyzing with 1–3 photos" state is only reachable by typing the URL.

---

## UF-03 — Photo capture

**Source:** `PhotoUpload.tsx`, `downscaleImage.ts`, `persistence.ts`. Rules: BR-MD-01…04.

```mermaid
flowchart TD
    A[Tap a photo slot] --> B[OS file / camera picker]
    B --> C{File chosen?}
    C -->|no| A
    C -->|yes| D{type starts with image/?}
    D -->|no » inline alert 'photo.error.type'| A
    D -->|yes| E{size ≤ 15 MB?}
    E -->|no » inline alert 'photo.error.size'| A
    E -->|yes| F[busy: downscale full + 256px thumb]
    F -->|error » 'photo.error.generic'| A
    F -->|ok| G[putBlob uuid, full blob]
    G --> H{replacing an existing photo?}
    H -->|yes| I[deleteBlob old blobId - best effort]
    H -->|no| J
    I --> J[onAdd: id, angleKey, thumb, blobId]
    J --> K((slot shows thumbnail + Remove))
    K -->|Remove| L[deleteBlob then onRemove id]
    L --> A
```

---

## UF-04 — Analyzing + questionnaire (gated dual progress)

**Source:** `AnalyzingStep.tsx`, `AnalyzingStrip`, `QuestionCard`. Rule: BR-AN, FR-028/029.

```mermaid
flowchart TD
    A["/diagnosis/analyzing"] --> B[AnalyzingStrip ticks facets on a timer]
    A --> C["Question step (0..4)"]
    C -->|Select an answer » session.setAnswer; step++| C
    C -->|Back if step>0 » step--| C
    C -->|step == 5| D["Finalizing… view"]
    B --> E{gateReady = all 5 answered AND step ≥ 5 ?}
    E -->|no| B
    E -->|yes » strip reaches 100%, onComplete fires once| F[finish: guard finishedRef]
    F --> G[setReportId randomUUID]
    G --> H{hairhealth.ai configured?}
    H -->|no » deriveAnalysis synchronously| I[session.setAnalysis]
    H -->|yes » load photo blobs, analyzeHair; fallback to local on error| I
    I --> J(("navigate /diagnosis/ready"))
```

Reduced motion: enter/slide transitions disabled; content static.

---

## UF-05 — Email capture → report

**Source:** `ReadyStep.tsx`. Rule: FR-033/034.

```mermaid
flowchart TD
    A["/diagnosis/ready — teaser (scale, severity, N zones) + demo disclaimer"] --> B[Enter email]
    B --> C{EMAIL_RE match?}
    C -->|no » role=alert inline error| B
    C -->|yes| D[session.setEmail — pre-fills sign-up]
    D --> E["» // TODO: email backend (no send)"]
    E --> F(("navigate /report/:reportId"))
```

---

## UF-06 — Report view / not found

**Source:** `ReportPage.tsx`, `ReportView.tsx`, `ReportNotFound.tsx`. Rules: BR-RP, FR-036.

```mermaid
flowchart TD
    A["/report/:reportId"] --> B{reportId == session.reportId AND session.analysis ?}
    B -->|no| N["ReportNotFound: title + 'restart your diagnosis' CTA"]
    N -->|CTA| R(("/diagnosis"))
    B -->|yes| C["buildReport() → ReportModel (localized, pending-flagged)"]
    C --> D["ReportView: ribbon · cover · scan · regimen · actives · expectations · program · FAQ · CTA · disclaimers"]
    D -->|"CTA 'Start My Program'"| S(("/start?report=<id>"))
```

Unverified values (prices, effectiveness, timing, follow-up cost, m1/m3/m6 outcomes) render as `[PENDING: …]` chips (BR-PD-02).

---

## UF-07 — Account → plan → checkout → success → app

**Source:** `StartLayout.tsx`, `AccountStep`, `PlanStep`, `CheckoutStep`, `SuccessStep`, `redirectForStartStep`. Rules: BR-AU-08, BR-PR-02/03, BR-CO-01…05.

```mermaid
flowchart TD
    Entry["/start?report=<id>"] --> R{report resolvable? (session.reportId + analysis, matches ?report)}
    R -->|no| NR["'no report' state (+ DEV seed button)"]
    NR -->|DEV seed| Entry
    R -->|yes| G0{signed in?}
    G0 -->|yes| PLAN
    G0 -->|no| ACC["/start (account): email + password"]
    ACC -->|submit| V{valid email? pw ≥ 8? not duplicate?}
    V -->|no » inline error| ACC
    V -->|yes » auth.signUp; session.setEmail| PLAN["/start/plan"]
    PLAN --> P0["Recommended duration pre-selected + badged; 5 rows (prices [PENDING])"]
    P0 -->|choose duration » session.draftDurationDays| P0
    P0 -->|Continue| CHK{draftDurationDays set?}
    CHK -->|no| PLAN
    CHK -->|yes| CO["/start/checkout: summary + contact + card form + 'test UI' notice"]
    CO -->|submit| CV{card shape valid? (13-19 / MM/YY / 3-4)}
    CV -->|no » inline error| CO
    CV -->|yes| SP[submitPayment stub ~400ms]
    SP -->|throw (DEV forced)| CE["inline payment error; nothing saved"]
    CE --> CO
    SP -->|success| BP["buildProgram(): start=today, end=+durationDays, plan+analysis frozen; session.setProgram"]
    BP --> SU["/start/success: order id, duration, start date, 3 next steps"]
    SU -->|"CTA 'Go to my program'"| APP(("/app"))
```

Re-entry rules: signed in at `/start` → `/start/plan`; any `/start/*` with a `Program` already set → `/start/success`; `/start/*` while signed out → `/start`.

---

## UF-08 — Returning user sign-in (`/login`)

**Source:** `LoginPage.tsx`, `auth.signIn`. Rules: BR-AU-06/08.

```mermaid
flowchart TD
    A["/login: email + password"] --> B[submit]
    B --> C{account exists?}
    C -->|no » error 'not found'| A
    C -->|yes| D{digest matches?}
    D -->|no » error 'wrong password'| A
    D -->|yes » auth session set| E{session.program present?}
    E -->|yes| F(("/app"))
    E -->|no| G(("/"))
```

`/login` also linked from `/start` (account step) via "Sign in instead".

---

## UF-09 — Post-purchase daily loop (Today)

**Source:** `AppShell`, `AppToday`, `programProgress.ts`. Rules: BR-PR-04/05/07/09.

```mermaid
flowchart TD
    A["Open /app"] --> G{session.program? }
    G -->|no| H(("redirect /"))
    G -->|yes| I{auth.email?}
    I -->|no| J(("redirect /login"))
    I -->|yes| K["Today: 'Day D of total', progress bar, KPI strip (checklist / adherence% / next order)"]
    K --> L["Routine checklist: core + supporting tasks (core:N / support:N)"]
    L -->|toggle a task » completionLog[today] gains/loses key; label strikethrough| L
    K --> M{isReorderDue? (daysRemaining ≤ 21 or ended)}
    M -->|yes| N["Reorder card » CTA /start/plan"]
    M -->|no| O["(no reorder card)"]
    K --> P["Reminders card: 'coming soon' (stub, no scheduling)"]
```

---

## UF-10 — Progress photos & re-scan

**Source:** `AppProgress.tsx`, `AppRescan.tsx`. Rules: BR-PR-06/13.

```mermaid
flowchart TD
    A["/app/progress"] --> B["Add photo per angle (reuses PhotoUpload) » program.progressPhotos + blob"]
    B --> C["Compare: baseline (diagnosis photo) vs latest (progress photo) per angle"]
    C --> D["Timeline grouped by date, newest first"]
    A -->|"'Compare to baseline'"| E["/app/rescan"]
    E --> F{programDay ≥ 90?}
    F -->|no| G["Locked: 'Available in (90 − day) days'; CTA disabled"]
    F -->|yes| H["'Start a new analysis' → /diagnosis"]
    E --> I["Baseline vs latest photo grid per angle"]
    H --> J(("/diagnosis (full funnel again)"))
```

`GAP`: no `deriveRescan` delta / Before/After metric comparison (FR-074).

---

## UF-11 — Care-team messages

**Source:** `AppCare.tsx`, `CARE_MESSAGES`. Rule: BR-PR-08.

```mermaid
flowchart TD
    A["/app/care"] --> B["Show messages where unlockDay ≤ programDay"]
    B --> C["Day 1 always; +14 at day≥14; +45; +90; +180"]
    A --> D["Compose form (textarea + Send)"]
    D -->|submit| E["role=status: 'care team will reply here (not connected in this preview)'"]
    E -->|nothing sent| D
    A -->|link| F(("/app/rescan"))
```

---

## UF-12 — Reorder / renewal prompt

**Source:** `isReorderDue`, `reorderDate`, `AppToday`. Rule: BR-PR-05.

```mermaid
flowchart TD
    A["Program running"] --> B{today ≥ endDate − 21  OR  program ended?}
    B -->|no| C["No prompt"]
    B -->|yes| D["Reorder card on /app: 'time to reorder' + body"]
    D -->|"CTA 'Reorder my next stage'"| E(("/start/plan"))
    E --> F["Full plan+checkout flow again (no renewal shortcut implemented)"]
```

---

## UF-13 — Product shop → bag → stubbed checkout → success

**Source:** `Products.tsx`, `cart.tsx`, `BagPage`, `BagCheckout`, `BagSuccess`. Rules: BR-CO-06/07.

```mermaid
flowchart TD
    A["/products (17 SKUs, category filter)"] -->|"Add to bag" » cart.add(sku), qty clamp 1–20, 'Added' flash| A
    A -->|nav| B["/bag: line items, qty steppers, remove; prices [PENDING]; summary [PENDING]"]
    B -->|empty| C["Empty state + 'Browse products'"]
    B -->|"Checkout"| D["/bag/checkout: contact + card form + summary"]
    D -->|empty cart & not placed| E(("redirect /bag"))
    D -->|submit| F{card shape valid?}
    F -->|no » inline error| D
    F -->|yes| G[submitPayment stub ~400ms]
    G -->|throw (DEV forced)| H["inline payment error"]
    H --> D
    G -->|success| I["setPlaced; navigate /bag/success (state.orderId); cart.clear()"]
    I --> J["/bag/success: 'bag-…' order id + next steps + links to /products, /"]
    J -->|no state.orderId on direct visit| K(("redirect /products"))
```

---

## UF-14 — Locale toggle

**Source:** `LocaleProvider`, `LocaleToggle`. Rules: BR-LO-01…06.

```mermaid
flowchart TD
    A["Any page (locale = he default)"] -->|"Tap locale toggle"| B["setLocale('en' | 'he')"]
    B --> C["localStorage['roote.locale'] updated"]
    C --> D["<html lang> + <html dir> updated; document.title from meta.title"]
    D --> E["All t(key) copy re-renders; RTL ⇄ LTR; Intl formatting switches he-IL ⇄ en-US"]
    E --> F((Same route, new language))
```

---

## UF-15 — Error recovery

Consolidated failure/edge paths (all implemented unless noted).

```mermaid
flowchart TD
    subgraph Routing
      R1["Unknown route /*"] --> R2(("redirect /"))
      R3["/report/:id with wrong id"] --> R4["ReportNotFound → CTA /diagnosis"]
      R5["/start/* without report"] --> R6["'no report' state (+ DEV seed)"]
      R7["/app/* without program"] --> R8(("redirect /"))
      R9["/app/* without auth.email"] --> R10(("redirect /login"))
      R11["/start/checkout without draftDurationDays"] --> R12(("redirect /start/plan"))
      R13["/bag/checkout empty cart"] --> R14(("redirect /bag"))
      R15["/bag/success no orderId"] --> R16(("redirect /products"))
    end
    subgraph Forms
      F1["Invalid email / weak pw / duplicate"] --> F2["inline role=alert; no navigation"]
      F3["Bad card shape"] --> F4["inline error; submit blocked"]
      F5["Stub payment failure (DEV: roote.debug.forceCheckoutFailure=1)"] --> F6["inline payment error; nothing persisted; retryable"]
    end
    subgraph Providers
      P1["hairhealth.ai request fails"] --> P2["console.warn; fall back to deriveAnalysis; user proceeds"]
      P3["localStorage write fails (quota)"] --> P4["lsSet catches + warns (GAP: no photo eviction)"]
      P5["prefers-reduced-motion"] --> P6["all animation disabled; content static"]
      P7["No JS"] --> P8["reveal-gated content stays visible; router needs JS (SPA)"]
    end
```

---

## Flow coverage vs. requirements

| Flow | Primary FR | Business rules |
|---|---|---|
| UF-01 | FR-021…FR-035 | BR-AN-* |
| UF-02 | FR-030, FR-035 | — |
| UF-03 | FR-025, FR-026 | BR-MD-01…04 |
| UF-04 | FR-028, FR-029, FR-031, FR-032 | BR-AN-11 |
| UF-05 | FR-033, FR-034 | — |
| UF-06 | FR-036…FR-044 | BR-RP-*, BR-PD-* |
| UF-07 | FR-046…FR-060 | BR-AU-08, BR-PR-02/03, BR-CO-01…05 |
| UF-08 | FR-046a…FR-048a | BR-AU-06/08 |
| UF-09 | FR-061…FR-066, FR-076…FR-079 | BR-PR-04/07/09 |
| UF-10 | FR-068…FR-074 | BR-PR-06/13 |
| UF-11 | FR-070, FR-071 | BR-PR-08 |
| UF-12 | FR-065, FR-078 | BR-PR-05 |
| UF-13 | FR-011a…FR-020a | BR-CO-06/07 |
| UF-14 | FR-081, FR-082 | BR-LO-01…06 |
| UF-15 | FR-030, FR-057, FR-088, NFR-010, NFR-020 | BR-CO-03, BR-MD-05, BR-LO-05 |
