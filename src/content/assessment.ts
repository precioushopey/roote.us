import { L, type LocalizedText } from './localized';

/**
 * Free Hair Analysis flow config (brief §12). One question per screen, a clear
 * progress indicator, strong back navigation. The thinning question set keeps
 * the existing `Answers` vocabulary so `deriveAnalysis` is unchanged; the gray
 * branch is additive and gets its own light pattern model in WP5.
 */

export type AssessmentStepId =
  | 'intro'
  | 'gender'
  | 'concern'
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
  { id: 'concern', path: 'concern', label: L('Concern', 'העניין'), onRail: true },
  { id: 'photos', path: 'photos', label: L('Scan', 'סריקה'), onRail: true },
  { id: 'scanning', path: 'scanning', label: L('Analysis', 'ניתוח'), onRail: true },
  { id: 'questions', path: 'questions', label: L('Questions', 'שאלות'), onRail: true },
  { id: 'results', path: 'results', label: L('Result', 'תוצאה'), onRail: true },
  { id: 'report', path: 'report', label: L('Report', 'דוח'), onRail: false },
];

/* --- step 2: gender (packaging personalization only, brief §12; PO #24) ---
   Gender is not required to use the assessment. "Prefer not to say" then asks
   for a packaging preference instead. The treatment recommendation never depends
   solely on gender / packaging. */
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

/* --- step 3: primary concern (brief §11 §3, §12) ---------------------- */
export type ConcernValue = 'thinning' | 'gray' | 'both';

export const CONCERN_OPTIONS: Array<{
  value: ConcernValue;
  title: LocalizedText;
  description: LocalizedText;
}> = [
  {
    value: 'thinning',
    title: L('Hair thinning', 'שיער דליל'),
    description: L('Visible density loss, hairline changes, crown thinning.', 'ירידה בצפיפות, שינויים בקו השיער, דלילות בקודקוד.'),
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
  options: Array<{ value: string; label: LocalizedText }>;
};

/**
 * Thinning branch — mirrors `src/app/components/diagnosis/questions.ts` values
 * so `deriveAnalysis` consumes them unchanged. Labels are inline here; the
 * existing screen still uses i18n keys until WP5 consolidates.
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
    id: 'q2_onset',
    prompt: L('When did you first notice the change?', 'מתי הבחנת בשינוי לראשונה?'),
    options: [
      { value: 'lt-1y', label: L('Less than 1 year ago', 'לפני פחות משנה') },
      { value: '1-5y', label: L('1–5 years ago', 'לפני 1–5 שנים') },
      { value: 'gt-5y', label: L('More than 5 years ago', 'לפני יותר מ-5 שנים') },
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
    id: 'q5_goal',
    prompt: L('What is your main goal?', 'מה המטרה העיקרית שלך?'),
    options: [
      { value: 'stop', label: L('Reduce hair loss', 'להפחית נשירה') },
      { value: 'regrow', label: L('Improve visible density', 'לשפר צפיפות נראית') },
      { value: 'both', label: L('Both', 'שניהם') },
    ],
  },
];

/** Gray branch — new; own vocabulary, own light pattern model (WP5). */
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
  {
    id: 'g5_goal',
    prompt: L('What is your main goal?', 'מה המטרה העיקרית שלך?'),
    options: [
      { value: 'slow-gray', label: L('Slow further graying', 'להאט את ההאפרה') },
      { value: 'appearance', label: L('Support pigmented-hair appearance', 'לתמוך במראה השיער עם הפיגמנט') },
      { value: 'both', label: L('Both', 'שניהם') },
    ],
  },
];

export function questionsForConcern(concern: ConcernValue): AssessmentQuestion[] {
  if (concern === 'gray') return GRAY_QUESTIONS;
  if (concern === 'both') return [...THINNING_QUESTIONS, GRAY_QUESTIONS[0], GRAY_QUESTIONS[4]];
  return THINNING_QUESTIONS;
}
