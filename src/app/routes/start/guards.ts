import type { SessionState } from '@/store/sessionStore';

export const START_STEPS = ['account', 'plan', 'checkout', 'success'] as const;
export type StartStep = (typeof START_STEPS)[number];

export function redirectForStartStep(step: StartStep, s: SessionState, authEmail: string | null): string | null {
  switch (step) {
    case 'account':
      return authEmail ? '/start/plan' : null;
    case 'plan':
      return authEmail ? null : '/start';
    case 'checkout':
      if (!authEmail) return '/start';
      return s.draftDurationDays ? null : '/start/plan';
    case 'success':
      if (!authEmail) return '/start';
      return s.program ? null : '/start';
    default:
      return null;
  }
}
