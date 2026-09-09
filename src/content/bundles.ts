import { L, type LocalizedText } from './localized';

/**
 * "Buy the set" bundles for the à-la-carte shop — three product lines, each
 * in men's and women's packaging (brief §9). Gray Support and Hair Growth
 * are non-prescription and eligible for one-click add-to-bag. Complete
 * System and Hair Growth both include a Density SKU, which stays assessment
 * + review gated — their cards show a review note instead of "Add to bag"
 * (see `bundleRequiresReview` in Products.tsx).
 *
 * `compareAtPrice` is the sum of the bundle's own component SKU prices (the
 * real cost of buying the same items separately) — never invented, always
 * derivable from `content/products.ts`. 2026-09-08: user asked to match
 * heyhair.co's bundle-discount pattern (their real "ESCAPE YOUR GRAY CORE"
 * and "Hair Growth Starter/Ultimate" kits discount 9.6%–12.5% off the sum of
 * components, sourced by fetching their live product data). Complete System
 * and Hair Growth Bundle previously had no discount (price === sum); both
 * now carry a ~10% markdown to match. Gray Support Bundle's price ($70) was
 * set earlier by direct competitor price-matching (a separate prior
 * decision, not re-touched here) — its `compareAtPrice` ($90, the real sum
 * of its two components) is therefore a genuine ~22% discount, wider than
 * the 10-12% band, because it already undercut the component sum before
 * this change.
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
  /** Sum of the component SKUs' own prices — the "if bought separately"
   *  reference shown struck through next to `price`. `null` when there's no
   *  discount to show (price === sum, or price is itself null/pending). */
  compareAtPrice: number | null;
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
    // Sum of components: density-15 (53) + gray-support (38) + gray-serum (52) + regrowth-shampoo (40) = 183.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 165,
    compareAtPrice: 183,
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
    // Sum of components: density-15 (53) + gray-support (38) + gray-serum (52) + regrowth-shampoo (40) = 183.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 165,
    compareAtPrice: 183,
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
    // compareAtPrice is the real sum of its own components: gray-support (38) + gray-serum (52) = 90.
    price: 70,
    compareAtPrice: 90,
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
    // compareAtPrice is the real sum of its own components: gray-support (38) + gray-serum (52) = 90.
    price: 70,
    compareAtPrice: 90,
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
    // Sum of components: density-15 (53) + regrowth-shampoo (40) = 93.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 84,
    compareAtPrice: 93,
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
    // Sum of components: density-15 (53) + regrowth-shampoo (40) = 93.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 84,
    compareAtPrice: 93,
  },
];
