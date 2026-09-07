/**
 * Gray-hair branch model (brief §19). Pure and deterministic — mirrors the
 * questionnaire-only approach of `deriveAnalysis`, but for the pigmentation
 * concern. Returns i18n keys, never display strings, and makes no claim about
 * reversing or slowing graying.
 */

export type GrayAnswers = {
  g1_onset: 'lt-1y' | '1-5y' | 'gt-5y';
  g2_area: 'temples' | 'crown' | 'throughout';
  g3_pace: 'slow' | 'steady' | 'fast';
  g4_color: 'no' | 'sometimes' | 'regularly';
};

export type GrayStage = 'early' | 'moderate' | 'advanced';

export type GrayProfile = {
  stage: GrayStage;
  /** i18n keys */
  visibleAreaKey: string;
  paceKey: string;
  summaryKey: string;
  /** product slugs — the coordinated inside + topical routine */
  routine: string[];
};

const STAGE_BY_AREA: Record<GrayAnswers['g2_area'], GrayStage> = {
  temples: 'early',
  crown: 'moderate',
  throughout: 'advanced',
};

export function deriveGrayProfile(input: { answers: GrayAnswers }): GrayProfile {
  const { answers } = input;

  let stage = STAGE_BY_AREA[answers.g2_area];
  // A fast pace + long onset nudges the picture on one step (clamped).
  if (answers.g3_pace === 'fast' && answers.g1_onset === 'gt-5y' && stage === 'early') stage = 'moderate';
  if (answers.g3_pace === 'fast' && answers.g1_onset === 'gt-5y' && stage === 'moderate') stage = 'advanced';

  return {
    stage,
    visibleAreaKey: `gray.area.${answers.g2_area}`,
    paceKey: `gray.pace.${answers.g3_pace}`,
    summaryKey: `gray.summary.${stage}`,
    routine: ['gray-support', 'gray-serum'],
  };
}
