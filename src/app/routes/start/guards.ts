import type { SessionState } from '@/store/sessionStore';

/** `entry` is bare `/program` — it has no screen of its own, it only forwards. */
export const START_STEPS = ['entry', 'plan', 'checkout', 'success'] as const;
export type StartStep = (typeof START_STEPS)[number];

/**
 * No account is required anywhere in the purchase funnel (Mischa review,
 * 2026-09-23 — "don't force signup before checkout"): checkout collects the
 * email, and a successful payment signs the buyer in (see `auth.signInAfterPurchase`),
 * after which the order number + email is how they get back in.
 */
export function redirectForStartStep(step: StartStep, s: SessionState): string | null {
  switch (step) {
    case 'entry':
      if (s.program) return '/program/success';
      // Duration is usually already chosen on the report page (2026-09-22) —
      // skip the Plan comparison grid then; Plan stays reachable via the
      // "Change" link on the checkout page (see CheckoutStep.tsx).
      return s.draftDurationDays ? '/program/checkout' : '/program/plan';
    case 'plan':
      if (s.program) return '/program/success';
      return null;
    case 'checkout':
      if (s.program) return '/program/success';
      return s.draftDurationDays ? null : '/program/plan';
    case 'success':
      return s.program ? null : '/program';
    default:
      return null;
  }
}
