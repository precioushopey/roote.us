import type { SessionState } from '@/store/sessionStore';
import { PATHS } from '@/app/paths';

export const ANALYSIS_STEPS = [
  'intro',
  'gender',
  'age',
  'previous-products',
  'satisfaction',
  'goal',
  'pattern',
  'photos',
  'scanning',
  'questions',
  'results',
] as const;
export type AnalysisStep = (typeof ANALYSIS_STEPS)[number];

/** Which steps show on the progress rail (intro, satisfaction, pattern don't). */
export const RAIL_STEPS: AnalysisStep[] = [
  'gender', 'age', 'previous-products', 'goal', 'photos', 'scanning', 'questions', 'results',
];

const BACK_STEP: Partial<Record<AnalysisStep, AnalysisStep | 'intro'>> = {
  gender: 'intro',
  age: 'gender',
  'previous-products': 'age',
  satisfaction: 'previous-products',
  goal: 'previous-products',
  pattern: 'goal',
  questions: 'photos',
};

/**
 * Back target for a step, or null when the step has no sensible Back
 * (scanning is transient/non-interactive; results→questions would just
 * bounce forward again once analysis is computed — see redirectForAnalysisStep).
 *
 * `goal`'s back target is `previous-products`, not `satisfaction` — Back
 * from `goal` should return to the last step every visitor actually saw,
 * and `satisfaction` is skipped for anyone who answered "No" to
 * `previous-products`, so it can't be a universal back target for `goal`.
 *
 * `photos` is handled specially, not via the static `BACK_STEP` map: a
 * Hair-Growth visitor with a known gender came from `pattern`, everyone
 * else came from `goal` — the correct target depends on session state, not
 * just the step name (2026-09-22 final review, minor M1).
 */
export function backPathForAnalysisStep(step: AnalysisStep, s: SessionState): string | null {
  if (step === 'photos') {
    const { gender, hairGoal } = s.diagnosis;
    const cameViaPattern = hairGoal === 'hair-growth' && (gender === 'male' || gender === 'female');
    return PATHS.analysisStep(cameViaPattern ? 'pattern' : 'goal');
  }
  const target = BACK_STEP[step];
  if (!target) return null;
  return target === 'intro' ? PATHS.analysis : PATHS.analysisStep(target);
}

export function redirectForAnalysisStep(step: AnalysisStep, s: SessionState): string | null {
  const { gender, hairGoal, photos, answers } = s.diagnosis;
  const hasResult = s.analysis !== null || s.grayProfile !== null;

  switch (step) {
    case 'intro':
    case 'gender':
      return null;
    case 'age':
      return gender ? null : PATHS.analysisStep('gender');
    case 'previous-products':
      if (!gender) return PATHS.analysisStep('gender');
      return answers.age_range !== undefined ? null : PATHS.analysisStep('age');
    case 'satisfaction':
      if (!gender) return PATHS.analysisStep('gender');
      if (answers.age_range === undefined) return PATHS.analysisStep('age');
      if (answers.previous_hair_products === undefined) return PATHS.analysisStep('previous-products');
      // Only reachable at all when the answer was "yes" — see PreviousProductsScreen.
      return answers.previous_hair_products ? null : PATHS.analysisStep('goal');
    case 'goal':
      if (!gender) return PATHS.analysisStep('gender');
      if (answers.age_range === undefined) return PATHS.analysisStep('age');
      return answers.previous_hair_products !== undefined ? null : PATHS.analysisStep('previous-products');
    case 'pattern': {
      if (!gender) return PATHS.analysisStep('gender');
      if (!hairGoal) return PATHS.analysisStep('goal');
      // Gender must be known (male/female) for a pattern set to exist at all
      // (client rule 4 — see `domain/recommendation/rules.ts`). An
      // 'unspecified'-gender Hair Growth visitor skips straight to `photos`;
      // without this check they'd bounce here from `photos` and right back
      // to `photos` from here — an infinite redirect loop.
      const hasPatternSet = gender === 'male' || gender === 'female';
      return hairGoal === 'hair-growth' && hasPatternSet ? null : PATHS.analysisStep('photos');
    }
    case 'photos': {
      if (!gender) return PATHS.analysisStep('gender');
      if (!hairGoal) return PATHS.analysisStep('goal');
      const needsPattern =
        hairGoal === 'hair-growth' && (gender === 'male' || gender === 'female') && answers.hair_pattern_id === undefined;
      return needsPattern ? PATHS.analysisStep('pattern') : null;
    }
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
