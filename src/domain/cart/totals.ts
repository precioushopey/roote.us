export type ShippingRule = { flatRate: number; freeOverSubtotal: number };

export type CartTotals = {
  subtotal: number | null;
  shipping: number | null;
  total: number | null;
};

/**
 * Cart subtotal, shipping, and total. Real arithmetic on each line's own
 * already-supplied price, but only when every line has one: a single unpriced
 * line means the true subtotal (and so shipping and total) isn't knowable, so
 * all three come back `null` and render as [PENDING].
 */
export function cartTotals(lines: { price: number | null; qty: number }[], rule: ShippingRule): CartTotals {
  if (lines.some((l) => l.price === null)) return { subtotal: null, shipping: null, total: null };
  const subtotal = lines.reduce((sum, l) => sum + l.price! * l.qty, 0);
  const shipping = subtotal >= rule.freeOverSubtotal ? 0 : rule.flatRate;
  return { subtotal, shipping, total: subtotal + shipping };
}
