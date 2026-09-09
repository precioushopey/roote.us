# ROOTÉ P2b — Account + Plan Confirm + Payment Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build spec §7 (brief §12) — the account-creation, recommended-plan-confirmation, and
stubbed-checkout flow that sits between the personalized report (P2a) and the post-purchase app
(P2c). On stubbed payment success, freeze a `Program` record that P2c's dashboard/plan/reminders
screens will consume.

**Architecture:** Three new pure/store modules (`domain/program/types.ts`, `store/auth.ts`,
`store/checkout.ts`, `store/program.ts`) plus a `StartLayout` (Account·Plan·Payment rail, mirroring
`DiagnosisLayout`) wrapping four route components under `/start/*`. `PlanStep` and `CheckoutStep`
reuse `buildReport()` unchanged (it already produces `pricing.compareAll` with an `isRecommended`
flag and `plan.core`/`plan.supporting`) — **no new pricing/duration derivation logic is written**,
only new UI consuming the existing `ReportModel`.

**Tech Stack:** React 18 + react-router 7 (data router), Tailwind v4 utility classes matching the
existing design tokens, Vitest + Testing Library, no new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-01-roote-diagnosis-report-app-design.md` — this plan
implements §7 in full; §8 (P2c) and its `deriveSchedule`/`tasksForDay` are deliberately **out of
scope** here (see Global Constraint 7 below).

## Global Constraints

- No invented stats/claims — pricing/claims continue to trace to `roote.config.ts` or render as
  `[PENDING: ...]` via the existing `PendingChip`/`isPending` machinery. Nothing new is invented.
- RTL/EN-HE parity: every new i18n key gets both `en` and `he` values, added to
  `src/i18n/messages/{en,he}.ts` following the existing flat key-string convention.
- `pnpm test` must stay pristine (no console warnings) after every task.
- Auth is a **mock**, `localStorage`-backed, explicitly commented as not real security. Payment is a
  **stub** behind `// TODO: Marwell — wire to Shopify/payment backend`. Neither performs real network
  I/O. No card data is ever logged or persisted beyond the in-memory form during submission.
- **Ruling (naming collision):** the spec's §7.1 text says the auth hook is `useSession()`. That name
  is already taken by `src/store/sessionStore.tsx`'s existing app-wide session context (diagnosis,
  analysis, reportId, account, program — the whole app's working state, already used by every P0–P2a
  route). This plan's auth store exports **`useAuth()`** instead, holding a distinct, smaller
  `{ email, since } | null` auth session. The spec is authoritative on behavior (mock email+password,
  localStorage-backed, `signUp`/`signIn`/`signOut`); this is a naming adjustment only, forced by a
  collision the spec's author could not see against the actual P0–P2a codebase.
- **Ruling (draft duration):** the spec's §7.2 says selecting a duration "writes `program.durationDays`
  (draft)" — read literally this implies a partially-built `Program` exists before checkout. This plan
  instead adds a plain `draftDurationDays: number | null` field directly to `SessionState` (mirroring
  how `diagnosis`/`analysis` already accumulate there before the report is built). The real `Program`
  record is constructed whole, in one step, by `buildProgram()` only after checkout succeeds — there is
  no partially-built `Program` at any point. Simpler, same user-visible behavior.
- **Ruling (scope boundary with P2c):** spec §7.5 describes both the `Program` type/`program.ts` store
  (needed here, to freeze a program at checkout) **and** `domain/program/deriveSchedule.ts`/
  `tasksForDay` (needed only by P2c's dashboard/plan pages, with no consumer or meaningful test surface
  until then). This plan builds the former; `deriveSchedule.ts` is P2c's Task 1, built alongside its
  first real consumer, per YAGNI.
- Every new route participates in the existing `LocaleProvider`/RTL system — no one-off styling, no
  new design tokens. Reuse `Wordmark`, `LocaleToggle`, `ProgressRail`, `PendingChip` from
  `src/app/components/brand/`.
- Money formatting always goes through the existing `formatMoney`/`Money` type
  (`src/domain/report/money.ts`) — never a hand-rolled `$${amount}`.
- Leave `// TODO: confirm with client` exactly where the spec calls for one (magic-link option,
  shipping fields/IL-vs-international, payment methods) — do not resolve these by guessing.

---

### Task 1: `Program` type

**Files:**
- Create: `src/domain/program/types.ts`
- Test: `src/domain/program/types.test.ts`

**Interfaces:**
- Produces: `Program`, `Treatment` (re-exported alias of the report's per-treatment row shape),
  `ProgramDurationDays` types. Consumed by Tasks 4 (`program.ts` store) and, later, P2c.

- [ ] **Step 1: Write the type**

```ts
// src/domain/program/types.ts
import type { HairAnalysis } from '@/domain/analysis/types';
import type { ReportModel } from '@/domain/report/types';

export type ProgramDurationDays = 90 | 120 | 180 | 270 | 360;

/** Same shape as one row of ReportModel.plan.core/supporting — frozen at checkout time. */
export type Treatment = ReportModel['plan']['core'][number];

export type ProgressPhoto = {
  id: string;
  isoDate: string; // YYYY-MM-DD
  angleKey: 'front' | 'top' | 'crown' | 'hairline';
  blobId: string;
  thumb: string;
};

export type Reminder = {
  taskKey: string;
  times: string[]; // "HH:mm"
  enabled: boolean;
};

export type Program = {
  orderId: string;
  reportId: string;
  analysisSnapshot: HairAnalysis;
  durationDays: ProgramDurationDays;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD, startDate + durationDays
  plan: { core: Treatment[]; supporting: Treatment[] };
  completionLog: Record<string, string[]>; // isoDate -> taskKey[]
  progressPhotos: ProgressPhoto[];
  reminders: Reminder[];
};
```

- [ ] **Step 2: Write a type-shape smoke test**

This file has no runtime logic — the test only confirms the module imports cleanly and a literal
matching the shape compiles/round-trips through `JSON`, which is what actually matters (the whole
`Program` gets `JSON.stringify`d into `localStorage` via `sessionStore`'s existing persistence
effect).

```ts
// src/domain/program/types.test.ts
import { describe, it, expect } from 'vitest';
import type { Program } from './types';

describe('Program type', () => {
  it('round-trips through JSON without losing fields', () => {
    const program: Program = {
      orderId: 'ord-1',
      reportId: 'rep-1',
      analysisSnapshot: {
        scale: 'norwood',
        stage: 3,
        severityBand: 'moderate',
        flaggedZones: [{ zone: 'crown-vertex', severity: 'moderate', noteKey: 'zone-note.crown-vertex' }],
        densityByZone: [{ zone: 'crown-vertex', level: 'medium' }],
        metrics: [{ key: 'pattern-stage', level: 'medium' }],
        notes: [],
        planEmphasis: 'stabilize-regrow',
        summaryPlainKey: 'summary.norwood.moderate',
        recommendedDurationDays: 270,
      },
      durationDays: 270,
      startDate: '2026-09-02',
      endDate: '2027-05-29',
      plan: { core: [], supporting: [] },
      completionLog: {},
      progressPhotos: [],
      reminders: [],
    };
    const round = JSON.parse(JSON.stringify(program)) as Program;
    expect(round).toEqual(program);
  });
});
```

- [ ] **Step 3: Run it**

Run: `pnpm exec vitest run src/domain/program/types.test.ts`
Expected: PASS (1 test).

- [ ] **Step 4: Commit**

```bash
git add src/domain/program/types.ts src/domain/program/types.test.ts
git commit -m "feat: add Program domain type"
```

---

### Task 2: `auth.ts` mock auth store

**Files:**
- Create: `src/store/auth.ts`
- Test: `src/store/auth.test.ts`

**Interfaces:**
- Produces: `AuthProvider`, `useAuth()` returning
  `{ email: string | null; since: string | null; signUp; signIn; signOut }`.
  `signUp(email, password): { ok: true } | { ok: false; error: 'invalid-email' | 'weak-password' | 'duplicate-email' }`.
  `signIn(email, password): { ok: true } | { ok: false; error: 'not-found' | 'wrong-password' }`.
  `signOut(): void`.
- Consumed by: Task 8 (`AccountStep`), Task 6 (`start` guards — an existing auth session skips `/start` → `/start/plan`).

- [ ] **Step 1: Write the failing tests**

```ts
// src/store/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth';

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="email">{auth.email ?? 'none'}</span>
      <button onClick={() => auth.signUp('a@b.com', 'longenough')}>signup</button>
      <button onClick={() => auth.signUp('a@b.com', 'longenough')}>signup-dup</button>
      <button onClick={() => auth.signUp('bad', 'longenough')}>signup-bad-email</button>
      <button onClick={() => auth.signUp('c@d.com', 'short')}>signup-weak</button>
      <button onClick={() => auth.signOut()}>signout</button>
    </div>
  );
}

beforeEach(() => localStorage.clear());

describe('auth store', () => {
  it('signs up, persists an auth session, and rejects a duplicate email', async () => {
    const results: unknown[] = [];
    function Wired() {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="email">{auth.email ?? 'none'}</span>
          <button onClick={() => results.push(auth.signUp('a@b.com', 'longenough'))}>signup</button>
          <button onClick={() => results.push(auth.signUp('a@b.com', 'longenough'))}>signup-again</button>
        </div>
      );
    }
    render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('signup').click());
    expect(screen.getByTestId('email')).toHaveTextContent('a@b.com');
    act(() => screen.getByText('signup-again').click());
    expect(results[1]).toEqual({ ok: false, error: 'duplicate-email' });
  });

  it('rejects an invalid email and a too-short password', () => {
    let last: unknown;
    function Wired() {
      const auth = useAuth();
      return (
        <div>
          <button onClick={() => (last = auth.signUp('not-an-email', 'longenough'))}>bad-email</button>
          <button onClick={() => (last = auth.signUp('e@f.com', 'short'))}>weak</button>
        </div>
      );
    }
    render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('bad-email').click());
    expect(last).toEqual({ ok: false, error: 'invalid-email' });
    act(() => screen.getByText('weak').click());
    expect(last).toEqual({ ok: false, error: 'weak-password' });
  });

  it('signs in with the right password and rejects the wrong one', () => {
    let last: unknown;
    function Wired() {
      const auth = useAuth();
      return (
        <div>
          <button onClick={() => auth.signUp('g@h.com', 'longenough')}>signup</button>
          <button onClick={() => auth.signOut()}>signout</button>
          <button onClick={() => (last = auth.signIn('g@h.com', 'longenough'))}>signin-right</button>
          <button onClick={() => (last = auth.signIn('g@h.com', 'nope-nope'))}>signin-wrong</button>
        </div>
      );
    }
    render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('signup').click());
    act(() => screen.getByText('signout').click());
    act(() => screen.getByText('signin-wrong').click());
    expect(last).toEqual({ ok: false, error: 'wrong-password' });
    act(() => screen.getByText('signin-right').click());
    expect(last).toEqual({ ok: true });
  });

  it('persists the auth session across a remount (localStorage-backed)', () => {
    function Wired() {
      const auth = useAuth();
      return <button onClick={() => auth.signUp('i@j.com', 'longenough')}>signup</button>;
    }
    const { unmount } = render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('signup').click());
    unmount();
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('email')).toHaveTextContent('i@j.com');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/store/auth.test.ts`
Expected: FAIL — `./auth` doesn't exist yet.

- [ ] **Step 3: Implement `src/store/auth.ts`**

```ts
// src/store/auth.ts
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';

type Account = { email: string; digest: string };
type AuthSession = { email: string; since: string } | null;

type SignUpResult = { ok: true } | { ok: false; error: 'invalid-email' | 'weak-password' | 'duplicate-email' };
type SignInResult = { ok: true } | { ok: false; error: 'not-found' | 'wrong-password' };

const ACCOUNTS_KEY = 'accounts';
const SESSION_KEY = 'authSession';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * NOT cryptographic. A stable, non-reversible-looking string derived from the password, used only
 * to detect "same password on sign-in" for this mock/demo auth. Real auth is a backend concern —
 * see the TODO on AuthProvider below.
 */
function digestOf(password: string): string {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0;
  }
  return `d${h}`;
}

function readAccounts(): Record<string, Account> {
  return lsGet<Record<string, Account>>(ACCOUNTS_KEY, {});
}
function writeAccounts(accounts: Record<string, Account>): void {
  lsSet(ACCOUNTS_KEY, accounts);
}
function readSession(): AuthSession {
  return lsGet<AuthSession>(SESSION_KEY, null);
}
function writeSession(session: AuthSession): void {
  lsSet(SESSION_KEY, session);
}

type Ctx = {
  email: string | null;
  since: string | null;
  signUp: (email: string, password: string) => SignUpResult;
  signIn: (email: string, password: string) => SignInResult;
  signOut: () => void;
};

const AuthContext = createContext<Ctx | null>(null);

// TODO: real auth (backend) — Shopify customer accounts / Supabase / Clerk. Everything in this
// file is a client-only mock so the account-creation UI has something real to talk to.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(readSession);

  const value = useMemo<Ctx>(
    () => ({
      email: session?.email ?? null,
      since: session?.since ?? null,
      signUp(email, password) {
        if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid-email' };
        if (password.length < 8) return { ok: false, error: 'weak-password' };
        const accounts = readAccounts();
        if (accounts[email]) return { ok: false, error: 'duplicate-email' };
        accounts[email] = { email, digest: digestOf(password) };
        writeAccounts(accounts);
        const next: AuthSession = { email, since: new Date().toISOString() };
        writeSession(next);
        setSession(next);
        return { ok: true };
      },
      signIn(email, password) {
        const accounts = readAccounts();
        const account = accounts[email];
        if (!account) return { ok: false, error: 'not-found' };
        if (account.digest !== digestOf(password)) return { ok: false, error: 'wrong-password' };
        const next: AuthSession = { email, since: new Date().toISOString() };
        writeSession(next);
        setSession(next);
        return { ok: true };
      },
      signOut() {
        writeSession(null);
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within <AuthProvider>');
  return c;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/store/auth.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite**

Run: `pnpm test`
Expected: unaffected files still green (this store isn't wired into `App.tsx` yet — that's Task 12).

- [ ] **Step 6: Commit**

```bash
git add src/store/auth.ts src/store/auth.test.ts
git commit -m "feat: add mock auth store (signUp/signIn/signOut/useAuth)"
```

---

### Task 3: extend `sessionStore.tsx` with `program` and `draftDurationDays`

**Files:**
- Modify: `src/store/sessionStore.tsx`
- Modify: `src/store/sessionStore.test.tsx`

**Interfaces:**
- Produces: `SessionState.program: Program | null`, `SessionState.draftDurationDays: ProgramDurationDays | null`,
  `useSession().setDraftDurationDays(days)`, `useSession().setProgram(program)`.
- Consumed by: Task 9 (`PlanStep`), Task 10 (`CheckoutStep`), and P2c in full.

- [ ] **Step 1: Extend the test**

Add to `src/store/sessionStore.test.tsx` (keep existing tests; this file already wraps a test
component around `useSession()` — follow its existing pattern exactly):

```tsx
it('stores a draft duration and, separately, a full program', () => {
  // follow this file's existing render-a-probe-component pattern; call
  // session.setDraftDurationDays(180) and assert session.draftDurationDays === 180, then call
  // session.setProgram(<a minimal valid Program literal, same shape as Task 1's test>) and assert
  // session.program?.orderId matches.
});
```

(Read the existing test file first — write this new test using its exact existing helper/wrapper
functions rather than a different pattern.)

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/store/sessionStore.test.tsx`
Expected: FAIL — `setDraftDurationDays`/`setProgram` don't exist.

- [ ] **Step 3: Update `src/store/sessionStore.tsx`**

Add the import, extend `SessionState`, `EMPTY`, `Action`, `reducer`, the context value type, and the
provider's `value` object. Concretely:

```ts
import type { Program, ProgramDurationDays } from '@/domain/program/types';
```

`SessionState`:
```ts
export type SessionState = {
  diagnosis: { gender: Gender | null; photos: PhotoRef[]; answers: Partial<Answers> };
  analysis: HairAnalysis | null;
  reportId: string | null;
  account: { email: string | null };
  draftDurationDays: ProgramDurationDays | null;
  program: Program | null;
};
```

`EMPTY`: add `draftDurationDays: null, program: null` (replacing the old fixed `program: null`).

`Action` union: add
```ts
  | { type: 'SET_DRAFT_DURATION'; days: ProgramDurationDays }
  | { type: 'SET_PROGRAM'; program: Program }
```

`reducer`: add
```ts
    case 'SET_DRAFT_DURATION':
      return { ...state, draftDurationDays: action.days };
    case 'SET_PROGRAM':
      return { ...state, program: action.program };
```

Context value type: add `setDraftDurationDays: (days: ProgramDurationDays) => void;` and
`setProgram: (program: Program) => void;` to the intersection type.

Provider's `value` object: add
```ts
      setDraftDurationDays: (days: ProgramDurationDays) => dispatch({ type: 'SET_DRAFT_DURATION', days }),
      setProgram: (program: Program) => dispatch({ type: 'SET_PROGRAM', program }),
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/store/sessionStore.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the full suite**

Run: `pnpm test`
Expected: still green — every other consumer of `SessionState`/`useSession()` only reads fields that
still exist unchanged (`program: null` was already the type of the empty state; widening it to
`Program | null` is additive and doesn't break `if (!session.program)`-style checks anywhere).

- [ ] **Step 6: Commit**

```bash
git add src/store/sessionStore.tsx src/store/sessionStore.test.tsx
git commit -m "feat: add draftDurationDays and program to SessionState"
```

---

### Task 4: `checkout.ts` payment stub

**Files:**
- Create: `src/store/checkout.ts`
- Test: `src/store/checkout.test.ts`

**Interfaces:**
- Produces: `Order` type, `submitPayment(order: Order): Promise<{ status: 'success'; orderId: string }>`.
- Consumed by: Task 10 (`CheckoutStep`).

- [ ] **Step 1: Write the failing test**

```ts
// src/store/checkout.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { submitPayment, type Order } from './checkout';

const order: Order = {
  reportId: 'rep-1',
  durationDays: 180,
  contact: { name: 'Jane Doe', email: 'jane@example.com', phone: '0500000000', country: 'IL', city: 'Tel Aviv', postal: '1234567' },
  card: { last4: '4242', expiry: '12/29' },
};

beforeEach(() => localStorage.removeItem('roote.debug.forceCheckoutFailure'));

describe('checkout stub', () => {
  it('resolves success with a fresh orderId, and stores no card data', async () => {
    const result = await submitPayment(order);
    expect(result.status).toBe('success');
    expect(result.orderId).toMatch(/^ord-/);
    // No key anywhere under localStorage should contain a full card number or CVC.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      expect(localStorage.getItem(key)).not.toMatch(/\d{13,19}/);
    }
  });

  it('produces a different orderId on each call', async () => {
    const a = await submitPayment(order);
    const b = await submitPayment(order);
    expect(a.orderId).not.toBe(b.orderId);
  });

  it('rejects when the dev-only forced-failure flag is set', async () => {
    localStorage.setItem('roote.debug.forceCheckoutFailure', '1');
    await expect(submitPayment(order)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/store/checkout.test.ts`
Expected: FAIL — `./checkout` doesn't exist.

- [ ] **Step 3: Implement `src/store/checkout.ts`**

```ts
// src/store/checkout.ts
export type Order = {
  reportId: string;
  durationDays: number;
  contact: { name: string; email: string; phone: string; country: string; city: string; postal: string };
  card: { last4: string; expiry: string }; // only the last4 + expiry ever leave the payment form
};

let counter = 0;
function nextOrderId(): string {
  counter += 1;
  return `ord-${Date.now()}-${counter}`;
}

// TODO: Marwell — wire to Shopify/payment backend.
// Stub: resolves { status: 'success', orderId } after a short delay. No card data is stored or
// logged anywhere (the Order type itself never carries a full card number or CVC — see CheckoutStep,
// which discards them immediately after building this object). Replace with a real Shopify Checkout
// session / payment intent call.
export async function submitPayment(_order: Order): Promise<{ status: 'success'; orderId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (import.meta.env.DEV && localStorage.getItem('roote.debug.forceCheckoutFailure') === '1') {
    throw new Error('Payment failed (dev-forced failure — clear roote.debug.forceCheckoutFailure to disable)');
  }
  return { status: 'success', orderId: nextOrderId() };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/store/checkout.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/store/checkout.ts src/store/checkout.test.ts
git commit -m "feat: add stubbed checkout submitPayment"
```

---

### Task 5: `program.ts` — `buildProgram`

**Files:**
- Create: `src/store/program.ts`
- Test: `src/store/program.test.ts`

**Interfaces:**
- Consumes: `Program`, `Treatment` from `@/domain/program/types`; `ReportModel` from `@/domain/report/types`; `HairAnalysis` from `@/domain/analysis/types`.
- Produces: `buildProgram(input): Program`.
- Consumed by: Task 10 (`CheckoutStep`, on payment success).

- [ ] **Step 1: Write the failing test**

```ts
// src/store/program.test.ts
import { describe, it, expect } from 'vitest';
import { buildProgram } from './program';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

describe('buildProgram', () => {
  it('freezes plan, analysis, and computes endDate from durationDays', () => {
    const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
    const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
    const analysis = deriveAnalysis({ gender: 'male', answers });
    const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: 'en', reportId: 'rep-9' });

    const program = buildProgram({
      orderId: 'ord-9',
      reportId: 'rep-9',
      analysis,
      durationDays: 180,
      plan: model.plan,
      today: new Date('2026-09-02T00:00:00.000Z'),
    });

    expect(program.orderId).toBe('ord-9');
    expect(program.reportId).toBe('rep-9');
    expect(program.durationDays).toBe(180);
    expect(program.startDate).toBe('2026-09-02');
    expect(program.endDate).toBe('2027-03-01'); // 2026-09-02 + 180 days
    expect(program.analysisSnapshot).toEqual(analysis);
    expect(program.plan.core).toEqual(model.plan.core);
    expect(program.plan.supporting).toEqual(model.plan.supporting);
    expect(program.completionLog).toEqual({});
    expect(program.progressPhotos).toEqual([]);
    expect(program.reminders).toEqual([]);
  });

  it('never mutates the analysis object it is given', () => {
    const analysis = deriveAnalysis({ gender: 'female', answers: { q1_area: 'crown', q2_onset: 'lt-1y', q3_prior: 'never', q4_family: 'no', q5_goal: 'regrow' } });
    const before = JSON.stringify(analysis);
    buildProgram({ orderId: 'o', reportId: 'r', analysis, durationDays: 90, plan: { core: [], supporting: [], formula: null } as never, today: new Date() });
    expect(JSON.stringify(analysis)).toBe(before);
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/store/program.test.ts`
Expected: FAIL — `./program` doesn't exist.

- [ ] **Step 3: Implement `src/store/program.ts`**

```ts
// src/store/program.ts
import type { HairAnalysis } from '@/domain/analysis/types';
import type { ReportModel } from '@/domain/report/types';
import type { Program, ProgramDurationDays } from '@/domain/program/types';

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDate(d);
}

/** Builds a frozen Program from the just-purchased order. Pure aside from reading `today`. */
export function buildProgram(input: {
  orderId: string;
  reportId: string;
  analysis: HairAnalysis;
  durationDays: ProgramDurationDays;
  plan: Pick<ReportModel['plan'], 'core' | 'supporting'>;
  today?: Date;
}): Program {
  const startDate = toIsoDate(input.today ?? new Date());
  return {
    orderId: input.orderId,
    reportId: input.reportId,
    analysisSnapshot: input.analysis,
    durationDays: input.durationDays,
    startDate,
    endDate: addDays(startDate, input.durationDays),
    plan: { core: input.plan.core, supporting: input.plan.supporting },
    completionLog: {},
    progressPhotos: [],
    reminders: [],
  };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/store/program.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/store/program.ts src/store/program.test.ts
git commit -m "feat: add buildProgram"
```

---

### Task 6: `/start` guards + dev seed helper

**Files:**
- Create: `src/app/routes/start/guards.ts`
- Create: `src/app/routes/start/guards.test.ts`
- Create: `src/store/devSeed.ts`
- Create: `src/store/devSeed.test.ts`

**Interfaces:**
- Produces: `START_STEPS`, `redirectForStartStep(step, session, authEmail): string | null`;
  `seedDiagnosisAndReport(): { diagnosis, analysis, reportId }` (dev-only helper — a coherent,
  fixed persona, reusing `deriveAnalysis`, so `/start` is reachable without walking the whole
  diagnosis flow).
- Consumed by: Task 7 (`StartLayout`).

- [ ] **Step 1: Write the failing tests**

```ts
// src/app/routes/start/guards.test.ts
import { describe, it, expect } from 'vitest';
import { redirectForStartStep } from './guards';
import type { SessionState } from '@/store/sessionStore';

const base: SessionState = {
  diagnosis: { gender: null, photos: [], answers: {} },
  analysis: null,
  reportId: 'rep-1',
  account: { email: null },
  draftDurationDays: null,
  program: null,
};

describe('redirectForStartStep', () => {
  it('account: no redirect needed on its own step', () => {
    expect(redirectForStartStep('account', base, null)).toBeNull();
  });
  it('account: redirects to plan when already authenticated', () => {
    expect(redirectForStartStep('account', base, 'a@b.com')).toBe('/start/plan');
  });
  it('plan: redirects back to account when not authenticated', () => {
    expect(redirectForStartStep('plan', base, null)).toBe('/start');
  });
  it('checkout: redirects to plan when no duration is selected', () => {
    expect(redirectForStartStep('checkout', base, 'a@b.com')).toBe('/start/plan');
  });
  it('checkout: no redirect once a duration is selected', () => {
    expect(redirectForStartStep('checkout', { ...base, draftDurationDays: 180 }, 'a@b.com')).toBeNull();
  });
  it('success: redirects to start when there is no program', () => {
    expect(redirectForStartStep('success', base, 'a@b.com')).toBe('/start');
  });
});
```

```ts
// src/store/devSeed.test.ts
import { describe, it, expect } from 'vitest';
import { seedDiagnosisAndReport } from './devSeed';

describe('seedDiagnosisAndReport', () => {
  it('produces a coherent, complete diagnosis + analysis + reportId', () => {
    const seed = seedDiagnosisAndReport();
    expect(seed.diagnosis.gender).not.toBeNull();
    expect(seed.analysis.recommendedDurationDays).toBeGreaterThan(0);
    expect(seed.reportId).toMatch(/^rep-/);
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `pnpm exec vitest run src/app/routes/start/guards.test.ts src/store/devSeed.test.ts`
Expected: FAIL — neither module exists.

- [ ] **Step 3: Implement `src/app/routes/start/guards.ts`**

```ts
// src/app/routes/start/guards.ts
import type { SessionState } from '@/store/sessionStore';

export const START_STEPS = ['account', 'plan', 'checkout', 'success'] as const;
export type StartStep = (typeof START_STEPS)[number];

export function redirectForStartStep(step: StartStep, s: SessionState, authEmail: string | null): string | null {
  switch (step) {
    case 'account':
      return authEmail ? '/start/plan' : null;
    case 'plan':
      return authEmail ? null : '/start';
    case 'checkout':
      if (!authEmail) return '/start';
      return s.draftDurationDays ? null : '/start/plan';
    case 'success':
      if (!authEmail) return '/start';
      return s.program ? null : '/start';
    default:
      return null;
  }
}
```

- [ ] **Step 4: Implement `src/store/devSeed.ts`**

```ts
// src/store/devSeed.ts
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import type { SessionState } from '@/store/sessionStore';

/** Dev-only: a fixed, coherent persona so /start (and later /app) are reachable without walking
 *  the whole diagnosis flow by hand. Never imported outside import.meta.env.DEV call sites. */
export function seedDiagnosisAndReport(): {
  diagnosis: SessionState['diagnosis'];
  analysis: ReturnType<typeof deriveAnalysis>;
  reportId: string;
} {
  const answers = {
    q1_area: 'crown',
    q2_onset: '1-5y',
    q3_prior: 'no-success',
    q4_family: 'yes',
    q5_goal: 'both',
  } as const;
  const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
  const analysis = deriveAnalysis({ gender: 'male', answers });
  return { diagnosis, analysis, reportId: `rep-dev-${Date.now()}` };
}
```

- [ ] **Step 5: Run them and watch them pass**

Run: `pnpm exec vitest run src/app/routes/start/guards.test.ts src/store/devSeed.test.ts`
Expected: PASS (7 tests total).

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/start/guards.ts src/app/routes/start/guards.test.ts src/store/devSeed.ts src/store/devSeed.test.ts
git commit -m "feat: add /start guards and a dev-only diagnosis/report seed helper"
```

---

### Task 7: `StartLayout`

**Files:**
- Create: `src/app/routes/start/StartLayout.tsx`
- Create: `src/app/routes/start/StartLayout.test.tsx`

**Interfaces:**
- Consumes: `useSession()`, `useAuth()`, `useT()`, `ProgressRail`, `Wordmark`, `LocaleToggle`,
  `redirectForStartStep`, `seedDiagnosisAndReport`.
- Produces: `<StartLayout />` — resolves `?report=` (or falls back to `session.reportId`), renders
  the Account·Plan·Payment `ProgressRail`, redirects per `redirectForStartStep`, and renders an
  inline "no resolvable report" state (with a dev-only seed button) when neither resolves.

- [ ] **Step 1: Write the test**

```tsx
// src/app/routes/start/StartLayout.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { StartLayout } from './StartLayout';

function renderAt(path: string, seed?: Record<string, unknown>) {
  if (seed) localStorage.setItem('roote.session', JSON.stringify(seed));
  const router = createMemoryRouter(
    [{ path: '/start', element: <StartLayout />, children: [{ index: true, element: <div>account-step</div> }] }],
    { initialEntries: [path] },
  );
  return render(
    <LocaleProvider>
      <AuthProvider>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </AuthProvider>
    </LocaleProvider>,
  );
}

describe('StartLayout', () => {
  it('shows a no-resolvable-report state with no reportId and no ?report= param', () => {
    renderAt('/start');
    expect(screen.getByRole('button', { name: /diagnos/i })).toBeInTheDocument();
  });

  it('resolves the report from the ?report= query param and renders the nested route', () => {
    renderAt('/start?report=rep-123');
    expect(screen.getByText('account-step')).toBeInTheDocument();
  });

  it('resolves the report from the persisted session when there is no query param', () => {
    renderAt('/start', { reportId: 'rep-456', diagnosis: { gender: 'male', photos: [], answers: {} }, analysis: null, account: { email: null }, draftDurationDays: null, program: null });
    expect(screen.getByText('account-step')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/start/StartLayout.test.tsx`
Expected: FAIL — `./StartLayout` doesn't exist.

- [ ] **Step 3: Implement `src/app/routes/start/StartLayout.tsx`**

```tsx
// src/app/routes/start/StartLayout.tsx
import { Outlet, useLocation, useSearchParams } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';
import { Wordmark } from '@/app/components/brand/Wordmark';
import { LocaleToggle } from '@/app/components/brand/LocaleToggle';
import { ProgressRail } from '@/app/components/brand/ProgressRail';
import { redirectForStartStep, START_STEPS, type StartStep } from './guards';
import { seedDiagnosisAndReport } from '@/store/devSeed';

export function StartLayout() {
  const t = useT();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const session = useSession();
  const auth = useAuth();

  const seg = pathname.split('/')[2]; // undefined for /start, 'plan' | 'checkout' | 'success' otherwise
  const step: StartStep = (START_STEPS as readonly string[]).includes(seg ?? '') ? (seg as StartStep) : 'account';
  const current = START_STEPS.indexOf(step);

  const queryReportId = searchParams.get('report');
  const reportId = queryReportId ?? session.reportId;

  if (!reportId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">{t('start.noReport.body')}</p>
        {import.meta.env.DEV && (
          <button
            type="button"
            className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground"
            onClick={() => {
              const seed = seedDiagnosisAndReport();
              session.setAnalysis(seed.analysis);
              session.setReportId(seed.reportId);
            }}
          >
            {t('start.noReport.devSeedCta')}
          </button>
        )}
      </div>
    );
  }

  const redirect = redirectForStartStep(step, session, auth.email);
  if (redirect) return <Navigate to={redirect} replace />;

  const labels = [t('start.rail.account'), t('start.rail.plan'), t('start.rail.payment')];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <LocaleToggle />
      </header>
      <div className="px-6 pb-2">
        <ProgressRail steps={labels} current={Math.max(0, Math.min(2, current))} />
      </div>
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

Note the `Navigate` import is missing from that block on purpose — add
`import { Navigate } from 'react-router';` alongside the other `react-router` import at the top.

- [ ] **Step 4: Add the two new i18n keys**

`src/i18n/messages/en.ts` (near the other `landing.*`/`report.*` keys):
```ts
  'start.rail.account': 'Account',
  'start.rail.plan': 'Plan',
  'start.rail.payment': 'Payment',
  'start.noReport.body': 'We need a completed hair analysis before you can create your program.',
  'start.noReport.devSeedCta': 'Load a demo report (dev only)',
```

`src/i18n/messages/he.ts`:
```ts
  'start.rail.account': 'חשבון',
  'start.rail.plan': 'תוכנית',
  'start.rail.payment': 'תשלום',
  'start.noReport.body': 'עליך להשלים ניתוח שיער לפני יצירת התוכנית שלך.',
  'start.noReport.devSeedCta': 'טעינת דוח הדגמה (למפתחים בלבד)',
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/start/StartLayout.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Run the full suite**

Run: `pnpm test`
Expected: green (this route isn't wired into `App.tsx` yet — Task 12 — so nothing else is affected;
this task's own test constructs its own memory router).

- [ ] **Step 7: Commit**

```bash
git add src/app/routes/start/StartLayout.tsx src/app/routes/start/StartLayout.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add StartLayout with Account·Plan·Payment rail"
```

---

### Task 8: `AccountStep`

**Files:**
- Create: `src/app/routes/start/AccountStep.tsx`
- Create: `src/app/routes/start/AccountStep.test.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `useSession()` (for the pre-filled email from §5.5's `ready.email` step),
  `useNavigate`.
- Produces: `<AccountStep />` — sign-up form (email prefilled, password), inline errors, a disabled
  magic-link `// TODO` option, navigates to `/start/plan` on success.

- [ ] **Step 1: Write the test**

```tsx
// src/app/routes/start/AccountStep.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { AccountStep } from './AccountStep';

function renderAt() {
  localStorage.setItem('roote.locale', 'en');
  const router = createMemoryRouter(
    [
      { path: '/start', element: <AccountStep /> },
      { path: '/start/plan', element: <div>plan-step</div> },
    ],
    { initialEntries: ['/start'] },
  );
  return render(
    <LocaleProvider>
      <AuthProvider>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </AuthProvider>
    </LocaleProvider>,
  );
}

describe('AccountStep', () => {
  it('signs up with a valid email/password and advances to /start/plan', async () => {
    renderAt();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'demo@roote.us');
    await user.type(screen.getByLabelText(/password/i), 'longenough1');
    await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
    expect(await screen.findByText('plan-step')).toBeInTheDocument();
  });

  it('shows an inline error for a too-short password and does not navigate', async () => {
    renderAt();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email/i), 'demo2@roote.us');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('plan-step')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/start/AccountStep.test.tsx`
Expected: FAIL — `./AccountStep` doesn't exist.

- [ ] **Step 3: Implement `src/app/routes/start/AccountStep.tsx`**

```tsx
// src/app/routes/start/AccountStep.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { useAuth } from '@/store/auth';

const ERROR_KEYS: Record<string, string> = {
  'invalid-email': 'start.account.error.invalidEmail',
  'weak-password': 'start.account.error.weakPassword',
  'duplicate-email': 'start.account.error.duplicateEmail',
};

export function AccountStep() {
  const t = useT();
  const navigate = useNavigate();
  const session = useSession();
  const auth = useAuth();
  const [email, setEmail] = useState(session.account.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = auth.signUp(email, password);
    if (!result.ok) {
      setError(t(ERROR_KEYS[result.error] as never));
      return;
    }
    session.setEmail(email);
    navigate('/start/plan');
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-medium">{t('start.account.title')}</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.account.emailLabel')}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border bg-input-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.account.passwordLabel')}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border bg-input-background px-3 py-2"
          />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
          {t('start.account.submit')}
        </button>
        {/* TODO: confirm with client — magic-link sign-in as an alternative to password auth */}
        <button type="button" disabled className="text-xs text-muted-foreground underline opacity-50">
          {t('start.account.magicLink')}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Add the i18n keys**

`en.ts`:
```ts
  'start.account.title': 'Create your account',
  'start.account.emailLabel': 'Email',
  'start.account.passwordLabel': 'Password',
  'start.account.submit': 'Create account',
  'start.account.magicLink': 'Email me a sign-in link instead (coming soon)',
  'start.account.error.invalidEmail': 'Enter a valid email address.',
  'start.account.error.weakPassword': 'Use at least 8 characters.',
  'start.account.error.duplicateEmail': 'An account with this email already exists.',
```

`he.ts`:
```ts
  'start.account.title': 'יצירת חשבון',
  'start.account.emailLabel': 'אימייל',
  'start.account.passwordLabel': 'סיסמה',
  'start.account.submit': 'יצירת חשבון',
  'start.account.magicLink': 'שליחת קישור כניסה למייל במקום (בקרוב)',
  'start.account.error.invalidEmail': 'נא להזין כתובת אימייל תקינה.',
  'start.account.error.weakPassword': 'יש להשתמש בלפחות 8 תווים.',
  'start.account.error.duplicateEmail': 'קיים כבר חשבון עם כתובת אימייל זו.',
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/start/AccountStep.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/start/AccountStep.tsx src/app/routes/start/AccountStep.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add AccountStep"
```

---

### Task 9: `PlanStep`

**Files:**
- Create: `src/app/routes/start/PlanStep.tsx`
- Create: `src/app/routes/start/PlanStep.test.tsx`

**Interfaces:**
- Consumes: `buildReport` (rebuilt from the persisted `session.diagnosis`/`session.analysis`, exactly
  as `ReportPage` already does — **never re-runs `deriveAnalysis`**), `PendingChip`, `isPending`.
- Produces: `<PlanStep />` — condensed "MATCHED TO YOUR SCAN" card (`model.plan`) + a 5-card duration
  selector from `model.pricing.compareAll`, the `isRecommended` one pre-selected and badged, fully
  changeable; on selection, `session.setDraftDurationDays(days)`; a "Continue to payment" button
  navigates to `/start/checkout`.

- [ ] **Step 1: Write the test**

```tsx
// src/app/routes/start/PlanStep.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { PlanStep } from './PlanStep';

function seedSession() {
  localStorage.setItem('roote.locale', 'en');
  const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
  const analysis = deriveAnalysis({ gender: 'male', answers });
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers },
      analysis,
      reportId: 'rep-plan-1',
      account: { email: 'demo@roote.us' },
      draftDurationDays: null,
      program: null,
    }),
  );
  return analysis;
}

function renderAt() {
  const router = createMemoryRouter(
    [
      { path: '/start/plan', element: <PlanStep /> },
      { path: '/start/checkout', element: <div>checkout-step</div> },
    ],
    { initialEntries: ['/start/plan'] },
  );
  return render(
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>,
  );
}

describe('PlanStep', () => {
  it('pre-selects the AI-recommended duration and lets the user change it', async () => {
    const analysis = seedSession();
    renderAt();
    const recommended = screen.getByRole('radio', { name: new RegExp(`${analysis.recommendedDurationDays}`) });
    expect(recommended).toBeChecked();
    const other = screen.getAllByRole('radio').find((r) => r !== recommended)!;
    const user = userEvent.setup();
    await user.click(other);
    expect(other).toBeChecked();
    expect(recommended).not.toBeChecked();
  });

  it('advances to checkout with the selected duration stored as the draft', async () => {
    seedSession();
    renderAt();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByText('checkout-step')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/start/PlanStep.test.tsx`
Expected: FAIL — `./PlanStep` doesn't exist.

- [ ] **Step 3: Implement `src/app/routes/start/PlanStep.tsx`**

```tsx
// src/app/routes/start/PlanStep.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';
import type { ProgramDurationDays } from '@/domain/program/types';

export function PlanStep() {
  const t = useT();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const session = useSession();

  const model = useMemo(() => {
    if (!session.analysis || !session.reportId) return null;
    return buildReport({
      diagnosis: session.diagnosis,
      analysis: session.analysis,
      content: rooteContent,
      locale,
      reportId: session.reportId,
    });
  }, [session.diagnosis, session.analysis, session.reportId, locale]);

  const [selected, setSelected] = useState<ProgramDurationDays | null>(
    session.draftDurationDays ?? (model ? (model.recommendedDuration.days as ProgramDurationDays) : null),
  );

  if (!model) return null; // StartLayout already guarantees a resolvable report before rendering this

  function choose(days: ProgramDurationDays) {
    setSelected(days);
    session.setDraftDurationDays(days);
  }

  function handleContinue() {
    const days = selected ?? (model!.recommendedDuration.days as ProgramDurationDays);
    session.setDraftDurationDays(days);
    navigate('/start/checkout');
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="rounded-lg border border-accent bg-accent/5 p-4">
        <span className="w-fit rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
          {model.plan.matchedToScanBadge}
        </span>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {model.plan.core.map((tr, i) => (
            <li key={i}>{isPending(tr.name) ? <PendingChip label={tr.name.label} /> : tr.name}</li>
          ))}
        </ul>
      </div>

      <fieldset className="flex flex-col gap-2" role="radiogroup" aria-label={t('start.plan.durationLegend')}>
        <legend className="text-sm font-medium">{t('start.plan.durationLegend')}</legend>
        {model.pricing.compareAll.map((row) => (
          <label
            key={row.days}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm has-[:checked]:border-accent"
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                role="radio"
                name="duration"
                checked={selected === row.days}
                onChange={() => choose(row.days as ProgramDurationDays)}
              />
              {row.label}
              {row.isRecommended && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  {t('start.plan.recommendedBadge')}
                </span>
              )}
            </span>
            {isPending(row.price) ? <PendingChip label={row.price.label} /> : <span>{row.price.formatted}</span>}
          </label>
        ))}
      </fieldset>

      <button type="button" onClick={handleContinue} className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">
        {t('start.plan.continue')}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Add the i18n keys**

`en.ts`:
```ts
  'start.plan.durationLegend': 'Program length',
  'start.plan.recommendedBadge': 'Recommended for you',
  'start.plan.continue': 'Continue to payment',
```

`he.ts`:
```ts
  'start.plan.durationLegend': 'משך התוכנית',
  'start.plan.recommendedBadge': 'מומלץ עבורך',
  'start.plan.continue': 'המשך לתשלום',
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/start/PlanStep.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/start/PlanStep.tsx src/app/routes/start/PlanStep.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add PlanStep (duration selector reusing buildReport's pricing.compareAll)"
```

---

### Task 10: `CheckoutStep`

**Files:**
- Create: `src/app/routes/start/CheckoutStep.tsx`
- Create: `src/app/routes/start/CheckoutStep.test.tsx`

**Interfaces:**
- Consumes: `buildReport` (for the order-summary row matching `session.draftDurationDays`),
  `submitPayment`/`Order` from `@/store/checkout`, `buildProgram` from `@/store/program`.
- Produces: `<CheckoutStep />` — order summary with a "Change" link back to `/start/plan`,
  contact/shipping form, payment form (shape-validated only, visible "test UI" note, disabled
  alternate-payment row), submit → `submitPayment` → on success `session.setProgram(buildProgram(...))`
  → `/start/success`; on failure, a retryable inline error, nothing persisted.

- [ ] **Step 1: Write the test**

```tsx
// src/app/routes/start/CheckoutStep.test.tsx
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { CheckoutStep } from './CheckoutStep';

function seedSession(overrides: Record<string, unknown> = {}) {
  localStorage.setItem('roote.locale', 'en');
  const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
  const analysis = deriveAnalysis({ gender: 'male', answers });
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers },
      analysis,
      reportId: 'rep-checkout-1',
      account: { email: 'demo@roote.us' },
      draftDurationDays: 180,
      program: null,
      ...overrides,
    }),
  );
}

function renderAt() {
  const router = createMemoryRouter(
    [
      { path: '/start/checkout', element: <CheckoutStep /> },
      { path: '/start/success', element: <div>success-step</div> },
    ],
    { initialEntries: ['/start/checkout'] },
  );
  return render(
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>,
  );
}

afterEach(() => localStorage.removeItem('roote.debug.forceCheckoutFailure'));

describe('CheckoutStep', () => {
  it('submits valid contact + payment details and advances to success on stub success', async () => {
    seedSession();
    renderAt();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone/i), '0500000000');
    await user.type(screen.getByLabelText(/city/i), 'Tel Aviv');
    await user.type(screen.getByLabelText(/postal/i), '1234567');
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry/i), '12/29');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    await user.click(screen.getByRole('button', { name: /place order|pay/i }));
    await waitFor(() => expect(screen.getByText('success-step')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('shows a retryable error and does not navigate on stub failure', async () => {
    localStorage.setItem('roote.debug.forceCheckoutFailure', '1');
    seedSession();
    renderAt();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone/i), '0500000000');
    await user.type(screen.getByLabelText(/city/i), 'Tel Aviv');
    await user.type(screen.getByLabelText(/postal/i), '1234567');
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242');
    await user.type(screen.getByLabelText(/expiry/i), '12/29');
    await user.type(screen.getByLabelText(/cvc/i), '123');
    await user.click(screen.getByRole('button', { name: /place order|pay/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('success-step')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/start/CheckoutStep.test.tsx`
Expected: FAIL — `./CheckoutStep` doesn't exist.

- [ ] **Step 3: Implement `src/app/routes/start/CheckoutStep.tsx`**

```tsx
// src/app/routes/start/CheckoutStep.tsx
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';
import { buildReport } from '@/domain/report/buildReport';
import { rooteContent } from '@/content/roote.config';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { isPending } from '@/content/pending';
import { submitPayment, type Order } from '@/store/checkout';
import { buildProgram } from '@/store/program';
import type { ProgramDurationDays } from '@/domain/program/types';

const CARD_RE = /^\d{13,19}$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_RE = /^\d{3,4}$/;

export function CheckoutStep() {
  const t = useT();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const session = useSession();

  const model = useMemo(() => {
    if (!session.analysis || !session.reportId) return null;
    return buildReport({ diagnosis: session.diagnosis, analysis: session.analysis, content: rooteContent, locale, reportId: session.reportId });
  }, [session.diagnosis, session.analysis, session.reportId, locale]);

  const days = (session.draftDurationDays ?? model?.recommendedDuration.days) as ProgramDurationDays | undefined;
  const row = model?.pricing.compareAll.find((r) => r.days === days);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(session.account.email ?? '');
  const [phone, setPhone] = useState('');
  const [country] = useState('IL'); // TODO: confirm with client — IL vs international shipping
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!model || !days || !row) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!CARD_RE.test(cardNumber.replace(/\s+/g, ''))) return setError(t('start.checkout.error.card'));
    if (!EXPIRY_RE.test(expiry)) return setError(t('start.checkout.error.expiry'));
    if (!CVC_RE.test(cvc)) return setError(t('start.checkout.error.cvc'));

    setSubmitting(true);
    const order: Order = {
      reportId: model!.meta.reportId,
      durationDays: days!,
      contact: { name, email, phone, country, city, postal },
      card: { last4: cardNumber.replace(/\s+/g, '').slice(-4), expiry },
    };
    try {
      const result = await submitPayment(order);
      const program = buildProgram({
        orderId: result.orderId,
        reportId: model!.meta.reportId,
        analysis: session.analysis!,
        durationDays: days!,
        plan: model!.plan,
      });
      session.setProgram(program);
      navigate('/start/success');
    } catch {
      setError(t('start.checkout.error.payment'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <section className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{t('start.checkout.summaryTitle')}</h2>
          <Link to="/start/plan" className="text-xs text-accent underline">{t('start.checkout.change')}</Link>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>{row.label}</span>
          {isPending(row.price) ? <PendingChip label={row.price.label} /> : <span>{row.price.formatted}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('report.pricing.perDayLabel')}</span>
          {isPending(model.pricing.perDay) ? <PendingChip label={model.pricing.perDay.label} /> : <span>{model.pricing.perDay.formatted}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('start.checkout.shipping')}</span>
          <PendingChip label="shipping" />
        </div>
      </section>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <h2 className="text-sm font-medium">{t('start.checkout.contactTitle')}</h2>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.name')}
          <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.account.emailLabel')}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.phone')}
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.city')}
          <input required value={city} onChange={(e) => setCity(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.postal')}
          <input required value={postal} onChange={(e) => setPostal(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>

        <h2 className="mt-2 text-sm font-medium">{t('start.checkout.paymentTitle')}</h2>
        <p className="text-xs text-muted-foreground">{t('start.checkout.testNotice')}</p>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.cardName')}
          <input required value={cardName} onChange={(e) => setCardName(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('start.checkout.cardNumber')}
          <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
        </label>
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            {t('start.checkout.expiry')}
            <input required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            {t('start.checkout.cvc')}
            <input required value={cvc} onChange={(e) => setCvc(e.target.value)} className="rounded-md border border-border bg-input-background px-3 py-2" />
          </label>
        </div>
        {/* TODO: confirm with client — which alternate payment methods to actually offer */}
        <button type="button" disabled className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground opacity-50">
          {t('start.checkout.altPayment')}
        </button>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={submitting} className="rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-50">
          {submitting ? t('start.checkout.submitting') : t('start.checkout.submit')}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Add the i18n keys**

`en.ts`:
```ts
  'start.checkout.summaryTitle': 'Order summary',
  'start.checkout.change': 'Change',
  'start.checkout.shipping': 'Shipping',
  'start.checkout.contactTitle': 'Contact & shipping',
  'start.checkout.name': 'Full name',
  'start.checkout.phone': 'Phone',
  'start.checkout.city': 'City',
  'start.checkout.postal': 'Postal code',
  'start.checkout.paymentTitle': 'Payment',
  'start.checkout.testNotice': 'Test UI — no real payment is processed.',
  'start.checkout.cardName': 'Name on card',
  'start.checkout.cardNumber': 'Card number',
  'start.checkout.expiry': 'Expiry',
  'start.checkout.cvc': 'CVC',
  'start.checkout.altPayment': 'PayPal / Bit / Apple Pay (coming soon)',
  'start.checkout.submit': 'Place order',
  'start.checkout.submitting': 'Placing order…',
  'start.checkout.error.card': 'Enter a valid card number.',
  'start.checkout.error.expiry': 'Enter expiry as MM/YY.',
  'start.checkout.error.cvc': 'Enter a valid CVC.',
  'start.checkout.error.payment': 'Payment failed — please try again.',
```

`he.ts`:
```ts
  'start.checkout.summaryTitle': 'סיכום הזמנה',
  'start.checkout.change': 'שינוי',
  'start.checkout.shipping': 'משלוח',
  'start.checkout.contactTitle': 'פרטי קשר ומשלוח',
  'start.checkout.name': 'שם מלא',
  'start.checkout.phone': 'טלפון',
  'start.checkout.city': 'עיר',
  'start.checkout.postal': 'מיקוד',
  'start.checkout.paymentTitle': 'תשלום',
  'start.checkout.testNotice': 'ממשק בדיקה — לא מתבצע תשלום אמיתי.',
  'start.checkout.cardName': 'שם בעל הכרטיס',
  'start.checkout.cardNumber': 'מספר כרטיס',
  'start.checkout.expiry': 'בתוקף עד',
  'start.checkout.cvc': 'CVC',
  'start.checkout.altPayment': 'PayPal / ביט / Apple Pay (בקרוב)',
  'start.checkout.submit': 'ביצוע הזמנה',
  'start.checkout.submitting': 'מבצע הזמנה…',
  'start.checkout.error.card': 'נא להזין מספר כרטיס תקין.',
  'start.checkout.error.expiry': 'נא להזין תוקף בפורמט MM/YY.',
  'start.checkout.error.cvc': 'נא להזין CVC תקין.',
  'start.checkout.error.payment': 'התשלום נכשל — נא לנסות שוב.',
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/start/CheckoutStep.test.tsx`
Expected: PASS (2 tests). The success-path test waits on the 400ms stub delay — this is expected,
not flaky.

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/start/CheckoutStep.tsx src/app/routes/start/CheckoutStep.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add CheckoutStep (stubbed payment, builds and stores the Program on success)"
```

---

### Task 11: `SuccessStep`

**Files:**
- Create: `src/app/routes/start/SuccessStep.tsx`
- Create: `src/app/routes/start/SuccessStep.test.tsx`

**Interfaces:**
- Consumes: `useSession()` (reads `session.program`).
- Produces: `<SuccessStep />` — confirmation (orderId, plan/duration, start date) + 3-point
  what's-next + CTA to `/app`.

- [ ] **Step 1: Write the test**

```tsx
// src/app/routes/start/SuccessStep.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { SessionProvider } from '@/store/sessionStore';
import { SuccessStep } from './SuccessStep';

function renderAt() {
  localStorage.setItem('roote.locale', 'en');
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers: {} },
      analysis: null,
      reportId: 'rep-1',
      account: { email: 'demo@roote.us' },
      draftDurationDays: 180,
      program: {
        orderId: 'ord-777',
        reportId: 'rep-1',
        analysisSnapshot: {},
        durationDays: 180,
        startDate: '2026-09-02',
        endDate: '2027-03-01',
        plan: { core: [], supporting: [] },
        completionLog: {},
        progressPhotos: [],
        reminders: [],
      },
    }),
  );
  const router = createMemoryRouter(
    [
      { path: '/start/success', element: <SuccessStep /> },
      { path: '/app', element: <div>app-home</div> },
    ],
    { initialEntries: ['/start/success'] },
  );
  return render(
    <LocaleProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocaleProvider>,
  );
}

describe('SuccessStep', () => {
  it('shows the order confirmation and links to /app', () => {
    renderAt();
    expect(screen.getByText(/ord-777/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /program/i })).toHaveAttribute('href', '/app');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/routes/start/SuccessStep.test.tsx`
Expected: FAIL — `./SuccessStep` doesn't exist.

- [ ] **Step 3: Implement `src/app/routes/start/SuccessStep.tsx`**

```tsx
// src/app/routes/start/SuccessStep.tsx
import { Link } from 'react-router';
import { useT } from '@/i18n/LocaleProvider';
import { useSession } from '@/store/sessionStore';

export function SuccessStep() {
  const t = useT();
  const session = useSession();
  const program = session.program;
  if (!program) return null; // StartLayout's guard already ensures this

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <h1 className="text-xl font-medium">{t('start.success.title')}</h1>
      <p className="text-sm text-muted-foreground">#{program.orderId}</p>
      <p className="text-sm">{t('report.duration.label', { days: program.durationDays })} · {program.startDate}</p>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        <li>{t('start.success.point1')}</li>
        <li>{t('start.success.point2')}</li>
        <li>{t('start.success.point3')}</li>
      </ul>
      <Link to="/app" className="rounded-md bg-primary px-8 py-4 text-sm text-primary-foreground">
        {t('start.success.cta')}
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Add the i18n keys**

`en.ts`:
```ts
  'start.success.title': "You're all set",
  'start.success.point1': 'Your plan starts today.',
  'start.success.point2': 'We will remind you when to apply each step.',
  'start.success.point3': 'Track your progress with photos as you go.',
  'start.success.cta': 'Go to my program',
```

`he.ts`:
```ts
  'start.success.title': 'הכל מוכן',
  'start.success.point1': 'התוכנית שלך מתחילה היום.',
  'start.success.point2': 'נזכיר לך מתי ליישם כל שלב.',
  'start.success.point3': 'עקבו אחרי ההתקדמות שלכם עם תמונות תוך כדי.',
  'start.success.cta': 'למעבר לתוכנית שלי',
```

- [ ] **Step 5: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/routes/start/SuccessStep.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/start/SuccessStep.tsx src/app/routes/start/SuccessStep.test.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add SuccessStep"
```

---

### Task 12: wire `/start/*` into `App.tsx`

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: `StartLayout`, `AccountStep`, `PlanStep`, `CheckoutStep`, `SuccessStep`, `AuthProvider`.
- Produces: the `/start`, `/start/plan`, `/start/checkout`, `/start/success` routes registered; the
  whole app wrapped in `AuthProvider` alongside the existing `LocaleProvider`/`SessionProvider`.

- [ ] **Step 1: Extend the test**

Add one test to `src/app/App.test.tsx` (keep the existing test), seeding a resolvable report the same
way the plan's own step tests do:

```tsx
it('reaches /start and can sign up to advance to the plan step', async () => {
  localStorage.setItem('roote.locale', 'en');
  const { deriveAnalysis } = await import('@/domain/analysis/deriveAnalysis');
  const answers = { q1_area: 'crown', q2_onset: '1-5y', q3_prior: 'never', q4_family: 'yes', q5_goal: 'both' } as const;
  const analysis = deriveAnalysis({ gender: 'male', answers });
  localStorage.setItem(
    'roote.session',
    JSON.stringify({
      diagnosis: { gender: 'male', photos: [], answers },
      analysis,
      reportId: 'rep-app-1',
      account: { email: null },
      draftDurationDays: null,
      program: null,
    }),
  );
  window.history.pushState({}, '', '/start');
  render(<App />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), 'route-test@roote.us');
  await user.type(screen.getByLabelText(/password/i), 'longenough1');
  await user.click(screen.getByRole('button', { name: /create account|sign up/i }));
  expect(await screen.findByRole('radiogroup')).toBeInTheDocument();
});
```

(`App` uses `createBrowserRouter`, which reads the current URL — `window.history.pushState` before
`render` is the established way this test file would need to seed the initial route; if `App.tsx`'s
router is created fresh per render this works directly. If it's module-scoped, restructure this test
to match whatever `App.test.tsx`'s existing test already does to control routing — read that file
first.)

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm exec vitest run src/app/App.test.tsx`
Expected: FAIL — no `/start` route registered yet.

- [ ] **Step 3: Update `src/app/App.tsx`**

Add the imports:
```tsx
import { AuthProvider } from '@/store/auth';
import { StartLayout } from './routes/start/StartLayout';
import { AccountStep } from './routes/start/AccountStep';
import { PlanStep } from './routes/start/PlanStep';
import { CheckoutStep } from './routes/start/CheckoutStep';
import { SuccessStep } from './routes/start/SuccessStep';
```

Add to the router's route array, after the `/report/:reportId` entry and before the `*` catch-all:
```tsx
  {
    path: '/start',
    element: <StartLayout />,
    children: [
      { index: true, element: <AccountStep /> },
      { path: 'plan', element: <PlanStep /> },
      { path: 'checkout', element: <CheckoutStep /> },
      { path: 'success', element: <SuccessStep /> },
    ],
  },
```

Wrap `<AuthProvider>` around `<SessionProvider>` (inside `<LocaleProvider>`) in the default export:
```tsx
export default function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `pnpm exec vitest run src/app/App.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full suite + build**

Run: `pnpm test && pnpm build`
Expected: all green, pristine; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/app/App.tsx src/app/App.test.tsx
git commit -m "feat: wire /start/* routes and AuthProvider into App"
```

---

### Task 13: final P2b verification

**Files:** none changed — verification only.

- [ ] **Step 1: Run the complete suite**

Run: `pnpm test`
Expected: every test from P0, P1, P2a, and this plan passes — pristine output, no console warnings.

- [ ] **Step 2: Run the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 3: Confirm the chain is reachable end-to-end (manual sanity note for the reviewer, not a new automated test)**

`/report/:reportId` → "Start My Program" → `/start?report=...` → sign up → `/start/plan` → pick a
duration (or keep the recommended one) → `/start/checkout` → fill contact + payment → place order →
`/start/success` → "Go to my program" → `/app` (P2c will build the actual destination; for this plan,
confirm the link's `href` is correct and note in the task report that navigating past it is P2c's job).
This chain was checked by inspection of the already-passing suite (each step's own test covers its
slice), not run interactively.

- [ ] **Step 4: No commit for this task** (verification-only).

---

## Self-review

**Spec coverage:** §7.1 (account) → Tasks 2, 8. §7.2 (plan confirm) → Task 9, reusing `buildReport`'s
existing `pricing.compareAll`/`isRecommended` (Tasks 5-6 of P2a — no new logic). §7.3 (checkout) →
Tasks 4, 10. §7.4 (success) → Task 11. §7.5 (`Program` type + store) → Tasks 1, 3, 5 (`deriveSchedule`
deliberately deferred to P2c per the Global Constraints ruling). Error-handling table rows "Account",
"Start", "Checkout" (both sub-rows) → Tasks 6-7 guards + Task 8/10's inline errors.

**No-invented-content discipline:** `PlanStep`/`CheckoutStep` never compute a price or duration
themselves — every number comes from `buildReport()`'s already-`[PENDING]`-aware `ReportModel`, so
the discipline P2a already established just carries through unchanged. Shipping cost is explicitly
`[PENDING: shipping]` per spec, not invented.

**Placeholder scan:** no "TBD"/"implement later" left; every task has complete, real code; every new
i18n key has both `en` and `he` values.

**Type consistency:** `Program`/`Treatment`/`ProgramDurationDays` defined once (Task 1), consumed
identically by `sessionStore.tsx` (Task 3), `program.ts` (Task 5), and every `/start/*` route that
touches `session.program`/`session.draftDurationDays` (Tasks 7, 9-11) — no duplicate/divergent shape.

**Open items carried forward (flag to the user in the final report, not blocking):**
- Magic-link sign-in: `// TODO: confirm with client` (Task 8) — disabled control shown, no logic.
- Shipping fields (IL vs. international) and which payment methods to actually offer: both
  `// TODO: confirm with client` (Task 10).
- Does a program renewal / reorder skip the account step? Not built here — that's P2c's
  `ReorderBanner` (spec §8.6), which links to `/start/plan?renew=1`; this plan's `StartLayout` guard
  doesn't yet special-case a `renew` query param. Flag as a P2c-time follow-up on `StartLayout`.

---

## Execution handoff

Proceeding with subagent-driven-development, matching the P2a cadence: fresh subagent per task,
review after each, no pausing between tasks. P2c (post-purchase app shell) is queued to start once
this phase's final review is clean.
