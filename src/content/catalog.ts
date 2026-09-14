import { PRODUCTS, getProduct as lookupProduct, type Product } from './products';
import { L6, type LocalizedText } from './localized';

/**
 * À-la-carte catalogue — the "refills & add-ons" surface (`/bag`). Derived from
 * the six launch SKUs in `products.ts` so there is one product source of truth.
 * `price` mirrors each SKU's real, client-supplied price; `null` only for a
 * SKU that hasn't been priced yet, and renders as [PENDING].
 */
export type CatalogProduct = {
  sku: string;
  name: string;
  subtitle: LocalizedText;
  concern: Product['concern'];
  requiresMedicalReview: boolean;
  price: number | null;
};

export type CatalogCategory = {
  id: string;
  title: LocalizedText;
  items: CatalogProduct[];
};

const toCatalog = (p: Product): CatalogProduct => ({
  sku: p.slug,
  name: p.name,
  subtitle: p.subtitle,
  concern: p.concern,
  requiresMedicalReview: p.requiresMedicalReview,
  price: p.price,
});

export const CATALOG_ITEMS: CatalogProduct[] = PRODUCTS.map(toCatalog);

export const CATALOG: CatalogCategory[] = [
  {
    id: 'density',
    title: L6({ en: 'Density', he: 'Density', ar: 'الكثافة', ru: 'Плотность', fr: 'Densité', es: 'Densidad' }),
    items: PRODUCTS.filter((p) => p.slug.startsWith('density-')).map(toCatalog),
  },
  {
    id: 'gray',
    title: L6({ en: 'Gray', he: 'Gray', ar: 'الشعر الرمادي', ru: 'Седина', fr: 'Cheveux gris', es: 'Canas' }),
    items: PRODUCTS.filter((p) => p.concern === 'gray' || p.concern === 'gray-support').map(toCatalog),
  },
  {
    id: 'support',
    title: L6({
      en: 'Scalp care',
      he: 'טיפוח קרקפת',
      ar: 'العناية بفروة الرأس',
      ru: 'Уход за кожей головы',
      fr: 'Soin du cuir chevelu',
      es: 'Cuidado del cuero cabelludo',
    }),
    items: PRODUCTS.filter((p) => p.concern === 'thinning-support').map(toCatalog),
  },
];

export function findProduct(sku: string): CatalogProduct | undefined {
  const p = lookupProduct(sku);
  return p ? toCatalog(p) : undefined;
}
