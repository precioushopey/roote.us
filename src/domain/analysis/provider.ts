import type { Answers, Gender, HairAnalysis } from './types';
import { analyzeHair } from './analyzeHair';

/**
 * The seam a real computer-vision service implements (brief §12 step 5).
 * Everything above this line is deterministic and offline; a provider takes the
 * guided photos + questionnaire and returns a `HairAnalysis`.
 *
 *   interface HairAnalysisProvider { analyze(input): Promise<HairAnalysisResult> }
 *
 * PO decision #23 (2026-09-04): the target provider is **HairHealth.ai HairScan**
 * (the consumer, phone-selfie product). Its API contract is `[PENDING]` — do NOT
 * reverse-engineer or guess the request/response schema; wait for the signed
 * contract + docs + credentials. Until then: mock in dev, qualitative production
 * bands only, never a fabricated number. Design the consumer for HairScan-level
 * fields (hair type, density estimate, thickness, loss stage, volume, overall
 * score, image-quality confidence). Do NOT surface trichoscope-grade *ScalpScan*
 * metrics (FU per cm², single/double/triple hair counts) from ordinary selfies
 * unless the vendor contract confirms HairScan returns them.
 *
 * Swap `setAnalysisProvider` when the real adapter is wired.
 */
export type HairAnalysisImage = { angleKey: string; blob: Blob };

export type HairAnalysisRequest = {
  gender: Gender;
  answers: Answers;
  images: HairAnalysisImage[];
};

export type HairAnalysisResult = {
  analysis: HairAnalysis;
  /** `mock` = deterministic local model; `provider` = a real CV service. */
  source: 'mock' | 'provider';
  /** True while no real service is connected — surfaced as a demo disclaimer. */
  isMock: boolean;
};

export interface HairAnalysisProvider {
  readonly name: string;
  analyze(request: HairAnalysisRequest): Promise<HairAnalysisResult>;
}

/**
 * Development / concept-build provider. Delegates to `analyzeHair`, which itself
 * uses the deterministic questionnaire model (and the env-gated hairhealth.ai
 * adapter if it happens to be configured).
 */
export const mockHairAnalysisProvider: HairAnalysisProvider = {
  name: 'mock',
  async analyze({ gender, answers, images }) {
    const { analysis, source } = await analyzeHair({ gender, answers, photos: images });
    return {
      analysis,
      source: source === 'hairhealth' ? 'provider' : 'mock',
      isMock: source !== 'hairhealth',
    };
  },
};

let provider: HairAnalysisProvider = mockHairAnalysisProvider;

export function setAnalysisProvider(next: HairAnalysisProvider): void {
  provider = next;
}

export function getAnalysisProvider(): HairAnalysisProvider {
  return provider;
}
