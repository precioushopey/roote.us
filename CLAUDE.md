# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Figma Make** export ("code bundle") for *Design Etsy Shop Branding*. The running app is a
single-page **brand concept preview** for a fictional Etsy shop, "PaperlessHope" (minimalist,
letterpress-inspired digital templates for personal-milestone websites). It presents two
deliverables — a shop banner and a shop logo — rendered as hand-authored inline SVG, plus a
color palette. There is no backend, routing, or persisted state.

Source lives in `src/`. The original design: https://www.figma.com/design/qG4F8BzrhyBE1RwU2LVNYx/Design-Etsy-Shop-Branding

## Commands

```bash
pnpm install     # repo is a pnpm workspace (pnpm-workspace.yaml + pnpm.overrides pin vite@6.3.5)
pnpm dev         # Vite dev server
pnpm build       # vite build -> dist/
```

- `README.md` says `npm i` / `npm run dev`; that also works, but pnpm is what the repo is configured for. No lockfile is committed.
- **No test, lint, format, or typecheck scripts exist** — and no `tsconfig.json` or `typescript` dependency. The `.tsx` files are type-stripped by esbuild via `@vitejs/plugin-react`; types are never checked. Don't invent these commands or configs unless asked.
- `react` / `react-dom` (18.3.1) are declared **only as optional `peerDependencies`**. A plain `pnpm install` may not pull them; running `dev`/`build` outside Figma Make can require `pnpm add react@18.3.1 react-dom@18.3.1`.

## Architecture

### Render flow

`index.html` → `src/main.tsx` (`createRoot` on `#root`, imports `src/styles/index.css`) →
`src/app/App.tsx` (default export, the whole page).

`App.tsx` is self-contained: a `PALETTE` constant plus JSX that lays out the page with
**inline `style` objects** (not Tailwind) and drops in `<ShopBanner />` and `<ShopLogo />`.

### Brand assets are code, not images

`src/app/components/ShopBanner.tsx` (viewBox `0 0 3360 840`) and `ShopLogo.tsx`
(`0 0 500 500`) are pure, prop-less inline `<svg>`. The letterpress/emboss and paper-grain
looks come from SVG filter primitives (`feTurbulence`, `feGaussianBlur`, `feOffset`,
`feFlood`, `feComposite`, `feMerge`) defined in each file's `<defs>`. Brand hex values are
hardcoded per-file (and also duplicated in `App.tsx`'s `PALETTE`) — changing a brand color
means editing every occurrence. Fonts (Pinyon Script, Jost, Spectral) load from Google Fonts
in `src/styles/fonts.css`.

### Styling system (Tailwind CSS v4)

`src/styles/index.css` is the single entry and imports, in order:
- `fonts.css` — Google Fonts `@import`.
- `tailwind.css` — `@import 'tailwindcss' source(none)` with an explicit `@source '../**/*.{js,ts,jsx,tsx}'`, plus `tw-animate-css`.
- `theme.css` — design tokens as CSS custom properties on `:root` and `.dark`, an `@theme inline` block mapping them to Tailwind color/radius utilities (`--color-primary` etc.), and an `@layer base` block that sets default typography on bare `h1`–`h4`/`p`/`label`/`button`/`input`. Because those defaults are in `@layer base`, Tailwind utility classes still override them.

`src/styles/globals.css` exists but is **empty and unused**. `default_shadcn_theme.css` at
the repo root is a reference copy of the stock shadcn theme (note its `KEEP_IN_SYNC` comment)
and is **not imported anywhere** — `theme.css` is the live one. Tailwind v4 needs **no**
`tailwind.config` and no PostCSS setup (`postcss.config.mjs` is intentionally empty).

### Figma Make integration points — don't break these

- `vite.config.ts` registers a custom `figmaAssetResolver` plugin: imports of the form
  `figma:asset/<file>` resolve to `src/assets/<file>`. That directory does not exist yet;
  create it when adding Figma-exported assets.
- `@` is aliased to `src/`.
- `vite.config.ts` `assetsInclude` covers `**/*.svg` and `**/*.csv` for raw imports — its
  comment says never add `.css`, `.ts`, or `.tsx` there.
- The React and Tailwind Vite plugins are both required by Figma Make even if unused — the
  config comment says do not remove them.
- `src/app/components/figma/ImageWithFallback.tsx` is the Figma-provided `<img>` wrapper
  (base64 SVG fallback on load error). Use it instead of a raw `<img>` for remote/Unsplash images.

### shadcn/ui

A full set of shadcn/ui primitives sits in `src/app/components/ui/`, with helpers colocated
there rather than at the conventional paths: `cn()` in `ui/utils.ts` (imported as `./utils`,
not `@/lib/utils`) and `useIsMobile()` in `ui/use-mobile.ts`. **None of these components are
currently used** by `App.tsx`; they ship with the template. Likewise most `package.json`
dependencies (`motion`, `react-router`, `recharts`, `react-hook-form`, MUI, …) are the
standard Figma Make bundle and are not yet imported by app code.

## Other notes

- `guidelines/Guidelines.md` is the untouched Figma Make template placeholder — no real rules in it.
- `pnpm-workspace.yaml` pins `supportedArchitectures` to linux x64/arm64 glibc, which can affect `pnpm install` on this Windows machine.
- `index.html` sets `noindex, nofollow`.
