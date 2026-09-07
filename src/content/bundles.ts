import { L, type LocalizedText } from './localized';

/**
 * "Buy the set" bundles for the à-la-carte shop — three product lines, each
 * in men's and women's packaging (brief §9). Gray Support and Hair Growth
 * are non-prescription and eligible for one-click add-to-bag. Complete
 * System and Hair Growth both include a Density SKU, which stays assessment
 * + review gated — their cards show a review note instead of "Add to bag"
 * (see `bundleRequiresReview` in Products.tsx). Prices are `null` →
 * [PENDING] until the client supplies a price list (hard rule: never invent
 * product content).
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
      'The full thinning and gray routine together, in men’s packaging.',
      'שגרת הצפיפות והשיער האפור המלאה יחד, באריזה לגברים.',
    ),
    price: null,
  },
  {
    id: 'complete-system-women',
    packaging: 'women',
    skus: ['density-15', 'gray-support', 'gray-serum', 'regrowth-shampoo'],
    name: L('Complete System — Women', 'המערכת המלאה — לנשים'),
    summary: L(
      'The full thinning and gray routine together, in women’s packaging.',
      'שגרת הצפיפות והשיער האפור המלאה יחד, באריזה לנשים.',
    ),
    price: null,
  },
  {
    id: 'gray-support-bundle-men',
    packaging: 'men',
    skus: ['gray-support', 'gray-serum'],
    name: L('Gray Support Bundle — Men', 'חבילת Gray Support — לגברים'),
    summary: L(
      'Gray Support and Gray Serum together, in men’s packaging.',
      'Gray Support ו-Gray Serum יחד, באריזה לגברים.',
    ),
    price: null,
  },
  {
    id: 'gray-support-bundle-women',
    packaging: 'women',
    skus: ['gray-support', 'gray-serum'],
    name: L('Gray Support Bundle — Women', 'חבילת Gray Support — לנשים'),
    summary: L(
      'Gray Support and Gray Serum together, in women’s packaging.',
      'Gray Support ו-Gray Serum יחד, באריזה לנשים.',
    ),
    price: null,
  },
  {
    id: 'hair-growth-bundle-men',
    packaging: 'men',
    skus: ['density-15', 'regrowth-shampoo'],
    name: L('Hair Growth Bundle — Men', 'חבילת צמיחת שיער — לגברים'),
    summary: L(
      'Density treatment and Regrowth Shampoo together, in men’s packaging.',
      'טיפול Density ושמפו Regrowth יחד, באריזה לגברים.',
    ),
    price: null,
  },
  {
    id: 'hair-growth-bundle-women',
    packaging: 'women',
    skus: ['density-15', 'regrowth-shampoo'],
    name: L('Hair Growth Bundle — Women', 'חבילת צמיחת שיער — לנשים'),
    summary: L(
      'Density treatment and Regrowth Shampoo together, in women’s packaging.',
      'טיפול Density ושמפו Regrowth יחד, באריזה לנשים.',
    ),
    price: null,
  },
];
