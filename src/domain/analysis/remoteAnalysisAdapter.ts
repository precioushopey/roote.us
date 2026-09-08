import type { Answers, Gender, HairAnalysis, HairGoal } from './types';
import { deriveAnalysis, RECOMMENDED_DURATION_TABLE } from './deriveAnalysis';

const API_URL = import.meta.env.VITE_CV_PROVIDER_API_URL as string | undefined;
const API_KEY = import.meta.env.VITE_CV_PROVIDER_API_KEY as string | undefined;

export type RemoteAnalysisInput = {
  gender: Gender;
  hairGoal: HairGoal;
  answers: Answers;
  photos: { angleKey: string; blob: Blob }[];
};

/** True only when a remote computer-vision analysis endpoint is configured via Vite env vars. */
export function isRemoteAnalysisConfigured(): boolean {
  return typeof API_URL === 'string' && API_URL.length > 0;
}

/**
 * PLACEHOLDER CONTRACT — no computer-vision vendor is under contract for this seam today.
 * HairHealth.ai was the presumed target (PO decision #23, 2026-09-04), but its actual,
 * confirmed integration with ROOTÉ (2026-09-08) is an unrelated Landbot lead-gen widget that
 * writes straight to ROOTÉ's HubSpot — see
 * docs/superpowers/specs/2026-09-08-hairhealth-landbot-integration-design.md. It offers no
 * synchronous photo-analysis API back to ROOTÉ. This file stays as an example shape for
 * whichever real CV vendor is contracted later; confirm every field name, the auth scheme,
 * and the scale/severity vocabulary against that vendor's real API docs before relying on it.
 * While `VITE_CV_PROVIDER_API_URL` is unset, `isRemoteAnalysisConfigured()` is false and
 * `analyzeHair` uses the local questionnaire model instead. Enabling this sends visitor photos
 * to a third party — the privacy policy's `marketing.legal.privacy.s2.body`/`s5.body` (EN+HE)
 * currently claim the in-app assessment never leaves the browser; that claim must be updated
 * before this is set in any deployed environment.
 */
type RemoteAnalysisResponse = {
  norwood_stage?: number;
  ludwig_stage?: number;
  severity?: string;
  affected_regions?: string[];
  density_by_region?: Record<string, 'low' | 'medium' | 'high'>;
};

export async function requestRemoteAnalysis(input: RemoteAnalysisInput): Promise<HairAnalysis> {
  if (!isRemoteAnalysisConfigured()) {
    throw new Error('remote analysis provider is not configured (set VITE_CV_PROVIDER_API_URL)');
  }

  const form = new FormData();
  form.append('gender', input.gender);
  form.append('questionnaire', JSON.stringify(input.answers));
  for (const p of input.photos) {
    form.append(`photo_${p.angleKey}`, p.blob, `${p.angleKey}.jpg`);
  }

  const res = await fetch(`${API_URL!.replace(/\/$/, '')}/v1/analyze`, {
    method: 'POST',
    headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
    body: form,
  });
  if (!res.ok) throw new Error(`remote analysis provider responded ${res.status}`);

  return mapResponse((await res.json()) as RemoteAnalysisResponse, input);
}

/**
 * Overlays whatever the remote provider returned onto the fully-populated local model,
 * so every downstream field stays defined. Expand this once a real vendor contract is firm.
 */
function mapResponse(raw: RemoteAnalysisResponse, input: RemoteAnalysisInput): HairAnalysis {
  const base = deriveAnalysis({ gender: input.gender, hairGoal: input.hairGoal, answers: input.answers });
  const remoteStage = input.gender === 'male' ? raw.norwood_stage : raw.ludwig_stage;
  const severityBand =
    raw.severity === 'mild' || raw.severity === 'moderate' || raw.severity === 'established'
      ? raw.severity
      : base.severityBand;

  return {
    ...base,
    stage: typeof remoteStage === 'number' ? remoteStage : base.stage,
    severityBand,
    recommendedDurationDays:
      RECOMMENDED_DURATION_TABLE[`${severityBand}:${base.planEmphasis}`] ?? base.recommendedDurationDays,
  };
}
