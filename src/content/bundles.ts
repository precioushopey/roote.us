import { L, type LocalizedText } from './localized';

/**
 * "Buy the set" bundles for the à-la-carte shop — three product lines, each
 * in men's and women's packaging (brief §9). Gray Support and Hair Growth
 * are non-prescription and eligible for one-click add-to-bag. Complete
 * System and Hair Growth both include a Density SKU, which stays assessment
 * + review gated — their cards show a review note instead of "Add to bag"
 * (see `bundleRequiresReview` in Products.tsx). Gray Support Bundle price
 * matches the equivalent competitor kit (heyhair.co's "Advanced Anti-Grey
 * Hair Treatment Kit" — the same two products). Complete System and Hair
 * Growth Bundle have no equivalent competitor combo (neither reference site
 * bundles a topical treatment with a shampoo), so their price is the sum of
 * their component SKUs' own (competitor-matched or client-set) prices —
 * client instruction, 2026-09-08 — not an invented number.
 */

export type BundlePackaging = 'men' | 'women';

export type ShopBundle = {
  id: string;
  packaging: BundlePackaging;
  /** Product slugs included in this bundle, each at qty 1. */
  skus: string[];
  name: LocalizedText;
  summary: LocalizedText;
  price: number | null;
};

export const SHOP_BUNDLES: ShopBundle[] = [
  {
    id: 'complete-system-men',
    packaging: 'men',
    skus: ['density-15', 'gray-support', 'gray-serum', 'regrowth-shampoo'],
    name: L('Complete System — Men', 'המערכת המלאה — לגברים'),
    summary: L(
      'The full thinning and gray routine, in men’s packaging.',
      'שגרת הצפיפות והשיער האפור המלאה, באריזה לגברים.',
    ),
    // Sum of components: density-15 (53) + gray-support (38) + gray-serum (52) + regrowth-shampoo (40).
    price: 183,
  },
  {
    id: 'complete-system-women',
    packaging: 'women',
    skus: ['density-15', 'gray-support', 'gray-serum', 'regrowth-shampoo'],
    name: L('Complete System — Women', 'המערכת המלאה — לנשים'),
    summary: L(
      'The full thinning and gray routine, in women’s packaging.',
      'שגרת הצפיפות והשיער האפור המלאה, באריזה לנשים.',
    ),
    // Sum of components: density-15 (53) + gray-support (38) + gray-serum (52) + regrowth-shampoo (40).
    price: 183,
  },
  {
    id: 'gray-support-bundle-men',
    packaging: 'men',
    skus: ['gray-support', 'gray-serum'],
    name: L('Gray Support Bundle — Men', 'חבילת Gray Support — לגברים'),
    summary: L(
      'Gray Support and Gray Serum, in men’s packaging.',
      'Gray Support ו-Gray Serum, באריזה לגברים.',
    ),
    // Matches Advanced Anti-Grey Hair Treatment Kit (Gray Escape + Root Revival Serum, 1 kit), heyhair.co.
    price: 70,
  },
  {
    id: 'gray-support-bundle-women',
    packaging: 'women',
    skus: ['gray-support', 'gray-serum'],
    name: L('Gray Support Bundle — Women', 'חבילת Gray Support — לנשים'),
    summary: L(
      'Gray Support and Gray Serum, in women’s packaging.',
      'Gray Support ו-Gray Serum, באריזה לנשים.',
    ),
    // Matches Advanced Anti-Grey Hair Treatment Kit (Gray Escape + Root Revival Serum, 1 kit), heyhair.co.
    price: 70,
  },
  {
    id: 'hair-growth-bundle-men',
    packaging: 'men',
    skus: ['density-15', 'regrowth-shampoo'],
    name: L('Hair Growth Bundle — Men', 'חבילת צמיחת שיער — לגברים'),
    summary: L(
      'Density treatment and Regrowth Shampoo, in men’s packaging.',
      'טיפול Density ושמפו Regrowth, באריזה לגברים.',
    ),
    // Sum of components: density-15 (53) + regrowth-shampoo (40).
    price: 93,
  },
  {
    id: 'hair-growth-bundle-women',
    packaging: 'women',
    skus: ['density-15', 'regrowth-shampoo'],
    name: L('Hair Growth Bundle — Women', 'חבילת צמיחת שיער — לנשים'),
    summary: L(
      'Density treatment and Regrowth Shampoo, in women’s packaging.',
      'טיפול Density ושמפו Regrowth, באריזה לנשים.',
    ),
    // Sum of components: density-15 (53) + regrowth-shampoo (40).
    price: 93,
  },
];
