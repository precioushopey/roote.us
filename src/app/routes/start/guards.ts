import type { SessionState } from '@/store/sessionStore';

export const START_STEPS = ['account', 'plan', 'checkout', 'success'] as const;
export type StartStep = (typeof START_STEPS)[number];

export function redirectForStartStep(step: StartStep, s: SessionState, authEmail: string | null): string | null {
  switch (step) {
    case 'account':
      return authEmail ? '/program/plan' : null;
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
