import { L6, pickLocalized, type LocalizedText } from './localized';
import { PENDING, type PendingMarker } from './pending';
import type { ClaimStatus } from './claims';
import type { LocaleCode } from '@/i18n/locales';

/**
 * Short educational explainers for the /magazine "learn" hub (how hair loss
 * happens, what causes gray hair, Gray Serum vs Gray Support, how the products
 * work together). Pure content layer. Mechanism-only, no efficacy claims; copy is
 * first-pass (`he` is the reference), `claimStatus: 'working'` — pending formal
 * legal / medical review. The Minoxidil / Finasteride / DHT explainers and the
 * Level 6/10/15 comparison live in `levelComparison.ts` and are shown in the same
 * hub, so they are not repeated here.
 */

export type EducationTopicId = 'cycle' | 'gray' | 'gray-system' | 'together';

export type EducationTopic = { id: EducationTopicId; title: string; body: string; claimStatus: ClaimStatus };
export type EducationModel = { topics: EducationTopic[]; pendingMedia: PendingMarker[] };

const TOPICS: Array<{ id: EducationTopicId; title: LocalizedText; body: LocalizedText }> = [
  {
    id: 'cycle',
    title: L6({
      en: 'How does hair loss happen?',
      he: 'איך נשירת שיער קורית?',
      ar: 'كيف يحدث تساقط الشعر؟',
      ru: 'Как происходит выпадение волос?',
      fr: 'Comment se produit la chute des cheveux ?',
      es: '¿Cómo se produce la caída del cabello?',
    }),
    body: L6({
      en: 'Each hair grows in a cycle: a long growth phase, a short transition, then a rest phase before it sheds and a new hair begins. In people who are sensitive to DHT, follicles gradually shrink, so each new hair is thinner and shorter, and growth phases get shorter over time.',
      he: 'כל שערה גדלה במחזור: שלב צמיחה ארוך, מעבר קצר, ואז שלב מנוחה לפני שהיא נושרת ושערה חדשה מתחילה. אצל אנשים רגישים ל-DHT, הזקיקים מתכווצים בהדרגה, כך שכל שערה חדשה דקה וקצרה יותר, ושלבי הצמיחה מתקצרים עם הזמן.',
      ar: 'تنمو كل شعرة في دورة: مرحلة نمو طويلة، ثم انتقال قصير، ثم مرحلة راحة قبل أن تسقط وتبدأ شعرة جديدة. لدى الأشخاص الحسّاسين لـ DHT، تنكمش البصيلات تدريجيًا، فتصبح كل شعرة جديدة أرفع وأقصر، وتقصر مراحل النمو مع الوقت.',
      ru: 'Каждый волос растёт циклами: долгая фаза роста, короткий переход, затем фаза покоя, после которой волос выпадает и начинает расти новый. У людей, чувствительных к DHT, фолликулы постепенно уменьшаются, поэтому каждый новый волос тоньше и короче, а фазы роста со временем сокращаются.',
      fr: 'Chaque cheveu pousse selon un cycle : une longue phase de croissance, une courte transition, puis une phase de repos avant de tomber et de laisser place à un nouveau cheveu. Chez les personnes sensibles à la DHT, les follicules rétrécissent peu à peu : chaque nouveau cheveu est plus fin et plus court, et les phases de croissance raccourcissent avec le temps.',
      es: 'Cada cabello crece en un ciclo: una fase de crecimiento larga, una transición corta y una fase de reposo antes de caer y dar paso a un cabello nuevo. En las personas sensibles a la DHT, los folículos se van encogiendo, así que cada cabello nuevo es más fino y corto, y las fases de crecimiento se acortan con el tiempo.',
    }),
  },
  {
    id: 'gray',
    title: L6({
      en: 'What causes gray hair?',
      he: 'מה גורם לשיער שיבה?',
      ar: 'ما الذي يسبب الشعر الرمادي؟',
      ru: 'Что вызывает седину?',
      fr: 'Qu’est-ce qui cause les cheveux gris ?',
      es: '¿Qué causa las canas?',
    }),
    body: L6({
      en: 'Hair color comes from pigment (melanin) made by cells at the base of each follicle. Over time, mostly because of age and genetics, those cells make less pigment, so new hairs can grow in gray or white.',
      he: 'צבע השיער בא מפיגמנט (מלנין) שנוצר בתאים בבסיס כל זקיק. עם הזמן, בעיקר בגלל גיל וגנטיקה, התאים האלה מייצרים פחות פיגמנט, ולכן שערות חדשות יכולות לצמוח אפורות או לבנות.',
      ar: 'يأتي لون الشعر من صبغة (الميلانين) تصنعها خلايا عند قاعدة كل بصيلة. مع الوقت، وغالبًا بسبب العمر والوراثة، تنتج هذه الخلايا صبغة أقل، فقد تنمو الشعرات الجديدة رمادية أو بيضاء.',
      ru: 'Цвет волос определяет пигмент (меланин), который вырабатывается клетками у основания каждого фолликула. Со временем, в основном из-за возраста и генетики, эти клетки производят меньше пигмента, и новые волосы могут отрастать седыми или белыми.',
      fr: 'La couleur des cheveux vient d’un pigment (la mélanine) fabriqué par des cellules à la base de chaque follicule. Avec le temps, surtout à cause de l’âge et de la génétique, ces cellules produisent moins de pigment : les nouveaux cheveux peuvent alors pousser gris ou blancs.',
      es: 'El color del cabello proviene de un pigmento (la melanina) que fabrican unas células en la base de cada folículo. Con el tiempo, sobre todo por la edad y la genética, esas células producen menos pigmento, y los cabellos nuevos pueden crecer grises o blancos.',
    }),
  },
  {
    id: 'gray-system',
    title: L6({
      en: 'How do Gray Serum and Gray Support work differently?',
      he: 'במה Gray Serum ו-Gray Support פועלים אחרת?',
      ar: 'كيف يختلف عمل Gray Serum عن Gray Support؟',
      ru: 'Чем отличается действие Gray Serum и Gray Support?',
      fr: 'En quoi Gray Serum et Gray Support agissent-ils différemment ?',
      es: '¿En qué se diferencian Gray Serum y Gray Support?',
    }),
    body: L6({
      en: 'Gray Serum is applied on the outside, to the scalp and hair. Gray Support is taken on the inside, as a daily capsule. One works from the outside in, the other from the inside out.',
      he: 'Gray Serum נמרח מבחוץ, על הקרקפת והשיער. Gray Support נלקח מבפנים, כקפסולה יומית. אחד פועל מבחוץ פנימה, והשני מבפנים החוצה.',
      ar: 'يُوضَع Gray Serum من الخارج على فروة الرأس والشعر. أما Gray Support فيُؤخذ من الداخل ككبسولة يومية. أحدهما يعمل من الخارج إلى الداخل، والآخر من الداخل إلى الخارج.',
      ru: 'Gray Serum наносится снаружи, на кожу головы и волосы. Gray Support принимается внутрь, в виде ежедневной капсулы. Одно средство действует снаружи внутрь, другое — изнутри наружу.',
      fr: 'Gray Serum s’applique à l’extérieur, sur le cuir chevelu et les cheveux. Gray Support se prend à l’intérieur, en capsule quotidienne. L’un agit de l’extérieur vers l’intérieur, l’autre de l’intérieur vers l’extérieur.',
      es: 'Gray Serum se aplica por fuera, en el cuero cabelludo y el cabello. Gray Support se toma por dentro, en cápsula diaria. Uno actúa de fuera hacia dentro, el otro de dentro hacia fuera.',
    }),
  },
  {
    id: 'together',
    title: L6({
      en: 'How should the products be used together?',
      he: 'איך משתמשים במוצרים יחד?',
      ar: 'كيف تُستخدم المنتجات معًا؟',
      ru: 'Как использовать продукты вместе?',
      fr: 'Comment utiliser les produits ensemble ?',
      es: '¿Cómo se usan los productos juntos?',
    }),
    body: L6({
      en: 'Your Level is the main hair-loss treatment, used morning and evening. Regrowth Shampoo supports it on wash days. If gray hair is also a focus, Gray Serum (outside) and Gray Support (inside) add the Gray system. Your program lists exactly what to use and when.',
      he: 'הרמה שלך היא הטיפול העיקרי בנשירת שיער, בבוקר ובערב. Regrowth Shampoo תומך בה בימי חפיפה. אם שיער שיבה הוא גם מוקד, Gray Serum (מבחוץ) ו-Gray Support (מבפנים) מוסיפים את מערכת ה-Gray. התוכנית שלך מפרטת בדיוק במה להשתמש ומתי.',
      ar: 'مستواك هو العلاج الأساسي لتساقط الشعر، ويُستخدم صباحًا ومساءً. يدعمه Regrowth Shampoo في أيام الغسل. وإذا كان الشعر الرمادي محور اهتمامك أيضًا، فإن Gray Serum (من الخارج) وGray Support (من الداخل) يضيفان نظام Gray. يوضّح برنامجك بالضبط ما تستخدمه ومتى.',
      ru: 'Ваш уровень — основное средство от выпадения волос, его используют утром и вечером. Regrowth Shampoo поддерживает его в дни мытья головы. Если вас интересует и седина, Gray Serum (снаружи) и Gray Support (изнутри) добавляют систему Gray. В вашей программе указано, что и когда использовать.',
      fr: 'Votre niveau est le traitement principal de la chute des cheveux, utilisé matin et soir. Regrowth Shampoo le soutient les jours de lavage. Si les cheveux gris sont aussi une priorité, Gray Serum (extérieur) et Gray Support (intérieur) ajoutent le système Gray. Votre programme indique précisément quoi utiliser et quand.',
      es: 'Tu nivel es el tratamiento principal contra la caída, y se usa por la mañana y por la noche. Regrowth Shampoo lo apoya los días de lavado. Si las canas también te importan, Gray Serum (por fuera) y Gray Support (por dentro) añaden el sistema Gray. Tu programa indica exactamente qué usar y cuándo.',
    }),
  },
];

export function buildEducation(locale: LocaleCode): EducationModel {
  return {
    topics: TOPICS.map((t) => ({
      id: t.id,
      title: pickLocalized(t.title, locale),
      body: pickLocalized(t.body, locale),
      claimStatus: 'working',
    })),
    // Real, approved assets only — shown as explicit pending slots until supplied.
    pendingMedia: [
      PENDING('Educational short video'),
      PENDING('Before/after (real consented results only)'),
    ],
  };
}
