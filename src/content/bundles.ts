import { L6, type LocalizedText } from './localized';

/**
 * "Buy the set" bundles for the à-la-carte shop — three product lines, each
 * in men's and women's packaging (brief §9). Gray Support and Hair Growth
 * are non-prescription and eligible for one-click add-to-cart. Complete
 * System and Hair Growth both include a Density SKU, which stays assessment
 * + review gated — their cards show a review note instead of "Add to cart"
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
    name: L6({
      en: 'Complete System: Men',
      he: 'המערכת המלאה: לגברים',
      ar: 'النظام الكامل: للرجال',
      ru: 'Полная система: для мужчин',
      fr: 'Système complet : pour hommes',
      es: 'Sistema completo: para hombres',
    }),
    summary: L6({
      en: 'The full thinning and gray routine, in men’s packaging.',
      he: 'שגרת הצפיפות והשיער האפור המלאה, באריזה לגברים.',
      ar: 'روتين الترقّق والشيب الكامل، بعبوة للرجال.',
      ru: 'Полный уход при поредении волос и седине, в мужской упаковке.',
      fr: 'La routine complète contre le dégarnissement et les cheveux gris, en emballage homme.',
      es: 'La rutina completa para el aclaramiento y las canas, en envase para hombre.',
    }),
    // Sum of components: density-15 (53) + gray-support (38) + gray-serum (52) + regrowth-shampoo (40) = 183.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 165,
    compareAtPrice: 183,
  },
  {
    id: 'complete-system-women',
    packaging: 'women',
    skus: ['density-15', 'gray-support', 'gray-serum', 'regrowth-shampoo'],
    name: L6({
      en: 'Complete System: Women',
      he: 'המערכת המלאה: לנשים',
      ar: 'النظام الكامل: للنساء',
      ru: 'Полная система: для женщин',
      fr: 'Système complet : pour femmes',
      es: 'Sistema completo: para mujeres',
    }),
    summary: L6({
      en: 'The full thinning and gray routine, in women’s packaging.',
      he: 'שגרת הצפיפות והשיער האפור המלאה, באריזה לנשים.',
      ar: 'روتين الترقّق والشيب الكامل، بعبوة للنساء.',
      ru: 'Полный уход при поредении волос и седине, в женской упаковке.',
      fr: 'La routine complète contre le dégarnissement et les cheveux gris, en emballage femme.',
      es: 'La rutina completa para el aclaramiento y las canas, en envase para mujer.',
    }),
    // Sum of components: density-15 (53) + gray-support (38) + gray-serum (52) + regrowth-shampoo (40) = 183.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 165,
    compareAtPrice: 183,
  },
  {
    id: 'gray-support-bundle-men',
    packaging: 'men',
    skus: ['gray-support', 'gray-serum'],
    name: L6({
      en: 'Gray Support Bundle: Men',
      he: 'חבילת הטיפול בשיער אפור: לגברים',
      ar: 'باقة العناية بالشيب: للرجال',
      ru: 'Комплект против седины: для мужчин',
      fr: 'Pack anti-cheveux gris : pour hommes',
      es: 'Pack anticanas: para hombres',
    }),
    summary: L6({
      en: 'Gray Support and Gray Serum, in men’s packaging.',
      he: 'קפסולות וסרום לשיער אפור, באריזה לגברים.',
      ar: 'كبسولات وسيروم العناية بالشيب، بعبوة للرجال.',
      ru: 'Капсулы и сыворотка против седины, в мужской упаковке.',
      fr: 'Gélules et sérum anti-cheveux gris, en emballage homme.',
      es: 'Cápsulas y sérum anticanas, en envase para hombre.',
    }),
    // Matches Advanced Anti-Grey Hair Treatment Kit (Gray Escape + Root Revival Serum, 1 kit), heyhair.co.
    // compareAtPrice is the real sum of its own components: gray-support (38) + gray-serum (52) = 90.
    price: 70,
    compareAtPrice: 90,
  },
  {
    id: 'gray-support-bundle-women',
    packaging: 'women',
    skus: ['gray-support', 'gray-serum'],
    name: L6({
      en: 'Gray Support Bundle: Women',
      he: 'חבילת הטיפול בשיער אפור: לנשים',
      ar: 'باقة العناية بالشيب: للنساء',
      ru: 'Комплект против седины: для женщин',
      fr: 'Pack anti-cheveux gris : pour femmes',
      es: 'Pack anticanas: para mujeres',
    }),
    summary: L6({
      en: 'Gray Support and Gray Serum, in women’s packaging.',
      he: 'קפסולות וסרום לשיער אפור, באריזה לנשים.',
      ar: 'كبسولات وسيروم العناية بالشيب، بعبوة للنساء.',
      ru: 'Капсулы и сыворотка против седины, в женской упаковке.',
      fr: 'Gélules et sérum anti-cheveux gris, en emballage femme.',
      es: 'Cápsulas y sérum anticanas, en envase para mujer.',
    }),
    // Matches Advanced Anti-Grey Hair Treatment Kit (Gray Escape + Root Revival Serum, 1 kit), heyhair.co.
    // compareAtPrice is the real sum of its own components: gray-support (38) + gray-serum (52) = 90.
    price: 70,
    compareAtPrice: 90,
  },
  {
    id: 'hair-growth-bundle-men',
    packaging: 'men',
    skus: ['density-15', 'regrowth-shampoo'],
    name: L6({
      en: 'Hair Growth Bundle: Men',
      he: 'חבילת צמיחת שיער: לגברים',
      ar: 'باقة نمو الشعر: للرجال',
      ru: 'Комплект для роста волос: для мужчин',
      fr: 'Pack Croissance capillaire : pour hommes',
      es: 'Pack Crecimiento del cabello: para hombres',
    }),
    summary: L6({
      en: 'Density treatment and Regrowth Shampoo, in men’s packaging.',
      he: 'טיפול לצפיפות השיער ושמפו לצמיחה מחדש, באריזה לגברים.',
      ar: 'علاج الكثافة وشامبو إعادة النمو، بعبوة للرجال.',
      ru: 'Уход за плотностью волос и шампунь для восстановления роста, в мужской упаковке.',
      fr: 'Le soin Densité et le shampooing repousse, en emballage homme.',
      es: 'El tratamiento de densidad y el champú de recrecimiento, en envase para hombre.',
    }),
    // Sum of components: density-15 (53) + regrowth-shampoo (40) = 93.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 84,
    compareAtPrice: 93,
  },
  {
    id: 'hair-growth-bundle-women',
    packaging: 'women',
    skus: ['density-15', 'regrowth-shampoo'],
    name: L6({
      en: 'Hair Growth Bundle: Women',
      he: 'חבילת צמיחת שיער: לנשים',
      ar: 'باقة نمو الشعر: للنساء',
      ru: 'Комплект для роста волос: для женщин',
      fr: 'Pack Croissance capillaire : pour femmes',
      es: 'Pack Crecimiento del cabello: para mujeres',
    }),
    summary: L6({
      en: 'Density treatment and Regrowth Shampoo, in women’s packaging.',
      he: 'טיפול לצפיפות השיער ושמפו לצמיחה מחדש, באריזה לנשים.',
      ar: 'علاج الكثافة وشامبو إعادة النمو، بعبوة للنساء.',
      ru: 'Уход за плотностью волос и шампунь для восстановления роста, в женской упаковке.',
      fr: 'Le soin Densité et le shampooing repousse, en emballage femme.',
      es: 'El tratamiento de densidad y el champú de recrecimiento, en envase para mujer.',
    }),
    // Sum of components: density-15 (53) + regrowth-shampoo (40) = 93.
    // ~10% off to match heyhair.co's bundle-discount pattern (2026-09-08).
    price: 84,
    compareAtPrice: 93,
  },
];

export function findBundle(id: string): ShopBundle | undefined {
  return SHOP_BUNDLES.find((b) => b.id === id);
}
