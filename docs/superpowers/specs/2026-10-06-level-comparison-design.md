# Level 6 / 10 / 15 Comparison — Design

Date: 2026-10-06 · Status: draft for review · Scope: first slice of the "make ROOTÉ easier to understand" request

## Goal

A first-time visitor should understand the difference between Level 6, Level 10 and Level 15 within a few
seconds, without medical knowledge, and should understand that different people suit different levels —
Level 15 is **not** "better". The comparison must also explain, briefly, what Minoxidil, Finasteride and DHT are.

## Decisions (agreed with the client)

- **Scope:** Level comparison first. Out of scope (separate specs later): the 11-section product-page template,
  the full education hub, Gray Serum / Gray Support / Shampoo explainers, real photo/video/before-after assets.
- **Claim level:** *mechanism only.* Explain how each ingredient is understood to work; no results promises,
  no efficacy %, no time-to-results (brief §9, CLAUDE.md hard rule 1).
- **Approach A:** one shared `LevelComparison` view-model + renderer reused on `/products` and the three Level
  pages (and later the education hub). Not bespoke per-page blocks.
- **All copy is original ROOTÉ wording** (minoxidilmax.com / heyhair.co used for understanding only, never copied).

## Facts used (from `src/content/products.ts`, not retyped)

| | Level 6 (`density-6`) | Level 10 (`density-10`) | Level 15 (`density-15`) |
|---|---|---|---|
| Minoxidil | 6% | 10% | 15% |
| Finasteride | 0.3% | 0.1% | 0.1% |
| Extras | none | Azelaic Acid 5%, ABN Complex 0.8% | Azelaic Acid 5%, ABN Complex 0.8%, Retinol 0.025%, Caffeine 0.001% |

**Finasteride is highest in Level 6, not Level 15.** The comparison must never imply a single rising scale;
Minoxidil and Finasteride are separate rows.

## 1. Content model — `src/content/levelComparison.ts`

Pure (no React / DOM / storage / i18n provider — hard rule 3). Exports a typed `LEVEL_COMPARISON`, derived from
the existing `products.ts` entries so numbers cannot drift from the label.

- Per level: `slug`, `tagline` (6 "Lower Minoxidil level", 10 "Stronger / advanced level", 15 "Highest Minoxidil
  level"), `suits` (≤2 short lines, "who it may suit").
- Rows: Minoxidil %, Finasteride %, Extras (ingredient + one-line plain-language purpose, mechanism only).
- `notARanking` note: higher is not always better; different people need different levels; all three require
  medical review → nudge to talk to a clinician.
- Education snippets `what-is-minoxidil`, `what-is-finasteride`, `what-is-dht` (2–3 sentences each, mechanism only).
- Every `LocalizedText` is six-locale (`en/he/ar/ru/fr/es`); passes `pnpm content:check`.
- `suits` and the snippets carry `claimStatus: 'working'`. `suits` is drafted generically from each product's
  existing `role` field ("entry / lower-strength" etc.). **No invented patient profiles** (e.g. no Norwood stages).
- Missing/unsupplied values resolve to `PENDING()` → `[PENDING: label]`.

## 2. Renderer & placement

`src/app/components/marketing/LevelComparison.tsx` — receives the resolved view-model only (hard rule 4); no
`roote.config` access, no `t()` for domain content.

Desktop: three columns. Each: product photo (`src/assets/products/Level N.png`), name, tagline; Minoxidil
fill-meter (6/10/15); separate Finasteride mini-meter (0.3/0.1/0.1); Extras row with ingredient icons from
`src/assets/ingredients/` ("None added" for Level 6); a short "may suit" card. **No "best / recommended" badge on
any column.** Beneath: a calm "Different people, different levels" strip + "Start your hair analysis" button.

Mobile: single swipeable/tabbed column, reusing the Products page's existing `LevelSelectorControls` +
`useSwipe` pattern. Layout uses logical utilities only (`ms/me/ps/pe`, `text-start`) — hard rule 5.

Motion (via `motion`): meters fill once on scroll-in; `prefers-reduced-motion` renders them already filled
(`useReducedMotion`).

Placement:
- `/products`: new section under the hero, before the bundle section.
- Each Level product page: after the "Fit" section, current level outlined neutrally (not a "winner" style).
- Minoxidil / Finasteride / DHT education snippets as short expandable cards under the comparison, with a small
  SVG follicle/DHT illustration.

## 3. i18n, pending, verification

- Chrome strings added to `src/i18n/messages/en.ts` and the same keys in `he/ar/ru/fr/es` (real first-pass
  translations, `he` as reference; legal/medical-sounding lines flagged "pending formal legal review"). Hard rule 2.
- Photo, before/after and video slots are explicit pending slots in the view-model, listed by `collectPending()`.
- **Not touched:** analysis engine, `recommendedDurationDays`, checkout, prices.
- **Verification (no test suite, by design):** `pnpm typecheck` = 0 diagnostics; `pnpm i18n:check` and
  `pnpm content:check` green; `pnpm build` succeeds; manual browser check of `/en/products` and the three Level
  pages at desktop + phone width in `en` and `he` (RTL), including reduced motion. Unverified items are reported
  as such.

## Open items for the client

- Approve (or replace) the drafted `suits` lines and education snippets (`working` status).
- Supply approved real product/lifestyle photos, any before/after assets and videos, or leave the slots pending.
  Before/after imagery must be real, consented client results.
