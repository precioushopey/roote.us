import { describe, it, expect, beforeEach } from 'vitest';
import { submitPayment, type Order } from './checkout';

const contact = { name: 'Jane Doe', email: 'jane@example.com', phone: '0500000000', country: 'IL', city: 'Tel Aviv', postal: '1234567' };
const card = { last4: '4242', expiry: '12/29' };

const order: Order = { kind: 'program', reportId: 'rep-1', durationDays: 180, contact, card };
const bagOrder: Order = { kind: 'bag', lines: [{ sku: 'growth-capsules', qty: 2 }], contact, card };

beforeEach(() => localStorage.removeItem('roote.debug.forceCheckoutFailure'));

describe('checkout stub', () => {
  it('resolves success with a fresh orderId, and stores no card data', async () => {
    const result = await submitPayment(order);
    expect(result.status).toBe('success');
    expect(result.orderId).toMatch(/^ord-/);
    // No key anywhere under localStorage should contain a full card number or CVC.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      expect(localStorage.getItem(key)).not.toMatch(/\d{13,19}/);
    }
  });

  it('prefixes the orderId by kind (ord- for program, bag- for bag)', async () => {
    expect((await submitPayment(order)).orderId).toMatch(/^ord-/);
    expect((await submitPayment(bagOrder)).orderId).toMatch(/^bag-/);
  });

  it('produces a different orderId on each call', async () => {
    const a = await submitPayment(order);
    const b = await submitPayment(order);
    expect(a.orderId).not.toBe(b.orderId);
  });

  it('rejects when the dev-only forced-failure flag is set', async () => {
    localStorage.setItem('roote.debug.forceCheckoutFailure', '1');
    await expect(submitPayment(order)).rejects.toThrow();
  });
});
