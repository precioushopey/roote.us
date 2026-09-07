import { L, type LocalizedText } from './localized';

/**
 * Legal / policy page registry (brief §25). WP9 fills each page's body from a
 * content layer legal counsel can replace without touching UI code. For now
 * this is the routing + metadata skeleton so the IA, nav, and footer are
 * complete.
 *
 * Every draft carries `reviewRequired: true` and renders a dev-only
 * "LEGAL REVIEW REQUIRED" marker. Hebrew bodies are additionally flagged
 * "pending formal legal review".
 */

export type LegalPage = {
  slug: string;
  title: LocalizedText;
  /** One-line summary for nav / SEO description. */
  blurb: LocalizedText;
  reviewRequired: boolean;
  /** Ordered section ids — bodies added in WP9 (`legal.<slug>.<sectionId>.*`). */
  sectionIds: string[];
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'privacy',
    title: L('Privacy Policy', 'מדיניות פרטיות'),
    blurb: L('What we collect, why, and how you control it.', 'מה אנחנו אוספים, למה, ואיך שולטים בכך.'),
    reviewRequired: true,
    sectionIds: ['what-we-collect', 'hair-photos', 'how-we-use', 'sharing', 'retention', 'your-rights', 'contact'],
  },
  {
    slug: 'terms',
    title: L('Terms of Service', 'תנאי שימוש'),
    blurb: L('The rules for using this website.', 'הכללים לשימוש באתר זה.'),
    reviewRequired: true,
    sectionIds: ['acceptance', 'the-service', 'accounts', 'assessment-not-medical', 'acceptable-use', 'liability', 'changes', 'contact'],
  },
  {
    slug: 'shipping',
    title: L('Shipping', 'משלוחים'),
    blurb: L('Where we ship, how long it takes, what it costs.', 'לאן שולחים, כמה זמן זה לוקח, וכמה זה עולה.'),
    reviewRequired: true,
    sectionIds: ['destinations', 'processing-time', 'carriers-and-times', 'costs', 'customs', 'issues'],
  },
  {
    slug: 'returns',
    title: L('Returns & Refunds', 'החזרות והחזרים'),
    blurb: L('When a return is possible and how a refund works.', 'מתי אפשר להחזיר ואיך פועל החזר כספי.'),
    reviewRequired: true,
    sectionIds: ['window', 'condition', 'how-to-start', 'return-postage', 'refund-timing', 'exceptions'],
  },
  {
    slug: 'cancellation',
    title: L('Cancellation Policy', 'מדיניות ביטול'),
    blurb: L('How to cancel an order or a recurring program.', 'איך לבטל הזמנה או תוכנית מתחדשת.'),
    reviewRequired: true,
    sectionIds: ['before-dispatch', 'recurring-orders', 'how-to-cancel', 'effect-of-cancelling', 'consumer-rights'],
  },
  {
    slug: 'subscription-terms',
    title: L('Subscription Terms', 'תנאי מנוי'),
    blurb: L('Billing cycle, renewal, reminders, and how to stop.', 'מחזור חיוב, חידוש, תזכורות, ואיך להפסיק.'),
    reviewRequired: true,
    sectionIds: ['what-recurs', 'billing-cycle', 'renewal-and-reminders', 'price-changes', 'pausing-and-stopping'],
  },
  {
    slug: 'medical-disclaimer',
    title: L('Medical Disclaimer', 'הבהרה רפואית'),
    blurb: L('The hair analysis is guidance, not a diagnosis.', 'אבחון השיער הוא הכוונה, לא אבחנה רפואית.'),
    reviewRequired: true,
    sectionIds: ['not-a-diagnosis', 'not-a-substitute', 'eligibility-review', 'ingredients-and-claims', 'emergencies'],
  },
  {
    slug: 'accessibility',
    title: L('Accessibility', 'נגישות'),
    blurb: L('Our accessibility commitment and how to report a barrier.', 'המחויבות שלנו לנגישות ואיך לדווח על חסם.'),
    reviewRequired: true,
    sectionIds: ['commitment', 'standard', 'known-limitations', 'contact'],
  },
  {
    slug: 'cookies',
    title: L('Cookie Policy', 'מדיניות עוגיות'),
    blurb: L('The cookies and local storage this site uses.', 'העוגיות והאחסון המקומי שהאתר משתמש בהם.'),
    reviewRequired: true,
    sectionIds: ['what-we-use', 'essential', 'analytics', 'managing'],
  },
];

const BY_SLUG: Record<string, LegalPage> = Object.fromEntries(LEGAL_PAGES.map((p) => [p.slug, p]));

export function getLegalPage(slug: string): LegalPage | undefined {
  return BY_SLUG[slug];
}

/** Dev-only marker string. Rendered by legal pages while `reviewRequired` and
 *  `import.meta.env.DEV`; never shown in a production build. */
export const LEGAL_REVIEW_MARKER = 'LEGAL REVIEW REQUIRED — draft, not approved';

/* ---------------------------------------------------------------------------
   Draft section bodies (WP9). Operational patterns only — nothing is copied
   from a competitor or supplier. Bracketed `[TODO: confirm …]` notes mark every
   specific that legal / the product owner must set. Kept in this content layer
   so counsel can replace copy without touching UI code.
   --------------------------------------------------------------------------- */
export type LegalSection = { id: string; heading: LocalizedText; body: LocalizedText };

const S = (id: string, hEn: string, hHe: string, bEn: string, bHe: string): LegalSection => ({
  id,
  heading: L(hEn, hHe),
  body: L(bEn, bHe),
});

export const LEGAL_BODIES: Record<string, LegalSection[]> = {
  privacy: [
    S('what-we-collect', 'What we collect', 'מה אנחנו אוספים',
      'Your assessment answers, the four guided photos you upload, an email address if you ask us to send your results, and account details if you create an account. On this preview build all of it stays in your browser.',
      'תשובות האבחון שלך, ארבע התמונות המודרכות שאתה מעלה, כתובת דוא"ל אם תבקש שנשלח את התוצאות, ופרטי חשבון אם תיצור חשבון. בגרסת התצוגה הזו הכול נשאר בדפדפן שלך.'),
    S('hair-photos', 'Your hair photos', 'תמונות השיער שלך',
      'Photos are used only to build your hair profile and your report. You are asked to consent before any upload. You can ask for deletion at any time. [TODO: confirm retention period and processor once a backend exists.]',
      'התמונות משמשות רק לבניית פרופיל השיער והדוח שלך. מבקשים את הסכמתך לפני כל העלאה. אפשר לבקש מחיקה בכל עת. [TODO: לאשר תקופת שמירה וספק עיבוד כשיהיה שרת.]'),
    S('how-we-use', 'How we use it', 'כיצד אנחנו משתמשים בכך',
      'To produce your analysis and program recommendation, to operate your account, and — only if you opt in — to email you about your program. We do not sell personal data.',
      'ליצירת האבחון והמלצת התוכנית, להפעלת החשבון, ורק אם תבחר להצטרף — לשליחת דוא"ל על התוכנית שלך. איננו מוכרים נתונים אישיים.'),
    S('sharing', 'Sharing', 'שיתוף',
      'In production, limited data would be shared with processors for payment, shipping, email, and hosting. [TODO: confirm the sub-processor list.]',
      'בגרסה המלאה, נתונים מוגבלים ישותפו עם ספקי עיבוד לתשלום, משלוח, דוא"ל ואחסון. [TODO: לאשר את רשימת ספקי המשנה.]'),
    S('retention', 'Retention', 'שמירה',
      '[TODO: confirm retention periods per data type.] You may request deletion by contacting support.',
      '[TODO: לאשר תקופות שמירה לפי סוג נתונים.] ניתן לבקש מחיקה בפנייה לתמיכה.'),
    S('your-rights', 'Your rights', 'הזכויות שלך',
      'You can access, correct, or delete your data, and withdraw consent. [TODO: confirm the applicable data-protection framework and any supervisory authority.]',
      'ניתן לגשת לנתונים, לתקן או למחוק אותם ולבטל הסכמה. [TODO: לאשר את מסגרת הגנת הנתונים החלה ורשות פיקוח.]'),
    S('contact', 'Contact', 'יצירת קשר',
      'Questions about privacy: support@roote.us.',
      'שאלות על פרטיות: support@roote.us.'),
  ],
  terms: [
    S('acceptance', 'Acceptance', 'קבלת התנאים',
      'By using this website you agree to these terms.',
      'השימוש באתר זה מהווה הסכמה לתנאים אלה.'),
    S('the-service', 'The service', 'השירות',
      'We provide a guided hair analysis, a personalized program recommendation, and tools to track a program. This is a concept build; features may change.',
      'אנו מספקים אבחון שיער מודרך, המלצת תוכנית אישית וכלים למעקב. זו גרסת קונספט; תכונות עשויות להשתנות.'),
    S('accounts', 'Accounts', 'חשבונות',
      'You are responsible for keeping your account credentials secure and for activity under your account.',
      'באחריותך לשמור על פרטי החשבון ועל הפעילות בו.'),
    S('assessment-not-medical', 'The assessment is not a diagnosis', 'האבחון אינו אבחנה רפואית',
      'The hair analysis is a photo-based visual assessment and guidance. It is not a medical diagnosis and does not replace advice from a qualified clinician.',
      'אבחון השיער הוא הערכה חזותית מבוססת תמונות והכוונה. אינו אבחנה רפואית ואינו מחליף ייעוץ של איש מקצוע.'),
    S('acceptable-use', 'Acceptable use', 'שימוש מקובל',
      'Do not misuse the service, upload content you have no right to share, or attempt to disrupt it.',
      'אין לעשות שימוש לרעה בשירות, להעלות תוכן ללא הרשאה או לנסות לשבש אותו.'),
    S('liability', 'Liability', 'אחריות',
      'The service is provided "as is" to the extent permitted by law. [TODO: confirm limitation-of-liability wording with counsel.]',
      'השירות ניתן "כפי שהוא" ככל שהחוק מתיר. [TODO: לאשר ניסוח הגבלת אחריות עם עורך דין.]'),
    S('changes', 'Changes', 'שינויים',
      'We may update these terms; material changes will be posted here.',
      'ייתכנו עדכונים לתנאים; שינויים מהותיים יפורסמו כאן.'),
    S('contact', 'Contact', 'יצירת קשר', 'support@roote.us', 'support@roote.us'),
  ],
  shipping: [
    S('destinations', 'Where we ship', 'לאן שולחים',
      '[TODO: confirm shipping destinations.]', '[TODO: לאשר יעדי משלוח.]'),
    S('processing-time', 'Processing time', 'זמן טיפול',
      'Orders that do not require a treatment review are prepared within [TODO: confirm, e.g. 2–5 business days]. Orders with a review ship after eligibility is confirmed.',
      'הזמנות שאינן דורשות בדיקת טיפול מוכנות תוך [TODO: לאשר, למשל 2–5 ימי עסקים]. הזמנות עם בדיקה נשלחות לאחר אישור התאמה.'),
    S('carriers-and-times', 'Carriers & transit times', 'חברות שילוח וזמני מסירה',
      '[TODO: confirm carriers and estimated transit times per region.]',
      '[TODO: לאשר חברות שילוח וזמני מסירה משוערים לפי אזור.]'),
    S('costs', 'Costs', 'עלויות',
      'Shipping cost and any thresholds for free shipping are shown at checkout. [TODO: confirm.]',
      'עלות המשלוח וסף למשלוח חינם מוצגים בקופה. [TODO: לאשר.]'),
    S('customs', 'Customs & duties', 'מכס ומסים',
      'International orders may incur customs charges payable by the recipient.',
      'הזמנות בינלאומיות עשויות לכלול חיובי מכס באחריות המקבל.'),
    S('issues', 'Lost or damaged shipments', 'משלוחים שאבדו או ניזוקו',
      'Contact support@roote.us within [TODO: confirm window] and we will help resolve it.',
      'יש לפנות ל-support@roote.us תוך [TODO: לאשר חלון זמן] ונסייע בפתרון.'),
  ],
  returns: [
    S('window', 'Return window', 'חלון החזרה',
      'You may request a return within [TODO: confirm, e.g. 30 days] of delivery.',
      'ניתן לבקש החזרה תוך [TODO: לאשר, למשל 30 יום] מהמסירה.'),
    S('condition', 'Condition', 'מצב המוצר',
      'Unopened items in original packaging are eligible. Opened prescription-strength items cannot be returned for safety reasons.',
      'פריטים סגורים באריזה מקורית זכאים. פריטים בעוצמת מרשם שנפתחו אינם ניתנים להחזרה מטעמי בטיחות.'),
    S('how-to-start', 'How to start a return', 'איך מתחילים החזרה',
      'Email support@roote.us with your order number.',
      'לשלוח דוא"ל ל-support@roote.us עם מספר ההזמנה.'),
    S('return-postage', 'Return postage', 'דמי משלוח החזרה',
      '[TODO: confirm who pays return postage.]', '[TODO: לאשר מי משלם את דמי משלוח ההחזרה.]'),
    S('refund-timing', 'Refund timing', 'מועד ההחזר',
      'Approved refunds are issued to the original payment method within [TODO: confirm] of receiving the return.',
      'החזרים שאושרו מבוצעים לאמצעי התשלום המקורי תוך [TODO: לאשר] מקבלת ההחזרה.'),
    S('exceptions', 'Exceptions', 'חריגים',
      'Shipping charges and any personalized items are non-refundable unless the item is faulty or not as described.',
      'דמי משלוח ופריטים מותאמים אישית אינם ניתנים להחזר, אלא אם הפריט פגום או שונה מהתיאור.'),
  ],
  cancellation: [
    S('before-dispatch', 'Before dispatch', 'לפני שילוח',
      'Contact support@roote.us as soon as possible; if the order has not shipped we will cancel it and refund in full.',
      'לפנות ל-support@roote.us בהקדם; אם ההזמנה טרם נשלחה, נבטל ונחזיר במלואו.'),
    S('recurring-orders', 'Recurring orders', 'הזמנות מתחדשות',
      'A recurring order only starts if you opt in. The billing cycle, price, and shipment frequency are disclosed before you agree.',
      'הזמנה מתחדשת מתחילה רק אם בחרת להצטרף. מחזור החיוב, המחיר ותדירות המשלוח מוצגים לפני האישור.'),
    S('how-to-cancel', 'How to cancel', 'איך מבטלים',
      'Cancel a recurring order any time from Account → Subscription, or email support@roote.us.',
      'ניתן לבטל הזמנה מתחדשת בכל עת דרך חשבון → מנוי, או בדוא"ל ל-support@roote.us.'),
    S('effect-of-cancelling', 'Effect of cancelling', 'תוצאת הביטול',
      'Cancelling stops future charges and shipments. It does not affect a program you have already received.',
      'ביטול עוצר חיובים ומשלוחים עתידיים. אינו משפיע על תוכנית שכבר קיבלת.'),
    S('consumer-rights', 'Consumer rights', 'זכויות צרכן',
      'Your statutory cancellation and withdrawal rights are unaffected by this policy.',
      'זכויות הביטול והחרטה הסטטוטוריות שלך אינן מושפעות ממדיניות זו.'),
  ],
  'subscription-terms': [
    S('what-recurs', 'What recurs', 'מה מתחדש',
      'If you opt in, your chosen program is reordered automatically at the end of each supply period.',
      'אם בחרת להצטרף, התוכנית שבחרת מוזמנת מחדש אוטומטית בתום כל תקופת אספקה.'),
    S('billing-cycle', 'Billing cycle', 'מחזור חיוב',
      'You are charged when each reorder is prepared. The amount equals the program price shown at the time. [TODO: confirm renewal price policy.]',
      'החיוב מתבצע בעת הכנת כל הזמנה חוזרת. הסכום שווה למחיר התוכנית שהוצג. [TODO: לאשר מדיניות מחיר חידוש.]'),
    S('renewal-and-reminders', 'Renewal & reminders', 'חידוש ותזכורות',
      '[TODO: confirm reminder policy — e.g. an email a set number of days before each renewal.]',
      '[TODO: לאשר מדיניות תזכורת — למשל דוא"ל מספר ימים קבוע לפני כל חידוש.]'),
    S('price-changes', 'Price changes', 'שינויי מחיר',
      'We will notify you before any price change takes effect on your subscription.',
      'נודיע לך לפני כל שינוי מחיר שייכנס לתוקף במנוי שלך.'),
    S('pausing-and-stopping', 'Pausing & stopping', 'השהיה והפסקה',
      'Pause or cancel any time from Account → Subscription. Cancelling stops all future charges.',
      'ניתן להשהות או לבטל בכל עת דרך חשבון → מנוי. ביטול עוצר את כל החיובים העתידיים.'),
  ],
  'medical-disclaimer': [
    S('not-a-diagnosis', 'Not a diagnosis', 'לא אבחנה',
      'The hair analysis is a preliminary, photo-based visual assessment. It is not a medical diagnosis.',
      'אבחון השיער הוא הערכה חזותית ראשונית מבוססת תמונות. אינו אבחנה רפואית.'),
    S('not-a-substitute', 'Not a substitute for care', 'אינו תחליף לטיפול',
      'It does not replace consultation with a qualified healthcare professional. Seek advice for any medical concern.',
      'אינו מחליף התייעצות עם איש מקצוע רפואי מוסמך. יש לפנות לייעוץ בכל חשש רפואי.'),
    S('eligibility-review', 'Eligibility review', 'בדיקת התאמה',
      'Programs that include a prescription-strength component are only available after a treatment review. The analysis alone does not prescribe medication.',
      'תוכניות הכוללות רכיב בעוצמת מרשם זמינות רק לאחר בדיקת טיפול. האבחון עצמו אינו רושם תרופות.'),
    S('ingredients-and-claims', 'Ingredients & claims', 'רכיבים וטענות',
      'Formula and claim information is subject to regulatory review. We do not present an ingredient study or a competitor study as our own, and make no guarantee of regrowth or of slowing or reversing gray hair.',
      'מידע על הפורמולה והטענות כפוף לבדיקה רגולטורית. איננו מציגים מחקר של רכיב או של מתחרה כשלנו, ואיננו מבטיחים צמיחה מחדש או האטה/היפוך של שיער אפור.'),
    S('emergencies', 'Emergencies', 'מקרי חירום',
      'If you have a medical emergency, contact your local emergency service.',
      'במקרה חירום רפואי, יש לפנות לשירותי החירום המקומיים.'),
  ],
  accessibility: [
    S('commitment', 'Our commitment', 'המחויבות שלנו',
      'We want this website to be usable by as many people as possible, including people who use assistive technology.',
      'אנו רוצים שהאתר הזה יהיה שמיש לכמה שיותר אנשים, כולל משתמשי טכנולוגיה מסייעת.'),
    S('standard', 'Standard', 'תקן',
      'We aim to meet WCAG 2.2 level AA.',
      'אנו שואפים לעמוד בתקן WCAG 2.2 ברמה AA.'),
    S('known-limitations', 'Known limitations', 'מגבלות ידועות',
      'This is a concept build and some areas are still being improved. [TODO: list known gaps once audited.]',
      'זו גרסת קונספט וחלק מהאזורים עדיין בשיפור. [TODO: לפרט פערים ידועים לאחר ביקורת.]'),
    S('contact', 'Report a barrier', 'דיווח על חסם',
      'Tell us at support@roote.us and we will work to fix it.',
      'ספרו לנו ב-support@roote.us ונפעל לתקן.'),
  ],
  cookies: [
    S('what-we-use', 'What we use', 'במה אנחנו משתמשים',
      'This site uses your browser’s local storage to remember your language, your assessment progress, and your cart. It does not use advertising cookies.',
      'האתר משתמש באחסון המקומי של הדפדפן כדי לזכור את השפה, את התקדמות האבחון ואת העגלה. אינו משתמש בעוגיות פרסום.'),
    S('essential', 'Essential storage', 'אחסון חיוני',
      'Language preference, session progress, and cart contents are needed for the site to work.',
      'העדפת שפה, התקדמות והתוכן בעגלה נדרשים לתפקוד האתר.'),
    S('analytics', 'Analytics', 'ניתוח שימוש',
      'No analytics provider is connected in this build. If one is added, this section will describe it and how to opt out.',
      'לא מחובר ספק ניתוח בגרסה זו. אם יתווסף, סעיף זה יתאר אותו ואת אופן ההסתלקות.'),
    S('managing', 'Managing storage', 'ניהול האחסון',
      'Clear site data in your browser settings to remove everything this site has stored.',
      'ניקוי נתוני האתר בהגדרות הדפדפן ימחק את כל מה שהאתר שמר.'),
  ],
};

export function getLegalBody(slug: string): LegalSection[] {
  return LEGAL_BODIES[slug] ?? [];
}
