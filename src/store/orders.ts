import { lsGet, lsSet } from './persistence';
import type { Order } from './checkout';

const KEY = 'orders';
const MAX = 20;

export type OrderRecord = {
  id: string;
  kind: Order['kind'];
  at: string; // ISO timestamp
  label: string; // human summary, e.g. "180-day program" or "3 items"
  /** Buyer's checkout email — with `id`, the credential for order-number sign-in
   *  (`auth.signInWithOrder`). Optional: orders recorded before 2026-09-23 lack it. */
  email?: string;
  /** Resolved product/bundle names + quantities for a cart order, so order
   *  history can show what was actually bought, not just a total count.
   *  Optional: a program order's `label` already names the specific
   *  program, and cart orders recorded before this field existed won't
   *  have it — callers reading history fall back to `label` when absent.
   *  `slug` (only set for a SKU line, not a bundle) lets order history look
   *  up the live `Product` record for its photo/subtitle/badges; falls back
   *  to plain `name`/`qty` when absent or when the product no longer
   *  resolves (e.g. removed from the catalog after the order was placed). */
  items?: { name: string; qty: number; slug?: string }[];
  /** Order total in the display currency: the program price, or a cart's
   *  subtotal + shipping. Optional: orders recorded before 2026-09-23 lack it,
   *  and it is left unset when a price was still [PENDING] at purchase. */
  total?: number;
  /** Cart orders only: the two parts of `total`. */
  subtotal?: number;
  shipping?: number;
  /** Program orders only: how long the purchased program runs. */
  durationDays?: number;
  /** Last four digits of the payment card. Never the full number, expiry or CVC. */
  cardLast4?: string;
  /** Shipping destination as "City, ST 90036" (no street address is kept). */
  shipTo?: string;
};

/** "Los Angeles, CA 90036" from a checkout address; street lines are deliberately dropped. */
export function shipToLabel(a: { city: string; state: string; postal: string }): string {
  return `${a.city.trim()}, ${a.state.trim()} ${a.postal.trim()}`;
}

/** Newest first. */
export function readOrders(): OrderRecord[] {
  return lsGet<OrderRecord[]>(KEY, []);
}

/** Prepends a record and caps the history at MAX. Called once, right after a successful payment. */
export function recordOrder(record: OrderRecord): void {
  const next = [record, ...readOrders().filter((o) => o.id !== record.id)].slice(0, MAX);
  lsSet(KEY, next);
}
