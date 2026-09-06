import { L, type LocalizedText } from './localized';

/**
 * FAQ content (brief §13). Answers are deliberately conservative: no timelines,
 * no efficacy, no eligibility promises. Anything the client hasn't fixed
 * (rescan window, prices) is described by *where the user finds it*, never with
 * an invented value.
 */

export type Faq = { id: string; q: LocalizedText; a: LocalizedText };

export const HOME_FAQS: Faq[] = [
  {
    id: 'how-analysis-works',
    q: L('How does the free hair analysis work?', 'איך עובד אבחון השיער החינמי?'),
    a: L(
      'You answer a short set of questions and upload four guided photos. ROOTÉ organizes what is visible into a hair profile and suggests a personalized program to consider. It takes a few minutes and there is no commitment.',
      'עונים על סדרת שאלות קצרה ומעלים ארבע תמונות מודרכות. ROOTÉ מארגן את מה שנראה לעין לפרופיל שיער ומציע תוכנית אישית לשקול. זה לוקח כמה דקות וללא התחייבות.',
    ),
  },
  {
    id: 'what-photos',
    q: L('What photos do I need?', 'אילו תמונות צריך?'),
    a: L(
      'Four photos from your phone: front, top, crown, and hairline. Each step shows an outline and an example so the framing is consistent.',
      'ארבע תמונות מהטלפון: חזית, מלמעלה, קודקוד וקו השיער. בכל שלב מוצגים קו מתאר ודוגמה כדי לשמור על מסגור אחיד.',
    ),
  },
  {
    id: 'how-long',
    q: L('How long does the assessment take?', 'כמה זמן לוקח האבחון?'),
    a: L('A few minutes, including taking the photos. You can leave and pick up where you left off.', 'כמה דקות, כולל צילום התמונות. אפשר לצאת ולהמשיך מאותה נקודה.'),
  },
  {
    id: 'how-program-selected',
    q: L('How is my program selected?', 'איך נבחרת התוכנית שלי?'),
    a: L(
      'Your recommendation is based on your assessment profile and available treatment criteria. Programs that include a prescription-strength component require an additional review before they are available to you.',
      'ההמלצה מבוססת על פרופיל האבחון שלך ועל קריטריוני הטיפול הזמינים. תוכניות הכוללות רכיב בעוצמת מרשם מחייבות בדיקה נוספת לפני שהן זמינות לך.',
    ),
  },
  {
    id: 'density-difference',
    q: L('What is the difference between Density 6, 10, and 15?', 'מה ההבדל בין Density 6, 10 ו-15?'),
    a: L(
      'They are treatment tiers, not a good/better/best scale. The right tier is decided through a treatment review based on your profile — it is never chosen automatically from a score.',
      'אלה דרגות טיפול, לא סולם של טוב/טוב יותר. הדרגה המתאימה נקבעת בבדיקת טיפול לפי הפרופיל שלך — לעולם לא נבחרת אוטומטית לפי ניקוד.',
    ),
  },
  {
    id: 'men-women-products',
    q: L('Do men and women receive different products?', 'האם גברים ונשים מקבלים מוצרים שונים?'),
    a: L(
      'Packaging is presented in a dark-teal theme for men and a cream theme for women. Treatment recommendations come from your assessment and the eligibility rules, not from that choice.',
      'האריזה מוצגת בגוון טורקיז כהה לגברים ובגוון קרם לנשים. המלצות הטיפול נובעות מהאבחון ומכללי ההתאמה, לא מהבחירה הזו.',
    ),
  },
  {
    id: 'progress',
    q: L('How does ROOTÉ Progress work?', 'איך עובד מעקב ROOTÉ?'),
    a: L(
      'After you start a program, My ROOTÉ tracks your daily routine and stores your check-in photos and scans, so you can compare from your baseline scan to your final scan.',
      'לאחר תחילת התוכנית, "ROOTÉ שלי" עוקב אחר השגרה היומית ושומר את תמונות המעקב והסריקות, כדי שתוכל/י להשוות מהסריקה הראשונה ועד הסופית.',
    ),
  },
  {
    id: 'next-scan',
    q: L('When will I take another hair scan?', 'מתי אבצע סריקת שיער נוספת?'),
    a: L(
      'Your program includes scan check-ins on a set schedule. The dates appear in your account once your program starts.',
      'התוכנית שלך כוללת נקודות סריקה בלוח זמנים קבוע. התאריכים מופיעים בחשבון עם תחילת התוכנית.',
    ),
  },
  {
    id: 'program-change',
    q: L('Can my program change over time?', 'האם התוכנית שלי יכולה להשתנות עם הזמן?'),
    a: L(
      'Yes. A re-analysis can lead to an adjusted recommendation, and any change to a prescription-strength component goes through review.',
      'כן. אבחון חוזר יכול להוביל להמלצה מעודכנת, וכל שינוי ברכיב בעוצמת מרשם עובר בדיקה.',
    ),
  },
  {
    id: 'buy-without-analysis',
    q: L('Can I buy products without taking the analysis?', 'אפשר לקנות מוצרים בלי לעשות את האבחון?'),
    a: L(
      'Support products can be bought on their own. Programs with a prescription-strength component still require the assessment and a treatment review.',
      'מוצרי תמיכה ניתן לקנות בנפרד. תוכניות עם רכיב בעוצמת מרשם עדיין מחייבות אבחון ובדיקת טיפול.',
    ),
  },
  {
    id: 'data-handling',
    q: L('How are my photos and personal data handled?', 'איך מטופלים התמונות והנתונים האישיים שלי?'),
    a: L(
      'You are asked for consent before any photo upload, and told why the photos are needed, how they are used, how long they are kept, and how to ask for deletion. See the Privacy Policy for details.',
      'מבקשים את הסכמתך לפני העלאת תמונות, ומסבירים למה הן נדרשות, כיצד נעשה בהן שימוש, כמה זמן הן נשמרות, ואיך לבקש מחיקה. פרטים במדיניות הפרטיות.',
    ),
  },
  {
    id: 'pause-cancel',
    q: L('Can I pause or cancel a recurring order?', 'אפשר להשהות או לבטל הזמנה מתחדשת?'),
    a: L(
      'Yes. Recurring orders can be paused or cancelled from your account, and the recurring terms are disclosed before you agree to them. See the Subscription Terms.',
      'כן. ניתן להשהות או לבטל הזמנות מתחדשות דרך החשבון, ותנאי ההתחדשות מוצגים לפני האישור. ראו תנאי מנוי.',
    ),
  },
];

/** Shared questions reused on each product page (brief §20 item 11). */
export const PRODUCT_FAQS_COMMON: Faq[] = [
  {
    id: 'how-it-fits',
    q: L('How does this fit my ROOTÉ program?', 'איך זה משתלב בתוכנית ROOTÉ שלי?'),
    a: L('Your program lists exactly which products to use and when. This page explains the product on its own.', 'התוכנית שלך מפרטת בדיוק באילו מוצרים להשתמש ומתי. עמוד זה מסביר את המוצר עצמו.'),
  },
  {
    id: 'evidence',
    q: L('What evidence is there?', 'מה הראיות?'),
    a: L('We publish trial data for this formulation as it becomes available, and never present an ingredient study or a competitor study as our own.', 'אנו מפרסמים נתוני מחקר על הפורמולה הזו ככל שהם זמינים, ולעולם לא מציגים מחקר של רכיב או של מתחרה כשלנו.'),
  },
];

export function homeFaq(id: string): Faq | undefined {
  return HOME_FAQS.find((f) => f.id === id);
}
