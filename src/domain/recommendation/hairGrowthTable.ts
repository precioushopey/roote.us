import type { Gender } from '@/domain/analysis/types';
import type { HairGrowthStrength, HairGrowthTier, PatternCode } from './types';

/**
 * Client-confirmed Hair Growth treatment-strength mapping (Ilay, 2026-09-07):
 *   business_rule_confirmed = true
 * Clinical approval confirmed cleared and the rules flipped live 2026-09-22 —
 * see `productionActive` on `RecommendationOutcome` and the rules in `rules.ts`.
 *
 * Male:   M1→15% M2→10% M3→6% M4→10% M5→6%
 * Female: F1→6%  F2→6%  F3→10% F4→15%
 * (Not monotonic by design — this is the table as confirmed, not derived.)
 */
// Stage ascends with severity, and M1 is the most severe male image, so M1 sits at
// stage 6. Must stay the exact inverse of MALE_STAGE_BY_PATTERN below: a pattern
// pick goes pattern → stage (deriveAnalysis) → pattern (here), and any mismatch
// hands the visitor another pattern's strength. (2026-09-23: this table used to run
// 2→M1 … 6→M5, which gave an M1 pick Level 6 and an M5 pick Level 15.)
const MALE_PATTERN_BY_STAGE: Record<number, PatternCode> = { 6: 'M1', 5: 'M2', 4: 'M3', 3: 'M4', 2: 'M5' };
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

const MALE_STAGE_BY_PATTERN: Record<string, number> = { M1: 6, M2: 5, M3: 4, M4: 3, M5: 2 };
const FEMALE_STAGE_BY_PATTERN: Record<string, number> = { F1: 1, F2: 2, F3: 3, F4: 4 };

/**
 * Maps a visitor's own image pick to the Norwood-scale stage number shown on
 * their report (the S1–S6 strip), ascending with how severe the selected
 * image is (M1 "most of scalp affected" = stage 6). `patternCodeFor`'s
 * `MALE_PATTERN_BY_STAGE` / `FEMALE_PATTERN_BY_STAGE` are the exact inverses
 * of these tables, so a pick round-trips to the same pattern and therefore
 * the client-confirmed `STRENGTH_BY_PATTERN` level. Returns `null` for a
 * mismatched gender/pattern pair (e.g. an `F`-code with `gender: 'male'`),
 * which should never happen from the UI but is guarded here rather than
 * assumed.
 */
export function stageForPattern(gender: 'male' | 'female', pattern: PatternCode): number | null {
  const table = gender === 'male' ? MALE_STAGE_BY_PATTERN : FEMALE_STAGE_BY_PATTERN;
  return table[pattern] ?? null;
}

export function hairGrowthTierFor(gender: Gender, stage: number): HairGrowthTier | null {
  if (gender !== 'male' && gender !== 'female') return null;
  const pattern = patternCodeFor(gender, stage);
  if (!pattern) return null;
  const strengthPct = STRENGTH_BY_PATTERN[pattern];
  return { pattern, strengthPct, productKey: PRODUCT_KEY_BY_STRENGTH[strengthPct] };
}
