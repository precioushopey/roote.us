import { L, type LocalizedText } from './localized';

/**
 * Free Hair Analysis flow config (brief §12), realigned 2026-09-07 to the
 * client-confirmed Hair Goal taxonomy (Ilay/Marwell thread). One question per
 * screen, a clear progress indicator, strong back navigation. The Hair-Growth-
 * style question set keeps the existing `Answers` vocabulary so `deriveAnalysis`
 * is unchanged; the gray branch is additive and gets its own light pattern model.
 */

export type AssessmentStepId =
  | 'intro'
  | 'gender'
  | 'goal'
  | 'photos'
  | 'scanning'
  | 'questions'
  | 'results'
  | 'report';

export type AssessmentStep = {
  id: AssessmentStepId;
  path: string; // relative to /analysis
  /** short label for the progress rail */
  label: LocalizedText;
  /** does this step count toward the visible progress rail? */
  onRail: boolean;
};

export const ASSESSMENT_STEPS: AssessmentStep[] = [
  { id: 'intro', path: '', label: L('Start', 'התחלה'), onRail: false },
  { id: 'gender', path: 'gender', label: L('You', 'את/ה'), onRail: true },
  { id: 'goal', path: 'goal', label: L('Goal', 'מטרה'), onRail: true },
  { id: 'photos', path: 'photos', label: L('Scan', 'סריקה'), onRail: true },
  { id: 'scanning', path: 'scanning', label: L('Analysis', 'ניתוח'), onRail: true },
  { id: 'questions', path: 'questions', label: L('Questions', 'שאלות'), onRail: true },
  { id: 'results', path: 'results', label: L('Result', 'תוצאה'), onRail: true },
  { id: 'report', path: 'report', label: L('Report', 'דוח'), onRail: false },
];

/* --- step 2: gender (packaging personalization only, brief §12; PO #24) ---
   Gender is not required to use the assessment. "Prefer not to say" then asks
   for a packaging preference instead. The treatment recommendation never depends
   solely on gender / packaging — except the client-confirmed Hair Growth
   strength table, which needs a known male/female pattern set (client rule 4:
   Gender="Other"/unspecified + Hair Goal=Hair Growth → REQUIRES_REVIEW, never an
   automatic M1-M5/F1-F4 assignment — see `domain/recommendation/rules.ts`). */
export const GENDER_OPTIONS: Array<{
  value: 'male' | 'female' | 'unspecified';
  label: LocalizedText;
  packaging: 'men' | 'women' | null;
}> = [
  { value: 'male', label: L('Male', 'זכר'), packaging: 'men' },
  { value: 'female', label: L('Female', 'נקבה'), packaging: 'women' },
  { value: 'unspecified', label: L('Prefer not to say', 'מעדיף/ה שלא לומר'), packaging: null },
];

/** Shown only after "Prefer not to say" — packaging is a look, not a treatment input. */
export const PACKAGING_OPTIONS: Array<{ value: 'men' | 'women'; label: LocalizedText }> = [
  { value: 'men', label: L('Dark teal', 'טורקיז כהה') },
  { value: 'women', label: L('Cream', 'שמנת') },
];

/* --- step 3: Hair Goal (client-confirmed 2026-09-07) ------------------
   Single-select — the client's spec has no combined option. Drives which
   product family `domain/recommendation/recommend()` considers. */
import type { HairGoal } from '@/domain/analysis/types';

export type { HairGoal };

export const HAIR_GOAL_OPTIONS: Array<{
  value: HairGoal;
  title: LocalizedText;
  description: LocalizedText;
}> = [
  {
    value: 'thicker-fuller',
    title: L('Thicker, fuller hair', 'שיער סמיך ומלא יותר'),
    description: L('Improve visible density and fullness.', 'שיפור צפיפות ומלאות נראית לעין.'),
  },
  {
    value: 'slow-graying',
    title: L('Slow hair graying', 'האטת הזדקנות השיער'),
    description: L('Support color and slow further graying.', 'תמיכה בצבע והאטת האפרה נוספת.'),
  },
  {
    value: 'stop-loss',
    title: L('Stop hair loss', 'עצירת נשירת שיער'),
    description: L('Reduce ongoing shedding.', 'הפחתת נשירה מתמשכת.'),
  },
  {
    value: 'hair-growth',
    title: L('Hair growth treatment', 'טיפול לצמיחת שיער'),
    description: L('A stronger, pattern-based regrowth approach.', 'גישה חזקה יותר לצמיחה מחדש, בהתאם לדפוס האישי.'),
  },
  {
    value: 'other',
    title: L('Something else', 'משהו אחר'),
    description: L('Not sure yet, or a different goal; we’ll still run your analysis.', 'עוד לא בטוח/ה, או מטרה אחרת, עדיין נבצע את הניתוח עבורך.'),
  },
];

/**
 * Marketing-only teaser taxonomy (Home page "what's your concern" cards +
 * footer solution links) — intentionally coarser than the funnel's Hair Goal
 * question and decoupled from it. The `?concern=` query string on these links
 * is decorative only; nothing in the funnel reads it, so this can stay a
 * simple 3-way split without tracking the 5-option Hair Goal taxonomy above.
 */
export type ConcernValue = 'thinning' | 'gray' | 'both';

export const CONCERN_OPTIONS: Array<{
  value: ConcernValue;
  title: LocalizedText;
  description: LocalizedText;
}> = [
  {
    value: 'thinning',
    title: L('Hair thinning', 'שיער דליל'),
    description: L('Density loss, hairline changes, crown thinning.', 'ירידה בצפיפות, שינויים בקו השיער, דלילות בקודקוד.'),
  },
  {
    value: 'gray',
    title: L('Gray hair', 'שיער אפור'),
    description: L('Premature or increasing gray hair.', 'שיער אפור מוקדם או מתגבר.'),
  },
  {
    value: 'both',
    title: L('Both', 'שניהם'),
    description: L('Thinning and pigmentation concerns together.', 'דלילות ופיגמנט יחד.'),
  },
];

/* --- step 4: guided photos (brief §12 step 4) ------------------------- */
export type PhotoAngle = 'front' | 'top' | 'crown' | 'hairline';

export const PHOTO_ANGLES: Array<{
  angle: PhotoAngle;
  title: LocalizedText;
  instruction: LocalizedText;
}> = [
  { angle: 'front', title: L('Front', 'חזית'), instruction: L('Face the camera straight on, hair as you wear it day to day.', 'להביט ישירות למצלמה, עם השיער כרגיל.') },
  { angle: 'top', title: L('Top', 'מלמעלה'), instruction: L('Tilt your head down and photograph the top of your scalp.', 'להטות את הראש מטה ולצלם את חלקו העליון של הקרקפת.') },
  { angle: 'crown', title: L('Crown', 'קודקוד'), instruction: L('Photograph the back crown area, parting the hair if it helps.', 'לצלם את אזור הקודקוד האחורי, אפשר להפריד את השיער.') },
  { angle: 'hairline', title: L('Hairline', 'קו השיער'), instruction: L('Pull hair back from the forehead and photograph the hairline.', 'להרחיק שיער מהמצח ולצלם את קו השיער.') },
];

/* --- step 5: analysis state categories (brief §12 step 5) ------------ */
export const SCAN_CATEGORIES: LocalizedText[] = [
  L('Hair density', 'צפיפות שיער'),
  L('Visible thinning', 'דלילות נראית'),
  L('Hairline', 'קו השיער'),
  L('Loss area', 'אזור הנשירה'),
  L('Scalp condition', 'מצב הקרקפת'),
];

/* --- step 6: questions during analysis ------------------------------- */
export type AssessmentQuestion = {
  id: string;
  prompt: LocalizedText;
  /** Multi-select (checkboxes + explicit Continue) instead of the default
   *  single-select (radio, auto-advance). Only Health History uses this today. */
  multi?: boolean;
  options: Array<{ value: string; label: LocalizedText }>;
};

/**
 * Shared across every Hair-Goal branch except Slow Hair Graying (client
 * multi-select, None-exclusive — enforced in `sessionStore.setHealthHistory`,
 * not just here, so the invariant holds regardless of click order).
 */
export const HEALTH_HISTORY_QUESTION: AssessmentQuestion = {
  id: 'health_history',
  multi: true,
  prompt: L(
    'Do any of the following apply to you? Select all that apply.',
    'האם משהו מהבאים רלוונטי עבורך? ניתן לבחור יותר מאפשרות אחת.',
  ),
  options: [
    { value: 'thyroid', label: L('Thyroid dysfunction', 'תפקוד לקוי של בלוטת התריס') },
    { value: 'anemia', label: L('Anemia', 'אנמיה') },
    { value: 'autoimmune', label: L('Autoimmune disease', 'מחלה אוטואימונית') },
    { value: 'cancer', label: L('Cancer', 'סרטן') },
    { value: 'glp1', label: L('Currently on GLP-1 medication', 'נוטל/ת כיום תרופת GLP-1') },
    { value: 'none', label: L('None of the above', 'אף אחת מהאפשרויות') },
  ],
};

/**
 * Hair-loss/thinning branch — used by Thicker/Fuller Hair, Stop Hair Loss, Hair
 * Growth, and Other (the client's spec keeps "Other" on the safe, generic path
 * rather than skipping the questionnaire). Mirrors `deriveAnalysis`'s `Answers`
 * vocabulary; Q12/Q13 wording below is verbatim from the client's confirmation.
 */
export const THINNING_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q1_area',
    prompt: L('Where are you experiencing hair loss?', 'היכן חלה נשירת השיער?'),
    options: [
      { value: 'hairline', label: L('Hairline', 'קו השיער') },
      { value: 'crown', label: L('Crown', 'קודקוד') },
      { value: 'entire-scalp', label: L('Entire scalp', 'כל הקרקפת') },
    ],
  },
  {
    // Client Q12, verbatim.
    id: 'q2_onset',
    prompt: L('How long have you been noticing hair loss or thinning?', 'כמה זמן את/ה שם/ה לב לנשירה או לדילול שיער?'),
    options: [
      { value: 'lt-6mo', label: L('Less than 6 months', 'פחות מ-6 חודשים') },
      { value: '6-12mo', label: L('6–12 months', '6–12 חודשים') },
      { value: '1-3y', label: L('1–3 years', '1–3 שנים') },
      { value: 'gt-3y', label: L('More than 3 years', 'יותר מ-3 שנים') },
    ],
  },
  {
    id: 'q3_prior',
    prompt: L('Have you used hair-loss treatments before?', 'האם השתמשת בטיפולים לנשירת שיער בעבר?'),
    options: [
      { value: 'never', label: L('Never', 'מעולם לא') },
      { value: 'no-success', label: L('Yes, without success', 'כן, ללא הצלחה') },
      { value: 'partial', label: L('Yes, with some improvement', 'כן, עם שיפור מסוים') },
    ],
  },
  {
    id: 'q4_family',
    prompt: L('Does hair loss run in your family?', 'האם נשירת שיער שכיחה במשפחתך?'),
    options: [
      { value: 'yes', label: L('Yes', 'כן') },
      { value: 'no', label: L('No', 'לא') },
      { value: 'not-sure', label: L('Not sure', 'לא בטוח/ה') },
    ],
  },
  {
    // Client Q13, verbatim. Routing/safety signal, not a diagnosis — see
    // `domain/recommendation/rules.ts` for the sudden/patchy/unsure handling.
    id: 'q13_progression',
    prompt: L('How would you describe the way your hair loss developed?', 'כיצד היית מתאר/ת את האופן שבו התפתחה נשירת השיער שלך?'),
    options: [
      { value: 'gradual', label: L('Gradually over time', 'בהדרגה עם הזמן') },
      { value: 'sudden', label: L('Suddenly / rapid shedding', 'בפתאומיות / נשירה מהירה') },
      { value: 'patchy', label: L('In specific patches', 'בכתמים ספציפיים') },
      { value: 'unsure', label: L('I’m not sure', 'לא בטוח/ה') },
    ],
  },
  HEALTH_HISTORY_QUESTION,
];

/** Gray branch (Slow Hair Graying goal) — own vocabulary, own light pattern model. */
export const GRAY_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'g1_onset',
    prompt: L('When did you first notice gray hair?', 'מתי הבחנת בשיער אפור לראשונה?'),
    options: [
      { value: 'lt-1y', label: L('Within the last year', 'בשנה האחרונה') },
      { value: '1-5y', label: L('1–5 years ago', 'לפני 1–5 שנים') },
      { value: 'gt-5y', label: L('More than 5 years ago', 'לפני יותר מ-5 שנים') },
    ],
  },
  {
    id: 'g2_area',
    prompt: L('Where is it most visible?', 'היכן זה בולט ביותר?'),
    options: [
      { value: 'temples', label: L('Temples', 'רקות') },
      { value: 'crown', label: L('Crown and top', 'קודקוד וחלק עליון') },
      { value: 'throughout', label: L('Throughout', 'בכל הראש') },
    ],
  },
  {
    id: 'g3_pace',
    prompt: L('How quickly has it progressed?', 'באיזו מהירות זה התקדם?'),
    options: [
      { value: 'slow', label: L('Slowly', 'לאט') },
      { value: 'steady', label: L('Steadily', 'בקצב קבוע') },
      { value: 'fast', label: L('Quickly', 'מהר') },
    ],
  },
  {
    id: 'g4_color',
    prompt: L('Do you currently color your hair?', 'האם את/ה צובע/ת את השיער כיום?'),
    options: [
      { value: 'no', label: L('No', 'לא') },
      { value: 'sometimes', label: L('Sometimes', 'לפעמים') },
      { value: 'regularly', label: L('Regularly', 'באופן קבוע') },
    ],
  },
  HEALTH_HISTORY_QUESTION,
];

export function questionsForHairGoal(goal: HairGoal): AssessmentQuestion[] {
  return goal === 'slow-graying' ? GRAY_QUESTIONS : THINNING_QUESTIONS;
}
