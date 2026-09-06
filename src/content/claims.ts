/**
 * Claim-status system (brief §35). Every marketing statement about a product,
 * ingredient, or outcome carries a status so legal / the product owner can
 * approve wording centrally without touching components.
 *
 *  - `approved`        cleared for public use as written.
 *  - `working`         plausible descriptive copy drafted by ROOTÉ; safe (no
 *                      efficacy / medical claim) but not formally signed off.
 *  - `requires-review` a claim that needs substantiation or legal review before
 *                      it may render as anything other than a [PENDING] chip.
 *
 * `sourceType` records where the underlying material came from, so a reviewer
 * knows what to check.
 */

export type ClaimStatus = 'approved' | 'working' | 'requires-review';

export type ClaimSourceType =
  | 'roote-original' //         written by ROOTÉ, no external basis
  | 'supplier-reference' //     paraphrased from a supplier / formulator sheet
  | 'competitor-reference' //   informed by a competitor page (never copied)
  | 'ingredient-literature' //  general literature about an ingredient class
  | 'clinical-data'; //         a study — must name the study + who it belongs to

export type Claim = {
  /** i18n key OR inline localized text, depending on the surface. */
  text: string;
  status: ClaimStatus;
  sourceType: ClaimSourceType;
  /** Optional pointer for the reviewer (study name, supplier doc, ticket). */
  reviewNote?: string;
};

export function claim(
  text: string,
  status: ClaimStatus,
  sourceType: ClaimSourceType,
  reviewNote?: string,
): Claim {
  return { text, status, sourceType, reviewNote };
}

/** May this claim render as normal copy, or must it show as a pending chip? */
export function isRenderable(c: Claim): boolean {
  return c.status === 'approved' || c.status === 'working';
}

/** Words ROOTÉ never ships without substantiation + legal sign-off (brief §21, §36). */
export const FORBIDDEN_CLAIM_TERMS = [
  'clinically proven',
  'fda approved',
  'fda-approved',
  'guaranteed',
  'cure',
  'reverse gray',
  'reverses gray',
  'regrow your hair',
  '100%',
  'miracle',
  'permanent results',
] as const;

/** Dev/test guard: true if a string uses a forbidden marketing term as a whole
 *  word / phrase (so "secure" does not trip "cure"). */
export function containsForbiddenClaim(text: string): boolean {
  const t = text.toLowerCase();
  return FORBIDDEN_CLAIM_TERMS.some((term) => {
    const re = new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`);
    return re.test(t);
  });
}
