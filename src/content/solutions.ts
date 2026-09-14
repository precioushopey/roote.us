import { L6, type LocalizedText } from './localized';
import type { ProgramKind } from './programs';

/**
 * Solution pages (brief §18 thinning, §19 gray). Each educates, then routes to
 * the assessment — "Start free hair analysis" is the primary action, exploring
 * the system is secondary. Severity levels are an *assessment visualization*
 * only and are never mapped to a specific Density tier (brief §7, §9).
 */

export type MediaSlot = { id: string; alt: string; label: string; ratio: string };

export type SeverityLevel = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
};

export type Solution = {
  slug: 'thinning' | 'gray-hair';
  concern: 'thinning' | 'gray';
  hero: { eyebrow: LocalizedText; title: LocalizedText; body: LocalizedText };
  /** Sub-areas of the concern to explain (brief §18/§19). */
  education: Array<{ id: string; title: LocalizedText; body: LocalizedText }>;
  severityHeading: LocalizedText;
  severityNote: LocalizedText;
  severityLevels: SeverityLevel[];
  relatedProgram: ProgramKind;
  relatedProducts: string[];
  media: MediaSlot[];
};

export const SOLUTIONS: Solution[] = [
  {
    slug: 'thinning',
    concern: 'thinning',
    hero: {
      eyebrow: L6({
        en: 'Hair thinning',
        he: 'שיער דליל',
        ar: 'ترقّق الشعر',
        ru: 'Поредение волос',
        fr: 'Dégarnissement des cheveux',
        es: 'Aclaramiento del cabello',
      }),
      title: L6({
        en: 'Understand your hair density before choosing a treatment.',
        he: 'להבין את צפיפות השיער לפני שבוחרים טיפול.',
        ar: 'افهم كثافة شعرك قبل اختيار العلاج.',
        ru: 'Поймите плотность своих волос, прежде чем выбирать лечение.',
        fr: 'Comprenez la densité de vos cheveux avant de choisir un traitement.',
        es: 'Entienda la densidad de su cabello antes de elegir un tratamiento.',
      }),
      body: L6({
        en: 'Thinning shows up differently at the hairline, the crown, and across the whole scalp. Start with an analysis, then look at the Density system.',
        he: 'דלילות מתבטאת אחרת בקו השיער, בקודקוד ובכל הקרקפת. מתחילים באבחון, ואז בוחנים את מערכת Density.',
        ar: 'يظهر الترقّق بشكل مختلف عند خط الشعر، في تاج الرأس، وعلى فروة الرأس بأكملها. ابدأ بالتحليل، ثم اطّلع على نظام الكثافة.',
        ru: 'Поредение проявляется по-разному у линии роста волос, на макушке и по всей коже головы. Начните с диагностики, а затем ознакомьтесь с системой ухода за плотностью.',
        fr: "Le dégarnissement se manifeste différemment au niveau de la ligne d'implantation, du vertex, et sur l'ensemble du cuir chevelu. Commencez par une analyse, puis découvrez le système de densité.",
        es: 'El aclaramiento se manifiesta de forma diferente en la línea del cabello, la coronilla y todo el cuero cabelludo. Empiece por un análisis y luego conozca el sistema de densidad.',
      }),
    },
    education: [
      {
        id: 'hairline',
        title: L6({
          en: 'Hairline',
          he: 'קו השיער',
          ar: 'خط الشعر',
          ru: 'Линия роста волос',
          fr: "Ligne d'implantation",
          es: 'Línea del cabello',
        }),
        body: L6({
          en: 'Recession at the temples and the frontal edge.',
          he: 'נסיגה ברקות ובקצה הקדמי.',
          ar: 'تراجع عند الصُدغين وعند الحافة الأمامية.',
          ru: 'Отступление на висках и вдоль переднего края.',
          fr: 'Un recul au niveau des tempes et de la lisière frontale.',
          es: 'Retroceso en las sienes y en el borde frontal.',
        }),
      },
      {
        id: 'crown',
        title: L6({
          en: 'Crown',
          he: 'קודקוד',
          ar: 'تاج الرأس',
          ru: 'Макушка',
          fr: 'Vertex',
          es: 'Coronilla',
        }),
        body: L6({
          en: 'Thinning that starts at the vertex and widens outward.',
          he: 'דלילות שמתחילה בקודקוד ומתרחבת החוצה.',
          ar: 'ترقّق يبدأ عند تاج الرأس ويتّسع نحو الخارج.',
          ru: 'Поредение, которое начинается на макушке и распространяется наружу.',
          fr: "Un dégarnissement qui débute au niveau du vertex et s'étend vers l'extérieur.",
          es: 'Un aclaramiento que comienza en la coronilla y se extiende hacia fuera.',
        }),
      },
      {
        id: 'diffuse',
        title: L6({
          en: 'Diffuse thinning',
          he: 'דלילות מפוזרת',
          ar: 'ترقّق منتشر',
          ru: 'Диффузное поредение',
          fr: 'Dégarnissement diffus',
          es: 'Aclaramiento difuso',
        }),
        body: L6({
          en: 'A general loss of density spread across the scalp.',
          he: 'ירידה כללית בצפיפות המתפרשת על כל הקרקפת.',
          ar: 'فقدان عام في الكثافة، منتشر على فروة الرأس.',
          ru: 'Общая потеря плотности, распределённая по всей коже головы.',
          fr: "Une perte de densité générale, répartie sur l'ensemble du cuir chevelu.",
          es: 'Una pérdida general de densidad, distribuida por todo el cuero cabelludo.',
        }),
      },
    ],
    severityHeading: L6({
      en: 'Different stages call for different decisions.',
      he: 'שלבים שונים מצריכים החלטות שונות.',
      ar: 'مراحل مختلفة تستدعي قرارات مختلفة.',
      ru: 'Разные стадии требуют разных решений.',
      fr: 'Des stades différents appellent des décisions différentes.',
      es: 'Diferentes etapas requieren diferentes decisiones.',
    }),
    severityNote: L6({
      en: 'These are ways to picture your assessment, not a prescription. Treatment strength and eligibility are set by approved recommendation criteria.',
      he: 'אלה דרכים להמחיש את ההערכה, לא מרשם. עוצמת הטיפול וההתאמה נקבעות לפי קריטריוני המלצה מאושרים.',
      ar: 'هذه طرق لتصوير تقييمك، وليست وصفة علاجية. تُحدَّد قوة العلاج والأهلية وفق معايير توصية معتمدة.',
      ru: 'Это способы визуализировать вашу оценку, а не рецепт. Интенсивность лечения и право на него определяются утверждёнными критериями рекомендаций.',
      fr: "Il s'agit de façons d'illustrer votre évaluation, non d'une prescription. L'intensité du traitement et l'éligibilité sont déterminées selon des critères de recommandation approuvés.",
      es: 'Estas son formas de representar su evaluación, no una prescripción. La intensidad del tratamiento y la elegibilidad se determinan según criterios de recomendación aprobados.',
    }),
    severityLevels: [
      {
        id: 'higher',
        title: L6({
          en: 'Higher remaining density',
          he: 'צפיפות שנותרה גבוהה',
          ar: 'كثافة متبقية مرتفعة',
          ru: 'Высокая оставшаяся плотность',
          fr: 'Densité restante élevée',
          es: 'Mayor densidad restante',
        }),
        description: L6({
          en: 'Minimal loss so far, early or localized only.',
          he: 'אובדן מועט בלבד, מוקדם או מקומי.',
          ar: 'فقدان طفيف حتى الآن، مبكر أو موضعي فقط.',
          ru: 'Минимальная потеря на данный момент — только ранняя или локальная.',
          fr: 'Perte minime à ce stade, précoce ou localisée uniquement.',
          es: 'Pérdida mínima por ahora, solo inicial o localizada.',
        }),
      },
      {
        id: 'moderate',
        title: L6({
          en: 'Moderate density loss',
          he: 'אובדן צפיפות בינוני',
          ar: 'فقدان كثافة متوسط',
          ru: 'Умеренная потеря плотности',
          fr: 'Perte de densité modérée',
          es: 'Pérdida de densidad moderada',
        }),
        description: L6({
          en: 'A visible reduction across one or more areas.',
          he: 'ירידה נראית לעין באזור אחד או יותר.',
          ar: 'انخفاض ملحوظ في منطقة واحدة أو أكثر.',
          ru: 'Заметное снижение в одной или нескольких зонах.',
          fr: 'Une réduction visible sur une ou plusieurs zones.',
          es: 'Una reducción visible en una o más zonas.',
        }),
      },
      {
        id: 'advanced',
        title: L6({
          en: 'Advanced density loss',
          he: 'אובדן צפיפות מתקדם',
          ar: 'فقدان كثافة متقدّم',
          ru: 'Выраженная потеря плотности',
          fr: 'Perte de densité avancée',
          es: 'Pérdida de densidad avanzada',
        }),
        description: L6({
          en: 'Density is reduced across most of the scalp.',
          he: 'הצפיפות מופחתת ברוב הקרקפת.',
          ar: 'الكثافة منخفضة في معظم فروة الرأس.',
          ru: 'Плотность снижена на большей части кожи головы.',
          fr: 'La densité est réduite sur la majeure partie du cuir chevelu.',
          es: 'La densidad se reduce en la mayor parte del cuero cabelludo.',
        }),
      },
    ],
    relatedProgram: 'density',
    relatedProducts: ['density-6', 'density-10', 'density-15', 'regrowth-shampoo'],
    media: [
      { id: 'hairline', alt: 'Close crop of a receding hairline at the temple, no face', label: 'Hairline recession, clinical crop, no face', ratio: '4 / 3' },
      { id: 'crown', alt: 'Close crop of thinning at the crown', label: 'Crown thinning, clinical crop', ratio: '4 / 3' },
      { id: 'diffuse', alt: 'Close crop of a widened part line showing diffuse thinning', label: 'Diffuse thinning at the part line', ratio: '4 / 3' },
      { id: 'family', alt: 'The Density 6, 10 and 15 bottles together', label: 'Density 6 / 10 / 15 product family', ratio: '16 / 10' },
    ],
  },
  {
    slug: 'gray-hair',
    concern: 'gray',
    hero: {
      eyebrow: L6({
        en: 'Gray hair',
        he: 'שיער אפור',
        ar: 'الشعر الرمادي',
        ru: 'Седина',
        fr: 'Cheveux gris',
        es: 'Canas',
      }),
      title: L6({
        en: 'Understand what is changing at the root.',
        he: 'להבין מה משתנה בשורש.',
        ar: 'افهم ما الذي يتغيّر عند الجذر.',
        ru: 'Поймите, что меняется у корня волос.',
        fr: 'Comprenez ce qui change à la racine.',
        es: 'Entienda qué está cambiando en la raíz.',
      }),
      body: L6({
        en: 'Graying is a change in pigment at the follicle. The Gray system pairs a daily supplement with a topical serum: a routine, not a promise.',
        he: 'האפרה היא שינוי בפיגמנט בזקיק. מערכת Gray משלבת תוסף יומי עם סרום מקומי: שגרה, לא הבטחה.',
        ar: 'الشيب هو تغيّر في الصبغة داخل الجُريب. يجمع نظام الشعر الرمادي بين مكمّل غذائي يومي وسيروم موضعي: إنه روتين، لا وعد.',
        ru: 'Поседение — это изменение пигмента в волосяном фолликуле. Система ухода за сединой сочетает ежедневную биодобавку с сывороткой местного действия: это регулярный уход, а не обещание.',
        fr: 'Le grisonnement est un changement de pigmentation au niveau du follicule. Le système pour cheveux gris associe un complément quotidien à un sérum topique : une routine, pas une promesse.',
        es: 'El encanecimiento es un cambio de pigmento en el folículo. El sistema para canas combina un suplemento diario con un sérum tópico: una rutina, no una promesa.',
      }),
    },
    education: [
      {
        id: 'progression',
        title: L6({
          en: 'Visible progression',
          he: 'התקדמות נראית',
          ar: 'التطوّر الملحوظ',
          ru: 'Заметная прогрессия',
          fr: 'Progression visible',
          es: 'Progresión visible',
        }),
        body: L6({
          en: 'Where gray appears first and how it spreads over time.',
          he: 'היכן מופיע האפור תחילה ואיך הוא מתפשט עם הזמן.',
          ar: 'أين يظهر الشيب أولاً وكيف ينتشر مع الوقت.',
          ru: 'Где седина появляется в первую очередь и как она распространяется со временем.',
          fr: 'Où le gris apparaît en premier et comment il se propage avec le temps.',
          es: 'Dónde aparecen las canas primero y cómo se extienden con el tiempo.',
        }),
      },
      {
        id: 'pigmentation',
        title: L6({
          en: 'Pigmentation',
          he: 'פיגמנטציה',
          ar: 'التصبّغ',
          ru: 'Пигментация',
          fr: 'Pigmentation',
          es: 'Pigmentación',
        }),
        body: L6({
          en: 'The pigment-producing activity at the base of the hair.',
          he: 'הפעילות המייצרת פיגמנט בבסיס השערה.',
          ar: 'النشاط المُنتِج للصبغة عند قاعدة الشعرة.',
          ru: 'Активность, вырабатывающая пигмент у основания волоса.',
          fr: "L'activité de production de pigment à la base du cheveu.",
          es: 'La actividad productora de pigmento en la base del cabello.',
        }),
      },
      {
        id: 'routine',
        title: L6({
          en: 'A long-term routine',
          he: 'שגרה ארוכת טווח',
          ar: 'روتين طويل الأمد',
          ru: 'Долгосрочный уход',
          fr: 'Une routine à long terme',
          es: 'Una rutina a largo plazo',
        }),
        body: L6({
          en: 'An inside supplement and a topical serum, used consistently.',
          he: 'תוסף מבפנים וסרום מקומי, בשימוש עקבי.',
          ar: 'مكمّل داخلي وسيروم موضعي، يُستخدمان بانتظام.',
          ru: 'Добавка для приёма внутрь и сыворотка местного действия при постоянном использовании.',
          fr: 'Un complément par voie interne et un sérum topique, utilisés de manière régulière.',
          es: 'Un suplemento interno y un sérum tópico, usados de forma constante.',
        }),
      },
    ],
    severityHeading: L6({
      en: 'Gray hair deserves its own system.',
      he: 'שיער אפור ראוי למערכת משלו.',
      ar: 'الشعر الرمادي يستحق نظامه الخاص.',
      ru: 'Седина заслуживает собственной системы.',
      fr: 'Les cheveux gris méritent leur propre système.',
      es: 'Las canas merecen su propio sistema.',
    }),
    severityNote: L6({
      en: 'A coordinated inside + topical routine for managing the appearance of gray. It is not a claim to restore lost pigment.',
      he: 'שגרה מתואמת מבפנים ומבחוץ לניהול מראה השיער האפור. אין בכך טענה להשבת פיגמנט שאבד.',
      ar: 'روتين متكامل من الداخل والخارج لإدارة مظهر الشيب. وهذا ليس ادّعاءً باستعادة الصبغة المفقودة.',
      ru: 'Согласованный уход изнутри и снаружи для управления внешним видом седины. Это не заявление о восстановлении утраченного пигмента.',
      fr: "Une routine coordonnée, en interne et en application topique, pour gérer l'apparence du grisonnement. Il ne s'agit pas d'une allégation de restauration du pigment perdu.",
      es: 'Una rutina coordinada, interna y tópica, para gestionar la apariencia de las canas. No es una promesa de restaurar el pigmento perdido.',
    }),
    severityLevels: [
      {
        id: 'early',
        title: L6({ en: 'Early', he: 'מוקדם', ar: 'مبكر', ru: 'Ранняя', fr: 'Précoce', es: 'Inicial' }),
        description: L6({
          en: 'A few gray strands, usually at the temples.',
          he: 'מספר שערות אפורות, בדרך כלל ברקות.',
          ar: 'بضع شعرات رمادية، عادةً عند الصُدغين.',
          ru: 'Несколько седых волос, обычно на висках.',
          fr: 'Quelques mèches grises, généralement au niveau des tempes.',
          es: 'Unas pocas canas, normalmente en las sienes.',
        }),
      },
      {
        id: 'moderate',
        title: L6({ en: 'Moderate', he: 'בינוני', ar: 'متوسط', ru: 'Умеренная', fr: 'Modéré', es: 'Moderado' }),
        description: L6({
          en: 'Gray is noticeable across the crown and top.',
          he: 'האפור בולט בקודקוד ובחלק העליון.',
          ar: 'الشيب ملحوظ في التاج وأعلى الرأس.',
          ru: 'Седина заметна на макушке и в верхней части.',
          fr: 'Le gris est visible au niveau du vertex et du sommet du crâne.',
          es: 'Las canas se notan en la coronilla y la parte superior.',
        }),
      },
      {
        id: 'advanced',
        title: L6({ en: 'Advanced', he: 'מתקדם', ar: 'متقدّم', ru: 'Выраженная', fr: 'Avancé', es: 'Avanzado' }),
        description: L6({
          en: 'Gray is distributed throughout the hair.',
          he: 'האפור מפוזר בכל השיער.',
          ar: 'الشيب موزّع في كامل الشعر.',
          ru: 'Седина распределена по всем волосам.',
          fr: "Le gris est réparti sur l'ensemble des cheveux.",
          es: 'Las canas están repartidas por todo el cabello.',
        }),
      },
    ],
    relatedProgram: 'gray',
    relatedProducts: ['gray-support', 'gray-serum'],
    media: [
      { id: 'root', alt: 'Macro photograph of a gray hair at the root against the scalp', label: 'Gray root macro', ratio: '4 / 3' },
      { id: 'support', alt: 'The Gray Support supplement bottle', label: 'Gray Support supplement', ratio: '1' },
      { id: 'serum', alt: 'The Gray Serum bottle', label: 'Gray Serum', ratio: '1' },
      { id: 'system', alt: 'Gray Support and Gray Serum shown together as a bundle', label: 'The Gray system bundle', ratio: '16 / 10' },
    ],
  },
];

const BY_SLUG: Record<string, Solution> = Object.fromEntries(SOLUTIONS.map((s) => [s.slug, s]));

export function getSolution(slug: string): Solution | undefined {
  return BY_SLUG[slug];
}
