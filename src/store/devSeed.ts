import { deriveAnalysis } from '@/domain/analysis/deriveAnalysis';
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
  const diagnosis: SessionState['diagnosis'] = { gender: 'male', photos: [], answers };
  const analysis = deriveAnalysis({ gender: 'male', answers });
  return { diagnosis, analysis, reportId: `rep-dev-${Date.now()}` };
}
