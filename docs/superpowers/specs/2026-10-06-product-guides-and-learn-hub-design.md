# Product guides, learn hub and visuals — Design / build record

Date: 2026-10-06 · Follows `2026-10-06-level-comparison-design.md` (same claim level, same hard rules).

## What was built

1. **Per-product guide (11-section structure) for all six products** — `src/content/productGuides.ts`
   (`buildProductGuide(slug, locale)`), rendered by `src/app/components/marketing/ProductGuide.tsx` inside
   `ProductDetail.tsx`. Order: name + one-line "what it does" (hero) → key benefits/overview → **who it's for** →
   key actives (existing) → **how it works** → directions + **step-by-step how-to-use graphic** →
   supplement facts (existing) → **routine fit** (morning/evening/any-time/wash-day graphic + treatment/supportive/Gray
   map) → **comparison** (Levels: the shared `LevelComparisonSection`; others: a row per similar product) →
   **what to expect** → FAQ (product-specific questions first, then the existing accordion) → related → CTA
   ("Start free hair analysis").
2. **Education hub on `/magazine`** (`#learn`) — `src/content/education.ts` + `EducationHub.tsx`: how hair loss
   happens (growth-cycle + shrinking-follicle illustrations), what causes gray hair (pigment illustration),
   Gray Serum vs Gray Support (outside/inside), how the products work together (system map + routine), then the
   shared Level 6/10/15 comparison with Minoxidil / Finasteride / DHT explainers.
3. **Visual layer** — `ProductVisuals.tsx`: `HowToUseSteps`, `HairCycleDiagram`, `FollicleCompare`,
   `PigmentDiagram`, `GrayInOutDiagram`, `RoutineGraphic`, `SystemMap`. Inline SVG + product photos + lucide icons;
   scroll-in reveal with `prefers-reduced-motion` static fallback; logical (RTL-safe) utilities only.
4. 34 new `marketing.guide.*` / `marketing.learn.*` interface strings in all six locales.

## Rulings

- **Education lives in `/magazine`**, not a new route: that page already holds the hair-loss science and
  ingredient explanations; a second education route would compete with it.
- **Level pages: the shared comparison moved** from "after the Fit section" (first spec) to the *comparison*
  position (#8) to follow the client's 11-section order.
- **"Time to visible results" is always `[PENDING]`.** `roote.config.claims.timeToVisibleResults` ("3 to 6
  months") is an invented stand-in (TEMP-PLACEHOLDER) and must not appear on product pages.
- **Mechanism-only copy.** "Who it's for" lines are generic (derived from each product's existing `role`);
  no patient profiles, no efficacy. All new copy is `claimStatus: 'working'`, pending formal review.
- **Videos and before/after photos are explicit pending placeholders.** They must be real, approved,
  consented assets; none are generated or invented.
- **Step graphics condense the printed usage directions** per product format; no new instructions.

## Not done / needs the client

- Real product-lifestyle photos, short videos, before/after imagery (slots shown as `[PENDING]` placeholders).
- Review/approval of the drafted "who it's for", "how it works", "what to expect" and FAQ wording.
- A visual check in a browser (not possible in the session that built this).
