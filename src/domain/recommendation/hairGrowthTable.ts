import type { Gender } from '@/domain/analysis/types';
import type { HairGrowthStrength, HairGrowthTier, PatternCode } from './types';

/**
 * Client-confirmed Hair Growth treatment-strength mapping (Ilay, 2026-09-07):
 *   business_rule_confirmed = true
 *   clinical_approval        = pending
 *   production_active        = false
 * Implemented and unit-tested per that instruction, but never surfaced live to a
 * customer while `production_active` is false — see `productionActive` on
 * `RecommendationOutcome` and the `hair-growth` rule in `rules.ts`.
 *
 * Male:   M1→15% M2→10% M3→6% M4→10% M5→6%
 * Female: F1→6%  F2→6%  F3→10% F4→15%
 * (Not monotonic by design — this is the table as confirmed, not derived.)
 */
const MALE_PATTERN_BY_STAGE: Record<number, PatternCode> = { 2: 'M1', 3: 'M2', 4: 'M3', 5: 'M4', 6: 'M5' };
const FEMALE_PATTERN_BY_STAGE: Record<number, PatternCode> = { 1: 'F1', 2: 'F2', 3: 'F3', 4: 'F4' };

const STRENGTH_BY_PATTERN: Record<PatternCode, HairGrowthStrength> = {
  M1: 15, M2: 10, M3: 6, M4: 10, M5: 6,
  F1: 6, F2: 6, F3: 10, F4: 15,
};

const PRODUCT_KEY_BY_STRENGTH: Record<HairGrowthStrength, string> = {
  6: 'density-6',
  10: 'density-10',
  15: 'density-15',
};

/**
 * Resolves a visual stage into the client's M1–M5 / F1–F4 pattern code.
 * `null` gender ("Other"/unspecified) has no pattern set — the caller must
 * return `REQUIRES_REVIEW` rather than call this (client-confirmed rule 4).
 */
export function patternCodeFor(gender: 'male' | 'female', stage: number): PatternCode | null {
  const table = gender === 'male' ? MALE_PATTERN_BY_STAGE : FEMALE_PATTERN_BY_STAGE;
  return table[stage] ?? null;
}

export function hairGrowthTierFor(gender: Gender, stage: number): HairGrowthTier | null {
  if (gender !== 'male' && gender !== 'female') return null;
  const pattern = patternCodeFor(gender, stage);
  if (!pattern) return null;
  const strengthPct = STRENGTH_BY_PATTERN[pattern];
  return { pattern, strengthPct, productKey: PRODUCT_KEY_BY_STRENGTH[strengthPct] };
}
