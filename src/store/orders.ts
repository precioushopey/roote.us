import { lsGet, lsSet } from './persistence';
import type { Order } from './checkout';

const KEY = 'orders';
const MAX = 20;

export type OrderRecord = {
  id: string;
  kind: Order['kind'];
  at: string; // ISO timestamp
  label: string; // human summary, e.g. "180-day program" or "3 items"
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
