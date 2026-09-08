/**
 * Canonical route table (brief §10). One source of truth for every internal
 * link. Old URLs (`/diagnosis`, `/start`, `/app`, `/terms-of-sale`) still work —
 * `LEGACY_REDIRECTS` maps them here and `App.tsx` mounts redirect routes.
 */

export const PATHS = {
  home: '/',
  howItWorks: '/how-it-works',
  solutions: '/solutions',
  solutionThinning: '/solutions/thinning',
  solutionGray: '/solutions/gray-hair',
  science: '/science',
  system: '/system',
  about: '/about',
  faq: '/faq',
  support: '/support',

  products: '/products',
  product: (slug: string) => `/products/${slug}`,

  bag: '/bag',
  bagCheckout: '/bag/checkout',
  bagSuccess: '/bag/success',

  login: '/login',
  hairScan: '/hair-scan',
  accountHairHealthRescan: '/account/hairhealth-rescan',

  analysis: '/analysis',
  analysisStep: (step: string) => `/analysis/${step}`,

  program: '/program',
  programPlan: '/program/plan',
  programCheckout: '/program/checkout',
  programSuccess: '/program/success',

  account: '/account',
  accountSection: (section: string) => `/account/${section}`,

  report: (reportId: string) => `/report/${reportId}`,

  legal: (slug: string) => `/${slug}`,
} as const;

/**
 * External HairHealth.ai assessment quiz (Landbot fullpage). Per 2026-09-08 team
 * decision, every "Start free hair analysis" marketing CTA points here instead of
 * ROOTÉ's own `/analysis` flow. This is explicitly the TEST link Justine shared,
 * not the production one — swap this one constant once HairHealth.ai provides the
 * real URL. `/analysis` itself (and its own domain/report/program pipeline) is left
 * fully intact and still reachable directly; it's just unlinked from marketing CTAs,
 * the same pattern already used for `/hair-scan`. Account-app "redo my assessment"
 * actions for an existing signed-in customer (`AccountResults`, `AccountRenew`) keep
 * pointing at `PATHS.analysis` on purpose — they need the session/program context an
 * anonymous third-party lead form can't provide.
 */
export const EXTERNAL_ASSESSMENT_URL = 'https://roote.vercel.app/test/landbot/fullpage';

/** Legal page slugs that get their own top-level route (brief §25). */
export const LEGAL_SLUGS = [
  'privacy',
  'terms',
  'shipping',
  'returns',
  'cancellation',
  'subscription-terms',
  'medical-disclaimer',
  'accessibility',
  'cookies',
] as const;

/**
 * Old path-prefix → new path-prefix. `App.tsx` mounts a splat redirect for each
 * so `/diagnosis/gender` → `/analysis/gender`, etc. Sub-segment names
 * (`analyzing`→`scanning`, `plan`→`program`, `rescan`→`scans`) are renamed in
 * WP5 / WP8 when those screens are rebuilt; until then the old names live on
 * under the new prefixes.
 */
export const LEGACY_PREFIX_REDIRECTS: Array<[from: string, to: string]> = [
  ['/diagnosis', PATHS.analysis],
  ['/start', PATHS.program],
  ['/app', PATHS.account],
];

/** Exact old paths that map to a single new path. `/terms-of-sale` stays a live
 *  page for now (12 drafted clauses); WP9 folds it into the legal registry. */
export const LEGACY_EXACT_REDIRECTS: Array<[from: string, to: string]> = [];
