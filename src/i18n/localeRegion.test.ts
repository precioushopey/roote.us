import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseLocaleRegion, isValidLocaleRegion, formatLocaleRegion, resolveLocaleRedirect, readStoredRegion, writeStoredRegion, PREFERRED_REGION_KEY } from './localeRegion';

describe('parseLocaleRegion', () => {
  it('parses a valid shipped locale + known country', () => {
    expect(parseLocaleRegion('en-us')).toEqual({ locale: 'en', country: 'US' });
    expect(parseLocaleRegion('he-il')).toEqual({ locale: 'he', country: 'IL' });
  });

  it('accepts any enabled-locale + known-country combination, not just curated defaults', () => {
    expect(parseLocaleRegion('en-il')).toEqual({ locale: 'en', country: 'IL' });
  });

  it('rejects a locale outside ENABLED_LOCALES (ar is shipped:false today)', () => {
    expect(parseLocaleRegion('ar-ae')).toBeNull();
  });

  it('rejects an unknown country', () => {
    expect(parseLocaleRegion('en-zz')).toBeNull();
  });

  it('rejects a segment with the wrong shape', () => {
    expect(parseLocaleRegion('en')).toBeNull();
    expect(parseLocaleRegion('products')).toBeNull();
    expect(parseLocaleRegion('en-us-extra')).toBeNull();
  });
});

describe('isValidLocaleRegion', () => {
  it('mirrors parseLocaleRegion as a boolean', () => {
    expect(isValidLocaleRegion('en-us')).toBe(true);
    expect(isValidLocaleRegion('products')).toBe(false);
  });
});

describe('formatLocaleRegion', () => {
  it('lowercases the country', () => {
    expect(formatLocaleRegion('en', 'US')).toBe('en-us');
  });
});

describe('resolveLocaleRedirect', () => {
  it('returns null when the path already has a valid locale-region prefix', () => {
    expect(resolveLocaleRedirect('/en-us/products', null, 'en-US')).toBeNull();
  });

  it('redirects a bare root to the stored preference when one exists', () => {
    expect(resolveLocaleRedirect('/', 'en-us', 'he')).toBe('/en-us');
  });

  it('redirects a bare root using Accept-Language when no preference is stored', () => {
    expect(resolveLocaleRedirect('/', null, 'he-IL,he;q=0.9')).toBe('/he-il');
  });

  it('falls back to he-il when Accept-Language matches no enabled locale', () => {
    expect(resolveLocaleRedirect('/', null, 'ja-JP,ja;q=0.9')).toBe('/he-il');
  });

  it('prepends the resolved region onto a deeper bare path without altering it', () => {
    expect(resolveLocaleRedirect('/products/density-6', null, 'en-US')).toBe('/en-us/products/density-6');
  });

  it('folds a legacy prefix redirect into the same hop', () => {
    expect(resolveLocaleRedirect('/diagnosis/gender', null, 'en-US')).toBe('/en-us/analysis/gender');
  });

  it('ignores a stored preference that is no longer valid', () => {
    expect(resolveLocaleRedirect('/', 'xx-yy', 'en-US')).toBe('/en-us');
  });
});

describe('readStoredRegion / writeStoredRegion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a region through localStorage', () => {
    writeStoredRegion('en-us');
    expect(readStoredRegion()).toBe('en-us');
  });

  it('returns null when nothing has been stored yet', () => {
    expect(readStoredRegion()).toBeNull();
  });

  it('handles localStorage access errors gracefully on read', () => {
    writeStoredRegion('en-us');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStoredRegion()).toBeNull();
    getItemSpy.mockRestore();
  });

  it('handles localStorage access errors gracefully on write', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => writeStoredRegion('en-us')).not.toThrow();
    setItemSpy.mockRestore();
  });
});
