import { describe, it, expect } from 'vitest';
import { en } from './messages/en';
import { he } from './messages/he';
import { fr } from './messages/fr';
import { ru } from './messages/ru';
import { ar } from './messages/ar';
import { es } from './messages/es';
import { LOCALES, SHIPPED_LOCALES, RTL_LOCALES } from './locales';

describe('shipped dictionaries (en, he)', () => {
  it('en and he have identical key sets', () => {
    expect(Object.keys(he).sort()).toEqual(Object.keys(en).sort());
  });

  it('no value is an empty string', () => {
    for (const [k, v] of Object.entries(en)) expect(v, `en.${k}`).not.toBe('');
    for (const [k, v] of Object.entries(he)) expect(v, `he.${k}`).not.toBe('');
  });
});

describe('scaffold dictionaries (fr, ru, ar, es)', () => {
  const scaffolds = { fr, ru, ar, es };
  const enKeys = new Set(Object.keys(en));

  it.each(Object.entries(scaffolds))('%s contains no key that is absent from en', (name, dict) => {
    const stray = Object.keys(dict).filter((k) => !enKeys.has(k));
    expect(stray, `${name} stray keys`).toEqual([]);
  });

  it.each(Object.entries(scaffolds))('%s has no empty string values', (name, dict) => {
    for (const [k, v] of Object.entries(dict)) expect(v, `${name}.${k}`).not.toBe('');
  });
});

describe('locale registry', () => {
  it('marks en + he as shipped and the rest as scaffolds', () => {
    expect(SHIPPED_LOCALES.sort()).toEqual(['en', 'he']);
  });

  it('treats he and ar as RTL', () => {
    expect(RTL_LOCALES.sort()).toEqual(['ar', 'he']);
  });

  it('gives every locale a BCP-47 tag for Intl formatting', () => {
    for (const meta of Object.values(LOCALES)) expect(meta.bcp47).toBeTruthy();
  });
});
