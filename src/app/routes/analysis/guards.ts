import type { SessionState } from '@/store/sessionStore';
import { PATHS } from '@/app/paths';

export const ANALYSIS_STEPS = [
  'intro',
  'gender',
  'goal',
  'photos',
  'scanning',
  'questions',
  'results',
] as const;
export type AnalysisStep = (typeof ANALYSIS_STEPS)[number];

/** Which steps show on the progress rail (intro doesn't). */
export const RAIL_STEPS: AnalysisStep[] = ['gender', 'goal', 'photos', 'scanning', 'questions', 'results'];

const BACK_STEP: Partial<Record<AnalysisStep, AnalysisStep | 'intro'>> = {
  gender: 'intro',
  goal: 'gender',
  photos: 'goal',
  questions: 'photos',
};

/**
 * Back target for a step, or null when the step has no sensible Back
 * (scanning is transient/non-interactive; results→questions would just
 * bounce forward again once analysis is computed — see redirectForAnalysisStep).
 */
export function backPathForAnalysisStep(step: AnalysisStep): string | null {
  const target = BACK_STEP[step];
  if (!target) return null;
  return target === 'intro' ? PATHS.analysis : PATHS.analysisStep(target);
}

export function redirectForAnalysisStep(step: AnalysisStep, s: SessionState): string | null {
  const { gender, hairGoal, photos } = s.diagnosis;
  const hasResult = s.analysis !== null || s.grayProfile !== null;

  switch (step) {
    case 'intro':
    case 'gender':
      return null;
    case 'goal':
      return gender ? null : PATHS.analysisStep('gender');
    case 'photos':
      if (!gender) return PATHS.analysisStep('gender');
      return hairGoal ? null : PATHS.analysisStep('goal');
    case 'scanning':
    case 'questions':
      if (!gender) return PATHS.analysisStep('gender');
      if (!hairGoal) return PATHS.analysisStep('goal');
      // PO #25 (2026-09-04): all four views are required to run the full analysis.
      // A draft may hold fewer, but it cannot advance past the photo step.
      return photos.length >= 4 ? null : PATHS.analysisStep('photos');
    case 'results':
      return hasResult ? null : PATHS.analysisStep('scanning');
    default:
      return null;
  }
}
