import { L6, type LocalizedText } from './localized';

/**
 * Program compositions and durations (brief §15). A program sells a *process*:
 * targeted treatments + support products + tracking, over a supply period.
 *
 * No prices, savings, or per-day figures are invented — `price` / `perDay` are
 * `null` and render as [PENDING] until the client supplies a price list
 * (OQ-BIZ-1). Density components stay eligibility-gated (brief §9).
 */

export type ProgramKind = 'density' | 'gray' | 'complete';

export type ProgramDef = {
  kind: ProgramKind;
  name: LocalizedText;
  summary: LocalizedText;
  /** Product slugs that make up the program. Density slots resolve to a tier
   *  suggested by the assessment + confirmed at review. */
  coreSlots: Array<'density-tier' | string>;
  supportingSlugs: string[];
  requiresMedicalReview: boolean;
};

export const PROGRAMS: Record<ProgramKind, ProgramDef> = {
  density: {
    kind: 'density',
    name: L6({
      en: 'Density Program',
      he: 'תוכנית Density',
      ar: 'برنامج الكثافة',
      ru: 'Программа плотности',
      fr: 'Programme Densité',
      es: 'Programa de densidad',
    }),
    summary: L6({
      en: 'A recommended Density treatment plus the Regrowth Shampoo, for visible thinning.',
      he: 'טיפול Density מומלץ יחד עם שמפו Regrowth, לשיער דליל נראה לעין.',
      ar: 'علاج الكثافة الموصى به مع شامبو Regrowth، لترقّق الشعر الملحوظ.',
      ru: 'Рекомендованный уход за плотностью волос вместе с шампунем Regrowth — при заметном поредении волос.',
      fr: 'Un soin Densité recommandé, accompagné du shampooing Regrowth, pour un dégarnissement visible.',
      es: 'Un tratamiento de densidad recomendado junto con el champú Regrowth, para un aclaramiento visible.',
    }),
    coreSlots: ['density-tier'],
    supportingSlugs: ['regrowth-shampoo'],
    requiresMedicalReview: true,
  },
  gray: {
    kind: 'gray',
    name: L6({
      en: 'Gray Program',
      he: 'תוכנית Gray',
      ar: 'برنامج الشعر الرمادي',
      ru: 'Программа седины',
      fr: 'Programme Cheveux gris',
      es: 'Programa de canas',
    }),
    summary: L6({
      en: 'Gray Support capsules and Gray Serum: a coordinated inside + topical routine.',
      he: 'קפסולות Gray Support וסרום Gray: שגרה מתואמת מבפנים ומבחוץ.',
      ar: 'كبسولات Gray Support وGray Serum: روتين متكامل من الداخل ومن الخارج.',
      ru: 'Капсулы Gray Support и Gray Serum: согласованный уход изнутри и снаружи.',
      fr: 'Gélules Gray Support et Gray Serum : une routine coordonnée, en interne et en application topique.',
      es: 'Cápsulas Gray Support y Gray Serum: una rutina coordinada, interna y tópica.',
    }),
    coreSlots: ['gray-support', 'gray-serum'],
    supportingSlugs: [],
    requiresMedicalReview: false,
  },
  complete: {
    kind: 'complete',
    name: L6({
      en: 'Complete Program',
      he: 'תוכנית מלאה',
      ar: 'البرنامج الكامل',
      ru: 'Полная программа',
      fr: 'Programme complet',
      es: 'Programa completo',
    }),
    summary: L6({
      en: 'A personalized Density treatment where eligible, the Regrowth Shampoo, and the full Gray routine.',
      he: 'טיפול Density אישי במידת ההתאמה, שמפו Regrowth, ושגרת Gray המלאה.',
      ar: 'علاج كثافة شخصي عند الأهلية، شامبو Regrowth، وروتين الشعر الرمادي الكامل.',
      ru: 'Персонализированный уход за плотностью волос при наличии показаний, шампунь Regrowth и полная программа ухода за сединой.',
      fr: "Un soin Densité personnalisé selon l'éligibilité, le shampooing Regrowth, et la routine complète pour cheveux gris.",
      es: 'Un tratamiento de densidad personalizado según la elegibilidad, el champú Regrowth y la rutina completa para canas.',
    }),
    coreSlots: ['density-tier'],
    supportingSlugs: ['regrowth-shampoo', 'gray-support', 'gray-serum'],
    requiresMedicalReview: true,
  },
};

export type DurationDays = 90 | 120 | 180 | 270 | 360;

export type DurationTier = 'start' | 'recommended' | 'best-value' | 'personalized';

export type ProgramDuration = {
  days: DurationDays;
  /** Marketing emphasis (brief §11, §15). 120 / 270 are personalized-only. */
  tier: DurationTier;
  label: LocalizedText;
  /** All money is [PENDING] until supplied. */
  price: number | null;
  perDay: number | null;
  savingsPct: number | null;
};

export const PROGRAM_DURATIONS: ProgramDuration[] = [
  {
    days: 90,
    tier: 'start',
    label: L6({ en: '90 days', he: '90 יום', ar: '90 يوماً', ru: '90 дней', fr: '90 jours', es: '90 días' }),
    price: null,
    perDay: null,
    savingsPct: null,
  },
  {
    days: 120,
    tier: 'personalized',
    label: L6({ en: '120 days', he: '120 יום', ar: '120 يوماً', ru: '120 дней', fr: '120 jours', es: '120 días' }),
    price: null,
    perDay: null,
    savingsPct: null,
  },
  {
    days: 180,
    tier: 'recommended',
    label: L6({ en: '180 days', he: '180 יום', ar: '180 يوماً', ru: '180 дней', fr: '180 jours', es: '180 días' }),
    price: null,
    perDay: null,
    savingsPct: null,
  },
  {
    days: 270,
    tier: 'personalized',
    label: L6({ en: '270 days', he: '270 יום', ar: '270 يوماً', ru: '270 дней', fr: '270 jours', es: '270 días' }),
    price: null,
    perDay: null,
    savingsPct: null,
  },
  {
    days: 360,
    tier: 'best-value',
    label: L6({ en: '360 days', he: '360 יום', ar: '360 يوماً', ru: '360 дней', fr: '360 jours', es: '360 días' }),
    price: null,
    perDay: null,
    savingsPct: null,
  },
];

/** The three durations the marketing UI leads with. */
export const HEADLINE_DURATIONS: DurationDays[] = [90, 180, 360];

export const DURATION_TIER_LABEL: Record<DurationTier, LocalizedText> = {
  start: L6({ en: 'Start', he: 'התחלה', ar: 'بداية', ru: 'Старт', fr: 'Découverte', es: 'Inicio' }),
  recommended: L6({
    en: 'Recommended',
    he: 'מומלץ',
    ar: 'مُوصى به',
    ru: 'Рекомендуется',
    fr: 'Recommandé',
    es: 'Recomendado',
  }),
  'best-value': L6({
    en: 'Best value',
    he: 'הכי משתלם',
    ar: 'أفضل قيمة',
    ru: 'Выгоднее всего',
    fr: 'Meilleure offre',
    es: 'Mejor valor',
  }),
  personalized: L6({
    en: 'Personalized',
    he: 'אישי',
    ar: 'مخصص',
    ru: 'Индивидуальный',
    fr: 'Personnalisé',
    es: 'Personalizado',
  }),
};

export function getDuration(days: DurationDays): ProgramDuration | undefined {
  return PROGRAM_DURATIONS.find((d) => d.days === days);
}
