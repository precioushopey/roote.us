import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '@/content/products';
import { metaForPath, fullTitle, ROUTE_META } from './meta';

describe('metaForPath', () => {
  it('gives every product SKU its own title and description (SEO-AUDIT.md H4)', () => {
    for (const product of PRODUCTS) {
      const meta = metaForPath(`/products/${product.slug}`);
      expect(meta).not.toBe(ROUTE_META['/products']);
      expect(meta.title.en).toContain(product.subtitle.en);
      expect(meta.description).toBe(product.shortDescription);
    }
  });

  it('never exposes a formula/ingredient percentage in product meta', () => {
    for (const product of PRODUCTS) {
      const meta = metaForPath(`/products/${product.slug}`);
      expect(meta.title.en).not.toMatch(/\d+%/);
      expect(meta.description.en).not.toMatch(/\d+%/);
    }
  });

  it('falls back to the nearest listed prefix for an unlisted sub-path', () => {
    expect(metaForPath('/solutions/thinning/extra')).toBe(ROUTE_META['/solutions/thinning']);
  });

  it('falls back to the homepage entry for a completely unknown path', () => {
    expect(metaForPath('/no-such-route')).toBe(ROUTE_META['/']);
  });
});

describe('fullTitle', () => {
  it('prefixes the brand once, without duplicating it for product titles', () => {
    const product = PRODUCTS[0];
    const meta = metaForPath(`/products/${product.slug}`);
    const title = fullTitle(meta.title.en);
    expect(title.match(/ROOTÉ/g)).toHaveLength(1);
  });
});
