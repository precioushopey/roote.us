import type { Answers, Gender, HairAnalysis, HairGoal } from './types';
import { deriveAnalysis } from './deriveAnalysis';
import { isHairhealthConfigured, requestHairhealthAnalysis } from './hairhealthAdapter';

export type AnalyzeHairInput = {
  gender: Gender;
  hairGoal: HairGoal;
  answers: Answers;
  photos?: { angleKey: string; blob: Blob }[];
};

export type AnalyzeHairResult = {
  analysis: HairAnalysis;
  /** Which engine produced the result — `local` is the questionnaire-only fallback. */
  source: 'hairhealth' | 'local';
};

/**
 * Single entry point for hair analysis. Uses hairhealth.ai when it is configured
 * and photos are available; otherwise (and on any remote failure) falls back to
 * the deterministic local model built from the questionnaire.
 */
export async function analyzeHair(input: AnalyzeHairInput): Promise<AnalyzeHairResult> {
  const local = () => deriveAnalysis({ gender: input.gender, hairGoal: input.hairGoal, answers: input.answers });

  if (isHairhealthConfigured() && input.photos && input.photos.length > 0) {
    try {
      const analysis = await requestHairhealthAnalysis({
        gender: input.gender,
        hairGoal: input.hairGoal,
        answers: input.answers,
        photos: input.photos,
      });
      return { analysis, source: 'hairhealth' };
    } catch (err) {
      console.warn('[roote] hairhealth.ai analysis failed; using local model', err);
    }
  }

  return { analysis: local(), source: 'local' };
}
