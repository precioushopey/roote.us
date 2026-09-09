import { L, type LocalizedText } from '@/content/localized';
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
    title: L('Personalized Hair Growth System', 'מערכת אישית לצמיחת שיער'),
    description: L(
      'Start with a guided hair analysis. Understand your condition, get a personalized program, and track your journey from first scan to final result.',
      'מתחילים באבחון שיער מודרך. מבינים את המצב, מקבלים תוכנית אישית, ועוקבים אחר המסע מהסריקה הראשונה ועד לתוצאה הסופית.',
    ),
  },
  '/solutions': {
    title: L('Hair thinning & gray-hair solutions', 'פתרונות לשיער דליל ולשיער אפור'),
    description: L('Understand your hair, then choose a path. Each solution starts with a free analysis.', 'להבין את השיער, ואז לבחור מסלול. כל פתרון מתחיל באבחון חינם.'),
  },
  '/results': {
    title: L('Results', 'תוצאות'),
    description: L('Progress should be documented, not promised. Verified ROOTÉ results coming soon.', 'התקדמות צריך לתעד, לא להבטיח. תוצאות ROOTÉ מאומתות בקרוב.'),
  },
  '/products': {
    title: L('Products', 'מוצרים'),
    description: L('Targeted treatments and support products. Your program tells you which to use.', 'טיפולים ממוקדים ומוצרי תמיכה. התוכנית שלך מגדירה במה להשתמש.'),
  },
  '/analysis': {
    title: L('Free hair analysis', 'אבחון שיער חינם'),
    description: L('A few minutes, guided photos, a personalized result.', 'כמה דקות, תמונות מודרכות, תוצאה אישית.'),
  },
  '/solutions/thinning': {
    title: L('Hair thinning', 'שיער דליל'),
    description: L('Understand your hair density before choosing a treatment.', 'להבין את צפיפות השיער לפני שבוחרים טיפול.'),
  },
  '/solutions/gray-hair': {
    title: L('Gray hair', 'שיער אפור'),
    description: L('Understand what is changing at the root, and the Gray system.', 'להבין מה משתנה בשורש, ואת מערכת Gray.'),
  },
  '/program': {
    title: L('Your ROOTÉ program', 'תוכנית ROOTÉ שלך'),
    description: L('Choose a program duration and start.', 'לבחור משך תוכנית ולהתחיל.'),
  },
  '/account': {
    title: L('My ROOTÉ', 'ROOTÉ שלי'),
    description: L('Your program, routine, progress photos, and scans.', 'התוכנית, השגרה, תמונות ההתקדמות והסריקות שלך.'),
  },
};

/** Per-product entries (was: every SKU fell back to the generic `/products` meta —
 *  SEO-AUDIT.md H4). Derived from the SKUs' own approved name/subtitle/shortDescription;
 *  never exposes formula strengths or invents copy. */
for (const product of PRODUCTS) {
  const shortName = product.name.replace(/^ROOTÉ\s+/, '');
  ROUTE_META[`/products/${product.slug}`] = {
    title: L(`${shortName}: ${product.subtitle.en}`, `${shortName}: ${product.subtitle.he}`),
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
