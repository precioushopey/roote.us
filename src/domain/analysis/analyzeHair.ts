import type { Answers, Gender, HairAnalysis, HairGoal } from './types';
import { deriveAnalysis } from './deriveAnalysis';
import { isRemoteAnalysisConfigured, requestRemoteAnalysis } from './remoteAnalysisAdapter';

export type AnalyzeHairInput = {
  gender: Gender;
  hairGoal: HairGoal;
  answers: Answers;
  photos?: { angleKey: string; blob: Blob }[];
};

export type AnalyzeHairResult = {
  analysis: HairAnalysis;
  /** Which engine produced the result — `local` is the questionnaire-only fallback. */
  source: 'remote' | 'local';
};

/**
 * Single entry point for hair analysis. Uses the remote CV provider when one is configured
 * and photos are available; otherwise (and on any remote failure) falls back to the
 * deterministic local model built from the questionnaire. No CV vendor is under contract
 * today — see src/domain/analysis/remoteAnalysisAdapter.ts.
 */
export async function analyzeHair(input: AnalyzeHairInput): Promise<AnalyzeHairResult> {
  const local = () => deriveAnalysis({ gender: input.gender, hairGoal: input.hairGoal, answers: input.answers });

  if (isRemoteAnalysisConfigured() && input.photos && input.photos.length > 0) {
    try {
      const analysis = await requestRemoteAnalysis({
        gender: input.gender,
        hairGoal: input.hairGoal,
        answers: input.answers,
        photos: input.photos,
      });
      return { analysis, source: 'remote' };
    } catch (err) {
      console.warn('[roote] remote analysis provider failed; using local model', err);
    }
  }

  return { analysis: local(), source: 'local' };
}
