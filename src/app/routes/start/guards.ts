import type { SessionState } from '@/store/sessionStore';

export const START_STEPS = ['account', 'plan', 'checkout', 'success'] as const;
export type StartStep = (typeof START_STEPS)[number];

export function redirectForStartStep(step: StartStep, s: SessionState, authEmail: string | null): string | null {
  switch (step) {
    case 'account':
      if (!authEmail) return null;
      // Duration is usually already chosen on the report page (2026-09-22)
      // — skip the redundant Plan comparison grid and go straight to
      // Checkout. Plan itself stays fully reachable via its own "Change"
      // link on the checkout page (see CheckoutStep.tsx) — this only
      // changes where signing up sends you automatically.
      return s.draftDurationDays ? '/program/checkout' : '/program/plan';
    case 'plan':
      if (!authEmail) return '/program';
      if (s.program) return '/program/success';
      return null;
    case 'checkout':
      if (!authEmail) return '/program';
      if (s.program) return '/program/success';
      return s.draftDurationDays ? null : '/program/plan';
    case 'success':
      if (!authEmail) return '/program';
      return s.program ? null : '/program';
    default:
      return null;
  }
}
