# ROOTÉ.US — Technical SEO Audit

**Date:** 2026-09-05
**Scope:** Phase 1 of the SEO engagement (see decomposition below). Read-only audit of the
current codebase plus a small set of safe, non-architectural fixes. Everything requiring new
routing, new pages, structured data, or content is out of scope here and tracked as its own
future sub-project.

**Engagement decomposition** (this audit is step 1 of 7):
1. Technical SEO audit + safe fixes *(this document)*
2. International URL & hreflang architecture
3. Metadata + canonical + structured-data system
4. Indexability & crawl control (robots.txt, sitemap)
5. Keyword research & competitor gap analysis
6. New page architecture (`/solutions/*`, `/hair-analysis`, `/learn/*`, E-E-A-T pages)
7. Internal linking, Core Web Vitals, launch QA, monitoring

---

## How to read this

ROOTÉ.US is currently a **front-end-only concept build** (`CLAUDE.md`) with
`<meta name="robots" content="noindex, nofollow">` hard-coded in `index.html`. That is
intentional and correct for the current stage — nothing here should be read as "fix this so
Google indexes it today." The findings below are organized by the severity they'll have **once
indexing is deliberately turned on** (see §42 Launch Indexation Strategy in the engagement
brief), so the backlog is ready when that flag flips.

A prior redesign session already scaffolded real SEO infrastructure — this is not a
greenfield audit:
- `src/app/paths.ts` — a canonical route registry (`PATHS`), single source of truth for links,
  with legacy-URL redirects already wired (`LEGACY_PREFIX_REDIRECTS`).
- `src/seo/meta.ts` — a `ROUTE_META` table (title + description, both `en`/`he`) keyed by path,
  with prefix-fallback resolution (`metaForPath`).
- `src/seo/useDocumentMeta.ts` — a hook that sets `document.title`, meta description, and
  `og:title`/`og:description`/`og:type`, plus the canonical `<link>`, on every route change.

The findings below build on that foundation rather than proposing a parallel system.

---

## CRITICAL

### C1. Sitewide `noindex, nofollow` (intentional, but the master gate)
`index.html:10` — `<meta name="robots" content="noindex, nofollow" />`, unconditional. Correct
for the concept build. **Nothing downstream matters until this is deliberately removed as part
of a real launch checklist** (§42) — not toggled casually, not forgotten when the site actually
ships. Recommendation: this line should be removed only as the *last* step of a documented
launch QA pass, gated on real content existing (no `[PENDING]`, no placeholder claims, no
unfinished translations) per §42's own rule.

### C2. No `robots.txt`, no sitemap, no `public/` directory
`ls public/` → does not exist. There is nowhere for a crawler to be told what to crawl, and no
sitemap to submit to Search Console once indexing is live. Tracked under sub-project 4
(Indexability & crawl control) — not fixed in this pass.

### C3. Pure client-rendered SPA — no SSR/SSG
`vite.config.ts` + `src/app/App.tsx` — a standard `createBrowserRouter`/`RouterProvider` Vite
React app. All route-specific content (title, description, OG tags, canonical) is injected by
a `useEffect` (`useDocumentMeta`) **after** JavaScript executes. Two concrete consequences:
- **Googlebot** renders JS and will pick this up correctly (Google's indexer executes
  JavaScript before extracting `<head>` content). Not a Google-specific blocker today.
- **Social-media crawlers do not execute JavaScript.** Facebook, Twitter/X, LinkedIn, Slack,
  WhatsApp, iMessage, and most AI-agent link-preview fetchers read the *static* HTML only. Every
  shared ROOTÉ link — regardless of which page was shared — will currently unfurl using
  `index.html`'s hardcoded Hebrew title/description and **no image at all** (no `og:image`
  exists in the static HTML). This is a real, user-visible defect the moment any link gets
  shared anywhere, independent of the `noindex` flag.

Full resolution (server-side rendering, static pre-rendering, or a build-time meta-injection
step) is an architectural decision outside this bounded audit's scope — flagging it here so it's
weighed before sub-project 3 (metadata/structured-data system) is designed, since the *design*
of that system should account for this constraint from the start rather than retrofitting SSR
later.

### C4. No locale in the URL — hreflang is structurally impossible today
`src/i18n/LocaleProvider.tsx` — locale is pure client state (`localStorage['roote.locale']`),
not part of the URL. Every route serves `en` and `he` content from the *same* URL depending on
a visitor's stored preference. Consequences:
- `hreflang` annotations require distinct URLs per language variant — there is currently no way
  to express "this URL is the Hebrew version of that URL" because there is only one URL.
- A crawler with no stored preference will always see whatever `DEFAULT_LOCALE` resolves to
  (currently `he`, matching `index.html`'s hardcoded `lang="he" dir="rtl"`) — meaning **English
  content is effectively invisible to first-visit crawlers** regardless of a user's real intent
  or geography.

This is exactly why sub-project 2 (International URL & hreflang architecture, e.g. `/en-us/`,
`/he-il/`) exists as its own engagement phase — it cannot be safely fixed inside a bounded pass;
it changes every route in the app. Not touched here.

---

## HIGH

### H1. `document.title` is set by two competing, uncoordinated systems — **fixed in this pass**
- `LocaleProvider.tsx` (`useEffect`, fires on `[locale, dir]`) sets `document.title` from a
  generic per-locale string: `messages[locale]['meta.title']`.
- `useDocumentMeta.ts` (`useEffect`, fires on `[pathname, cl]`) sets `document.title` from the
  per-route `ROUTE_META` table via `fullTitle()`.

Both effects can fire independently on the same render (e.g. any locale switch triggers both),
and there is no ordering contract between them — whichever effect's scheduler slot runs last
wins, non-deterministically from the app's perspective. In practice this means the visible tab
title can silently revert from a correct per-route title back to the generic locale title on
any locale toggle. **Fix:** `LocaleProvider` no longer sets `document.title` — `useDocumentMeta`
is the single owner everywhere it's mounted (see H2 for where it isn't yet mounted).

### H2. `useDocumentMeta` isn't wired into every shell
It's called from `MarketingShell` and `AnalysisShell` only. `AppShell` (`/account/*`),
`StartLayout` (`/program/*`), and `ReportPage` (`/report/:id`) never update title/description/
canonical/OG — they simply keep whatever the last-visited marketing page set (or the static
`index.html` default, if the user landed directly). `/account/*` and `/program/*` are private,
correctly-`noindex`-bound routes per the private-routes list (§8), so the *SEO* impact is low —
but the **browser-tab / bookmark UX impact is real** for any user who lands there directly or
refreshes. `/report/:id` is a public-share surface and arguably should get real per-report
metadata eventually. **Not fixed in this pass** (wiring it in touches those shells' render trees
and their existing tests — a "safe fix" in isolation, but this audit's fix budget was scoped to
the 4 items below; recommend this as the first item of a fast follow-up).

### H3. Fonts load via `@import` inside `fonts.css` — **fixed in this pass**
`src/styles/fonts.css:5` — a single `@import url('https://fonts.googleapis.com/css2?...')`. This
is a well-documented render-blocking anti-pattern: the browser must fetch and parse `fonts.css`
before it can even *discover* the Google Fonts stylesheet, which must itself be fetched and
parsed before the actual font files are discovered — a fully serial chain instead of the
parallel fetch a `<link>` tag in `<head>` allows. `display=swap` is already correctly appended
to the Google Fonts URL, so text isn't blocked *invisibly* — but first paint of styled text is
still delayed by an avoidable network round-trip. **Fix:** move to
`<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html`, remove the `@import`.

### H4. Every product page shares identical, non-unique metadata — **fixed in this pass**
`metaForPath`'s prefix-fallback means `/products/density-6`, `/products/gray-support`, etc. —
none of which exist as their own `ROUTE_META` entries — all resolve to the generic `/products`
title ("Products") and description. Real, already-approved per-product copy already exists in
`src/content/products.ts` (`name`, `subtitle`, `shortDescription`) and simply isn't wired in.
**Fix:** derive a `ROUTE_META` entry per SKU from that existing content (see §25/§26 constraint
below — no formula strengths, no invented claims, using only the product's name/subtitle/
shortDescription fields, all already client-approved copy).

### H5. No `og:image`, `og:url`, `og:site_name`, or Twitter Card meta — **fixed in this pass**
`useDocumentMeta.ts` sets `og:title`/`og:description`/`og:type` only. No image means link
previews render with no thumbnail at all (compounding C3's static-HTML problem — even once JS
runs, there is still nothing to show). No `twitter:card` means Twitter/X falls back to a
generic, unstyled link. **Fix:** add `og:image` (absolute URL, using the existing `logo.png`
brand asset — no new asset invented), `og:url`, `og:site_name`, and `twitter:card`/`twitter:title`/
`twitter:description`/`twitter:image`. Using `summary` (not `summary_large_image`) as the
Twitter card type, since `logo.png` is a wide wordmark (~1400×435) rather than the ~1200×630
landscape crop `summary_large_image` expects — a proper social-share image (1200×630, distinct
from the wordmark) is recommended as a future asset request, not fabricated here.

### H6. No real HTTP redirects for legacy URLs — hosting-level gap
`LEGACY_PREFIX_REDIRECTS`/`LEGACY_EXACT_REDIRECTS` (`src/app/paths.ts`) are mounted as
client-side `<Navigate replace>` routes (`App.tsx`). A crawler or client that doesn't execute JS
receives an HTTP 200 for the *old* URL with an empty app shell — never a real 301/302, and never
the redirected content. No hosting configuration file (`vercel.json`, `netlify.toml`,
`_redirects`, or equivalent) exists anywhere in the repo to configure this at the host level.
**Not fixed here** — depends on knowing the deployment target, which is outside this audit's
information.

---

## MEDIUM

### M1. No structured data anywhere
Zero `application/ld+json` or Schema.org references in the codebase (`Organization`, `WebSite`,
`BreadcrumbList`, `Product`, `Article` — none exist). Full scope of sub-project 3.

### M2. No breadcrumb component
Neither a visual breadcrumb UI nor `BreadcrumbList` structured data exists anywhere under
`src/app/components/`. Scope of sub-project 6 (new page architecture) once there's a page
hierarchy deep enough to need them (`/learn/hair-loss/crown-thinning`, etc.).

### M3. Image loading / CLS risk unconfirmed
No `loading="lazy"` usage found anywhere in a repo-wide search. Marketing pages don't appear to
use raw `<img>` tags directly (none found in `Home.tsx`) — likely routed through a shared media
component (`MediaPlaceholder.tsx` exists). Needs a dedicated pass once real product photography
replaces placeholders (§27 of the engagement brief) to confirm `width`/`height`/`aspect-ratio`
are set consistently to prevent layout shift, and that below-the-fold images are lazy-loaded.

### M4. No host-level normalization (www/non-www, trailing slash, HTTPS)
No hosting configuration file exists in the repo at all. This is entirely dependent on whatever
platform this eventually deploys to and cannot be assessed or fixed from the app code alone.
Flag for whoever owns the deployment target.

### M5. Canonical domain assumption unconfirmed
`useDocumentMeta.ts` hardcodes `https://roote.us` as the canonical origin. The brand is styled
`ROOTÉ.US` everywhere else in the codebase and docs — worth an explicit confirmation that
`roote.us` (no dot before "us" in the domain, obviously, but confirm capitalization/redirect
handling if `ROOTE.US` or a `www.` variant is also registered) is the single canonical host
before this matters for real.

---

## LOW

### L1. Static `index.html` fallback title/description are Hebrew-only and generic
Acceptable today since `noindex` makes this crawl-invisible either way, and `he` is the
documented default locale. Worth a deliberate decision (not a silent leftover) once indexing
goes live: should the pre-hydration static fallback stay locale-default, or should it be
locale-neutral/bilingual for the brief window before `useDocumentMeta` takes over?

### L2. Favicon path is dev-relative
`index.html:11` — `<link rel="icon" ... href="/src/assets/favicon.png" />`. Vite resolves this
correctly through its build pipeline (asset hashing), but it's worth a one-time build-output
sanity check (`pnpm build && ls dist/assets | grep favicon`) rather than an audit-time assumption.

---

## What was fixed in this pass

Four safe, non-architectural, non-fabricated fixes (see commit for exact diff):

1. **H1** — removed the competing `document.title` setter from `LocaleProvider`; `useDocumentMeta`
   is now the single owner wherever it's mounted.
2. **H3** — replaced `fonts.css`'s `@import` with `<link rel="preconnect">` + `<link
   rel="stylesheet">` in `index.html`.
3. **H4** — added real per-product `ROUTE_META` entries in `src/seo/meta.ts`, derived
   programmatically from `src/content/products.ts`'s existing `name`/`subtitle`/
   `shortDescription` fields (no invented copy, no formula strengths exposed).
4. **H5** — added `og:image`, `og:url`, `og:site_name`, and Twitter Card meta to
   `useDocumentMeta.ts`, using the existing `logo.png` brand asset.

## What was deliberately NOT fixed here (tracked for later sub-projects)

- C1–C4, H2, H6, M1–M5, L1–L2 — each requires either a hosting-config decision this audit
  doesn't have information for, a cross-cutting architectural change (SSR, locale-prefixed
  routing, structured data), or touches more surface area than a "safe fix" bar allows.
