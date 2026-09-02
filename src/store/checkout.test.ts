import { describe, it, expect, beforeEach } from 'vitest';
import { submitPayment, type Order } from './checkout';

const order: Order = {
  reportId: 'rep-1',
  durationDays: 180,
  contact: { name: 'Jane Doe', email: 'jane@example.com', phone: '0500000000', country: 'IL', city: 'Tel Aviv', postal: '1234567' },
  card: { last4: '4242', expiry: '12/29' },
};

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
