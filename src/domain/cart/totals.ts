import { cartDiscount, type DiscountScheme } from './discounts';

export type ShippingRule = { flatRate: number; freeOverSubtotal: number };

export type CartTotals = {
  /** Gross: every line at its own unit price, before any discount. */
  subtotal: number | null;
  /** Saving from the best applicable discount (0 when none), see `discounts.ts`. */
  discount: number | null;
  discountScheme: DiscountScheme | null;
  shipping: number | null;
  total: number | null;
};

/**
 * Cart subtotal, discount, shipping, and total. Real arithmetic on each line's
 * own already-supplied price, but only when every line has one: a single
 * unpriced line means the true subtotal (and so discount, shipping and total)
 * isn't knowable, so they all come back `null` and render as [PENDING].
 * Shipping is judged on the post-discount amount.
 */
export function cartTotals(
  lines: { price: number | null; qty: number; sku?: string }[],
  rule: ShippingRule,
): CartTotals {
  if (lines.some((l) => l.price === null)) {
    return { subtotal: null, discount: null, discountScheme: null, shipping: null, total: null };
  }
  const subtotal = lines.reduce((sum, l) => sum + l.price! * l.qty, 0);
  const { amount: discount, scheme } = cartDiscount(lines);
  const net = subtotal - discount;
  const shipping = net >= rule.freeOverSubtotal ? 0 : rule.flatRate;
  return {
    subtotal,
    discount,
    discountScheme: scheme,
    shipping,
    total: Math.round((net + shipping) * 100) / 100,
  };
}
