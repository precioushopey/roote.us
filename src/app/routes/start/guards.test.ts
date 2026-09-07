import { describe, it, expect } from 'vitest';
import { redirectForStartStep } from './guards';
import type { SessionState } from '@/store/sessionStore';

const base: SessionState = {
  diagnosis: { gender: null, hairGoal: null, photos: [], answers: {}, grayAnswers: {}, healthHistory: [], photoConsent: false },
  analysis: null,
  reportId: 'rep-1',
  account: { email: null, marketingConsent: false },
  draftDurationDays: null,
  grayProfile: null,
  program: null,
};

describe('redirectForStartStep', () => {
  it('account: no redirect needed on its own step', () => {
    expect(redirectForStartStep('account', base, null)).toBeNull();
  });
  it('account: redirects to plan when already authenticated', () => {
    expect(redirectForStartStep('account', base, 'a@b.com')).toBe('/program/plan');
  });
  it('plan: redirects back to account when not authenticated', () => {
    expect(redirectForStartStep('plan', base, null)).toBe('/program');
  });
  it('checkout: redirects to plan when no duration is selected', () => {
    expect(redirectForStartStep('checkout', base, 'a@b.com')).toBe('/program/plan');
  });
  it('checkout: no redirect once a duration is selected', () => {
    expect(redirectForStartStep('checkout', { ...base, draftDurationDays: 180 }, 'a@b.com')).toBeNull();
  });
  it('checkout: redirects to success once a program has been created', () => {
    expect(
      redirectForStartStep('checkout', { ...base, draftDurationDays: 180, program: { orderId: 'ord-1' } as SessionState['program'] }, 'a@b.com'),
    ).toBe('/program/success');
  });
  it('plan: redirects to success once a program has been created', () => {
    expect(
      redirectForStartStep('plan', { ...base, program: { orderId: 'ord-1' } as SessionState['program'] }, 'a@b.com'),
    ).toBe('/program/success');
  });
  it('success: redirects to start when there is no program', () => {
    expect(redirectForStartStep('success', base, 'a@b.com')).toBe('/program');
  });
});
