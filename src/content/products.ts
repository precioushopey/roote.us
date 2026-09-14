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
  note: LocalizedText,
  claimStatus: ClaimStatus = 'working',
  sourceType: ClaimSourceType = 'ingredient-literature',
): Ingredient => ({ name, note, claimStatus, sourceType });

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
    formulaReference: L6({
      en: 'Working reference: 6% Minoxidil + 0.3% Finasteride.',
      he: 'התייחסות עבודה: 6% מינוקסידיל + 0.3% פינסטריד.',
      ar: 'مرجع العمل: 6% Minoxidil + 0.3% Finasteride.',
      ru: 'Рабочая формула: 6% Minoxidil + 0.3% Finasteride.',
      fr: 'Référence de travail : 6% Minoxidil + 0.3% Finasteride.',
      es: 'Referencia de trabajo: 6% Minoxidil + 0.3% Finasteride.',
    }),
    displayFormulaDetail: false,
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
      ),
    ],
    usage: L6({
      en: 'Apply to the scalp across the areas of concern, once or twice daily as directed at review.',
      he: 'למרוח על הקרקפת באזורים הרלוונטיים, פעם או פעמיים ביום, לפי ההנחיה בבדיקה.',
      ar: 'يوضع على فروة الرأس في المناطق المعنية، مرة أو مرتين يوميًا، حسب التوجيه في الفحص.',
      ru: 'Наносить на кожу головы в проблемных зонах один или два раза в день, согласно указаниям, полученным при осмотре.',
      fr: 'À appliquer sur le cuir chevelu au niveau des zones concernées, une à deux fois par jour, selon les indications données lors du bilan.',
      es: 'Aplicar en el cuero cabelludo en las zonas de interés, una o dos veces al día, según las indicaciones dadas en la evaluación.',
    }),
    safety: L6({
      en: 'Prescription-strength topical. Eligibility and directions are confirmed at treatment review. Not for use in pregnancy or while breastfeeding.',
      he: 'תרחיף בעוצמת מרשם. ההתאמה וההנחיות נקבעות בבדיקת הטיפול. אין להשתמש בהיריון או בהנקה.',
      ar: 'محلول موضعي بتركيز يستلزم وصفة طبية. تُحدَّد الأهلية والتوجيهات في فحص العلاج. لا يُستخدم أثناء الحمل أو الرضاعة الطبيعية.',
      ru: 'Топическое средство рецептурной силы действия. Соответствие и указания по применению определяются при осмотре перед началом лечения. Не применять при беременности и в период грудного вскармливания.',
      fr: "Soin topique de force prescriptible. L'éligibilité et les indications sont confirmées lors du bilan de traitement. Ne pas utiliser pendant la grossesse ou l'allaitement.",
      es: 'Tratamiento tópico de concentración con receta. La elegibilidad y las indicaciones se confirman en la evaluación del tratamiento. No usar durante el embarazo ni la lactancia.',
    }),
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
    formulaReference: L6({
      en: 'Working reference: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid.',
      he: 'התייחסות עבודה: 10% מינוקסידיל + 0.1% פינסטריד + 5% חומצה אזלאית.',
      ar: 'مرجع العمل: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid.',
      ru: 'Рабочая формула: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid.',
      fr: 'Référence de travail : 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid.',
      es: 'Referencia de trabajo: 10% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid.',
    }),
    displayFormulaDetail: false,
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
      ),
    ],
    usage: L6({
      en: 'Apply to the scalp across the areas of concern once or twice daily, as directed at review.',
      he: 'למרוח על הקרקפת באזורים הרלוונטיים פעם או פעמיים ביום, לפי ההנחיה בבדיקה.',
      ar: 'يوضع على فروة الرأس في المناطق المعنية مرة أو مرتين يوميًا، حسب التوجيه في الفحص.',
      ru: 'Наносить на кожу головы в проблемных зонах один или два раза в день согласно указаниям, полученным при осмотре.',
      fr: 'À appliquer sur le cuir chevelu au niveau des zones concernées une à deux fois par jour, selon les indications données lors du bilan.',
      es: 'Aplicar en el cuero cabelludo en las zonas de interés una o dos veces al día, según las indicaciones dadas en la evaluación.',
    }),
    safety: L6({
      en: 'Prescription-strength topical. Eligibility and directions are confirmed at treatment review. Not for use in pregnancy or while breastfeeding.',
      he: 'תרחיף בעוצמת מרשם. ההתאמה וההנחיות נקבעות בבדיקת הטיפול. אין להשתמש בהיריון או בהנקה.',
      ar: 'محلول موضعي بتركيز يستلزم وصفة طبية. تُحدَّد الأهلية والتوجيهات في فحص العلاج. لا يُستخدم أثناء الحمل أو الرضاعة الطبيعية.',
      ru: 'Топическое средство рецептурной силы действия. Соответствие и указания по применению определяются при осмотре перед началом лечения. Не применять при беременности и в период грудного вскармливания.',
      fr: "Soin topique de force prescriptible. L'éligibilité et les indications sont confirmées lors du bilan de traitement. Ne pas utiliser pendant la grossesse ou l'allaitement.",
      es: 'Tratamiento tópico de concentración con receta. La elegibilidad y las indicaciones se confirman en la evaluación del tratamiento. No usar durante el embarazo ni la lactancia.',
    }),
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
    formulaReference: L6({
      en: 'Working reference: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + Procapil®.',
      he: 'התייחסות עבודה: 15% מינוקסידיל + 0.1% פינסטריד + 5% חומצה אזלאית + Procapil®.',
      ar: 'مرجع العمل: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + Procapil®.',
      ru: 'Рабочая формула: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + Procapil®.',
      fr: 'Référence de travail : 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + Procapil®.',
      es: 'Referencia de trabajo: 15% Minoxidil + 0.1% Finasteride + 5% Azelaic Acid + Procapil®.',
    }),
    displayFormulaDetail: false,
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
      ),
      ING(
        'Procapil®',
        L6({
          en: 'A supplier active marketed for scalp microcirculation and follicle anchoring.',
          he: 'רכיב פעיל של ספק, המשווק לתמיכה במיקרו-מחזור בקרקפת ובעיגון הזקיק.',
          ar: 'مكوّن فعّال من مورّد خارجي، يُسوَّق لدعم الدورة الدموية الدقيقة في فروة الرأس وتثبيت بصيلات الشعر.',
          ru: 'Активный ингредиент поставщика, заявляемый производителем для поддержки микроциркуляции кожи головы и фиксации волосяного фолликула.',
          fr: "Un actif fourni par un tiers, présenté par son fournisseur comme soutenant la microcirculation du cuir chevelu et l'ancrage du follicule.",
          es: 'Un activo de un proveedor externo, comercializado para apoyar la microcirculación del cuero cabelludo y el anclaje del folículo.',
        }),
        'requires-review',
        'supplier-reference',
      ),
    ],
    usage: L6({
      en: 'Directions are set individually at treatment review; this concept is not self-selected.',
      he: 'ההנחיות נקבעות אישית בבדיקת הטיפול; קונספט זה אינו נבחר עצמאית.',
      ar: 'تُحدَّد التوجيهات بشكل فردي في فحص العلاج؛ ولا يُختار هذا المفهوم ذاتيًا.',
      ru: 'Указания устанавливаются индивидуально при осмотре перед лечением; эта концепция не выбирается самостоятельно.',
      fr: "Les indications sont établies individuellement lors du bilan de traitement ; ce concept n'est pas sélectionné de façon autonome.",
      es: 'Las indicaciones se establecen de forma individual en la evaluación del tratamiento; este concepto no se selecciona de forma autónoma.',
    }),
    safety: L6({
      en: 'Intensive prescription-strength concept. Available only where a clinician review supports it. Not for use in pregnancy or while breastfeeding.',
      he: 'קונספט אינטנסיבי בעוצמת מרשם. זמין רק כאשר בדיקת רופא תומכת בכך. אין להשתמש בהיריון או בהנקה.',
      ar: 'مفهوم مكثف بتركيز يستلزم وصفة طبية. متاح فقط عندما يدعم ذلك فحص طبي. لا يُستخدم أثناء الحمل أو الرضاعة الطبيعية.',
      ru: 'Интенсивная концепция рецептурной силы действия. Доступна только при подтверждении врачебным осмотром. Не применять при беременности и в период грудного вскармливания.',
      fr: "Concept intensif de force prescriptible. Disponible uniquement lorsqu'un bilan médical le confirme. Ne pas utiliser pendant la grossesse ou l'allaitement.",
      es: 'Concepto intensivo de concentración con receta. Disponible solo cuando una evaluación médica lo respalda. No usar durante el embarazo ni la lactancia.',
    }),
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
    ],
    usage: L6({
      en: 'Apply a few drops to the scalp daily and massage in. Do not rinse out.',
      he: 'למרוח מספר טיפות על הקרקפת מדי יום ולעסות. לא לשטוף.',
      ar: 'يوضع عدد من القطرات على فروة الرأس يوميًا مع التدليك. لا يُشطف.',
      ru: 'Ежедневно наносить несколько капель на кожу головы и массировать. Не смывать.',
      fr: 'Appliquer quelques gouttes sur le cuir chevelu chaque jour et masser. Ne pas rincer.',
      es: 'Aplicar unas gotas en el cuero cabelludo a diario y masajear. No aclarar.',
    }),
    safety: L6({
      en: 'For external use on the scalp only. Discontinue if irritation occurs.',
      he: 'לשימוש חיצוני על הקרקפת בלבד. יש להפסיק שימוש אם מופיע גירוי.',
      ar: 'للاستخدام الخارجي على فروة الرأس فقط. يُوقَف الاستخدام عند ظهور أي تهيّج.',
      ru: 'Только для наружного применения на коже головы. Прекратить использование при появлении раздражения.',
      fr: 'Réservé à l’usage externe sur le cuir chevelu. Arrêter en cas d’irritation.',
      es: 'Solo para uso externo en el cuero cabelludo. Suspender el uso si aparece irritación.',
    }),
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
    usage: L6({
      en: 'Take one capsule daily with food, or as directed on the label.',
      he: 'ליטול קפסולה אחת ביום עם אוכל, או לפי ההנחיות על התווית.',
      ar: 'تؤخذ كبسولة واحدة يوميًا مع الطعام، أو حسب التوجيهات الموضحة على الملصق.',
      ru: 'Принимать одну капсулу в день во время еды или согласно указаниям на этикетке.',
      fr: 'Prendre une gélule par jour avec un repas, ou selon les indications figurant sur l’étiquette.',
      es: 'Tomar una cápsula al día con la comida, o según las indicaciones de la etiqueta.',
    }),
    safety: L6({
      en: 'A food supplement, not a medicine. Do not exceed the stated dose. Speak to a doctor if you are pregnant, breastfeeding, or on medication.',
      he: 'תוסף תזונה, לא תרופה. אין לחרוג מהמינון המצוין. יש להתייעץ עם רופא בהיריון, בהנקה או בנטילת תרופות.',
      ar: 'مكمّل غذائي وليس دواءً. يُحظر تجاوز الجرعة الموصى بها. يُرجى استشارة الطبيب في حال الحمل أو الرضاعة أو عند تناول أدوية.',
      ru: 'Пищевая добавка, не является лекарственным средством. Не превышать указанную дозу. Проконсультируйтесь с врачом при беременности, грудном вскармливании или приёме лекарств.',
      fr: "Un complément alimentaire, pas un médicament. Ne pas dépasser la dose indiquée. Consultez un médecin en cas de grossesse, d'allaitement ou de traitement médicamenteux.",
      es: 'Un suplemento alimenticio, no un medicamento. No superar la dosis indicada. Consulte a un médico si está embarazada, en periodo de lactancia o tomando medicación.',
    }),
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
    usage: L6({
      en: 'Massage into a wet scalp, leave for a minute, then rinse. Use daily.',
      he: 'לעסות על קרקפת רטובה, להשאיר כדקה ולשטוף. לשימוש יומי.',
      ar: 'يُدلَّك على فروة رأس مبللة، ويُترك لمدة دقيقة تقريبًا، ثم يُشطف. للاستخدام اليومي.',
      ru: 'Массировать на влажную кожу головы, оставить примерно на минуту, затем смыть. Использовать ежедневно.',
      fr: 'Masser sur cuir chevelu mouillé, laisser poser environ une minute, puis rincer. Usage quotidien.',
      es: 'Masajear sobre el cuero cabelludo húmedo, dejar actuar un minuto y aclarar. Uso diario.',
    }),
    safety: L6({
      en: 'For external use on the scalp and hair only. Avoid contact with the eyes.',
      he: 'לשימוש חיצוני על הקרקפת והשיער בלבד. יש להימנע ממגע עם העיניים.',
      ar: 'للاستخدام الخارجي على فروة الرأس والشعر فقط. يُنصح بتجنّب ملامسة العينين.',
      ru: 'Только для наружного применения на коже головы и волосах. Избегать попадания в глаза.',
      fr: 'Réservé à l’usage externe sur le cuir chevelu et les cheveux. Éviter le contact avec les yeux.',
      es: 'Solo para uso externo en el cuero cabelludo y el cabello. Evitar el contacto con los ojos.',
    }),
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
