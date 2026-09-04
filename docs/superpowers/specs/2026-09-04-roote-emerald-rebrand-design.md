# ROOTÉ Emerald Rebrand — Design Spec

**Date:** 2026-09-04
**Status:** Draft for review
**Relation:** Retints the token/asset layer produced by the 2026-09 redesign (`docs/REDESIGN-PROGRESS.md`,
`docs/REDESIGN-COMPLETION.md`) — does not touch IA, copy, domain logic, or the funnel/report/app
routes those docs cover. No prior spec conflicts with this one.

---

## 1. Goal

Retint ROOTÉ's existing "deep-anchor + cream-base + gold-seam" token architecture from its current
cyan-leaning deep teal to a true deep emerald + gold + cream palette, matching the moodboard the
client supplied (deep forest green, brass/gold foil, editorial Didone serif, botanical/art-deco line
work — "elegance, trust, clinical"). Also add a second wordmark variant so the logo stays legible on
the new dark-emerald surfaces.

This is explicitly **a retint, not a rebuild**: `theme.css` already implements a dark-anchor /
cream-base / gold-accent system (comment: *"deep-teal science surfaces, warm-cream 'you' surfaces,
gold only at the seam"*), and `src/assets/logo.png` is already a high-contrast Didone serif with a
swash flourish in a metallic gradient. The client's brief is a hue and depth shift on an
already-correct structure, not a new design language.

### Non-goals

- No change to information architecture, routes, copy, i18n keys, or domain logic (`src/domain/**`,
  `src/content/pending.ts`). Hard rules 1–4 in `CLAUDE.md` are unaffected.
- No typeface swap. Bodoni Moda (display) / Montserrat (body) stay; see §4.
- No dark-mode toggle. The app remains light-only in practice; `.dark` stays a defined-but-unwired
  block, retinted for consistency only.
- No redesign of layout, spacing, or component structure — this is colour + one asset, applied
  through existing Tailwind utility classes.
- No new botanical/art-deco illustration system. The moodboard's line-art motifs are noted as a
  possible future decorative layer (§7) but are **not** part of this spec's scope.

---

## 2. Locked scope decisions

| Decision | Choice |
|---|---|
| Emerald dominance | **Anchor, not dominant.** Deep emerald owns hero bands, header, footer, AppShell sidebar, CTAs, dividers. Cream stays the working background for the questionnaire, report, checkout, and AppShell content pane. |
| Typography | **Recolor + restyle within the current system.** Keep Bodoni Moda/Montserrat; lean into small-caps eyebrow labels and thin gold rule-dividers on marketing headers rather than swapping faces. |
| Wordmark | Keep the existing Didone/flourish logo art. Add a second, light gold/cream-on-transparent export for dark-emerald surfaces; keep the current bronze export for cream surfaces. |
| Primitive renaming | Rename `--roote-teal-*` → `--roote-emerald-*` (and `primitives.teal950` → `emerald950`, etc.) for codebase honesty — the "teal" name would now be actively misleading. Tailwind-facing utility names (`bg-deep-950`, `text-ink`) are already hue-agnostic and are unaffected. |
| Contrast bar | Every retinted pairing must meet or beat the ratio the value it replaces already met (documented inline in `theme.css`/`tokens.ts` today, e.g. "F6EFE4 on 062E31 ≈ 13:1"). No regressions, verified numerically before merge — not eyeballed. |

---

## 3. Palette

### 3.1 Primitive scale — proposed values

| Primitive (renamed) | Current (teal) | Proposed (emerald) | Notes |
|---|---|---|---|
| `emerald-950` | `#062E31` | `#0A2A1C` | Hero/nav/footer/sidebar anchor. Similar overall luminance to current value (channel sum 80 vs 101) → contrast with cream text expected ≥ current ~13:1; verify exactly. |
| `emerald-900` | `#093A3D` | `#123726` | Card surfaces on dark (e.g. AppShell sidebar hover/active). |
| `emerald-800` | `#0D494C` | `#1B4B32` | Primary CTA fill. **Closest call for contrast** — verify cream-50-on-this meets ≥ 4.5:1 before lock; adjust darker if it falls short. |
| `emerald-700` | `#155A5D` | `#235E3F` | Secondary/border states. |
| `emerald-600` | `#1F6D6F` | `#34805A` | Hover/lighter accents, chart series. |
| `cream-50…300` | `#FCF9F3` … `#E6DAC6` | **unchanged** | Already matches the moodboard's "Albino" cream (`#FCF1EA`) closely. |
| `gold-500` / `gold-600` | `#C6A15A` / `#A98343` | **unchanged** | Already matches the moodboard's "Pyramid Gold" (`#E6B373`) family; the existing "non-text / ≥24px only" contrast rule (≈2.3:1) carries forward unchanged. |
| `ink`, `body`, `muted` | `#172022` / `#333A3C` / `#6F7676` | **unchanged** | Neutral text scale is hue-independent; no reason to move it. |

### 3.2 Semantic mapping

Unchanged shape — `--background`, `--primary`, `--ink`, `--sidebar`, etc. keep pointing at the same
*roles* in the primitive scale (`background: emerald-cream-50`, `primary: emerald-800`,
`ink: emerald-950`, …). Only the primitive values move; `.dark` block gets the same retint for
consistency even though nothing toggles it today.

### 3.3 Verification plan

Before values are locked in implementation: compute WCAG 2.1 contrast ratios for every text/background
pairing currently documented with a ratio in code comments, using the same method (relative luminance)
already referenced in `theme.css`. Any pairing that regresses gets its emerald value darkened/lightened
until it matches or beats the original — the hexes above are a starting proposal, not final.

---

## 4. Wordmark & display type

- **Logo asset:** `src/assets/logo.png` (bronze gradient, Didone + flourish) stays as the "on cream"
  export. A second export — same artwork, gold/cream gradient — is added for "on emerald" contexts
  (e.g. `logo-reversed.png` or an SVG if the source file is available/recoverable).
- **`Wordmark.tsx`** gains a `tone` prop (`'default' | 'reversed'`, default `'default'`) selecting
  which asset to render. The 6 current production call sites (`Header`, `Footer`, `FunnelShell`,
  `AppShell`, `AnalysisShell`, `ReportView`) get audited during implementation and set explicitly per
  the surface they render on (dark anchor → `reversed`, cream → default); `brand.test.tsx` is updated
  to cover both tones.
- **Display type:** Bodoni Moda stays. Editorial reinforcement (not a font change): small-caps
  tracked-out eyebrow labels above marketing headings, thin gold hairline rules as section dividers —
  both achievable with existing `font-display`/`--accent` tokens and no new type assets.
- **RTL/Hebrew:** Frank Ruhl Libre (HE display) is unaffected — it's already a comparable
  high-contrast serif; no change needed there.

---

## 5. Application map

| Surface | Treatment |
|---|---|
| `MarketingShell` header (condensed + expanded) | Emerald anchor, reversed wordmark, gold nav-active state |
| `MarketingShell` footer | Emerald anchor, reversed wordmark |
| Marketing hero bands / dark editorial sections | Emerald anchor (existing `.ink`/`bg-deep-950` usage) |
| Marketing body sections (most of Home, How It Works, Science, About, FAQ, Support) | Cream base, unchanged |
| `FunnelShell` (login, diagnosis, start) | Wordmark only, on cream — default wordmark, no anchor band |
| `/report/:reportId` | Cream base for report content; default wordmark in its inline header |
| `AppShell` sidebar | Emerald anchor, reversed wordmark, gold active-item indicator |
| `AppShell` content pane (Today/Plan/Care/Rescan/Profile) | Cream base, unchanged |
| Buttons/CTAs everywhere | Emerald fill + gold ring/hover (primary), gold reserved for non-text accents per existing rule |
| Bag/checkout | Cream base; emerald/gold only on CTA + header/footer (already covered above) |

---

## 6. Files touched

- `src/styles/theme.css` — primitive rename + retint, `.dark` block retint
- `src/styles/tokens.ts` — mirrored rename + retint
- `src/styles/tokens.test.ts` — updated pinned hex assertions
- `src/styles/marketing.css` — `var(--roote-teal-950)` → `var(--roote-emerald-950)` (2 references)
- `src/app/components/brand/Wordmark.tsx` — `tone` prop, dual asset
- `src/assets/` — new reversed logo export
- 6 call sites of `<Wordmark>` — explicit `tone` per surface (§4)
- `CLAUDE.md` — palette line under "Styling" currently says ivory/taupe/brass, already stale
  against the shipped teal system; update to describe the emerald system while this work lands

## 7. Out of scope, noted for later

The moodboard's botanical line-art (thin gold leaf/sprig motifs, arches, star-burst dividers) and any
packaging-style illustration system are a decorative layer beyond token/asset work. Worth a follow-up
spec once the palette retint has shipped and been seen in the live app, not bundled here.

---

## 8. Testing impact

- `tokens.test.ts` — hex assertions updated to match new values (still pinned, still exact).
- `pnpm typecheck` — unaffected (no type shape changes beyond the new `Wordmark` prop, which is
  optional with a default).
- No i18n, `pending.ts`, or domain-layer tests are touched; EN/HE parity and pending-content
  enforcement are unaffected by a token-only change.
- Visual check: run the app and eyeball every surface in §5 post-retint (no automated visual
  regression tooling exists in this repo).
