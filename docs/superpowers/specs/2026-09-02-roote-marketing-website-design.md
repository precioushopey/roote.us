# ROOTÉ Marketing Website — Design Spec

**Date:** 2026-09-02
**Status:** Draft for review
**Supersedes:** the single-page `Landing` route (P0/P1). Wraps, and does not modify, the existing
diagnosis → report → `/start` funnel (P0–P2b, branch `roote/p2b` @ `2a4ffb6`).

---

## 1. Goal

Turn ROOTÉ's single concept landing page into a **complete multi-page marketing website** whose
page set and section content mirror **mdhair.co**, rendered in a **luxury-editorial design language**
derived from the Dribbble reference *"Luxury Jewelry E-commerce Landing Page"* (Ardent Atelier) and
ROOTÉ's own wordmark. The site is bilingual (EN/HE, RTL), concept-grade (no backend, `noindex`,
pricing/efficacy remain `[PENDING]`), and drives one action: **Start free analysis → `/diagnosis`**.

### Non-goals

- No real CMS, backend, auth, payment, analytics, or email. The contact form is a visible stub.
- No real pricing, clinical numbers, testimonials, advisory-board identities, press placements,
  guarantees, or legal copy — all render as `[PENDING: …]`.
- No changes to `/diagnosis`, `/report/:reportId`, `/start/*`, or their `sessionStore`/i18n. The
  funnel keeps its minimal shell.
- No SEO work; `index.html` stays `noindex, nofollow`.
- P2c (`/app`) is out of scope; the site links to `/app` where mdhair would link to a dashboard and
  that link 404s→`/` until P2c exists (documented, not fixed here).
- Professional Hebrew copy review is deferred (batched into the existing scheduled review); this
  spec produces first-pass HE translations for every key.

---

## 2. Locked scope decisions

| Decision | Choice |
|---|---|
| Page set | **Full mdhair.co mirror** — Home, How It Works, Science, Products, Results & Reviews, About, FAQ, Support, Blog (index + 3–4 posts), Terms, Privacy |
| Bilingual | **Full EN/HE parity** — every page, FAQ entry, and blog post in both languages, enforced by `messages.test.ts` |
| Copy source | **Claude drafts all copy** (concept-grade, EN + HE); every hard claim (stat, price, guarantee, study result, named testimonial, advisory name, press logo) renders `[PENDING: …]` |
| Motion | **Rich** — parallax hero + product imagery, pinned/scrubbed how-it-works sequence, image mask-reveals, route-transition animations; full `prefers-reduced-motion` fallback to static |
| Funnel shell | **Behaviour unchanged** — headers refactored into a shared `FunnelShell` (same DOM: wordmark + `LocaleToggle`); marketing header + footer only on marketing routes |
| Structure | **Approach A** — one spec (this doc), one phased implementation plan, subagent-driven build |

---

## 3. Branch & integration

1. Commit the current uncommitted WIP on `roote/marketing-landing` as a checkpoint
   (`chore: checkpoint landing WIP + favicon + marketing assets`).
2. `git rebase --onto roote/p2b 7ec0ab0 roote/marketing-landing` — replay the 4 landing commits +
   checkpoint onto `roote/p2b` @ `2a4ffb6`. Expected conflicts: none in funnel files (p2b never
   touches `src/app/routes/landing/**` or `src/assets/**`); resolve any landing-file conflicts in
   favour of the marketing-landing side.
3. Add `.worktrees/` to `.gitignore` on this branch (currently only on p2b).
4. All build work happens on `roote/marketing-landing` in a dedicated worktree
   (`.worktrees/roote-website`) per the SDD pattern.
5. Final integration (merge decision) is a stop-and-ask gate, like P2a/P2b.

---

## 4. Information architecture

### 4.1 Route map & shells

```
MarketingShell  (Header + dropdown nav + Footer; sticky header condenses on scroll)
├─ /                     Home
├─ /how-it-works         How It Works
├─ /science              Science
├─ /products             Products
├─ /results              Results & Reviews
├─ /about                About
├─ /faq                  FAQ
├─ /support              Support / Contact
├─ /blog                 Blog index
├─ /blog/:slug           Blog post
├─ /terms                Terms (stub)
└─ /privacy              Privacy (stub)

FunnelShell  (wordmark + LocaleToggle only — extracted from today's inline headers, behaviour unchanged)
├─ /diagnosis · /diagnosis/*
├─ /report/:reportId
└─ /start · /start/*  (StartLayout nested)

*  →  <Navigate to="/" replace />
```

Implemented as two react-router **layout routes** wrapping their children. The funnel routes move
under `FunnelShell` with zero behavioural change (same DOM the tests already assert, minus nothing).

### 4.2 Header

Sticky. Full-bleed, transparent over the `--ink` hero, solid `--background` after 80px scroll (this
transition is motion-gated → static solid when reduced-motion).

- Left: `Wordmark` (→ `/`).
- Centre: `How It Works · Science · Products · Results · About` + `More ▾` (FAQ / Blog / Support).
- Right: `LocaleToggle` + **Start free analysis** (`CtaButton`, → `/diagnosis`).
- Mobile (< `lg`): hamburger → full-screen `MobileMenu` (all links + CTA + locale toggle).

### 4.3 Footer

Four columns + base row:

- **Explore** — How It Works · Science · Products · Results
- **Company** — About · Blog · Support · FAQ
- **Legal** — Terms · Privacy
- **Start** — one-line pitch + `CtaButton`
- Base row: `Wordmark` · `LocaleToggle` · `© {year} ROOTÉ` · `[PENDING]` medical disclaimer (reuse
  today's `rooteContent.disclaimers.medical` → `PendingChip` fallback).

### 4.4 Per-page section stacks

Every closing `CtaBand` is the same component. Every `[PENDING]` below is a `PendingChip` (or a
pending-aware block). Section order is top→bottom.

**Home**
1. Hero — `--ink` band; `Eyebrow` + two-tone `DisplayHeading` + sub-`Prose` + `CtaButton` + trust
   line (`[PENDING]` endorsement); treated hero image with parallax.
2. Value prop — one large line + supporting line.
3. Social-proof strip — `[PENDING]` clinician count · `[PENDING]` customer count · press logos
   (`[PENDING]` row of 5).
4. Quiz intro — 3 steps (quiz → scalp photo AI → personalized plan) + `CtaButton`.
5. How it works — 4 `StepList` items (assessment · AI photo analysis · custom kit · progress +
   derm support); link → `/how-it-works`.
6. Testimonials — `ReviewCarousel` of `[PENDING]` before/after + quote + timeline.
7. Clinical results — `[PENDING]` %/n headline stat + `[PENDING]` study attribution.
8. Product components — `KitCard` grid from `roote.config` formula; `[PENDING]` price; link →
   `/products`.
9. Root-cause analysis — 3–4 example profiles tied to severity bands (`severity.mild/moderate/
   established` + `zone.*`), each a checklist of factors addressed; no invented personas — profiles
   are "Frontal + temples, moderate" style, built from existing i18n tokens.
10. Research & evidence — `BeforeAfter` cuticle imagery + `[PENDING]` timeframe; link → `/science`.
11. `CtaBand`.

**How It Works**
1. Page hero (light).
2. **Pinned/scrubbed 4-step sequence** (the motion centrepiece): assessment quiz → AI scalp-photo
   analysis (`[PENDING]` accuracy) → your custom formula (how inputs map to the regimen) → ongoing
   adjustments + derm messaging (`[PENDING]`).
3. What's in your kit — `KitCard` row.
4. `Timeline` — 1 / 3 / 6 month expectations; `[PENDING]` outcome figures; shedding-phase note
   (drafted, not `[PENDING]`).
5. Support model — derm chat / check-ins / plan revisions (`[PENDING]` specifics).
6. FAQ teaser — 4 `FaqAccordion` items → `/faq`.
7. `CtaBand`.

**Science**
1. Hero (light).
2. Mechanism — DHT · follicle miniaturization · growth-phase cycle; drafted prose + a simple
   diagram (inline SVG, no library).
3. Active ingredients — `IngredientCard` per `roote.config` active (name · role · evidence
   summary drafted; `[PENDING]` dose/proprietary detail).
4. Clinical evidence — `[PENDING]` n / % / duration; results-over-time chart placeholder
   (`[PENDING]`, not a real chart).
5. `BeforeAfter` microscope imagery + `[PENDING]` measurement.
6. Medical advisory board — `[PENDING]` names/credentials; the oversight model drafted.
7. References — `[PENDING]` citation list.
8. `CtaBand`.

**Products**
1. Hero (light).
2. Kit overview — all components; `[PENDING]` kit price; `CtaButton`.
3. Per-component detail (anchor-linked): Topical serum · Daily supplement · Shampoo · Collagen —
   each: what it does, key ingredients (`roote.config`), how/when to use, `[PENDING]` unit price.
4. "Customized to you" — how the assessment determines kit contents (ties to `deriveAnalysis`
   severity/zone logic, described not recomputed).
5. Subscription / reorder — `[PENDING]` cadence + price; forward-links to `/start`.
6. Guarantee — `[PENDING]`.
7. Reviews teaser → `/results`.
8. `CtaBand`.

**Results & Reviews**
1. Hero (light).
2. Rating summary — `[PENDING]` avg stars + `[PENDING]` review count.
3. Before/after gallery — grid of `[PENDING]` pairs with timeline labels.
4. Testimonials — long-form `ReviewCard` list, `[PENDING]` attribution; static concern/timeline
   filter chips.
5. Results by timeline — `Timeline` reused; `[PENDING]` outcome stats.
6. Press / media — `[PENDING]` logos + `[PENDING]` pull-quotes.
7. `CtaBand`.

**About**
1. Hero / mission (drafted).
2. Founding story — drafted narrative; `[PENDING]` for specific dates/founders.
3. Team & advisors — `[PENDING]` cards.
4. Values / approach — drafted (evidence-led · personalized · transparent about what's pending).
5. Press → shared with `/results` data.
6. Careers teaser — `[PENDING]` / external link placeholder.
7. `CtaBand`.

**FAQ**
1. Hero + static category tabs: Getting started · The plan · Ingredients & safety · Billing &
   shipping · Results.
2. `FaqAccordion` groups — Claude drafts Q&A; `[PENDING]` answers for billing/shipping terms,
   guarantee mechanics, medical contraindications.
3. "Still have questions?" → `/support`.

**Support**
1. Hero.
2. Contact options — `[PENDING]` email · `[PENDING]` hours · in-app derm message (described).
3. `ContactForm` — name / email / topic / message; **stub**: on submit shows an inline
   `role="status"` "This form isn't connected in the preview" note; nothing is sent or stored.
   `// TODO: confirm with client` + `// TODO: wire to support backend`.
4. Help topics → `/faq` deep links.
5. `CtaBand`.

**Blog**
- **Index** (`/blog`): hero + `BlogCard` grid (category · title · excerpt · read-time · date).
  Categories: Ingredients · The Science · Hair-loss basics · Routine.
- **Post** (`/blog/:slug`): title · meta row · treated hero image (mask-reveal) · body from
  structured blocks (`heading` · `paragraph` · `pullquote` · `image` · `list`) · `[PENDING]` for
  any stat · `[PENDING]` author · related-posts row · `CtaBand`. Unknown slug → `/blog`.
- **4 posts** Claude drafts (~450–600 words EN, first-pass HE):
  `understanding-the-norwood-scale` · `what-causes-pattern-hair-loss` ·
  `how-ai-reads-a-scalp-photo` · `building-a-routine-you-will-keep`.

**Terms / Privacy**
- `LegalPage` — single column, drafted skeleton headings, `[PENDING]` body, "Last updated
  `[PENDING]`" line.

---

## 5. Design system

### 5.1 Typography

| Role | Latin | Hebrew | Load |
|---|---|---|---|
| Display (H1–H3, pull-quotes) | **Playfair Display** 400–800 + italic | **Frank Ruhl Libre** 500–700 | Google Fonts `@import` in `fonts.css` |
| Body / UI / eyebrows / nav / buttons | **Montserrat** 400–600 | **Heebo** 400–700 | Google Fonts |
| Funnel + rest of app | unchanged (`Libre Franklin` / `Heebo`) | | |

- New tokens in `theme.css` `:root` + `@theme inline`:
  `--font-display: 'Playfair Display', 'Frank Ruhl Libre', Georgia, serif;`
  `--font-body: 'Montserrat', 'Heebo', system-ui, sans-serif;`
- Mirror in `src/styles/tokens.ts` (keeps `tokens.test.ts` green).
- `fonts.css` import: drop `Spectral` + `DM Sans`; add `Playfair Display`, `Montserrat`,
  `Frank Ruhl Libre`. Keep `Libre Franklin`, `Heebo`.
- `--font-secondary` (`theme.css`) and `tokens.ts` `secondary` are unused anywhere in app code —
  remove both and update `tokens.test.ts`.
- **Scope:** Montserrat is applied via `className="font-body"` on `MarketingShell`'s root, not on
  global `body`. Funnel/report/start keep `--font-sans`. `DisplayHeading` sets `font-display`.
- **Type scale** (marketing only; Tailwind utilities, `clamp()` for fluid display):
  - Display XL (hero H1): `clamp(2.75rem, 6vw, 5.5rem)`, `leading-[0.95]`, `tracking-[-0.02em]`
  - Display L (page H1): `clamp(2.25rem, 4vw, 3.75rem)`, `leading-[1.0]`, `tracking-[-0.015em]`
  - Display M (section H2): `clamp(1.75rem, 3vw, 2.75rem)`, `leading-[1.05]`
  - Display S (H3): `1.375rem`–`1.75rem`
  - Body L: `1.0625rem`/`1.7`; Body M: `0.9375rem`/`1.65`; Eyebrow: `0.75rem`, `uppercase`,
    `tracking-[0.18em]`, `font-medium`
- **Two-tone `DisplayHeading`**: `text` (solid `--foreground` or `--ink-foreground`) + optional
  `ghost` word rendered `text-accent-ghost`. The ghost word is decorative emphasis only — the full
  phrase is always present as solid, readable text (no meaning conveyed by the ghost alone).

### 5.2 Color

`theme.css` — additions and one change; everything else **unchanged**.

| Token | Value | Role |
|---|---|---|
| `--accent` (change) | `#8d7766` → **`#a97b45`** | brass/gold — hero `<em>`, seal badge, dot/check glyphs, hairline rules, active nav underline. Non-text or ≥24px text only. |
| `--ink` (new) | `#201812` | dark surface — hero band, `CtaBand`, footer option, pinned how-it-works bg |
| `--ink-foreground` (new) | `#f4efe4` | text/UI on `--ink` |
| `--accent-ghost` (new) | `#d8ccb9` | two-tone ghost word on light grounds |
| `--ink-ghost` (new) | `#4a3f34` | two-tone ghost word on `--ink` grounds |

Add `@theme inline` maps so `bg-ink`, `text-ink-foreground`, `text-accent-ghost`, `border-accent`
utilities exist. `--primary` and all existing tokens are untouched → funnel/report/start unaffected.
`.dark` block stays as-is (unused).

**Contrast:** body text on `--ink` uses `--ink-foreground` (#f4efe4 on #201812 ≈ 13:1). Gold
`--accent` never carries body-size text on either ground. Ghost words are `aria-hidden` duplicates
where the solid phrase already exists; where the ghost *is* part of the phrase, contrast of the
solid siblings still meets AA and the ghost meets AA Large.

### 5.3 Layout & spacing

- Container: `max-w-6xl` (1152px) default; `max-w-5xl` for text-dense pages; hero + galleries may
  break to `max-w-7xl`. Gutter `px-6` / `md:px-10`.
- Vertical rhythm: sections `py-20` / `md:py-28`; `--ink` bands `py-24` / `md:py-32`.
- Editorial signatures: left-aligned headers (drop centre-alignment except short CTA bands);
  margin **index numerals** (`01 · 02 · 03`) in `--accent` on multi-step sections; thin
  `border-accent/40` rules between major blocks; a faint concentric-arc SVG motif behind two light
  sections (decorative, `aria-hidden`).
- Radii: keep `--radius: 0.5rem`; images `rounded-xl` (12px) / feature imagery `rounded-2xl`.
- RTL: all layout uses logical properties / Tailwind `ms-*`/`me-*`/`start`/`end`; numerals and
  arrows mirror; `LocaleProvider` already flips `dir`.

### 5.4 Motion (rich)

Library: **`motion`** (already a dependency; `motion/react`). No new animation deps (no GSAP).

| Effect | Where | Mechanism |
|---|---|---|
| Parallax image | Home hero, Products imagery, Blog post hero | `useScroll` + `useTransform` on `y`, ≤ 40px range |
| Mask-reveal | every feature image on first in-view | `whileInView` clip-path/opacity, `once: true` |
| Rise+fade section entrance | all sections | `whileInView` `y: 16→0`, `opacity`, `once: true`, 400ms |
| Pinned/scrubbed sequence | How It Works step 2 | `position: sticky` wrapper + `useScroll` progress → step index; falls back to a plain stacked 4-step list |
| Sticky header condense | global | scroll-position state → class swap |
| Route transition | between marketing routes | `AnimatePresence` fade/slide, ≤ 250ms; funnel routes excluded |
| Carousel autoplay | testimonials | 6s interval, pause on hover/focus/visibility-hidden |
| `[PENDING]` stat count-up | stats sections | only if the value is real; `[PENDING]` chips never animate |

**`prefers-reduced-motion: reduce` contract:** every scroll-linked transform, entrance animation,
route transition, parallax, pin, and autoplay is **disabled**; content renders in its final,
complete, static state; the pinned sequence becomes a normal stacked list; the carousel becomes a
scroll-snap row with arrows. This is a hard requirement verified by test.

Performance budget: no layout-thrashing scroll handlers (transform/opacity only); images
`loading="lazy"` below the fold; the concentric-arc motif is CSS/SVG, not canvas.

### 5.5 Imagery

Existing assets (`hero-people`, `scalp-before/after`, `hair-cuticle`, `product-lineup`,
`scan-device`, `step-*`, plus the untracked `BANNERS/`, `BEFORE AND AFTER RESULT/`,
`OBJECTIVE MEASUREMENT/`) are the source pool. No new photography.

Treatment: a shared `.img-editorial` utility — `filter: saturate(.92) contrast(1.04) sepia(.10)`,
plus an optional `::after` warm-dark gradient for images on `--ink`. Documented as a **concept
stopgap**; true art direction is a follow-up. All decorative images `alt=""`; meaningful ones get
real alt text via i18n keys.

### 5.6 Iconography

Inline SVG only (matches repo convention — see `CheckIcon`, `DotIcon`). A small set:
arrow, check-in-circle, dot, star, quote-mark, chevron, hamburger, close, minus/plus (accordion),
external-link. No icon library.

---

## 6. Component inventory

New, under `src/app/components/marketing/` unless noted. Each is prop-driven, i18n-agnostic
(receives resolved strings or i18n keys per the existing pattern), and independently testable.

| Component | Responsibility | Key props |
|---|---|---|
| `MarketingShell` | Header + `<Outlet/>` + Footer; scroll state; skip-link | — (layout route) |
| `Header` / `MobileMenu` | nav, dropdown, CTA, locale toggle, condense-on-scroll | `transparentOverHero?` |
| `FunnelShell` | extracted minimal shell for funnel routes (wordmark + `LocaleToggle`) | — |
| `Footer` | 4-col + base row + `[PENDING]` disclaimer | — |
| `Section` | vertical rhythm, optional index numeral, optional arc motif, in-view animation wrapper | `index?`, `tone?: 'light'\|'ink'`, `motif?` |
| `Eyebrow` | uppercase tracked label | `children` |
| `DisplayHeading` | `font-display`, size step, optional two-tone ghost | `as`, `size`, `text`, `ghost?` |
| `Prose` | body copy block, measure-limited | `size?` |
| `ArrowLink` | text + arrow, underline-on-hover, RTL-aware | `to`, `children` |
| `CtaButton` | the one filled pill (`bg-primary`) | `to`, `children`, `size?` |
| `CtaBand` | closing CTA section (`--ink`) | `headingKey`, `bodyKey?` |
| `StepList` | numbered steps w/ optional images | `steps[]` |
| `PinnedSteps` | scrubbed sticky sequence + reduced-motion fallback to `StepList` | `steps[]` |
| `StatStrip` | inline stats row, `[PENDING]`-aware | `items[]` |
| `PressLogos` | logo row, all `[PENDING]` | `count` |
| `ReviewCard` / `ReviewCarousel` | testimonial(s), `[PENDING]` attribution, a11y carousel | `reviews[]` |
| `BeforeAfter` | two-image compare w/ labels (static; no slider needed) | `before`, `after`, `labels` |
| `Timeline` | month milestones, `[PENDING]` outcomes | `milestones[]` |
| `IngredientCard` | active from `roote.config` | `ingredient` |
| `KitCard` | regimen component | `component` |
| `FaqAccordion` | grouped Q&A, one-open, keyboard + `aria-expanded` | `groups[]` |
| `BlogCard` | index tile | `post` |
| `BlogPostBody` | renders structured blocks | `blocks[]` |
| `ContactForm` | stub form + `role="status"` notice | — |
| `LegalPage` | headings + `[PENDING]` body | `sectionKeys[]` |
| `ArcMotif` | decorative concentric-arc SVG | `aria-hidden` |

Reuse as-is: `Wordmark`, `LocaleToggle`, `PendingChip`, `isPending`/`PENDING`, `useT`/`useLocale`,
`rooteContent` (`roote.config.ts`).

---

## 7. Content model

### 7.1 i18n

- New keys namespaced `marketing.<page>.<section>.<slot>` in `src/i18n/messages/{en,he}.ts`.
- `messages.test.ts` parity (identical key sets, no empty strings) covers every new key.
- HE values: Claude first-pass translation, flagged in the plan for the scheduled professional
  review. RTL correctness (punctuation, numerals, arrow direction) is in-scope now.
- Blog post bodies: **not** flat strings. `src/content/blog/posts.ts` holds an array of
  `BlogPost { slug, category, dateISO, readingMinutes, heroImage, titleKey, excerptKey,
  blocks: Block[] }` where text `Block`s carry i18n keys, not literals. A `posts.test.ts` asserts
  every referenced key exists in both dictionaries and every slug is unique.

### 7.2 `[PENDING]` catalogue

Deferred everywhere a real claim would appear: clinician/customer counts; all prices (kit, unit,
subscription); guarantee terms; clinical %/n/duration; results-over-time chart; testimonial name +
quote + result + photo; before/after imagery pairs and their timelines; advisory-board
names/credentials; press logos + pull-quotes; support email + hours; "last updated" dates; legal
bodies; blog author; any in-body blog statistic. Rendered via `PendingChip` or a pending-aware
wrapper; `[PENDING]` chips never animate and are always visible (not hidden behind carousels/tabs).

### 7.3 Voice

Calm, precise, non-hype. States what is known, marks what is pending, never implies a result that
isn't substantiated. Mirrors the existing report/disclaimer tone. HE register consistent
(second-person singular, matching the funnel).

---

## 8. Routing changes

- `src/app/App.tsx` router gains the two layout routes and 12 marketing child routes (`/`,
  `/how-it-works`, `/science`, `/products`, `/results`, `/about`, `/faq`, `/support`, `/blog`,
  `/blog/:slug`, `/terms`, `/privacy`); the `*` redirect stays last; funnel routes move under
  `<FunnelShell>` with no behavioural change.
- `Landing.tsx` is replaced by `routes/marketing/Home.tsx` (+ section components). The old
  `LandingSectionsA/B.tsx` content is salvaged into the new Home/Science/Products sections, then
  those files are removed.
- `Landing.test.tsx` → `Home.test.tsx`, updated for the new structure (still asserts wordmark +
  a `/diagnosis` CTA).

---

## 9. Testing

- **Per page:** a render test — mounts at the route inside `MarketingShell` + `LocaleProvider`,
  asserts the page H1, the closing CTA links to `/diagnosis`, and no unresolved `[PENDING:` text
  leaks as a raw string (chips render, raw markers don't).
- **Navigation:** header links resolve to the right routes; `More ▾` dropdown opens; mobile menu
  toggles; active-route styling.
- **i18n:** `messages.test.ts` parity (extended); one EN and one HE render per page type; RTL
  `dir` attribute; blog `posts.test.ts`.
- **Motion:** a `prefers-reduced-motion` test (mocked matchMedia) asserting the pinned sequence
  renders as a plain list and no `AnimatePresence`/transform wrappers gate content visibility.
- **Stub:** `ContactForm` submit shows the notice and performs no navigation / storage / network.
- **Funnel untouched:** the full existing suite stays green; `FunnelShell` extraction asserts the
  same header contents the funnel tests already expect.
- `pnpm build` clean (the pre-existing >500 kB `@react-pdf` chunk warning is still acceptable;
  watch that `motion` doesn't balloon the bundle — code-split marketing route chunks if needed).

## 10. Accessibility

- Landmark structure (`header`/`nav`/`main`/`footer`), one `h1` per page, ordered headings.
- Skip-link to `#main` in `MarketingShell`.
- Header/menu: focus trap in `MobileMenu`, `Esc` closes, `aria-expanded` on toggles.
- `FaqAccordion`: button-based, `aria-expanded`/`aria-controls`, arrow-key optional.
- `ReviewCarousel`: `aria-roledescription="carousel"`, live-region-free auto-advance paused on
  focus/hover, prev/next buttons, not keyboard-trapping.
- Contrast per §5.2; ghost words `aria-hidden` when duplicative.
- Full `prefers-reduced-motion` compliance per §5.4.
- All imagery `alt`-audited; decorative → `alt=""`.

## 11. Phasing (feeds the implementation plan)

1. **Foundation** — branch/rebase; fonts + tokens + `tokens.ts`; `MarketingShell` + `Header` +
   `MobileMenu` + `Footer` + `FunnelShell` extraction; `Section`/`Eyebrow`/`DisplayHeading`/
   `Prose`/`ArrowLink`/`CtaButton`/`CtaBand`/`ArcMotif`; router restructure; reduced-motion
   plumbing. Funnel suite stays green.
2. **Home** — all 11 sections on the foundation; salvage old landing content; `Home.test.tsx`.
3. **Core pages** — How It Works, Science, Products, Results & Reviews, About (+ their
   section-specific components: `PinnedSteps`, `IngredientCard`, `KitCard`, `Timeline`,
   `ReviewCarousel`, `BeforeAfter`, `StatStrip`, `PressLogos`).
4. **Content pages** — FAQ (`FaqAccordion`), Support (`ContactForm`), Blog (index + `[slug]` +
   `posts.ts` + 4 drafted posts), Terms/Privacy (`LegalPage`).
5. **Rich-motion pass** — parallax, mask-reveals, pinned sequence, route transitions, carousel
   autoplay, header condense; reduced-motion tests.
6. **i18n + a11y sweep** — HE parity check, RTL spot-checks, axe-style pass, `[PENDING]` audit,
   `pnpm build` + bundle check.

## 12. Risks / open items

- **Imagery** is the weakest link — treated stock/existing assets won't fully match the reference's
  studio photography. Flagged as a concept stopgap; art direction is a post-spec follow-up.
- **`motion` bundle cost** with rich scroll effects — mitigate via route-level code-splitting;
  measure in phase 5.
- **HE first-pass quality** — every new string is machine-draft HE; the scheduled professional
  review must cover the whole marketing surface.
- **Blog scope creep** — 4 posts, ~500 words each, ×2 languages is real writing; kept deliberately
  small.
- **`/app` dead link** — the reorder/dashboard CTA points at a route P2c hasn't built; documented,
  not worked around.
