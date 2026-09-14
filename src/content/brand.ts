import { L6, type LocalizedText } from './localized';

/**
 * Brand positioning (brief §2, §5). Sells a process and a solution — Analyze →
 * Understand → Personalize → Treat → Track — never "a quiz that sells shampoo".
 * Copy strings the brief pins verbatim live here; longer page copy lives in the
 * i18n dictionaries per surface.
 */

export const brand = {
  name: 'ROOTÉ',
  domain: 'ROOTÉ.US',
  descriptor: L6({
    en: 'Personalized Hair Growth System',
    he: 'מערכת אישית לצמיחת שיער',
    ar: 'نظام مخصّص لنمو الشعر',
    ru: 'Персональная система роста волос',
    fr: 'Système personnalisé de croissance capillaire',
    es: 'Sistema personalizado de crecimiento capilar',
  }),
  promise: L6({
    en: 'A personalized hair system that starts with understanding your condition and stays with you from your first scan to your final result.',
    he: 'מערכת שיער אישית שמתחילה בהבנת המצב שלך ומלווה אותך מהסריקה הראשונה ועד לתוצאה הסופית.',
    ar: 'نظام شعر مخصّص يبدأ بفهم حالتك ويرافقك من فحصك الأول وحتى نتيجتك النهائية.',
    ru: 'Персональная система для волос, которая начинается с понимания вашего состояния и сопровождает вас от первого сканирования до итогового результата.',
    fr: 'Un système capillaire personnalisé qui commence par comprendre votre état et vous accompagne de votre premier scan à votre résultat final.',
    es: 'Un sistema capilar personalizado que comienza por entender su estado y le acompaña desde su primer escaneo hasta su resultado final.',
  }),
} as const;

/** Primary headline territory + supporting lines (brief §2). */
export const brandLines = {
  /** `*word*` marks a word/phrase to render in italic (see Hero's renderWithEmphasis) —
   *  left to each locale to place, since the emphasised word doesn't always land in
   *  the same position once translated. */
  headline: L6({
    en: 'A personalized hair growth system for *you*.',
    he: 'מערכת אישית לצמיחת שיער *בשבילך*.',
    ar: 'نظام مخصّص لنمو الشعر *لك*.',
    ru: 'Персональная система роста волос *для вас*.',
    fr: 'Système personnalisé de croissance capillaire *pour vous*.',
    es: 'Sistema personalizado de crecimiento capilar *para usted*.',
  }),
  secondary: L6({
    en: 'From your first scan to your final result.',
    he: 'מהסריקה הראשונה ועד לתוצאה הסופית.',
    ar: 'من فحصك الأول وحتى نتيجتك النهائية.',
    ru: 'От первого сканирования до итогового результата.',
    fr: 'De votre premier scan à votre résultat final.',
    es: 'Desde su primer escaneo hasta su resultado final.',
  }),
  supporting: [
    L6({
      en: 'Understand your hair. Personalize your path.',
      he: 'להבין את השיער. להתאים את הדרך.',
      ar: 'افهم شعرك. خصّص مسارك.',
      ru: 'Поймите свои волосы. Настройте свой путь.',
      fr: 'Comprenez vos cheveux. Personnalisez votre parcours.',
      es: 'Entienda su cabello. Personalice su camino.',
    }),
    L6({
      en: 'Start at the root.',
      he: 'להתחיל מהשורש.',
      ar: 'ابدأ من الجذر.',
      ru: 'Начните с корня.',
      fr: 'Commencez à la racine.',
      es: 'Comience desde la raíz.',
    }),
    L6({
      en: 'Analyze. Treat. Track.',
      he: 'לנתח. לטפל. לעקוב.',
      ar: 'حلّل. عالِج. تابع.',
      ru: 'Анализировать. Лечить. Отслеживать.',
      fr: 'Analyser. Traiter. Suivre.',
      es: 'Analizar. Tratar. Seguir.',
    }),
    L6({
      en: 'Built around your hair, not a generic routine.',
      he: 'בנוי סביב השיער שלך, לא שגרה גנרית.',
      ar: 'مبني حول شعرك، وليس روتينًا عامًا.',
      ru: 'Построено вокруг ваших волос, а не общая рутина.',
      fr: 'Conçu autour de vos cheveux, pas une routine générique.',
      es: 'Diseñado en torno a su cabello, no una rutina genérica.',
    }),
  ] as LocalizedText[],
} as const;

/**
 * CTAs. Stored sentence-case; ALL-CAPS is a CSS `text-transform` on Latin
 * locales only (`.u-caps`), so Hebrew/Arabic render naturally.
 */
export const cta = {
  primary: L6({
    en: 'Start free hair analysis',
    he: 'להתחלת אבחון שיער חינם',
    ar: 'ابدأ تحليل الشعر المجاني',
    ru: 'Начать бесплатную диагностику волос',
    fr: 'Démarrer une analyse capillaire gratuite',
    es: 'Comenzar análisis capilar gratuito',
  }),
  secondary: L6({
    en: 'See how it works',
    he: 'איך זה עובד',
    ar: 'كيف يعمل',
    ru: 'Как это работает',
    fr: 'Comment ça marche',
    es: 'Cómo funciona',
  }),
  continueAnalysis: L6({
    en: 'Continue your analysis',
    he: 'להמשך האבחון',
    ar: 'أكمل تحليلك',
    ru: 'Продолжить анализ',
    fr: 'Poursuivre votre analyse',
    es: 'Continuar su análisis',
  }),
  startProgram: L6({
    en: 'Start my program',
    he: 'להתחלת התוכנית שלי',
    ar: 'ابدأ برنامجي',
    ru: 'Начать мою программу',
    fr: 'Démarrer mon programme',
    es: 'Comenzar mi programa',
  }),
} as const;

/**
 * The three-strand follicle mark. One motif, three readings — used to structure
 * the concern picker and the Analyze/Treat/Track rail (brief §5).
 */
export const threeStrand = {
  concept: L6({
    en: 'Three strands from one root: hair science, your three concern territories, and Analyze / Treat / Track.',
    he: 'שלוש שערות משורש אחד: מדע השיער, שלושת תחומי העניין שלך, ולנתח / לטפל / לעקוב.',
    ar: 'ثلاث خصلات من جذر واحد: علم الشعر، مجالات اهتمامك الثلاثة، وحلّل / عالِج / تابع.',
    ru: 'Три пряди из одного корня: наука о волосах, три ваши зоны внимания и Анализировать / Лечить / Отслеживать.',
    fr: "Trois mèches d'une seule racine : la science capillaire, vos trois zones de préoccupation, et Analyser / Traiter / Suivre.",
    es: 'Tres hebras de una misma raíz: la ciencia capilar, sus tres áreas de interés, y Analizar / Tratar / Seguir.',
  }),
  triad: [
    {
      key: 'analyze',
      label: L6({ en: 'Analyze', he: 'לנתח', ar: 'حلّل', ru: 'Анализ', fr: 'Analyser', es: 'Analizar' }),
    },
    {
      key: 'treat',
      label: L6({ en: 'Treat', he: 'לטפל', ar: 'عالِج', ru: 'Лечение', fr: 'Traiter', es: 'Tratar' }),
    },
    {
      key: 'track',
      label: L6({ en: 'Track', he: 'לעקוב', ar: 'تابع', ru: 'Отслеживание', fr: 'Suivre', es: 'Seguir' }),
    },
  ],
} as const;

/** The four-step system model (brief §1, §11 §4). A genuine sequence — the only
 *  place besides the progress timeline where numbered markers are used.
 *  2026-09-13: collapsed from five steps to four — Understand and Personalize
 *  merged into one step (the profile understanding directly becomes the
 *  recommended program, so they read as one beat rather than two). */
export const systemSteps = [
  {
    n: 1,
    key: 'analyze',
    title: L6({ en: 'Analyze', he: 'ניתוח', ar: 'التحليل', ru: 'Анализ', fr: 'Analyser', es: 'Analizar' }),
    body: L6({
      en: 'Complete a short assessment and a guided hair scan.',
      he: 'משלימים הערכה קצרה וסריקת שיער מודרכת.',
      ar: 'أكمل تقييمًا قصيرًا وفحص شعر موجَّهًا.',
      ru: 'Пройдите короткую оценку и пошаговое сканирование волос.',
      fr: 'Complétez une courte évaluation et un scan capillaire guidé.',
      es: 'Complete una breve evaluación y un escaneo capilar guiado.',
    }),
  },
  {
    n: 2,
    key: 'personalize',
    title: L6({
      en: 'Personalize',
      he: 'התאמה',
      ar: 'التخصيص',
      ru: 'Персонализация',
      fr: 'Personnaliser',
      es: 'Personalizar',
    }),
    body: L6({
      en: 'Get a recommended program built around your profile.',
      he: 'תקבל תוכנית מומלצת שנבנית סביב הפרופיל שלך.',
      ar: 'احصل على برنامج مُوصى به مبني حول ملفك.',
      ru: 'Получите рекомендованную программу на основе вашего профиля.',
      fr: 'Obtenez un programme recommandé, construit autour de votre profil.',
      es: 'Obtenga un programa recomendado, creado en torno a su perfil.',
    }),
  },
  {
    n: 3,
    key: 'treat',
    title: L6({ en: 'Treat', he: 'טיפול', ar: 'العلاج', ru: 'Лечение', fr: 'Traiter', es: 'Tratar' }),
    body: L6({
      en: 'Follow a clear daily routine, built around your formula.',
      he: 'עוקבים אחר שגרה יומית ברורה, המותאמת לפורמולה שלך.',
      ar: 'اتّبع روتينًا يوميًا واضحًا، مبنيًا حول تركيبتك.',
      ru: 'Следуйте понятному ежедневному распорядку, построенному на основе вашей формулы.',
      fr: 'Suivez une routine quotidienne claire, construite autour de votre formule.',
      es: 'Siga una rutina diaria clara, creada en torno a su fórmula.',
    }),
  },
  {
    n: 4,
    key: 'track',
    title: L6({ en: 'Track', he: 'מעקב', ar: 'المتابعة', ru: 'Отслеживание', fr: 'Suivre', es: 'Seguir' }),
    body: L6({
      en: 'Compare progress from baseline scan to final scan.',
      he: 'משווים את ההתקדמות מהסריקה הראשונה ועד הסופית.',
      ar: 'قارِن تقدّمك من فحصك الأول وحتى فحصك النهائي.',
      ru: 'Сравнивайте прогресс от первого сканирования до финального.',
      fr: "Comparez vos progrès depuis votre scan initial jusqu'à votre scan final.",
      es: 'Compare su progreso desde el escaneo inicial hasta el escaneo final.',
    }),
  },
] as const;

export type SystemStep = (typeof systemSteps)[number];
