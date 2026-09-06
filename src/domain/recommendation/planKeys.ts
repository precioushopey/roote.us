import type { RecommendationOutcome } from './types';

/**
 * Which `treatmentRegistry` keys apply to a recommendation outcome (PO #15 —
 * closes the concern-branching gap: a gray-only customer never sees Density, a
 * thinning-only customer never sees Gray Support/Serum). Pure — no config,
 * no i18n, no storage. `resolvePlanTreatments` / `buildReport` resolve these
 * keys into display strings for the current locale.
 */
export function planKeysFor(
  outcome: Pick<RecommendationOutcome, 'densityTier' | 'supportingProductKeys'>,
): { core: string[]; supporting: string[] } {
  const core = outcome.densityTier ? [outcome.densityTier] : [];
  const supporting = [...outcome.supportingProductKeys];
  // Optional scalp-care guidance rides along with a Density program only — it
  // isn't offered as a standalone item and isn't part of the gray-only routine.
  if (outcome.densityTier && !supporting.includes('derma-stim')) supporting.push('derma-stim');
  return { core, supporting };
}
