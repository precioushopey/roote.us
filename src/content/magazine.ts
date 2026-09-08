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
