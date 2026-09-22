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

/** A purchase of a personalized program (the /start funnel) — the only order
 *  kind: every product requires the assessment first, so there is no
 *  separate self-serve shop checkout. */
export type ProgramOrder = {
  kind: 'program';
  reportId: string;
  durationDays: number;
  contact: Contact;
  card: CardRef;
};

export type Order = ProgramOrder;

let counter = 0;
function nextOrderId(): string {
  counter += 1;
  return `ord-${Date.now()}-${counter}`;
}

// TODO: Marwell — wire to the real store/payment backend (Shopify Checkout / payment intent).
// Stub: resolves { status: 'success', orderId } after a short delay. No full card number or CVC is
// ever passed here — callers build `card` from the last four digits + expiry only (see CheckoutFields).
export async function submitPayment(order: Order): Promise<{ status: 'success'; orderId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (import.meta.env.DEV && localStorage.getItem('roote.debug.forceCheckoutFailure') === '1') {
    throw new Error('Payment failed (dev-forced failure — clear roote.debug.forceCheckoutFailure to disable)');
  }
  return { status: 'success', orderId: nextOrderId() };
}
