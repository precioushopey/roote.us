import { L, type LocalizedText } from './localized';

/**
 * Brand positioning (brief §2, §5). Sells a process and a solution — Analyze →
 * Understand → Personalize → Treat → Track — never "a quiz that sells shampoo".
 * Copy strings the brief pins verbatim live here; longer page copy lives in the
 * i18n dictionaries per surface.
 */

export const brand = {
  name: 'ROOTÉ',
  domain: 'ROOTÉ.US',
  descriptor: L('Personalized Hair Growth System', 'מערכת אישית לצמיחת שיער'),
  promise: L(
    'A personalized hair system that starts with understanding your condition and stays with you from your first scan to your final result.',
    'מערכת שיער אישית שמתחילה בהבנת המצב שלך ומלווה אותך מהסריקה הראשונה ועד לתוצאה הסופית.',
  ),
} as const;

/** Primary headline territory + supporting lines (brief §2). */
export const brandLines = {
  /** `*word*` marks a word/phrase to render in italic (see Hero's renderWithEmphasis) —
   *  left to each locale to place, since the emphasised word doesn't always land in
   *  the same position once translated. */
  headline: L('A hair growth system,\ncustomized for *you*.', 'מערכת לצמיחת שיער,\nמותאמת אישית *בשבילך*.'),
  secondary: L('From your first scan to your final result.', 'מהסריקה הראשונה ועד לתוצאה הסופית.'),
  supporting: [
    L('Understand your hair. Personalize your path.', 'להבין את השיער. להתאים את הדרך.'),
    L('Start at the root.', 'להתחיל מהשורש.'),
    L('Analyze. Treat. Track.', 'לנתח. לטפל. לעקוב.'),
    L('Built around your hair, not a generic routine.', 'בנוי סביב השיער שלך, לא שגרה גנרית.'),
  ] as LocalizedText[],
} as const;

/**
 * CTAs. Stored sentence-case; ALL-CAPS is a CSS `text-transform` on Latin
 * locales only (`.u-caps`), so Hebrew/Arabic render naturally.
 */
export const cta = {
  primary: L('Start free hair analysis', 'להתחלת אבחון שיער חינם'),
  secondary: L('See how it works', 'איך זה עובד'),
  continueAnalysis: L('Continue your analysis', 'להמשך האבחון'),
  startProgram: L('Start my program', 'להתחלת התוכנית שלי'),
} as const;

/**
 * The three-strand follicle mark. One motif, three readings — used to structure
 * the concern picker and the Analyze/Treat/Track rail (brief §5).
 */
export const threeStrand = {
  concept: L(
    'Three strands from one root: hair science, your three concern territories, and Analyze / Treat / Track.',
    'שלוש שערות משורש אחד: מדע השיער, שלושת תחומי העניין שלך, ולנתח / לטפל / לעקוב.',
  ),
  triad: [
    { key: 'analyze', label: L('Analyze', 'לנתח') },
    { key: 'treat', label: L('Treat', 'לטפל') },
    { key: 'track', label: L('Track', 'לעקוב') },
  ],
} as const;

/** The five-step system model (brief §1, §11 §4). A genuine sequence — the only
 *  place besides the progress timeline where numbered markers are used. */
export const systemSteps = [
  { n: 1, key: 'analyze', title: L('Analyze', 'ניתוח'), body: L('Complete a short assessment and a guided hair scan.', 'משלימים הערכה קצרה וסריקת שיער מודרכת.') },
  { n: 2, key: 'understand', title: L('Understand', 'הבנה'), body: L('Your hair profile organizes visible patterns and concerns.', 'פרופיל השיער שלך מארגן דפוסים ותחומי עניין נראים לעין.') },
  { n: 3, key: 'personalize', title: L('Personalize', 'התאמה'), body: L('A recommended program, built around your profile.', 'תוכנית מומלצת, שנבנית סביב הפרופיל שלך.') },
  { n: 4, key: 'treat', title: L('Treat', 'טיפול'), body: L('Follow a clear daily routine, built around your formula.', 'עוקבים אחר שגרה יומית ברורה, המותאמת לפורמולה שלך.') },
  { n: 5, key: 'track', title: L('Track', 'מעקב'), body: L('Compare progress from baseline scan to final scan.', 'משווים את ההתקדמות מהסריקה הראשונה ועד הסופית.') },
] as const;

export type SystemStep = (typeof systemSteps)[number];
