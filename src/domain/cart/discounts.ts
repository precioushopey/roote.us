/**
 * Cart discounts (client price list, 2026-10-06). Pure: typed inputs, typed
 * outputs; no React, DOM or storage.
 *
 *  - quantity: 4+ units of the same product -> 10% off that product; 12+ -> 30%.
 *  - set:      one of each of the six products (the complete set) -> 10% off
 *              each complete set.
 *  - package:  12 of EACH of the six products (72 units) -> 40% off all of them.
 *
 * Ruling (the client's answer on stacking was unclear): discounts do NOT stack.
 * Each scheme is priced on its own and the single best (largest saving) applies.
 * Bundle lines are excluded — a bundle already carries its own 10% markdown
 * (see `content/bundles.ts`) and is never discounted twice.
 *
 * Every number is in `DISCOUNT_RULES` so the client can change one place.
 */

export type DiscountScheme = 'quantity' | 'set' | 'package';

export const DISCOUNT_RULES = {
  /** Highest threshold first. */
  quantityTiers: [
    { minQty: 12, percent: 30 },
    { minQty: 4, percent: 10 },
  ],
  completeSetPercent: 10,
  fullPackage: { qtyEach: 12, percent: 40 },
  /** The six launch products that make up the complete set / full package. */
  setSkus: ['density-6', 'density-10', 'density-15', 'gray-serum', 'gray-support', 'regrowth-shampoo'],
} as const;

export type DiscountLine = {
  /** Product slug for a single-product line; `undefined` for a bundle. */
  sku?: string;
  price: number | null;
  qty: number;
};

export type CartDiscount = { amount: number; scheme: DiscountScheme | null };

const NONE: CartDiscount = { amount: 0, scheme: null };
const cents = (n: number) => Math.round(n * 100) / 100;

function quantityPercent(qty: number): number {
  return DISCOUNT_RULES.quantityTiers.find((t) => qty >= t.minQty)?.percent ?? 0;
}

/** The best single discount for these lines (0 / `null` scheme when none applies
 *  or any single-product line is unpriced). */
export function cartDiscount(lines: DiscountLine[]): CartDiscount {
  const sku = lines.filter((l): l is DiscountLine & { sku: string; price: number } => !!l.sku && l.price !== null);
  if (sku.length === 0) return NONE;

  const qtyBySku = new Map<string, number>();
  const priceBySku = new Map<string, number>();
  for (const l of sku) {
    qtyBySku.set(l.sku, (qtyBySku.get(l.sku) ?? 0) + l.qty);
    priceBySku.set(l.sku, l.price);
  }

  const quantity = cents(
    [...qtyBySku].reduce((sum, [s, q]) => sum + (priceBySku.get(s)! * q * quantityPercent(q)) / 100, 0),
  );

  const inSet = DISCOUNT_RULES.setSkus.map((s) => qtyBySku.get(s) ?? 0);
  const completeSets = Math.min(...inSet);
  const set =
    completeSets > 0
      ? cents(
          DISCOUNT_RULES.setSkus.reduce((sum, s) => sum + priceBySku.get(s)! * completeSets, 0) *
            (DISCOUNT_RULES.completeSetPercent / 100),
        )
      : 0;

  const pkg =
    completeSets > 0 && inSet.every((q) => q >= DISCOUNT_RULES.fullPackage.qtyEach)
      ? cents(
          DISCOUNT_RULES.setSkus.reduce((sum, s) => sum + priceBySku.get(s)! * qtyBySku.get(s)!, 0) *
            (DISCOUNT_RULES.fullPackage.percent / 100),
        )
      : 0;

  // Best single scheme; on a tie prefer the more specific one (package > set > quantity).
  const candidates: Array<[DiscountScheme, number]> = [
    ['package', pkg],
    ['set', set],
    ['quantity', quantity],
  ];
  const [scheme, amount] = candidates.reduce((best, c) => (c[1] > best[1] ? c : best));
  return amount > 0 ? { amount, scheme } : NONE;
}
