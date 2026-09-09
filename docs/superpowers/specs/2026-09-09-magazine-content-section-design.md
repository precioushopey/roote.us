# Magazine Content Section — Design Spec

**Date:** 2026-09-09
**Status:** Draft for review
**Source:** Ilay (product owner, "ROOTÉ" WhatsApp group, 2026-09-08) hand-drawn nav sketch + follow-up
message; brainstorming chat 2026-09-08/09.

---

## 1. What this is

The last of the items from Ilay's original nav-sketch message (visual identity, header nav, and the
bundle-discount "packages" item are already shipped — see memory). The header nav already has a
"Magazine" tab (`src/app/paths.ts` → `/magazine`), currently pointing at a `PagePlaceholder` stand-in
(`src/app/routes/marketing/Magazine.tsx`). This spec replaces that placeholder with the real page.

Ilay's exact requirement:

> "When you click on Magazine, you want a detailed content area that explains: Each active ingredient
> and what it does. How each ingredient works in the context of the hair. How long it usually takes for
> the process to work. Explanations about the pills. Explanations about the serums. Explanations about
> each product/treatment. Explanation of the hair loss process — why and how hair falls out."

Content sourcing is explicitly authorized by the product owner (via Ilay, confirmed twice in chat):
source from competitors, "change it properly" (adapt, never copy verbatim), plus additional scientific
info, grounded in ROOTÉ's own real product/ingredient data.

## 2. Why this needed a design pass, not a quick build

CLAUDE.md's hard rule #1 (never invent product content — prices, effectiveness %, time-to-results,
medical copy stay `null`/`[PENDING]` until client-supplied) applies directly to most of what Ilay is
asking for. The product owner's authorization to source from competitors doesn't remove that
constraint — it only tells us *how* to fill in facts the client hasn't dictated verbatim, and the
constraint is regulatory, not stylistic (CLAUDE.md's own words). This spec exists to draw the line, in
writing, between what's safe to write directly and what must stay gated — so the implementation phase
has an unambiguous rule to follow per section rather than a judgment call per sentence.

**The good news, found during exploration:** ROOTÉ already has exactly the infrastructure this needs.
`src/content/products.ts` is itself described as "*working product-content architecture*: formula
references and ingredient territories are paraphrased from supplier / competitor material, never
copied, and carry a claim status so wording can be approved centrally." `src/content/claims.ts` defines
`ClaimStatus` (`'approved' | 'working' | 'requires-review'`) and `ClaimSourceType`, which **already
includes `'competitor-reference' — informed by a competitor page (never copied)`** — the exact sourcing
method Ilay authorized, already anticipated and typed. `containsForbiddenClaim()` already blocks
`clinically proven`, `100%`, `regrow your hair`, `permanent results`, etc. `IngredientCard`
(`src/app/components/roote/DomainCards.tsx`) already renders a `requires-review` note as a
`PendingChip` instead of plain copy, and already has an `onReadMore` prop that `/science`'s usage
passes a label for but never wires up — dead scaffolding this feature fills in.

This spec extends that existing system to a new content surface. It does not invent a new safety
mechanism.

## 3. Information architecture

**One hub page**, not a per-ingredient wiki. `/magazine` (already routed) becomes a single scrollable
page built from `Section` blocks, matching how `/science` is already structured — not 22+ separate
ingredient routes. Rationale: Ilay's list groups content at the topic level (ingredients-as-a-group,
pills, serums, products, hair-loss-science), a single hub is far less to author and maintain as the
catalog changes, and 4 of the 22 real ingredients are supplier-proprietary and already gated
`requires-review` — a dedicated page each would mostly render `[PENDING]`.

Sections, in reading order:

1. **Hero** — eyebrow + heading + intro paragraph. Standard marketing-page hero pattern (`Section
   tone="teal"`, matching every other marketing page post-retint — light taupe band, not dark).
2. **Why hair loss happens** — androgenetic alopecia / DHT pathway, follicle miniaturization. Genuine
   textbook/medical-consensus content, not brand-specific. `sourceType: 'ingredient-literature'`,
   `status: 'working'` — renders as normal copy, not gated.
3. **How results typically develop** — the timeline note. Real competitor sites were checked
   (minoxidilmax.com, heyhair.co — FAQ, product, and collection pages) and **none make an official
   brand claim about result timelines**; the only timeframes found anywhere were customer-review
   anecdotes (2-6 months, informal), which are a weaker source than a real brand claim and are
   explicitly not being used. Per the user's direction, this section instead draws on well-established,
   brand-independent medical literature on minoxidil/finasteride onset (commonly cited as ~3-6 months
   for visible results). `sourceType: 'ingredient-literature'`, `status: 'requires-review'` — renders as
   `[PENDING]` until reviewed/approved, same treatment the supplier-proprietary ingredients already get.
4. **The ingredient library** — reuses `PRODUCTS` (`src/content/products.ts`) as the sole data source,
   not a parallel content set. Deduplicate `Ingredient[]` across all 6 SKUs by `name` (22 unique
   ingredients today). Group into the same 4 categories `/science`'s `mechanisms` array already uses
   (DHT-pathway support, regrowth stimulation, pigment & nutrition support, scalp & hair conditioning)
   — reuse those category labels rather than invent new ones. Render each with `IngredientCard`. Each
   ingredient keeps its real, existing `claimStatus`/`sourceType` from `products.ts` — the Magazine does
   **not** override or upgrade any ingredient's status. The 4 supplier-proprietary actives (Procapil®,
   Greyverse™, Darkenyl™, Capixyl™, all `requires-review` today) continue to render `[PENDING]`; no new
   copy is drafted for them here. For the ~18 non-proprietary ingredients, the Magazine writes a longer
   explanation than the catalog's one-line note (that's the section's actual value versus what
   `/science` already shows) — still `sourceType: 'ingredient-literature'` or `'competitor-reference'`
   as appropriate, still run through `containsForbiddenClaim`.
5. **Pills, serums & topicals** — one short explainer per real `ProductFormat` value
   (`'capsule-supplement' | 'serum' | 'topical-solution' | 'shampoo'`, the enum `products.ts` already
   defines) covering how that delivery format generally works for hair/scalp care. Format-level, not
   brand-specific — `sourceType: 'ingredient-literature'`.
6. **Each ROOTÉ treatment** — one short teaser per SKU (6 today, derived by iterating `PRODUCTS` so it
   never drifts from the real catalog), linking to its real `/products/:slug` page. Teaser only — does
   not duplicate `ProductDetail`'s full copy.
7. **Closing CTA** — matches the pattern every other marketing page uses post-retint (light taupe
   band, emerald button, `EXTERNAL_ASSESSMENT_URL`).

## 4. Data model

New file `src/content/magazine.ts`, structured like `products.ts`/`bundles.ts` (a typed array/object of
`LocalizedText` fields, `as const` where applicable, a header comment stating the sourcing rule). Holds:

- Hair-loss-science copy (section 2).
- The timeline `Claim` (section 3) — built with the existing `claim()` helper from `claims.ts`, status
  `'requires-review'`, `sourceType: 'ingredient-literature'`, a `reviewNote` pointing at "onset timeline
  for topical minoxidil/finasteride, general medical literature — confirm wording with legal before
  publishing."
- The 4 ingredient-category groupings (label + which ingredient names fall in each) — mirrors
  `/science`'s existing category split so both pages agree.
- The ~18 non-proprietary ingredients' longer Magazine-specific explanations, keyed by ingredient
  `name` so they can be looked up against `PRODUCTS`' deduplicated ingredient list. **Not** a full
  duplicate `Ingredient` record — just the added explanatory text, since name/claimStatus/sourceType
  stay owned by `products.ts`.
- The 4 format explainers (section 5), keyed by `ProductFormat`.
- Product teaser copy (section 6) — one short `LocalizedText` per SKU, or derived generically from
  each `Product.role`/`shortDescription` already in `products.ts` if a dedicated teaser turns out to be
  redundant (implementation-time call, not a design blocker either way).

**No changes to `products.ts` or `claims.ts` themselves** — this is additive, consuming their existing
exports.

## 5. UI

- `src/app/routes/marketing/Magazine.tsx` — replace the `PagePlaceholder` body with the real sections,
  built from `Section`/`DisplayTitle`/`Prose`/`Eyebrow`/`IngredientCard`/`Button`, the same primitives
  every other marketing page already uses. No new primitive components needed.
- `IngredientCard`'s `onReadMore` — wire it up on `/science` (`Science.tsx`) to navigate to
  `/magazine#ingredients` (or the specific ingredient's anchor, if that's easy — a page-level anchor is
  the minimum bar). This connects two pages that were clearly meant to reference each other; the prop
  has existed, unconnected, since `/science` was built.
- Timeline note (section 3) renders via the existing `PendingChip` pattern, exactly like a `null` price
  or a `requires-review` ingredient note does today — no new pending-UI needed.

## 6. i18n

All new copy needs real EN + HE keys (parity enforced by `src/i18n/messages.test.ts`, which fails on
any empty value). This is a substantial amount of real writing: the hair-loss-science paragraph, the
timeline note, ~18 expanded ingredient explanations, 4 format explainers, up to 6 product teasers — all
in both languages. This content is drafted during implementation, not during this brainstorm.

## 7. Testing

- Extend `src/content/content.test.ts`'s existing "carries no forbidden marketing claim in any copy"
  pattern to also cover the new `magazine.ts` content (reuse `containsForbiddenClaim` + the existing
  `localizedStrings()` walker already in that test file).
- A new integration test (new file or extend `wp4pages.test.tsx`) rendering `/magazine` and asserting:
  every section heading is present; a known supplier-proprietary ingredient (e.g. Procapil®) renders
  `[PENDING]`, not plain copy; the timeline note renders `[PENDING]`; a known non-proprietary ingredient
  (e.g. Minoxidil) renders real copy, not `[PENDING]`; each of the 6 products has a working link to its
  real `/products/:slug` page.
- `Science.test.tsx` (if it exists) or a new assertion: `onReadMore` on `/science`'s ingredient cards
  navigates to `/magazine`.
- Full `pnpm typecheck` + `pnpm test` green, as with every change this session.

## 8. Explicitly out of scope for this spec

- Anything from Ilay's message not related to Magazine content (visual identity, nav, packages — all
  already shipped separately).
- A per-ingredient dedicated page/route (rejected in favor of the single hub, §3).
- Upgrading any ingredient's `claimStatus` — that's a legal/product-owner sign-off action, not something
  this feature does.
- Getting the supplier-proprietary ingredients (Procapil®/Greyverse™/Darkenyl™/Capixyl™) out of
  `requires-review` — unchanged, still `[PENDING]`.
- A visual redesign of `/science` beyond wiring `onReadMore`.
