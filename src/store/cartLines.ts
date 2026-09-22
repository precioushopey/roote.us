import { lineId, type CartLine } from './cart';
import { findProduct } from '@/content/catalog';
import { findBundle } from '@/content/bundles';
import { pickLocalized } from '@/content/localized';
import type { LocaleCode } from '@/i18n/locales';

/** A cart line resolved against the product/bundle catalogues, for display.
 *  `price` is per unit — a bundle's own discounted price, never the sum of
 *  its component SKUs (see content/bundles.ts). `sku` is only set for a
 *  `kind: 'sku'` line — lets a caller look up the full `Product` record
 *  later (e.g. to show its photo/badges in order history), without this
 *  type itself carrying that much detail. */
export type ResolvedCartLine = {
  id: string;
  qty: number;
  name: string;
  subtitle: string;
  price: number | null;
  sku?: string;
};

export function resolveCartLines(lines: CartLine[], locale: LocaleCode): ResolvedCartLine[] {
  const resolved: ResolvedCartLine[] = [];
  for (const line of lines) {
    if (line.kind === 'sku') {
      const product = findProduct(line.sku);
      if (!product) continue;
      resolved.push({
        id: lineId(line),
        qty: line.qty,
        name: product.name,
        subtitle: pickLocalized(product.subtitle, locale),
        price: product.price,
        sku: line.sku,
      });
    } else {
      const bundle = findBundle(line.bundleId);
      if (!bundle) continue;
      resolved.push({
        id: lineId(line),
        qty: line.qty,
        name: pickLocalized(bundle.name, locale),
        subtitle: pickLocalized(bundle.summary, locale),
        price: bundle.price,
      });
    }
  }
  return resolved;
}
