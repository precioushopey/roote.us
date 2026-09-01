import { describe, it, expect } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats ILS for the he locale', () => {
    const m = formatMoney(1200, 'ILS', 'he');
    expect(m.amount).toBe(1200);
    expect(m.currency).toBe('ILS');
    expect(m.formatted).toContain('1,200');
  });

  it('formats USD for the en locale', () => {
    const m = formatMoney(99.5, 'USD', 'en');
    expect(m.amount).toBe(99.5);
    expect(m.formatted).toMatch(/\$99\.50/);
  });
});
