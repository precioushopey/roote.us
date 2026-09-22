import { L6, type LocalizedText } from './localized';
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

/** Free-from claims printed on the physical label — mapped to `marketing.pdp.badge.*` for display. */
export type ProductBadge = 'vegan' | 'cruelty-free' | 'fragrance-free' | 'paraben-free' | 'sulfate-free';

export type Ingredient = {
  /** Proper noun — locale-invariant (Minoxidil, Greyverse™). */
  name: string;
  /** Printed concentration, e.g. "6%" — shown next to the name when present. */
  strength?: string;
  /** Short, non-efficacy purpose statement. */
  note: LocalizedText;
  claimStatus: ClaimStatus;
  sourceType: ClaimSourceType;
};

/** One row of a Supplement Facts panel (capsule-supplement format only). */
export type SupplementFactRow = {
  /** Locale-invariant nutrient/ingredient name, exactly as printed. */
  name: string;
  amount: string;
  /** `null` -> printed as the "Daily Value not established" footnote marker. */
  dailyValue: string | null;
};

export type SupplementFacts = {
  servingSize: string;
  servingsPerContainer: number;
  rows: SupplementFactRow[];
  /** Locale-invariant, e.g. "Gelatin (bovine), vegetable magnesium stearate, and silicon dioxide." */
  otherIngredients: string;
  allergenWarning: LocalizedText;
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
  /** The printed label's descriptive "Overview" paragraph. Omitted (not
   *  `null`) when the client hasn't supplied a box-label overview for this
   *  SKU yet — same convention as `storage` below: omit rather than invent. */
  overview?: LocalizedText;
  /** The label's benefits panel (the bulleted "FOR MEN"/"FOR WOMEN" list), verbatim, in print order. */
  keyBenefits: LocalizedText[];
  /**
   * Working formula reference. Shown publicly as ingredient *names* only while
   * `displayFormulaDetail` is false; the numeric reference is available to the
   * report after eligibility review.
   */
  formulaReference: LocalizedText | null;
  displayFormulaDetail: boolean;
  ingredients: Ingredient[];
  /**
   * Complete, ordered, verbatim ingredient declaration exactly as printed on
   * the shipped label (actives + inactives together for a single-list
   * product; empty when `supplementFacts` covers the declaration instead).
   * Locale-invariant — INCI/pharma nomenclature isn't translated on real
   * labels either. Rendered as the label-accuracy "Ingredients" block,
   * separate from the curated `ingredients` marketing spotlight above.
   */
  fullIngredientList: string[];
  /** Only for `format: 'capsule-supplement'`. */
  supplementFacts?: SupplementFacts;
  usage: LocalizedText;
  safety: LocalizedText;
  /** Not on every label (e.g. no box label on hand for Gray Support yet) — omit rather than invent. */
  storage?: LocalizedText;
  badges: ProductBadge[];
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
  note: LocalizedText,
  claimStatus: ClaimStatus = 'working',
  sourceType: ClaimSourceType = 'ingredient-literature',
  strength?: string,
): Ingredient => ({ name, note, claimStatus, sourceType, strength });

// Shared across the three Density topical solutions — the printed "How to
// Use" / "Cautions" / "Storage" copy is byte-identical on all three boxes.
const TOPICAL_USAGE: LocalizedText = L6({
  en: 'Apply 1 full dropper (1 mL) to a dry scalp twice daily, morning and evening. Part hair, apply to the scalp, spread with fingertips, and wash hands after use. Let dry fully before styling or lying down.',
  he: 'למרוח מנה מלאה של הטפטפת (1 מ״ל) על קרקפת יבשה, פעמיים ביום, בבוקר ובערב. לחלק את השיער, למרוח על הקרקפת, לפזר באצבעות, ולשטוף ידיים לאחר השימוש. לתת להתייבש לגמרי לפני עיצוב השיער או שכיבה.',
  ar: 'يُطبَّق ملء القطّارة الكامل (1 مل) على فروة رأس جافة، مرتين يوميًا، صباحًا ومساءً. يُفرَق الشعر، ويُوضَع المحلول على فروة الرأس، ويُوزَّع بأطراف الأصابع، وتُغسَل اليدان بعد الاستخدام. يُترَك ليجف تمامًا قبل التصفيف أو الاستلقاء.',
  ru: 'Наносить полную пипетку (1 мл) на сухую кожу головы дважды в день, утром и вечером. Разделить волосы пробором, нанести на кожу головы, распределить пальцами и вымыть руки после использования. Дать полностью высохнуть перед укладкой или сном.',
  fr: "Appliquer une pleine pipette (1 mL) sur un cuir chevelu sec, deux fois par jour, matin et soir. Séparer les cheveux, appliquer sur le cuir chevelu, répartir avec les doigts, puis se laver les mains après usage. Laisser sécher complètement avant de se coiffer ou de s'allonger.",
  es: 'Aplicar un gotero completo (1 mL) sobre el cuero cabelludo seco, dos veces al día, por la mañana y por la noche. Separar el cabello, aplicar sobre el cuero cabelludo, repartir con los dedos y lavarse las manos después de usarlo. Dejar secar por completo antes de peinarse o acostarse.',
});

const TOPICAL_CAUTIONS: LocalizedText = L6({
  en: 'For external use only. Avoid eyes and do not apply to broken, irritated, inflamed, or infected skin. Discontinue use if severe irritation or unusual symptoms occur and consult a healthcare professional. Do not swallow. Keep out of reach of children. Do not use during pregnancy or breastfeeding unless directed by a healthcare professional. Consult a healthcare professional before use if you have a medical condition or take other medications.',
  he: 'לשימוש חיצוני בלבד. יש להימנע ממגע עם העיניים ולא למרוח על עור פגום, מגורה, דלקתי או נגוע. יש להפסיק שימוש אם מופיע גירוי חמור או תסמינים חריגים ולפנות לאיש מקצוע רפואי. אין לבלוע. יש להרחיק מהישג ידם של ילדים. אין להשתמש בהיריון או בהנקה אלא בהנחיית איש מקצוע רפואי. יש להתייעץ עם איש מקצוע רפואי לפני השימוש אם קיימת בעיה רפואית או נעשה שימוש בתרופות אחרות.',
  ar: 'للاستخدام الخارجي فقط. يُتجنَّب ملامسة العينين، ولا يُوضَع على جلد مصاب أو متهيّج أو ملتهب أو مصاب بعدوى. يُوقَف الاستخدام عند ظهور تهيّج شديد أو أعراض غير معتادة، مع استشارة أخصائي رعاية صحية. يُحظر البلع. يُحفَظ بعيدًا عن متناول الأطفال. لا يُستخدم أثناء الحمل أو الرضاعة الطبيعية إلا بتوجيه من أخصائي رعاية صحية. يُرجى استشارة أخصائي رعاية صحية قبل الاستخدام في حال وجود حالة طبية أو عند تناول أدوية أخرى.',
  ru: 'Только для наружного применения. Избегать попадания в глаза, не наносить на повреждённую, раздражённую, воспалённую или инфицированную кожу. Прекратить использование при появлении сильного раздражения или необычных симптомов и обратиться к врачу. Не проглатывать. Хранить в недоступном для детей месте. Не использовать во время беременности или грудного вскармливания без указания врача. Проконсультируйтесь с врачом перед использованием при наличии заболевания или приёме других лекарств.',
  fr: "Réservé à l'usage externe. Éviter le contact avec les yeux et ne pas appliquer sur une peau lésée, irritée, enflammée ou infectée. Arrêter l'utilisation en cas d'irritation sévère ou de symptômes inhabituels et consulter un professionnel de santé. Ne pas avaler. Tenir hors de portée des enfants. Ne pas utiliser pendant la grossesse ou l'allaitement sauf avis contraire d'un professionnel de santé. Consulter un professionnel de santé avant utilisation en cas de problème médical ou de prise d'autres médicaments.",
  es: 'Solo para uso externo. Evitar el contacto con los ojos y no aplicar sobre piel dañada, irritada, inflamada o infectada. Suspender el uso si aparece irritación intensa o síntomas inusuales y consultar a un profesional de la salud. No ingerir. Mantener fuera del alcance de los niños. No usar durante el embarazo o la lactancia salvo indicación de un profesional de la salud. Consultar a un profesional de la salud antes de usar si tiene una afección médica o toma otros medicamentos.',
});

const TOPICAL_STORAGE: LocalizedText = L6({
  en: 'Store at room temperature, away from direct sunlight and heat. Keep container tightly closed.',
  he: 'יש לאחסן בטמפרטורת החדר, הרחק מאור שמש ישיר וחום. יש לשמור על הכלי סגור היטב.',
  ar: 'يُخزَّن في درجة حرارة الغرفة، بعيدًا عن أشعة الشمس المباشرة والحرارة. يُحفَظ الوعاء مُحكَم الإغلاق.',
  ru: 'Хранить при комнатной температуре, вдали от прямых солнечных лучей и источников тепла. Держать ёмкость плотно закрытой.',
  fr: "Conserver à température ambiante, à l'abri de la lumière directe du soleil et de la chaleur. Garder le récipient bien fermé.",
  es: 'Conservar a temperatura ambiente, lejos de la luz solar directa y del calor. Mantener el envase bien cerrado.',
});

const DENSITY_BADGES: ProductBadge[] = ['vegan', 'cruelty-free', 'fragrance-free'];

// Shared across the three Density topical solutions — the printed benefits
// panel is byte-identical on all three boxes.
const DENSITY_BENEFITS: LocalizedText[] = [
  L6({
    en: 'Helps Enlarge Hair Follicles',
    he: 'עוזר להגדיל את זקיקי השיער',
    ar: 'يساعد على تكبير بصيلات الشعر',
    ru: 'Помогает увеличить волосяные фолликулы',
    fr: 'Aide à agrandir les follicules pileux',
    es: 'Ayuda a agrandar los folículos capilares',
  }),
  L6({
    en: 'Promotes Thicker Hair Growth',
    he: 'מעודד צמיחת שיער עבה יותר',
    ar: 'يعزز نمو شعر أكثف',
    ru: 'Способствует росту более густых волос',
    fr: 'Favorise une croissance plus épaisse des cheveux',
    es: 'Favorece un crecimiento del cabello más grueso',
  }),
  L6({
    en: 'Strengthens Hair at the Root',
    he: 'מחזק את השיער מהשורש',
    ar: 'يقوّي الشعر من الجذور',
    ru: 'Укрепляет волосы у корней',
    fr: 'Renforce les cheveux à la racine',
    es: 'Fortalece el cabello desde la raíz',
  }),
];

export const PRODUCTS: Product[] = [
  {
    slug: 'density-6',
    name: 'ROOTÉ Level 6',
    // public-facing descriptor — PO #6 (2026-09-04)
    subtitle: L6({
      en: 'Personalized Density Treatment',
      he: 'טיפול Density מותאם אישית',
      ar: 'علاج الكثافة المخصص',
      ru: 'Персонализированное лечение плотности волос',
      fr: 'Soin Densité personnalisé',
      es: 'Tratamiento personalizado de densidad',
    }),
    concern: 'thinning',
    format: 'topical-solution',
    size: '60 mL (2 fl oz)',
    role: L6({
      en: 'Entry / lower-strength Density program.',
      he: 'תוכנית Density בעוצמה נמוכה, לשלב הראשון.',
      ar: 'برنامج الكثافة التمهيدي، بتركيز أقل.',
      ru: 'Начальная программа плотности с более низкой концентрацией.',
      fr: 'Programme Densité d’entrée, à concentration plus faible.',
      es: 'Programa de densidad inicial, de menor concentración.',
    }),
    heroCopy: L6({
      en: 'A lower-strength topical to open a Density program where the assessment supports one.',
      he: 'תרחיף בעוצמה נמוכה לפתיחת תוכנית Density, כאשר ההערכה תומכת בכך.',
      ar: 'محلول موضعي بتركيز أقل لبدء برنامج الكثافة، عندما يدعم التقييم ذلك.',
      ru: 'Топическое средство более низкой концентрации для начала программы плотности, когда это подтверждается оценкой.',
      fr: 'Un soin topique à concentration plus faible pour ouvrir un programme Densité, lorsque l’évaluation le confirme.',
      es: 'Un tratamiento tópico de menor concentración para iniciar un programa de densidad, cuando la evaluación lo respalda.',
    }),
    shortDescription: L6({
      en: 'Once- or twice-daily scalp topical. The starting point of the Density track.',
      he: 'תרחיף לקרקפת, פעם או פעמיים ביום. נקודת ההתחלה של מסלול Density.',
      ar: 'محلول موضعي للفروة، مرة أو مرتين يوميًا. نقطة البداية في مسار الكثافة.',
      ru: 'Средство для кожи головы, один или два раза в день. Отправная точка линии плотности.',
      fr: 'Topique pour le cuir chevelu, une à deux fois par jour. Le point de départ du parcours Densité.',
      es: 'Tratamiento tópico para el cuero cabelludo, una o dos veces al día. El punto de partida de la línea de densidad.',
    }),
    overview: L6({
      en: 'ROOTÉ Level 6 is a targeted daily scalp treatment formulated with Minoxidil and Finasteride to support hair growth and help address thinning at the root.',
      he: 'ROOTÉ Level 6 הוא טיפול יומי ממוקד לקרקפת, מבוסס מינוקסידיל ופינסטריד, לתמיכה בצמיחת השיער ולסיוע בטיפול בדילול בשורש השיער.',
      ar: 'ROOTÉ Level 6 هو علاج يومي مخصص لفروة الرأس، يحتوي على مينوكسيديل وفيناستيرايد، لدعم نمو الشعر والمساعدة في معالجة الترقق عند جذور الشعر.',
      ru: 'ROOTÉ Level 6 — это целенаправленное ежедневное средство для кожи головы на основе Миноксидила и Финастерида, помогающее поддерживать рост волос и бороться с истончением у корней.',
      fr: "ROOTÉ Level 6 est un soin quotidien ciblé pour le cuir chevelu, à base de Minoxidil et de Finastéride, conçu pour soutenir la croissance des cheveux et aider à traiter l'amincissement à la racine.",
      es: 'ROOTÉ Level 6 es un tratamiento diario específico para el cuero cabelludo, formulado con Minoxidil y Finasterida, que ayuda a favorecer el crecimiento del cabello y a tratar el adelgazamiento en la raíz.',
    }),
    keyBenefits: DENSITY_BENEFITS,
    formulaReference: L6({
      en: 'Working reference: 6% Minoxidil + 0.3% Finasteride.',
      he: 'התייחסות עבודה: 6% מינוקסידיל + 0.3% פינסטריד.',
      ar: 'مرجع العمل: 6% Minoxidil + 0.3% Finasteride.',
      ru: 'Рабочая формула: 6% Minoxidil + 0.3% Finasteride.',
      fr: 'Référence de travail : 6% Minoxidil + 0.3% Finasteride.',
      es: 'Referencia de trabajo: 6% Minoxidil + 0.3% Finasteride.',
    }),
    displayFormulaDetail: true,
    ingredients: [
      ING(
        'Minoxidil',
        L6({
          en: 'A long-studied topical used in pattern hair loss.',
          he: 'רכיב מקומי נחקר בהתמדה, לנשירת שיער תורשתית.',
          ar: 'مادة موضعية خضعت لدراسة طويلة الأمد في سياق تساقط الشعر الوراثي.',
          ru: 'Топическое средство, давно изучаемое при андрогенетическом выпадении волос.',
          fr: 'Un actif topique étudié de longue date dans la chute de cheveux héréditaire.',
          es: 'Un activo tópico ampliamente estudiado en la caída del cabello de patrón hereditario.',
        }),
        'working',
        'ingredient-literature',
        '6%',
      ),
      ING(
        'Finasteride',
        L6({
          en: 'A DHT-pathway ingredient, used topically here.',
          he: 'רכיב במסלול ה-DHT, בשימוש מקומי כאן.',
          ar: 'مكوّن يعمل ضمن مسار هرمون DHT، ويُستخدم هنا موضعيًا.',
          ru: 'Компонент, действующий в пути DHT; здесь применяется местно.',
          fr: 'Un ingrédient agissant sur la voie de la DHT, utilisé ici par voie topique.',
          es: 'Un ingrediente que actúa en la vía de la DHT, utilizado aquí por vía tópica.',
        }),
        'working',
        'ingredient-literature',
        '0.3%',
      ),
    ],
    fullIngredientList: ['Minoxidil 6%', 'Finasteride 0.3%', 'Ethanol (Alcohol)', 'Propylene Glycol', 'Water'],
    usage: TOPICAL_USAGE,
    safety: TOPICAL_CAUTIONS,
    storage: TOPICAL_STORAGE,
    badges: DENSITY_BADGES,
    requiresMedicalReview: true,
    packagingThemed: true,
    relatedProducts: ['density-10', 'density-15', 'regrowth-shampoo'],
    evidenceStatus: 'ingredient-literature',
    claimStatus: 'working',
    // Client-set price (2026-09-08), overriding the Essengen-6 Extra competitor match.
    price: 47,
  },
  {
    slug: 'density-10',
    name: 'ROOTÉ Level 10',
    subtitle: L6({
      en: 'Advanced Density Treatment',
      he: 'טיפול Density מתקדם',
      ar: 'علاج الكثافة المتقدم',
      ru: 'Продвинутое лечение плотности волос',
      fr: 'Soin Densité avancé',
      es: 'Tratamiento avanzado de densidad',
    }),
    concern: 'thinning',
    format: 'topical-solution',
    size: '60 mL (2 fl oz)',
    role: L6({
      en: 'Advanced Density program.',
      he: 'תוכנית Density מתקדמת.',
      ar: 'برنامج الكثافة المتقدم.',
      ru: 'Продвинутая программа плотности.',
      fr: 'Programme Densité avancé.',
      es: 'Programa de densidad avanzado.',
    }),
    heroCopy: L6({
      en: 'A higher-concentration topical with added scalp-support actives for an advanced Density program.',
      he: 'תרחיף בריכוז גבוה יותר עם רכיבי תמיכה לקרקפת, לתוכנית Density מתקדמת.',
      ar: 'محلول موضعي بتركيز أعلى مع مكوّنات فعّالة داعمة لفروة الرأس، لبرنامج الكثافة المتقدم.',
      ru: 'Топическое средство более высокой концентрации с добавленными активными компонентами для поддержки кожи головы — для продвинутой программы плотности.',
      fr: 'Un soin topique plus concentré, enrichi en actifs de soutien du cuir chevelu, pour un programme Densité avancé.',
      es: 'Un tratamiento tópico de mayor concentración con activos adicionales de apoyo para el cuero cabelludo, para un programa de densidad avanzado.',
    }),
    shortDescription: L6({
      en: 'Scalp topical with a broader support complex. The mid tier of the Density track.',
      he: 'תרחיף לקרקפת עם קומפלקס תמיכה רחב יותר. השלב האמצעי במסלול Density.',
      ar: 'محلول موضعي للفروة مع مركّب دعم أوسع. المرحلة الوسطى في مسار الكثافة.',
      ru: 'Средство для кожи головы с более широким поддерживающим комплексом. Средний уровень линии плотности.',
      fr: 'Topique pour le cuir chevelu avec un complexe de soutien plus large. Le palier intermédiaire du parcours Densité.',
      es: 'Tratamiento tópico para el cuero cabelludo con un complejo de apoyo más amplio. El nivel intermedio de la línea de densidad.',
    }),
    overview: L6({
      en: 'ROOTÉ Level 10 is a multi-active scalp treatment combining Minoxidil, Finasteride, Azelaic Acid, and ABN Complex™ to support hair growth and a healthier scalp environment.',
      he: 'ROOTÉ Level 10 הוא טיפול קרקפת רב-רכיבי המשלב מינוקסידיל, פינסטריד, חומצה אזלאית ו-ABN Complex™, לתמיכה בצמיחת השיער ולסביבת קרקפת בריאה יותר.',
      ar: 'ROOTÉ Level 10 هو علاج متعدد الفعاليات لفروة الرأس يجمع بين مينوكسيديل وفيناستيرايد وحمض الأزيليك و ABN Complex™، لدعم نمو الشعر وتحسين بيئة فروة الرأس.',
      ru: 'ROOTÉ Level 10 — это многокомпонентное средство для кожи головы, сочетающее Миноксидил, Финастерид, азелаиновую кислоту и ABN Complex™, для поддержки роста волос и более здорового состояния кожи головы.',
      fr: 'ROOTÉ Level 10 est un soin multi-actifs pour le cuir chevelu associant Minoxidil, Finastéride, acide azélaïque et ABN Complex™, pour soutenir la croissance des cheveux et un cuir chevelu plus sain.',
      es: 'ROOTÉ Level 10 es un tratamiento multiactivo para el cuero cabelludo que combina Minoxidil, Finasterida, ácido azelaico y ABN Complex™, para favorecer el crecimiento del cabello y un cuero cabelludo más sano.',
    }),
    keyBenefits: DENSITY_BENEFITS,
    formulaReference: L6({
      en: 'Working reference: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™.',
      he: 'התייחסות עבודה: 10% מינוקסידיל + 0.1% פינסטריד + 5% חומצה אזלאית + 0.8% ABN Complex™.',
      ar: 'مرجع العمل: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™.',
      ru: 'Рабочая формула: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™.',
      fr: 'Référence de travail : 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™.',
      es: 'Referencia de trabajo: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™.',
    }),
    displayFormulaDetail: true,
    ingredients: [
      ING(
        'Minoxidil',
        L6({
          en: 'A long-studied topical used in pattern hair loss.',
          he: 'רכיב מקומי נחקר בהתמדה, לנשירת שיער תורשתית.',
          ar: 'مادة موضعية خضعت لدراسة طويلة الأمد في سياق تساقط الشعر الوراثي.',
          ru: 'Топическое средство, давно изучаемое при андрогенетическом выпадении волос.',
          fr: 'Un actif topique étudié de longue date dans la chute de cheveux héréditaire.',
          es: 'Un activo tópico ampliamente estudiado en la caída del cabello de patrón hereditario.',
        }),
        'working',
        'ingredient-literature',
        '10%',
      ),
      ING(
        'Finasteride',
        L6({
          en: 'A DHT-pathway ingredient, used topically here.',
          he: 'רכיב במסלול ה-DHT, בשימוש מקומי כאן.',
          ar: 'مكوّن يعمل ضمن مسار هرمون DHT، ويُستخدم هنا موضعيًا.',
          ru: 'Компонент, действующий в пути DHT; здесь применяется местно.',
          fr: 'Un ingrédient agissant sur la voie de la DHT, utilisé ici par voie topique.',
          es: 'Un ingrediente que actúa en la vía de la DHT, utilizado aquí por vía tópica.',
        }),
        'working',
        'ingredient-literature',
        '0.1%',
      ),
      ING(
        'Azelaic Acid',
        L6({
          en: 'Included as a DHT-pathway support ingredient.',
          he: 'רכיב תמיכה במסלול ה-DHT.',
          ar: 'مُدرَجة كمكوّن داعم ضمن مسار DHT.',
          ru: 'Включена как вспомогательный компонент в пути DHT.',
          fr: 'Intégré comme ingrédient de soutien de la voie de la DHT.',
          es: 'Incluido como ingrediente de apoyo en la vía de la DHT.',
        }),
        'working',
        'ingredient-literature',
        '5%',
      ),
      ING(
        'ABN Complex™',
        L6({
          en: 'A supplier active blend included alongside Minoxidil and Finasteride in this formula.',
          he: 'תערובת רכיבים פעילים של ספק, הנכללת לצד מינוקסידיל ופינסטריד בפורמולה זו.',
          ar: 'مزيج مكوّنات فعّالة من مورّد خارجي، يُدرَج إلى جانب Minoxidil وFinasteride في هذه التركيبة.',
          ru: 'Смесь активных ингредиентов поставщика, включённая в эту формулу наряду с Minoxidil и Finasteride.',
          fr: "Un mélange d'actifs fourni par un tiers, intégré aux côtés du Minoxidil et du Finasteride dans cette formule.",
          es: 'Una mezcla de activos de un proveedor externo, incluida junto con Minoxidil y Finasteride en esta fórmula.',
        }),
        'requires-review',
        'supplier-reference',
        '0.8%',
      ),
    ],
    fullIngredientList: [
      'Minoxidil 10%',
      'Finasteride 0.1%',
      'Azelaic Acid 5%',
      'ABN Complex™ 0.8%',
      'Aloe Vera Gel',
      'Ethanol (Alcohol)',
      'Propylene Glycol',
      'Water',
    ],
    usage: TOPICAL_USAGE,
    safety: TOPICAL_CAUTIONS,
    storage: TOPICAL_STORAGE,
    badges: DENSITY_BADGES,
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
    subtitle: L6({
      en: 'Intensive Density Treatment',
      he: 'טיפול Density אינטנסיבי',
      ar: 'علاج الكثافة المكثف',
      ru: 'Интенсивное лечение плотности волос',
      fr: 'Soin Densité intensif',
      es: 'Tratamiento intensivo de densidad',
    }),
    concern: 'thinning',
    format: 'topical-solution',
    size: '60 mL (2 fl oz)',
    role: L6({
      en: 'Intensive / highest-strength Density concept.',
      he: 'קונספט Density בעוצמה הגבוהה ביותר.',
      ar: 'مفهوم الكثافة المكثف، بأعلى تركيز.',
      ru: 'Интенсивная концепция плотности максимальной концентрации.',
      fr: 'Concept Densité intensif, à la concentration la plus élevée.',
      es: 'Concepto de densidad intensivo, de la concentración más alta.',
    }),
    heroCopy: L6({
      en: 'The most concentrated Density concept. Considered only through a treatment review; never selected from a score.',
      he: 'קונספט Density המרוכז ביותר. נשקל רק דרך בדיקת טיפול, לעולם לא נבחר לפי ניקוד.',
      ar: 'مفهوم الكثافة الأعلى تركيزًا. يُنظر فيه فقط من خلال فحص العلاج؛ ولا يُختار أبدًا بناءً على النتيجة.',
      ru: 'Концепция плотности с максимальной концентрацией. Рассматривается только по результатам осмотра перед лечением; никогда не выбирается по итогам оценки.',
      fr: "Le concept Densité le plus concentré. Envisagé uniquement lors d'un bilan de traitement ; jamais sélectionné sur la base d'un score.",
      es: 'El concepto de densidad más concentrado. Se considera únicamente a través de una evaluación del tratamiento; nunca se selecciona a partir de una puntuación.',
    }),
    shortDescription: L6({
      en: 'The highest-strength topical concept in the Density track. Clinician-gated.',
      he: 'קונספט התרחיף בעוצמה הגבוהה ביותר במסלול Density. בכפוף לאישור רפואי.',
      ar: 'مفهوم المحلول الموضعي الأعلى تركيزًا في مسار الكثافة. مشروط بموافقة طبية.',
      ru: 'Концепция топического средства максимальной концентрации в линии плотности. Требует одобрения врача.',
      fr: 'Le concept topique le plus concentré du parcours Densité. Soumis à un accord médical.',
      es: 'El concepto de tratamiento tópico de mayor concentración de la línea de densidad. Sujeto a aprobación médica.',
    }),
    overview: L6({
      en: 'ROOTÉ Level 15 is an advanced multi-active scalp formula combining high-strength Minoxidil with Finasteride, Azelaic Acid, ABN Complex™, Retinol, and Caffeine designed for intensive hair-growth support.',
      he: 'ROOTÉ Level 15 הוא פורמולת קרקפת רב-רכיבית מתקדמת, המשלבת מינוקסידיל בעוצמה גבוהה עם פינסטריד, חומצה אזלאית, ABN Complex™, רטינול וקפאין, שנועדה לתמיכה אינטנסיבית בצמיחת השיער.',
      ar: 'ROOTÉ Level 15 هو تركيبة متقدمة ومتعددة الفعاليات لفروة الرأس، تجمع بين مينوكسيديل عالي التركيز وفيناستيرايد وحمض الأزيليك و ABN Complex™ والريتينول والكافيين، وهي مصمّمة لدعم مكثّف لنمو الشعر.',
      ru: 'ROOTÉ Level 15 — это продвинутая многокомпонентная формула для кожи головы, сочетающая Миноксидил высокой концентрации с Финастеридом, азелаиновой кислотой, ABN Complex™, ретинолом и кофеином, разработанная для интенсивной поддержки роста волос.',
      fr: "ROOTÉ Level 15 est une formule avancée multi-actifs pour le cuir chevelu, associant un Minoxidil à haute concentration avec du Finastéride, de l'acide azélaïque, de l'ABN Complex™, du rétinol et de la caféine, conçue pour un soutien intensif de la croissance des cheveux.",
      es: 'ROOTÉ Level 15 es una fórmula avanzada multiactiva para el cuero cabelludo que combina Minoxidil de alta concentración con Finasterida, ácido azelaico, ABN Complex™, retinol y cafeína, diseñada para un apoyo intensivo del crecimiento del cabello.',
    }),
    keyBenefits: DENSITY_BENEFITS,
    formulaReference: L6({
      en: 'Working reference: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™ + 0.025% Retinol + 0.001% Caffeine.',
      he: 'התייחסות עבודה: 15% מינוקסידיל + 0.1% פינסטריד + 5% חומצה אזלאית + 0.8% ABN Complex™ + 0.025% רטינול + 0.001% קפאין.',
      ar: 'مرجع العمل: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™ + 0.025% Retinol + 0.001% Caffeine.',
      ru: 'Рабочая формула: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™ + 0.025% Retinol + 0.001% Caffeine.',
      fr: 'Référence de travail : 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™ + 0.025% Retinol + 0.001% Caffeine.',
      es: 'Referencia de trabajo: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + 0.8% ABN Complex™ + 0.025% Retinol + 0.001% Caffeine.',
    }),
    displayFormulaDetail: true,
    ingredients: [
      ING(
        'Minoxidil',
        L6({
          en: 'A long-studied topical used in pattern hair loss.',
          he: 'רכיב מקומי נחקר בהתמדה, לנשירת שיער תורשתית.',
          ar: 'مادة موضعية خضعت لدراسة طويلة الأمد في سياق تساقط الشعر الوراثي.',
          ru: 'Топическое средство, давно изучаемое при андрогенетическом выпадении волос.',
          fr: 'Un actif topique étudié de longue date dans la chute de cheveux héréditaire.',
          es: 'Un activo tópico ampliamente estudiado en la caída del cabello de patrón hereditario.',
        }),
        'working',
        'ingredient-literature',
        '15%',
      ),
      ING(
        'Finasteride',
        L6({
          en: 'A DHT-pathway ingredient, used topically here.',
          he: 'רכיב במסלול ה-DHT, בשימוש מקומי כאן.',
          ar: 'مكوّن يعمل ضمن مسار هرمون DHT، ويُستخدم هنا موضعيًا.',
          ru: 'Компонент, действующий в пути DHT; здесь применяется местно.',
          fr: 'Un ingrédient agissant sur la voie de la DHT, utilisé ici par voie topique.',
          es: 'Un ingrediente que actúa en la vía de la DHT, utilizado aquí por vía tópica.',
        }),
        'working',
        'ingredient-literature',
        '0.1%',
      ),
      ING(
        'Azelaic Acid',
        L6({
          en: 'Included as a DHT-pathway support ingredient.',
          he: 'רכיב תמיכה במסלול ה-DHT.',
          ar: 'مُدرَجة كمكوّن داعم ضمن مسار DHT.',
          ru: 'Включена как вспомогательный компонент в пути DHT.',
          fr: 'Intégré comme ingrédient de soutien de la voie de la DHT.',
          es: 'Incluido como ingrediente de apoyo en la vía de la DHT.',
        }),
        'working',
        'ingredient-literature',
        '5%',
      ),
      ING(
        'ABN Complex™',
        L6({
          en: 'A supplier active blend included alongside Minoxidil and Finasteride in this formula.',
          he: 'תערובת רכיבים פעילים של ספק, הנכללת לצד מינוקסידיל ופינסטריד בפורמולה זו.',
          ar: 'مزيج مكوّنات فعّالة من مورّد خارجي، يُدرَج إلى جانب Minoxidil وFinasteride في هذه التركيبة.',
          ru: 'Смесь активных ингредиентов поставщика, включённая в эту формулу наряду с Minoxidil и Finasteride.',
          fr: "Un mélange d'actifs fourni par un tiers, intégré aux côtés du Minoxidil et du Finasteride dans cette formule.",
          es: 'Una mezcla de activos de un proveedor externo, incluida junto con Minoxidil y Finasteride en esta fórmula.',
        }),
        'requires-review',
        'supplier-reference',
        '0.8%',
      ),
      ING(
        'Retinol',
        L6({
          en: 'A vitamin A derivative commonly used in scalp and skin formulas.',
          he: 'נגזרת של ויטמין A, בשימוש נפוץ בפורמולות לקרקפת ולעור.',
          ar: 'مشتق من فيتامين A، يُستخدم بشكل شائع في تركيبات فروة الرأس والبشرة.',
          ru: 'Производное витамина A, часто применяемое в формулах для кожи головы и кожи.',
          fr: 'Un dérivé de vitamine A couramment utilisé dans les formules pour le cuir chevelu et la peau.',
          es: 'Un derivado de la vitamina A de uso habitual en fórmulas para el cuero cabelludo y la piel.',
        }),
        'working',
        'ingredient-literature',
        '0.025%',
      ),
      ING(
        'Caffeine',
        L6({
          en: 'A common scalp-topical ingredient.',
          he: 'רכיב נפוץ בתכשירים מקומיים לקרקפת.',
          ar: 'مكوّن شائع في المستحضرات الموضعية لفروة الرأس.',
          ru: 'Распространённый компонент топических средств для кожи головы.',
          fr: 'Un ingrédient courant des soins topiques pour cuir chevelu.',
          es: 'Un ingrediente habitual en los tratamientos tópicos para el cuero cabelludo.',
        }),
        'working',
        'ingredient-literature',
        '0.001%',
      ),
    ],
    fullIngredientList: [
      'Minoxidil 15%',
      'Finasteride 0.1%',
      'Azelaic Acid 5%',
      'ABN Complex™ 0.8%',
      'Retinol 0.025%',
      'Caffeine 0.001%',
      'Aloe Vera Gel',
      'Ethanol (Alcohol)',
      'Propylene Glycol',
      'Water',
    ],
    usage: TOPICAL_USAGE,
    safety: TOPICAL_CAUTIONS,
    storage: TOPICAL_STORAGE,
    badges: DENSITY_BADGES,
    requiresMedicalReview: true,
    packagingThemed: true,
    relatedProducts: ['density-6', 'density-10', 'regrowth-shampoo'],
    evidenceStatus: 'ingredient-literature',
    claimStatus: 'requires-review',
    // Matches DualGen-15 With PG Plus (15% Minoxidil + 0.1% Finasteride + Azelaic Acid, 1 unit / 2 oz), minoxidilmax.com.
    price: 53,
  },
  {
    slug: 'gray-serum',
    name: 'ROOTÉ Gray Serum',
    subtitle: L6({
      en: 'Daily Pigment Support Serum',
      he: 'סרום יומי לתמיכה בפיגמנט',
      ar: 'سيروم يومي لدعم التصبغ',
      ru: 'Ежедневная сыворотка для поддержки пигментации',
      fr: 'Sérum quotidien de soutien de la pigmentation',
      es: 'Sérum diario de apoyo a la pigmentación',
    }),
    concern: 'gray',
    format: 'serum',
    size: '50 mL',
    role: L6({
      en: 'Topical half of the Gray system.',
      he: 'החצי המקומי של מערכת Gray.',
      ar: 'النصف الموضعي من نظام الشعر الرمادي.',
      ru: 'Топическая часть системы седины.',
      fr: 'La moitié topique du système Cheveux gris.',
      es: 'La mitad tópica del sistema de canas.',
    }),
    heroCopy: L6({
      en: 'A leave-in serum in the anti-gray topical category, to support the appearance and health of naturally pigmented hair.',
      he: 'סרום ללא שטיפה בקטגוריית התכשירים לשיער אפור, לתמיכה במראה ובבריאות של שיער עם פיגמנט טבעי.',
      ar: 'سيروم يُترك دون شطف ضمن فئة التحضيرات الموضعية لشعر الشيب، لدعم مظهر وصحة الشعر ذي التصبغ الطبيعي.',
      ru: 'Несмываемая сыворотка из категории топических средств для седых волос — для поддержки внешнего вида и здоровья волос с естественной пигментацией.',
      fr: 'Un sérum sans rinçage de la catégorie des soins topiques pour cheveux grisonnants, pour soutenir l’apparence et la santé des cheveux naturellement pigmentés.',
      es: 'Un sérum sin aclarado de la categoría de tratamientos tópicos para el cabello canoso, para apoyar el aspecto y la salud del cabello con pigmentación natural.',
    }),
    shortDescription: L6({
      en: 'A daily leave-in serum. The topical half of the Gray system.',
      he: 'סרום יומי ללא שטיפה. החצי המקומי של מערכת Gray.',
      ar: 'سيروم يومي يُترك دون شطف. النصف الموضعي من نظام الشعر الرمادي.',
      ru: 'Ежедневная несмываемая сыворотка. Топическая часть системы седины.',
      fr: 'Un sérum quotidien sans rinçage. La moitié topique du système Cheveux gris.',
      es: 'Un sérum diario sin aclarado. La mitad tópica del sistema de canas.',
    }),
    overview: L6({
      en: 'ROOTÉ Gray Serum is a lightweight daily scalp serum formulated with advanced pigment-supporting actives and nourishing botanicals to support natural-looking hair color, scalp health, and stronger, healthier-looking hair.',
      he: 'ROOTÉ Gray Serum הוא סרום יומי קליל לקרקפת, המכיל רכיבים פעילים מתקדמים לתמיכה בפיגמנט וצמחים מזינים, לתמיכה בגוון שיער טבעי-מראה, בבריאות הקרקפת ובשיער חזק ובריא יותר במראהו.',
      ar: 'ROOTÉ Gray Serum هو سيروم يومي خفيف لفروة الرأس، تمت صياغته بفعاليات متقدمة داعمة للتصبغ ومستخلصات نباتية مغذية، لدعم مظهر طبيعي للون الشعر وصحة فروة الرأس وشعر أقوى وأكثر صحة في مظهره.',
      ru: 'ROOTÉ Gray Serum — это лёгкая ежедневная сыворотка для кожи головы с современными активными компонентами для поддержки пигментации и питательными растительными экстрактами, поддерживающая естественный вид цвета волос, здоровье кожи головы и более крепкие, здоровые на вид волосы.',
      fr: "ROOTÉ Gray Serum est un sérum quotidien léger pour le cuir chevelu, formulé avec des actifs avancés de soutien de la pigmentation et des extraits botaniques nourrissants, pour soutenir une couleur de cheveux d'apparence naturelle, la santé du cuir chevelu et des cheveux plus forts et d'apparence plus saine.",
      es: 'ROOTÉ Gray Serum es un sérum diario ligero para el cuero cabelludo, formulado con activos avanzados de apoyo a la pigmentación y botánicos nutritivos, que ayuda a mantener un color de cabello de aspecto natural, la salud del cuero cabelludo y un cabello más fuerte y de aspecto más saludable.',
    }),
    keyBenefits: [
      L6({
        en: 'Supports Natural Hair Pigment',
        he: 'תומך בפיגמנט הטבעי של השיער',
        ar: 'يدعم التصبغ الطبيعي للشعر',
        ru: 'Поддерживает естественный пигмент волос',
        fr: 'Soutient la pigmentation naturelle des cheveux',
        es: 'Ayuda a mantener el pigmento natural del cabello',
      }),
      L6({
        en: 'Helps Slow Visible Graying',
        he: 'מסייע להאט הופעת שיער אפור נראה לעין',
        ar: 'يساعد على إبطاء ظهور الشيب المرئي',
        ru: 'Помогает замедлить появление видимой седины',
        fr: "Aide à ralentir l'apparition visible des cheveux gris",
        es: 'Ayuda a ralentizar la aparición visible de canas',
      }),
      L6({
        en: 'Nourishes Hair & Scalp',
        he: 'מזין את השיער והקרקפת',
        ar: 'يغذّي الشعر وفروة الرأس',
        ru: 'Питает волосы и кожу головы',
        fr: 'Nourrit les cheveux et le cuir chevelu',
        es: 'Nutre el cabello y el cuero cabelludo',
      }),
    ],
    formulaReference: null,
    displayFormulaDetail: true,
    ingredients: [
      ING(
        'Greyverse™',
        L6({
          en: 'A supplier active marketed for the anti-gray category.',
          he: 'רכיב פעיל של ספק, המשווק לקטגוריית השיער האפור.',
          ar: 'مكوّن فعّال من مورّد خارجي، يُسوَّق لفئة منتجات شعر الشيب.',
          ru: 'Активный ингредиент поставщика, заявляемый для категории средств против седины.',
          fr: 'Un actif fourni par un tiers, commercialisé pour la catégorie des cheveux grisonnants.',
          es: 'Un activo de un proveedor externo, comercializado para la categoría de cabello canoso.',
        }),
        'requires-review',
        'supplier-reference',
        '2%',
      ),
      ING(
        'Darkenyl™',
        L6({
          en: 'A supplier active marketed for pigmentation support.',
          he: 'רכיב פעיל של ספק, המשווק לתמיכה בפיגמנט.',
          ar: 'مكوّن فعّال من مورّد خارجي، يُسوَّق لدعم التصبغ.',
          ru: 'Активный ингредиент поставщика, заявляемый для поддержки пигментации.',
          fr: 'Un actif fourni par un tiers, commercialisé pour le soutien de la pigmentation.',
          es: 'Un activo de un proveedor externo, comercializado para el apoyo de la pigmentación.',
        }),
        'requires-review',
        'supplier-reference',
        '1%',
      ),
      ING(
        'Capixyl™',
        L6({
          en: 'A supplier peptide-based active used in scalp care.',
          he: 'רכיב פעיל מבוסס פפטידים של ספק, בשימוש בטיפוח קרקפת.',
          ar: 'مكوّن فعّال قائم على الببتيدات من مورّد خارجي، يُستخدم في العناية بفروة الرأس.',
          ru: 'Активный пептидный ингредиент поставщика, используемый в уходе за кожей головы.',
          fr: 'Un actif peptidique fourni par un tiers, utilisé dans le soin du cuir chevelu.',
          es: 'Un activo a base de péptidos de un proveedor externo, utilizado en el cuidado del cuero cabelludo.',
        }),
        'requires-review',
        'supplier-reference',
        '2%',
      ),
      ING(
        'Green Tea',
        L6({
          en: 'An antioxidant-rich botanical extract.',
          he: 'תמצית צמחית עשירה בנוגדי חמצון.',
          ar: 'مستخلص نباتي غني بمضادات الأكسدة.',
          ru: 'Растительный экстракт, богатый антиоксидантами.',
          fr: 'Un extrait botanique riche en antioxydants.',
          es: 'Un extracto botánico rico en antioxidantes.',
        }),
      ),
      ING(
        'Fo-Ti',
        L6({
          en: 'A botanical traditionally associated with hair.',
          he: 'צמח הנקשר באופן מסורתי לשיער.',
          ar: 'نبات ارتبط تقليديًا بالعناية بالشعر.',
          ru: 'Растение, традиционно ассоциируемое с уходом за волосами.',
          fr: 'Une plante traditionnellement associée aux cheveux.',
          es: 'Una planta tradicionalmente asociada con el cabello.',
        }),
      ),
      ING(
        'Panthenol',
        L6({
          en: 'Pro-vitamin B5, a common conditioning agent.',
          he: 'פרו-ויטמין B5, רכיב הזנה נפוץ.',
          ar: 'بروفيتامين B5، عامل ترطيب وتنعيم شائع.',
          ru: 'Провитамин B5, распространённый кондиционирующий компонент.',
          fr: 'Provitamine B5, un agent conditionneur courant.',
          es: 'Provitamina B5, un agente acondicionador habitual.',
        }),
      ),
      ING(
        'Caffeine',
        L6({
          en: 'A common scalp-serum ingredient.',
          he: 'רכיב נפוץ בסרומים לקרקפת.',
          ar: 'مكوّن شائع في أمصال فروة الرأس.',
          ru: 'Распространённый компонент сывороток для кожи головы.',
          fr: 'Un ingrédient courant des sérums pour cuir chevelu.',
          es: 'Un ingrediente habitual en los sérums para el cuero cabelludo.',
        }),
      ),
      ING(
        'Ginseng',
        L6({
          en: 'A botanical used in scalp-care formulas.',
          he: 'צמח בשימוש בפורמולות לקרקפת.',
          ar: 'نبات يُستخدم في تركيبات العناية بفروة الرأس.',
          ru: 'Растение, используемое в формулах для ухода за кожей головы.',
          fr: 'Une plante utilisée dans les formules de soin du cuir chevelu.',
          es: 'Una planta utilizada en fórmulas para el cuidado del cuero cabelludo.',
        }),
      ),
      ING(
        'Biotin',
        L6({
          en: 'A B-vitamin commonly included in hair supplements.',
          he: 'ויטמין B הנפוץ בתוספי שיער.',
          ar: 'فيتامين B شائع الإدراج في مكمّلات الشعر.',
          ru: 'Витамин группы B, часто входящий в состав добавок для волос.',
          fr: 'Une vitamine B couramment intégrée aux compléments pour cheveux.',
          es: 'Una vitamina B habitualmente incluida en los suplementos para el cabello.',
        }),
      ),
      ING(
        'Red Clover Extract',
        L6({
          en: 'A botanical extract used in scalp-care formulas.',
          he: 'תמצית צמחית בשימוש בפורמולות לטיפוח קרקפת.',
          ar: 'مستخلص نباتي يُستخدم في تركيبات العناية بفروة الرأس.',
          ru: 'Растительный экстракт, используемый в формулах для ухода за кожей головы.',
          fr: 'Un extrait botanique utilisé dans les formules de soin du cuir chevelu.',
          es: 'Un extracto botánico utilizado en fórmulas para el cuidado del cuero cabelludo.',
        }),
      ),
      ING(
        'Zinc',
        L6({
          en: 'A mineral that contributes to normal hair.',
          he: 'מינרל התורם לשיער תקין.',
          ar: 'معدن يساهم في الحفاظ على شعر طبيعي وسليم.',
          ru: 'Минерал, способствующий поддержанию нормального состояния волос.',
          fr: 'Un minéral qui contribue à des cheveux normaux.',
          es: 'Un mineral que contribuye a un cabello normal.',
        }),
      ),
      ING(
        'Canadian Willow Herb',
        L6({
          en: 'A botanical extract used in scalp-serum formulas.',
          he: 'תמצית צמחית בשימוש בפורמולות סרום לקרקפת.',
          ar: 'مستخلص نباتي يُستخدم في تركيبات أمصال فروة الرأس.',
          ru: 'Растительный экстракт, используемый в формулах сывороток для кожи головы.',
          fr: 'Un extrait botanique utilisé dans les formules de sérum pour cuir chevelu.',
          es: 'Un extracto botánico utilizado en fórmulas de sérum para el cuero cabelludo.',
        }),
      ),
      ING(
        'Hydrolyzed Wheat Protein',
        L6({
          en: 'A conditioning protein used in leave-in formulas.',
          he: 'חלבון הזנה בשימוש בפורמולות ללא שטיפה.',
          ar: 'بروتين ترطيب يُستخدم في التركيبات التي تُترك دون شطف.',
          ru: 'Кондиционирующий белок, используемый в несмываемых формулах.',
          fr: 'Une protéine conditionnante utilisée dans les formules sans rinçage.',
          es: 'Una proteína acondicionadora utilizada en fórmulas sin aclarado.',
        }),
      ),
    ],
    fullIngredientList: [
      'Greyverse™ 2%',
      'Darkenyl™ 1%',
      'Capixyl™ 2%',
      'Green Tea Leaf Extract',
      'Panthenol',
      'Biotin',
      'Red Clover Extract',
      'Ginseng',
      'Fo-Ti Root',
      'Zinc',
      'Caffeine',
      'Canadian Willow Herb',
      'Hydrolyzed Wheat Protein',
    ],
    usage: L6({
      en: 'Apply once daily directly to the scalp. Part the hair and apply a small amount to areas showing gray or graying hair. Massage gently with your fingertips until absorbed. Use on dry or towel-dried hair. For best results, apply before bed and leave in overnight. Do not rinse.',
      he: 'למרוח פעם ביום ישירות על הקרקפת. לחלק את השיער ולמרוח כמות קטנה על אזורים בהם מופיע שיער אפור או מאפיר. לעסות בעדינות באצבעות עד לספיגה. להשתמש על שיער יבש או מיובש למחצה במגבת. לתוצאות מיטביות, למרוח לפני השינה ולהשאיר למשך הלילה. לא לשטוף.',
      ar: 'يُطبَّق مرة واحدة يوميًا مباشرة على فروة الرأس. يُفرَق الشعر وتُوضَع كمية صغيرة على المناطق التي يظهر فيها الشعر الرمادي أو المشيب. يُدلَّك بلطف بأطراف الأصابع حتى الامتصاص. يُستخدم على شعر جاف أو مجفف جزئيًا بالمنشفة. للحصول على أفضل النتائج، يُطبَّق قبل النوم ويُترَك طوال الليل. لا يُشطف.',
      ru: 'Наносить один раз в день непосредственно на кожу головы. Разделить волосы пробором и нанести небольшое количество на участки с седыми или седеющими волосами. Аккуратно помассировать пальцами до впитывания. Использовать на сухих или подсушенных полотенцем волосах. Для лучшего результата наносить перед сном и оставлять на ночь. Не смывать.',
      fr: "Appliquer une fois par jour directement sur le cuir chevelu. Séparer les cheveux et appliquer une petite quantité sur les zones présentant des cheveux gris ou grisonnants. Masser délicatement du bout des doigts jusqu'à absorption. Utiliser sur cheveux secs ou séchés à la serviette. Pour de meilleurs résultats, appliquer avant le coucher et laisser poser toute la nuit. Ne pas rincer.",
      es: 'Aplicar una vez al día directamente sobre el cuero cabelludo. Separar el cabello y aplicar una pequeña cantidad en las zonas con cabello canoso o encaneciendo. Masajear suavemente con los dedos hasta su absorción. Usar sobre cabello seco o secado con toalla. Para mejores resultados, aplicar antes de dormir y dejar actuar toda la noche. No aclarar.',
    }),
    safety: L6({
      en: 'For external use only. Avoid contact with eyes. Do not apply to broken, irritated, or inflamed skin. Discontinue use if irritation or discomfort occurs. Keep out of reach of children. Do not swallow. If you are pregnant, breastfeeding, have a medical condition, or are taking medication, consult a healthcare professional before use.',
      he: 'לשימוש חיצוני בלבד. יש להימנע ממגע עם העיניים. אין למרוח על עור פגום, מגורה או דלקתי. יש להפסיק שימוש אם מופיע גירוי או אי-נוחות. יש להרחיק מהישג ידם של ילדים. אין לבלוע. בהיריון, בהנקה, במצב רפואי קיים או בנטילת תרופות, יש להתייעץ עם איש מקצוע רפואי לפני השימוש.',
      ar: 'للاستخدام الخارجي فقط. يُتجنَّب ملامسة العينين. لا يُوضَع على جلد مصاب أو متهيّج أو ملتهب. يُوقَف الاستخدام عند ظهور تهيّج أو عدم راحة. يُحفَظ بعيدًا عن متناول الأطفال. يُحظر البلع. في حال الحمل أو الرضاعة الطبيعية أو وجود حالة طبية أو تناول أدوية، يُرجى استشارة أخصائي رعاية صحية قبل الاستخدام.',
      ru: 'Только для наружного применения. Избегать попадания в глаза. Не наносить на повреждённую, раздражённую или воспалённую кожу. Прекратить использование при появлении раздражения или дискомфорта. Хранить в недоступном для детей месте. Не проглатывать. При беременности, грудном вскармливании, наличии заболевания или приёме лекарств проконсультируйтесь с врачом перед использованием.',
      fr: "Réservé à l'usage externe. Éviter le contact avec les yeux. Ne pas appliquer sur une peau lésée, irritée ou enflammée. Arrêter l'utilisation en cas d'irritation ou d'inconfort. Tenir hors de portée des enfants. Ne pas avaler. En cas de grossesse, d'allaitement, de problème médical ou de prise de médicaments, consulter un professionnel de santé avant utilisation.",
      es: 'Solo para uso externo. Evitar el contacto con los ojos. No aplicar sobre piel dañada, irritada o inflamada. Suspender el uso si aparece irritación o molestia. Mantener fuera del alcance de los niños. No ingerir. Si está embarazada, en periodo de lactancia, tiene una afección médica o toma medicación, consulte a un profesional de la salud antes de usarlo.',
    }),
    storage: TOPICAL_STORAGE,
    badges: ['vegan', 'cruelty-free', 'fragrance-free'],
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
    subtitle: L6({
      en: 'Daily Pigment Support',
      he: 'תמיכה יומית בפיגמנט',
      ar: 'دعم يومي للتصبغ',
      ru: 'Ежедневная поддержка пигментации',
      fr: 'Soutien quotidien de la pigmentation',
      es: 'Apoyo diario a la pigmentación',
    }),
    concern: 'gray-support',
    format: 'capsule-supplement',
    size: '60 capsules',
    role: L6({
      en: 'Inside-out nutritional support in the Gray system.',
      he: 'תמיכה תזונתית מבפנים במערכת Gray.',
      ar: 'دعم غذائي من الداخل ضمن نظام الشعر الرمادي.',
      ru: 'Нутритивная поддержка изнутри в системе седины.',
      fr: 'Le soutien nutritionnel « de l’intérieur » du système Cheveux gris.',
      es: 'El apoyo nutricional «desde dentro» del sistema de canas.',
    }),
    heroCopy: L6({
      en: 'A daily capsule in the anti-gray nutritional-support category, for people focused on visible gray-hair management.',
      he: 'קפסולה יומית בקטגוריית התמיכה התזונתית, למי שמתמקד בניהול שיער אפור נראה לעין.',
      ar: 'كبسولة يومية ضمن فئة الدعم الغذائي لشعر الشيب، لمن يركّز على إدارة الشيب الظاهر.',
      ru: 'Ежедневная капсула из категории нутритивной поддержки против седины — для тех, кто уделяет внимание видимой седине.',
      fr: 'Une gélule quotidienne de la catégorie du soutien nutritionnel pour cheveux grisonnants, pour les personnes attentives à la gestion des cheveux gris visibles.',
      es: 'Una cápsula diaria de la categoría de apoyo nutricional para el cabello canoso, para quienes se centran en el manejo de las canas visibles.',
    }),
    shortDescription: L6({
      en: 'One daily capsule. The inside half of the Gray system.',
      he: 'קפסולה אחת ביום. החצי הפנימי של מערכת Gray.',
      ar: 'كبسولة واحدة يوميًا. النصف الداخلي من نظام الشعر الرمادي.',
      ru: 'Одна капсула в день. Внутренняя часть системы седины.',
      fr: 'Une gélule par jour. La moitié « interne » du système Cheveux gris.',
      es: 'Una cápsula al día. La mitad «interna» del sistema de canas.',
    }),
    // No box label on hand yet for Gray Support (bottle label only) — overview omitted rather than invented.
    keyBenefits: [
      L6({
        en: 'Advanced Hair & Pigment Support',
        he: 'תמיכה מתקדמת לשיער ולפיגמנט',
        ar: 'دعم متقدم للشعر والتصبغ',
        ru: 'Продвинутая поддержка волос и пигментации',
        fr: 'Soutien avancé pour les cheveux et la pigmentation',
        es: 'Apoyo avanzado para el cabello y la pigmentación',
      }),
      L6({
        en: 'Supports Natural Hair Pigment',
        he: 'תומך בפיגמנט הטבעי של השיער',
        ar: 'يدعم التصبغ الطبيعي للشعر',
        ru: 'Поддерживает естественный пигмент волос',
        fr: 'Soutient la pigmentation naturelle des cheveux',
        es: 'Ayuda a mantener el pigmento natural del cabello',
      }),
      L6({
        en: 'Supports Healthy Hair Growth',
        he: 'תומך בצמיחת שיער בריאה',
        ar: 'يدعم نمو شعر صحي',
        ru: 'Поддерживает здоровый рост волос',
        fr: 'Favorise une croissance capillaire saine',
        es: 'Favorece un crecimiento capilar saludable',
      }),
    ],
    formulaReference: null,
    displayFormulaDetail: true,
    ingredients: [
      ING(
        'Biotin',
        L6({
          en: 'A B-vitamin commonly included in hair supplements.',
          he: 'ויטמין B הנפוץ בתוספי שיער.',
          ar: 'فيتامين B شائع الإدراج في مكمّلات الشعر.',
          ru: 'Витамин группы B, часто входящий в состав добавок для волос.',
          fr: 'Une vitamine B couramment intégrée aux compléments pour cheveux.',
          es: 'Una vitamina B habitualmente incluida en los suplementos para el cabello.',
        }),
      ),
      ING(
        'Catalase',
        L6({
          en: 'An enzyme referenced in the anti-gray supplement category.',
          he: 'אנזים המוזכר בקטגוריית התוספים לשיער אפור.',
          ar: 'إنزيم يُشار إليه في فئة مكمّلات شعر الشيب.',
          ru: 'Фермент, упоминаемый в категории добавок против седины.',
          fr: 'Une enzyme mentionnée dans la catégorie des compléments pour cheveux grisonnants.',
          es: 'Una enzima mencionada en la categoría de suplementos para el cabello canoso.',
        }),
      ),
      ING(
        'Fo-Ti',
        L6({
          en: 'A botanical traditionally associated with hair.',
          he: 'צמח הנקשר באופן מסורתי לשיער.',
          ar: 'نبات ارتبط تقليديًا بالعناية بالشعر.',
          ru: 'Растение, традиционно ассоциируемое с уходом за волосами.',
          fr: 'Une plante traditionnellement associée aux cheveux.',
          es: 'Una planta tradicionalmente asociada con el cabello.',
        }),
      ),
      ING(
        'L-Tyrosine',
        L6({
          en: 'An amino acid involved in pigment pathways.',
          he: 'חומצת אמינו המעורבת במסלולי פיגמנט.',
          ar: 'حمض أميني له دور في مسارات التصبغ.',
          ru: 'Аминокислота, участвующая в путях пигментации.',
          fr: "Un acide aminé impliqué dans les voies de la pigmentation.",
          es: 'Un aminoácido implicado en las vías de la pigmentación.',
        }),
      ),
      ING(
        'Nettle Root',
        L6({
          en: 'A botanical used in hair-support blends.',
          he: 'צמח בשימוש בתערובות תמיכה לשיער.',
          ar: 'نبات يُستخدم في مزائج دعم الشعر.',
          ru: 'Растение, используемое в составах для поддержки волос.',
          fr: 'Une plante utilisée dans les mélanges de soutien capillaire.',
          es: 'Una planta utilizada en mezclas de apoyo para el cabello.',
        }),
      ),
      ING(
        'Saw Palmetto',
        L6({
          en: 'A botanical referenced in hair-support supplements.',
          he: 'צמח המוזכר בתוספי תמיכה לשיער.',
          ar: 'نبات يُذكر في مكمّلات دعم الشعر.',
          ru: 'Растение, упоминаемое в добавках для поддержки волос.',
          fr: 'Une plante mentionnée dans les compléments de soutien capillaire.',
          es: 'Una planta mencionada en los suplementos de apoyo capilar.',
        }),
      ),
      ING(
        'PABA',
        L6({
          en: 'A compound included in some hair supplements.',
          he: 'תרכובת הנכללת בחלק מתוספי השיער.',
          ar: 'مركّب يُدرَج في بعض مكمّلات الشعر.',
          ru: 'Соединение, входящее в состав некоторых добавок для волос.',
          fr: 'Un composé présent dans certains compléments pour cheveux.',
          es: 'Un compuesto incluido en algunos suplementos para el cabello.',
        }),
      ),
      ING(
        'Zinc',
        L6({
          en: 'A mineral that contributes to normal hair.',
          he: 'מינרל התורם לשיער תקין.',
          ar: 'معدن يساهم في الحفاظ على شعر طبيعي وسليم.',
          ru: 'Минерал, способствующий поддержанию нормального состояния волос.',
          fr: 'Un minéral qui contribue à des cheveux normaux.',
          es: 'Un mineral que contribuye a un cabello normal.',
        }),
      ),
    ],
    fullIngredientList: [],
    supplementFacts: {
      servingSize: '2 Capsules',
      servingsPerContainer: 30,
      rows: [
        { name: 'Vitamin B-6 (as pyridoxine HCl)', amount: '10 mg', dailyValue: '588%' },
        { name: 'Folate (670 mcg DFE, 400 mcg folic acid)', amount: '670 mcg DFE', dailyValue: '167%' },
        { name: 'Biotin', amount: '300 mcg', dailyValue: '1,000%' },
        { name: 'Pantothenic Acid (as d-calcium pantothenate)', amount: '300 mg', dailyValue: '6,000%' },
        { name: 'Zinc (as zinc oxide)', amount: '10 mg', dailyValue: '91%' },
        { name: 'Copper (as cupric oxide)', amount: '1 mg', dailyValue: '111%' },
        { name: 'Catalase Complex', amount: '50 mg', dailyValue: null },
        { name: 'Horsetail Stem (8% extract)', amount: '100 mg', dailyValue: null },
        { name: 'Saw Palmetto Berries (45% extract)', amount: '300 mg', dailyValue: null },
        { name: 'PABA (para-Aminobenzoic Acid)', amount: '200 mg', dailyValue: null },
        { name: 'L-Tyrosine', amount: '200 mg', dailyValue: null },
        { name: 'Plant Sterols (45% beta-sitosterol)', amount: '100 mg', dailyValue: null },
        { name: 'Nettle Root 4:1 Extract', amount: '100 mg', dailyValue: null },
        { name: 'Chlorella Extract (2% chlorophyll)', amount: '20 mg', dailyValue: null },
        { name: 'Fo-Ti Root Powder', amount: '20 mg', dailyValue: null },
        { name: 'Barley Grass Juice Powder', amount: '20 mg', dailyValue: null },
      ],
      otherIngredients: 'Gelatin (bovine), vegetable magnesium stearate, and silicon dioxide.',
      allergenWarning: L6({
        en: 'Contains soy and wheat (barley grass).',
        he: 'מכיל סויה וחיטה (עשב שעורה).',
        ar: 'يحتوي على الصويا والقمح (عشب الشعير).',
        ru: 'Содержит сою и пшеницу (ячменная трава).',
        fr: "Contient du soja et du blé (herbe d'orge).",
        es: 'Contiene soja y trigo (hierba de cebada).',
      }),
    },
    usage: L6({
      en: 'Take 2 capsules daily with water and a meal if preferred, or as directed by a healthcare professional.',
      he: 'ליטול 2 קפסולות ביום עם מים וארוחה, אם רוצים, או לפי הנחיית איש מקצוע רפואי.',
      ar: 'تؤخذ كبسولتان يوميًا مع الماء ووجبة إن أمكن، أو حسب توجيه أخصائي رعاية صحية.',
      ru: 'Принимать 2 капсулы в день, запивая водой, желательно во время еды, или по указанию врача.',
      fr: "Prendre 2 gélules par jour avec de l'eau et, si possible, au cours d'un repas, ou selon les indications d'un professionnel de santé.",
      es: 'Tomar 2 cápsulas al día con agua y, si se prefiere, con una comida, o según las indicaciones de un profesional de la salud.',
    }),
    safety: L6({
      en: 'A food supplement, not a medicine. Do not exceed the stated dose. Speak to a doctor if you are pregnant, breastfeeding, or on medication.',
      he: 'תוסף תזונה, לא תרופה. אין לחרוג מהמינון המצוין. יש להתייעץ עם רופא בהיריון, בהנקה או בנטילת תרופות.',
      ar: 'مكمّل غذائي وليس دواءً. يُحظر تجاوز الجرعة الموصى بها. يُرجى استشارة الطبيب في حال الحمل أو الرضاعة أو عند تناول أدوية.',
      ru: 'Пищевая добавка, не является лекарственным средством. Не превышать указанную дозу. Проконсультируйтесь с врачом при беременности, грудном вскармливании или приёме лекарств.',
      fr: "Un complément alimentaire, pas un médicament. Ne pas dépasser la dose indiquée. Consultez un médecin en cas de grossesse, d'allaitement ou de traitement médicamenteux.",
      es: 'Un suplemento alimenticio, no un medicamento. No superar la dosis indicada. Consulte a un médico si está embarazada, en periodo de lactancia o tomando medicación.',
    }),
    badges: [],
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
    subtitle: L6({
      en: 'Scalp & Density Support Cleanser',
      he: 'תכשיר ניקוי לתמיכה בקרקפת וב-Density',
      ar: 'منظّف داعم لفروة الرأس والكثافة',
      ru: 'Очищающее средство для поддержки кожи головы и плотности волос',
      fr: 'Nettoyant de soutien cuir chevelu et Densité',
      es: 'Limpiador de apoyo para el cuero cabelludo y la densidad',
    }),
    concern: 'thinning-support',
    format: 'shampoo',
    size: '200 mL',
    role: L6({
      en: 'Daily cleanse layer in the Density system.',
      he: 'שכבת הניקוי היומית במערכת Density.',
      ar: 'خطوة التنظيف اليومية ضمن نظام الكثافة.',
      ru: 'Ежедневный этап очищения в системе плотности.',
      fr: 'L’étape de nettoyage quotidienne du système Densité.',
      es: 'El paso de limpieza diario del sistema de densidad.',
    }),
    heroCopy: L6({
      en: 'A scalp-focused shampoo for thinning hair, built to sit alongside a Density program.',
      he: 'שמפו ממוקד קרקפת לשיער דליל, שנבנה ללוות תוכנית Density.',
      ar: 'شامبو يركّز على فروة الرأس لترقّق الشعر، صُمِّم ليواكب برنامج الكثافة.',
      ru: 'Шампунь, сфокусированный на коже головы, для истончённых волос, созданный в дополнение к программе плотности.',
      fr: 'Un shampooing ciblant le cuir chevelu pour cheveux clairsemés, conçu pour accompagner un programme Densité.',
      es: 'Un champú centrado en el cuero cabelludo para el cabello fino, diseñado para acompañar un programa de densidad.',
    }),
    shortDescription: L6({
      en: 'Use in place of your regular shampoo. The daily cleanse step.',
      he: 'להשתמש במקום השמפו הרגיל. שלב הניקוי היומי.',
      ar: 'يُستخدم بدلاً من الشامبو المعتاد. خطوة التنظيف اليومية.',
      ru: 'Использовать вместо обычного шампуня. Ежедневный этап очищения.',
      fr: 'À utiliser à la place de votre shampooing habituel. L’étape de nettoyage quotidienne.',
      es: 'Usar en lugar de su champú habitual. El paso de limpieza diario.',
    }),
    // Front box panel (with its overview paragraph) not supplied yet — omitted rather than invented.
    keyBenefits: [
      L6({
        en: 'Supports Healthy-Looking Hair Growth',
        he: 'תומך בצמיחת שיער בעל מראה בריא',
        ar: 'يدعم مظهر نمو شعر صحي',
        ru: 'Поддерживает здоровый на вид рост волос',
        fr: "Favorise une croissance capillaire à l'apparence saine",
        es: 'Favorece un crecimiento capilar de aspecto saludable',
      }),
      L6({
        en: 'Nourishes and Supports the Scalp',
        he: 'מזין ותומך בקרקפת',
        ar: 'يغذّي فروة الرأس ويدعمها',
        ru: 'Питает и поддерживает кожу головы',
        fr: 'Nourrit et soutient le cuir chevelu',
        es: 'Nutre y ayuda al cuero cabelludo',
      }),
      L6({
        en: 'Strengthens Hair from Root to Ends',
        he: 'מחזק את השיער מהשורש ועד הקצוות',
        ar: 'يقوّي الشعر من الجذور حتى الأطراف',
        ru: 'Укрепляет волосы от корней до кончиков',
        fr: 'Renforce les cheveux de la racine aux pointes',
        es: 'Fortalece el cabello desde la raíz hasta las puntas',
      }),
      L6({
        en: 'Leaves Hair Softer, Hydrated, & Fresh',
        he: 'משאיר את השיער רך, לח ורענן',
        ar: 'يترك الشعر أكثر نعومة ورطوبة ونضارة',
        ru: 'Оставляет волосы более мягкими, увлажнёнными и свежими',
        fr: 'Laisse les cheveux plus doux, hydratés et frais',
        es: 'Deja el cabello más suave, hidratado y fresco',
      }),
    ],
    formulaReference: null,
    displayFormulaDetail: true,
    ingredients: [
      ING(
        'Biotin',
        L6({
          en: 'A B-vitamin commonly included in hair care.',
          he: 'ויטמין B הנפוץ בטיפוח שיער.',
          ar: 'فيتامين B شائع الاستخدام في منتجات العناية بالشعر.',
          ru: 'Витамин группы B, часто применяемый в уходе за волосами.',
          fr: 'Une vitamine B couramment utilisée dans les soins capillaires.',
          es: 'Una vitamina B habitualmente utilizada en el cuidado del cabello.',
        }),
      ),
      ING(
        'Ginseng',
        L6({
          en: 'A botanical used in scalp-care formulas.',
          he: 'צמח בשימוש בפורמולות לקרקפת.',
          ar: 'نبات يُستخدم في تركيبات العناية بفروة الرأس.',
          ru: 'Растение, используемое в формулах для ухода за кожей головы.',
          fr: 'Une plante utilisée dans les formules de soin du cuir chevelu.',
          es: 'Una planta utilizada en fórmulas para el cuidado del cuero cabelludo.',
        }),
      ),
      ING(
        'Rosemary',
        L6({
          en: 'A botanical extract used in scalp products.',
          he: 'תמצית צמחית בשימוש במוצרי קרקפת.',
          ar: 'مستخلص نباتي يُستخدم في منتجات فروة الرأس.',
          ru: 'Растительный экстракт, используемый в средствах для кожи головы.',
          fr: 'Un extrait botanique utilisé dans les produits pour cuir chevelu.',
          es: 'Un extracto botánico utilizado en productos para el cuero cabelludo.',
        }),
      ),
      ING(
        'Nettle',
        L6({
          en: 'A botanical used in hair-support blends.',
          he: 'צמח בשימוש בתערובות תמיכה לשיער.',
          ar: 'نبات يُستخدم في مزائج دعم الشعر.',
          ru: 'Растение, используемое в составах для поддержки волос.',
          fr: 'Une plante utilisée dans les mélanges de soutien capillaire.',
          es: 'Una planta utilizada en mezclas de apoyo para el cabello.',
        }),
      ),
      ING(
        'Horsetail',
        L6({
          en: 'A silica-bearing botanical used in hair care.',
          he: 'צמח עשיר בסיליקה בשימוש בטיפוח שיער.',
          ar: 'نبات غني بالسيليكا يُستخدم في العناية بالشعر.',
          ru: 'Растение, богатое кремнезёмом, используемое в уходе за волосами.',
          fr: 'Une plante riche en silice utilisée dans les soins capillaires.',
          es: 'Una planta rica en sílice utilizada en el cuidado del cabello.',
        }),
      ),
      ING(
        'Sage',
        L6({
          en: 'An aromatic botanical used in scalp formulas.',
          he: 'צמח ארומטי בשימוש בפורמולות לקרקפת.',
          ar: 'نبات عطري يُستخدم في تركيبات فروة الرأس.',
          ru: 'Ароматическое растение, используемое в формулах для кожи головы.',
          fr: 'Une plante aromatique utilisée dans les formules pour cuir chevelu.',
          es: 'Una planta aromática utilizada en fórmulas para el cuero cabelludo.',
        }),
      ),
      ING(
        'Jojoba',
        L6({
          en: 'A plant oil used to condition hair and scalp.',
          he: 'שמן צמחי להזנת השיער והקרקפת.',
          ar: 'زيت نباتي يُستخدم لترطيب الشعر وفروة الرأس.',
          ru: 'Растительное масло, используемое для кондиционирования волос и кожи головы.',
          fr: 'Une huile végétale utilisée pour nourrir les cheveux et le cuir chevelu.',
          es: 'Un aceite vegetal utilizado para acondicionar el cabello y el cuero cabelludo.',
        }),
      ),
      ING(
        'Panthenol',
        L6({
          en: 'Pro-vitamin B5, a common conditioning agent.',
          he: 'פרו-ויטמין B5, רכיב הזנה נפוץ.',
          ar: 'بروفيتامين B5، عامل ترطيب وتنعيم شائع.',
          ru: 'Провитамин B5, распространённый кондиционирующий компонент.',
          fr: 'Provitamine B5, un agent conditionneur courant.',
          es: 'Provitamina B5, un agente acondicionador habitual.',
        }),
      ),
    ],
    fullIngredientList: [
      'Water (Aqua)',
      'Lavandula Officinalis (Organic Lavender) Water',
      'Rosmarinus Officinalis (Organic Rosemary) Water',
      'Equisetum Arvense (Organic Horsetail Plant) Extract',
      'Urtica Dioica (Organic Nettle) Leaf Extract',
      'Salvia Officinalis (Organic Sage) Extract',
      'Panax Ginseng (Organic Korean Ginseng) Extract',
      'Calendula Officinalis (Organic Calendula) Extract',
      'Olea Europaea (Organic Olive) Oil',
      'Camellia Oleifera (Organic Camellia) Leaf Extract',
      'Simmondsia Chinensis (Jojoba Oil)',
      'Laminaria Digitata (Seaweed) Extract',
      'Decyl Polyglucose',
      'Coco Glucoside',
      'Cocamidopropyl Betaine',
      'Xanthan Gum',
      'Vegetable Glycerin',
      'Biotin',
      'Cannabis Sativa (Organic Hemp) Seed Oil',
      'Panthenol (ProVitamin B5)',
      'Hydrolyzed Rice Protein',
      'Inositol',
      'Cystine',
      'Cysteine',
      'Methionine',
      'Sodium Benzoate',
      'Benzoic Acid',
      'Vitamin D',
      'Citric Acid',
      'Benzyl Alcohol',
      'Salicylic Acid',
      'Glycerin',
      'Sorbic Acid',
    ],
    usage: L6({
      en: 'Apply a generous amount to wet hair. Massage gently into the scalp and through the lengths to create a rich lather. Rinse thoroughly with warm water. Repeat if desired. Follow with conditioner.',
      he: 'למרוח כמות נדיבה על שיער רטוב. לעסות בעדינות בקרקפת ולאורך השיער עד להיווצרות קצף עשיר. לשטוף היטב במים פושרים. לחזור אם רוצים. להמשיך עם מרכך.',
      ar: 'تُوضَع كمية وافرة على الشعر المبلل. يُدلَّك برفق على فروة الرأس وعلى طول الشعر حتى تكوين رغوة غنية. يُشطف جيدًا بماء دافئ. يمكن التكرار عند الرغبة. يُستكمَل باستخدام بلسم.',
      ru: 'Нанести щедрое количество на влажные волосы. Аккуратно помассировать кожу головы и распределить по длине волос до образования густой пены. Тщательно смыть тёплой водой. При желании повторить. Затем нанести кондиционер.',
      fr: 'Appliquer une quantité généreuse sur cheveux mouillés. Masser délicatement le cuir chevelu et répartir sur les longueurs pour créer une mousse riche. Rincer abondamment à l’eau tiède. Répéter si besoin. Terminer avec un après-shampooing.',
      es: 'Aplicar una cantidad generosa sobre el cabello mojado. Masajear suavemente el cuero cabelludo y a lo largo del cabello hasta formar una espuma rica. Aclarar bien con agua tibia. Repetir si se desea. Continuar con acondicionador.',
    }),
    safety: L6({
      en: 'For external use only. Avoid contact with eyes. If contact occurs, rinse thoroughly with water. Discontinue use if irritation occurs. Keep out of reach of children.',
      he: 'לשימוש חיצוני בלבד. יש להימנע ממגע עם העיניים. במקרה של מגע, יש לשטוף היטב במים. יש להפסיק שימוש אם מופיע גירוי. יש להרחיק מהישג ידם של ילדים.',
      ar: 'للاستخدام الخارجي فقط. يُتجنَّب ملامسة العينين. في حال ملامسة العينين، يُشطف جيدًا بالماء. يُوقَف الاستخدام عند ظهور أي تهيّج. يُحفَظ بعيدًا عن متناول الأطفال.',
      ru: 'Только для наружного применения. Избегать попадания в глаза. При попадании в глаза тщательно промыть водой. Прекратить использование при появлении раздражения. Хранить в недоступном для детей месте.',
      fr: "Réservé à l'usage externe. Éviter le contact avec les yeux. En cas de contact, rincer abondamment à l'eau. Arrêter l'utilisation en cas d'irritation. Tenir hors de portée des enfants.",
      es: 'Solo para uso externo. Evitar el contacto con los ojos. Si ocurre contacto, aclarar bien con agua. Suspender el uso si aparece irritación. Mantener fuera del alcance de los niños.',
    }),
    storage: TOPICAL_STORAGE,
    badges: ['paraben-free', 'sulfate-free', 'cruelty-free'],
    requiresMedicalReview: false,
    packagingThemed: true,
    relatedProducts: ['density-6', 'density-10', 'density-15'],
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
  {
    slug: 'color-restore-shampoo',
    name: 'Color Restore Shampoo',
    note: L6({
      en: 'Archived concept, superseded by Gray Serum for the anti-gray topical role.',
      he: 'קונספט בארכיון, הוחלף בסרום Gray לתפקיד התכשיר המקומי לשיער אפור.',
      ar: 'مفهوم مؤرشف، حلّ محله Gray Serum لأداء دور التحضير الموضعي لشعر الشيب.',
      ru: 'Архивная концепция, заменена Gray Serum в роли топического средства для седых волос.',
      fr: 'Concept archivé, remplacé par Gray Serum pour le rôle de soin topique dédié aux cheveux grisonnants.',
      es: 'Concepto archivado, sustituido por Gray Serum en el papel de tratamiento tópico para el cabello canoso.',
    }),
  },
] as const;
