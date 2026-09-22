import { lsGet, lsSet } from './persistence';
import type { Order } from './checkout';

const KEY = 'orders';
const MAX = 20;

export type OrderRecord = {
  id: string;
  kind: Order['kind'];
  at: string; // ISO timestamp
  label: string; // human summary, e.g. "180-day program" or "3 items"
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
};

/** Newest first. */
export function readOrders(): OrderRecord[] {
  return lsGet<OrderRecord[]>(KEY, []);
}

/** Prepends a record and caps the history at MAX. Called once, right after a successful payment. */
export function recordOrder(record: OrderRecord): void {
  const next = [record, ...readOrders().filter((o) => o.id !== record.id)].slice(0, MAX);
  lsSet(KEY, next);
}
