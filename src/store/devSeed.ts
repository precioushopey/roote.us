import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
import { buildReport } from '@/domain/report/buildReport';
import { buildProgram } from '@/store/program';
import { rooteContent } from '@/content/roote.config';
import type { HairAnalysis } from '@/domain/analysis/types';
import type { Program } from '@/domain/program/types';
import { type LocaleCode, contentLocaleOf } from '@/i18n/locales';
import type { SessionState } from '@/store/sessionStore';

/** Dev-only: a fixed, coherent persona so /start (and later /app) are reachable without walking
 *  the whole diagnosis flow by hand. Never imported outside import.meta.env.DEV call sites. */
export function seedDiagnosisAndReport(): {
  diagnosis: SessionState['diagnosis'];
  analysis: ReturnType<typeof deriveAnalysis>;
  reportId: string;
} {
  const answers = {
    q1_area: 'crown',
    q2_onset: '1-5y',
    q3_prior: 'no-success',
    q4_family: 'yes',
    q5_goal: 'both',
  } as const;
  const diagnosis: SessionState['diagnosis'] = {
    gender: 'male',
    concern: 'thinning',
    photos: [],
    answers,
    grayAnswers: {},
    photoConsent: true,
  };
  const analysis = deriveAnalysis({ gender: 'male', answers });
  return { diagnosis, analysis, reportId: `rep-dev-${Date.now()}` };
}

const DAY_MS = 86_400_000;

/** Dev-only: the persona above, plus a mid-program `Program` (~day 12) so the `/app` screens
 *  are reviewable without a real checkout. `locale` only affects the frozen plan's copy. */
export function seedProgram(locale: LocaleCode): {
  analysis: HairAnalysis;
  reportId: string;
  program: Program;
} {
  const { diagnosis, analysis, reportId } = seedDiagnosisAndReport();
  const model = buildReport({ diagnosis, analysis, content: rooteContent, locale: contentLocaleOf(locale), reportId });
  const program = buildProgram({
    orderId: `ord-dev-${Date.now()}`,
    reportId,
    analysis,
    durationDays: analysis.recommendedDurationDays,
    plan: model.plan,
    today: new Date(Date.now() - 11 * DAY_MS), // start ~11 days ago -> "Day 12"
  });
  return { analysis, reportId, program };
}
