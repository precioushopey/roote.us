# Shop-First Self-Serve Purchasing (Cart Revival) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every product a working "Add to Cart" button (all 6 SKUs, no assessment gate), backed by a real multi-item cart, checkout, and order history — closing Mischa's finding #1 ("shop-first, not quiz-first").

**Architecture:** Revive the bag/cart subsystem that existed in this codebase one commit ago and was cleanly deleted (verified via `git show`/`git diff` against the parent of `714cffb`) — same reducer-based cart store, same catalogue projection, same shared `CheckoutFields` checkout form — renamed from "bag" to "cart" throughout per the product owner's explicit correction, and reconnected to the shop pages in place of the quiz CTA.

**Tech Stack:** React + TypeScript + Vite, React Router, `useReducer` + `localStorage` for client state (no backend — this repo has none, see `CLAUDE.md`), Tailwind v4, the existing `lucide-react` icon set.

**Spec:** `docs/superpowers/specs/2026-09-22-shop-first-cart-revival-design.md`

## Global Constraints

- Never use "bag" in new or restored user-facing copy, route paths, or component/file names — every surface says "cart" (product owner correction). Existing i18n *key names* that still say `bag.*` are left as-is (renaming them is pure churn); only key *values* get fixed.
- All 6 SKUs (`density-6`, `density-10`, `density-15`, `gray-support`, `gray-serum`, `regrowth-shampoo`) get direct "Add to Cart" — no medical-review gating at the point of purchase (explicit product decision, see spec §4).
- Reuse the existing shared `CheckoutFields` component unchanged — this repo's own rule is "one checkout machinery, don't fork it again."
- No test suite exists in this repo and none should be added (`CLAUDE.md`, deliberate). Verification is `pnpm typecheck` (must be 0 diagnostics), `pnpm i18n:check` / `pnpm content:check` (must stay clean) after any copy change, and manual smoke-testing in a browser.
- Six-locale i18n key parity is enforced by `pnpm i18n:check` — any key touched must stay filled (non-empty) in `en`/`he`/`ar`/`ru`/`fr`/`es`.
- RTL-safe styling: logical Tailwind utilities (`ms/me/ps/pe`, `start-*/end-*`) only, never `ml/mr/left/right`, for anything new.
- Bundles (`SHOP_BUNDLES`, `BundleSection`, `BundleCard`) stay untouched and out of scope — that section is intentionally hidden pending a separate launch decision.

---

### Task 1: Cart data layer — state, line resolution, order type

**Files:**
- Create: `src/store/cart.tsx`
- Create: `src/store/cartLines.ts`
- Modify: `src/store/checkout.ts`

**Interfaces:**
- Produces: `CartProvider` (React component), `useCart(): CartApi` where `CartApi = {lines: CartLine[]; count: number; add(sku: string): void; addBundle(bundleId: string): void; setQty(id: string, qty: number): void; remove(id: string): void; clear(): void}`.
- Produces: `CartLine = ({kind:'sku'; sku:string} | {kind:'bundle'; bundleId:string}) & {qty:number}`, `lineId(line: CartLine): string`.
- Produces: `resolveCartLines(lines: CartLine[], locale: LocaleCode): ResolvedCartLine[]` where `ResolvedCartLine = {id:string; qty:number; name:string; subtitle:string; price:number|null}`.
- Produces: `CartOrder` type and the widened `Order = ProgramOrder | CartOrder` from `store/checkout.ts`.
- Consumes: `lsGet`/`lsSet` from `./persistence` (unchanged), `findProduct`/`findBundle` from `@/content/catalog` / `@/content/bundles` (unchanged).

- [ ] **Step 1: Create `src/store/cart.tsx`**

```tsx
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';

/** A single product, or a fixed `ShopBundle` (its own discounted price, not
 *  the sum of its component SKUs — see content/bundles.ts). */
export type CartLine = ({ kind: 'sku'; sku: string } | { kind: 'bundle'; bundleId: string }) & {
  qty: number;
};

export function lineId(line: CartLine): string {
  return line.kind === 'sku' ? `sku:${line.sku}` : `bundle:${line.bundleId}`;
}

type State = { lines: CartLine[] };
const EMPTY: State = { lines: [] };
const MAX_QTY = 20;

type Action =
  | { type: 'ADD_SKU'; sku: string }
  | { type: 'ADD_BUNDLE'; bundleId: string }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

function clampQty(n: number): number {
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

function addLine(state: State, line: CartLine): State {
  const id = lineId(line);
  const existing = state.lines.find((l) => lineId(l) === id);
  if (existing) {
    return { lines: state.lines.map((l) => (lineId(l) === id ? { ...l, qty: clampQty(l.qty + 1) } : l)) };
  }
  return { lines: [...state.lines, line] };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_SKU':
      return addLine(state, { kind: 'sku', sku: action.sku, qty: 1 });
    case 'ADD_BUNDLE':
      return addLine(state, { kind: 'bundle', bundleId: action.bundleId, qty: 1 });
    case 'SET_QTY': {
      if (action.qty <= 0) return { lines: state.lines.filter((l) => lineId(l) !== action.id) };
      return {
        lines: state.lines.map((l) => (lineId(l) === action.id ? { ...l, qty: clampQty(action.qty) } : l)),
      };
    }
    case 'REMOVE':
      return { lines: state.lines.filter((l) => lineId(l) !== action.id) };
    case 'CLEAR':
      return EMPTY;
    default:
      return state;
  }
}

type CartApi = State & {
  count: number;
  add: (sku: string) => void;
  addBundle: (bundleId: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);
const STORAGE_KEY = 'cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY, () => lsGet<State>(STORAGE_KEY, EMPTY));

  useEffect(() => {
    lsSet(STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<CartApi>(
    () => ({
      ...state,
      count: state.lines.reduce((n, l) => n + l.qty, 0),
      add: (sku) => dispatch({ type: 'ADD_SKU', sku }),
      addBundle: (bundleId) => dispatch({ type: 'ADD_BUNDLE', bundleId }),
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      remove: (id) => dispatch({ type: 'REMOVE', id }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }),
    [state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used within <CartProvider>');
  return c;
}
```

- [ ] **Step 2: Create `src/store/cartLines.ts`**

```ts
import { lineId, type CartLine } from './cart';
import { findProduct } from '@/content/catalog';
import { findBundle } from '@/content/bundles';
import { pickLocalized } from '@/content/localized';
import type { LocaleCode } from '@/i18n/locales';

/** A cart line resolved against the product/bundle catalogues, for display.
 *  `price` is per unit — a bundle's own discounted price, never the sum of
 *  its component SKUs (see content/bundles.ts). */
export type ResolvedCartLine = {
  id: string;
  qty: number;
  name: string;
  subtitle: string;
  price: number | null;
};

export function resolveCartLines(lines: CartLine[], locale: LocaleCode): ResolvedCartLine[] {
  const resolved: ResolvedCartLine[] = [];
  for (const line of lines) {
    if (line.kind === 'sku') {
      const product = findProduct(line.sku);
      if (!product) continue;
      resolved.push({
        id: lineId(line),
        qty: line.qty,
        name: product.name,
        subtitle: pickLocalized(product.subtitle, locale),
        price: product.price,
      });
    } else {
      const bundle = findBundle(line.bundleId);
      if (!bundle) continue;
      resolved.push({
        id: lineId(line),
        qty: line.qty,
        name: pickLocalized(bundle.name, locale),
        subtitle: pickLocalized(bundle.summary, locale),
        price: bundle.price,
      });
    }
  }
  return resolved;
}
```

- [ ] **Step 3: Modify `src/store/checkout.ts`** — add the `CartOrder` variant and make order-ID generation kind-aware again

Replace the whole file with:

```ts
import type { CartLine } from './cart';

/** Shared contact/shipping details. `country` is fixed to IL for now — see CheckoutFields. */
export type Contact = {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  postal: string;
};

/** Only the last4 + expiry ever leave the payment form — never the full number or CVC. */
export type CardRef = { last4: string; expiry: string };

/** A purchase of a personalized program (the /start funnel). */
export type ProgramOrder = {
  kind: 'program';
  reportId: string;
  durationDays: number;
  contact: Contact;
  card: CardRef;
};

/** An à-la-carte purchase of catalogue products (the /cart shop) — 2026-09-22:
 *  restored (was briefly removed, then reinstated per product-owner feedback
 *  that every product needs a direct "Add to Cart" path, not just the
 *  assessment funnel). Named `CartOrder`/`kind: 'cart'`, not the earlier
 *  `BagOrder`/`'bag'` — "cart" is the only term used anywhere on the site now. */
export type CartOrder = {
  kind: 'cart';
  lines: CartLine[];
  contact: Contact;
  card: CardRef;
};

export type Order = ProgramOrder | CartOrder;

let counter = 0;
function nextOrderId(kind: Order['kind']): string {
  counter += 1;
  return `${kind === 'program' ? 'ord' : 'cart'}-${Date.now()}-${counter}`;
}

// TODO: Marwell — wire to the real store/payment backend (Shopify Checkout / payment intent).
// ONE integration covers both order kinds — branch on `order.kind` server-side if needed.
// Stub: resolves { status: 'success', orderId } after a short delay. No full card number or CVC is
// ever passed here — callers build `card` from the last four digits + expiry only (see CheckoutFields).
export async function submitPayment(order: Order): Promise<{ status: 'success'; orderId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (import.meta.env.DEV && localStorage.getItem('roote.debug.forceCheckoutFailure') === '1') {
    throw new Error('Payment failed (dev-forced failure — clear roote.debug.forceCheckoutFailure to disable)');
  }
  return { status: 'success', orderId: nextOrderId(order.kind) };
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics. (`store/orders.ts`'s `OrderRecord.kind: Order['kind']` picks up the new `'cart'` variant automatically — no edit needed there.)

- [ ] **Step 5: Commit**

```bash
git add src/store/cart.tsx src/store/cartLines.ts src/store/checkout.ts
git commit -m "feat: revive cart data layer (store/cart, cartLines, CartOrder)"
```

---

### Task 2: Cart routes — page, checkout, success

**Files:**
- Create: `src/app/routes/cart/CartPage.tsx`
- Create: `src/app/routes/cart/CartCheckout.tsx`
- Create: `src/app/routes/cart/CartSuccess.tsx`
- Modify: `src/app/paths.ts`
- Modify: `src/app/routes/marketing/marketingRoutes.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `useCart`, `resolveCartLines`, `submitPayment`, `type CartOrder`, `type Contact`, `type CardRef` from Task 1; `CheckoutFields` from `@/app/components/checkout/CheckoutFields` (unchanged, existing component); `recordOrder` from `@/store/orders` (unchanged).
- Produces: `PATHS.cart`, `PATHS.cartCheckout`, `PATHS.cartSuccess` (route path strings used by Tasks 3–5).

- [ ] **Step 1: Modify `src/app/paths.ts`** — add the cart paths back, right after `product`

Find:
```ts
  products: '/products',
  product: (slug: string) => `/products/${slug}`,

  login: '/login',
```

Replace with:
```ts
  products: '/products',
  product: (slug: string) => `/products/${slug}`,

  cart: '/cart',
  cartCheckout: '/cart/checkout',
  cartSuccess: '/cart/success',

  login: '/login',
```

- [ ] **Step 2: Create `src/app/routes/cart/CartPage.tsx`**

```tsx
import { Link } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { resolveCartLines } from '@/store/cartLines';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { PATHS } from '@/app/paths';

export function CartPage() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const cart = useCart();

  const lines = resolveCartLines(cart.lines, cl);
  // Subtotal is real arithmetic on each line's own already-supplied price —
  // not invented — but only when every line has one; a single unpriced line
  // means the true subtotal isn't knowable yet, so it (and the total, which
  // also depends on the still-unset shipping rate below) stay [PENDING].
  const subtotal = lines.every((l) => l.price !== null)
    ? lines.reduce((sum, l) => sum + l.price! * l.qty, 0)
    : null;

  return (
    <Section tone="cream" className="pt-28 md:pt-32" gap={12}>
      <DisplayTitle as="h1" step="xl">
        {t('cart.title')}
      </DisplayTitle>

      {lines.length === 0 ? (
        <div className="flex flex-col items-start gap-4">
          <Prose>{t('cart.empty')}</Prose>
          <Button to={withLocale(PATHS.products)}>{t('cart.browse')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="flex flex-col divide-y divide-border">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-6">
                <div className="h-24 w-24 shrink-0 rounded-lg bg-cream-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <p className="font-display text-lg font-medium">{line.name}</p>
                  <p className="text-sm text-muted-foreground">{line.subtitle}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        aria-label={t('cart.decrease')}
                        onClick={() => cart.setQty(line.id, line.qty - 1)}
                        className="px-3 py-1.5 text-sm"
                      >
                        –
                      </button>
                      <span className="min-w-7 text-center text-sm tabular-nums">{line.qty}</span>
                      <button
                        type="button"
                        aria-label={t('cart.increase')}
                        onClick={() => cart.setQty(line.id, line.qty + 1)}
                        className="px-3 py-1.5 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(line.id)}
                      className="text-sm text-muted-foreground underline"
                    >
                      {t('cart.remove')}
                    </button>
                    {line.price === null ? (
                      <PendingChip label={`${line.name} price`} />
                    ) : (
                      <span className="font-body text-sm font-medium text-foreground">
                        {formatMoney(line.price * line.qty, rooteContent.currency, cl).formatted}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-border bg-background p-6">
            <h2 className="font-display text-lg font-medium">{t('bag.summary')}</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>{t('cart.subtotal')}</span>
              {subtotal === null ? (
                <PendingChip label="cart subtotal" />
              ) : (
                <span className="text-foreground">{formatMoney(subtotal, rooteContent.currency, cl).formatted}</span>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
              <span>{t('bag.shipping')}</span>
              <PendingChip label="shipping" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
              <span>{t('bag.total')}</span>
              <PendingChip label="cart total" />
            </div>
            <Button to={withLocale(PATHS.cartCheckout)} block className="mt-5">
              {t('bag.checkout')}
            </Button>
            <Link to={withLocale(PATHS.products)} className="mt-3 block text-center text-sm text-muted-foreground underline">
              {t('bag.continue')}
            </Link>
          </aside>
        </div>
      )}
    </Section>
  );
}
```

- [ ] **Step 3: Create `src/app/routes/cart/CartCheckout.tsx`**

```tsx
import { Link, Navigate, useNavigate } from 'react-router';
import { useT, useLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useCart } from '@/store/cart';
import { resolveCartLines } from '@/store/cartLines';
import { rooteContent } from '@/content/roote.config';
import { formatMoney } from '@/domain/report/money';
import { CheckoutFields } from '@/app/components/checkout/CheckoutFields';
import { submitPayment, type CartOrder, type Contact, type CardRef } from '@/store/checkout';
import { recordOrder } from '@/store/orders';
import { Section, DisplayTitle } from '@/app/components/roote';
import { PendingChip } from '@/app/components/brand/PendingChip';
import { PATHS } from '@/app/paths';
import { useState } from 'react';

export function CartCheckout() {
  const t = useT();
  const cl = useLocale().locale;
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const cart = useCart();

  const lines = resolveCartLines(cart.lines, cl);
  // See CartPage.tsx — real arithmetic on already-supplied per-line prices, not
  // invented; stays [PENDING] if any line lacks one, or (for the total) since
  // shipping has no supplied rate yet.
  const subtotal = lines.every((l) => l.price !== null)
    ? lines.reduce((sum, l) => sum + l.price! * l.qty, 0)
    : null;

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Once the order is placed we clear the cart, so the empty-cart guard below
  // must not fire during that same render and bounce us back to /cart.
  if (cart.lines.length === 0 && !placed) return <Navigate to={withLocale(PATHS.cart)} replace />;

  async function onSubmit({ contact, card }: { contact: Contact; card: CardRef }) {
    setError(null);
    setSubmitting(true);
    const itemCount = cart.lines.reduce((n, l) => n + l.qty, 0);
    const order: CartOrder = { kind: 'cart', lines: cart.lines, contact, card };
    try {
      const result = await submitPayment(order);
      setPlaced(true);
      recordOrder({
        id: result.orderId,
        kind: 'cart',
        at: new Date().toISOString(),
        label: t('bag.checkout.qty', { qty: String(itemCount) }),
      });
      navigate(withLocale(PATHS.cartSuccess), { state: { orderId: result.orderId } });
      cart.clear();
    } catch {
      setError(t('bag.checkout.error.payment'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section tone="cream" className="pt-28 md:pt-32" gap={12}>
      <DisplayTitle as="h1" step="xl">
        {t('bag.checkout.title')}
      </DisplayTitle>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <CheckoutFields className="max-w-lg" submitting={submitting} error={error} onSubmit={onSubmit} />
          <Link to={withLocale(PATHS.cart)} className="max-w-lg text-center text-sm text-muted-foreground underline">
            {t('bag.checkout.back')}
          </Link>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">{t('bag.checkout.summaryTitle')}</h2>
            <Link to={withLocale(PATHS.cart)} className="text-sm text-accent underline">{t('bag.checkout.edit')}</Link>
          </div>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-4 py-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cream-100" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm">{line.name}</span>
                  <span className="text-sm text-muted-foreground">{t('bag.checkout.qty', { qty: String(line.qty) })}</span>
                </div>
                {line.price === null ? (
                  <PendingChip label={`${line.name} price`} />
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {formatMoney(line.price * line.qty, rooteContent.currency, cl).formatted}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>{t('cart.subtotal')}</span>
            {subtotal === null ? (
              <PendingChip label="cart subtotal" />
            ) : (
              <span className="text-foreground">{formatMoney(subtotal, rooteContent.currency, cl).formatted}</span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('bag.shipping')}</span>
            <PendingChip label="shipping" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
            <span>{t('bag.total')}</span>
            <PendingChip label="cart total" />
          </div>
        </aside>
      </div>
    </Section>
  );
}
```

- [ ] **Step 4: Create `src/app/routes/cart/CartSuccess.tsx`**

```tsx
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { Section, DisplayTitle, Prose, Button } from '@/app/components/roote';
import { PATHS } from '@/app/paths';
import { useAuth } from '@/store/auth';

type SuccessState = { orderId?: string } | null;

export function CartSuccess() {
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
  const auth = useAuth();
  const orderId = (location.state as SuccessState)?.orderId;

  if (!orderId) return <Navigate to={withLocale(PATHS.products)} replace />;

  return (
    <Section tone="cream" className="pt-28 md:pt-32" gap={8}>
      <DisplayTitle as="h1" step="xl">
        {t('bag.success.title')}
      </DisplayTitle>
      <Prose>{t('bag.success.body')}</Prose>

      <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-6">
        <p className="text-sm uppercase text-muted-foreground">{t('bag.success.orderId')}</p>
        <p className="font-display text-lg font-medium tabular-nums">{orderId}</p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-medium">{t('bag.success.next')}</h2>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li>{t('bag.success.next1')}</li>
          <li>{t('bag.success.next2')}</li>
          <li>{t('bag.success.next3')}</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => {
            if (auth.email) {
              navigate(withLocale(PATHS.accountSection('profile')));
            } else {
              navigate(withLocale('/signup'), { state: { orderId } });
            }
          }}
        >
          {t('bag.success.trackOrder')}
        </Button>
        <Button to={withLocale(PATHS.products)} variant="secondary">{t('bag.success.continue')}</Button>
        <Button to={withLocale(PATHS.home)} variant="secondary">{t('bag.success.home')}</Button>
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Modify `src/app/routes/marketing/marketingRoutes.tsx`** — register the three routes

Find:
```tsx
import { LegalPageView } from '@/app/routes/legal/LegalPageView';
import { LocalizedNavigate } from '@/app/LocaleGate';
```

Replace with:
```tsx
import { LegalPageView } from '@/app/routes/legal/LegalPageView';
import { LocalizedNavigate } from '@/app/LocaleGate';
import { CartPage } from '@/app/routes/cart/CartPage';
import { CartCheckout } from '@/app/routes/cart/CartCheckout';
import { CartSuccess } from '@/app/routes/cart/CartSuccess';
```

Find:
```tsx
    { path: 'products', element: <Products /> },
    { path: 'products/:slug', element: <ProductDetail /> },
```

Replace with:
```tsx
    { path: 'products', element: <Products /> },
    { path: 'products/:slug', element: <ProductDetail /> },

    // Shop cart (secondary surface)
    { path: 'cart', element: <CartPage /> },
    { path: 'cart/checkout', element: <CartCheckout /> },
    { path: 'cart/success', element: <CartSuccess /> },
```

- [ ] **Step 6: Modify `src/app/App.tsx`** — restore `CartProvider` in the provider tree

Find:
```tsx
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { TrackingProvider } from '@/store/tracking';
```

Replace with:
```tsx
import { SessionProvider } from '@/store/sessionStore';
import { AuthProvider } from '@/store/auth';
import { CartProvider } from '@/store/cart';
import { TrackingProvider } from '@/store/tracking';
```

Find:
```tsx
    <AuthProvider>
      <SessionProvider>
        <TrackingProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </TrackingProvider>
      </SessionProvider>
    </AuthProvider>
```

Replace with:
```tsx
    <AuthProvider>
      <SessionProvider>
        <CartProvider>
          <TrackingProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </TrackingProvider>
        </CartProvider>
      </SessionProvider>
    </AuthProvider>
```

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 8: Manual check — `/cart` is reachable**

Run: `pnpm dev`, open `http://localhost:5173/en/cart` (or whatever port it prints). Expected: empty-cart state renders ("Your cart is empty." + a "Browse products" button pointing at `/en/products`). No console errors. Stop the dev server after checking.

- [ ] **Step 9: Commit**

```bash
git add src/app/routes/cart src/app/paths.ts src/app/routes/marketing/marketingRoutes.tsx src/app/App.tsx
git commit -m "feat: revive /cart, /cart/checkout, /cart/success routes"
```

---

### Task 3: Header + Footer cart entry points

**Files:**
- Create: `src/app/components/shell/CartLink.tsx`
- Modify: `src/app/components/shell/Header.tsx`
- Modify: `src/app/components/shell/Footer.tsx`

**Interfaces:**
- Consumes: `useCart` (Task 1), `PATHS.cart` (Task 2).
- Produces: `CartLink({label: string; count: number})` component, used by `Header.tsx`.

- [ ] **Step 1: Create `src/app/components/shell/CartLink.tsx`**

```tsx
import { Link } from 'react-router';
import { ShoppingBag } from 'lucide-react';
import { useLocalizedPath } from '@/i18n/LocaleProvider';
import { PATHS } from '@/app/paths';

/** Cart icon + count badge, in the marketing header's icon row. Prominence
 *  (color, size) and the post-add "continue shopping or view cart" popup are
 *  a separate pass (Mischa finding #6) — this is the plain icon+badge only. */
export function CartLink({ label, count }: { label: string; count: number }) {
  const withLocale = useLocalizedPath();
  return (
    <Link
      to={withLocale(PATHS.cart)}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-foreground/10"
    >
      <ShoppingBag width={20} height={20} strokeWidth={1.5} aria-hidden />
      {count > 0 && (
        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-sm font-semibold text-accent-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Modify `src/app/components/shell/Header.tsx`** — add the cart icon back next to the account icon

Find:
```tsx
import { Button, Drawer, IconButton, LanguagePicker } from '@/app/components/roote';
import { cn } from '@/app/components/ui/utils';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';
```

Replace with:
```tsx
import { Button, Drawer, IconButton, LanguagePicker } from '@/app/components/roote';
import { CartLink } from '@/app/components/shell/CartLink';
import { cn } from '@/app/components/ui/utils';
import { PATHS } from '@/app/paths';
import type { MessageKey } from '@/i18n/messages';
import { useCart } from '@/store/cart';
```

Find:
```tsx
  const t = useT();
  const withLocale = useLocalizedPath();
  const condensed = useScrollCondense();
  const { locale, setLocale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
```

Replace with:
```tsx
  const t = useT();
  const withLocale = useLocalizedPath();
  const condensed = useScrollCondense();
  const cart = useCart();
  const { locale, setLocale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
```

Find:
```tsx
              <Link
                to={withLocale(PATHS.account)}
                aria-label={t('marketing.nav.account')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <User width={20} height={20} strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
          </div>
```

Replace with:
```tsx
              <Link
                to={withLocale(PATHS.account)}
                aria-label={t('marketing.nav.account')}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <User width={20} height={20} strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
            <CartLink label={t('cart.open')} count={cart.count} />
          </div>
```

- [ ] **Step 3: Modify `src/app/components/shell/Footer.tsx`** — restore the cart footer link

Read the file first to find the exact `ACCOUNT_LINKS` array (it currently ends with `[PATHS.account, 'marketing.nav.account']`, no cart entry — added back below).

Find:
```tsx
const ACCOUNT_LINKS: Col['links'] = [
  [PATHS.faq, 'marketing.nav.faq'],
  [PATHS.support, 'marketing.nav.support'],
  [PATHS.account, 'marketing.nav.account'],
];
```

Replace with:
```tsx
const ACCOUNT_LINKS: Col['links'] = [
  [PATHS.faq, 'marketing.nav.faq'],
  [PATHS.support, 'marketing.nav.support'],
  [PATHS.account, 'marketing.nav.account'],
  [PATHS.cart, 'marketing.nav.bag'],
];
```

(The i18n key is still named `marketing.nav.bag` — Task 5 fixes its *value* to say "Cart" in the locales that still say "Bag"; renaming the key itself is out of scope per the design spec.)

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 5: Manual check — header/footer cart icon**

Run: `pnpm dev`, open the home page. Expected: a cart icon (empty, no badge) appears in the header next to the account icon, and clicking it navigates to `/en/cart`. Scroll to the footer and confirm a "Bag"-or-"Cart"-labeled link is present under the account column and also goes to `/en/cart`. Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/shell/CartLink.tsx src/app/components/shell/Header.tsx src/app/components/shell/Footer.tsx
git commit -m "feat: revive header/footer cart entry points"
```

---

### Task 4: "Add to Cart" on the shop grid (`Products.tsx`)

**Files:**
- Modify: `src/app/routes/marketing/Products.tsx`

**Interfaces:**
- Consumes: `useCart` (Task 1), `useToast` from `@/app/components/roote` (existing).

- [ ] **Step 1: Add imports** — `useCart` and `useToast`

Find:
```tsx
import {
  Section,
  DisplayTitle,
  SectionIntro,
  Button,
  ProductCard,
  SegmentedControl,
  PendingChip,
  MediaPlaceholder,
  Hero,
  CtaSection,
  renderWithEmphasis,
} from '@/app/components/roote';
import { PATHS } from '@/app/paths';
```

Replace with:
```tsx
import {
  Section,
  DisplayTitle,
  SectionIntro,
  Button,
  ProductCard,
  SegmentedControl,
  PendingChip,
  MediaPlaceholder,
  Hero,
  CtaSection,
  renderWithEmphasis,
  useToast,
} from '@/app/components/roote';
import { useCart } from '@/store/cart';
import { PATHS } from '@/app/paths';
```

- [ ] **Step 2: Update the stale doc comment on `FindYourMatchCta`**

Find:
```tsx
/* Every product and bundle is assessment-gated — no self-serve add-to-bag.
   Point people at the free hair analysis instead of a buy button. */
function FindYourMatchCta() {
```

Replace with:
```tsx
/* 2026-09-22: individual products now get a direct "Add to Cart" button
   (below, in `Products()`) instead of this — per-product purchase no longer
   requires the assessment. This CTA now only survives for the (currently
   hidden) BundleSection/BundleCard, which hasn't been revisited yet. */
function FindYourMatchCta() {
```

- [ ] **Step 3: Replace the per-product CTA and update the page's own doc comment**

Find:
```tsx
/**
 * The catalogue browse page — every product requires the free assessment
 * first, so there is no self-serve add-to-bag here; each card points to the
 * assessment instead. Prices render as [PENDING].
 */
export function Products() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const [filter, setFilter] = useState<Filter>('all');
  const items = PRODUCTS.filter((p) => matches(p, filter));
```

Replace with:
```tsx
/**
 * The catalogue browse page — every product has a direct "Add to Cart"
 * button (2026-09-22, product-owner request: no need to complete the
 * assessment before buying). Prices render as [PENDING].
 */
export function Products() {
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const cart = useCart();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const items = PRODUCTS.filter((p) => matches(p, filter));
```

Find:
```tsx
          {items.map((p) => (
            <div key={p.slug} className="flex flex-col place-content-between gap-4">
              <ProductCard
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : formatMoney(p.price, rooteContent.currency, cl).formatted}
                packaging={p.concern === 'gray' || p.concern === 'gray-support' ? 'women' : 'men'}
                mediaAlt={`${p.name} packaging`}
                mediaLabel={`${p.name}: product photography`}
                image={PRODUCT_PHOTOS[p.slug]}
              />
              <FindYourMatchCta />
            </div>
          ))}
```

Replace with:
```tsx
          {items.map((p) => (
            <div key={p.slug} className="flex flex-col place-content-between gap-4">
              <ProductCard
                name={p.name}
                subtitle={pickLocalized(p.subtitle, cl)}
                to={withLocale(PATHS.product(p.slug))}
                priceLabel={p.price === null ? null : formatMoney(p.price, rooteContent.currency, cl).formatted}
                packaging={p.concern === 'gray' || p.concern === 'gray-support' ? 'women' : 'men'}
                mediaAlt={`${p.name} packaging`}
                mediaLabel={`${p.name}: product photography`}
                image={PRODUCT_PHOTOS[p.slug]}
              />
              <Button
                caps
                className="w-full"
                onClick={() => {
                  cart.add(p.slug);
                  toast.show(t('cart.added'), 'success');
                }}
              >
                {t('cart.add')}
              </Button>
            </div>
          ))}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 5: Manual check**

Run: `pnpm dev`, open `/en/products`. Expected: every product card shows an "Add to Cart" button (no more "Start Free Hair Analysis"/"Find your match" per card). Click it on two different products; expected: a toast reading "Added" appears each time, and the header cart badge increments to 2. Open `/en/cart`; expected: both products are listed with qty 1 each. Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/marketing/Products.tsx
git commit -m "feat: replace shop-grid quiz CTA with Add to Cart"
```

---

### Task 5: "Add to Cart" on the product detail page (`ProductDetail.tsx`)

**Files:**
- Modify: `src/app/routes/marketing/ProductDetail.tsx`

**Interfaces:**
- Consumes: `useCart` (Task 1), `useToast` from `@/app/components/roote` (existing).

- [ ] **Step 1: Add imports**

Find:
```tsx
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  Badge,
  Accordion,
  MediaPlaceholder,
  IngredientCard,
  ProductCard,
  PendingChip,
  CtaSection,
  SectionIntro,
} from '@/app/components/roote';
import { useFitTitle } from '@/app/lib/useFitTitle';
import { PATHS } from '@/app/paths';
```

Replace with:
```tsx
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  Badge,
  Accordion,
  MediaPlaceholder,
  IngredientCard,
  ProductCard,
  PendingChip,
  CtaSection,
  SectionIntro,
  useToast,
} from '@/app/components/roote';
import { useFitTitle } from '@/app/lib/useFitTitle';
import { useCart } from '@/store/cart';
import { PATHS } from '@/app/paths';
```

- [ ] **Step 2: Add the cart/toast hooks and update the doc comment**

Find:
```tsx
/** Product page template (brief §20). Secondary to the assessment — the primary
 *  action is always "Start free hair analysis". */
export function ProductDetail() {
  const { slug } = useParams();
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const titleRef = useFitTitle<HTMLHeadingElement>(3);
  const product = slug ? getProduct(slug) : undefined;
```

Replace with:
```tsx
/** Product page template (brief §20). Primary action is a direct
 *  "Add to Cart" (2026-09-22, product-owner request) — no assessment
 *  required to buy. */
export function ProductDetail() {
  const { slug } = useParams();
  const t = useT();
  const cl = useLocale().locale;
  const withLocale = useLocalizedPath();
  const titleRef = useFitTitle<HTMLHeadingElement>(3);
  const cart = useCart();
  const toast = useToast();
  const product = slug ? getProduct(slug) : undefined;
```

- [ ] **Step 3: Replace the hero CTA button**

Find:
```tsx
            <div className="mt-4 w-full sm:w-auto">
              <Button to={withLocale(PATHS.analysis)} caps className="w-full sm:w-auto">
                {t('marketing.nav.cta')}
              </Button>
            </div>
```

Replace with:
```tsx
            <div className="mt-4 w-full sm:w-auto">
              <Button
                caps
                className="w-full sm:w-auto"
                onClick={() => {
                  cart.add(product.slug);
                  toast.show(t('cart.added'), 'success');
                }}
              >
                {t('cart.add')}
              </Button>
            </div>
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics. (`PATHS` is still used elsewhere in this file — e.g. `PATHS.product(p.slug)` in the related-products grid — so its import stays; typecheck will catch it if that assumption is ever wrong.)

- [ ] **Step 5: Manual check**

Run: `pnpm dev`, open any product's own page (e.g. `/en/products/density-6`). Expected: the hero button reads "Add to Cart", clicking it shows the "Added" toast and increments the header badge. The "Requires medical review"/"No prescription needed" badge is unchanged. Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add src/app/routes/marketing/ProductDetail.tsx
git commit -m "feat: replace product-page quiz CTA with Add to Cart"
```

---

### Task 6: Fix "bag" wording in copy (en/ar/es — he/ru/fr already say "cart")

**Files:**
- Modify: `src/i18n/messages/en.ts`
- Modify: `src/i18n/messages/ar.ts`
- Modify: `src/i18n/messages/es.ts`

**Interfaces:** None — copy-only, no new keys, no code changes.

Before starting, note: `he.ts`, `ru.ts`, and `fr.ts` already say "cart"/"basket" (`הסל`, `корзина`, `panier`) in every one of these values — checked directly, nothing to change there. Only `en`, `ar`, and `es` still say "bag" in these 8 values per file (`cart.open`, `cart.title`, `cart.empty`, `cart.add`, `cart.viewBag`, `bag.title`, `bag.checkout.edit`, `bag.checkout.back`), plus `marketing.nav.bag`'s value in the same three locales (touched because Task 3 wired that key into the footer).

- [ ] **Step 1: Fix `src/i18n/messages/en.ts`**

Find:
```ts
  'cart.open': 'Open bag',
  'cart.close': 'Close',
  'cart.title': 'Your bag',
  'cart.empty': 'Your bag is empty.',
  'cart.browse': 'Browse products',
  'cart.add': 'Add to bag',
  'cart.added': 'Added',
  'cart.decrease': 'Decrease quantity',
  'cart.increase': 'Increase quantity',
  'cart.remove': 'Remove',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Checkout',
  'cart.viewBag': 'View full bag',
```

Replace with:
```ts
  'cart.open': 'Open cart',
  'cart.close': 'Close',
  'cart.title': 'Your cart',
  'cart.empty': 'Your cart is empty.',
  'cart.browse': 'Browse products',
  'cart.add': 'Add to cart',
  'cart.added': 'Added',
  'cart.decrease': 'Decrease quantity',
  'cart.increase': 'Increase quantity',
  'cart.remove': 'Remove',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Checkout',
  'cart.viewBag': 'View full cart',
```

Find:
```ts
  'bag.title': 'Your bag',
```

Replace with:
```ts
  'bag.title': 'Your cart',
```

Find:
```ts
  'bag.checkout.edit': 'Edit bag',
```

Replace with:
```ts
  'bag.checkout.edit': 'Edit cart',
```

Find:
```ts
  'bag.checkout.back': 'Back to bag',
```

Replace with:
```ts
  'bag.checkout.back': 'Back to cart',
```

Find:
```ts
  'marketing.nav.bag': 'Bag',
```

Replace with:
```ts
  'marketing.nav.bag': 'Cart',
```

- [ ] **Step 2: Fix `src/i18n/messages/ar.ts`**

Find:
```ts
  'cart.open': 'فتح الحقيبة',
  'cart.close': 'إغلاق',
  'cart.title': 'حقيبتك',
  'cart.empty': 'حقيبتك فارغة.',
  'cart.browse': 'تصفّح المنتجات',
  'cart.add': 'أضف إلى الحقيبة',
  'cart.added': 'تمت الإضافة',
  'cart.decrease': 'إنقاص الكمية',
  'cart.increase': 'زيادة الكمية',
  'cart.remove': 'إزالة',
  'cart.subtotal': 'المجموع الفرعي',
  'cart.checkout': 'الدفع',
  'cart.viewBag': 'عرض الحقيبة كاملة',
```

Replace with:
```ts
  'cart.open': 'فتح السلة',
  'cart.close': 'إغلاق',
  'cart.title': 'سلتك',
  'cart.empty': 'سلتك فارغة.',
  'cart.browse': 'تصفّح المنتجات',
  'cart.add': 'أضف إلى السلة',
  'cart.added': 'تمت الإضافة',
  'cart.decrease': 'إنقاص الكمية',
  'cart.increase': 'زيادة الكمية',
  'cart.remove': 'إزالة',
  'cart.subtotal': 'المجموع الفرعي',
  'cart.checkout': 'الدفع',
  'cart.viewBag': 'عرض السلة كاملة',
```

Find:
```ts
  'bag.title': 'حقيبتك',
```

Replace with:
```ts
  'bag.title': 'سلتك',
```

Find:
```ts
  'bag.checkout.edit': 'تعديل الحقيبة',
```

Replace with:
```ts
  'bag.checkout.edit': 'تعديل السلة',
```

Find:
```ts
  'bag.checkout.back': 'العودة إلى الحقيبة',
```

Replace with:
```ts
  'bag.checkout.back': 'العودة إلى السلة',
```

Find:
```ts
  'marketing.nav.bag': 'الحقيبة',
```

Replace with:
```ts
  'marketing.nav.bag': 'السلة',
```

- [ ] **Step 3: Fix `src/i18n/messages/es.ts`**

Find:
```ts
  'cart.open': 'Abrir la bolsa',
  'cart.close': 'Cerrar',
  'cart.title': 'Su bolsa',
  'cart.empty': 'Su bolsa está vacía.',
  'cart.browse': 'Explorar productos',
  'cart.add': 'Añadir a la bolsa',
  'cart.added': 'Añadido',
  'cart.decrease': 'Reducir cantidad',
  'cart.increase': 'Aumentar cantidad',
  'cart.remove': 'Quitar',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Finalizar compra',
  'cart.viewBag': 'Ver la bolsa completa',
```

Replace with:
```ts
  'cart.open': 'Abrir el carrito',
  'cart.close': 'Cerrar',
  'cart.title': 'Su carrito',
  'cart.empty': 'Su carrito está vacío.',
  'cart.browse': 'Explorar productos',
  'cart.add': 'Añadir al carrito',
  'cart.added': 'Añadido',
  'cart.decrease': 'Reducir cantidad',
  'cart.increase': 'Aumentar cantidad',
  'cart.remove': 'Quitar',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Finalizar compra',
  'cart.viewBag': 'Ver el carrito completo',
```

Find:
```ts
  'bag.title': 'Su bolsa',
```

Replace with:
```ts
  'bag.title': 'Su carrito',
```

Find:
```ts
  'bag.checkout.edit': 'Editar la bolsa',
```

Replace with:
```ts
  'bag.checkout.edit': 'Editar el carrito',
```

Find:
```ts
  'bag.checkout.back': 'Volver a la bolsa',
```

Replace with:
```ts
  'bag.checkout.back': 'Volver al carrito',
```

Find:
```ts
  'marketing.nav.bag': 'Bolsa',
```

Replace with:
```ts
  'marketing.nav.bag': 'Carrito',
```

- [ ] **Step 4: Verify parity**

Run: `pnpm i18n:check`
Expected: `he: missing=0 stray=0 empty=0 placeholder-mismatch=0` and the same for `ar`/`ru`/`fr`/`es` — no new mismatches (this task only changes *values*, never removes/adds/renames a key, so parity can't regress).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/messages/en.ts src/i18n/messages/ar.ts src/i18n/messages/es.ts
git commit -m "fix: say cart, not bag, in en/ar/es copy (he/ru/fr already did)"
```

---

### Task 7: Order-history label fix on `/account/profile`

**Files:**
- Modify: `src/app/routes/app/AppProfile.tsx`

**Interfaces:**
- Consumes: `o.kind` (`'program' | 'cart'`, from `Order['kind']` via `OrderRecord`, Task 1) — already present on every `OrderRecord`, just not branched on today. Consumes the existing i18n keys `app.profile.orders.program` and `app.profile.orders.bag` (both already exist, in all 6 locales, currently unused for the latter — verified via `pnpm i18n:check` passing before this task; no i18n edit needed in this task).

- [ ] **Step 1: Add a kind→label map and use it**

Find:
```tsx
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="flex flex-col">
                      <span className="tabular-nums" dir="ltr">{o.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {t('app.profile.orders.program')} · {o.label}
                      </span>
                    </span>
```

Replace with:
```tsx
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="flex flex-col">
                      <span className="tabular-nums" dir="ltr">{o.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {t(o.kind === 'program' ? 'app.profile.orders.program' : 'app.profile.orders.bag')} · {o.label}
                      </span>
                    </span>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 3: Manual check**

Run: `pnpm dev`, add a product to the cart, complete checkout (dummy card details — see `CheckoutFields` for its client-side format validation), sign up/log in when prompted from the success page, then open `/en/account/profile`. Expected: the order line shows "Shop · Qty N" (not "Program · Qty N"). Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/app/AppProfile.tsx
git commit -m "fix: label cart orders correctly in account order history"
```

---

### Task 8: Full smoke test and production build

**Files:** None modified — verification only.

- [ ] **Step 1: Full typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics.

- [ ] **Step 2: i18n and content parity**

Run: `pnpm i18n:check && pnpm content:check`
Expected: all six locales `missing=0 stray=0 empty=0 placeholder-mismatch=0`; all content modules `missing-*=0 empty=0`.

- [ ] **Step 3: Production build**

Run: `pnpm build`
Expected: builds successfully to `dist/`. The existing "chunk larger than 500 kB" warning is expected (documented in `CLAUDE.md`) — not a regression.

- [ ] **Step 4: End-to-end manual walkthrough**

Run: `pnpm dev` and, in a browser:
1. From `/en/products`, add two different products to the cart via their grid "Add to Cart" buttons. Confirm the toast and the header badge count (should read 2).
2. Open a third product's own detail page and add it via the hero "Add to Cart" button. Confirm the badge now reads 3.
3. Open `/en/cart`. Confirm all three lines are present, each qty 1; increase one line's quantity, confirm the badge updates; remove one line, confirm it disappears and the badge updates.
4. Click "Proceed to checkout" (or the equivalent `bag.checkout` label), fill in the checkout form, and submit. Confirm you land on the success page with an order ID.
5. From the success page, either sign up or log in (whichever the flow presents), and confirm you land on `/en/account/profile` with the new order showing "Shop · Qty 2" (or the correct remaining quantity) in the order history.
6. Confirm the footer's cart link and the header's cart icon both still point at `/en/cart` and the badge has reset to 0 after checkout.

- [ ] **Step 5: Final commit (if any stray changes were made during the walkthrough)**

```bash
git status
```
If clean, no commit needed — this task is verification-only. If the walkthrough surfaced a fix, make it, re-run the relevant checks above, and commit with a message describing the fix.
