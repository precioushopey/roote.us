# Magazine Content Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/magazine` placeholder with a real content hub — hair-loss science, an
ingredient library sourced from the real product catalog, format explainers, product teasers, and a
results-timeline note — using ROOTÉ's existing claim-status safety system, not a new one.

**Architecture:** One new content-data file (`src/content/magazine.ts`), following the exact pattern of
`src/content/products.ts`/`bundles.ts`. One page component rewrite (`Magazine.tsx`, replacing its
`PagePlaceholder` body). A small connective change to `/science` wiring its dormant `onReadMore` prop
to the new page. No new UI primitives, no changes to `products.ts`/`claims.ts` themselves.

**Tech Stack:** React 18 + TypeScript (strict), React Router v7, Vitest + Testing Library, the existing
`roote` component primitives (`Section`, `DisplayTitle`, `Prose`, `Eyebrow`, `IngredientCard`, `Button`).

**Spec:** `docs/superpowers/specs/2026-09-09-magazine-content-section-design.md`

**Correction from the spec:** the spec states "22 unique ingredients" / "~18 non-proprietary." The
actual count, verified against the current `src/content/products.ts`, is **24 unique ingredient names,
20 of them non-proprietary** (4 — Procapil®, Greyverse™, Darkenyl™, Capixyl™ — are supplier-proprietary
and stay `requires-review`/`[PENDING]`, unchanged). This doesn't change any decision in the spec, only
the count; flagged here so the numbers in this plan and the spec don't silently disagree.

## Global Constraints

- Never invent product/effectiveness/timeline claims (CLAUDE.md hard rule #1). Every substantive new
  claim in this feature carries a `ClaimStatus`/`ClaimSourceType` (reusing the existing types from
  `src/content/claims.ts` — do not modify that file). `requires-review` content renders as
  `PendingChip`, never as plain copy.
- EN/HE parity is mandatory — every new `en.ts` key needs a real (non-empty) `he.ts` value
  (`src/i18n/messages.test.ts` enforces this and fails the build otherwise). `magazine.ts`'s own
  `LocalizedText` values also need both languages filled in for real (no empty strings).
- No forbidden claim terms anywhere in new copy: `clinically proven`, `fda approved`, `fda-approved`,
  `guaranteed`, `cure`, `reverse gray`, `reverses gray`, `regrow your hair`, `100%`, `miracle`,
  `permanent results` (`src/content/claims.ts` → `FORBIDDEN_CLAIM_TERMS`, checked via
  `containsForbiddenClaim`).
- RTL-safe styling: Tailwind logical utilities only (`ms/me/ps/pe`, `text-start/-end`), never
  `ml/mr/left/right`.
- `pnpm typecheck` and `pnpm test` must stay green after every task.
- Do not commit or push unless the user explicitly asks (this repo's established workflow this
  session) — each task's "Commit" step stages and commits locally only.

---

### Task 1: `magazine.ts` — types, hair-loss science, results-timeline claim

**Files:**
- Create: `src/content/magazine.ts`
- Test: `src/content/magazine.test.ts`

**Interfaces:**
- Produces: `HAIR_LOSS_SCIENCE: LocalizedText` (imported by Task 5).
- Produces: `RESULTS_TIMELINE_CLAIM: Record<'en' | 'he', import('./claims').Claim>` (imported by Task 5).
- Consumes: `LocalizedText`, `L` from `./localized`; `Claim`, `claim`, `ClaimStatus`, `ClaimSourceType`
  from `./claims`.

- [ ] **Step 1: Write the failing test**

Create `src/content/magazine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { HAIR_LOSS_SCIENCE, RESULTS_TIMELINE_CLAIM } from './magazine';
import { containsForbiddenClaim } from './claims';

describe('magazine content — hair-loss science + timeline claim', () => {
  it('hair-loss science copy is real in both languages and carries no forbidden claim', () => {
    expect(HAIR_LOSS_SCIENCE.en.length).toBeGreaterThan(50);
    expect(HAIR_LOSS_SCIENCE.he.length).toBeGreaterThan(50);
    expect(containsForbiddenClaim(HAIR_LOSS_SCIENCE.en)).toBe(false);
    expect(containsForbiddenClaim(HAIR_LOSS_SCIENCE.he)).toBe(false);
  });

  it('results-timeline claim is requires-review (renders [PENDING]), sourced from general literature, not a competitor', () => {
    for (const locale of ['en', 'he'] as const) {
      const c = RESULTS_TIMELINE_CLAIM[locale];
      expect(c.status).toBe('requires-review');
      expect(c.sourceType).toBe('ingredient-literature');
      expect(c.text.length).toBeGreaterThan(20);
      expect(containsForbiddenClaim(c.text)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/content/magazine.test.ts`
Expected: FAIL — `Cannot find module './magazine'` (file doesn't exist yet).

- [ ] **Step 3: Create `src/content/magazine.ts` with the header, types, and these two content pieces**

```typescript
import { L, type LocalizedText } from './localized';
import { claim, type Claim } from './claims';

/**
 * Content for the "Magazine" hub (`/magazine`) — a single scrollable page, not a
 * per-ingredient wiki (2026-09-09 design decision, see docs/superpowers/specs/
 * 2026-09-09-magazine-content-section-design.md). Ingredient names, claim
 * statuses, and source types are owned by `products.ts` — this file only adds
 * longer explanatory copy on top, keyed by ingredient name; it never overrides
 * an ingredient's real status. Every substantive claim here is paraphrased from
 * general ingredient literature, never copied from a competitor page, and
 * carries a `ClaimStatus` so wording can be approved centrally — the same rule
 * `products.ts` already follows.
 */

export const HAIR_LOSS_SCIENCE: LocalizedText = L(
  "Pattern hair loss (androgenetic alopecia) is largely driven by genetics and hormones. In people with a genetic sensitivity, the hormone DHT (dihydrotestosterone) gradually shrinks — or \"miniaturizes\" — hair follicles over repeated growth cycles. Each cycle, the affected hairs grow back finer, shorter, and lighter, until some follicles stop producing visible hair altogether. This process typically shows up first as a widening part, a receding hairline, or thinning at the crown, and tends to progress gradually rather than all at once. Gray hair is a separate, distinct process — it happens as pigment-producing cells in the follicle slow down or stop over time, unrelated to the DHT pathway.",
  'נשירת שיער תורשתית (אלופציה אנדרוגנטית) מונעת ברובה על ידי גנטיקה והורמונים. אצל אנשים עם רגישות גנטית, ההורמון DHT (דיהידרוטסטוסטרון) מכווץ בהדרגה — או "מצטמק" — את זקיקי השיער לאורך מחזורי צמיחה חוזרים. בכל מחזור, השיער הנפגע צומח דק, קצר ובהיר יותר, עד שחלק מהזקיקים מפסיקים לייצר שיער נראה לעין לחלוטין. תהליך זה בדרך כלל מתבטא תחילה בהרחבת השבילה, בנסיגת קו השיער, או בדילול בקודקוד, ונוטה להתקדם בהדרגה ולא בבת אחת. שיער אפור הוא תהליך נפרד ושונה לחלוטין — הוא מתרחש כאשר תאי הפיגמנט בזקיק מאטים או מפסיקים לפעול עם הזמן, ואינו קשור למסלול ה-DHT.',
);

/**
 * Result-timeline claim. Real competitor sites (minoxidilmax.com, heyhair.co —
 * FAQ, product, and collection pages) were checked directly and make NO official
 * brand claim about result timelines; the only timeframes found anywhere were
 * customer-review anecdotes (2-6 months, informal), which are not used as a
 * source. This instead draws on general, brand-independent medical literature
 * on topical minoxidil/finasteride onset (commonly cited ~3-6 months) —
 * `requires-review` because it's still a result-timeline claim and needs
 * sign-off before it can render as live copy, not because the sourcing is weak.
 */
export const RESULTS_TIMELINE_CLAIM: Record<'en' | 'he', Claim> = {
  en: claim(
    'Onset timelines for topical minoxidil and finasteride are well documented in the general medical literature: initial shedding sometimes increases in the first several weeks as the hair cycle resets, visible density changes are commonly reported starting around the 3-6 month mark, and continued use is generally required to maintain any gains. Individual timelines vary, and a treatment review is the place to set expectations for your specific plan.',
    'requires-review',
    'ingredient-literature',
    'General minoxidil/finasteride onset timeline (~3-6 months) — confirm wording and sourcing with legal before publishing.',
  ),
  he: claim(
    'לוחות הזמנים להופעת תוצאות ממינוקסידיל ופינסטריד מקומיים מתועדים היטב בספרות הרפואית הכללית: לעיתים חלה עלייה בנשירה בשבועות הראשונים ככל שמחזור השיער מתאפס, שינויים נראים בצפיפות מדווחים בדרך כלל החל מסביבות חודש 3 עד 6, והמשך שימוש נדרש בדרך כלל לשמירה על כל שיפור שהושג. לוחות הזמנים משתנים מאדם לאדם, ובדיקת הטיפול היא המקום לקבוע ציפיות מותאמות לתוכנית שלך.',
    'requires-review',
    'ingredient-literature',
    'General minoxidil/finasteride onset timeline (~3-6 months) — confirm wording and sourcing with legal before publishing.',
  ),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/content/magazine.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 6: Commit**

```bash
git add src/content/magazine.ts src/content/magazine.test.ts
git commit -m "feat: add Magazine hair-loss-science copy and results-timeline claim"
```

---

### Task 2: `magazine.ts` — ingredient categories and explanations

**Files:**
- Modify: `src/content/magazine.ts` (append to the file from Task 1)
- Modify: `src/content/magazine.test.ts` (append tests)

**Interfaces:**
- Consumes: `PRODUCTS`, `type Ingredient` from `./products` (real ingredient names/claimStatus —
  never duplicated or overridden here).
- Produces: `type IngredientCategory = 'dht' | 'regrowth' | 'pigment' | 'conditioning'` (consumed by
  Task 5).
- Produces: `dedupedIngredients(): Ingredient[]` (consumed by Task 5 and Task 7's test).
- Produces: `INGREDIENT_CATEGORY: Record<string, IngredientCategory>` — keyed by `Ingredient.name`
  (consumed by Task 5).
- Produces: `INGREDIENT_EXPLANATIONS: Record<string, LocalizedText>` — keyed by `Ingredient.name`, only
  the 20 non-proprietary ingredients (consumed by Task 5).

- [ ] **Step 1: Write the failing test**

Append to `src/content/magazine.test.ts`:

```typescript
import { PRODUCTS } from './products';
import {
  dedupedIngredients,
  INGREDIENT_CATEGORY,
  INGREDIENT_EXPLANATIONS,
} from './magazine';

describe('magazine content — ingredient library', () => {
  const PROPRIETARY = ['Procapil®', 'Greyverse™', 'Darkenyl™', 'Capixyl™'];

  it('dedupedIngredients() has exactly the 24 unique ingredient names from the real catalog', () => {
    const allNames = new Set(PRODUCTS.flatMap((p) => p.ingredients.map((i) => i.name)));
    const deduped = dedupedIngredients();
    expect(deduped.length).toBe(allNames.size);
    expect(new Set(deduped.map((i) => i.name))).toEqual(allNames);
  });

  it('every deduped ingredient has a category assigned', () => {
    for (const ing of dedupedIngredients()) {
      expect(INGREDIENT_CATEGORY[ing.name], ing.name).toBeDefined();
    }
  });

  it('every non-proprietary ingredient has a real explanation in both languages; proprietary ones have none', () => {
    for (const ing of dedupedIngredients()) {
      const explanation = INGREDIENT_EXPLANATIONS[ing.name];
      if (PROPRIETARY.includes(ing.name)) {
        expect(explanation, ing.name).toBeUndefined();
      } else {
        expect(explanation, ing.name).toBeDefined();
        expect(explanation!.en.length, ing.name).toBeGreaterThan(20);
        expect(explanation!.he.length, ing.name).toBeGreaterThan(20);
      }
    }
  });

  it('no ingredient explanation carries a forbidden claim term', () => {
    for (const [name, text] of Object.entries(INGREDIENT_EXPLANATIONS)) {
      expect(containsForbiddenClaim(text.en), name).toBe(false);
      expect(containsForbiddenClaim(text.he), name).toBe(false);
    }
  });

  it('proprietary ingredients keep their real requires-review status untouched (not overridden here)', () => {
    for (const name of PROPRIETARY) {
      const ing = dedupedIngredients().find((i) => i.name === name)!;
      expect(ing.claimStatus, name).toBe('requires-review');
    }
  });
});
```

Add `containsForbiddenClaim` to the existing `from './claims'` import at the top of the test file.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/content/magazine.test.ts`
Expected: FAIL — `dedupedIngredients`/`INGREDIENT_CATEGORY`/`INGREDIENT_EXPLANATIONS` not exported.

- [ ] **Step 3: Append to `src/content/magazine.ts`**

```typescript
import { PRODUCTS, type Ingredient } from './products';

/** Every unique ingredient across the 6 real SKUs, first occurrence wins. Single
 *  source of truth stays `products.ts` — this never redefines name/claimStatus/
 *  sourceType, only deduplicates what's already there. */
export function dedupedIngredients(): Ingredient[] {
  const seen = new Map<string, Ingredient>();
  for (const p of PRODUCTS) {
    for (const ing of p.ingredients) {
      if (!seen.has(ing.name)) seen.set(ing.name, ing);
    }
  }
  return Array.from(seen.values());
}

/** Same 4 categories `/science` already shows (marketing.sci.mechanism.*Title
 *  i18n keys) — reused, not reinvented, so both pages agree. */
export type IngredientCategory = 'dht' | 'regrowth' | 'pigment' | 'conditioning';

export const INGREDIENT_CATEGORY: Record<string, IngredientCategory> = {
  // DHT-pathway support
  Finasteride: 'dht',
  'Azelaic Acid': 'dht',
  'Saw Palmetto': 'dht',
  'Nettle Root': 'dht',
  // Regrowth stimulation
  Minoxidil: 'regrowth',
  'Procapil®': 'regrowth',
  'Capixyl™': 'regrowth',
  Caffeine: 'regrowth',
  Ginseng: 'regrowth',
  Rosemary: 'regrowth',
  // Pigment & nutrition support
  'Greyverse™': 'pigment',
  'Darkenyl™': 'pigment',
  'Fo-Ti': 'pigment',
  Biotin: 'pigment',
  Catalase: 'pigment',
  'L-Tyrosine': 'pigment',
  PABA: 'pigment',
  Zinc: 'pigment',
  // Scalp & hair conditioning
  'Green Tea': 'conditioning',
  Panthenol: 'conditioning',
  Nettle: 'conditioning',
  Horsetail: 'conditioning',
  Sage: 'conditioning',
  Jojoba: 'conditioning',
};

/** Longer, Magazine-depth explanation per ingredient — the section's value-add
 *  over `/science`'s one-line note. Deliberately omitted for the 4 supplier-
 *  proprietary actives (Procapil®, Greyverse™, Darkenyl™, Capixyl™); those stay
 *  `requires-review` and render [PENDING] via IngredientCard, unchanged. */
export const INGREDIENT_EXPLANATIONS: Record<string, LocalizedText> = {
  Minoxidil: L(
    "Minoxidil is a long-studied topical ingredient used in pattern hair loss. It's thought to work by widening blood vessels in the scalp and extending the hair growth cycle's active (anagen) phase, though its exact mechanism isn't fully understood.",
    'מינוקסידיל הוא רכיב מקומי הנחקר זה זמן רב, לשימוש בנשירת שיער תורשתית. משוער שהוא פועל על ידי הרחבת כלי הדם בקרקפת והארכת שלב הצמיחה הפעיל (אנגן) במחזור השיער, אם כי מנגנון הפעולה המדויק שלו אינו מובן במלואו.',
  ),
  Finasteride: L(
    "Finasteride works within the DHT pathway linked to pattern hair loss — it's designed to reduce the conversion of testosterone into DHT, the hormone associated with follicle miniaturization in genetically susceptible hair.",
    'פינסטריד פועל במסלול ה-DHT הקשור לנשירת שיער תורשתית — הוא מיועד להפחית את המרת הטסטוסטרון ל-DHT, ההורמון הקשור להצטמקות זקיקי השיער אצל בעלי רגישות גנטית.',
  ),
  'Azelaic Acid': L(
    "Azelaic acid is included here as a DHT-pathway support ingredient — it's referenced in the hair-care literature for a mild inhibitory effect on the same enzyme pathway finasteride targets, alongside its more established use as a skin-care active.",
    'חומצה אזלאית נכללת כאן כרכיב תמיכה במסלול ה-DHT — היא מוזכרת בספרות הטיפוח לתפקיד מתון בעיכוב אותו מסלול אנזימטי שפינסטריד פועל עליו, לצד השימוש המבוסס יותר שלה כרכיב טיפוח עור.',
  ),
  'Saw Palmetto': L(
    "Saw palmetto is a botanical extract commonly referenced in the DHT-pathway supplement category, alongside pharmaceutical actives like finasteride — its effect is considered milder and less established in the research.",
    'Saw Palmetto הוא תמצית צמחית המוזכרת לעיתים קרובות בקטגוריית התוספים למסלול ה-DHT, לצד רכיבים תרופתיים כמו פינסטריד — האפקט שלה נחשב מתון יותר ופחות מבוסס במחקר.',
  ),
  'Nettle Root': L(
    'Nettle root is a botanical often paired with saw palmetto in DHT-pathway supplement blends, referenced for a similar supporting role in the same category of hair-loss nutrition.',
    'שורש סרפד הוא רכיב צמחי המשולב לעיתים קרובות עם Saw Palmetto בתוספים למסלול ה-DHT, ומוזכר לתפקיד תומך דומה באותה קטגוריה של תזונה לנשירת שיער.',
  ),
  Caffeine: L(
    'Caffeine is a common scalp-serum and shampoo ingredient, studied in the hair-care literature for a stimulating effect on hair follicles when applied topically — distinct from its better-known effects when consumed.',
    'קפאין הוא רכיב נפוץ בסרומים ובשמפו לקרקפת, הנחקר בספרות הטיפוח לאפקט מגרה על זקיקי השיער בעת מריחה מקומית — בשונה מהאפקטים המוכרים יותר שלו בצריכה.',
  ),
  Ginseng: L(
    'Ginseng is a botanical used in many scalp-care formulas, referenced for supporting circulation and general scalp vitality alongside its long history in traditional herbal use.',
    "ג'ינסנג הוא רכיב צמחי בשימוש בפורמולות רבות לטיפוח הקרקפת, המוזכר לתמיכה במחזור הדם ובחיוניות הקרקפת הכללית, לצד ההיסטוריה הארוכה שלו בשימוש הרפואי המסורתי.",
  ),
  Rosemary: L(
    'Rosemary extract is used in scalp-care products and is referenced in some comparative research alongside minoxidil for scalp circulation support, though the evidence base is smaller and less established.',
    'תמצית רוזמרין בשימוש במוצרי טיפוח לקרקפת, ומוזכרת במחקר השוואתי מסוים לצד מינוקסידיל לתמיכה במחזור הדם בקרקפת, אם כי בסיס הראיות קטן ופחות מבוסס.',
  ),
  'Fo-Ti': L(
    'Fo-Ti (He Shou Wu) is a botanical with a long history in traditional use for hair and, informally, for supporting natural hair color — it appears in both our anti-gray serum and supplement for that traditional association.',
    'Fo-Ti (הא שואו וו) הוא רכיב צמחי בעל היסטוריה ארוכה בשימוש מסורתי לשיער, ובאופן לא רשמי לתמיכה בצבע השיער הטבעי — הוא מופיע הן בסרום והן בתוסף שלנו לשיער אפור בשל אותו קשר מסורתי.',
  ),
  Biotin: L(
    'Biotin is a B-vitamin commonly included in hair and nail supplements; it plays a role in normal keratin production, though supplementation mainly helps where an existing deficiency is present.',
    'ביוטין הוא ויטמין מקבוצת B הנכלל לעיתים קרובות בתוספים לשיער וציפורניים; הוא ממלא תפקיד בייצור קרטין תקין, אם כי נטילת תוסף עוזרת בעיקר כאשר קיים מחסור קיים.',
  ),
  Catalase: L(
    'Catalase is an enzyme referenced in the anti-gray supplement category — the theory ties it to breaking down hydrogen peroxide that can otherwise build up in the hair follicle and interfere with natural pigment.',
    'קטלאז הוא אנזים המוזכר בקטגוריית התוספים לשיער אפור — התיאוריה מקשרת אותו לפירוק מי חמצן שעלולים להצטבר בזקיק השיער ולפגוע בפיגמנט הטבעי.',
  ),
  'L-Tyrosine': L(
    "L-Tyrosine is an amino acid involved in the body's pigment-production pathway, as a precursor in melanin synthesis — it's included here for that nutritional role.",
    'L-Tyrosine היא חומצת אמינו המעורבת במסלול ייצור הפיגמנט בגוף, כחומר מוצא בסינתזת מלנין — היא נכללת כאן בשל תפקיד תזונתי זה.',
  ),
  PABA: L(
    "PABA (para-aminobenzoic acid) is a compound included in some hair supplements, informally associated with pigment support — its role here is nutritional, not medicinal.",
    'PABA (חומצה פארא-אמינובנזואית) היא תרכובת הנכללת בחלק מתוספי השיער, ומקושרת באופן לא רשמי לתמיכה בפיגמנט — תפקידה כאן הוא תזונתי, לא רפואי.',
  ),
  Zinc: L(
    'Zinc is a mineral that contributes to normal hair tissue growth and repair, and is a common inclusion in general hair and scalp supplements.',
    'אבץ הוא מינרל התורם לצמיחה ולתיקון תקינים של רקמת השיער, ונכלל באופן נפוץ בתוספים כלליים לשיער ולקרקפת.',
  ),
  'Green Tea': L(
    'Green tea extract is an antioxidant-rich botanical used across scalp-care formulas, generally included to help support scalp condition against everyday environmental stress.',
    'תמצית תה ירוק היא רכיב צמחי עשיר בנוגדי חמצון, בשימוש בפורמולות טיפוח קרקפת שונות, ונכללת בדרך כלל לתמיכה במצב הקרקפת מול עומס סביבתי יומיומי.',
  ),
  Panthenol: L(
    'Panthenol (pro-vitamin B5) is a widely used conditioning agent that helps hair retain moisture and can improve how hair feels and looks day to day.',
    'פנתנול (פרו-ויטמין B5) הוא רכיב הזנה נפוץ מאוד, המסייע לשיער לשמר לחות ויכול לשפר את המרקם והמראה היומיומי שלו.',
  ),
  Nettle: L(
    'Nettle extract is a botanical used in hair-support blends for general scalp conditioning, distinct from the more targeted DHT-pathway role attributed to nettle root.',
    'תמצית סרפד היא רכיב צמחי בשימוש בתערובות תמיכה לשיער, לטיפוח כללי של הקרקפת, בשונה מהתפקיד הממוקד יותר במסלול ה-DHT המיוחס לשורש הסרפד.',
  ),
  Horsetail: L(
    'Horsetail is a silica-bearing botanical traditionally used in hair care, referenced for its role in supporting hair strength and texture.',
    'זנב סוס הוא רכיב צמחי עשיר בסיליקה, בשימוש מסורתי בטיפוח שיער, ומוזכר לתפקידו בתמיכה בחוזק ובמרקם השיער.',
  ),
  Sage: L(
    'Sage extract is an aromatic botanical used in scalp formulas, valued for its traditional use in scalp care alongside a pleasant, herbal scent.',
    'תמצית מרווה היא רכיב צמחי ארומטי בשימוש בפורמולות לקרקפת, המוערך בשל השימוש המסורתי שלו בטיפוח הקרקפת לצד ריח צמחי נעים.',
  ),
  Jojoba: L(
    "Jojoba oil closely resembles the scalp's own natural oils, which is why it's widely used to condition hair and scalp without feeling heavy or greasy.",
    'שמן ג\'וג\'ובה דומה מאוד לשמנים הטבעיים של הקרקפת עצמה, ולכן הוא בשימוש נרחב להזנת השיער והקרקפת מבלי להרגיש כבד או שמנוני.',
  ),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/content/magazine.test.ts`
Expected: PASS (7 tests total)

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 6: Commit**

```bash
git add src/content/magazine.ts src/content/magazine.test.ts
git commit -m "feat: add Magazine ingredient categories and explanations"
```

---

### Task 3: `magazine.ts` — format explainers

**Files:**
- Modify: `src/content/magazine.ts` (append)
- Modify: `src/content/magazine.test.ts` (append tests)

**Interfaces:**
- Consumes: `type ProductFormat` from `./products` (`'topical-solution' | 'capsule-supplement' |
  'shampoo' | 'serum'`).
- Produces: `FORMAT_EXPLANATIONS: Record<ProductFormat, LocalizedText>` (consumed by Task 5).

- [ ] **Step 1: Write the failing test**

Append to `src/content/magazine.test.ts`:

```typescript
import type { ProductFormat } from './products';
import { FORMAT_EXPLANATIONS } from './magazine';

describe('magazine content — format explainers', () => {
  const FORMATS: ProductFormat[] = ['topical-solution', 'capsule-supplement', 'shampoo', 'serum'];

  it('has a real explanation in both languages for every product format', () => {
    for (const f of FORMATS) {
      expect(FORMAT_EXPLANATIONS[f], f).toBeDefined();
      expect(FORMAT_EXPLANATIONS[f].en.length, f).toBeGreaterThan(20);
      expect(FORMAT_EXPLANATIONS[f].he.length, f).toBeGreaterThan(20);
      expect(containsForbiddenClaim(FORMAT_EXPLANATIONS[f].en), f).toBe(false);
      expect(containsForbiddenClaim(FORMAT_EXPLANATIONS[f].he), f).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/content/magazine.test.ts`
Expected: FAIL — `FORMAT_EXPLANATIONS` not exported.

- [ ] **Step 3: Append to `src/content/magazine.ts`**

```typescript
import type { ProductFormat } from './products';

/** One explainer per real product format — general delivery-method info, not a
 *  brand-specific or efficacy claim. */
export const FORMAT_EXPLANATIONS: Record<ProductFormat, LocalizedText> = {
  'topical-solution': L(
    'Topical solutions are applied directly to the scalp and are the most established at-home format for pattern hair loss — they let active ingredients reach the scalp and follicles directly, which is why products like ours in the Density line use this format for the highest-strength actives.',
    'תמיסות מקומיות נמרחות ישירות על הקרקפת והן הפורמט הביתי המבוסס ביותר לנשירת שיער תורשתית — הן מאפשרות לרכיבים הפעילים להגיע ישירות לקרקפת ולזקיקים, ולכן מוצרים כמו קו Density שלנו משתמשים בפורמט זה לרכיבים הפעילים בעוצמה הגבוהה ביותר.',
  ),
  'capsule-supplement': L(
    'Capsule supplements work from the inside — taken daily with food, they deliver vitamins, minerals, and botanical extracts through the digestive system rather than directly to the scalp, complementing a topical routine with broader nutritional support.',
    'תוספי קפסולות פועלים מבפנים — נלקחים מדי יום עם אוכל, הם מספקים ויטמינים, מינרלים ותמציות צמחיות דרך מערכת העיכול, ולא ישירות לקרקפת, ומשלימים שגרה מקומית בתמיכה תזונתית רחבה יותר.',
  ),
  serum: L(
    "Serums are lightweight, leave-in formulas usually applied once daily and left on the scalp — they're formulated to sit on the skin longer than a rinse-off product, which is typically why cosmetic (non-prescription) actives are delivered this way.",
    'סרומים הם תכשירים קלים, שאינם נשטפים, הנמרחים בדרך כלל פעם ביום ונשארים על הקרקפת — הם מיועדים להישאר על העור זמן ארוך יותר ממוצר הנשטף, וזו בדרך כלל הסיבה שרכיבים קוסמטיים (ללא מרשם) מועברים בדרך זו.',
  ),
  shampoo: L(
    'Shampoos are a daily cleanse step — used in place of a regular shampoo, a scalp-focused formula clears buildup and delivers conditioning actives with brief, repeated contact each time you wash.',
    'שמפו הוא שלב הניקוי היומי — בשימוש במקום שמפו רגיל, פורמולה הממוקדת בקרקפת מנקה הצטברות ומעבירה רכיבי הזנה במגע קצר וחוזר בכל שטיפה.',
  ),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/content/magazine.test.ts`
Expected: PASS (8 tests total)

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 6: Commit**

```bash
git add src/content/magazine.ts src/content/magazine.test.ts
git commit -m "feat: add Magazine product-format explainers"
```

---

### Task 4: i18n keys for page chrome

**Files:**
- Modify: `src/i18n/messages/en.ts`
- Modify: `src/i18n/messages/he.ts`
- Test: `src/i18n/messages.test.ts` (existing — no changes needed, just must stay green)

**Interfaces:**
- Produces: the `MessageKey` union gains the keys listed below (consumed by Task 5's `t()` calls).
- Consumes: nothing new.

- [ ] **Step 1: Locate the existing placeholder keys in `en.ts`**

Find (added earlier this session, currently used by the `PagePlaceholder`-based stand-in):

```typescript
  'marketing.magazine.title': 'The Magazine is on its way.',
  'marketing.magazine.body':
    "We're putting together in-depth guides on every ingredient, how each treatment works, and the science behind hair loss. Check back soon.",
```

- [ ] **Step 2: Replace those two values and add the rest of the page-chrome keys in `en.ts`**

```typescript
  'marketing.magazine.eyebrow': 'The science behind the system',
  'marketing.magazine.title': "Understand what's actually in your routine.",
  'marketing.magazine.body':
    'A closer look at why hair loss happens, what each ingredient does, and how every ROOTÉ treatment fits into your plan.',
  'marketing.magazine.whyEyebrow': 'The basics',
  'marketing.magazine.whyHeading': 'Why hair loss happens',
  'marketing.magazine.timelineHeading': 'How results typically develop',
  'marketing.magazine.timelinePendingLabel': 'results timeline',
  'marketing.magazine.ingredientsEyebrow': 'Ingredient by ingredient',
  'marketing.magazine.ingredientsHeading': 'The ingredient library',
  'marketing.magazine.formatsEyebrow': 'Pills, serums & topicals',
  'marketing.magazine.formatsHeading': 'Why treatments come in different forms',
  'marketing.magazine.productsEyebrow': 'The full lineup',
  'marketing.magazine.productsHeading': 'Every ROOTÉ treatment',
  'marketing.magazine.ctaHeading': 'Ready to find your plan?',
```

(Keep `'marketing.magazine.title'` and `'marketing.magazine.body'` at their existing position in the
file — only their values change; don't move the lines.)

- [ ] **Step 3: Add the matching Hebrew keys in `he.ts`, at the same position as the existing
  `marketing.magazine.title`/`.body` entries**

```typescript
  'marketing.magazine.eyebrow': 'המדע שמאחורי המערכת',
  'marketing.magazine.title': 'הבינו מה באמת נמצא בשגרה שלכם.',
  'marketing.magazine.body':
    'מבט מקרוב על הסיבה לנשירת שיער, על תפקידו של כל רכיב, ועל האופן שבו כל טיפול של ROOTÉ משתלב בתוכנית שלכם.',
  'marketing.magazine.whyEyebrow': 'היסודות',
  'marketing.magazine.whyHeading': 'למה נושרת שיער',
  'marketing.magazine.timelineHeading': 'איך תוצאות מתפתחות בדרך כלל',
  'marketing.magazine.timelinePendingLabel': 'לוח זמנים לתוצאות',
  'marketing.magazine.ingredientsEyebrow': 'רכיב אחר רכיב',
  'marketing.magazine.ingredientsHeading': 'ספריית הרכיבים',
  'marketing.magazine.formatsEyebrow': 'כמוסות, סרומים ותמיסות',
  'marketing.magazine.formatsHeading': 'למה טיפולים מגיעים בצורות שונות',
  'marketing.magazine.productsEyebrow': 'המערך המלא',
  'marketing.magazine.productsHeading': 'כל טיפול של ROOTÉ',
  'marketing.magazine.ctaHeading': 'מוכנים למצוא את התוכנית שלכם?',
```

- [ ] **Step 4: Run typecheck (catches any EN/HE key mismatch as a compile error)**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 5: Run the i18n parity test**

Run: `pnpm vitest run src/i18n/messages.test.ts`
Expected: PASS

- [ ] **Step 6: Add the 4 product-format label keys, in `en.ts` right after the keys added in Step 2**

```typescript
  'marketing.magazine.formatLabel.topicalSolution': 'Topical solutions',
  'marketing.magazine.formatLabel.capsuleSupplement': 'Capsule supplements',
  'marketing.magazine.formatLabel.serum': 'Serums',
  'marketing.magazine.formatLabel.shampoo': 'Shampoos',
```

And in `he.ts`, right after the keys added in Step 3:

```typescript
  'marketing.magazine.formatLabel.topicalSolution': 'תמיסות מקומיות',
  'marketing.magazine.formatLabel.capsuleSupplement': 'תוספי קפסולות',
  'marketing.magazine.formatLabel.serum': 'סרומים',
  'marketing.magazine.formatLabel.shampoo': 'שמפו',
```

- [ ] **Step 7: Run typecheck and the i18n parity test again**

Run: `pnpm typecheck && pnpm vitest run src/i18n/messages.test.ts`
Expected: 0 diagnostics, tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: add Magazine page-chrome i18n keys"
```

---

### Task 5: `Magazine.tsx` — build the real page

**Files:**
- Modify: `src/app/routes/marketing/Magazine.tsx` (replace body entirely)

**Interfaces:**
- Consumes: `HAIR_LOSS_SCIENCE`, `RESULTS_TIMELINE_CLAIM`, `dedupedIngredients`, `INGREDIENT_CATEGORY`,
  `INGREDIENT_EXPLANATIONS`, `FORMAT_EXPLANATIONS`, `type IngredientCategory` from `@/content/magazine`
  (Tasks 1-3). `PRODUCTS` from `@/content/products`. `EXTERNAL_ASSESSMENT_URL`, `PATHS` from
  `@/app/paths`. `Section`, `DisplayTitle`, `Prose`, `Eyebrow`, `IngredientCard`, `Button` from
  `@/app/components/roote`. `isRenderable` from `@/content/claims` is NOT needed — render logic checks
  `claim.status === 'requires-review'` directly, matching the existing `bundle.price === null` /
  `IngredientCard`'s own internal `status === 'requires-review'` pattern already used elsewhere in this
  codebase, rather than introducing a new helper call.
- Produces: nothing new consumed elsewhere (this is the leaf page component). `id="ingredients"` on
  the ingredient-library `Section` is consumed by Task 6's anchor link.

- [ ] **Step 1: Replace `src/app/routes/marketing/Magazine.tsx` in full**

```tsx
import { Link } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
import {
  Section,
  DisplayTitle,
  Prose,
  Eyebrow,
  Button,
  IngredientCard,
  PendingChip,
} from '@/app/components/roote';
import { EXTERNAL_ASSESSMENT_URL, PATHS } from '@/app/paths';
import { pickLocalized } from '@/content/localized';
import { PRODUCTS } from '@/content/products';
import type { ClaimStatus } from '@/content/claims';
import {
  HAIR_LOSS_SCIENCE,
  RESULTS_TIMELINE_CLAIM,
  dedupedIngredients,
  INGREDIENT_CATEGORY,
  INGREDIENT_EXPLANATIONS,
  FORMAT_EXPLANATIONS,
  type IngredientCategory,
} from '@/content/magazine';
import type { MessageKey } from '@/i18n/messages';

/** Same 4 categories `/science` shows, same i18n keys — the two pages agree. */
const CATEGORY_LABEL_KEY: Record<IngredientCategory, MessageKey> = {
  dht: 'marketing.sci.mechanism.dhtTitle',
  regrowth: 'marketing.sci.mechanism.regrowthTitle',
  pigment: 'marketing.sci.mechanism.pigmentTitle',
  conditioning: 'marketing.sci.mechanism.conditioningTitle',
};
const CATEGORY_ORDER: IngredientCategory[] = ['dht', 'regrowth', 'pigment', 'conditioning'];

/** Keys added in Task 4 Step 6 — dedicated Magazine format labels, not reused
 *  from /science's SKU-group labels (different meaning: format, not SKU line). */
const FORMAT_LABEL_KEY: Record<string, MessageKey> = {
  'topical-solution': 'marketing.magazine.formatLabel.topicalSolution',
  'capsule-supplement': 'marketing.magazine.formatLabel.capsuleSupplement',
  serum: 'marketing.magazine.formatLabel.serum',
  shampoo: 'marketing.magazine.formatLabel.shampoo',
};

export function Magazine() {
  const t = useT();
  const cl = useContentLocale();
  const withLocale = useLocalizedPath();
  const statusLabel: Record<ClaimStatus, string> = {
    approved: t('marketing.sci.status.approved'),
    working: t('marketing.sci.status.working'),
    'requires-review': t('marketing.sci.status.requiresReview'),
  };
  const timelineClaim = RESULTS_TIMELINE_CLAIM[cl];
  const byCategory = (cat: IngredientCategory) =>
    dedupedIngredients().filter((ing) => INGREDIENT_CATEGORY[ing.name] === cat);

  return (
    <>
      <Section tone="teal" width="content" animate={false}>
        <Eyebrow className="rounded-full border border-accent px-4 py-1.5">
          {t('marketing.magazine.eyebrow')}
        </Eyebrow>
        <DisplayTitle as="h1" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.title')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl">
          {t('marketing.magazine.body')}
        </Prose>
      </Section>

      <Section id="why" tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.whyEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.whyHeading')}
        </DisplayTitle>
        <Prose size="lg" className="mt-4 max-w-2xl">
          {pickLocalized(HAIR_LOSS_SCIENCE, cl)}
        </Prose>
      </Section>

      <Section tone="cream" width="content">
        <DisplayTitle as="h2" step="lg" className="max-w-2xl">
          {t('marketing.magazine.timelineHeading')}
        </DisplayTitle>
        <div className="mt-4 max-w-2xl">
          {timelineClaim.status === 'requires-review' ? (
            <PendingChip label={t('marketing.magazine.timelinePendingLabel')} />
          ) : (
            <Prose size="lg">{timelineClaim.text}</Prose>
          )}
        </div>
      </Section>

      <Section id="ingredients" tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.ingredientsEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.ingredientsHeading')}
        </DisplayTitle>
        <div className="mt-10 flex flex-col gap-12">
          {CATEGORY_ORDER.map((cat) => {
            const ingredients = byCategory(cat);
            if (ingredients.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="font-display text-lg text-foreground">{t(CATEGORY_LABEL_KEY[cat])}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ingredients.map((ing) => {
                    const explanation = INGREDIENT_EXPLANATIONS[ing.name];
                    const note = explanation ? pickLocalized(explanation, cl) : pickLocalized(ing.note, cl);
                    return (
                      <IngredientCard
                        key={ing.name}
                        name={ing.name}
                        note={note}
                        status={ing.claimStatus}
                        statusLabel={statusLabel[ing.claimStatus]}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.formatsEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.formatsHeading')}
        </DisplayTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(FORMAT_EXPLANATIONS) as Array<keyof typeof FORMAT_EXPLANATIONS>).map((format) => (
            <div key={format} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
              <p className="font-display text-md text-foreground">{t(FORMAT_LABEL_KEY[format])}</p>
              <Prose className="mt-1">{pickLocalized(FORMAT_EXPLANATIONS[format], cl)}</Prose>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream" width="content">
        <Eyebrow>{t('marketing.magazine.productsEyebrow')}</Eyebrow>
        <DisplayTitle as="h2" step="lg" className="mt-2 max-w-2xl">
          {t('marketing.magazine.productsHeading')}
        </DisplayTitle>
        {/* Reuses each product's own already-approved shortDescription as the
            teaser, rather than drafting new copy that could drift from /products. */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              to={withLocale(PATHS.product(p.slug))}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 transition-colors hover:border-deep-700"
            >
              <p className="font-display text-md text-foreground">{p.name}</p>
              <Prose className="mt-1">{pickLocalized(p.shortDescription, cl)}</Prose>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="teal" width="readable" className="border-b border-accent text-center">
        <DisplayTitle as="h2" step="lg" align="center">
          {t('marketing.magazine.ctaHeading')}
        </DisplayTitle>
        <div className="mt-6 flex justify-center">
          <Button to={EXTERNAL_ASSESSMENT_URL} external size="lg" caps>
            {t('marketing.nav.cta')}
          </Button>
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 3: Manually verify no TypeScript errors from unused imports**

`Magazine.tsx` no longer imports `PagePlaceholder` — confirm the import line for it is gone (it was in
the file this replaces). Confirm `MessageKey` import path matches other marketing pages
(`@/i18n/messages`, as used in `HowItWorks.tsx`).

- [ ] **Step 4: Commit**

```bash
git add src/app/routes/marketing/Magazine.tsx src/i18n/messages/en.ts src/i18n/messages/he.ts
git commit -m "feat: build the real Magazine page"
```

---

### Task 6: Wire `/science`'s `onReadMore` to the Magazine

**Files:**
- Modify: `src/app/routes/marketing/Science.tsx`

**Interfaces:**
- Consumes: `IngredientCard`'s existing `onReadMore?: () => void` prop (already defined in
  `src/app/components/roote/DomainCards.tsx` — not modified by this task). `PATHS.magazine` from
  `@/app/paths`.

- [ ] **Step 1: Add the navigation imports**

In `src/app/routes/marketing/Science.tsx`, change:

```tsx
import { useT, useContentLocale } from '@/i18n/LocaleProvider';
```

to:

```tsx
import { useNavigate } from 'react-router';
import { useT, useContentLocale, useLocalizedPath } from '@/i18n/LocaleProvider';
```

And change the existing `@/app/paths` import line:

```tsx
import { EXTERNAL_ASSESSMENT_URL } from '@/app/paths';
```

to:

```tsx
import { EXTERNAL_ASSESSMENT_URL, PATHS } from '@/app/paths';
```

- [ ] **Step 2: Add the navigate/withLocale hooks inside `Science()`**

Change:

```tsx
export function Science() {
  const t = useT();
  const cl = useContentLocale();
```

to:

```tsx
export function Science() {
  const t = useT();
  const cl = useContentLocale();
  const navigate = useNavigate();
  const withLocale = useLocalizedPath();
```

- [ ] **Step 3: Pass `onReadMore` to the `IngredientCard`**

Change:

```tsx
                    <IngredientCard
                      key={ing.name}
                      name={ing.name}
                      note={pickLocalized(ing.note, cl)}
                      status={ing.claimStatus}
                      statusLabel={statusLabel[ing.claimStatus]}
                      readMoreLabel={t('marketing.sci.readMore')}
                    />
```

to:

```tsx
                    <IngredientCard
                      key={ing.name}
                      name={ing.name}
                      note={pickLocalized(ing.note, cl)}
                      status={ing.claimStatus}
                      statusLabel={statusLabel[ing.claimStatus]}
                      readMoreLabel={t('marketing.sci.readMore')}
                      onReadMore={() => navigate(`${withLocale(PATHS.magazine)}#ingredients`)}
                    />
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 5: Commit**

```bash
git add src/app/routes/marketing/Science.tsx
git commit -m "feat: wire /science's Read more to the Magazine ingredient library"
```

---

### Task 7: Test coverage

**Files:**
- Modify: `src/content/content.test.ts`
- Create: `src/app/routes/marketing/Magazine.test.tsx`
- Modify: `src/app/routes/marketing/Science.test.tsx` if it exists — check first with a file search; if
  it doesn't exist, add the `onReadMore` navigation assertion to
  `src/app/routes/marketing/wp4pages.test.tsx` instead (matching where other cross-page marketing
  assertions already live in this repo).

**Interfaces:**
- Consumes: `HAIR_LOSS_SCIENCE`, `RESULTS_TIMELINE_CLAIM`, `INGREDIENT_EXPLANATIONS`,
  `FORMAT_EXPLANATIONS` from `@/content/magazine` (Tasks 1-3). `marketingRoutes` from
  `./marketingRoutes` (existing).

- [ ] **Step 1: Extend `content.test.ts`'s forbidden-claims coverage to `magazine.ts`**

In `src/content/content.test.ts`, add to the imports at the top:

```typescript
import {
  HAIR_LOSS_SCIENCE,
  RESULTS_TIMELINE_CLAIM,
  dedupedIngredients,
  INGREDIENT_EXPLANATIONS,
  FORMAT_EXPLANATIONS,
} from './magazine';
```

Add a new `describe` block (this repo-wide check belongs alongside the other content describes, not
duplicated inside `magazine.test.ts`'s own file-local tests from Tasks 1-3):

```typescript
describe('magazine (content hub, /magazine)', () => {
  it('carries no forbidden marketing claim anywhere in its copy', () => {
    const all = [
      HAIR_LOSS_SCIENCE,
      RESULTS_TIMELINE_CLAIM.en.text,
      RESULTS_TIMELINE_CLAIM.he.text,
      ...Object.values(INGREDIENT_EXPLANATIONS),
      ...Object.values(FORMAT_EXPLANATIONS),
    ];
    for (const node of all) {
      for (const s of localizedStrings(node)) {
        expect(containsForbiddenClaim(s), `"${s}"`).toBe(false);
      }
    }
  });

  it('never writes new copy for a supplier-proprietary ingredient (those stay requires-review/[PENDING])', () => {
    const proprietary = dedupedIngredients().filter((i) => i.claimStatus === 'requires-review');
    expect(proprietary.map((i) => i.name).sort()).toEqual(
      ['Capixyl™', 'Darkenyl™', 'Greyverse™', 'Procapil®'].sort(),
    );
    for (const ing of proprietary) {
      expect(INGREDIENT_EXPLANATIONS[ing.name], ing.name).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it passes (content already exists from Tasks 1-3)**

Run: `pnpm vitest run src/content/content.test.ts`
Expected: PASS (all tests, including the 2 new ones)

- [ ] **Step 3: Write the Magazine page integration test**

Create `src/app/routes/marketing/Magazine.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { CartProvider } from '@/store/cart';
import { marketingRoutes } from './marketingRoutes';

function renderAt(path: string, locale: 'en' | 'he' = 'en') {
  const localeRegion = locale === 'he' ? 'he-il' : 'en-us';
  const router = createMemoryRouter(
    [
      {
        element: (
          <LocaleProvider localeRegion={localeRegion}>
            <CartProvider>
              <Outlet />
            </CartProvider>
          </LocaleProvider>
        ),
        children: [marketingRoutes],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
}

describe('Magazine (/magazine)', () => {
  it('renders every section heading', () => {
    renderAt('/magazine');
    expect(screen.getByRole('heading', { level: 1, name: "Understand what's actually in your routine." })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why hair loss happens' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How results typically develop' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The ingredient library' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Why treatments come in different forms' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Every ROOTÉ treatment' })).toBeInTheDocument();
  });

  it('renders a supplier-proprietary ingredient as [PENDING], not plain copy', () => {
    renderAt('/magazine');
    expect(screen.getByText('[PENDING: Procapil® — claim]')).toBeInTheDocument();
  });

  it('renders a non-proprietary ingredient with real copy, not [PENDING]', () => {
    renderAt('/magazine');
    expect(screen.getByText(/Minoxidil is a long-studied topical ingredient/)).toBeInTheDocument();
    expect(screen.queryByText('[PENDING: Minoxidil — claim]')).not.toBeInTheDocument();
  });

  it('renders the results-timeline note as [PENDING]', () => {
    renderAt('/magazine');
    expect(screen.getByText('[PENDING: results timeline]')).toBeInTheDocument();
  });

  it('links every one of the 6 real products to its own /products/:slug page', () => {
    renderAt('/magazine');
    for (const [name, slug] of [
      ['ROOTÉ Level 6', 'density-6'],
      ['ROOTÉ Level 10', 'density-10'],
      ['ROOTÉ Level 15', 'density-15'],
      ['ROOTÉ Gray Serum', 'gray-serum'],
      ['ROOTÉ Gray Support', 'gray-support'],
      ['ROOTÉ Regrowth Shampoo', 'regrowth-shampoo'],
    ] as const) {
      const link = screen.getByText(name).closest('a');
      expect(link, name).toHaveAttribute('href', `/en-us/products/${slug}`);
    }
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/routes/marketing/Magazine.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Add the `onReadMore` navigation test**

Check whether `src/app/routes/marketing/Science.test.tsx` exists:

Run: `ls src/app/routes/marketing/Science.test.tsx`

If it exists, add this test inside its existing `describe` block (matching its existing `renderAt`/render
helper — read the file first to match its exact helper name). If it does NOT exist, add this test to
`src/app/routes/marketing/wp4pages.test.tsx` inside the existing `describe('WP4 marketing pages', ...)`
block instead, using that file's existing `renderAt` helper:

```tsx
  it('Science: "Read more" on an ingredient card navigates to the Magazine', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderAt('/science');
    const readMoreButtons = screen.getAllByRole('button', { name: 'Read more' });
    await user.click(readMoreButtons[0]);
    expect(await screen.findByRole('heading', { level: 1, name: "Understand what's actually in your routine." })).toBeInTheDocument();
  });
```

- [ ] **Step 6: Run the full file the test was added to**

Run: `pnpm vitest run <path from Step 5>`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/content/content.test.ts src/app/routes/marketing/Magazine.test.tsx src/app/routes/marketing/wp4pages.test.tsx src/app/routes/marketing/Science.test.tsx
git commit -m "test: cover the Magazine page and the /science Read-more wiring"
```

(Adjust the `git add` file list to match whichever file Step 5 actually touched.)

---

### Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full typecheck**

Run: `pnpm typecheck`
Expected: 0 diagnostics

- [ ] **Step 2: Run the full test suite**

Run: `pnpm test`
Expected: All test files pass, 0 failures. (Baseline going into this feature was 68 files / 405 tests;
expect roughly 68 + 2 new files, and roughly 405 + ~24 new tests — confirm the actual final numbers in
the run output rather than asserting an exact count here, since intermediate tasks may have landed a
slightly different split.)

- [ ] **Step 3: Manually verify in the browser (both locales)**

Start the dev server if not already running (`pnpm dev`), then visit `/en-us/magazine` and
`/he-il/magazine`:
- Every section renders, RTL is correct in Hebrew (text alignment, not just translated strings).
- The ingredient library shows 4 category groups, each with cards; Procapil®/Greyverse™/Darkenyl™/
  Capixyl™ show `[PENDING: <name> — claim]`; every other ingredient shows real body copy.
- The timeline section shows `[PENDING: results timeline]`.
- Each of the 6 product cards links to its real `/products/:slug` page and that page loads.
- Visit `/en-us/science`, click "Read more" on any ingredient card, confirm it navigates to
  `/en-us/magazine` and lands with the ingredients section visible.
- Click the "Magazine" tab in the header nav (already wired from the earlier header-nav task) and
  confirm it now lands on this real page instead of the old "coming soon" placeholder.

- [ ] **Step 4: Report status**

No commit in this task — Task 7's commit was the last code change. This step is a verification-only
checkpoint before considering the feature done.
