import { describe, it, expect } from 'vitest';
import { en } from './messages/en';
import { he } from './messages/he';

describe('i18n dictionaries', () => {
  it('en and he have identical key sets', () => {
    const enKeys = Object.keys(en).sort();
    const heKeys = Object.keys(he).sort();
    expect(heKeys).toEqual(enKeys);
  });

  it('no value is an empty string', () => {
    for (const [k, v] of Object.entries(en)) expect(v, `en.${k}`).not.toBe('');
    for (const [k, v] of Object.entries(he)) expect(v, `he.${k}`).not.toBe('');
  });
});
