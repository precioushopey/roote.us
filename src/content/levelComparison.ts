import { L6, pickLocalized, type LocalizedText } from './localized';
import { getProduct } from './products';
import { PENDING, type PendingMarker } from './pending';
import type { ClaimStatus } from './claims';
import type { LocaleCode } from '@/i18n/locales';

/**
 * Level 6 / 10 / 15 comparison — pure content layer (no React / DOM / storage /
 * i18n provider). Numbers and ingredient notes are *derived* from `products.ts`
 * so the comparison cannot drift from the label; only the framing copy below is
 * new. Mechanism-only wording — no efficacy, no results promises. All copy is
 * first-pass (`he` is the per-entry reference) and carries `claimStatus:
 * 'working'`: pending formal legal / medical review.
 */

export type LevelSlug = 'density-6' | 'density-10' | 'density-15';
export const LEVEL_SLUGS: readonly LevelSlug[] = ['density-6', 'density-10', 'density-15'];

export type Meter = { value: number | PendingMarker; unit: '%'; fill: number };
export type LevelExtra = { name: string; strength: string | PendingMarker; note: string };
export type LevelColumn = {
  slug: LevelSlug;
  name: string;
  tagline: string;
  suits: string;
  claimStatus: ClaimStatus;
  minoxidil: Meter;
  finasteride: Meter;
  extras: LevelExtra[];
};
export type LevelSnippet = {
  id: 'minoxidil' | 'finasteride' | 'dht';
  title: string;
  body: string;
  claimStatus: ClaimStatus;
};
export type LevelComparisonModel = {
  columns: LevelColumn[];
  notARanking: string;
  snippets: LevelSnippet[];
  pendingMedia: PendingMarker[];
};

const TAGLINE: Record<LevelSlug, LocalizedText> = {
  'density-6': L6({
    en: 'Lower Minoxidil level',
    he: 'רמת מינוקסידיל נמוכה',
    ar: 'مستوى منخفض من Minoxidil',
    ru: 'Более низкий уровень Minoxidil',
    fr: 'Niveau de Minoxidil plus bas',
    es: 'Nivel de Minoxidil más bajo',
  }),
  'density-10': L6({
    en: 'Stronger / advanced level',
    he: 'רמה חזקה / מתקדמת יותר',
    ar: 'مستوى أقوى / متقدّم',
    ru: 'Более сильный / продвинутый уровень',
    fr: 'Niveau plus fort / avancé',
    es: 'Nivel más fuerte / avanzado',
  }),
  'density-15': L6({
    en: 'Highest Minoxidil level',
    he: 'רמת המינוקסידיל הגבוהה ביותר',
    ar: 'أعلى مستوى من Minoxidil',
    ru: 'Самый высокий уровень Minoxidil',
    fr: 'Niveau de Minoxidil le plus élevé',
    es: 'Nivel de Minoxidil más alto',
  }),
};

// Generic, drawn from each product's `role` — no invented patient profiles.
const SUITS: Record<LevelSlug, LocalizedText> = {
  'density-6': L6({
    en: 'A lower-strength starting point.',
    he: 'נקודת פתיחה בעוצמה נמוכה.',
    ar: 'نقطة انطلاق بتركيز أقل.',
    ru: 'Отправная точка с меньшей концентрацией.',
    fr: 'Un point de départ à plus faible concentration.',
    es: 'Un punto de partida de menor concentración.',
  }),
  'density-10': L6({
    en: 'A stronger, more advanced formula, for people whose professional advises a step up.',
    he: 'פורמולה חזקה ומתקדמת יותר, למי שאיש מקצוע ממליץ לו על שלב מתקדם.',
    ar: 'تركيبة أقوى وأكثر تقدّمًا لمن ينصحه أخصائي بالانتقال إلى مستوى أعلى.',
    ru: 'Более сильная и продвинутая формула для тех, кому специалист рекомендует перейти на следующий уровень.',
    fr: 'Une formule plus forte et plus avancée, pour les personnes à qui un professionnel conseille de passer au niveau supérieur.',
    es: 'Una fórmula más fuerte y avanzada, para quienes un profesional recomienda dar un paso más.',
  }),
  'density-15': L6({
    en: 'The highest Minoxidil level, for people whose professional advises the strongest option.',
    he: 'רמת המינוקסידיל הגבוהה ביותר, למי שאיש מקצוע ממליץ לו על האפשרות החזקה ביותר.',
    ar: 'أعلى مستوى من Minoxidil لمن ينصحه أخصائي بأقوى خيار.',
    ru: 'Самый высокий уровень Minoxidil для тех, кому специалист рекомендует самый сильный вариант.',
    fr: "Le niveau de Minoxidil le plus élevé, pour les personnes à qui un professionnel conseille l'option la plus forte.",
    es: 'El nivel de Minoxidil más alto, para quienes un profesional recomienda la opción más fuerte.',
  }),
};

const NOT_A_RANKING: LocalizedText = L6({
  en: "Higher isn't automatically better. Different people suit different levels, and each one needs medical review before use. Talk to a clinician about which fits you.",
  he: 'גבוה יותר אינו בהכרח טוב יותר. אנשים שונים מתאימים לרמות שונות, וכל רמה דורשת בדיקה רפואית לפני השימוש. מומלץ לשוחח עם איש מקצוע רפואי על הרמה המתאימה לך.',
  ar: 'الأعلى ليس بالضرورة الأفضل. يناسب كل شخص مستوى مختلف، ويحتاج كل مستوى إلى مراجعة طبية قبل الاستخدام. تحدّث مع أخصائي لمعرفة ما يناسبك.',
  ru: 'Выше — не значит лучше. Разным людям подходят разные уровни, и каждый требует медицинской проверки перед использованием. Обсудите с врачом, какой уровень подходит вам.',
  fr: 'Plus fort ne veut pas dire meilleur. Chaque personne convient à un niveau différent, et chacun nécessite une validation médicale avant utilisation. Parlez-en à un professionnel pour savoir lequel vous correspond.',
  es: 'Más alto no significa mejor. A cada persona le conviene un nivel distinto, y todos requieren revisión médica antes de usarse. Habla con un profesional para saber cuál te corresponde.',
});

const SNIPPETS: Record<LevelSnippet['id'], { title: LocalizedText; body: LocalizedText }> = {
  minoxidil: {
    title: L6({
      en: 'What is Minoxidil?',
      he: 'מהו מינוקסידיל?',
      ar: 'ما هو Minoxidil؟',
      ru: 'Что такое Minoxidil?',
      fr: "Qu'est-ce que le Minoxidil ?",
      es: '¿Qué es el Minoxidil?',
    }),
    body: L6({
      en: 'A topical ingredient applied to the scalp. It is understood to widen tiny blood vessels around the follicle and help hair stay longer in its growth phase. The percentage (6%, 10%, 15%) is simply how much is in the formula.',
      he: 'רכיב למריחה על הקרקפת. מקובל להבין שהוא מרחיב כלי דם זעירים סביב הזקיק ועוזר לשיער להישאר זמן רב יותר בשלב הצמיחה. האחוז (6%, 10%, 15%) הוא פשוט כמות החומר בפורמולה.',
      ar: 'مكوّن موضعي يُوضَع على فروة الرأس. يُفهَم أنه يوسّع الأوعية الدموية الدقيقة حول البصيلة ويساعد الشعر على البقاء مدة أطول في مرحلة النمو. النسبة (6%، 10%، 15%) هي ببساطة كمية المادة في التركيبة.',
      ru: 'Местный компонент, наносимый на кожу головы. Считается, что он расширяет мелкие сосуды вокруг фолликула и помогает волосу дольше оставаться в фазе роста. Процент (6%, 10%, 15%) — это просто количество вещества в формуле.',
      fr: "Un ingrédient topique appliqué sur le cuir chevelu. On considère qu'il dilate les minuscules vaisseaux autour du follicule et aide le cheveu à rester plus longtemps en phase de croissance. Le pourcentage (6 %, 10 %, 15 %) indique simplement la quantité dans la formule.",
      es: 'Un ingrediente tópico que se aplica en el cuero cabelludo. Se entiende que dilata los diminutos vasos sanguíneos alrededor del folículo y ayuda a que el cabello permanezca más tiempo en su fase de crecimiento. El porcentaje (6 %, 10 %, 15 %) es simplemente la cantidad en la fórmula.',
    }),
  },
  finasteride: {
    title: L6({
      en: 'What is Finasteride?',
      he: 'מהו פינסטריד?',
      ar: 'ما هو Finasteride؟',
      ru: 'Что такое Finasteride?',
      fr: "Qu'est-ce que le Finasteride ?",
      es: '¿Qué es el Finasteride?',
    }),
    body: L6({
      en: 'An ingredient understood to reduce DHT, a hormone linked to hair follicles gradually shrinking. Here it is applied topically. Each Level lists its own amount, so it does not rise from Level 6 to Level 15.',
      he: 'רכיב שמקובל להבין שהוא מפחית DHT, הורמון הקשור להתכווצות הדרגתית של זקיקי שיער. כאן הוא משמש למריחה מקומית. לכל רמה כמות משלה, ולכן היא אינה עולה מרמה 6 ל-15.',
      ar: 'مكوّن يُفهَم أنه يقلّل DHT، وهو هرمون مرتبط بانكماش بصيلات الشعر تدريجيًا. يُستخدم هنا موضعيًا. لكل مستوى كميته الخاصة، لذا لا ترتفع من المستوى 6 إلى 15.',
      ru: 'Компонент, который, как считается, снижает уровень DHT — гормона, связанного с постепенным уменьшением волосяных фолликулов. Здесь он применяется местно. В каждом уровне своё количество, поэтому оно не растёт от уровня 6 к 15.',
      fr: "Un ingrédient censé réduire la DHT, une hormone associée au rétrécissement progressif des follicules. Il est ici appliqué par voie topique. Chaque niveau a sa propre quantité : elle n'augmente pas du niveau 6 au niveau 15.",
      es: 'Un ingrediente que se entiende que reduce la DHT, una hormona asociada a que los folículos se vayan encogiendo. Aquí se aplica por vía tópica. Cada nivel tiene su propia cantidad, por lo que no aumenta del nivel 6 al 15.',
    }),
  },
  dht: {
    title: L6({
      en: 'What is DHT?',
      he: 'מהו DHT?',
      ar: 'ما هو DHT؟',
      ru: 'Что такое DHT?',
      fr: "Qu'est-ce que la DHT ?",
      es: '¿Qué es la DHT?',
    }),
    body: L6({
      en: 'A hormone made from testosterone. In people who are sensitive to it, it is linked to hair follicles getting smaller over time, so hairs grow thinner and shorter.',
      he: 'הורמון שנוצר מטסטוסטרון. אצל אנשים רגישים אליו הוא קשור להקטנה הדרגתית של זקיקי השיער, כך שהשיער נעשה דק וקצר יותר.',
      ar: 'هرمون يتكوّن من التستوستيرون. لدى الأشخاص الحسّاسين له، يرتبط بصغر بصيلات الشعر مع الوقت، فينمو الشعر أرفع وأقصر.',
      ru: 'Гормон, образующийся из тестостерона. У чувствительных к нему людей он связан с постепенным уменьшением фолликулов, из-за чего волосы становятся тоньше и короче.',
      fr: 'Une hormone issue de la testostérone. Chez les personnes qui y sont sensibles, elle est associée au rétrécissement des follicules avec le temps : les cheveux deviennent plus fins et plus courts.',
      es: 'Una hormona que se produce a partir de la testosterona. En las personas sensibles a ella, se asocia a que los folículos se vayan encogiendo con el tiempo, y el cabello crece más fino y corto.',
    }),
  },
};

const SNIPPET_ORDER: LevelSnippet['id'][] = ['minoxidil', 'finasteride', 'dht'];

/** Each ingredient is measured on its own scale (Minoxidil vs 15%, Finasteride vs
 *  0.3%) — Finasteride is highest in Level 6, so the two never share one bar. */
const MINOXIDIL_MAX = 15;
const FINASTERIDE_MAX = 0.3;

function parsePct(s?: string): number | null {
  const n = s ? parseFloat(s) : NaN;
  return Number.isFinite(n) ? n : null;
}

function meter(strength: string | undefined, max: number, pendingLabel: string): Meter {
  const n = parsePct(strength);
  if (n === null) return { value: PENDING(pendingLabel), unit: '%', fill: 0 };
  return { value: n, unit: '%', fill: Math.max(0, Math.min(1, n / max)) };
}

function buildColumn(slug: LevelSlug, locale: LocaleCode): LevelColumn {
  const p = getProduct(slug);
  const strengthOf = (name: string) => p?.ingredients.find((i) => i.name === name)?.strength;
  return {
    slug,
    name: p?.name ?? slug,
    tagline: pickLocalized(TAGLINE[slug], locale),
    suits: pickLocalized(SUITS[slug], locale),
    claimStatus: 'working',
    minoxidil: meter(strengthOf('Minoxidil'), MINOXIDIL_MAX, `${slug} Minoxidil strength`),
    finasteride: meter(strengthOf('Finasteride'), FINASTERIDE_MAX, `${slug} Finasteride strength`),
    extras: (p?.ingredients ?? [])
      .filter((i) => i.name !== 'Minoxidil' && i.name !== 'Finasteride')
      .map((i) => ({
        name: i.name,
        strength: i.strength ?? PENDING(`${i.name} strength`),
        note: pickLocalized(i.note, locale),
      })),
  };
}

export function buildLevelComparison(locale: LocaleCode): LevelComparisonModel {
  return {
    columns: LEVEL_SLUGS.map((slug) => buildColumn(slug, locale)),
    notARanking: pickLocalized(NOT_A_RANKING, locale),
    snippets: SNIPPET_ORDER.map((id) => ({
      id,
      title: pickLocalized(SNIPPETS[id].title, locale),
      body: pickLocalized(SNIPPETS[id].body, locale),
      claimStatus: 'working',
    })),
    pendingMedia: [
      PENDING('Level lifestyle photo'),
      PENDING('Level explainer video'),
      PENDING('Before/after (real consented results only)'),
    ],
  };
}

/** Generic "may suit" lines, reused by the product guides. */
export const LEVEL_SUITS = SUITS;
