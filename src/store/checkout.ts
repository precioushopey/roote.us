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
