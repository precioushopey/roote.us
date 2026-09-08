# HairHealth.ai / Landbot Lead-Gen Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone `/hair-scan` marketing page that fullpage-embeds HairHealth.ai's Landbot
lead-gen chatbot (leads flow into ROOTÉ's own HubSpot, per the confirmed integration — not into this
app's own analysis pipeline), make it reachable from the header nav, correct the codebase's stale
assumption that HairHealth.ai would supply a synchronous CV API for the in-app `/analysis` flow, and
fix two now-inaccurate privacy-policy claims that name HairHealth.ai as a recipient of in-app
assessment data.

**Architecture:** One new env-var-gated component (`LandbotFullpageEmbed`) implements Landbot's
documented Fullpage script-embed contract, rendering a safe placeholder until a real bot config URL
is supplied. One new page (`HairScan`) wraps it with copy and a privacy disclosure, mounted as a
top-level route inside the existing `FunnelShell` (same minimal chrome as `/login`). Separately, the
existing (never-implemented) `hairhealthAdapter.ts` — which wrongly assumed HairHealth.ai would hand
ROOTÉ a synchronous photo-analysis API — is renamed to a vendor-neutral `remoteAnalysisAdapter.ts`
with corrected comments, and two privacy-policy strings (EN+HE) that made the same false claim are
corrected.

**Tech Stack:** React 18 + TypeScript (strict), React Router v7 (`createBrowserRouter`), Vite 6 +
Tailwind v4, Vitest + Testing Library, Landbot's `landbot-3` Fullpage embed SDK (loaded from
`cdn.landbot.io`, not an npm package).

**Spec:** `docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md`

## Global Constraints

- `pnpm typecheck` (`tsc --noEmit`, strict) must stay at 0 diagnostics after every task.
- `pnpm test` (vitest run) must stay fully green after every task.
- EN/HE parity is enforced by `src/i18n/messages.test.ts`: every key added to `src/i18n/messages/en.ts`
  must get a non-empty value in `src/i18n/messages/he.ts` in the same task.
- RTL-safe styling only: Tailwind logical utilities (`ms/me/ps/pe`, `text-start/-end`, `start-*/end-*`)
  — never `ml/mr/left/right` for layout.
- Never invent product content, prices, or claims (`src/content/pending.test.ts`) — not touched by this
  plan, but no new task may introduce one.
- All internal routes go through the single `PATHS` registry in `src/app/paths.ts` — never a hardcoded
  path string in a component.
- The HubSpot Private App access token must **never** enter this repo in any form (env var, config,
  comment, test fixture) — there is nothing in this plan that needs it; if a future task seems to need
  it, that's a sign the task is out of scope for a frontend-only repo.
- `@` resolves to `src/` (`vite.config.ts` + `tsconfig.json` `paths`) — use it for all internal imports.
- Follow existing patterns for new files: components under `src/app/components/marketing/`, pages under
  `src/app/routes/marketing/`, i18n keys added to *both* `en.ts` and `he.ts` in the same edit.

---

### Task 1: `LandbotFullpageEmbed` component

**Files:**
- Create: `src/app/components/marketing/LandbotFullpageEmbed.tsx`
- Test: `src/app/components/marketing/LandbotFullpageEmbed.test.tsx`
- Modify: `src/i18n/messages/en.ts` (add `hairScan.notConfigured`)
- Modify: `src/i18n/messages/he.ts` (add `hairScan.notConfigured`)

**Interfaces:**
- Produces: `LandbotFullpageEmbed()` — a React component, default export style not used (named export),
  taking no props. `isLandbotConfigured(): boolean` — also exported, for reuse/testing.
- Consumes: `useT` from `@/i18n/LocaleProvider` (existing).

- [ ] **Step 1: Add the `hairScan.notConfigured` i18n key to `en.ts`**

In `src/i18n/messages/en.ts`, find the end of the file:

```ts
  'app.profile.logout': 'Log out',
} as const;
```

Replace with:

```ts
  'app.profile.logout': 'Log out',

  'hairScan.notConfigured': 'Our AI chat is being connected — please check back soon.',
} as const;
```

- [ ] **Step 2: Add the matching key to `he.ts`**

In `src/i18n/messages/he.ts`, find the end of the file:

```ts
  'app.profile.logout': 'התנתקות',
};
```

Replace with:

```ts
  'app.profile.logout': 'התנתקות',

  'hairScan.notConfigured': 'הצ׳אט מבוסס הבינה המלאכותית שלנו בתהליך חיבור — נא לבדוק שוב בקרוב.',
};
```

- [ ] **Step 3: Write the failing test**

Create `src/app/components/marketing/LandbotFullpageEmbed.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '@/i18n/LocaleProvider';

const SCRIPT_ID = 'landbot-fullpage-sdk';
const SCRIPT_SRC = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  document.getElementById(SCRIPT_ID)?.remove();
  vi.useRealTimers();
});

async function renderEmbed() {
  const { LandbotFullpageEmbed } = await import('./LandbotFullpageEmbed');
  render(
    <LocaleProvider localeRegion="en-us">
      <LandbotFullpageEmbed />
    </LocaleProvider>,
  );
}

describe('LandbotFullpageEmbed', () => {
  it('renders a placeholder and injects no script when unconfigured', async () => {
    vi.stubEnv('VITE_LANDBOT_CONFIG_URL', '');
    await renderEmbed();
    expect(screen.getByText('Our AI chat is being connected — please check back soon.')).toBeInTheDocument();
    expect(document.getElementById(SCRIPT_ID)).toBeNull();
  });

  it('injects the Landbot script and constructs Fullpage with configUrl when configured', async () => {
    vi.stubEnv('VITE_LANDBOT_CONFIG_URL', 'https://landbot.example/config.json');
    await renderEmbed();

    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script!.src).toBe(SCRIPT_SRC);
    expect(script!.type).toBe('module');

    const FullpageMock = vi.fn();
    (window as unknown as { Landbot: unknown }).Landbot = { Fullpage: FullpageMock };
    vi.useFakeTimers();
    script!.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(500);

    expect(FullpageMock).toHaveBeenCalledWith({ configUrl: 'https://landbot.example/config.json' });
  });

  it('does not inject a second script tag on repeated mounts', async () => {
    vi.stubEnv('VITE_LANDBOT_CONFIG_URL', 'https://landbot.example/config.json');
    await renderEmbed();
    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
    await renderEmbed();
    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test -- LandbotFullpageEmbed`
Expected: FAIL — `Failed to resolve import "./LandbotFullpageEmbed"` (file doesn't exist yet).

- [ ] **Step 5: Implement the component**

Create `src/app/components/marketing/LandbotFullpageEmbed.tsx`:

```tsx
import { useEffect } from 'react';
import { useT } from '@/i18n/LocaleProvider';

const LANDBOT_SCRIPT_SRC = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
const LANDBOT_SCRIPT_ID = 'landbot-fullpage-sdk';
const CONFIG_URL = import.meta.env.VITE_LANDBOT_CONFIG_URL as string | undefined;

declare global {
  interface Window {
    Landbot?: { Fullpage: new (config: { configUrl: string }) => unknown };
  }
}

/** True only when a Landbot bot config URL is set via Vite env vars. */
export function isLandbotConfigured(): boolean {
  return typeof CONFIG_URL === 'string' && CONFIG_URL.length > 0;
}

/**
 * Fullpage-embeds HairHealth.ai's Landbot lead-gen widget — see
 * docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md.
 * This captures leads into ROOTÉ's HubSpot via HairHealth.ai; it is NOT connected to
 * ROOTÉ's own /analysis flow or session state in any way. Renders a placeholder until
 * `VITE_LANDBOT_CONFIG_URL` is set.
 *
 * Known limitation: Landbot's public docs describe no destroy/unmount API, so
 * navigating away from this route in this client-routed SPA may not tear down
 * whatever DOM the widget injects. Verify once a real configUrl is connected.
 */
export function LandbotFullpageEmbed() {
  const t = useT();

  useEffect(() => {
    if (!isLandbotConfigured()) return;
    if (document.getElementById(LANDBOT_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = LANDBOT_SCRIPT_ID;
    script.type = 'module';
    script.async = true;
    script.addEventListener('load', () => {
      window.setTimeout(() => {
        new window.Landbot!.Fullpage({ configUrl: CONFIG_URL! });
      }, 500);
    });
    script.src = LANDBOT_SCRIPT_SRC;
    document.body.appendChild(script);
  }, []);

  if (!isLandbotConfigured()) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-cream-100 p-8 text-center">
        <p className="font-body text-sm text-muted-foreground">{t('hairScan.notConfigured')}</p>
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test -- LandbotFullpageEmbed`
Expected: PASS (3 tests).

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 8: Commit**

```bash
git add src/app/components/marketing/LandbotFullpageEmbed.tsx src/app/components/marketing/LandbotFullpageEmbed.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add env-gated Landbot Fullpage embed component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DiRKWbJiHoB9wzJidYib5Z"
```

---

### Task 2: `HairScan` page

**Files:**
- Create: `src/app/routes/marketing/HairScan.tsx`
- Test: `src/app/routes/marketing/HairScan.test.tsx`
- Modify: `src/i18n/messages/en.ts` (add `hairScan.title`, `hairScan.intro`, `hairScan.disclosure`, `hairScan.disclosureLink`)
- Modify: `src/i18n/messages/he.ts` (same keys)

**Interfaces:**
- Consumes: `LandbotFullpageEmbed` from `./../../components/marketing/LandbotFullpageEmbed` (Task 1).
  `LegalNotice`, `TextLink` from `@/app/components/roote`. `funnelHeading` from
  `@/app/components/funnel/funnelStyles`. `useT`, `useLocalizedPath` from `@/i18n/LocaleProvider`.
- Produces: `HairScan()` — a React component, named export, no props. Consumed by Task 3's route
  registration.

- [ ] **Step 1: Add the four `hairScan.*` copy keys to `en.ts`**

In `src/i18n/messages/en.ts`, find:

```ts
  'hairScan.notConfigured': 'Our AI chat is being connected — please check back soon.',
} as const;
```

Replace with:

```ts
  'hairScan.notConfigured': 'Our AI chat is being connected — please check back soon.',
  'hairScan.title': 'Chat with our AI hair scan',
  'hairScan.intro':
    "Answer a few quick questions and share a photo — our partner's AI will look at your hair and get back to our team.",
  'hairScan.disclosure':
    'This chat is powered by our partner, HairHealth.ai. What you share here — your answers and photos — is sent to them and added to our contact list so our team can follow up.',
  'hairScan.disclosureLink': 'See our Privacy Policy',
} as const;
```

- [ ] **Step 2: Add the matching keys to `he.ts`**

In `src/i18n/messages/he.ts`, find:

```ts
  'hairScan.notConfigured': 'הצ׳אט מבוסס הבינה המלאכותית שלנו בתהליך חיבור — נא לבדוק שוב בקרוב.',
};
```

Replace with:

```ts
  'hairScan.notConfigured': 'הצ׳אט מבוסס הבינה המלאכותית שלנו בתהליך חיבור — נא לבדוק שוב בקרוב.',
  'hairScan.title': 'שוחחו עם סורק השיער מבוסס הבינה המלאכותית שלנו',
  'hairScan.intro':
    'ענו על כמה שאלות קצרות ושתפו תמונה — הבינה המלאכותית של השותפה שלנו תבחן את השיער שלכם ותעביר את התוצאה לצוות שלנו.',
  'hairScan.disclosure':
    'הצ׳אט הזה מופעל על ידי השותפה שלנו, HairHealth.ai. המידע שתשתפו כאן — התשובות והתמונות שלכם — נשלח אליה ומתווסף לרשימת אנשי הקשר שלנו כדי שהצוות שלנו יוכל ליצור איתכם קשר.',
  'hairScan.disclosureLink': 'קראו את מדיניות הפרטיות שלנו',
};
```

- [ ] **Step 3: Write the failing test**

Create `src/app/routes/marketing/HairScan.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { HairScan } from './HairScan';

function renderHairScan() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <LocaleProvider localeRegion="en-us">
            <HairScan />
          </LocaleProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

describe('HairScan', () => {
  it('renders the title and a disclosure linking to Privacy', () => {
    renderHairScan();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Chat with our AI hair scan');
    expect(screen.getByText(/HairHealth\.ai/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See our Privacy Policy' })).toHaveAttribute('href', '/en-us/privacy');
  });

  it('renders the not-yet-configured placeholder when Landbot is unset', () => {
    renderHairScan();
    expect(screen.getByText('Our AI chat is being connected — please check back soon.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test -- HairScan`
Expected: FAIL — `Failed to resolve import "./HairScan"`.

- [ ] **Step 5: Implement the page**

Create `src/app/routes/marketing/HairScan.tsx`:

```tsx
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { LegalNotice, TextLink } from '@/app/components/roote';
import { LandbotFullpageEmbed } from '@/app/components/marketing/LandbotFullpageEmbed';
import { funnelHeading } from '@/app/components/funnel/funnelStyles';

export function HairScan() {
  const t = useT();
  const withLocale = useLocalizedPath();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-3">
        <h1 className={funnelHeading}>{t('hairScan.title')}</h1>
        <p className="font-body text-sm text-muted-foreground">{t('hairScan.intro')}</p>
      </div>
      <LegalNotice>
        {t('hairScan.disclosure')}{' '}
        <TextLink to={withLocale('/privacy')}>{t('hairScan.disclosureLink')}</TextLink>
      </LegalNotice>
      <LandbotFullpageEmbed />
    </main>
  );
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test -- HairScan`
Expected: PASS (2 tests).

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 8: Commit**

```bash
git add src/app/routes/marketing/HairScan.tsx src/app/routes/marketing/HairScan.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add HairScan lead-gen page wrapping the Landbot embed

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DiRKWbJiHoB9wzJidYib5Z"
```

---

### Task 3: Route wiring (`/hair-scan`)

**Files:**
- Modify: `src/app/paths.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `HairScan` from `./routes/marketing/HairScan` (Task 2).
- Produces: `PATHS.hairScan` (`'/hair-scan'`), consumed by Task 4's nav link.

- [ ] **Step 1: Add `PATHS.hairScan`**

In `src/app/paths.ts`, find:

```ts
  login: '/login',

  analysis: '/analysis',
```

Replace with:

```ts
  login: '/login',
  hairScan: '/hair-scan',

  analysis: '/analysis',
```

- [ ] **Step 2: Import `HairScan` in `App.tsx`**

In `src/app/App.tsx`, find:

```ts
import { FunnelShell } from './components/shell/FunnelShell';
import { marketingRoutes } from './routes/marketing/marketingRoutes';
```

Replace with:

```ts
import { FunnelShell } from './components/shell/FunnelShell';
import { HairScan } from './routes/marketing/HairScan';
import { marketingRoutes } from './routes/marketing/marketingRoutes';
```

- [ ] **Step 3: Register the route inside the existing `FunnelShell` block**

In `src/app/App.tsx`, find:

```ts
        children: [
          { path: 'login', element: <LoginPage /> },
          {
            path: 'program',
```

Replace with:

```ts
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'hair-scan', element: <HairScan /> },
          {
            path: 'program',
```

- [ ] **Step 4: Run the full suite to confirm nothing broke**

Run: `pnpm test`
Expected: PASS, no regressions (existing `App.test.tsx` constructs the same router tree this change
modifies).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 6: Manual smoke check**

Run: `pnpm dev`, visit `http://localhost:5173/en-us/hair-scan` in a browser. Expected: the page renders
with the title, disclosure, and "not yet connected" placeholder (no `VITE_LANDBOT_CONFIG_URL` is set in
local dev). Stop the dev server after confirming.

- [ ] **Step 7: Commit**

```bash
git add src/app/paths.ts src/app/App.tsx
git commit -m "feat: register /hair-scan route inside FunnelShell

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DiRKWbJiHoB9wzJidYib5Z"
```

---

### Task 4: Header nav link

**Files:**
- Modify: `src/app/components/shell/Header.tsx`
- Modify: `src/app/components/shell/Header.test.tsx`
- Modify: `src/i18n/messages/en.ts` (add `marketing.nav.hairScan`)
- Modify: `src/i18n/messages/he.ts` (same key)

**Interfaces:**
- Consumes: `PATHS.hairScan` (Task 3).

- [ ] **Step 1: Add the `marketing.nav.hairScan` key to `en.ts`**

In `src/i18n/messages/en.ts`, find:

```ts
  'marketing.nav.about': 'About',
  'marketing.nav.more': 'More',
```

Replace with:

```ts
  'marketing.nav.about': 'About',
  'marketing.nav.hairScan': 'AI Chat',
  'marketing.nav.more': 'More',
```

- [ ] **Step 2: Add the matching key to `he.ts`**

In `src/i18n/messages/he.ts`, find:

```ts
  'marketing.nav.about': 'אודות',
  'marketing.nav.more': 'עוד',
```

Replace with:

```ts
  'marketing.nav.about': 'אודות',
  'marketing.nav.hairScan': 'צ׳אט AI',
  'marketing.nav.more': 'עוד',
```

- [ ] **Step 3: Update the failing assertions in `Header.test.tsx` first**

In `src/app/components/shell/Header.test.tsx`, find:

```tsx
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en-us/about');
    expect(screen.getByRole('link', { name: 'Start free hair analysis' })).toHaveAttribute('href', '/en-us/analysis');
```

Replace with:

```tsx
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en-us/about');
    expect(within(nav).getByRole('link', { name: 'AI Chat' })).toHaveAttribute('href', '/en-us/hair-scan');
    expect(screen.getByRole('link', { name: 'Start free hair analysis' })).toHaveAttribute('href', '/en-us/analysis');
```

And find:

```tsx
    expect(within(dialog).getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/en-us/products');
    expect(within(dialog).getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/en-us/account');
```

Replace with:

```tsx
    expect(within(dialog).getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/en-us/products');
    expect(within(dialog).getByRole('link', { name: 'AI Chat' })).toHaveAttribute('href', '/en-us/hair-scan');
    expect(within(dialog).getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/en-us/account');
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test -- Header`
Expected: FAIL — the new "AI Chat" links don't exist yet.

- [ ] **Step 5: Add the nav entry**

In `src/app/components/shell/Header.tsx`, find:

```ts
const NAV: Array<[key: MessageKey, to: string]> = [
  ['marketing.nav.products', PATHS.products],
  ['marketing.nav.howItWorks', PATHS.howItWorks],
  ['marketing.nav.science', PATHS.science],
  ['marketing.nav.about', PATHS.about],
];
```

Replace with:

```ts
const NAV: Array<[key: MessageKey, to: string]> = [
  ['marketing.nav.products', PATHS.products],
  ['marketing.nav.howItWorks', PATHS.howItWorks],
  ['marketing.nav.science', PATHS.science],
  ['marketing.nav.about', PATHS.about],
  ['marketing.nav.hairScan', PATHS.hairScan],
];
```

(This single array feeds both the desktop `nav` and the mobile drawer's link list, since the drawer
spreads `...NAV` — no second edit needed for mobile.)

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test -- Header`
Expected: PASS (4 tests).

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 8: Commit**

```bash
git add src/app/components/shell/Header.tsx src/app/components/shell/Header.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: surface /hair-scan as an AI Chat nav link

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DiRKWbJiHoB9wzJidYib5Z"
```

---

### Task 5: Correct the privacy-policy claims naming HairHealth.ai

**Files:**
- Modify: `src/i18n/messages/en.ts` (`marketing.legal.privacy.s2.body`, `marketing.legal.privacy.s5.body`)
- Modify: `src/i18n/messages/he.ts` (same two keys)
- Modify: `src/content/roote.config.ts` (`disclaimers.demo`)

**Interfaces:** None — copy-only change, no new exports.

This is a factual correction, not new behavior, so there's no new test to write first — the existing
`src/i18n/messages.test.ts` (parity/non-empty check) and `src/content/pending.test.ts` are the
regression guard. Run them after editing to confirm nothing broke.

- [ ] **Step 1: Fix `marketing.legal.privacy.s2.body` in `en.ts`**

In `src/i18n/messages/en.ts`, find:

```ts
  'marketing.legal.privacy.s2.body':
    'Your photos and questionnaire answers are used only to produce your hair assessment and personalized plan, and to show you before/after comparisons over time. In this preview build the assessment runs entirely in your browser. If a clinical analysis provider (hairhealth.ai) is enabled for your session, your photos and answers are sent to that provider solely to generate the assessment; otherwise they never leave your device. We do not use your photos for advertising, model training, or any purpose you have not agreed to.',
```

Replace with:

```ts
  'marketing.legal.privacy.s2.body':
    'Your photos and questionnaire answers are used only to produce your hair assessment and personalized plan, and to show you before/after comparisons over time. In this preview build the assessment runs entirely in your browser and never leaves your device. If you separately use our AI hair chat, see the next section for how that data is handled. We do not use your photos for advertising, model training, or any purpose you have not agreed to.',
```

- [ ] **Step 2: Fix `marketing.legal.privacy.s5.body` in `en.ts`**

In `src/i18n/messages/en.ts`, find:

```ts
  'marketing.legal.privacy.s5.body':
    'We do not sell your personal data. In this preview build the only third parties involved are Google Fonts, which serves the site’s typefaces, and — if enabled for your session — the hairhealth.ai analysis provider, which receives your photos and answers to generate your assessment. Production services for payment, shipping, email, and hosting will be listed here as they are added.', // TODO: confirm the production sub-processor list with client
```

Replace with:

```ts
  'marketing.legal.privacy.s5.body':
    'We do not sell your personal data. In this preview build the third parties involved are Google Fonts, which serves the site’s typefaces, and — if you use our AI hair chat — our partner HairHealth.ai, which receives what you share there (your answers and photos) and adds it to our contact list via HubSpot so our team can follow up with you. Production services for payment, shipping, email, and hosting will be listed here as they are added.', // TODO: confirm the production sub-processor list with client
```

- [ ] **Step 3: Fix the matching two keys in `he.ts`**

In `src/i18n/messages/he.ts`, find:

```ts
  'marketing.legal.privacy.s2.body':
    'התמונות והתשובות לשאלון משמשות אך ורק להפקת הערכת השיער והתוכנית האישית שלכם, ולהצגת השוואות ״לפני ואחרי״ לאורך זמן. בגרסת התצוגה הזו ההערכה מתבצעת כולה בדפדפן שלכם. אם ספק ניתוח קליני (hairhealth.ai) מופעל עבור הפעלתכם, התמונות והתשובות נשלחות לאותו ספק אך ורק לצורך הפקת ההערכה; אחרת הן אינן עוזבות את המכשיר שלכם. איננו משתמשים בתמונות שלכם לפרסום, לאימון מודלים, או לכל מטרה שלא הסכמתם לה.',
```

Replace with:

```ts
  'marketing.legal.privacy.s2.body':
    'התמונות והתשובות לשאלון משמשות אך ורק להפקת הערכת השיער והתוכנית האישית שלכם, ולהצגת השוואות ״לפני ואחרי״ לאורך זמן. בגרסת התצוגה הזו ההערכה מתבצעת כולה בדפדפן שלכם ואינה עוזבת את המכשיר שלכם. אם אתם משתמשים בנפרד בצ׳אט השיער מבוסס הבינה המלאכותית שלנו, ראו את הסעיף הבא לגבי אופן הטיפול במידע הזה. איננו משתמשים בתמונות שלכם לפרסום, לאימון מודלים, או לכל מטרה שלא הסכמתם לה.',
```

And find:

```ts
  'marketing.legal.privacy.s5.body':
    'איננו מוכרים את המידע האישי שלכם. בגרסת התצוגה הזו הצדדים השלישיים היחידים המעורבים הם Google Fonts, המספק את הגופנים של האתר, ו — אם מופעל עבור הפעלתכם — ספק הניתוח hairhealth.ai, המקבל את התמונות והתשובות שלכם לצורך הפקת ההערכה. שירותי הייצור לתשלום, משלוח, אימייל ואירוח יפורטו כאן עם הוספתם.', // TODO: confirm the production sub-processor list with client
```

Replace with:

```ts
  'marketing.legal.privacy.s5.body':
    'איננו מוכרים את המידע האישי שלכם. בגרסת התצוגה הזו הצדדים השלישיים המעורבים הם Google Fonts, המספק את הגופנים של האתר, וכן — אם אתם משתמשים בצ׳אט השיער מבוסס הבינה המלאכותית שלנו — השותפה שלנו HairHealth.ai, המקבלת את מה ששיתפתם שם (התשובות והתמונות שלכם) ומוסיפה זאת לרשימת אנשי הקשר שלנו דרך HubSpot כדי שצוותנו יוכל ליצור איתכם קשר. שירותי הייצור לתשלום, משלוח, אימייל ואירוח יפורטו כאן עם הוספתם.', // TODO: confirm the production sub-processor list with client
```

- [ ] **Step 4: Fix `disclaimers.demo` in `roote.config.ts`**

In `src/content/roote.config.ts`, find:

```ts
    demo:           { en: 'Demo: analysis figures are illustrative; production integrates hairhealth.ai.', he: 'הדגמה: הנתונים להמחשה בלבד; בגרסה המלאה משולבת מערכת hairhealth.ai.' } as LocalizedText,
```

Replace with:

```ts
    demo:           { en: 'Demo: analysis figures are illustrative; production integrates a clinical analysis provider.', he: 'הדגמה: הנתונים להמחשה בלבד; בגרסה המלאה תשולב מערכת ניתוח קלינית.' } as LocalizedText,
```

- [ ] **Step 5: Run the regression guards**

Run: `pnpm test -- messages`
Expected: PASS (EN/HE parity, no empty values).

Run: `pnpm test -- pending`
Expected: PASS (unrelated to this change, but confirms no accidental breakage of `roote.config.ts`).

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/messages/en.ts src/i18n/messages/he.ts src/content/roote.config.ts
git commit -m "fix: correct privacy-policy claims that named hairhealth.ai as the in-app assessment's data recipient

HairHealth.ai never receives data from the in-app /analysis flow — that flow is
fully local. The privacy policy incorrectly claimed otherwise. Corrected to
accurately describe the /analysis flow (fully local) and disclose the real
third-party flow (the new /hair-scan AI chat, which does send data to
HairHealth.ai/HubSpot).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DiRKWbJiHoB9wzJidYib5Z"
```

---

### Task 6: Generalize the stale CV-provider seam (`hairhealthAdapter.ts` → `remoteAnalysisAdapter.ts`)

**Files:**
- Create: `src/domain/analysis/remoteAnalysisAdapter.ts`
- Delete: `src/domain/analysis/hairhealthAdapter.ts`
- Modify: `src/domain/analysis/analyzeHair.ts`
- Modify: `src/domain/analysis/provider.ts`
- Modify: `.env.example`
- Modify: `src/domain/tracking/metrics.test.ts`

**Interfaces:**
- Produces: `isRemoteAnalysisConfigured(): boolean`, `requestRemoteAnalysis(input: RemoteAnalysisInput): Promise<HairAnalysis>`, types `RemoteAnalysisInput`, replacing `isHairhealthConfigured`/`requestHairhealthAnalysis`/`HairhealthInput` (deleted).
- Consumes (unchanged from before): `deriveAnalysis`, `RECOMMENDED_DURATION_TABLE` from `./deriveAnalysis`.

This is a mechanical rename with no behavior change beyond the string values of the `source`/`provider`
fields (`'hairhealth'` → `'remote'`), both already typed as free-form strings downstream, so no type
contracts break. There's no new test to write — the existing test suite (which currently has zero
direct tests of `hairhealthAdapter.ts`, since none exist) is the regression guard; this task's own
verification is running the full suite at the end.

- [ ] **Step 1: Create `remoteAnalysisAdapter.ts`**

Create `src/domain/analysis/remoteAnalysisAdapter.ts`:

```ts
import type { Answers, Gender, HairAnalysis, HairGoal } from './types';
import { deriveAnalysis, RECOMMENDED_DURATION_TABLE } from './deriveAnalysis';

const API_URL = import.meta.env.VITE_CV_PROVIDER_API_URL as string | undefined;
const API_KEY = import.meta.env.VITE_CV_PROVIDER_API_KEY as string | undefined;

export type RemoteAnalysisInput = {
  gender: Gender;
  hairGoal: HairGoal;
  answers: Answers;
  photos: { angleKey: string; blob: Blob }[];
};

/** True only when a remote computer-vision analysis endpoint is configured via Vite env vars. */
export function isRemoteAnalysisConfigured(): boolean {
  return typeof API_URL === 'string' && API_URL.length > 0;
}

/**
 * PLACEHOLDER CONTRACT — no computer-vision vendor is under contract for this seam today.
 * HairHealth.ai was the presumed target (PO decision #23, 2026-09-04), but its actual,
 * confirmed integration with ROOTÉ (2026-09-08) is an unrelated Landbot lead-gen widget that
 * writes straight to ROOTÉ's HubSpot — see
 * docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md. It offers no
 * synchronous photo-analysis API back to ROOTÉ. This file stays as an example shape for
 * whichever real CV vendor is contracted later; confirm every field name, the auth scheme,
 * and the scale/severity vocabulary against that vendor's real API docs before relying on it.
 * While `VITE_CV_PROVIDER_API_URL` is unset, `isRemoteAnalysisConfigured()` is false and
 * `analyzeHair` uses the local questionnaire model instead.
 */
type RemoteAnalysisResponse = {
  norwood_stage?: number;
  ludwig_stage?: number;
  severity?: string;
  affected_regions?: string[];
  density_by_region?: Record<string, 'low' | 'medium' | 'high'>;
};

export async function requestRemoteAnalysis(input: RemoteAnalysisInput): Promise<HairAnalysis> {
  if (!isRemoteAnalysisConfigured()) {
    throw new Error('remote analysis provider is not configured (set VITE_CV_PROVIDER_API_URL)');
  }

  const form = new FormData();
  form.append('gender', input.gender);
  form.append('questionnaire', JSON.stringify(input.answers));
  for (const p of input.photos) {
    form.append(`photo_${p.angleKey}`, p.blob, `${p.angleKey}.jpg`);
  }

  const res = await fetch(`${API_URL!.replace(/\/$/, '')}/v1/analyze`, {
    method: 'POST',
    headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
    body: form,
  });
  if (!res.ok) throw new Error(`remote analysis provider responded ${res.status}`);

  return mapResponse((await res.json()) as RemoteAnalysisResponse, input);
}

/**
 * Overlays whatever the remote provider returned onto the fully-populated local model,
 * so every downstream field stays defined. Expand this once a real vendor contract is firm.
 */
function mapResponse(raw: RemoteAnalysisResponse, input: RemoteAnalysisInput): HairAnalysis {
  const base = deriveAnalysis({ gender: input.gender, hairGoal: input.hairGoal, answers: input.answers });
  const remoteStage = input.gender === 'male' ? raw.norwood_stage : raw.ludwig_stage;
  const severityBand =
    raw.severity === 'mild' || raw.severity === 'moderate' || raw.severity === 'established'
      ? raw.severity
      : base.severityBand;

  return {
    ...base,
    stage: typeof remoteStage === 'number' ? remoteStage : base.stage,
    severityBand,
    recommendedDurationDays:
      RECOMMENDED_DURATION_TABLE[`${severityBand}:${base.planEmphasis}`] ?? base.recommendedDurationDays,
  };
}
```

- [ ] **Step 2: Delete the old file**

Run: `rm src/domain/analysis/hairhealthAdapter.ts`

- [ ] **Step 3: Update `analyzeHair.ts`**

Replace the full contents of `src/domain/analysis/analyzeHair.ts` with:

```ts
import type { Answers, Gender, HairAnalysis, HairGoal } from './types';
import { deriveAnalysis } from './deriveAnalysis';
import { isRemoteAnalysisConfigured, requestRemoteAnalysis } from './remoteAnalysisAdapter';

export type AnalyzeHairInput = {
  gender: Gender;
  hairGoal: HairGoal;
  answers: Answers;
  photos?: { angleKey: string; blob: Blob }[];
};

export type AnalyzeHairResult = {
  analysis: HairAnalysis;
  /** Which engine produced the result — `local` is the questionnaire-only fallback. */
  source: 'remote' | 'local';
};

/**
 * Single entry point for hair analysis. Uses the remote CV provider when one is configured
 * and photos are available; otherwise (and on any remote failure) falls back to the
 * deterministic local model built from the questionnaire. No CV vendor is under contract
 * today — see src/domain/analysis/remoteAnalysisAdapter.ts.
 */
export async function analyzeHair(input: AnalyzeHairInput): Promise<AnalyzeHairResult> {
  const local = () => deriveAnalysis({ gender: input.gender, hairGoal: input.hairGoal, answers: input.answers });

  if (isRemoteAnalysisConfigured() && input.photos && input.photos.length > 0) {
    try {
      const analysis = await requestRemoteAnalysis({
        gender: input.gender,
        hairGoal: input.hairGoal,
        answers: input.answers,
        photos: input.photos,
      });
      return { analysis, source: 'remote' };
    } catch (err) {
      console.warn('[roote] remote analysis provider failed; using local model', err);
    }
  }

  return { analysis: local(), source: 'local' };
}
```

- [ ] **Step 4: Update `provider.ts`'s comment block**

In `src/domain/analysis/provider.ts`, find:

```ts
 * PO decision #23 (2026-09-04): the target provider is **HairHealth.ai HairScan**
 * (the consumer, phone-selfie product). Its API contract is `[PENDING]` — do NOT
 * reverse-engineer or guess the request/response schema; wait for the signed
 * contract + docs + credentials. Until then: mock in dev, qualitative production
 * bands only, never a fabricated number. Design the consumer for HairScan-level
 * fields (hair type, density estimate, thickness, loss stage, volume, overall
 * score, image-quality confidence). Do NOT surface trichoscope-grade *ScalpScan*
 * metrics (FU per cm², single/double/triple hair counts) from ordinary selfies
 * unless the vendor contract confirms HairScan returns them.
```

Replace with:

```ts
 * PO decision #23 (2026-09-04) named HairHealth.ai HairScan as the presumed target
 * for this seam. Corrected 2026-09-08: HairHealth.ai's actual, confirmed integration
 * with ROOTÉ is an unrelated Landbot lead-gen widget that writes straight to ROOTÉ's
 * HubSpot (see docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md)
 * — it offers no synchronous photo-analysis API back to ROOTÉ. The vendor for *this*
 * seam is genuinely undecided. Until one is under contract: mock in dev, qualitative
 * production bands only, never a fabricated number. Design the consumer for
 * HairScan-level fields (hair type, density estimate, thickness, loss stage, volume,
 * overall score, image-quality confidence) since that remains a plausible shape for
 * whichever vendor is eventually contracted. Do NOT surface trichoscope-grade
 * *ScalpScan* metrics (FU per cm², single/double/triple hair counts) from ordinary
 * selfies unless a future vendor contract confirms its API returns them.
```

- [ ] **Step 5: Update `provider.ts`'s `source` string and adjacent comment**

In `src/domain/analysis/provider.ts`, find:

```ts
/**
 * Development / concept-build provider. Delegates to `analyzeHair`, which itself
 * uses the deterministic questionnaire model (and the env-gated hairhealth.ai
 * adapter if it happens to be configured).
 */
export const mockHairAnalysisProvider: HairAnalysisProvider = {
  name: 'mock',
  async analyze({ gender, hairGoal, answers, images }) {
    const { analysis, source } = await analyzeHair({ gender, hairGoal, answers, photos: images });
    return {
      analysis,
      source: source === 'hairhealth' ? 'provider' : 'mock',
      isMock: source !== 'hairhealth',
    };
  },
};
```

Replace with:

```ts
/**
 * Development / concept-build provider. Delegates to `analyzeHair`, which itself
 * uses the deterministic questionnaire model (and the env-gated remote CV-provider
 * adapter if one happens to be configured).
 */
export const mockHairAnalysisProvider: HairAnalysisProvider = {
  name: 'mock',
  async analyze({ gender, hairGoal, answers, images }) {
    const { analysis, source } = await analyzeHair({ gender, hairGoal, answers, photos: images });
    return {
      analysis,
      source: source === 'remote' ? 'provider' : 'mock',
      isMock: source !== 'remote',
    };
  },
};
```

- [ ] **Step 6: Update `.env.example`**

Replace the full contents of `.env.example` with:

```
# Remote computer-vision analysis provider (optional) — vendor TBD; no CV vendor is under
# contract today. While unset, the /analysis flow uses the local questionnaire-based model.
# When set, QuestionsScreen POSTs the uploaded photos + questionnaire to this endpoint via
# src/domain/analysis/remoteAnalysisAdapter.ts (confirm that adapter's request/response
# contract against the real vendor's API docs before going live).
VITE_CV_PROVIDER_API_URL=
VITE_CV_PROVIDER_API_KEY=

# HairHealth.ai lead-gen widget (Landbot Fullpage embed) — optional.
# While unset, /hair-scan renders a "not yet connected" placeholder instead of the live widget.
# This captures leads directly into HairHealth.ai's HubSpot integration (see
# docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md) — it is NOT
# connected to ROOTÉ's own /analysis flow or session state in any way.
VITE_LANDBOT_CONFIG_URL=
```

- [ ] **Step 7: Rename the pass-through test value in `metrics.test.ts`**

In `src/domain/tracking/metrics.test.ts`, find:

```ts
    const real = qualitativeMetrics({ analysis, provider: 'hairhealth.ai', isMock: false, capturedAt: 'x' });
    expect(real.every((m) => m.provider === 'hairhealth.ai' && m.isMock === false)).toBe(true);
```

Replace with:

```ts
    const real = qualitativeMetrics({ analysis, provider: 'remote-provider', isMock: false, capturedAt: 'x' });
    expect(real.every((m) => m.provider === 'remote-provider' && m.isMock === false)).toBe(true);
```

- [ ] **Step 8: Run the full test suite**

Run: `pnpm test`
Expected: PASS, no regressions — this confirms the rename didn't miss a reference anywhere (an
unreplaced `hairhealthAdapter` import would fail at collection time, not just in this file's own
tests).

- [ ] **Step 9: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 10: Commit**

```bash
git add -A src/domain/analysis src/domain/tracking/metrics.test.ts .env.example
git commit -m "refactor: rename hairhealthAdapter to remoteAnalysisAdapter, vendor TBD

HairHealth.ai's actual, confirmed product for ROOTÉ (Landbot -> their AI ->
ROOTÉ's own HubSpot) never returns data to ROOTÉ, so it was never a candidate
for this seam's synchronous CV-provider contract. Corrects PO decision #23's
naming; the seam itself (HairAnalysisProvider) is unchanged and stays open
for whichever vendor is eventually contracted.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DiRKWbJiHoB9wzJidYib5Z"
```

---

## Final verification (after Task 6)

- [ ] Run `pnpm typecheck` — 0 diagnostics.
- [ ] Run `pnpm test` — full suite green.
- [ ] Run `pnpm build` — confirm the production build still succeeds (the one large chunk / >500 kB
      warning is expected per `CLAUDE.md`).
- [ ] `git log --oneline -6` — confirm all six task commits are present and in order.
