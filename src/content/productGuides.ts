import { L6, pickLocalized, type LocalizedText } from './localized';
import { getProduct, type ProductFormat } from './products';
import { PENDING, type PendingMarker } from './pending';
import { LEVEL_SLUGS, LEVEL_SUITS } from './levelComparison';
import type { ClaimStatus } from './claims';
import type { LocaleCode } from '@/i18n/locales';

/**
 * Per-product guide copy for the product-page template (what it does, who it is
 * for, how it works, how to use it step by step, how it fits the routine,
 * comparison, what to expect, product FAQ). Pure content layer — no React / DOM /
 * i18n provider. Mechanism-only wording; no efficacy or results promises. Facts
 * (usage, ingredient names, "outside"/"inside" roles) are taken from
 * `products.ts`; all copy is first-pass (`he` is the per-entry reference) with
 * `claimStatus: 'working'` — pending formal legal / medical review.
 *
 * "Time to visible results" is deliberately ALWAYS `[PENDING]`: the figure in
 * `roote.config.claims` is an invented stand-in (see its TEMP-PLACEHOLDER note)
 * and must not reach product pages.
 */

export type StepIcon = 'droplet' | 'hand' | 'clock' | 'pill' | 'shower' | 'sparkles' | 'glass';
export type GuideStep = { icon: StepIcon; text: string };
export type GuideCompareRow = { label: string; slug?: string; diff: string };
export type GuideFaq = { q: string; a: string };

export type ProductGuideModel = {
  slug: string;
  isLevel: boolean;
  whatItDoes: string;
  whoFor: string;
  howItWorks: string;
  steps: GuideStep[];
  routineFit: string;
  /** Empty for the three Levels — the shared Level comparison covers them. */
  compare: GuideCompareRow[];
  expect: string;
  expectTimeline: PendingMarker;
  faq: GuideFaq[];
  claimStatus: ClaimStatus;
};

type Guide = {
  whatItDoes: LocalizedText;
  whoFor: LocalizedText;
  howItWorks: LocalizedText;
  routineFit: LocalizedText;
  compare: Array<{ label: string; slug?: string; diff: LocalizedText }>;
  expect: LocalizedText;
  faq: Array<{ q: LocalizedText; a: LocalizedText }>;
};

const EXPECT_TREATMENT: LocalizedText = L6({
  en: 'Hair grows in slow cycles, so changes take time. Use it as directed, keep it consistent, and review your progress with a professional. If you get severe irritation, stop and ask a professional.',
  he: 'השיער גדל במחזורים איטיים, ולכן שינויים לוקחים זמן. יש להשתמש כמצוין, בעקביות, ולבדוק את ההתקדמות עם איש מקצוע. אם מופיע גירוי חמור, יש להפסיק ולהתייעץ.',
  ar: 'ينمو الشعر في دورات بطيئة، لذا يستغرق أي تغيير وقتًا. استخدمه حسب الإرشادات وبانتظام، وراجع تقدّمك مع أخصائي. إذا ظهر تهيّج شديد، فتوقف عن الاستخدام واستشر أخصائيًا.',
  ru: 'Волосы растут медленными циклами, поэтому изменения требуют времени. Используйте по инструкции, регулярно, и обсуждайте прогресс со специалистом. При сильном раздражении прекратите использование и обратитесь к специалисту.',
  fr: 'Les cheveux poussent par cycles lents, les changements demandent donc du temps. Utilisez-le comme indiqué, avec régularité, et faites le point avec un professionnel. En cas d’irritation sévère, arrêtez et demandez conseil à un professionnel.',
  es: 'El cabello crece en ciclos lentos, por lo que los cambios llevan tiempo. Úsalo según las indicaciones, con constancia, y revisa tu progreso con un profesional. Si notas irritación intensa, suspéndelo y consulta a un profesional.',
});

const EXPECT_SUPPORT: LocalizedText = L6({
  en: 'Hair grows slowly, so any change takes time and varies from person to person. Use it as directed and consistently. It supports your routine; it does not replace professional advice.',
  he: 'השיער גדל לאט, ולכן כל שינוי לוקח זמן ומשתנה מאדם לאדם. יש להשתמש כמצוין ובעקביות. המוצר תומך בשגרה ואינו מחליף ייעוץ מקצועי.',
  ar: 'ينمو الشعر ببطء، لذا يستغرق أي تغيير وقتًا ويختلف من شخص لآخر. استخدمه حسب الإرشادات وبانتظام. يدعم روتينك ولا يغني عن المشورة المتخصصة.',
  ru: 'Волосы растут медленно, поэтому любые изменения требуют времени и различаются у разных людей. Используйте по инструкции и регулярно. Продукт поддерживает вашу рутину и не заменяет консультацию специалиста.',
  fr: 'Les cheveux poussent lentement : tout changement prend du temps et varie d’une personne à l’autre. Utilisez-le comme indiqué et avec régularité. Il soutient votre routine et ne remplace pas l’avis d’un professionnel.',
  es: 'El cabello crece despacio, por lo que cualquier cambio lleva tiempo y varía de una persona a otra. Úsalo según las indicaciones y con constancia. Apoya tu rutina y no sustituye el consejo profesional.',
});

const LEVEL_ROUTINE: LocalizedText = L6({
  en: 'Your main treatment step: one dropper in the morning and one in the evening. On wash days, pair it with Regrowth Shampoo.',
  he: 'שלב הטיפול העיקרי שלך: טפטפת אחת בבוקר ואחת בערב. בימי חפיפה אפשר לשלב עם Regrowth Shampoo.',
  ar: 'خطوة العلاج الأساسية: قطّارة واحدة صباحًا وأخرى مساءً. في أيام الغسل، اجمعه مع Regrowth Shampoo.',
  ru: 'Ваш основной этап лечения: одна пипетка утром и одна вечером. В дни мытья головы сочетайте с Regrowth Shampoo.',
  fr: 'Votre étape de traitement principale : une pipette le matin et une le soir. Les jours de lavage, associez-le au Regrowth Shampoo.',
  es: 'Tu paso de tratamiento principal: un gotero por la mañana y otro por la noche. Los días de lavado, combínalo con Regrowth Shampoo.',
});

const LEVEL_FAQ = [
  {
    q: L6({
      en: 'Is a higher level always better?',
      he: 'האם רמה גבוהה יותר תמיד טובה יותר?',
      ar: 'هل المستوى الأعلى أفضل دائمًا؟',
      ru: 'Всегда ли более высокий уровень лучше?',
      fr: 'Un niveau plus élevé est-il toujours meilleur ?',
      es: '¿Un nivel más alto es siempre mejor?',
    }),
    a: L6({
      en: 'No. Level 6, 10 and 15 are different formulas for different people, not a ladder you are meant to climb. Which one fits depends on the person, so each is reviewed by a clinician first.',
      he: 'לא. רמה 6, 10 ו-15 הן פורמולות שונות לאנשים שונים, ולא סולם שצריך לטפס עליו. הרמה המתאימה תלויה באדם, ולכן כל אחת נבדקת קודם על ידי איש מקצוע רפואי.',
      ar: 'لا. المستويات 6 و10 و15 تركيبات مختلفة لأشخاص مختلفين، وليست سلّمًا يُفترض صعوده. يعتمد المستوى المناسب على الشخص، لذا يراجع أخصائي كل حالة أولًا.',
      ru: 'Нет. Уровни 6, 10 и 15 — это разные формулы для разных людей, а не лестница, по которой нужно подниматься. Подходящий уровень зависит от человека, поэтому сначала каждый случай оценивает специалист.',
      fr: 'Non. Les niveaux 6, 10 et 15 sont des formules différentes pour des personnes différentes, pas une échelle à gravir. Le bon niveau dépend de chacun, c’est pourquoi un professionnel l’examine d’abord.',
      es: 'No. Los niveles 6, 10 y 15 son fórmulas distintas para personas distintas, no una escalera que haya que subir. El nivel adecuado depende de cada persona, por eso un profesional lo revisa primero.',
    }),
  },
];

const GUIDES: Record<string, Guide> = {
  'density-6': {
    whatItDoes: L6({
      en: 'A lower-strength scalp treatment with Minoxidil and Finasteride.',
      he: 'טיפול לקרקפת בעוצמה נמוכה עם מינוקסידיל ופינסטריד.',
      ar: 'علاج لفروة الرأس بتركيز أقل يحتوي على Minoxidil وFinasteride.',
      ru: 'Средство для кожи головы с более низкой концентрацией: Minoxidil и Finasteride.',
      fr: 'Un soin du cuir chevelu à plus faible concentration, avec Minoxidil et Finasteride.',
      es: 'Un tratamiento capilar de menor concentración con Minoxidil y Finasteride.',
    }),
    whoFor: LEVEL_SUITS['density-6'],
    howItWorks: L6({
      en: 'Two actives work together. Minoxidil, applied to the scalp, is understood to widen small blood vessels and extend the hair’s growth phase. Finasteride is understood to reduce DHT, a hormone linked to follicles shrinking.',
      he: 'שני רכיבים פעילים פועלים יחד. מינוקסידיל, הנמרח על הקרקפת, נחשב כמרחיב כלי דם קטנים ומאריך את שלב הצמיחה של השיער. פינסטריד נחשב כמפחית DHT, הורמון הקשור להתכווצות הזקיקים.',
      ar: 'يعمل مكوّنان فعّالان معًا. يُفهَم أن Minoxidil، المُطبَّق على فروة الرأس، يوسّع الأوعية الدموية الصغيرة ويطيل مرحلة نمو الشعر. ويُفهَم أن Finasteride يقلّل DHT، وهو هرمون مرتبط بانكماش البصيلات.',
      ru: 'Два активных компонента работают вместе. Считается, что Minoxidil, наносимый на кожу головы, расширяет мелкие сосуды и удлиняет фазу роста волоса. Считается, что Finasteride снижает уровень DHT — гормона, связанного с уменьшением фолликулов.',
      fr: 'Deux actifs travaillent ensemble. Le Minoxidil, appliqué sur le cuir chevelu, est censé dilater les petits vaisseaux et prolonger la phase de croissance du cheveu. Le Finasteride est censé réduire la DHT, une hormone associée au rétrécissement des follicules.',
      es: 'Dos activos trabajan juntos. Se entiende que el Minoxidil, aplicado en el cuero cabelludo, dilata los pequeños vasos sanguíneos y alarga la fase de crecimiento del cabello. Se entiende que el Finasteride reduce la DHT, una hormona asociada a que los folículos se encojan.',
    }),
    routineFit: LEVEL_ROUTINE,
    compare: [],
    expect: EXPECT_TREATMENT,
    faq: LEVEL_FAQ,
  },
  'density-10': {
    whatItDoes: L6({
      en: 'A stronger scalp treatment: more Minoxidil than Level 6, plus Finasteride and added scalp-support ingredients.',
      he: 'טיפול חזק יותר לקרקפת: יותר מינוקסידיל מרמה 6, פינסטריד ורכיבים נוספים לתמיכה בקרקפת.',
      ar: 'علاج أقوى لفروة الرأس: كمية أكبر من Minoxidil مقارنة بالمستوى 6، مع Finasteride ومكوّنات إضافية داعمة لفروة الرأس.',
      ru: 'Более сильное средство для кожи головы: больше Minoxidil, чем в уровне 6, плюс Finasteride и дополнительные компоненты для ухода за кожей головы.',
      fr: 'Un soin du cuir chevelu plus fort : plus de Minoxidil que le niveau 6, avec du Finasteride et des ingrédients de soutien du cuir chevelu.',
      es: 'Un tratamiento capilar más fuerte: más Minoxidil que el nivel 6, además de Finasteride e ingredientes añadidos de apoyo al cuero cabelludo.',
    }),
    whoFor: LEVEL_SUITS['density-10'],
    howItWorks: L6({
      en: 'Uses the same two actives as Level 6, with more Minoxidil and a different Finasteride amount. It adds Azelaic Acid, a DHT-pathway support ingredient, and ABN Complex™, a hair-nutrient blend.',
      he: 'משתמש באותם שני רכיבים פעילים כמו רמה 6, עם יותר מינוקסידיל וכמות פינסטריד שונה. מוסיף חומצה אזלאית, רכיב תומך במסלול ה-DHT, ו-ABN Complex™, תערובת של חומרי הזנה לשיער.',
      ar: 'يستخدم المكوّنين الفعّالين نفسيهما كما في المستوى 6، مع كمية أكبر من Minoxidil وكمية مختلفة من Finasteride. ويضيف Azelaic Acid، وهو مكوّن داعم لمسار DHT، وABN Complex™، وهو مزيج من مغذّيات الشعر.',
      ru: 'Использует те же два активных компонента, что и уровень 6, с большим количеством Minoxidil и другим количеством Finasteride. Добавляет Azelaic Acid — компонент, поддерживающий путь DHT, и ABN Complex™ — смесь питательных веществ для волос.',
      fr: 'Utilise les mêmes deux actifs que le niveau 6, avec plus de Minoxidil et une quantité différente de Finasteride. Il ajoute l’Azelaic Acid, un ingrédient de soutien de la voie de la DHT, et l’ABN Complex™, un mélange de nutriments pour cheveux.',
      es: 'Usa los mismos dos activos que el nivel 6, con más Minoxidil y una cantidad distinta de Finasteride. Añade Azelaic Acid, un ingrediente de apoyo a la vía de la DHT, y ABN Complex™, una mezcla de nutrientes para el cabello.',
    }),
    routineFit: LEVEL_ROUTINE,
    compare: [],
    expect: EXPECT_TREATMENT,
    faq: LEVEL_FAQ,
  },
  'density-15': {
    whatItDoes: L6({
      en: 'The highest-Minoxidil scalp treatment, with Finasteride and added ingredients.',
      he: 'הטיפול לקרקפת עם כמות המינוקסידיל הגבוהה ביותר, עם פינסטריד ורכיבים נוספים.',
      ar: 'علاج لفروة الرأس بأعلى كمية من Minoxidil، مع Finasteride ومكوّنات إضافية.',
      ru: 'Средство для кожи головы с самым высоким содержанием Minoxidil, а также Finasteride и дополнительные компоненты.',
      fr: 'Le soin du cuir chevelu le plus dosé en Minoxidil, avec du Finasteride et des ingrédients ajoutés.',
      es: 'El tratamiento capilar con más Minoxidil, junto con Finasteride e ingredientes añadidos.',
    }),
    whoFor: LEVEL_SUITS['density-15'],
    howItWorks: L6({
      en: 'Has the highest Minoxidil amount of the three. It keeps Level 10’s extras and adds Retinol, a vitamin A derivative, and Caffeine, a common scalp-topical ingredient.',
      he: 'בעל כמות המינוקסידיל הגבוהה ביותר מבין השלוש. שומר על התוספות של רמה 10 ומוסיף רטינול, נגזרת של ויטמין A, וקפאין, רכיב נפוץ למריחה על הקרקפת.',
      ar: 'يحتوي على أعلى كمية من Minoxidil بين المستويات الثلاثة. يحتفظ بإضافات المستوى 10 ويضيف Retinol، وهو مشتق من فيتامين A، وCaffeine، وهو مكوّن شائع للاستخدام الموضعي على فروة الرأس.',
      ru: 'Содержит наибольшее количество Minoxidil из трёх. Сохраняет добавки уровня 10 и добавляет Retinol — производное витамина A, и Caffeine — распространённый компонент для кожи головы.',
      fr: 'Contient la plus forte quantité de Minoxidil des trois. Il conserve les ajouts du niveau 10 et ajoute le Retinol, un dérivé de la vitamine A, et la Caffeine, un ingrédient topique courant pour le cuir chevelu.',
      es: 'Tiene la mayor cantidad de Minoxidil de los tres. Conserva los añadidos del nivel 10 y suma Retinol, un derivado de la vitamina A, y Caffeine, un ingrediente tópico común para el cuero cabelludo.',
    }),
    routineFit: LEVEL_ROUTINE,
    compare: [],
    expect: EXPECT_TREATMENT,
    faq: LEVEL_FAQ,
  },
  'regrowth-shampoo': {
    whatItDoes: L6({
      en: 'A scalp-focused daily shampoo that supports your treatment.',
      he: 'שמפו יומי ממוקד קרקפת שתומך בטיפול שלך.',
      ar: 'شامبو يومي يركّز على فروة الرأس ويدعم علاجك.',
      ru: 'Ежедневный шампунь для кожи головы, который поддерживает ваше лечение.',
      fr: 'Un shampoing quotidien ciblé sur le cuir chevelu, qui soutient votre traitement.',
      es: 'Un champú diario centrado en el cuero cabelludo que apoya tu tratamiento.',
    }),
    whoFor: L6({
      en: 'People with thinning hair who want a scalp-focused daily cleanse alongside a Level.',
      he: 'לאנשים עם שיער דליל שרוצים שטיפה יומית ממוקדת קרקפת לצד אחת הרמות.',
      ar: 'لمن يعانون من خفة الشعر ويريدون تنظيفًا يوميًا يركّز على فروة الرأس إلى جانب أحد المستويات.',
      ru: 'Для людей с истончением волос, которым нужно ежедневное очищение кожи головы вместе с одним из уровней.',
      fr: 'Pour les personnes dont les cheveux s’affinent et qui veulent un nettoyage quotidien ciblé sur le cuir chevelu, en complément d’un niveau.',
      es: 'Para personas con cabello que se adelgaza y quieren una limpieza diaria centrada en el cuero cabelludo junto con uno de los niveles.',
    }),
    howItWorks: L6({
      en: 'A scalp-focused shampoo that cleanses and conditions the scalp and hair. It supports your routine; it is not the hair-loss treatment itself.',
      he: 'שמפו ממוקד קרקפת שמנקה ומטפח את הקרקפת והשיער. הוא תומך בשגרה שלך, אך אינו הטיפול בנשירה עצמו.',
      ar: 'شامبو يركّز على فروة الرأس، ينظّف فروة الرأس والشعر ويغذّيهما. يدعم روتينك، لكنه ليس علاج تساقط الشعر نفسه.',
      ru: 'Шампунь для кожи головы: очищает и ухаживает за кожей головы и волосами. Он поддерживает вашу рутину, но сам по себе не является средством от выпадения волос.',
      fr: 'Un shampoing ciblé sur le cuir chevelu qui nettoie et conditionne le cuir chevelu et les cheveux. Il soutient votre routine ; ce n’est pas le traitement de la chute lui-même.',
      es: 'Un champú centrado en el cuero cabelludo que limpia y acondiciona el cuero cabelludo y el cabello. Apoya tu rutina; no es el tratamiento de la caída en sí.',
    }),
    routineFit: L6({
      en: 'Your wash-day step, used in place of your regular shampoo, alongside your Level.',
      he: 'שלב החפיפה שלך, במקום השמפו הרגיל, לצד הרמה שלך.',
      ar: 'خطوة يوم الغسل، تُستخدم بدل شامبوك المعتاد، إلى جانب مستواك.',
      ru: 'Ваш этап в дни мытья головы: используется вместо обычного шампуня вместе с вашим уровнем.',
      fr: 'Votre étape des jours de lavage, à utiliser à la place de votre shampoing habituel, en complément de votre niveau.',
      es: 'Tu paso de los días de lavado, que sustituye a tu champú habitual, junto con tu nivel.',
    }),
    compare: [
      {
        label: 'ROOTÉ Level 6 / 10 / 15',
        diff: L6({
          en: 'Level: the treatment you leave on the scalp. Shampoo: the cleanse you rinse off.',
          he: 'רמה: הטיפול שנשאר על הקרקפת. שמפו: השטיפה שנשטפת.',
          ar: 'المستوى: العلاج الذي يبقى على فروة الرأس. الشامبو: التنظيف الذي يُشطف.',
          ru: 'Уровень — средство, остающееся на коже головы. Шампунь — очищение, которое смывается.',
          fr: 'Niveau : le traitement qui reste sur le cuir chevelu. Shampoing : le nettoyage qui se rince.',
          es: 'Nivel: el tratamiento que se queda en el cuero cabelludo. Champú: la limpieza que se aclara.',
        }),
      },
    ],
    expect: EXPECT_SUPPORT,
    faq: [
      {
        q: L6({
          en: 'Is the shampoo my hair-loss treatment?',
          he: 'האם השמפו הוא הטיפול בנשירה?',
          ar: 'هل الشامبو هو علاج تساقط الشعر؟',
          ru: 'Шампунь — это лечение выпадения волос?',
          fr: 'Le shampoing est-il mon traitement contre la chute ?',
          es: '¿El champú es mi tratamiento contra la caída?',
        }),
        a: L6({
          en: 'No. It cleanses and conditions the scalp and supports your routine. Your Level is the main treatment.',
          he: 'לא. הוא מנקה ומטפח את הקרקפת ותומך בשגרה. הרמה שלך היא הטיפול העיקרי.',
          ar: 'لا. ينظّف فروة الرأس ويغذّيها ويدعم روتينك. مستواك هو العلاج الأساسي.',
          ru: 'Нет. Он очищает кожу головы, ухаживает за ней и поддерживает вашу рутину. Основное лечение — ваш уровень.',
          fr: 'Non. Il nettoie et conditionne le cuir chevelu et soutient votre routine. Votre niveau est le traitement principal.',
          es: 'No. Limpia y acondiciona el cuero cabelludo y apoya tu rutina. Tu nivel es el tratamiento principal.',
        }),
      },
    ],
  },
  'gray-serum': {
    whatItDoes: L6({
      en: 'A daily leave-in serum applied to the scalp and hair to support natural hair color.',
      he: 'סרום יומי ללא שטיפה הנמרח על הקרקפת והשיער לתמיכה בצבע השיער הטבעי.',
      ar: 'سيروم يومي بدون شطف يُوضَع على فروة الرأس والشعر لدعم لون الشعر الطبيعي.',
      ru: 'Ежедневная несмываемая сыворотка для кожи головы и волос, поддерживающая естественный цвет волос.',
      fr: 'Un sérum quotidien sans rinçage appliqué sur le cuir chevelu et les cheveux pour soutenir la couleur naturelle.',
      es: 'Un sérum diario sin aclarado que se aplica en el cuero cabelludo y el cabello para apoyar el color natural.',
    }),
    whoFor: L6({
      en: 'People focused on visible gray hair who want a daily leave-in step for the scalp and hair.',
      he: 'לאנשים שמתמקדים בשיער שיבה גלוי ורוצים שלב יומי ללא שטיפה לקרקפת ולשיער.',
      ar: 'لمن يهتمون بالشعر الرمادي الظاهر ويريدون خطوة يومية بدون شطف للفروة والشعر.',
      ru: 'Для тех, кто занимается видимой сединой и хочет ежедневный несмываемый уход для кожи головы и волос.',
      fr: 'Pour les personnes qui s’intéressent aux cheveux gris visibles et veulent un soin quotidien sans rinçage pour le cuir chevelu et les cheveux.',
      es: 'Para quienes se centran en las canas visibles y quieren un paso diario sin aclarado para el cuero cabelludo y el cabello.',
    }),
    howItWorks: L6({
      en: 'A leave-in serum applied to the scalp and hair. Pigment-support actives such as Greyverse™ and Darkenyl™ are aimed at supporting the follicle’s natural pigment activity, while Capixyl™ and botanicals support the scalp.',
      he: 'סרום ללא שטיפה הנמרח על הקרקפת והשיער. רכיבים התומכים בפיגמנט כמו Greyverse™ ו-Darkenyl™ נועדו לתמוך בפעילות הפיגמנט הטבעית של הזקיק, ואילו Capixyl™ וצמחי מרפא תומכים בקרקפת.',
      ar: 'سيروم بدون شطف يُوضَع على فروة الرأس والشعر. تهدف المكوّنات الداعمة للصبغة مثل Greyverse™ وDarkenyl™ إلى دعم نشاط الصبغة الطبيعي في البصيلة، بينما يدعم Capixyl™ والأعشاب فروة الرأس.',
      ru: 'Несмываемая сыворотка для кожи головы и волос. Компоненты, поддерживающие пигмент, такие как Greyverse™ и Darkenyl™, направлены на поддержку естественной пигментной активности фолликула, а Capixyl™ и растительные экстракты поддерживают кожу головы.',
      fr: 'Un sérum sans rinçage appliqué sur le cuir chevelu et les cheveux. Des actifs de soutien de la pigmentation comme Greyverse™ et Darkenyl™ visent à soutenir l’activité pigmentaire naturelle du follicule, tandis que Capixyl™ et des extraits végétaux soutiennent le cuir chevelu.',
      es: 'Un sérum sin aclarado que se aplica en el cuero cabelludo y el cabello. Activos de apoyo a la pigmentación como Greyverse™ y Darkenyl™ buscan apoyar la actividad pigmentaria natural del folículo, mientras que Capixyl™ y los botánicos apoyan el cuero cabelludo.',
    }),
    routineFit: L6({
      en: 'The outside step of the Gray system: once daily on the scalp and hair. It pairs with Gray Support.',
      he: 'השלב החיצוני של מערכת ה-Gray: פעם ביום על הקרקפת והשיער. משתלב עם Gray Support.',
      ar: 'الخطوة الخارجية في نظام Gray: مرة يوميًا على فروة الرأس والشعر. يتكامل مع Gray Support.',
      ru: 'Внешний этап системы Gray: один раз в день на кожу головы и волосы. Сочетается с Gray Support.',
      fr: 'L’étape extérieure du système Gray : une fois par jour sur le cuir chevelu et les cheveux. Il s’associe à Gray Support.',
      es: 'El paso exterior del sistema Gray: una vez al día en el cuero cabelludo y el cabello. Se combina con Gray Support.',
    }),
    compare: [
      {
        label: 'Gray Support',
        slug: 'gray-support',
        diff: L6({
          en: 'Serum: applied outside, on the scalp and hair. Support: taken inside, as a daily capsule.',
          he: 'סרום: נמרח מבחוץ, על הקרקפת והשיער. תוסף: נלקח מבפנים, כקפסולה יומית.',
          ar: 'السيروم: يُوضَع من الخارج على فروة الرأس والشعر. المكمّل: يُؤخذ من الداخل ككبسولة يومية.',
          ru: 'Сыворотка: наносится снаружи, на кожу головы и волосы. Добавка: принимается внутрь, в виде ежедневной капсулы.',
          fr: 'Sérum : appliqué à l’extérieur, sur le cuir chevelu et les cheveux. Complément : pris à l’intérieur, en capsule quotidienne.',
          es: 'Sérum: se aplica por fuera, en el cuero cabelludo y el cabello. Complemento: se toma por dentro, en cápsula diaria.',
        }),
      },
    ],
    expect: EXPECT_SUPPORT,
    faq: [
      {
        q: L6({
          en: 'Do I need both Gray Serum and Gray Support?',
          he: 'האם צריך גם Gray Serum וגם Gray Support?',
          ar: 'هل أحتاج إلى Gray Serum وGray Support معًا؟',
          ru: 'Нужны ли и Gray Serum, и Gray Support?',
          fr: 'Ai-je besoin de Gray Serum et de Gray Support ?',
          es: '¿Necesito Gray Serum y Gray Support?',
        }),
        a: L6({
          en: 'They work from different sides: the serum is applied on the outside (scalp and hair), the capsule gives nutritional support from the inside. They are designed to be used together, but each is sold on its own.',
          he: 'הם פועלים משני צדדים: הסרום נמרח מבחוץ (קרקפת ושיער), והקפסולה נותנת תמיכה תזונתית מבפנים. הם נועדו לשמש יחד, אך כל אחד נמכר בנפרד.',
          ar: 'يعملان من جانبين مختلفين: يُوضَع السيروم من الخارج (على فروة الرأس والشعر)، وتمنح الكبسولة دعمًا غذائيًا من الداخل. صُمّما للاستخدام معًا، لكن يُباع كلٌّ منهما على حدة.',
          ru: 'Они действуют с разных сторон: сыворотка наносится снаружи (на кожу головы и волосы), а капсула даёт питательную поддержку изнутри. Они задуманы для совместного использования, но продаются по отдельности.',
          fr: 'Ils agissent de deux côtés : le sérum s’applique à l’extérieur (cuir chevelu et cheveux), la capsule apporte un soutien nutritionnel de l’intérieur. Ils sont conçus pour être utilisés ensemble, mais se vendent séparément.',
          es: 'Actúan por lados distintos: el sérum se aplica por fuera (cuero cabelludo y cabello) y la cápsula aporta apoyo nutricional desde dentro. Están pensados para usarse juntos, pero se venden por separado.',
        }),
      },
    ],
  },
  'gray-support': {
    whatItDoes: L6({
      en: 'A daily nutritional-support capsule for people focused on gray hair.',
      he: 'קפסולת תמיכה תזונתית יומית לאנשים שמתמקדים בשיער שיבה.',
      ar: 'كبسولة يومية للدعم الغذائي لمن يهتمون بالشعر الرمادي.',
      ru: 'Ежедневная капсула питательной поддержки для тех, кто занимается сединой.',
      fr: 'Une capsule quotidienne de soutien nutritionnel pour les personnes qui s’intéressent aux cheveux gris.',
      es: 'Una cápsula diaria de apoyo nutricional para quienes se centran en las canas.',
    }),
    whoFor: L6({
      en: 'People focused on visible gray hair who want daily nutritional support from the inside.',
      he: 'לאנשים שמתמקדים בשיער שיבה גלוי ורוצים תמיכה תזונתית יומית מבפנים.',
      ar: 'لمن يهتمون بالشعر الرمادي الظاهر ويريدون دعمًا غذائيًا يوميًا من الداخل.',
      ru: 'Для тех, кто занимается видимой сединой и хочет ежедневную питательную поддержку изнутри.',
      fr: 'Pour les personnes qui s’intéressent aux cheveux gris visibles et veulent un soutien nutritionnel quotidien de l’intérieur.',
      es: 'Para quienes se centran en las canas visibles y quieren apoyo nutricional diario desde dentro.',
    }),
    howItWorks: L6({
      en: 'A daily capsule taken by mouth. It delivers nutrients such as Biotin, Zinc and L-Tyrosine through digestion, to support hair from the inside.',
      he: 'קפסולה יומית הנלקחת דרך הפה. היא מספקת ויטמינים ומינרלים כמו ביוטין, אבץ ו-L-טירוזין דרך מערכת העיכול, כדי לתמוך בשיער מבפנים.',
      ar: 'كبسولة يومية تُؤخذ عن طريق الفم. تمدّ الجسم بمغذّيات مثل البيوتين والزنك وL-Tyrosine عبر الهضم، لدعم الشعر من الداخل.',
      ru: 'Ежедневная капсула для приёма внутрь. Она доставляет такие питательные вещества, как биотин, цинк и L-Tyrosine, через пищеварение, чтобы поддерживать волосы изнутри.',
      fr: 'Une capsule quotidienne à prendre par voie orale. Elle apporte des nutriments comme la biotine, le zinc et la L-Tyrosine par la digestion, pour soutenir les cheveux de l’intérieur.',
      es: 'Una cápsula diaria que se toma por vía oral. Aporta nutrientes como biotina, zinc y L-Tyrosine a través de la digestión, para apoyar el cabello desde dentro.',
    }),
    routineFit: L6({
      en: 'The inside step of the Gray system: 2 capsules daily. It pairs with Gray Serum.',
      he: 'השלב הפנימי של מערכת ה-Gray: 2 קפסולות ביום. משתלב עם Gray Serum.',
      ar: 'الخطوة الداخلية في نظام Gray: كبسولتان يوميًا. يتكامل مع Gray Serum.',
      ru: 'Внутренний этап системы Gray: 2 капсулы в день. Сочетается с Gray Serum.',
      fr: 'L’étape intérieure du système Gray : 2 capsules par jour. Il s’associe à Gray Serum.',
      es: 'El paso interior del sistema Gray: 2 cápsulas al día. Se combina con Gray Serum.',
    }),
    compare: [
      {
        label: 'Gray Serum',
        slug: 'gray-serum',
        diff: L6({
          en: 'Support: taken inside, as a daily capsule. Serum: applied outside, on the scalp and hair.',
          he: 'תוסף: נלקח מבפנים, כקפסולה יומית. סרום: נמרח מבחוץ, על הקרקפת והשיער.',
          ar: 'المكمّل: يُؤخذ من الداخل ككبسولة يومية. السيروم: يُوضَع من الخارج على فروة الرأس والشعر.',
          ru: 'Добавка: принимается внутрь, в виде ежедневной капсулы. Сыворотка: наносится снаружи, на кожу головы и волосы.',
          fr: 'Complément : pris à l’intérieur, en capsule quotidienne. Sérum : appliqué à l’extérieur, sur le cuir chevelu et les cheveux.',
          es: 'Complemento: se toma por dentro, en cápsula diaria. Sérum: se aplica por fuera, en el cuero cabelludo y el cabello.',
        }),
      },
    ],
    expect: EXPECT_SUPPORT,
    faq: [
      {
        q: L6({
          en: 'Is Gray Support a medicine?',
          he: 'האם Gray Support הוא תרופה?',
          ar: 'هل Gray Support دواء؟',
          ru: 'Gray Support — это лекарство?',
          fr: 'Gray Support est-il un médicament ?',
          es: '¿Gray Support es un medicamento?',
        }),
        a: L6({
          en: 'No. It is a daily food supplement, not a medicine. Take it as directed and speak to a doctor if you are pregnant, breastfeeding, or on medication.',
          he: 'לא. זהו תוסף תזונה יומי ולא תרופה. יש ליטול כמצוין, ולהתייעץ עם רופא בהיריון, בהנקה או בנטילת תרופות.',
          ar: 'لا. هو مكمّل غذائي يومي وليس دواءً. يُؤخذ حسب الإرشادات، ويُستشار الطبيب في حالة الحمل أو الرضاعة أو تناول أدوية.',
          ru: 'Нет. Это ежедневная пищевая добавка, а не лекарство. Принимайте согласно инструкции; при беременности, кормлении грудью или приёме лекарств проконсультируйтесь с врачом.',
          fr: 'Non. C’est un complément alimentaire quotidien, pas un médicament. À prendre comme indiqué ; consultez un médecin en cas de grossesse, d’allaitement ou de traitement en cours.',
          es: 'No. Es un complemento alimenticio diario, no un medicamento. Tómalo según las indicaciones y consulta a un médico en caso de embarazo, lactancia o si tomas medicación.',
        }),
      },
    ],
  },
};

const STEP = (icon: StepIcon, text: LocalizedText): { icon: StepIcon; text: LocalizedText } => ({ icon, text });

const PART = STEP(
  'hand',
  L6({
    en: 'Part your hair',
    he: 'חלקו את השיער',
    ar: 'افرق الشعر',
    ru: 'Разделите волосы пробором',
    fr: 'Séparez les cheveux',
    es: 'Separa el cabello',
  }),
);

/** Step-by-step "how to use" graphics, one list per product format — each step is
 *  a condensed line of that format's printed usage directions. */
const STEPS: Record<ProductFormat, Array<{ icon: StepIcon; text: LocalizedText }>> = {
  'topical-solution': [
    PART,
    STEP(
      'droplet',
      L6({
        en: 'Apply 1 full dropper (1 mL) to a dry scalp',
        he: 'מרחו טפטפת מלאה (1 מ״ל) על קרקפת יבשה',
        ar: 'ضع قطّارة كاملة (1 مل) على فروة رأس جافة',
        ru: 'Нанесите полную пипетку (1 мл) на сухую кожу головы',
        fr: 'Appliquez une pipette pleine (1 mL) sur un cuir chevelu sec',
        es: 'Aplica un gotero completo (1 mL) sobre el cuero cabelludo seco',
      }),
    ),
    STEP(
      'hand',
      L6({
        en: 'Spread with your fingertips',
        he: 'פזרו בעזרת קצות האצבעות',
        ar: 'وزّعه بأطراف أصابعك',
        ru: 'Распределите кончиками пальцев',
        fr: 'Répartissez du bout des doigts',
        es: 'Reparte con las yemas de los dedos',
      }),
    ),
    STEP(
      'sparkles',
      L6({
        en: 'Wash your hands',
        he: 'שטפו ידיים',
        ar: 'اغسل يديك',
        ru: 'Вымойте руки',
        fr: 'Lavez-vous les mains',
        es: 'Lávate las manos',
      }),
    ),
    STEP(
      'clock',
      L6({
        en: 'Let it dry before styling or lying down',
        he: 'המתינו שיתייבש לפני עיצוב או שכיבה',
        ar: 'اتركه ليجف قبل التصفيف أو الاستلقاء',
        ru: 'Дайте высохнуть перед укладкой или сном',
        fr: 'Laissez sécher avant de vous coiffer ou de vous allonger',
        es: 'Deja secar antes de peinarte o acostarte',
      }),
    ),
  ],
  serum: [
    PART,
    STEP(
      'droplet',
      L6({
        en: 'Apply a small amount to areas showing gray',
        he: 'מרחו כמות קטנה על אזורים עם שיער שיבה',
        ar: 'ضع كمية صغيرة على المناطق التي يظهر فيها الشيب',
        ru: 'Нанесите небольшое количество на участки с сединой',
        fr: 'Appliquez une petite quantité sur les zones grisonnantes',
        es: 'Aplica una pequeña cantidad en las zonas con canas',
      }),
    ),
    STEP(
      'hand',
      L6({
        en: 'Massage gently until absorbed',
        he: 'עסו בעדינות עד לספיגה',
        ar: 'دلّك بلطف حتى يُمتصّ',
        ru: 'Аккуратно помассируйте до впитывания',
        fr: 'Massez doucement jusqu’à absorption',
        es: 'Masajea suavemente hasta que se absorba',
      }),
    ),
  ],
  'capsule-supplement': [
    STEP(
      'pill',
      L6({
        en: 'Take 2 capsules',
        he: 'קחו 2 קפסולות',
        ar: 'تناول كبسولتين',
        ru: 'Примите 2 капсулы',
        fr: 'Prenez 2 capsules',
        es: 'Toma 2 cápsulas',
      }),
    ),
    STEP(
      'glass',
      L6({
        en: 'With water, and a meal if you prefer',
        he: 'עם מים, ואם תרצו עם ארוחה',
        ar: 'مع الماء، ومع وجبة إن رغبت',
        ru: 'С водой, при желании во время еды',
        fr: 'Avec de l’eau, et un repas si vous préférez',
        es: 'Con agua, y con una comida si lo prefieres',
      }),
    ),
    STEP(
      'clock',
      L6({
        en: 'Every day',
        he: 'בכל יום',
        ar: 'كل يوم',
        ru: 'Каждый день',
        fr: 'Chaque jour',
        es: 'Todos los días',
      }),
    ),
  ],
  shampoo: [
    STEP(
      'shower',
      L6({
        en: 'Apply a generous amount to wet hair',
        he: 'מרחו כמות נדיבה על שיער רטוב',
        ar: 'ضع كمية وفيرة على شعر مبلل',
        ru: 'Нанесите достаточное количество на влажные волосы',
        fr: 'Appliquez une bonne quantité sur cheveux mouillés',
        es: 'Aplica una buena cantidad sobre el cabello mojado',
      }),
    ),
    STEP(
      'hand',
      L6({
        en: 'Massage into the scalp and lengths to lather',
        he: 'עסו לתוך הקרקפת ואל האורך עד להקצפה',
        ar: 'دلّك فروة الرأس والأطوال حتى تتكوّن الرغوة',
        ru: 'Помассируйте кожу головы и длину до пены',
        fr: 'Massez le cuir chevelu et les longueurs pour faire mousser',
        es: 'Masajea el cuero cabelludo y las longitudes hasta que haga espuma',
      }),
    ),
    STEP(
      'droplet',
      L6({
        en: 'Rinse thoroughly with warm water',
        he: 'שטפו היטב במים חמימים',
        ar: 'اشطف جيدًا بماء دافئ',
        ru: 'Тщательно смойте тёплой водой',
        fr: 'Rincez abondamment à l’eau tiède',
        es: 'Aclara bien con agua tibia',
      }),
    ),
    STEP(
      'sparkles',
      L6({
        en: 'Follow with conditioner',
        he: 'המשיכו עם מרכך',
        ar: 'أتبعه بالبلسم',
        ru: 'Завершите кондиционером',
        fr: 'Terminez avec un après-shampoing',
        es: 'Termina con acondicionador',
      }),
    ),
  ],
};

/** Daily routine lanes (from each product's printed directions: Levels twice
 *  daily, Gray Serum once daily, Gray Support daily, shampoo on wash days). */
export const ROUTINE_LANES: ReadonlyArray<{ id: 'morning' | 'evening' | 'anytime' | 'washday'; slugs: string[] }> = [
  { id: 'morning', slugs: [...LEVEL_SLUGS] },
  { id: 'evening', slugs: [...LEVEL_SLUGS] },
  { id: 'anytime', slugs: ['gray-serum', 'gray-support'] },
  { id: 'washday', slugs: ['regrowth-shampoo'] },
];

/** Treatment vs supportive vs Gray system — drives the "how it all fits" map. */
export const SYSTEM_GROUPS: ReadonlyArray<{ id: 'treatment' | 'supportive' | 'gray'; slugs: string[] }> = [
  { id: 'treatment', slugs: [...LEVEL_SLUGS] },
  { id: 'supportive', slugs: ['regrowth-shampoo'] },
  { id: 'gray', slugs: ['gray-serum', 'gray-support'] },
];

export function buildProductGuide(slug: string, locale: LocaleCode): ProductGuideModel | null {
  const g = GUIDES[slug];
  const p = getProduct(slug);
  if (!g || !p) return null;
  return {
    slug,
    isLevel: (LEVEL_SLUGS as readonly string[]).includes(slug),
    whatItDoes: pickLocalized(g.whatItDoes, locale),
    whoFor: pickLocalized(g.whoFor, locale),
    howItWorks: pickLocalized(g.howItWorks, locale),
    steps: STEPS[p.format].map((s) => ({ icon: s.icon, text: pickLocalized(s.text, locale) })),
    routineFit: pickLocalized(g.routineFit, locale),
    compare: g.compare.map((c) => ({ label: c.label, slug: c.slug, diff: pickLocalized(c.diff, locale) })),
    expect: pickLocalized(g.expect, locale),
    expectTimeline: PENDING('time to visible results'),
    faq: g.faq.map((f) => ({ q: pickLocalized(f.q, locale), a: pickLocalized(f.a, locale) })),
    claimStatus: 'working',
  };
}
