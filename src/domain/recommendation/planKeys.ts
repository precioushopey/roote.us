import type { RecommendationOutcome } from './types';

/**
 * Which `treatmentRegistry` keys apply to a recommendation outcome. Pure — no
 * config, no i18n, no storage. Each rule in `rules.ts` already sets the correct
 * core/supporting keys for its goal (and empties them when the outcome isn't
 * `standard` + production-active), so this just reshapes the outcome into the
 * `{core, supporting}` pair `buildReport` / `resolvePlanTreatments` expect.
 */
export function planKeysFor(
  outcome: Pick<RecommendationOutcome, 'coreProductKey' | 'supportingProductKeys'>,
): { core: string[]; supporting: string[] } {
  return {
    core: outcome.coreProductKey ? [outcome.coreProductKey] : [],
    supporting: [...outcome.supportingProductKeys],
  };
}
