import { L, type LocalizedText } from './localized';
import { claim, type Claim } from './claims';
import { PRODUCTS, type Ingredient, type ProductFormat } from './products';

/**
 * Content for the "Magazine" hub (`/magazine`) — a single scrollable page, not a
 * per-ingredient wiki (2026-09-09 design decision, see docs/superpowers/specs/
 * 2026-09-09-magazine-content-section-design.md). Ingredient names, claim
 * statuses, and source types are owned by `products.ts` — this file only adds
 * longer explanatory copy on top, keyed by ingredient name; it never overrides
 * an ingredient's real status.
 *
 * Only `RESULTS_TIMELINE_CLAIM` below is wrapped in a `Claim` with its own
 * `ClaimStatus`/`sourceType`. `HAIR_LOSS_SCIENCE`, `INGREDIENT_EXPLANATIONS`,
 * and `FORMAT_EXPLANATIONS` are plain `LocalizedText` — general, non-brand-
 * specific, factual copy reviewed at write-time rather than gated at
 * render-time; `INGREDIENT_EXPLANATIONS` additionally never exists for a
 * proprietary ingredient, so those always fall through to the ingredient's
 * own real `requires-review` status and render [PENDING] via IngredientCard,
 * unchanged.
 */

export const HAIR_LOSS_SCIENCE: LocalizedText = L(
  "Pattern hair loss (androgenetic alopecia) is largely driven by genetics and hormones. In people with a genetic sensitivity, the hormone DHT (dihydrotestosterone) gradually shrinks (or \"miniaturizes\") hair follicles over repeated growth cycles. Each cycle, the affected hairs grow back finer, shorter, and lighter, until some follicles stop producing visible hair altogether. This process typically shows up first as a widening part, a receding hairline, or thinning at the crown, and tends to progress gradually rather than all at once. Gray hair is a separate, distinct process: it happens as pigment-producing cells in the follicle slow down or stop over time, unrelated to the DHT pathway.",
  'נשירת שיער תורשתית (אלופציה אנדרוגנטית) מונעת ברובה על ידי גנטיקה והורמונים. אצל אנשים עם רגישות גנטית, ההורמון DHT (דיהידרוטסטוסטרון) מכווץ בהדרגה (או "מצטמק") את זקיקי השיער לאורך מחזורי צמיחה חוזרים. בכל מחזור, השיער הנפגע צומח דק, קצר ובהיר יותר, עד שחלק מהזקיקים מפסיקים לייצר שיער נראה לעין לחלוטין. תהליך זה בדרך כלל מתבטא תחילה בהרחבת השבילה, בנסיגת קו השיער, או בדילול בקודקוד, ונוטה להתקדם בהדרגה ולא בבת אחת. שיער אפור הוא תהליך נפרד ושונה לחלוטין: הוא מתרחש כאשר תאי הפיגמנט בזקיק מאטים או מפסיקים לפעול עם הזמן, ואינו קשור למסלול ה-DHT.',
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
    "Finasteride works within the DHT pathway linked to pattern hair loss: it's designed to reduce the conversion of testosterone into DHT, the hormone associated with follicle miniaturization in genetically susceptible hair.",
    'פינסטריד פועל במסלול ה-DHT הקשור לנשירת שיער תורשתית: הוא מיועד להפחית את המרת הטסטוסטרון ל-DHT, ההורמון הקשור להצטמקות זקיקי השיער אצל בעלי רגישות גנטית.',
  ),
  'Azelaic Acid': L(
    "Azelaic acid is included here as a DHT-pathway support ingredient: it's referenced in the hair-care literature for a mild inhibitory effect on the same enzyme pathway finasteride targets, alongside its more established use as a skin-care active.",
    'חומצה אזלאית נכללת כאן כרכיב תמיכה במסלול ה-DHT: היא מוזכרת בספרות הטיפוח לתפקיד מתון בעיכוב אותו מסלול אנזימטי שפינסטריד פועל עליו, לצד השימוש המבוסס יותר שלה כרכיב טיפוח עור.',
  ),
  'Saw Palmetto': L(
    "Saw palmetto is a botanical extract commonly referenced in the DHT-pathway supplement category, alongside pharmaceutical actives like finasteride; its effect is considered milder and less established in the research.",
    'Saw Palmetto הוא תמצית צמחית המוזכרת לעיתים קרובות בקטגוריית התוספים למסלול ה-DHT, לצד רכיבים תרופתיים כמו פינסטריד; האפקט שלה נחשב מתון יותר ופחות מבוסס במחקר.',
  ),
  'Nettle Root': L(
    'Nettle root is a botanical often paired with saw palmetto in DHT-pathway supplement blends, referenced for a similar supporting role in the same category of hair-loss nutrition.',
    'שורש סרפד הוא רכיב צמחי המשולב לעיתים קרובות עם Saw Palmetto בתוספים למסלול ה-DHT, ומוזכר לתפקיד תומך דומה באותה קטגוריה של תזונה לנשירת שיער.',
  ),
  Caffeine: L(
    'Caffeine is a common scalp-serum and shampoo ingredient, studied in the hair-care literature for a stimulating effect on hair follicles when applied topically, distinct from its better-known effects when consumed.',
    'קפאין הוא רכיב נפוץ בסרומים ובשמפו לקרקפת, הנחקר בספרות הטיפוח לאפקט מגרה על זקיקי השיער בעת מריחה מקומית, בשונה מהאפקטים המוכרים יותר שלו בצריכה.',
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
    'Fo-Ti (He Shou Wu) is a botanical with a long history in traditional use for hair and, informally, for supporting natural hair color; it appears in both our anti-gray serum and supplement for that traditional association.',
    'Fo-Ti (הא שואו וו) הוא רכיב צמחי בעל היסטוריה ארוכה בשימוש מסורתי לשיער, ובאופן לא רשמי לתמיכה בצבע השיער הטבעי, הוא מופיע הן בסרום והן בתוסף שלנו לשיער אפור בשל אותו קשר מסורתי.',
  ),
  Biotin: L(
    'Biotin is a B-vitamin commonly included in hair and nail supplements; it plays a role in normal keratin production, though supplementation mainly helps where an existing deficiency is present.',
    'ביוטין הוא ויטמין מקבוצת B הנכלל לעיתים קרובות בתוספים לשיער וציפורניים; הוא ממלא תפקיד בייצור קרטין תקין, אם כי נטילת תוסף עוזרת בעיקר כאשר קיים מחסור קיים.',
  ),
  Catalase: L(
    'Catalase is an enzyme referenced in the anti-gray supplement category: the theory ties it to breaking down hydrogen peroxide that can otherwise build up in the hair follicle and interfere with natural pigment.',
    'קטלאז הוא אנזים המוזכר בקטגוריית התוספים לשיער אפור: התיאוריה מקשרת אותו לפירוק מי חמצן שעלולים להצטבר בזקיק השיער ולפגוע בפיגמנט הטבעי.',
  ),
  'L-Tyrosine': L(
    "L-Tyrosine is an amino acid involved in the body's pigment-production pathway, as a precursor in melanin synthesis; it's included here for that nutritional role.",
    'L-Tyrosine היא חומצת אמינו המעורבת במסלול ייצור הפיגמנט בגוף, כחומר מוצא בסינתזת מלנין, היא נכללת כאן בשל תפקיד תזונתי זה.',
  ),
  PABA: L(
    "PABA (para-aminobenzoic acid) is a compound included in some hair supplements, informally associated with pigment support; its role here is nutritional, not medicinal.",
    'PABA (חומצה פארא-אמינובנזואית) היא תרכובת הנכללת בחלק מתוספי השיער, ומקושרת באופן לא רשמי לתמיכה בפיגמנט; תפקידה כאן הוא תזונתי, לא רפואי.',
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

/** One explainer per real product format — general delivery-method info, not a
 *  brand-specific or efficacy claim. */
export const FORMAT_EXPLANATIONS: Record<ProductFormat, LocalizedText> = {
  'topical-solution': L(
    'Applied directly to the scalp so active ingredients reach the follicles directly: the format our Density line uses for its core actives.',
    'נמרחות ישירות על הקרקפת כדי שהרכיבים הפעילים יגיעו ישירות לזקיקים: הפורמט שקו Density שלנו משתמש בו עבור הרכיבים הפעילים המרכזיים.',
  ),
  'capsule-supplement': L(
    'Taken daily with food, delivering vitamins, minerals, and botanical extracts through the digestive system to complement a topical routine.',
    'נלקחות מדי יום עם אוכל, ומספקות ויטמינים, מינרלים ותמציות צמחיות דרך מערכת העיכול, כהשלמה לשגרה מקומית.',
  ),
  serum: L(
    'Lightweight, leave-in formulas applied once daily and left on the scalp longer than a rinse-off product: how non-prescription cosmetic actives are typically delivered.',
    'תכשירים קלים ושאינם נשטפים, הנמרחים פעם ביום ונשארים על הקרקפת זמן ארוך יותר ממוצר נשטף: כך בדרך כלל מועברים רכיבים קוסמטיים ללא מרשם.',
  ),
  shampoo: L(
    'A daily cleanse used in place of your regular shampoo: clears buildup and delivers conditioning actives with each wash.',
    'ניקוי יומי במקום השמפו הרגיל: מנקה הצטברות ומעביר רכיבי הזנה בכל שטיפה.',
  ),
};
