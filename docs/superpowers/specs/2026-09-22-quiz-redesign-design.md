# Quiz Redesign — /analysis Reconnect + v3.1 Content Migration — Design Spec

**Date:** 2026-09-22
**Status:** Draft for review
**Source:** `ROOTE_Questionnaire_Flow_Full_Specification_EN_v3_1_FINAL (1).docx` (product-owner-supplied,
"Version 3.1 • September 2026"), cross-referenced against the WhatsApp threads reviewed this session
("ROOTÉ" and "ROOTÉ & HairAI") and the live `roote.us` site, plus a full read of this repo's existing
`src/domain/analysis/`, `src/domain/recommendation/`, and `src/content/assessment.ts`.

---

## 1. What actually changes, in one paragraph

Marketing's "Start Free Hair Analysis" CTAs go back to routing into ROOTÉ's own `/analysis` flow
instead of the external Landbot test link (`EXTERNAL_ASSESSMENT_URL`), reversing the 2026-09-08
decision (`57cbd58`) per the Sept 8 spec's own conclusion that `/analysis` should remain "ROOTÉ's
actual product." `/analysis`'s question content and step order are then migrated to match the
product-owner-supplied v3.1 questionnaire spec: seven new questions added, a new image-based
hair-pattern-selection screen added, the step order changed to match v3.1, and every answer card
restyled from pill-shaped to rectangular per the spec's explicit instruction. The photo-capture step
stays, reframed as a progress-tracking record rather than an analysis input — which is what it already
is today, since `deriveAnalysis` has never used photos for severity.

---

## 2. Why this is a smaller lift than it looks

A full read of `src/domain/recommendation/` turned up something worth stating plainly: **the
commercially and regulatorily hardest part of the v3.1 spec is already built.**

- `hairGrowthTable.ts` already encodes the exact M1–M5/F1–F4 → concentration table the v3.1 spec
  defines (Male M1=15%/M2=10%/M3=6%/M4=10%/M5=6%; Female F1=6%/F2=6%/F3=10%/F4=15%), attributed to
  "Ilay, 2026-09-07" — one day before the Sept 8 Landbot detour, and clearly built against an earlier
  draft of the same questionnaire.
- `rules.ts` already gates it correctly: `productionActive: false` for the Hair Growth tier until
  clinical/regulatory approval, exactly matching v3.1 §5's instruction that these numbers "should not
  be published or activated without the required clinical, regulatory, and legal approval."
- Two of v3.1's own "Required Decisions Before Production" are already answered in code:
  **Gender = Other + Goal = Hair Growth → `REQUIRES_REVIEW`** (not an automatic pattern assignment,
  per `rules.ts` "client rule 4"), and **Goal = Other → `REQUIRES_REVIEW`, no product** (per the
  `other-requires-review` rule).
- `PHOTO_ANGLES` (front/top/crown/hairline) already exactly matches v3.1's 4-photo set.
- `HealthCondition` (`thyroid | anemia | autoimmune | cancer | glp1 | none`) already exactly matches
  v3.1 Step 11's six options.

So this spec is a **content-and-flow migration onto an existing, already-largely-correct engine**, not
a rebuild. §10 below is explicit about the two places where the existing code and the v3.1 doc actually
disagree, because those need your call before implementation.

---

## 3. Scope of this change

### In scope

1. Revert `paths.ts`/`Header.tsx`/`Footer.tsx`/marketing CTAs from `EXTERNAL_ASSESSMENT_URL` back to
   `PATHS.analysis`. `/hair-scan` and the Landbot embed stay exactly as they are — a separate,
   secondary lead-gen surface, per the Sept 8 spec's own original intent. No changes to
   `LandbotFullpageEmbed`, `remoteAnalysisAdapter`, or anything HairHealth.ai-related.
2. Reorder `ASSESSMENT_STEPS` and the `/analysis/*` routes to the v3.1 flow (§5).
3. Add seven new questions to `content/assessment.ts` and seven new fields to `Answers` (§6) —
   additive only; no existing `Answers` field is removed or renamed, so `deriveAnalysis`'s current
   logic keeps working unchanged.
4. Add a new "Visual Hair-Loss Pattern" screen (image-select cards, shown only when
   Goal = Hair Growth), using the M1–M5/F1–F4 line-art icons extracted from the v3.1 docx (§7).
5. Restyle assessment answer cards from pill-shaped to rectangular, repo-wide within `/analysis` (§8).
6. Reframe (copy only) the existing photo-capture step as a baseline/progress record, not an analysis
   input — no logic change, since `deriveAnalysis` already ignores photos.
7. This spec, plus an explicit "Required Decisions" list (§10) for you to rule on before a plan is
   written for any of the genuinely open items.

### Out of scope

- Anything under `/hair-scan` or the Landbot integration.
- Changing `deriveAnalysis`'s actual severity/stage logic, `hairGrowthTable.ts`'s concentrations, or
  flipping `productionActive` to `true` for the Hair Growth tier — that flip needs the clinical/
  regulatory/legal approval the existing code comments already say is pending, independent of this spec.
- Questions 12 & 13 as named in the v3.1 source document — see §10, they have no content to build from.
- A chat-bubble UI (decided against — keeping the existing wizard stepper).
- Backfilling real prices into `catalog.ts` (separate, already explicitly deferred by you).

---

## 4. Current state (for reference)

| | Today |
|---|---|
| Marketing CTA target | `EXTERNAL_ASSESSMENT_URL` = `https://roote.vercel.app/test/landbot/fullpage`, opens in a new tab |
| `/analysis` step order | `intro → gender → goal → photos → scanning → questions → results → report` |
| `Answers` fields | `q1_area`, `q2_onset`, `q3_prior`, `q4_family`, `q13_progression` |
| Answer-card shape | Rounded/pill (per current `AnalysisShell` card components) |
| Hair-pattern input | Self-reported via `q1_area` (hairline/crown/entire-scalp) + `q2_onset`, no image picker |

---

## 5. New step order (v3.1 §2, adapted)

```
intro
  → gender                (existing: Male / Female / Prefer not to say → packaging)
  → age                   (NEW)
  → previous-products     (NEW)
  → satisfaction          (NEW, conditional: only if previous-products = Yes)
  → goal                  (existing: 5 options, unchanged)
  → pattern               (NEW, conditional: only if goal = Hair Growth — image-select, §7)
  → photos                (existing 4-angle capture, reframed copy only)
  → texture               (NEW)
  → family-history        (existing q4_family, unchanged, just moved later)
  → stress                (NEW)
  → vegetable             (NEW)
  → gray-level             (NEW — see §10 open item on whether this is always asked)
  → health-history         (existing HEALTH_HISTORY_QUESTION, unchanged)
  → scanning               (existing — the results-compute transition screen)
  → results
  → report
```

`onset` (`q2_onset`, "how long have you noticed hair loss") isn't a step in the v3.1 master flow at
all. It stays in the flow because `deriveAnalysis` uses it for `severityBand` and
`recommendedDurationDays` across *every* goal, not just Hair Growth — v3.1 is silent on program-duration
logic entirely, so removing it would break an existing, working part of the engine for no spec-driven
reason. Recommended placement: immediately after `pattern` (or after `goal` for non-hair-growth users),
framed as "how long has this been going on" — exact slot is a UI-writing detail, not an open decision.

---

## 6. New content additions

Seven new option sets in `content/assessment.ts`, seven new `Answers` fields in
`src/domain/analysis/types.ts` (additive — existing fields untouched):

| Screen | New `Answers` field | Type | Source |
|---|---|---|---|
| Age | `age_range` | `'18_29' \| '30_44' \| '45_64' \| '65_plus'` | v3.1 §3 Step 2 |
| Previous products | `previous_hair_products` | `boolean` | v3.1 §3 Step 3 |
| Satisfaction | `satisfied_previous_products` | `boolean \| null` | v3.1 §3 Step 3A (conditional) |
| Pattern | `hair_pattern_id` | `PatternCode \| null` (reuses the existing `PatternCode` type from `domain/recommendation/types.ts`) | v3.1 §3 Step 5 |
| Texture | `hair_texture` | `'straight' \| 'wavy' \| 'curly' \| 'coily'` | v3.1 §3 Step 6 |
| Stress | `stress_level` | `'mostly_peaceful' \| 'moderately_stressed' \| 'very_stressed'` | v3.1 §3 Step 8 |
| Vegetable intake | `vegetable_intake` | `'usually_none' \| 'one_two' \| 'three_plus'` | v3.1 §3 Step 9 |
| Gray level | `gray_hair_level` | `'none' \| 'few' \| 'about_half' \| 'mostly_all'` | v3.1 §3 Step 10 |

The seven non-pattern fields are **context/profile data only** in v3.1 — none of them feed
`deriveAnalysis`'s existing severity/stage math. `hair_pattern_id` is the one exception: whether and how
it feeds the existing stage/pattern math is exactly the open question in §10.1 below.

Recommended English copy for all seven is in v3.1 §7's table verbatim — translate to the other 5
locales following the existing `L6(...)` pattern and voice already used throughout `assessment.ts`.

---

## 7. New pattern-select screen

Shown only when `hair_goal === 'hair-growth'`, immediately after the Goal screen. Gender (already
captured in step 1) picks the image set: Male → M1–M5, Female → F1–F4. Copy: *"Which image looks most
similar to your current hair pattern? Select the closest match. You will be able to go back and change
your selection."* No auto-advance on this screen (v3.1 §6 is explicit: show a Continue button so the
user can review their selection before moving on — every other single-select screen in the flow can
auto-advance, this one shouldn't).

The nine line-art icons (M1–M5, F1–F4) were extracted from the v3.1 docx's embedded media and saved to
the scratchpad this session; they're already in ROOTÉ's cream/ink palette and match the brand system
closely enough to use as a strong starting reference, whether adopted directly (pending an asset-quality
check by whoever implements this) or redrawn to match `src/assets` conventions exactly.

---

## 8. Card-shape correction

v3.1 §6 is explicit that its own reference screenshots (which show fully rounded/pill-shaped answer
buttons) are **not** what should ship: *"Avoid the very rounded pill style shown in the reference
screenshots... cards should visually read as rectangles. A small radius is acceptable."* This applies
to every answer card in `/analysis`, not just the new screens — whoever implements this should check
the current shared card component(s) under `AnalysisShell`/`app/components/diagnosis` and correct the
border-radius there once, rather than per-screen.

---

## 9. Recommendation-engine changes

**None**, beyond the open decision in §10.1. `deriveAnalysis`, `hairGrowthTable.ts`, and `rules.ts` all
stay as they are. The new context fields (age, texture, stress, vegetable intake, previous-product use,
gray level) are stored on the session/answers object and available to the report layer for copy/context
(e.g. `buildReport` could eventually reference them), but nothing in this spec requires wiring them into
`RecommendationInput` — v3.1 itself marks them context-only.

---

## 10. Required decisions before a plan is written

Two of these are genuinely new tensions this spec surfaces; the rest are v3.1's own flagged
open items, carried forward rather than silently resolved.

### 10.1 Does the new pattern-select screen replace `q1_area`, or run alongside it? (new tension — needs your call)

Today, `q1_area` (hairline / crown / entire-scalp) plus `q2_onset` (how long) together produce `stage`,
which is then looked up into a pattern code (`patternCodeFor`). v3.1's pattern-select screen instead has
the user pick the pattern code **directly**, by image. Two reasonable options:

- **(Recommended) Pattern-select replaces `q1_area` for Hair-Growth-goal users.** The image choice
  becomes the direct `hair_pattern_id`, and `stage`/`scale` are derived from it (inverting today's
  stage→pattern lookup into a pattern→stage one) instead of from `q1_area`. Non-Hair-Growth-goal users
  never see this screen and never had `q1_area` asked of them either in the new flow's order, so nothing
  changes for them. `q2_onset` stays, independently, for `severityBand`/duration.
- **Keep `q1_area` and add pattern-select as a second, parallel input**, and decide a conflict-resolution
  rule if the two imply different severity. More UI, more edge cases, no clear benefit identified.

### 10.2 Health-history: single-select or multi-select?

v3.1 §3 Step 11 calls this **"OPEN DECISION / TBD"** in the source document. But this repo's own
`HealthCondition` type comment says it was **"client-confirmed multi-select"** on 2026-09-07 — a date
that predates the v3.1 doc's "September 2026" version date, so it's unclear whether v3.1 supersedes that
earlier confirmation or simply wasn't updated to reflect it. **Recommendation: keep the existing,
already-implemented multi-select behavior** (with `'none'` exclusive, as already enforced in
`sessionStore.setHealthHistory`) unless you tell me the v3.1 doc's "TBD" means the client wants to
revisit it.

### 10.3 v3.1's other open items — carried forward, not resolved here

- **Goal = "Other":** already `REQUIRES_REVIEW` in code (§2) — confirm this is sufficient, or whether
  v3.1 wants specific UI copy for that state.
- **Gender = "Other":** already `REQUIRES_REVIEW` when combined with Hair-Growth goal (§2) — v3.1 also
  asks which image set "Other" should see if it ever reaches the pattern screen; current code doesn't
  show the pattern screen to unspecified-gender users at all (no pattern set exists), which sidesteps
  the question. Flagging in case that's not the intended UX (e.g., maybe "Other" should get a choice of
  either image set).
- **Questions 12 & 13 (v3.1's numbering):** the source document supplied to the spec's authors has these
  as bare headings with no question text, options, or logic. **Out of scope** — nothing can be built
  from a heading. Not to be confused with this repo's existing `q13_progression` field (a fully-specified,
  already-implemented "how did your hair loss develop" question with real answer options) — that's a
  pre-existing, unrelated question that happens to share a number by coincidence.
- **Is Gray Level always asked, or only when relevant to the user's goal?** v3.1 marks it "Always in
  source draft" but flags the question itself. Recommendation: always ask (matches the source draft, and
  it's cheap context even for non-graying goals) unless you want it conditional on
  Goal = Slow Hair Graying.
- **"Aminoxi" vs "Minoxi" naming:** moot — `content/products.ts` and the live site both already use the
  real INCI name **Minoxidil**, not either invented brand-style name from the v3.1 doc. No action needed.
- **Clinical/regulatory approval of the 6/10/15% concentrations:** already correctly gated
  (`productionActive: false`) in existing code — this spec doesn't change that gate, and nothing here
  should be read as approval to flip it.

---

## 11. Testing plan

- `deriveAnalysis` and `domain/recommendation/*`: no behavior change expected for existing inputs; add
  coverage for the new `hair_pattern_id`→`stage` derivation once §10.1 is decided.
- New `content/assessment.ts` option sets: covered by the existing `pnpm content:check`/`pnpm i18n:check`
  six-locale parity gates, same as every other content addition this session.
- Route/step order: `AnalysisShell`'s guard functions (`redirectForAnalysisStep`) will need new step IDs
  added to their sequence — verify the existing photo-gate-inconsistency gotcha (CLAUDE.md: guard needs
  ≥1 photo, `/analysis/photos` requires all 4) isn't made worse by the reorder.
- CTA revert: update `Header.test.tsx`/`Footer.test.tsx`-equivalent coverage if it still exists post the
  "tests removed" note in CLAUDE.md — if not, manual verification in a browser is the fallback per this
  repo's current no-test-suite state.
- `pnpm typecheck` and `pnpm build` must stay clean, per repo rules.

---

## 12. What's explicitly NOT decided by this document

Per §10, implementation should not start on the pattern-select screen's exact wiring (§10.1) or the
health-history select type (§10.2) until you've ruled on them. Everything else in §5–§9 is specified
precisely enough to plan directly.
