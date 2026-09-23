import type { CartLine } from './cart';

/** One postal address. `country` is fixed to `'US'` for now (91 ENTERPRISE LLC is a US
 *  entity, currency is USD) — CheckoutFields renders it as a locked field, not free text,
 *  so US-shaped phone/postal validation always applies. Multi-country shipping is a
 *  [PENDING] client/commerce decision, same as multi-currency (see roote.config.ts). */
export type Address = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

/** Shared contact + billing/shipping details (brief §8 — Mischa review, 2026-09-23:
 *  first/last name split, billing before shipping with a "same as billing" toggle, name
 *  collected once and never repeated on either address). `shipping` is always a concrete
 *  `Address` by the time it reaches `onSubmit` — CheckoutFields resolves "same as billing"
 *  into a copy of `billing`, so callers never need to know which the customer picked. */
export type Contact = {
  firstName: string;
  lastName: string;
  email: string;
  /** Optional — the only optional field (client instruction). */
  mobile: string;
  billing: Address;
  shipping: Address;
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
