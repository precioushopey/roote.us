import { L6, type LocalizedText } from './localized';
import { rooteContent } from './roote.config';

/**
 * Program compositions and durations (brief §15). A program sells a *process*:
 * targeted treatments + support products + tracking, over a supply period.
 *
 * Money figures come from `rooteContent.programDurations` (currently
 * TEMP-PLACEHOLDER stand-ins, see roote.config.ts) so there is one price
 * source; a `null` there renders as [PENDING] (OQ-BIZ-1). Density components
 * stay eligibility-gated (brief §9).
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
      he: 'תוכנית הצפיפות',
      ar: 'برنامج الكثافة',
      ru: 'Программа плотности',
      fr: 'Programme Densité',
      es: 'Programa de densidad',
    }),
    summary: L6({
      en: 'A recommended Density treatment plus the Regrowth Shampoo, for visible thinning.',
      he: 'טיפול מומלץ לצפיפות השיער יחד עם שמפו לצמיחה מחדש, לשיער דליל נראה לעין.',
      ar: 'علاج الكثافة الموصى به مع شامبو إعادة النمو، لترقّق الشعر الملحوظ.',
      ru: 'Рекомендованный уход за плотностью волос вместе с шампунем для восстановления роста — при заметном поредении волос.',
      fr: 'Un soin Densité recommandé, accompagné du shampooing repousse, pour un dégarnissement visible.',
      es: 'Un tratamiento de densidad recomendado junto con el champú de recrecimiento, para un aclaramiento visible.',
    }),
    coreSlots: ['density-tier'],
    supportingSlugs: ['regrowth-shampoo'],
    requiresMedicalReview: true,
  },
  gray: {
    kind: 'gray',
    name: L6({
      en: 'Gray Program',
      he: 'התוכנית לשיער אפור',
      ar: 'برنامج الشعر الرمادي',
      ru: 'Программа седины',
      fr: 'Programme Cheveux gris',
      es: 'Programa de canas',
    }),
    summary: L6({
      en: 'Gray Support capsules and Gray Serum: a coordinated inside + topical routine.',
      he: 'קפסולות וסרום לשיער אפור: שגרה מתואמת מבפנים ומבחוץ.',
      ar: 'كبسولات وسيروم العناية بالشيب: روتين متكامل من الداخل ومن الخارج.',
      ru: 'Капсулы и сыворотка против седины: согласованный уход изнутри и снаружи.',
      fr: 'Gélules et sérum anti-cheveux gris : une routine coordonnée, en interne et en application topique.',
      es: 'Cápsulas y sérum anticanas: una rutina coordinada, interna y tópica.',
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
      he: 'טיפול אישי לצפיפות השיער במידת ההתאמה, שמפו לצמיחה מחדש, והשגרה המלאה לשיער אפור.',
      ar: 'علاج كثافة شخصي عند الأهلية، شامبو إعادة النمو، وروتين الشعر الرمادي الكامل.',
      ru: 'Персонализированный уход за плотностью волос при наличии показаний, шампунь для восстановления роста и полная программа ухода за сединой.',
      fr: "Un soin Densité personnalisé selon l'éligibilité, le shampooing repousse, et la routine complète pour cheveux gris.",
      es: 'Un tratamiento de densidad personalizado según la elegibilidad, el champú de recrecimiento y la rutina completa para canas.',
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
  /** Money, from `rooteContent.programDurations`; null renders as [PENDING]. */
  price: number | null;
  perDay: number | null;
  savingsPct: number | null;
};

const pricingFor = (days: DurationDays) => {
  const row = rooteContent.programDurations.find((d) => d.days === days);
  return { price: row?.price ?? null, perDay: row?.perDayFrom ?? null, savingsPct: row?.savingsPct ?? null };
};

export const PROGRAM_DURATIONS: ProgramDuration[] = [
  {
    days: 90,
    tier: 'start',
    label: L6({ en: '90 days', he: '90 יום', ar: '90 يوماً', ru: '90 дней', fr: '90 jours', es: '90 días' }),
    ...pricingFor(90),
  },
  {
    days: 120,
    tier: 'personalized',
    label: L6({ en: '120 days', he: '120 יום', ar: '120 يوماً', ru: '120 дней', fr: '120 jours', es: '120 días' }),
    ...pricingFor(120),
  },
  {
    days: 180,
    tier: 'recommended',
    label: L6({ en: '180 days', he: '180 יום', ar: '180 يوماً', ru: '180 дней', fr: '180 jours', es: '180 días' }),
    ...pricingFor(180),
  },
  {
    days: 270,
    tier: 'personalized',
    label: L6({ en: '270 days', he: '270 יום', ar: '270 يوماً', ru: '270 дней', fr: '270 jours', es: '270 días' }),
    ...pricingFor(270),
  },
  {
    days: 360,
    tier: 'best-value',
    label: L6({ en: '360 days', he: '360 יום', ar: '360 يوماً', ru: '360 дней', fr: '360 jours', es: '360 días' }),
    ...pricingFor(360),
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
