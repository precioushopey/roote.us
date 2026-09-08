import type { Answers, Gender, HairAnalysis, HairGoal } from './types';
import { analyzeHair } from './analyzeHair';

/**
 * The seam a real computer-vision service implements (brief §12 step 5).
 * Everything above this line is deterministic and offline; a provider takes the
 * guided photos + questionnaire and returns a `HairAnalysis`.
 *
 *   interface HairAnalysisProvider { analyze(input): Promise<HairAnalysisResult> }
 *
 * PO decision #23 (2026-09-04) named HairHealth.ai HairScan as the presumed target
 * for this seam. Corrected 2026-09-08: HairHealth.ai's actual, confirmed integration
 * with ROOTÉ is an unrelated Landbot lead-gen widget that writes straight to ROOTÉ's
 * HubSpot (see docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md)
 * — it offers no synchronous photo-analysis API back to ROOTÉ. The vendor for *this*
 * seam is genuinely undecided. Until one is under contract: mock in dev, qualitative
 * production bands only, never a fabricated number. Design the consumer for
 * HairScan-level fields (hair type, density estimate, thickness, loss stage, volume,
 * overall score, image-quality confidence) since that remains a plausible shape for
 * whichever vendor is eventually contracted. Do NOT surface trichoscope-grade
 * *ScalpScan* metrics (FU per cm², single/double/triple hair counts) from ordinary
 * selfies unless a future vendor contract confirms its API returns them.
 *
 * Swap `setAnalysisProvider` when the real adapter is wired.
 */
export type HairAnalysisImage = { angleKey: string; blob: Blob };

export type HairAnalysisRequest = {
  gender: Gender;
  hairGoal: HairGoal;
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
 * uses the deterministic questionnaire model (and the env-gated remote CV-provider
 * adapter if one happens to be configured).
 */
export const mockHairAnalysisProvider: HairAnalysisProvider = {
  name: 'mock',
  async analyze({ gender, hairGoal, answers, images }) {
    const { analysis, source } = await analyzeHair({ gender, hairGoal, answers, photos: images });
    return {
      analysis,
      source: source === 'remote' ? 'provider' : 'mock',
      isMock: source !== 'remote',
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
