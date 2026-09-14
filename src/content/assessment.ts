import { L6, type LocalizedText } from './localized';

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
  { id: 'intro', path: '', label: L6({ en: 'Start', he: 'התחלה', ar: 'البداية', ru: 'Начало', fr: 'Début', es: 'Inicio' }), onRail: false },
  { id: 'gender', path: 'gender', label: L6({ en: 'You', he: 'את/ה', ar: 'أنت', ru: 'Вы', fr: 'Vous', es: 'Usted' }), onRail: true },
  { id: 'goal', path: 'goal', label: L6({ en: 'Goal', he: 'מטרה', ar: 'الهدف', ru: 'Цель', fr: 'Objectif', es: 'Objetivo' }), onRail: true },
  { id: 'photos', path: 'photos', label: L6({ en: 'Scan', he: 'סריקה', ar: 'المسح', ru: 'Сканирование', fr: 'Scan', es: 'Escaneo' }), onRail: true },
  { id: 'scanning', path: 'scanning', label: L6({ en: 'Analysis', he: 'ניתוח', ar: 'التحليل', ru: 'Анализ', fr: 'Analyse', es: 'Análisis' }), onRail: true },
  { id: 'questions', path: 'questions', label: L6({ en: 'Questions', he: 'שאלות', ar: 'أسئلة', ru: 'Вопросы', fr: 'Questions', es: 'Preguntas' }), onRail: true },
  { id: 'results', path: 'results', label: L6({ en: 'Result', he: 'תוצאה', ar: 'النتيجة', ru: 'Результат', fr: 'Résultat', es: 'Resultado' }), onRail: true },
  { id: 'report', path: 'report', label: L6({ en: 'Report', he: 'דוח', ar: 'التقرير', ru: 'Отчёт', fr: 'Rapport', es: 'Informe' }), onRail: false },
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
  { value: 'male', label: L6({ en: 'Male', he: 'זכר', ar: 'ذكر', ru: 'Мужской', fr: 'Homme', es: 'Hombre' }), packaging: 'men' },
  { value: 'female', label: L6({ en: 'Female', he: 'נקבה', ar: 'أنثى', ru: 'Женский', fr: 'Femme', es: 'Mujer' }), packaging: 'women' },
  {
    value: 'unspecified',
    label: L6({
      en: 'Prefer not to say',
      he: 'מעדיף/ה שלא לומר',
      ar: 'أفضّل عدم الإفصاح',
      ru: 'Предпочитаю не указывать',
      fr: 'Je préfère ne pas répondre',
      es: 'Prefiero no decirlo',
    }),
    packaging: null,
  },
];

/** Shown only after "Prefer not to say" — packaging is a look, not a treatment input. */
export const PACKAGING_OPTIONS: Array<{ value: 'men' | 'women'; label: LocalizedText }> = [
  {
    value: 'men',
    label: L6({ en: 'Dark teal', he: 'טורקיז כהה', ar: 'تركواز داكن', ru: 'Тёмно-бирюзовый', fr: 'Sarcelle foncé', es: 'Verde azulado oscuro' }),
  },
  { value: 'women', label: L6({ en: 'Cream', he: 'שמנת', ar: 'كريمي', ru: 'Кремовый', fr: 'Crème', es: 'Crema' }) },
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
    title: L6({
      en: 'Thicker, fuller hair',
      he: 'שיער סמיך ומלא יותר',
      ar: 'شعر أكثر كثافة وامتلاءً',
      ru: 'Более густые и плотные волосы',
      fr: 'Des cheveux plus épais et plus fournis',
      es: 'Cabello más grueso y abundante',
    }),
    description: L6({
      en: 'Improve visible density and fullness.',
      he: 'שיפור צפיפות ומלאות נראית לעין.',
      ar: 'تحسين الكثافة والامتلاء الظاهرين.',
      ru: 'Улучшить видимую густоту и объём.',
      fr: 'Améliorer la densité et la masse visibles.',
      es: 'Mejorar la densidad y el volumen visibles.',
    }),
  },
  {
    value: 'slow-graying',
    title: L6({
      en: 'Slow hair graying',
      he: 'האטת הזדקנות השיער',
      ar: 'إبطاء ظهور الشعر الرمادي',
      ru: 'Замедлить поседение волос',
      fr: 'Ralentir le grisonnement des cheveux',
      es: 'Retardar la aparición de canas',
    }),
    description: L6({
      en: 'Support color and slow further graying.',
      he: 'תמיכה בצבע והאטת האפרה נוספת.',
      ar: 'دعم اللون وإبطاء المزيد من ظهور الشعر الرمادي.',
      ru: 'Поддержать цвет и замедлить дальнейшее поседение.',
      fr: 'Soutenir la couleur et ralentir le grisonnement ultérieur.',
      es: 'Favorecer el color y retardar la aparición de más canas.',
    }),
  },
  {
    value: 'stop-loss',
    title: L6({
      en: 'Stop hair loss',
      he: 'עצירת נשירת שיער',
      ar: 'إيقاف تساقط الشعر',
      ru: 'Остановить выпадение волос',
      fr: 'Arrêter la chute des cheveux',
      es: 'Detener la caída del cabello',
    }),
    description: L6({
      en: 'Reduce ongoing shedding.',
      he: 'הפחתת נשירה מתמשכת.',
      ar: 'تقليل التساقط المستمر.',
      ru: 'Уменьшить продолжающееся выпадение.',
      fr: 'Réduire la chute continue.',
      es: 'Reducir la caída continua.',
    }),
  },
  {
    value: 'hair-growth',
    title: L6({
      en: 'Hair growth treatment',
      he: 'טיפול לצמיחת שיער',
      ar: 'علاج لإنبات الشعر',
      ru: 'Лечение для роста волос',
      fr: 'Traitement pour la pousse des cheveux',
      es: 'Tratamiento para el crecimiento del cabello',
    }),
    description: L6({
      en: 'A stronger, pattern-based regrowth approach.',
      he: 'גישה חזקה יותר לצמיחה מחדש, בהתאם לדפוס האישי.',
      ar: 'نهج أقوى لإعادة الإنبات يعتمد على نمط الصلع.',
      ru: 'Более интенсивный подход к восстановлению роста с учётом типа облысения.',
      fr: 'Une approche de repousse plus intensive, basée sur le type de calvitie.',
      es: 'Un enfoque de recrecimiento más intensivo, basado en el patrón de pérdida.',
    }),
  },
  {
    value: 'other',
    title: L6({ en: 'Something else', he: 'משהו אחר', ar: 'شيء آخر', ru: 'Что-то другое', fr: 'Autre chose', es: 'Otra cosa' }),
    description: L6({
      en: 'Not sure yet, or a different goal; we’ll still run your analysis.',
      he: 'עוד לא בטוח/ה, או מטרה אחרת, עדיין נבצע את הניתוח עבורך.',
      ar: 'لست متأكداً بعد، أو لديك هدف مختلف؛ سنجري تحليلك على أي حال.',
      ru: 'Пока не уверены или другая цель; мы всё равно проведём ваш анализ.',
      fr: 'Vous n’êtes pas encore sûr, ou vous avez un autre objectif ; nous réaliserons quand même votre analyse.',
      es: 'Aún no está seguro, o tiene otro objetivo; de todos modos realizaremos su análisis.',
    }),
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
    title: L6({
      en: 'Hair thinning',
      he: 'שיער דליל',
      ar: 'ترقّق الشعر',
      ru: 'Поредение волос',
      fr: 'Dégarnissement des cheveux',
      es: 'Aclaramiento del cabello',
    }),
    description: L6({
      en: 'Density loss, hairline changes, crown thinning.',
      he: 'ירידה בצפיפות, שינויים בקו השיער, דלילות בקודקוד.',
      ar: 'فقدان الكثافة، تغيّرات في خط الشعر، ترقّق في تاج الرأس.',
      ru: 'Потеря плотности, изменения линии роста волос, поредение на макушке.',
      fr: 'Perte de densité, modifications de la ligne d’implantation, dégarnissement du vertex.',
      es: 'Pérdida de densidad, cambios en la línea del cabello, aclaramiento de la coronilla.',
    }),
  },
  {
    value: 'gray',
    title: L6({ en: 'Gray hair', he: 'שיער אפור', ar: 'الشعر الرمادي', ru: 'Седина', fr: 'Cheveux gris', es: 'Canas' }),
    description: L6({
      en: 'Premature or increasing gray hair.',
      he: 'שיער אפור מוקדם או מתגבר.',
      ar: 'شعر رمادي مبكر أو متزايد.',
      ru: 'Преждевременная или усиливающаяся седина.',
      fr: 'Cheveux gris précoces ou de plus en plus nombreux.',
      es: 'Canas prematuras o en aumento.',
    }),
  },
  {
    value: 'both',
    title: L6({ en: 'Both', he: 'שניהם', ar: 'كلاهما', ru: 'И то, и другое', fr: 'Les deux', es: 'Ambos' }),
    description: L6({
      en: 'Thinning and graying concerns, together.',
      he: 'דלילות ושיער אפור, יחד.',
      ar: 'مخاوف الترقّق والشيب معاً.',
      ru: 'Поредение и седина одновременно.',
      fr: 'Dégarnissement et grisonnement, à la fois.',
      es: 'Aclaramiento y encanecimiento, a la vez.',
    }),
  },
];

/* --- step 4: guided photos (brief §12 step 4) ------------------------- */
export type PhotoAngle = 'front' | 'top' | 'crown' | 'hairline';

export const PHOTO_ANGLES: Array<{
  angle: PhotoAngle;
  title: LocalizedText;
  instruction: LocalizedText;
}> = [
  {
    angle: 'front',
    title: L6({ en: 'Front', he: 'חזית', ar: 'أمامية', ru: 'Спереди', fr: 'Face', es: 'Frente' }),
    instruction: L6({
      en: 'Face the camera straight on, hair as you wear it day to day.',
      he: 'להביט ישירות למצלמה, עם השיער כרגיל.',
      ar: 'انظر إلى الكاميرا مباشرةً، والشعر بمظهره اليومي المعتاد.',
      ru: 'Смотрите прямо в камеру, волосы — как вы носите их обычно.',
      fr: 'Regardez l’objectif bien en face, les cheveux tels que vous les portez au quotidien.',
      es: 'Mire directamente a la cámara, con el cabello como lo lleva a diario.',
    }),
  },
  {
    angle: 'top',
    title: L6({ en: 'Top', he: 'מלמעלה', ar: 'علوية', ru: 'Сверху', fr: 'Dessus', es: 'Parte superior' }),
    instruction: L6({
      en: 'Tilt your head down and photograph the top of your scalp.',
      he: 'להטות את הראש מטה ולצלם את חלקו העליון של הקרקפת.',
      ar: 'أمِل رأسك إلى الأسفل وصوّر الجزء العلوي من فروة رأسك.',
      ru: 'Наклоните голову вниз и сфотографируйте верхнюю часть кожи головы.',
      fr: 'Inclinez la tête vers le bas et photographiez le dessus de votre cuir chevelu.',
      es: 'Incline la cabeza hacia abajo y fotografíe la parte superior del cuero cabelludo.',
    }),
  },
  {
    angle: 'crown',
    title: L6({ en: 'Crown', he: 'קודקוד', ar: 'تاج الرأس', ru: 'Макушка', fr: 'Vertex', es: 'Coronilla' }),
    instruction: L6({
      en: 'Photograph the back crown area, parting the hair if it helps.',
      he: 'לצלם את אזור הקודקוד האחורי, אפשר להפריד את השיער.',
      ar: 'صوّر منطقة تاج الرأس من الخلف، مع فرْق الشعر إن كان ذلك يساعد.',
      ru: 'Сфотографируйте область макушки сзади, при необходимости разделите волосы пробором.',
      fr: 'Photographiez la zone du vertex à l’arrière, en séparant les cheveux si cela aide.',
      es: 'Fotografíe la zona de la coronilla en la parte de atrás, separando el cabello si ayuda.',
    }),
  },
  {
    angle: 'hairline',
    title: L6({ en: 'Hairline', he: 'קו השיער', ar: 'خط الشعر', ru: 'Линия роста волос', fr: 'Ligne d’implantation', es: 'Línea del cabello' }),
    instruction: L6({
      en: 'Pull hair back from the forehead and photograph the hairline.',
      he: 'להרחיק שיער מהמצח ולצלם את קו השיער.',
      ar: 'أبعِد الشعر عن الجبهة وصوّر خط الشعر.',
      ru: 'Отведите волосы со лба и сфотографируйте линию роста волос.',
      fr: 'Dégagez les cheveux du front et photographiez la ligne d’implantation.',
      es: 'Aparte el cabello de la frente y fotografíe la línea del cabello.',
    }),
  },
];

/* --- step 5: analysis state categories (brief §12 step 5) ------------ */
export const SCAN_CATEGORIES: LocalizedText[] = [
  L6({ en: 'Hair density', he: 'צפיפות שיער', ar: 'كثافة الشعر', ru: 'Густота волос', fr: 'Densité capillaire', es: 'Densidad capilar' }),
  L6({ en: 'Visible thinning', he: 'דלילות נראית', ar: 'ترقّق ظاهر', ru: 'Заметное поредение', fr: 'Dégarnissement visible', es: 'Aclaramiento visible' }),
  L6({ en: 'Hairline', he: 'קו השיער', ar: 'خط الشعر', ru: 'Линия роста волос', fr: 'Ligne d’implantation', es: 'Línea del cabello' }),
  L6({ en: 'Loss area', he: 'אזור הנשירה', ar: 'منطقة التساقط', ru: 'Зона выпадения', fr: 'Zone de chute', es: 'Zona de caída' }),
  L6({ en: 'Scalp condition', he: 'מצב הקרקפת', ar: 'حالة فروة الرأس', ru: 'Состояние кожи головы', fr: 'État du cuir chevelu', es: 'Estado del cuero cabelludo' }),
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
  prompt: L6({
    en: 'Do any of the following apply to you? Select all that apply.',
    he: 'האם משהו מהבאים רלוונטי עבורך? ניתן לבחור יותר מאפשרות אחת.',
    ar: 'هل ينطبق عليك أيٌّ مما يلي؟ اختر كل ما ينطبق.',
    ru: 'Относится ли к вам что-либо из перечисленного? Выберите все подходящие варианты.',
    fr: 'L’un des éléments suivants s’applique-t-il à vous ? Sélectionnez tout ce qui s’applique.',
    es: '¿Le corresponde alguno de los siguientes? Seleccione todos los que correspondan.',
  }),
  options: [
    {
      value: 'thyroid',
      label: L6({
        en: 'Thyroid dysfunction',
        he: 'תפקוד לקוי של בלוטת התריס',
        ar: 'اضطراب في الغدة الدرقية',
        ru: 'Нарушение функции щитовидной железы',
        fr: 'Dysfonctionnement thyroïdien',
        es: 'Disfunción tiroidea',
      }),
    },
    { value: 'anemia', label: L6({ en: 'Anemia', he: 'אנמיה', ar: 'فقر الدم', ru: 'Анемия', fr: 'Anémie', es: 'Anemia' }) },
    {
      value: 'autoimmune',
      label: L6({
        en: 'Autoimmune disease',
        he: 'מחלה אוטואימונית',
        ar: 'مرض مناعي ذاتي',
        ru: 'Аутоиммунное заболевание',
        fr: 'Maladie auto-immune',
        es: 'Enfermedad autoinmune',
      }),
    },
    {
      value: 'cancer',
      label: L6({ en: 'Cancer', he: 'סרטן', ar: 'السرطان', ru: 'Онкологическое заболевание', fr: 'Cancer', es: 'Cáncer' }),
    },
    {
      value: 'glp1',
      label: L6({
        en: 'Currently on GLP-1 medication',
        he: 'נוטל/ת כיום תרופת GLP-1',
        ar: 'أتناول حالياً دواء GLP-1',
        ru: 'Сейчас принимаю препарат GLP-1',
        fr: 'Actuellement sous traitement par GLP-1',
        es: 'Actualmente en tratamiento con un medicamento GLP-1',
      }),
    },
    {
      value: 'none',
      label: L6({
        en: 'None of the above',
        he: 'אף אחת מהאפשרויות',
        ar: 'لا شيء مما سبق',
        ru: 'Ничего из перечисленного',
        fr: 'Aucune de ces réponses',
        es: 'Ninguna de las anteriores',
      }),
    },
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
    prompt: L6({
      en: 'Where are you experiencing hair loss?',
      he: 'היכן חלה נשירת השיער?',
      ar: 'أين تلاحظ تساقط الشعر؟',
      ru: 'Где вы замечаете выпадение волос?',
      fr: 'Où constatez-vous une chute de cheveux ?',
      es: '¿Dónde experimenta la caída del cabello?',
    }),
    options: [
      { value: 'hairline', label: L6({ en: 'Hairline', he: 'קו השיער', ar: 'خط الشعر', ru: 'Линия роста волос', fr: 'Ligne d’implantation', es: 'Línea del cabello' }) },
      { value: 'crown', label: L6({ en: 'Crown', he: 'קודקוד', ar: 'تاج الرأس', ru: 'Макушка', fr: 'Vertex', es: 'Coronilla' }) },
      {
        value: 'entire-scalp',
        label: L6({
          en: 'Entire scalp',
          he: 'כל הקרקפת',
          ar: 'فروة الرأس بأكملها',
          ru: 'Вся кожа головы',
          fr: 'Tout le cuir chevelu',
          es: 'Todo el cuero cabelludo',
        }),
      },
    ],
  },
  {
    // Client Q12, verbatim.
    id: 'q2_onset',
    prompt: L6({
      en: 'How long have you been noticing hair loss or thinning?',
      he: 'כמה זמן את/ה שם/ה לב לנשירה או לדילול שיער?',
      ar: 'منذ متى وأنت تلاحظ تساقط الشعر أو ترقّقه؟',
      ru: 'Как давно вы замечаете выпадение или поредение волос?',
      fr: 'Depuis combien de temps constatez-vous une chute ou un dégarnissement des cheveux ?',
      es: '¿Desde hace cuánto tiempo nota caída o aclaramiento del cabello?',
    }),
    options: [
      {
        value: 'lt-6mo',
        label: L6({ en: 'Less than 6 months', he: 'פחות מ-6 חודשים', ar: 'أقل من 6 أشهر', ru: 'Менее 6 месяцев', fr: 'Moins de 6 mois', es: 'Menos de 6 meses' }),
      },
      { value: '6-12mo', label: L6({ en: '6–12 months', he: '6–12 חודשים', ar: '6–12 شهراً', ru: '6–12 месяцев', fr: '6–12 mois', es: '6–12 meses' }) },
      { value: '1-3y', label: L6({ en: '1–3 years', he: '1–3 שנים', ar: '1–3 سنوات', ru: '1–3 года', fr: '1–3 ans', es: '1–3 años' }) },
      {
        value: 'gt-3y',
        label: L6({ en: 'More than 3 years', he: 'יותר מ-3 שנים', ar: 'أكثر من 3 سنوات', ru: 'Более 3 лет', fr: 'Plus de 3 ans', es: 'Más de 3 años' }),
      },
    ],
  },
  {
    id: 'q3_prior',
    prompt: L6({
      en: 'Have you used hair-loss treatments before?',
      he: 'האם השתמשת בטיפולים לנשירת שיער בעבר?',
      ar: 'هل استخدمت علاجات لتساقط الشعر من قبل؟',
      ru: 'Вы применяли средства от выпадения волос раньше?',
      fr: 'Avez-vous déjà utilisé des traitements contre la chute des cheveux ?',
      es: '¿Ha utilizado antes tratamientos contra la caída del cabello?',
    }),
    options: [
      { value: 'never', label: L6({ en: 'Never', he: 'מעולם לא', ar: 'مطلقاً', ru: 'Никогда', fr: 'Jamais', es: 'Nunca' }) },
      {
        value: 'no-success',
        label: L6({ en: 'Yes, without success', he: 'כן, ללא הצלחה', ar: 'نعم، دون نجاح', ru: 'Да, без результата', fr: 'Oui, sans succès', es: 'Sí, sin éxito' }),
      },
      {
        value: 'partial',
        label: L6({
          en: 'Yes, with some improvement',
          he: 'כן, עם שיפור מסוים',
          ar: 'نعم، مع بعض التحسّن',
          ru: 'Да, с некоторым улучшением',
          fr: 'Oui, avec une certaine amélioration',
          es: 'Sí, con cierta mejora',
        }),
      },
    ],
  },
  {
    id: 'q4_family',
    prompt: L6({
      en: 'Does hair loss run in your family?',
      he: 'האם נשירת שיער שכיחה במשפחתך?',
      ar: 'هل تساقط الشعر منتشر في عائلتك؟',
      ru: 'Выпадение волос встречается в вашей семье?',
      fr: 'La chute des cheveux est-elle fréquente dans votre famille ?',
      es: '¿La caída del cabello es común en su familia?',
    }),
    options: [
      { value: 'yes', label: L6({ en: 'Yes', he: 'כן', ar: 'نعم', ru: 'Да', fr: 'Oui', es: 'Sí' }) },
      { value: 'no', label: L6({ en: 'No', he: 'לא', ar: 'لا', ru: 'Нет', fr: 'Non', es: 'No' }) },
      { value: 'not-sure', label: L6({ en: 'Not sure', he: 'לא בטוח/ה', ar: 'لست متأكداً', ru: 'Не уверен(а)', fr: 'Je ne sais pas', es: 'No estoy seguro' }) },
    ],
  },
  {
    // Client Q13, verbatim. Routing/safety signal, not a diagnosis — see
    // `domain/recommendation/rules.ts` for the sudden/patchy/unsure handling.
    id: 'q13_progression',
    prompt: L6({
      en: 'How would you describe the way your hair loss developed?',
      he: 'כיצד היית מתאר/ת את האופן שבו התפתחה נשירת השיער שלך?',
      ar: 'كيف تصف الطريقة التي تطوّر بها تساقط شعرك؟',
      ru: 'Как бы вы описали характер развития вашего выпадения волос?',
      fr: 'Comment décririez-vous la façon dont votre chute de cheveux a évolué ?',
      es: '¿Cómo describiría la forma en que se desarrolló su caída del cabello?',
    }),
    options: [
      {
        value: 'gradual',
        label: L6({
          en: 'Gradually over time',
          he: 'בהדרגה עם הזמן',
          ar: 'تدريجياً بمرور الوقت',
          ru: 'Постепенно со временем',
          fr: 'Progressivement au fil du temps',
          es: 'Gradualmente con el tiempo',
        }),
      },
      {
        value: 'sudden',
        label: L6({
          en: 'Suddenly / rapid shedding',
          he: 'בפתאומיות / נשירה מהירה',
          ar: 'فجأة / تساقط سريع',
          ru: 'Внезапно / быстрое выпадение',
          fr: 'Soudainement / chute rapide',
          es: 'De repente / caída rápida',
        }),
      },
      {
        value: 'patchy',
        label: L6({
          en: 'In specific patches',
          he: 'בכתמים ספציפיים',
          ar: 'في بقع محدّدة',
          ru: 'Отдельными участками',
          fr: 'Par zones précises',
          es: 'En zonas concretas',
        }),
      },
      {
        value: 'unsure',
        label: L6({ en: 'I’m not sure', he: 'לא בטוח/ה', ar: 'لست متأكداً', ru: 'Не уверен(а)', fr: 'Je ne suis pas sûr', es: 'No estoy seguro' }),
      },
    ],
  },
  HEALTH_HISTORY_QUESTION,
];

/** Gray branch (Slow Hair Graying goal) — own vocabulary, own light pattern model. */
export const GRAY_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'g1_onset',
    prompt: L6({
      en: 'When did you first notice gray hair?',
      he: 'מתי הבחנת בשיער אפור לראשונה?',
      ar: 'متى لاحظت الشعر الرمادي لأول مرة؟',
      ru: 'Когда вы впервые заметили седину?',
      fr: 'Quand avez-vous remarqué vos premiers cheveux gris ?',
      es: '¿Cuándo notó las canas por primera vez?',
    }),
    options: [
      {
        value: 'lt-1y',
        label: L6({
          en: 'Within the last year',
          he: 'בשנה האחרונה',
          ar: 'خلال العام الماضي',
          ru: 'В течение последнего года',
          fr: 'Au cours de l’année écoulée',
          es: 'Durante el último año',
        }),
      },
      { value: '1-5y', label: L6({ en: '1–5 years ago', he: 'לפני 1–5 שנים', ar: 'قبل 1–5 سنوات', ru: '1–5 лет назад', fr: 'Il y a 1–5 ans', es: 'Hace 1–5 años' }) },
      {
        value: 'gt-5y',
        label: L6({
          en: 'More than 5 years ago',
          he: 'לפני יותר מ-5 שנים',
          ar: 'قبل أكثر من 5 سنوات',
          ru: 'Более 5 лет назад',
          fr: 'Il y a plus de 5 ans',
          es: 'Hace más de 5 años',
        }),
      },
    ],
  },
  {
    id: 'g2_area',
    prompt: L6({
      en: 'Where is it most visible?',
      he: 'היכן זה בולט ביותר?',
      ar: 'أين يظهر بأكثر وضوح؟',
      ru: 'Где это наиболее заметно?',
      fr: 'Où est-ce le plus visible ?',
      es: '¿Dónde es más visible?',
    }),
    options: [
      { value: 'temples', label: L6({ en: 'Temples', he: 'רקות', ar: 'الصُدغان', ru: 'Виски', fr: 'Tempes', es: 'Sienes' }) },
      {
        value: 'crown',
        label: L6({
          en: 'Crown and top',
          he: 'קודקוד וחלק עליון',
          ar: 'التاج وأعلى الرأس',
          ru: 'Макушка и верхняя часть',
          fr: 'Vertex et sommet',
          es: 'Coronilla y parte superior',
        }),
      },
      {
        value: 'throughout',
        label: L6({ en: 'Throughout', he: 'בכל הראש', ar: 'في جميع أنحاء الرأس', ru: 'По всей голове', fr: 'Sur toute la tête', es: 'Por toda la cabeza' }),
      },
    ],
  },
  {
    id: 'g3_pace',
    prompt: L6({
      en: 'How quickly has it progressed?',
      he: 'באיזו מהירות זה התקדם?',
      ar: 'ما مدى سرعة تقدّمه؟',
      ru: 'Насколько быстро это прогрессировало?',
      fr: 'À quelle vitesse cela a-t-il progressé ?',
      es: '¿Con qué rapidez ha progresado?',
    }),
    options: [
      { value: 'slow', label: L6({ en: 'Slowly', he: 'לאט', ar: 'ببطء', ru: 'Медленно', fr: 'Lentement', es: 'Lentamente' }) },
      { value: 'steady', label: L6({ en: 'Steadily', he: 'בקצב קבוע', ar: 'بوتيرة ثابتة', ru: 'Стабильно', fr: 'Régulièrement', es: 'De forma constante' }) },
      { value: 'fast', label: L6({ en: 'Quickly', he: 'מהר', ar: 'بسرعة', ru: 'Быстро', fr: 'Rapidement', es: 'Rápidamente' }) },
    ],
  },
  {
    id: 'g4_color',
    prompt: L6({
      en: 'Do you currently color your hair?',
      he: 'האם את/ה צובע/ת את השיער כיום?',
      ar: 'هل تصبغ شعرك حالياً؟',
      ru: 'Вы сейчас окрашиваете волосы?',
      fr: 'Colorez-vous actuellement vos cheveux ?',
      es: '¿Se tiñe el cabello actualmente?',
    }),
    options: [
      { value: 'no', label: L6({ en: 'No', he: 'לא', ar: 'لا', ru: 'Нет', fr: 'Non', es: 'No' }) },
      { value: 'sometimes', label: L6({ en: 'Sometimes', he: 'לפעמים', ar: 'أحياناً', ru: 'Иногда', fr: 'Parfois', es: 'A veces' }) },
      { value: 'regularly', label: L6({ en: 'Regularly', he: 'באופן קבוע', ar: 'بانتظام', ru: 'Регулярно', fr: 'Régulièrement', es: 'Con regularidad' }) },
    ],
  },
  HEALTH_HISTORY_QUESTION,
];

export function questionsForHairGoal(goal: HairGoal): AssessmentQuestion[] {
  return goal === 'slow-graying' ? GRAY_QUESTIONS : THINNING_QUESTIONS;
}
