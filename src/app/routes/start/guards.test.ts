import { describe, it, expect } from 'vitest';
import { redirectForStartStep } from './guards';
import type { SessionState } from '@/store/sessionStore';

const base: SessionState = {
  diagnosis: { gender: null, photos: [], answers: {} },
  analysis: null,
  reportId: 'rep-1',
  account: { email: null },
  draftDurationDays: null,
  program: null,
};

describe('redirectForStartStep', () => {
  it('account: no redirect needed on its own step', () => {
    expect(redirectForStartStep('account', base, null)).toBeNull();
  });
  it('account: redirects to plan when already authenticated', () => {
    expect(redirectForStartStep('account', base, 'a@b.com')).toBe('/start/plan');
  });
  it('plan: redirects back to account when not authenticated', () => {
    expect(redirectForStartStep('plan', base, null)).toBe('/start');
  });
  it('checkout: redirects to plan when no duration is selected', () => {
    expect(redirectForStartStep('checkout', base, 'a@b.com')).toBe('/start/plan');
  });
  it('checkout: no redirect once a duration is selected', () => {
    expect(redirectForStartStep('checkout', { ...base, draftDurationDays: 180 }, 'a@b.com')).toBeNull();
  });
  it('success: redirects to start when there is no program', () => {
    expect(redirectForStartStep('success', base, 'a@b.com')).toBe('/start');
  });
});
