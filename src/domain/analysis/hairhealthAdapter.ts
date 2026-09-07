import type { Answers, Gender, HairAnalysis, HairGoal } from './types';
import { deriveAnalysis, RECOMMENDED_DURATION_TABLE } from './deriveAnalysis';

const API_URL = import.meta.env.VITE_HAIRHEALTH_API_URL as string | undefined;
const API_KEY = import.meta.env.VITE_HAIRHEALTH_API_KEY as string | undefined;

export type HairhealthInput = {
  gender: Gender;
  hairGoal: HairGoal;
  answers: Answers;
  photos: { angleKey: string; blob: Blob }[];
};

/** True only when a hairhealth.ai endpoint is configured via Vite env vars. */
export function isHairhealthConfigured(): boolean {
  return typeof API_URL === 'string' && API_URL.length > 0;
}

/**
 * PLACEHOLDER CONTRACT — confirm every field name, the auth scheme, and the
 * scale/severity vocabulary against hairhealth.ai's real API docs before relying
 * on this. While `VITE_HAIRHEALTH_API_URL` is unset, `isHairhealthConfigured()`
 * is false and `analyzeHair` uses the local questionnaire model instead.
 */
type HairhealthResponse = {
  norwood_stage?: number;
  ludwig_stage?: number;
  severity?: string;
  affected_regions?: string[];
  density_by_region?: Record<string, 'low' | 'medium' | 'high'>;
};

export async function requestHairhealthAnalysis(input: HairhealthInput): Promise<HairAnalysis> {
  if (!isHairhealthConfigured()) {
    throw new Error('hairhealth.ai is not configured (set VITE_HAIRHEALTH_API_URL)');
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
  if (!res.ok) throw new Error(`hairhealth.ai responded ${res.status}`);

  return mapResponse((await res.json()) as HairhealthResponse, input);
}

/**
 * Overlays whatever hairhealth.ai returned onto the fully-populated local model,
 * so every downstream field stays defined. Expand this once the contract is firm.
 */
function mapResponse(raw: HairhealthResponse, input: HairhealthInput): HairAnalysis {
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
