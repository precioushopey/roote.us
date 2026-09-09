import { L, type LocalizedText } from './localized';
import type { ClaimStatus, ClaimSourceType } from './claims';

/**
 * The six launch SKUs (brief §8). This is *working product-content
 * architecture*: formula references and ingredient territories are paraphrased
 * from supplier / competitor material, never copied, and carry a claim status
 * so wording can be approved centrally. No efficacy, "clinically proven",
 * "FDA-approved", regrowth or gray-reversal language appears here (brief §9).
 *
 * Prices are matched to the named competitor product the client pointed at
 * for each SKU (client references, 2026-09-08: `ROOTÉ_Personal_design_
 * minoxidilmax.docx` + `6-product lineup.docx`) — the 1-unit/lowest tier
 * price of the linked product, in USD. Not invented: sourced per SKU below.
 * Until a SKU has a named reference, its price stays `null` → [PENDING]
 * (hard rule: never invent product content).
 *
 * The old "Color Restore Shampoo" is intentionally NOT a launch SKU — it is
 * kept as an archived concept in `ARCHIVED_CONCEPTS` only.
 */

export type ProductConcern = 'thinning' | 'gray' | 'thinning-support' | 'gray-support';

export type ProductFormat = 'topical-solution' | 'capsule-supplement' | 'shampoo' | 'serum';

/** Presentation theme after the gender step — dark emerald (men) / cream (women).
 *  Presentation only; never an input to treatment strength (brief §7). */
export const PACKAGING = { men: '#123726', women: '#EDE1CF' } as const;

export type Ingredient = {
  /** Proper noun — locale-invariant (Minoxidil, Greyverse™). */
  name: string;
  /** Short, non-efficacy purpose statement. */
  note: LocalizedText;
  claimStatus: ClaimStatus;
  sourceType: ClaimSourceType;
};

export type Product = {
  slug: string;
  /** Wordmark-style name — locale-invariant. */
  name: string;
  subtitle: LocalizedText;
  concern: ProductConcern;
  format: ProductFormat;
  /** e.g. "60 mL", "60 capsules". */
  size: string;
  /** One-line role in the system (brief §8). */
  role: LocalizedText;
  heroCopy: LocalizedText;
  shortDescription: LocalizedText;
  /**
   * Working formula reference. Shown publicly as ingredient *names* only while
   * `displayFormulaDetail` is false; the numeric reference is available to the
   * report after eligibility review.
   */
  formulaReference: LocalizedText | null;
  displayFormulaDetail: boolean;
  ingredients: Ingredient[];
  usage: LocalizedText;
  safety: LocalizedText;
  /** True → a clinician / pharmacy review step gates purchase + directions. */
  requiresMedicalReview: boolean;
  /** All SKUs ship in both packaging themes. */
  packagingThemed: boolean;
  relatedProducts: string[];
  /** What evidence ROOTÉ can actually show today. */
  evidenceStatus: 'none' | 'ingredient-literature' | 'pending';
  /** Status of the product's descriptive copy overall. */
  claimStatus: ClaimStatus;
  /** Price in the active currency — null renders as [PENDING]. */
  price: number | null;
};

const ING = (
  name: string,
  en: string,
  he: string,
  claimStatus: ClaimStatus = 'working',
  sourceType: ClaimSourceType = 'ingredient-literature',
): Ingredient => ({ name, note: L(en, he), claimStatus, sourceType });

export const PRODUCTS: Product[] = [
  {
    slug: 'density-6',
    name: 'ROOTÉ Level 6',
    // public-facing descriptor — PO #6 (2026-09-04)
    subtitle: L('Personalized Density Treatment', 'טיפול Density מותאם אישית'),
    concern: 'thinning',
    format: 'topical-solution',
    size: '60 mL (2 fl oz)',
    role: L('Entry / lower-strength Density program.', 'תוכנית Density בעוצמה נמוכה, לשלב הראשון.'),
    heroCopy: L(
      'A lower-strength topical to open a Density program where the assessment supports one.',
      'תרחיף בעוצמה נמוכה לפתיחת תוכנית Density, כאשר ההערכה תומכת בכך.',
    ),
    shortDescription: L(
      'Once- or twice-daily scalp topical. The starting point of the Density track.',
      'תרחיף לקרקפת, פעם או פעמיים ביום. נקודת ההתחלה של מסלול Density.',
    ),
    formulaReference: L('Working reference: 6% Minoxidil + 0.3% Finasteride.', 'התייחסות עבודה: 6% מינוקסידיל + 0.3% פינסטריד.'),
    displayFormulaDetail: false,
    ingredients: [
      ING('Minoxidil', 'A long-studied topical used in pattern hair loss.', 'רכיב מקומי נחקר בהתמדה, לנשירת שיער תורשתית.'),
      ING('Finasteride', 'A DHT-pathway ingredient, used topically here.', 'רכיב במסלול ה-DHT, בשימוש מקומי כאן.'),
    ],
    usage: L(
      'Apply to the scalp across the areas of concern, once or twice daily as directed at review.',
      'למרוח על הקרקפת באזורים הרלוונטיים, פעם או פעמיים ביום, לפי ההנחיה בבדיקה.',
    ),
    safety: L(
      'Prescription-strength topical. Eligibility and directions are confirmed at treatment review. Not for use in pregnancy or while breastfeeding.',
      'תרחיף בעוצמת מרשם. ההתאמה וההנחיות נקבעות בבדיקת הטיפול. אין להשתמש בהיריון או בהנקה.',
    ),
    requiresMedicalReview: true,
    packagingThemed: true,
    relatedProducts: ['density-10', 'regrowth-shampoo'],
    evidenceStatus: 'ingredient-literature',
    claimStatus: 'working',
    // Client-set price (2026-09-08), overriding the Essengen-6 Extra competitor match.
    price: 47,
  },
  {
    slug: 'density-10',
    name: 'ROOTÉ Level 10',
    subtitle: L('Advanced Density Treatment', 'טיפול Density מתקדם'),
    concern: 'thinning',
    format: 'topical-solution',
    size: '60 mL (2 fl oz)',
    role: L('Advanced Density program.', 'תוכנית Density מתקדמת.'),
    heroCopy: L(
      'A higher-concentration topical with added scalp-support actives for an advanced Density program.',
      'תרחיף בריכוז גבוה יותר עם רכיבי תמיכה לקרקפת, לתוכנית Density מתקדמת.',
    ),
    shortDescription: L(
      'Scalp topical with a broader support complex. The mid tier of the Density track.',
      'תרחיף לקרקפת עם קומפלקס תמיכה רחב יותר. השלב האמצעי במסלול Density.',
    ),
    formulaReference: L(
      'Working reference: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid.',
      'התייחסות עבודה: 10% מינוקסידיל + 0.1% פינסטריד + 5% חומצה אזלאית.',
    ),
    displayFormulaDetail: false,
    ingredients: [
      ING('Minoxidil', 'A long-studied topical used in pattern hair loss.', 'רכיב מקומי נחקר בהתמדה, לנשירת שיער תורשתית.'),
      ING('Finasteride', 'A DHT-pathway ingredient, used topically here.', 'רכיב במסלול ה-DHT, בשימוש מקומי כאן.'),
      ING('Azelaic Acid', 'Included as a DHT-pathway support ingredient.', 'רכיב תמיכה במסלול ה-DHT.'),
    ],
    usage: L(
      'Apply to the scalp across the areas of concern once or twice daily, as directed at review.',
      'למרוח על הקרקפת באזורים הרלוונטיים פעם או פעמיים ביום, לפי ההנחיה בבדיקה.',
    ),
    safety: L(
      'Prescription-strength topical. Eligibility and directions are confirmed at treatment review. Not for use in pregnancy or while breastfeeding.',
      'תרחיף בעוצמת מרשם. ההתאמה וההנחיות נקבעות בבדיקת הטיפול. אין להשתמש בהיריון או בהנקה.',
    ),
    requiresMedicalReview: true,
    packagingThemed: true,
    relatedProducts: ['density-6', 'density-15', 'regrowth-shampoo'],
    evidenceStatus: 'ingredient-literature',
    claimStatus: 'working',
    // Client-set price (2026-09-08), overriding the Dualgen-10 Plus competitor match.
    price: 50,
  },
  {
    slug: 'density-15',
    name: 'ROOTÉ Level 15',
    subtitle: L('Intensive Density Treatment', 'טיפול Density אינטנסיבי'),
    concern: 'thinning',
    format: 'topical-solution',
    size: '60 mL (2 fl oz)',
    role: L('Intensive / highest-strength Density concept.', 'קונספט Density בעוצמה הגבוהה ביותר.'),
    heroCopy: L(
      'The most concentrated Density concept. Considered only through a treatment review; never selected from a score.',
      'קונספט Density המרוכז ביותר. נשקל רק דרך בדיקת טיפול, לעולם לא נבחר לפי ניקוד.',
    ),
    shortDescription: L(
      'The highest-strength topical concept in the Density track. Clinician-gated.',
      'קונספט התרחיף בעוצמה הגבוהה ביותר במסלול Density. בכפוף לאישור רפואי.',
    ),
    formulaReference: L(
      'Working reference: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + Procapil®.',
      'התייחסות עבודה: 15% מינוקסידיל + 0.1% פינסטריד + 5% חומצה אזלאית + Procapil®.',
    ),
    displayFormulaDetail: false,
    ingredients: [
      ING('Minoxidil', 'A long-studied topical used in pattern hair loss.', 'רכיב מקומי נחקר בהתמדה, לנשירת שיער תורשתית.'),
      ING('Finasteride', 'A DHT-pathway ingredient, used topically here.', 'רכיב במסלול ה-DHT, בשימוש מקומי כאן.'),
      ING('Azelaic Acid', 'Included as a DHT-pathway support ingredient.', 'רכיב תמיכה במסלול ה-DHT.'),
      ING('Procapil®', 'A supplier active marketed for scalp microcirculation and follicle anchoring.', 'רכיב פעיל של ספק, המשווק לתמיכה במיקרו-מחזור בקרקפת ובעיגון הזקיק.', 'requires-review', 'supplier-reference'),
    ],
    usage: L(
      'Directions are set individually at treatment review; this concept is not self-selected.',
      'ההנחיות נקבעות אישית בבדיקת הטיפול; קונספט זה אינו נבחר עצמאית.',
    ),
    safety: L(
      'Intensive prescription-strength concept. Available only where a clinician review supports it. Not for use in pregnancy or while breastfeeding.',
      'קונספט אינטנסיבי בעוצמת מרשם. זמין רק כאשר בדיקת רופא תומכת בכך. אין להשתמש בהיריון או בהנקה.',
    ),
    requiresMedicalReview: true,
    packagingThemed: true,
    relatedProducts: ['density-10', 'regrowth-shampoo'],
    evidenceStatus: 'ingredient-literature',
    claimStatus: 'requires-review',
    // Matches DualGen-15 With PG Plus (15% Minoxidil + 0.1% Finasteride + Azelaic Acid, 1 unit / 2 oz), minoxidilmax.com.
    price: 53,
  },
  {
    slug: 'gray-serum',
    name: 'ROOTÉ Gray Serum',
    subtitle: L('Daily Pigment Support Serum', 'סרום יומי לתמיכה בפיגמנט'),
    concern: 'gray',
    format: 'serum',
    size: '50 mL',
    role: L('Topical half of the Gray system.', 'החצי המקומי של מערכת Gray.'),
    heroCopy: L(
      'A leave-in serum in the anti-gray topical category, to support the appearance and health of naturally pigmented hair.',
      'סרום ללא שטיפה בקטגוריית התכשירים לשיער אפור, לתמיכה במראה ובבריאות של שיער עם פיגמנט טבעי.',
    ),
    shortDescription: L('A daily leave-in serum. The topical half of the Gray system.', 'סרום יומי ללא שטיפה. החצי המקומי של מערכת Gray.'),
    formulaReference: null,
    displayFormulaDetail: true,
    ingredients: [
      ING('Greyverse™', 'A supplier active marketed for the anti-gray category.', 'רכיב פעיל של ספק, המשווק לקטגוריית השיער האפור.', 'requires-review', 'supplier-reference'),
      ING('Darkenyl™', 'A supplier active marketed for pigmentation support.', 'רכיב פעיל של ספק, המשווק לתמיכה בפיגמנט.', 'requires-review', 'supplier-reference'),
      ING('Capixyl™', 'A supplier peptide-based active used in scalp care.', 'רכיב פעיל מבוסס פפטידים של ספק, בשימוש בטיפוח קרקפת.', 'requires-review', 'supplier-reference'),
      ING('Green Tea', 'An antioxidant-rich botanical extract.', 'תמצית צמחית עשירה בנוגדי חמצון.'),
      ING('Fo-Ti', 'A botanical traditionally associated with hair.', 'צמח הנקשר באופן מסורתי לשיער.'),
      ING('Panthenol', 'Pro-vitamin B5, a common conditioning agent.', 'פרו-ויטמין B5, רכיב הזנה נפוץ.'),
      ING('Caffeine', 'A common scalp-serum ingredient.', 'רכיב נפוץ בסרומים לקרקפת.'),
      ING('Ginseng', 'A botanical used in scalp-care formulas.', 'צמח בשימוש בפורמולות לקרקפת.'),
    ],
    usage: L('Apply a few drops to the scalp daily and massage in. Do not rinse out.', 'למרוח מספר טיפות על הקרקפת מדי יום ולעסות. לא לשטוף.'),
    safety: L('For external use on the scalp only. Discontinue if irritation occurs.', 'לשימוש חיצוני על הקרקפת בלבד. יש להפסיק שימוש אם מופיע גירוי.'),
    requiresMedicalReview: false,
    packagingThemed: true,
    relatedProducts: ['gray-support'],
    evidenceStatus: 'none',
    claimStatus: 'working',
    // Matches Root Revival™ Advanced Anti-Gray Hair Serum (1 bottle), heyhair.co.
    price: 52,
  },
  {
    slug: 'gray-support',
    name: 'ROOTÉ Gray Support',
    subtitle: L('Daily Pigment Support', 'תמיכה יומית בפיגמנט'),
    concern: 'gray-support',
    format: 'capsule-supplement',
    size: '60 capsules',
    role: L('Inside-out nutritional support in the Gray system.', 'תמיכה תזונתית מבפנים במערכת Gray.'),
    heroCopy: L(
      'A daily capsule in the anti-gray nutritional-support category, for people focused on visible gray-hair management.',
      'קפסולה יומית בקטגוריית התמיכה התזונתית, למי שמתמקד בניהול שיער אפור נראה לעין.',
    ),
    shortDescription: L('One daily capsule. The inside half of the Gray system.', 'קפסולה אחת ביום. החצי הפנימי של מערכת Gray.'),
    formulaReference: null,
    displayFormulaDetail: true,
    ingredients: [
      ING('Biotin', 'A B-vitamin commonly included in hair supplements.', 'ויטמין B הנפוץ בתוספי שיער.'),
      ING('Catalase', 'An enzyme referenced in the anti-gray supplement category.', 'אנזים המוזכר בקטגוריית התוספים לשיער אפור.'),
      ING('Fo-Ti', 'A botanical traditionally associated with hair.', 'צמח הנקשר באופן מסורתי לשיער.'),
      ING('L-Tyrosine', 'An amino acid involved in pigment pathways.', 'חומצת אמינו המעורבת במסלולי פיגמנט.'),
      ING('Nettle Root', 'A botanical used in hair-support blends.', 'צמח בשימוש בתערובות תמיכה לשיער.'),
      ING('Saw Palmetto', 'A botanical referenced in hair-support supplements.', 'צמח המוזכר בתוספי תמיכה לשיער.'),
      ING('PABA', 'A compound included in some hair supplements.', 'תרכובת הנכללת בחלק מתוספי השיער.'),
      ING('Zinc', 'A mineral that contributes to normal hair.', 'מינרל התורם לשיער תקין.'),
    ],
    usage: L('Take one capsule daily with food, or as directed on the label.', 'ליטול קפסולה אחת ביום עם אוכל, או לפי ההנחיות על התווית.'),
    safety: L(
      'A food supplement, not a medicine. Do not exceed the stated dose. Speak to a doctor if you are pregnant, breastfeeding, or on medication.',
      'תוסף תזונה, לא תרופה. אין לחרוג מהמינון המצוין. יש להתייעץ עם רופא בהיריון, בהנקה או בנטילת תרופות.',
    ),
    requiresMedicalReview: false,
    packagingThemed: true,
    relatedProducts: ['gray-serum'],
    evidenceStatus: 'none',
    claimStatus: 'working',
    // Matches Gray Escape™ Advanced Anti-Gray Hair Growth Supplement (1 bottle), heyhair.co.
    price: 38,
  },
  {
    slug: 'regrowth-shampoo',
    name: 'ROOTÉ Regrowth Shampoo',
    subtitle: L('Scalp & Density Support Cleanser', 'תכשיר ניקוי לתמיכה בקרקפת וב-Density'),
    concern: 'thinning-support',
    format: 'shampoo',
    size: '200 mL',
    role: L('Daily cleanse layer in the Density system.', 'שכבת הניקוי היומית במערכת Density.'),
    heroCopy: L(
      'A scalp-focused shampoo for thinning hair, built to sit alongside a Density program.',
      'שמפו ממוקד קרקפת לשיער דליל, שנבנה ללוות תוכנית Density.',
    ),
    shortDescription: L('Use in place of your regular shampoo. The daily cleanse step.', 'להשתמש במקום השמפו הרגיל. שלב הניקוי היומי.'),
    formulaReference: null,
    displayFormulaDetail: true,
    ingredients: [
      ING('Biotin', 'A B-vitamin commonly included in hair care.', 'ויטמין B הנפוץ בטיפוח שיער.'),
      ING('Ginseng', 'A botanical used in scalp-care formulas.', 'צמח בשימוש בפורמולות לקרקפת.'),
      ING('Rosemary', 'A botanical extract used in scalp products.', 'תמצית צמחית בשימוש במוצרי קרקפת.'),
      ING('Nettle', 'A botanical used in hair-support blends.', 'צמח בשימוש בתערובות תמיכה לשיער.'),
      ING('Horsetail', 'A silica-bearing botanical used in hair care.', 'צמח עשיר בסיליקה בשימוש בטיפוח שיער.'),
      ING('Sage', 'An aromatic botanical used in scalp formulas.', 'צמח ארומטי בשימוש בפורמולות לקרקפת.'),
      ING('Jojoba', 'A plant oil used to condition hair and scalp.', 'שמן צמחי להזנת השיער והקרקפת.'),
      ING('Panthenol', 'Pro-vitamin B5, a common conditioning agent.', 'פרו-ויטמין B5, רכיב הזנה נפוץ.'),
    ],
    usage: L('Massage into a wet scalp, leave for a minute, then rinse. Use daily.', 'לעסות על קרקפת רטובה, להשאיר כדקה ולשטוף. לשימוש יומי.'),
    safety: L('For external use on the scalp and hair only. Avoid contact with the eyes.', 'לשימוש חיצוני על הקרקפת והשיער בלבד. יש להימנע ממגע עם העיניים.'),
    requiresMedicalReview: false,
    packagingThemed: true,
    relatedProducts: ['density-6', 'density-10'],
    evidenceStatus: 'none',
    claimStatus: 'working',
    // Matches ACTIVATE+ Advanced Anti-Thinning Hair Growth Shampoo (1 bottle), heyhair.co.
    price: 40,
  },
];

const BY_SLUG: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return BY_SLUG[slug];
}

export function productsForConcern(concern: 'thinning' | 'gray'): Product[] {
  return PRODUCTS.filter((p) =>
    concern === 'thinning'
      ? p.concern === 'thinning' || p.concern === 'thinning-support'
      : p.concern === 'gray' || p.concern === 'gray-support',
  );
}

/** Not a launch SKU — kept for reference only (brief §8). */
export const ARCHIVED_CONCEPTS = [
  { slug: 'color-restore-shampoo', name: 'Color Restore Shampoo', note: L('Archived concept, superseded by Gray Serum for the anti-gray topical role.', 'קונספט בארכיון, הוחלף בסרום Gray לתפקיד התכשיר המקומי לשיער אפור.') },
] as const;
