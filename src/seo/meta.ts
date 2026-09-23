import { L6, type LocalizedText } from '@/content/localized';
import { PRODUCTS } from '@/content/products';

/**
 * Page metadata (brief §31). `index.html` stays `noindex,nofollow` for the
 * concept build, so this is scaffolding for when the site goes live — titles,
 * descriptions, canonical, and OpenGraph placeholders, keyed by path.
 * No medical schema, no unsupported claims.
 */
export type PageMeta = {
  title: LocalizedText;
  description: LocalizedText;
};

const SITE = 'ROOTÉ';

export const ROUTE_META: Record<string, PageMeta> = {
  '/': {
    title: L6({
      en: 'Personalized Hair Growth System',
      he: 'מערכת אישית לצמיחת שיער',
      ar: 'نظام مخصّص لنمو الشعر',
      ru: 'Персональная система роста волос',
      fr: 'Système personnalisé de croissance capillaire',
      es: 'Sistema personalizado de crecimiento capilar',
    }),
    description: L6({
      en: 'Start with a guided hair analysis. Understand your condition, get a personalized program, and track your journey from first scan to final result.',
      he: 'מתחילים באבחון שיער מודרך. מבינים את המצב, מקבלים תוכנית אישית, ועוקבים אחר המסע מהסריקה הראשונה ועד לתוצאה הסופית.',
      ar: 'ابدأ بتحليل شعر موجَّه. افهم حالتك، احصل على برنامج مخصّص، وتابع رحلتك من الفحص الأول وحتى النتيجة النهائية.',
      ru: 'Начните с пошаговой диагностики волос. Поймите своё состояние, получите персональную программу и отслеживайте свой путь от первого сканирования до итогового результата.',
      fr: 'Commencez par une analyse capillaire guidée. Comprenez votre état, obtenez un programme personnalisé et suivez votre parcours du premier scan au résultat final.',
      es: 'Comience con un análisis capilar guiado. Entienda su estado, obtenga un programa personalizado y siga su recorrido desde el primer escaneo hasta el resultado final.',
    }),
  },
  '/solutions': {
    title: L6({
      en: 'Hair thinning & gray-hair solutions',
      he: 'פתרונות לשיער דליל ולשיער אפור',
      ar: 'حلول لترقّق الشعر وللشعر الرمادي',
      ru: 'Решения для поредения волос и седины',
      fr: 'Solutions pour le dégarnissement des cheveux et les cheveux gris',
      es: 'Soluciones para el aclaramiento del cabello y las canas',
    }),
    description: L6({
      en: 'Understand your hair, then choose a path. Each solution starts with a free analysis.',
      he: 'להבין את השיער, ואז לבחור מסלול. כל פתרון מתחיל באבחון חינם.',
      ar: 'افهم شعرك، ثم اختر مسارًا. كل حل يبدأ بتحليل مجاني.',
      ru: 'Поймите свои волосы, а затем выберите путь. Каждое решение начинается с бесплатной диагностики.',
      fr: 'Comprenez vos cheveux, puis choisissez une voie. Chaque solution commence par une analyse gratuite.',
      es: 'Entienda su cabello y luego elija un camino. Cada solución comienza con un análisis gratuito.',
    }),
  },
  '/results': {
    title: L6({
      en: 'Results',
      he: 'תוצאות',
      ar: 'النتائج',
      ru: 'Результаты',
      fr: 'Résultats',
      es: 'Resultados',
    }),
    description: L6({
      en: 'Progress should be documented, not promised. Verified ROOTÉ results coming soon.',
      he: 'התקדמות צריך לתעד, לא להבטיח. תוצאות ROOTÉ מאומתות בקרוב.',
      ar: 'يجب توثيق التقدّم، لا الوعد به. نتائج ROOTÉ الموثوقة قريبًا.',
      ru: 'Прогресс нужно документировать, а не обещать. Проверенные результаты ROOTÉ скоро появятся.',
      fr: 'Les progrès doivent être documentés, pas promis. Des résultats ROOTÉ vérifiés arrivent bientôt.',
      es: 'El progreso debe documentarse, no prometerse. Resultados verificados de ROOTÉ, próximamente.',
    }),
  },
  '/products': {
    title: L6({
      en: 'Products',
      he: 'מוצרים',
      ar: 'المنتجات',
      ru: 'Продукты',
      fr: 'Produits',
      es: 'Productos',
    }),
    description: L6({
      en: 'Targeted treatments and support products. Your program tells you which to use.',
      he: 'טיפולים ממוקדים ומוצרי תמיכה. התוכנית שלך מגדירה במה להשתמש.',
      ar: 'علاجات موجَّهة ومنتجات داعمة. برنامجك يحدّد أيها تستخدم.',
      ru: 'Целевые средства и вспомогательные продукты. Ваша программа определяет, что именно использовать.',
      fr: 'Des traitements ciblés et des produits de soutien. Votre programme vous indique lesquels utiliser.',
      es: 'Tratamientos específicos y productos de apoyo. Su programa le indica cuáles usar.',
    }),
  },
  '/analysis': {
    title: L6({
      en: 'Free hair analysis',
      he: 'אבחון שיער חינם',
      ar: 'تحليل شعر مجاني',
      ru: 'Бесплатная диагностика волос',
      fr: 'Analyse capillaire gratuite',
      es: 'Análisis capilar gratuito',
    }),
    description: L6({
      en: 'A few minutes, guided photos, a personalized result.',
      he: 'כמה דקות, תמונות מודרכות, תוצאה אישית.',
      ar: 'بضع دقائق، صور موجَّهة، نتيجة مخصّصة.',
      ru: 'Несколько минут, пошаговые фото, персональный результат.',
      fr: 'Quelques minutes, des photos guidées, un résultat personnalisé.',
      es: 'Unos minutos, fotos guiadas, un resultado personalizado.',
    }),
  },
  '/solutions/thinning': {
    title: L6({
      en: 'Hair thinning',
      he: 'שיער דליל',
      ar: 'ترقّق الشعر',
      ru: 'Поредение волос',
      fr: 'Dégarnissement des cheveux',
      es: 'Aclaramiento del cabello',
    }),
    description: L6({
      en: 'Understand your hair density before choosing a treatment.',
      he: 'להבין את צפיפות השיער לפני שבוחרים טיפול.',
      ar: 'افهم كثافة شعرك قبل اختيار العلاج.',
      ru: 'Поймите плотность своих волос, прежде чем выбирать лечение.',
      fr: 'Comprenez la densité de vos cheveux avant de choisir un traitement.',
      es: 'Entienda la densidad de su cabello antes de elegir un tratamiento.',
    }),
  },
  '/solutions/gray-hair': {
    title: L6({
      en: 'Gray hair',
      he: 'שיער אפור',
      ar: 'الشعر الرمادي',
      ru: 'Седина',
      fr: 'Cheveux gris',
      es: 'Canas',
    }),
    description: L6({
      en: 'Understand what is changing at the root, and the Gray system.',
      he: 'להבין מה משתנה בשורש, ואת המערכת לשיער אפור.',
      ar: 'افهم ما الذي يتغيّر عند الجذر، وتعرّف على نظام العناية بالشيب.',
      ru: 'Поймите, что меняется у корня волос, и узнайте о системе ухода против седины.',
      fr: 'Comprenez ce qui change à la racine, et découvrez le système anti-cheveux gris.',
      es: 'Entienda qué está cambiando en la raíz, y conozca el sistema anticanas.',
    }),
  },
  '/program': {
    title: L6({
      en: 'Your ROOTÉ program',
      he: 'תוכנית ROOTÉ שלך',
      ar: 'برنامج ROOTÉ الخاص بك',
      ru: 'Ваша программа ROOTÉ',
      fr: 'Votre programme ROOTÉ',
      es: 'Su programa ROOTÉ',
    }),
    description: L6({
      en: 'Choose a program duration and start.',
      he: 'לבחור משך תוכנית ולהתחיל.',
      ar: 'اختر مدة البرنامج وابدأ.',
      ru: 'Выберите длительность программы и начните.',
      fr: 'Choisissez une durée de programme et commencez.',
      es: 'Elija la duración del programa y comience.',
    }),
  },
  '/account': {
    title: L6({
      en: 'My ROOTÉ',
      he: 'ROOTÉ שלי',
      ar: 'ROOTÉ الخاص بي',
      ru: 'Мой ROOTÉ',
      fr: 'Mon ROOTÉ',
      es: 'Mi ROOTÉ',
    }),
    description: L6({
      en: 'Your program, routine, progress photos, and scans.',
      he: 'התוכנית, השגרה, תמונות ההתקדמות והסריקות שלך.',
      ar: 'برنامجك، روتينك، صور التقدّم، والفحوصات الخاصة بك.',
      ru: 'Ваша программа, распорядок, фото прогресса и сканирования.',
      fr: 'Votre programme, votre routine, vos photos de progrès et vos scans.',
      es: 'Su programa, su rutina, sus fotos de progreso y sus escaneos.',
    }),
  },
};

/** Per-product entries (was: every SKU fell back to the generic `/products` meta —
 *  SEO-AUDIT.md H4). Derived from the SKUs' own approved name/subtitle/shortDescription;
 *  never exposes formula strengths or invents copy. */
for (const product of PRODUCTS) {
  const shortName = product.name.replace(/^ROOTÉ\s+/, '');
  ROUTE_META[`/products/${product.slug}`] = {
    title: L6({
      en: `${shortName}: ${product.subtitle.en}`,
      he: `${shortName}: ${product.subtitle.he}`,
      ar: `${shortName}: ${product.subtitle.ar}`,
      ru: `${shortName}: ${product.subtitle.ru}`,
      fr: `${shortName}: ${product.subtitle.fr}`,
      es: `${shortName}: ${product.subtitle.es}`,
    }),
    description: product.shortDescription,
  };
}

export function metaForPath(path: string): PageMeta {
  if (ROUTE_META[path]) return ROUTE_META[path];
  // fall back to progressively shorter prefixes, e.g. /analysis/gender → /analysis
  const parts = path.split('/').filter(Boolean);
  for (let i = parts.length - 1; i >= 1; i -= 1) {
    const prefix = '/' + parts.slice(0, i).join('/');
    if (ROUTE_META[prefix]) return ROUTE_META[prefix];
  }
  return ROUTE_META['/'];
}

export function fullTitle(title: string): string {
  return `${SITE}: ${title}`;
}
