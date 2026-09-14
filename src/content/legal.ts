import { L6, type LocalizedText } from './localized';

/**
 * Legal / policy page registry (brief §25). WP9 fills each page's body from a
 * content layer legal counsel can replace without touching UI code. For now
 * this is the routing + metadata skeleton so the IA, nav, and footer are
 * complete. Bracketed `[TODO: confirm …]` notes mark every specific that
 * legal / the product owner must set. Native legal review of all six locales
 * is still pending.
 */

export type LegalPage = {
  slug: string;
  title: LocalizedText;
  /** One-line summary for nav / SEO description. */
  blurb: LocalizedText;
  /** Ordered section ids — bodies added in WP9 (`legal.<slug>.<sectionId>.*`). */
  sectionIds: string[];
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'privacy',
    title: L6({
      en: 'Privacy Policy',
      he: 'מדיניות פרטיות',
      ar: 'سياسة الخصوصية',
      ru: 'Политика конфиденциальности',
      fr: 'Politique de confidentialité',
      es: 'Política de privacidad',
    }),
    blurb: L6({
      en: 'What we collect, why, and how you control it.',
      he: 'מה אנחנו אוספים, למה, ואיך שולטים בכך.',
      ar: 'ما الذي نجمعه ولماذا وكيف تتحكم فيه.',
      ru: 'Что мы собираем, зачем и как вы этим управляете.',
      fr: 'Ce que nous recueillons, pourquoi, et comment vous le contrôlez.',
      es: 'Qué recopilamos, por qué y cómo lo controla usted.',
    }),
    sectionIds: ['what-we-collect', 'hair-photos', 'how-we-use', 'sharing', 'retention', 'your-rights', 'contact'],
  },
  {
    slug: 'terms',
    title: L6({
      en: 'Terms of Service',
      he: 'תנאי שימוש',
      ar: 'شروط الخدمة',
      ru: 'Условия использования',
      fr: 'Conditions d’utilisation',
      es: 'Condiciones del servicio',
    }),
    blurb: L6({
      en: 'The rules for using this website.',
      he: 'הכללים לשימוש באתר זה.',
      ar: 'قواعد استخدام هذا الموقع.',
      ru: 'Правила использования этого веб-сайта.',
      fr: 'Les règles d’utilisation de ce site web.',
      es: 'Las reglas para usar este sitio web.',
    }),
    sectionIds: ['acceptance', 'the-service', 'accounts', 'assessment-not-medical', 'acceptable-use', 'liability', 'changes', 'contact'],
  },
  {
    slug: 'shipping',
    title: L6({
      en: 'Shipping & Returns',
      he: 'משלוחים והחזרות',
      ar: 'الشحن والإرجاع',
      ru: 'Доставка и возврат',
      fr: 'Expédition et retours',
      es: 'Envíos y devoluciones',
    }),
    blurb: L6({
      en: 'Where we ship, how long it takes, and how returns, refunds, and cancellations work.',
      he: 'לאן שולחים, כמה זמן זה לוקח, ואיך פועלים החזרות, החזרים כספיים וביטולים.',
      ar: 'إلى أين نشحن، وكم تستغرق المدة، وكيف تعمل عمليات الإرجاع واسترداد المبالغ والإلغاء.',
      ru: 'Куда мы доставляем, сколько это занимает и как работают возвраты, возмещения и отмены.',
      fr: 'Où nous expédions, en combien de temps, et comment fonctionnent les retours, remboursements et annulations.',
      es: 'A dónde enviamos, cuánto tarda, y cómo funcionan las devoluciones, los reembolsos y las cancelaciones.',
    }),
    sectionIds: [
      'destinations', 'processing-time', 'carriers-and-times', 'costs', 'customs', 'issues',
      'window', 'condition', 'how-to-start', 'return-postage', 'refund-timing', 'exceptions',
      'before-dispatch', 'recurring-orders', 'how-to-cancel', 'effect-of-cancelling', 'consumer-rights',
    ],
  },
  {
    slug: 'subscription-terms',
    title: L6({
      en: 'Subscription Terms',
      he: 'תנאי מנוי',
      ar: 'شروط الاشتراك',
      ru: 'Условия подписки',
      fr: 'Conditions d’abonnement',
      es: 'Condiciones de la suscripción',
    }),
    blurb: L6({
      en: 'Billing cycle, renewal, reminders, and how to stop.',
      he: 'מחזור חיוב, חידוש, תזכורות, ואיך להפסיק.',
      ar: 'دورة الفوترة والتجديد والتذكيرات وكيفية الإيقاف.',
      ru: 'Цикл выставления счетов, продление, напоминания и как остановить.',
      fr: 'Cycle de facturation, renouvellement, rappels et comment arrêter.',
      es: 'Ciclo de facturación, renovación, recordatorios y cómo detenerlo.',
    }),
    sectionIds: ['what-recurs', 'billing-cycle', 'renewal-and-reminders', 'price-changes', 'pausing-and-stopping'],
  },
  {
    slug: 'medical-disclaimer',
    title: L6({
      en: 'Medical Disclaimer',
      he: 'הבהרה רפואית',
      ar: 'إخلاء مسؤولية طبية',
      ru: 'Медицинская оговорка',
      fr: 'Avertissement médical',
      es: 'Aviso médico',
    }),
    blurb: L6({
      en: 'The hair analysis is guidance, not a diagnosis.',
      he: 'אבחון השיער הוא הכוונה, לא אבחנה רפואית.',
      ar: 'تحليل الشعر هو إرشاد وليس تشخيصًا.',
      ru: 'Анализ волос — это рекомендация, а не диагноз.',
      fr: 'L’analyse capillaire est une orientation, pas un diagnostic.',
      es: 'El análisis capilar es una orientación, no un diagnóstico.',
    }),
    sectionIds: ['not-a-diagnosis', 'not-a-substitute', 'eligibility-review', 'ingredients-and-claims', 'emergencies'],
  },
];

const BY_SLUG: Record<string, LegalPage> = Object.fromEntries(LEGAL_PAGES.map((p) => [p.slug, p]));

export function getLegalPage(slug: string): LegalPage | undefined {
  return BY_SLUG[slug];
}

/**
 * Accessibility and Cookie Policy no longer get their own top-level route —
 * folded into Terms of Service and Privacy Policy respectively (5-page legal
 * IA, 2026-09-14). Their section bodies stay in `LEGAL_BODIES` below and are
 * rendered inline by `Terms.tsx` / `Privacy.tsx`; only the page-level
 * title/blurb (used as that sub-group's heading) still need a home here.
 */
export const ACCESSIBILITY_META: { title: LocalizedText; blurb: LocalizedText } = {
  title: L6({
    en: 'Accessibility',
    he: 'נגישות',
    ar: 'إمكانية الوصول',
    ru: 'Доступность',
    fr: 'Accessibilité',
    es: 'Accesibilidad',
  }),
  blurb: L6({
    en: 'Our accessibility commitment and how to report a barrier.',
    he: 'המחויבות שלנו לנגישות ואיך לדווח על חסם.',
    ar: 'التزامنا بإمكانية الوصول وكيفية الإبلاغ عن عائق.',
    ru: 'Наше обязательство по обеспечению доступности и как сообщить о барьере.',
    fr: 'Notre engagement en matière d’accessibilité et comment signaler un obstacle.',
    es: 'Nuestro compromiso con la accesibilidad y cómo informar de una barrera.',
  }),
};

export const COOKIES_META: { title: LocalizedText; blurb: LocalizedText } = {
  title: L6({
    en: 'Cookie Policy',
    he: 'מדיניות עוגיות',
    ar: 'سياسة ملفات تعريف الارتباط',
    ru: 'Политика в отношении файлов cookie',
    fr: 'Politique relative aux cookies',
    es: 'Política de cookies',
  }),
  blurb: L6({
    en: 'The cookies and local storage this site uses.',
    he: 'העוגיות והאחסון המקומי שהאתר משתמש בהם.',
    ar: 'ملفات تعريف الارتباط والتخزين المحلي التي يستخدمها هذا الموقع.',
    ru: 'Файлы cookie и локальное хранилище, которые использует этот сайт.',
    fr: 'Les cookies et le stockage local utilisés par ce site.',
    es: 'Las cookies y el almacenamiento local que usa este sitio.',
  }),
};

/* ---------------------------------------------------------------------------
   Draft section bodies (WP9). Operational patterns only — nothing is copied
   from a competitor or supplier. Bracketed `[TODO: confirm …]` notes mark every
   specific that legal / the product owner must set. Kept in this content layer
   so counsel can replace copy without touching UI code.
   --------------------------------------------------------------------------- */
export type LegalSection = { id: string; heading: LocalizedText; body: LocalizedText };

const S = (id: string, heading: LocalizedText, body: LocalizedText): LegalSection => ({ id, heading, body });

export const LEGAL_BODIES: Record<string, LegalSection[]> = {
  privacy: [
    S(
      'what-we-collect',
      L6({
        en: 'What we collect',
        he: 'מה אנחנו אוספים',
        ar: 'ما الذي نجمعه',
        ru: 'Что мы собираем',
        fr: 'Ce que nous recueillons',
        es: 'Qué recopilamos',
      }),
      L6({
        en: 'Your assessment answers, the four guided photos you upload, an email address if you ask us to send your results, and account details if you create an account. On this preview build all of it stays in your browser.',
        he: 'תשובות האבחון שלך, ארבע התמונות המודרכות שאתה מעלה, כתובת דוא"ל אם תבקש שנשלח את התוצאות, ופרטי חשבון אם תיצור חשבון. בגרסת התצוגה הזו הכול נשאר בדפדפן שלך.',
        ar: 'إجابات تقييمك، والصور الموجَّهة الأربع التي ترفعها، وعنوان بريد إلكتروني إذا طلبت منّا إرسال نتائجك، وتفاصيل الحساب إذا أنشأت حسابًا. في نسخة المعاينة هذه يبقى كل ذلك في متصفحك.',
        ru: 'Ваши ответы на вопросы оценки, четыре сделанные по инструкции фотографии, которые вы загружаете, адрес электронной почты, если вы попросите отправить вам результаты, и данные учётной записи, если вы её создаёте. В этой предварительной сборке всё это остаётся в вашем браузере.',
        fr: 'Vos réponses à l’évaluation, les quatre photos guidées que vous téléversez, une adresse e-mail si vous nous demandez de vous envoyer vos résultats, et les informations de compte si vous créez un compte. Dans cette version préliminaire, tout cela reste dans votre navigateur.',
        es: 'Sus respuestas de la evaluación, las cuatro fotos guiadas que sube, una dirección de correo electrónico si nos pide que le enviemos sus resultados y los datos de la cuenta si crea una cuenta. En esta versión preliminar todo ello permanece en su navegador.',
      }),
    ),
    S(
      'hair-photos',
      L6({
        en: 'Your hair photos',
        he: 'תמונות השיער שלך',
        ar: 'صور شعرك',
        ru: 'Фотографии ваших волос',
        fr: 'Vos photos de cheveux',
        es: 'Sus fotos del cabello',
      }),
      L6({
        en: 'Photos are used only to build your hair profile and your report. You are asked to consent before any upload. You can ask for deletion at any time. [TODO: confirm retention period and processor once a backend exists.]',
        he: 'התמונות משמשות רק לבניית פרופיל השיער והדוח שלך. מבקשים את הסכמתך לפני כל העלאה. אפשר לבקש מחיקה בכל עת. [TODO: לאשר תקופת שמירה וספק עיבוד כשיהיה שרת.]',
        ar: 'تُستخدم الصور فقط لبناء ملف شعرك وتقريرك. يُطلب منك الموافقة قبل أي رفع. يمكنك طلب الحذف في أي وقت. [TODO: تأكيد مدة الاحتفاظ وجهة المعالجة عند توفّر خادم خلفي.]',
        ru: 'Фотографии используются только для формирования профиля ваших волос и вашего отчёта. Перед любой загрузкой у вас запрашивают согласие. Вы можете запросить удаление в любое время. [TODO: подтвердить срок хранения и обработчика, когда появится серверная часть.]',
        fr: 'Les photos servent uniquement à établir votre profil capillaire et votre rapport. Votre consentement vous est demandé avant tout téléversement. Vous pouvez demander la suppression à tout moment. [TODO: confirmer la durée de conservation et le sous-traitant une fois qu’un serveur existe.]',
        es: 'Las fotos se utilizan únicamente para elaborar su perfil capilar y su informe. Se le pide su consentimiento antes de cualquier carga. Puede solicitar la eliminación en cualquier momento. [TODO: confirmar el periodo de conservación y el encargado del tratamiento cuando exista un servidor.]',
      }),
    ),
    S(
      'how-we-use',
      L6({
        en: 'How we use it',
        he: 'כיצד אנחנו משתמשים בכך',
        ar: 'كيف نستخدمها',
        ru: 'Как мы это используем',
        fr: 'Comment nous l’utilisons',
        es: 'Cómo lo usamos',
      }),
      L6({
        en: 'To produce your analysis and program recommendation, to operate your account, and, only if you opt in, to email you about your program. We do not sell personal data.',
        he: 'ליצירת האבחון והמלצת התוכנית, להפעלת החשבון, ורק אם תבחר להצטרף, לשליחת דוא"ל על התוכנית שלך. איננו מוכרים נתונים אישיים.',
        ar: 'لإنتاج تحليلك وتوصية برنامجك، ولتشغيل حسابك، وفقط إذا اخترت الاشتراك، لمراسلتك عبر البريد الإلكتروني بشأن برنامجك. نحن لا نبيع البيانات الشخصية.',
        ru: 'Чтобы подготовить ваш анализ и рекомендацию по программе, чтобы вести вашу учётную запись и, только если вы дадите согласие, чтобы писать вам по электронной почте о вашей программе. Мы не продаём персональные данные.',
        fr: 'Pour produire votre analyse et la recommandation de programme, pour gérer votre compte et, uniquement si vous y consentez, pour vous écrire par e-mail au sujet de votre programme. Nous ne vendons pas de données personnelles.',
        es: 'Para elaborar su análisis y la recomendación de programa, para gestionar su cuenta y, solo si usted lo autoriza, para escribirle por correo electrónico sobre su programa. No vendemos datos personales.',
      }),
    ),
    S(
      'sharing',
      L6({
        en: 'Sharing',
        he: 'שיתוף',
        ar: 'المشاركة',
        ru: 'Передача данных',
        fr: 'Partage',
        es: 'Divulgación',
      }),
      L6({
        en: 'In production, limited data would be shared with processors for payment, shipping, email, and hosting. [TODO: confirm the sub-processor list.]',
        he: 'בגרסה המלאה, נתונים מוגבלים ישותפו עם ספקי עיבוד לתשלום, משלוח, דוא"ל ואחסון. [TODO: לאשר את רשימת ספקי המשנה.]',
        ar: 'في النسخة الإنتاجية، ستتم مشاركة بيانات محدودة مع جهات المعالجة الخاصة بالدفع والشحن والبريد الإلكتروني والاستضافة. [TODO: تأكيد قائمة جهات المعالجة الفرعية.]',
        ru: 'В рабочей версии ограниченный объём данных передавался бы обработчикам для оплаты, доставки, электронной почты и хостинга. [TODO: подтвердить список субобработчиков.]',
        fr: 'En production, des données limitées seraient partagées avec des sous-traitants pour le paiement, l’expédition, l’e-mail et l’hébergement. [TODO: confirmer la liste des sous-traitants ultérieurs.]',
        es: 'En producción, se compartirían datos limitados con encargados del tratamiento para el pago, el envío, el correo electrónico y el alojamiento. [TODO: confirmar la lista de subencargados.]',
      }),
    ),
    S(
      'retention',
      L6({
        en: 'Retention',
        he: 'שמירה',
        ar: 'الاحتفاظ بالبيانات',
        ru: 'Хранение данных',
        fr: 'Conservation',
        es: 'Conservación',
      }),
      L6({
        en: '[TODO: confirm retention periods per data type.] You may request deletion by contacting support.',
        he: '[TODO: לאשר תקופות שמירה לפי סוג נתונים.] ניתן לבקש מחיקה בפנייה לתמיכה.',
        ar: '[TODO: تأكيد مدد الاحتفاظ حسب نوع البيانات.] يمكنك طلب الحذف عبر التواصل مع الدعم.',
        ru: '[TODO: подтвердить сроки хранения по типам данных.] Вы можете запросить удаление, обратившись в службу поддержки.',
        fr: '[TODO: confirmer les durées de conservation par type de données.] Vous pouvez demander la suppression en contactant l’assistance.',
        es: '[TODO: confirmar los periodos de conservación por tipo de dato.] Puede solicitar la eliminación poniéndose en contacto con el servicio de asistencia.',
      }),
    ),
    S(
      'your-rights',
      L6({
        en: 'Your rights',
        he: 'הזכויות שלך',
        ar: 'حقوقك',
        ru: 'Ваши права',
        fr: 'Vos droits',
        es: 'Sus derechos',
      }),
      L6({
        en: 'You can access, correct, or delete your data, and withdraw consent. [TODO: confirm the applicable data-protection framework and any supervisory authority.]',
        he: 'ניתן לגשת לנתונים, לתקן או למחוק אותם ולבטל הסכמה. [TODO: לאשר את מסגרת הגנת הנתונים החלה ורשות פיקוח.]',
        ar: 'يمكنك الوصول إلى بياناتك أو تصحيحها أو حذفها، وسحب موافقتك. [TODO: تأكيد إطار حماية البيانات المعمول به وأي سلطة إشرافية.]',
        ru: 'Вы можете получить доступ к своим данным, исправить или удалить их и отозвать согласие. [TODO: подтвердить применимую систему защиты данных и любой надзорный орган.]',
        fr: 'Vous pouvez accéder à vos données, les rectifier ou les supprimer, et retirer votre consentement. [TODO: confirmer le cadre de protection des données applicable et toute autorité de contrôle.]',
        es: 'Puede acceder a sus datos, corregirlos o eliminarlos, y retirar su consentimiento. [TODO: confirmar el marco de protección de datos aplicable y cualquier autoridad de control.]',
      }),
    ),
    S(
      'contact',
      L6({
        en: 'Contact',
        he: 'יצירת קשר',
        ar: 'التواصل',
        ru: 'Контакты',
        fr: 'Contact',
        es: 'Contacto',
      }),
      L6({
        en: 'Questions about privacy: support@roote.us.',
        he: 'שאלות על פרטיות: support@roote.us.',
        ar: 'أسئلة حول الخصوصية: support@roote.us.',
        ru: 'Вопросы о конфиденциальности: support@roote.us.',
        fr: 'Questions relatives à la confidentialité : support@roote.us.',
        es: 'Preguntas sobre privacidad: support@roote.us.',
      }),
    ),
  ],
  terms: [
    S(
      'acceptance',
      L6({
        en: 'Acceptance',
        he: 'קבלת התנאים',
        ar: 'قبول الشروط',
        ru: 'Принятие условий',
        fr: 'Acceptation',
        es: 'Aceptación',
      }),
      L6({
        en: 'By using this website you agree to these terms.',
        he: 'השימוש באתר זה מהווה הסכמה לתנאים אלה.',
        ar: 'باستخدامك هذا الموقع فإنك توافق على هذه الشروط.',
        ru: 'Используя этот веб-сайт, вы соглашаетесь с настоящими условиями.',
        fr: 'En utilisant ce site web, vous acceptez les présentes conditions.',
        es: 'Al usar este sitio web, usted acepta estas condiciones.',
      }),
    ),
    S(
      'the-service',
      L6({
        en: 'The service',
        he: 'השירות',
        ar: 'الخدمة',
        ru: 'Услуга',
        fr: 'Le service',
        es: 'El servicio',
      }),
      L6({
        en: 'We provide a guided hair analysis, a personalized program recommendation, and tools to track a program. This is a concept build; features may change.',
        he: 'אנו מספקים אבחון שיער מודרך, המלצת תוכנית אישית וכלים למעקב. זו גרסת קונספט; תכונות עשויות להשתנות.',
        ar: 'نوفّر تحليل شعر موجَّهًا، وتوصية برنامج مخصّصة، وأدوات لتتبّع البرنامج. هذه نسخة مفاهيمية؛ وقد تتغيّر الميزات.',
        ru: 'Мы предоставляем сопровождаемый анализ волос, персональную рекомендацию по программе и инструменты для отслеживания программы. Это концептуальная сборка; функции могут меняться.',
        fr: 'Nous fournissons une analyse capillaire guidée, une recommandation de programme personnalisée et des outils pour suivre un programme. Il s’agit d’une version conceptuelle ; les fonctionnalités peuvent évoluer.',
        es: 'Ofrecemos un análisis capilar guiado, una recomendación de programa personalizada y herramientas para hacer seguimiento de un programa. Esta es una versión conceptual; las funciones pueden cambiar.',
      }),
    ),
    S(
      'accounts',
      L6({
        en: 'Accounts',
        he: 'חשבונות',
        ar: 'الحسابات',
        ru: 'Учётные записи',
        fr: 'Comptes',
        es: 'Cuentas',
      }),
      L6({
        en: 'You are responsible for keeping your account credentials secure and for activity under your account.',
        he: 'באחריותך לשמור על פרטי החשבון ועל הפעילות בו.',
        ar: 'أنت مسؤول عن الحفاظ على سرّية بيانات اعتماد حسابك وعن النشاط الذي يجري ضمن حسابك.',
        ru: 'Вы несёте ответственность за сохранность учётных данных вашей учётной записи и за действия, совершаемые под ней.',
        fr: 'Il vous appartient de préserver la sécurité de vos identifiants de compte et de l’activité réalisée sous votre compte.',
        es: 'Usted es responsable de mantener seguras las credenciales de su cuenta y de la actividad realizada con ella.',
      }),
    ),
    S(
      'assessment-not-medical',
      L6({
        en: 'The assessment is not a diagnosis',
        he: 'האבחון אינו אבחנה רפואית',
        ar: 'التقييم ليس تشخيصًا',
        ru: 'Оценка не является диагнозом',
        fr: 'L’évaluation n’est pas un diagnostic',
        es: 'La evaluación no es un diagnóstico',
      }),
      L6({
        en: 'The hair analysis is a photo-based visual assessment and guidance. It is not a medical diagnosis and does not replace advice from a qualified clinician.',
        he: 'אבחון השיער הוא הערכה חזותית מבוססת תמונות והכוונה. אינו אבחנה רפואית ואינו מחליף ייעוץ של איש מקצוע.',
        ar: 'تحليل الشعر هو تقييم بصري قائم على الصور وإرشاد. وهو ليس تشخيصًا طبيًا ولا يحل محل استشارة اختصاصي مؤهَّل.',
        ru: 'Анализ волос — это визуальная оценка на основе фотографий и рекомендация. Он не является медицинским диагнозом и не заменяет консультацию квалифицированного специалиста.',
        fr: 'L’analyse capillaire est une évaluation visuelle fondée sur des photos, à titre d’orientation. Elle ne constitue pas un diagnostic médical et ne remplace pas l’avis d’un clinicien qualifié.',
        es: 'El análisis capilar es una evaluación visual basada en fotos y una orientación. No es un diagnóstico médico ni sustituye el consejo de un profesional clínico cualificado.',
      }),
    ),
    S(
      'acceptable-use',
      L6({
        en: 'Acceptable use',
        he: 'שימוש מקובל',
        ar: 'الاستخدام المقبول',
        ru: 'Допустимое использование',
        fr: 'Utilisation acceptable',
        es: 'Uso aceptable',
      }),
      L6({
        en: 'Do not misuse the service, upload content you have no right to share, or attempt to disrupt it.',
        he: 'אין לעשות שימוש לרעה בשירות, להעלות תוכן ללא הרשאה או לנסות לשבש אותו.',
        ar: 'لا تُسِئ استخدام الخدمة، ولا ترفع محتوى ليس لديك الحق في مشاركته، ولا تحاول تعطيلها.',
        ru: 'Не используйте сервис ненадлежащим образом, не загружайте контент, которым вы не вправе делиться, и не пытайтесь нарушить его работу.',
        fr: 'N’utilisez pas le service de manière abusive, ne téléversez pas de contenu que vous n’avez pas le droit de partager et ne tentez pas de le perturber.',
        es: 'No haga un uso indebido del servicio, no suba contenido que no tenga derecho a compartir ni intente perturbarlo.',
      }),
    ),
    S(
      'liability',
      L6({
        en: 'Liability',
        he: 'אחריות',
        ar: 'المسؤولية',
        ru: 'Ответственность',
        fr: 'Responsabilité',
        es: 'Responsabilidad',
      }),
      L6({
        en: 'The service is provided "as is" to the extent permitted by law. [TODO: confirm limitation-of-liability wording with counsel.]',
        he: 'השירות ניתן "כפי שהוא" ככל שהחוק מתיר. [TODO: לאשר ניסוח הגבלת אחריות עם עורך דין.]',
        ar: 'تُقدَّم الخدمة "كما هي" إلى الحد الذي يسمح به القانون. [TODO: تأكيد صياغة تحديد المسؤولية مع مستشار قانوني.]',
        ru: 'Услуга предоставляется «как есть» в пределах, допускаемых законом. [TODO: согласовать формулировку об ограничении ответственности с юристом.]',
        fr: 'Le service est fourni « en l’état » dans la mesure permise par la loi. [TODO: confirmer la formulation de la limitation de responsabilité avec un conseil juridique.]',
        es: 'El servicio se presta «tal cual» en la medida en que lo permita la ley. [TODO: confirmar la redacción de la limitación de responsabilidad con asesoría jurídica.]',
      }),
    ),
    S(
      'changes',
      L6({
        en: 'Changes',
        he: 'שינויים',
        ar: 'التغييرات',
        ru: 'Изменения',
        fr: 'Modifications',
        es: 'Cambios',
      }),
      L6({
        en: 'We may update these terms; material changes will be posted here.',
        he: 'ייתכנו עדכונים לתנאים; שינויים מהותיים יפורסמו כאן.',
        ar: 'قد نُحدّث هذه الشروط؛ وستُنشَر التغييرات الجوهرية هنا.',
        ru: 'Мы можем обновлять настоящие условия; о существенных изменениях будет сообщено здесь.',
        fr: 'Nous pouvons mettre à jour ces conditions ; les modifications importantes seront publiées ici.',
        es: 'Podemos actualizar estas condiciones; los cambios sustanciales se publicarán aquí.',
      }),
    ),
    S(
      'contact',
      L6({
        en: 'Contact',
        he: 'יצירת קשר',
        ar: 'التواصل',
        ru: 'Контакты',
        fr: 'Contact',
        es: 'Contacto',
      }),
      L6({
        en: 'support@roote.us',
        he: 'support@roote.us',
        ar: 'support@roote.us',
        ru: 'support@roote.us',
        fr: 'support@roote.us',
        es: 'support@roote.us',
      }),
    ),
  ],
  shipping: [
    S(
      'destinations',
      L6({
        en: 'Where we ship',
        he: 'לאן שולחים',
        ar: 'إلى أين نشحن',
        ru: 'Куда мы доставляем',
        fr: 'Où nous expédions',
        es: 'A dónde enviamos',
      }),
      L6({
        en: '[TODO: confirm shipping destinations.]',
        he: '[TODO: לאשר יעדי משלוח.]',
        ar: '[TODO: تأكيد وجهات الشحن.]',
        ru: '[TODO: подтвердить пункты назначения доставки.]',
        fr: '[TODO: confirmer les destinations d’expédition.]',
        es: '[TODO: confirmar los destinos de envío.]',
      }),
    ),
    S(
      'processing-time',
      L6({
        en: 'Processing time',
        he: 'זמן טיפול',
        ar: 'مدة التجهيز',
        ru: 'Срок обработки',
        fr: 'Délai de traitement',
        es: 'Tiempo de preparación',
      }),
      L6({
        en: 'Orders that do not require a treatment review are prepared within [TODO: confirm, e.g. 2–5 business days]. Orders with a review ship after eligibility is confirmed.',
        he: 'הזמנות שאינן דורשות בדיקת טיפול מוכנות תוך [TODO: לאשר, למשל 2–5 ימי עסקים]. הזמנות עם בדיקה נשלחות לאחר אישור התאמה.',
        ar: 'الطلبات التي لا تتطلّب مراجعة علاجية تُجهَّز خلال [TODO: تأكيد، مثلاً 2–5 أيام عمل]. أما الطلبات التي تتطلّب مراجعة فتُشحَن بعد تأكيد الاستيفاء.',
        ru: 'Заказы, не требующие проверки лечения, готовятся в течение [TODO: подтвердить, напр. 2–5 рабочих дней]. Заказы с проверкой отправляются после подтверждения соответствия.',
        fr: 'Les commandes qui ne nécessitent pas d’examen de traitement sont préparées sous [TODO: confirmer, p. ex. 2–5 jours ouvrés]. Les commandes avec examen sont expédiées après confirmation de l’éligibilité.',
        es: 'Los pedidos que no requieren una revisión de tratamiento se preparan en un plazo de [TODO: confirmar, p. ej. 2–5 días hábiles]. Los pedidos con revisión se envían después de confirmar los requisitos.',
      }),
    ),
    S(
      'carriers-and-times',
      L6({
        en: 'Carriers & transit times',
        he: 'חברות שילוח וזמני מסירה',
        ar: 'شركات الشحن وأوقات النقل',
        ru: 'Перевозчики и сроки доставки',
        fr: 'Transporteurs et délais d’acheminement',
        es: 'Transportistas y plazos de tránsito',
      }),
      L6({
        en: '[TODO: confirm carriers and estimated transit times per region.]',
        he: '[TODO: לאשר חברות שילוח וזמני מסירה משוערים לפי אזור.]',
        ar: '[TODO: تأكيد شركات الشحن وأوقات النقل التقديرية حسب المنطقة.]',
        ru: '[TODO: подтвердить перевозчиков и ориентировочные сроки доставки по регионам.]',
        fr: '[TODO: confirmer les transporteurs et les délais d’acheminement estimés par région.]',
        es: '[TODO: confirmar los transportistas y los plazos de tránsito estimados por región.]',
      }),
    ),
    S(
      'costs',
      L6({
        en: 'Costs',
        he: 'עלויות',
        ar: 'التكاليف',
        ru: 'Стоимость',
        fr: 'Coûts',
        es: 'Costes',
      }),
      L6({
        en: 'Shipping cost and any thresholds for free shipping are shown at checkout. [TODO: confirm.]',
        he: 'עלות המשלוח וסף למשלוח חינם מוצגים בקופה. [TODO: לאשר.]',
        ar: 'تُعرَض تكلفة الشحن وأي حدود للشحن المجاني عند الدفع. [TODO: تأكيد.]',
        ru: 'Стоимость доставки и любые пороги для бесплатной доставки показываются при оформлении заказа. [TODO: подтвердить.]',
        fr: 'Le coût d’expédition et les éventuels seuils de livraison gratuite sont indiqués au moment du paiement. [TODO: confirmer.]',
        es: 'El coste de envío y cualquier umbral para el envío gratuito se muestran al finalizar la compra. [TODO: confirmar.]',
      }),
    ),
    S(
      'customs',
      L6({
        en: 'Customs & duties',
        he: 'מכס ומסים',
        ar: 'الجمارك والرسوم',
        ru: 'Таможня и пошлины',
        fr: 'Douanes et droits',
        es: 'Aduanas e impuestos',
      }),
      L6({
        en: 'International orders may incur customs charges payable by the recipient.',
        he: 'הזמנות בינלאומיות עשויות לכלול חיובי מכס באחריות המקבל.',
        ar: 'قد تترتّب على الطلبات الدولية رسوم جمركية يدفعها المستلم.',
        ru: 'По международным заказам могут взиматься таможенные сборы, оплачиваемые получателем.',
        fr: 'Les commandes internationales peuvent donner lieu à des frais de douane à la charge du destinataire.',
        es: 'Los pedidos internacionales pueden estar sujetos a gastos de aduana a cargo del destinatario.',
      }),
    ),
    S(
      'issues',
      L6({
        en: 'Lost or damaged shipments',
        he: 'משלוחים שאבדו או ניזוקו',
        ar: 'الشحنات المفقودة أو التالفة',
        ru: 'Утерянные или повреждённые отправления',
        fr: 'Envois perdus ou endommagés',
        es: 'Envíos perdidos o dañados',
      }),
      L6({
        en: 'Contact support@roote.us within [TODO: confirm window] and we will help resolve it.',
        he: 'יש לפנות ל-support@roote.us תוך [TODO: לאשר חלון זמן] ונסייע בפתרון.',
        ar: 'تواصل عبر support@roote.us خلال [TODO: تأكيد المهلة الزمنية] وسنساعد في حلّ المشكلة.',
        ru: 'Свяжитесь с нами по адресу support@roote.us в течение [TODO: подтвердить срок], и мы поможем решить вопрос.',
        fr: 'Contactez support@roote.us dans un délai de [TODO: confirmer le délai] et nous vous aiderons à résoudre le problème.',
        es: 'Póngase en contacto con support@roote.us en un plazo de [TODO: confirmar el plazo] y le ayudaremos a resolverlo.',
      }),
    ),
    S(
      'window',
      L6({
        en: 'Return window',
        he: 'חלון החזרה',
        ar: 'مهلة الإرجاع',
        ru: 'Срок для возврата',
        fr: 'Délai de retour',
        es: 'Plazo de devolución',
      }),
      L6({
        en: 'You may request a return within [TODO: confirm, e.g. 30 days] of delivery.',
        he: 'ניתן לבקש החזרה תוך [TODO: לאשר, למשל 30 יום] מהמסירה.',
        ar: 'يمكنك طلب الإرجاع خلال [TODO: تأكيد، مثلاً 30 يومًا] من التسليم.',
        ru: 'Вы можете запросить возврат в течение [TODO: подтвердить, напр. 30 дней] с момента доставки.',
        fr: 'Vous pouvez demander un retour dans un délai de [TODO: confirmer, p. ex. 30 jours] après la livraison.',
        es: 'Puede solicitar una devolución en un plazo de [TODO: confirmar, p. ej. 30 días] desde la entrega.',
      }),
    ),
    S(
      'condition',
      L6({
        en: 'Condition',
        he: 'מצב המוצר',
        ar: 'حالة المنتج',
        ru: 'Состояние товара',
        fr: 'État du produit',
        es: 'Estado del producto',
      }),
      L6({
        en: 'Unopened items in original packaging are eligible. Opened prescription-strength items cannot be returned for safety reasons.',
        he: 'פריטים סגורים באריזה מקורית זכאים. פריטים בעוצמת מרשם שנפתחו אינם ניתנים להחזרה מטעמי בטיחות.',
        ar: 'العناصر غير المفتوحة بعبوتها الأصلية مؤهَّلة للإرجاع. أما العناصر بتركيز الوصفة الطبية التي فُتِحت فلا يمكن إرجاعها لأسباب تتعلق بالسلامة.',
        ru: 'Невскрытые товары в оригинальной упаковке подлежат возврату. Вскрытые товары рецептурной концентрации не подлежат возврату из соображений безопасности.',
        fr: 'Les articles non ouverts dans leur emballage d’origine sont éligibles. Les articles à concentration de prescription déjà ouverts ne peuvent pas être retournés pour des raisons de sécurité.',
        es: 'Los artículos sin abrir en su embalaje original son aptos para devolución. Los artículos con concentración de prescripción que se hayan abierto no pueden devolverse por razones de seguridad.',
      }),
    ),
    S(
      'how-to-start',
      L6({
        en: 'How to start a return',
        he: 'איך מתחילים החזרה',
        ar: 'كيفية بدء الإرجاع',
        ru: 'Как оформить возврат',
        fr: 'Comment initier un retour',
        es: 'Cómo iniciar una devolución',
      }),
      L6({
        en: 'Email support@roote.us with your order number.',
        he: 'לשלוח דוא"ל ל-support@roote.us עם מספר ההזמנה.',
        ar: 'أرسِل رسالة إلى support@roote.us مع رقم طلبك.',
        ru: 'Напишите на support@roote.us и укажите номер вашего заказа.',
        fr: 'Envoyez un e-mail à support@roote.us en indiquant votre numéro de commande.',
        es: 'Envíe un correo electrónico a support@roote.us con su número de pedido.',
      }),
    ),
    S(
      'return-postage',
      L6({
        en: 'Return postage',
        he: 'דמי משלוח החזרה',
        ar: 'أجور شحن الإرجاع',
        ru: 'Стоимость обратной пересылки',
        fr: 'Frais de retour',
        es: 'Gastos de envío de la devolución',
      }),
      L6({
        en: '[TODO: confirm who pays return postage.]',
        he: '[TODO: לאשר מי משלם את דמי משלוח ההחזרה.]',
        ar: '[TODO: تأكيد من يتحمّل أجور شحن الإرجاع.]',
        ru: '[TODO: подтвердить, кто оплачивает обратную пересылку.]',
        fr: '[TODO: confirmer qui paie les frais de retour.]',
        es: '[TODO: confirmar quién paga los gastos de envío de la devolución.]',
      }),
    ),
    S(
      'refund-timing',
      L6({
        en: 'Refund timing',
        he: 'מועד ההחזר',
        ar: 'موعد استرداد المبلغ',
        ru: 'Сроки возмещения',
        fr: 'Délai de remboursement',
        es: 'Plazo del reembolso',
      }),
      L6({
        en: 'Approved refunds are issued to the original payment method within [TODO: confirm] of receiving the return.',
        he: 'החזרים שאושרו מבוצעים לאמצעי התשלום המקורי תוך [TODO: לאשר] מקבלת ההחזרה.',
        ar: 'تُصرَف المبالغ المستردّة المعتمَدة إلى وسيلة الدفع الأصلية خلال [TODO: تأكيد] من استلام المرتجَع.',
        ru: 'Одобренные возмещения перечисляются на исходный способ оплаты в течение [TODO: подтвердить] с момента получения возврата.',
        fr: 'Les remboursements approuvés sont effectués sur le moyen de paiement d’origine sous [TODO: confirmer] à compter de la réception du retour.',
        es: 'Los reembolsos aprobados se emiten al método de pago original en un plazo de [TODO: confirmar] desde la recepción de la devolución.',
      }),
    ),
    S(
      'exceptions',
      L6({
        en: 'Exceptions',
        he: 'חריגים',
        ar: 'الاستثناءات',
        ru: 'Исключения',
        fr: 'Exceptions',
        es: 'Excepciones',
      }),
      L6({
        en: 'Shipping charges and any personalized items are non-refundable unless the item is faulty or not as described.',
        he: 'דמי משלוח ופריטים מותאמים אישית אינם ניתנים להחזר, אלא אם הפריט פגום או שונה מהתיאור.',
        ar: 'أجور الشحن وأي عناصر مخصّصة غير قابلة للاسترداد، ما لم يكن العنصر معيبًا أو مخالفًا للوصف.',
        ru: 'Стоимость доставки и любые персонализированные товары не подлежат возврату средств, за исключением случаев, когда товар неисправен или не соответствует описанию.',
        fr: 'Les frais d’expédition et les articles personnalisés ne sont pas remboursables, sauf si l’article est défectueux ou non conforme à la description.',
        es: 'Los gastos de envío y los artículos personalizados no son reembolsables, salvo que el artículo sea defectuoso o no se corresponda con la descripción.',
      }),
    ),
    S(
      'before-dispatch',
      L6({
        en: 'Before dispatch',
        he: 'לפני שילוח',
        ar: 'قبل الإرسال',
        ru: 'До отправки',
        fr: 'Avant l’expédition',
        es: 'Antes del envío',
      }),
      L6({
        en: 'Contact support@roote.us as soon as possible; if the order has not shipped we will cancel it and refund in full.',
        he: 'לפנות ל-support@roote.us בהקדם; אם ההזמנה טרם נשלחה, נבטל ונחזיר במלואו.',
        ar: 'تواصل عبر support@roote.us في أقرب وقت ممكن؛ وإذا لم يكن الطلب قد شُحن بعد فسنُلغيه ونستردّ المبلغ بالكامل.',
        ru: 'Свяжитесь с нами по адресу support@roote.us как можно скорее; если заказ ещё не отправлен, мы отменим его и вернём полную сумму.',
        fr: 'Contactez support@roote.us dès que possible ; si la commande n’a pas été expédiée, nous l’annulerons et vous rembourserons intégralement.',
        es: 'Póngase en contacto con support@roote.us lo antes posible; si el pedido no se ha enviado, lo cancelaremos y le reembolsaremos la totalidad.',
      }),
    ),
    S(
      'recurring-orders',
      L6({
        en: 'Recurring orders',
        he: 'הזמנות מתחדשות',
        ar: 'الطلبات المتكرّرة',
        ru: 'Повторяющиеся заказы',
        fr: 'Commandes récurrentes',
        es: 'Pedidos recurrentes',
      }),
      L6({
        en: 'A recurring order only starts if you opt in. The billing cycle, price, and shipment frequency are disclosed before you agree.',
        he: 'הזמנה מתחדשת מתחילה רק אם בחרת להצטרף. מחזור החיוב, המחיר ותדירות המשלוח מוצגים לפני האישור.',
        ar: 'لا يبدأ الطلب المتكرّر إلا إذا اخترت الاشتراك. ويُفصَح عن دورة الفوترة والسعر وتواتر الشحن قبل موافقتك.',
        ru: 'Повторяющийся заказ начинается только при вашем согласии. Цикл выставления счетов, цена и периодичность отправки раскрываются до того, как вы соглашаетесь.',
        fr: 'Une commande récurrente ne démarre que si vous y consentez. Le cycle de facturation, le prix et la fréquence d’expédition sont communiqués avant votre accord.',
        es: 'Un pedido recurrente solo comienza si usted lo autoriza. El ciclo de facturación, el precio y la frecuencia de envío se comunican antes de que usted acepte.',
      }),
    ),
    S(
      'how-to-cancel',
      L6({
        en: 'How to cancel',
        he: 'איך מבטלים',
        ar: 'كيفية الإلغاء',
        ru: 'Как отменить',
        fr: 'Comment annuler',
        es: 'Cómo cancelar',
      }),
      L6({
        en: 'Cancel a recurring order any time from Account → Subscription, or email support@roote.us.',
        he: 'ניתן לבטל הזמנה מתחדשת בכל עת דרך חשבון → מנוי, או בדוא"ל ל-support@roote.us.',
        ar: 'يمكنك إلغاء الطلب المتكرّر في أي وقت من الحساب → الاشتراك، أو بمراسلة support@roote.us.',
        ru: 'Отменить повторяющийся заказ можно в любое время в разделе Аккаунт → Подписка или написав на support@roote.us.',
        fr: 'Annulez une commande récurrente à tout moment depuis Compte → Abonnement, ou écrivez à support@roote.us.',
        es: 'Cancele un pedido recurrente en cualquier momento desde Cuenta → Suscripción, o escriba a support@roote.us.',
      }),
    ),
    S(
      'effect-of-cancelling',
      L6({
        en: 'Effect of cancelling',
        he: 'תוצאת הביטול',
        ar: 'أثر الإلغاء',
        ru: 'Последствия отмены',
        fr: 'Effet de l’annulation',
        es: 'Efecto de la cancelación',
      }),
      L6({
        en: 'Cancelling stops future charges and shipments. It does not affect a program you have already received.',
        he: 'ביטול עוצר חיובים ומשלוחים עתידיים. אינו משפיע על תוכנית שכבר קיבלת.',
        ar: 'يوقف الإلغاء الرسوم والشحنات المستقبلية. ولا يؤثّر في برنامج استلمته بالفعل.',
        ru: 'Отмена прекращает будущие списания и отправки. Она не затрагивает программу, которую вы уже получили.',
        fr: 'L’annulation met fin aux prélèvements et aux expéditions à venir. Elle n’a pas d’incidence sur un programme que vous avez déjà reçu.',
        es: 'La cancelación detiene los cargos y los envíos futuros. No afecta a un programa que usted ya haya recibido.',
      }),
    ),
    S(
      'consumer-rights',
      L6({
        en: 'Consumer rights',
        he: 'זכויות צרכן',
        ar: 'حقوق المستهلك',
        ru: 'Права потребителя',
        fr: 'Droits des consommateurs',
        es: 'Derechos del consumidor',
      }),
      L6({
        en: 'Your statutory cancellation and withdrawal rights are unaffected by this policy.',
        he: 'זכויות הביטול והחרטה הסטטוטוריות שלך אינן מושפעות ממדיניות זו.',
        ar: 'لا تتأثّر حقوقك القانونية في الإلغاء والانسحاب بهذه السياسة.',
        ru: 'Настоящая политика не затрагивает ваши законные права на отмену и на отказ от договора.',
        fr: 'La présente politique n’affecte pas vos droits légaux d’annulation et de rétractation.',
        es: 'La presente política no afecta a sus derechos legales de cancelación y desistimiento.',
      }),
    ),
  ],
  'subscription-terms': [
    S(
      'what-recurs',
      L6({
        en: 'What recurs',
        he: 'מה מתחדש',
        ar: 'ما الذي يتكرّر',
        ru: 'Что повторяется',
        fr: 'Ce qui est récurrent',
        es: 'Qué se repite',
      }),
      L6({
        en: 'If you opt in, your chosen program is reordered automatically at the end of each supply period.',
        he: 'אם בחרת להצטרף, התוכנית שבחרת מוזמנת מחדש אוטומטית בתום כל תקופת אספקה.',
        ar: 'إذا اخترت الاشتراك، يُعاد طلب البرنامج الذي اخترته تلقائيًا في نهاية كل فترة إمداد.',
        ru: 'Если вы дали согласие, выбранная вами программа автоматически заказывается повторно в конце каждого периода поставки.',
        fr: 'Si vous y consentez, le programme que vous avez choisi fait l’objet d’une nouvelle commande automatique à la fin de chaque période d’approvisionnement.',
        es: 'Si usted lo autoriza, el programa que ha elegido se vuelve a pedir automáticamente al final de cada periodo de suministro.',
      }),
    ),
    S(
      'billing-cycle',
      L6({
        en: 'Billing cycle',
        he: 'מחזור חיוב',
        ar: 'دورة الفوترة',
        ru: 'Цикл выставления счетов',
        fr: 'Cycle de facturation',
        es: 'Ciclo de facturación',
      }),
      L6({
        en: 'You are charged when each reorder is prepared. The amount equals the program price shown at the time. [TODO: confirm renewal price policy.]',
        he: 'החיוב מתבצע בעת הכנת כל הזמנה חוזרת. הסכום שווה למחיר התוכנית שהוצג. [TODO: לאשר מדיניות מחיר חידוש.]',
        ar: 'يتم تحصيل الرسوم عند تجهيز كل طلب معاد. ويساوي المبلغ سعر البرنامج المعروض حينها. [TODO: تأكيد سياسة سعر التجديد.]',
        ru: 'Списание происходит при подготовке каждого повторного заказа. Сумма равна цене программы, показанной на тот момент. [TODO: подтвердить политику цены при продлении.]',
        fr: 'Vous êtes débité lors de la préparation de chaque nouvelle commande. Le montant correspond au prix du programme affiché à ce moment-là. [TODO: confirmer la politique de prix au renouvellement.]',
        es: 'Se le cobra cuando se prepara cada nuevo pedido. El importe equivale al precio del programa mostrado en ese momento. [TODO: confirmar la política de precio de renovación.]',
      }),
    ),
    S(
      'renewal-and-reminders',
      L6({
        en: 'Renewal & reminders',
        he: 'חידוש ותזכורות',
        ar: 'التجديد والتذكيرات',
        ru: 'Продление и напоминания',
        fr: 'Renouvellement et rappels',
        es: 'Renovación y recordatorios',
      }),
      L6({
        en: '[TODO: confirm reminder policy, e.g. an email a set number of days before each renewal.]',
        he: '[TODO: לאשר מדיניות תזכורת, למשל דוא"ל מספר ימים קבוע לפני כל חידוש.]',
        ar: '[TODO: تأكيد سياسة التذكير، مثلاً رسالة بريد إلكتروني قبل عدد محدَّد من الأيام من كل تجديد.]',
        ru: '[TODO: подтвердить политику напоминаний, напр. письмо за установленное число дней до каждого продления.]',
        fr: '[TODO: confirmer la politique de rappel, p. ex. un e-mail un nombre de jours défini avant chaque renouvellement.]',
        es: '[TODO: confirmar la política de recordatorios, p. ej. un correo electrónico un número determinado de días antes de cada renovación.]',
      }),
    ),
    S(
      'price-changes',
      L6({
        en: 'Price changes',
        he: 'שינויי מחיר',
        ar: 'تغييرات الأسعار',
        ru: 'Изменение цен',
        fr: 'Changements de prix',
        es: 'Cambios de precio',
      }),
      L6({
        en: 'We will notify you before any price change takes effect on your subscription.',
        he: 'נודיע לך לפני כל שינוי מחיר שייכנס לתוקף במנוי שלך.',
        ar: 'سنُخطِرك قبل أن يدخل أي تغيير في السعر حيّز التنفيذ على اشتراكك.',
        ru: 'Мы уведомим вас до того, как любое изменение цены вступит в силу для вашей подписки.',
        fr: 'Nous vous informerons avant tout changement de prix prenant effet sur votre abonnement.',
        es: 'Le informaremos antes de que cualquier cambio de precio surta efecto en su suscripción.',
      }),
    ),
    S(
      'pausing-and-stopping',
      L6({
        en: 'Pausing & stopping',
        he: 'השהיה והפסקה',
        ar: 'الإيقاف المؤقّت والإيقاف',
        ru: 'Приостановка и прекращение',
        fr: 'Mise en pause et arrêt',
        es: 'Pausa y cancelación',
      }),
      L6({
        en: 'Pause or cancel any time from Account → Subscription. Cancelling stops all future charges.',
        he: 'ניתן להשהות או לבטל בכל עת דרך חשבון → מנוי. ביטול עוצר את כל החיובים העתידיים.',
        ar: 'يمكنك الإيقاف المؤقّت أو الإلغاء في أي وقت من الحساب → الاشتراك. ويوقف الإلغاء جميع الرسوم المستقبلية.',
        ru: 'Приостановите или отмените в любое время в разделе Аккаунт → Подписка. Отмена прекращает все будущие списания.',
        fr: 'Mettez en pause ou annulez à tout moment depuis Compte → Abonnement. L’annulation met fin à tous les prélèvements futurs.',
        es: 'Pause o cancele en cualquier momento desde Cuenta → Suscripción. La cancelación detiene todos los cargos futuros.',
      }),
    ),
  ],
  'medical-disclaimer': [
    S(
      'not-a-diagnosis',
      L6({
        en: 'Not a diagnosis',
        he: 'לא אבחנה',
        ar: 'ليس تشخيصًا',
        ru: 'Не диагноз',
        fr: 'Pas un diagnostic',
        es: 'No es un diagnóstico',
      }),
      L6({
        en: 'The hair analysis is a preliminary, photo-based visual assessment. It is not a medical diagnosis.',
        he: 'אבחון השיער הוא הערכה חזותית ראשונית מבוססת תמונות. אינו אבחנה רפואית.',
        ar: 'تحليل الشعر هو تقييم بصري أوّلي قائم على الصور. وهو ليس تشخيصًا طبيًا.',
        ru: 'Анализ волос — это предварительная визуальная оценка на основе фотографий. Он не является медицинским диагнозом.',
        fr: 'L’analyse capillaire est une évaluation visuelle préliminaire fondée sur des photos. Elle ne constitue pas un diagnostic médical.',
        es: 'El análisis capilar es una evaluación visual preliminar basada en fotos. No es un diagnóstico médico.',
      }),
    ),
    S(
      'not-a-substitute',
      L6({
        en: 'Not a substitute for care',
        he: 'אינו תחליף לטיפול',
        ar: 'ليس بديلاً عن الرعاية',
        ru: 'Не заменяет медицинскую помощь',
        fr: 'Ne remplace pas un suivi médical',
        es: 'No sustituye la atención médica',
      }),
      L6({
        en: 'It does not replace consultation with a qualified healthcare professional. Seek advice for any medical concern.',
        he: 'אינו מחליף התייעצות עם איש מקצוע רפואי מוסמך. יש לפנות לייעוץ בכל חשש רפואי.',
        ar: 'وهو لا يحل محل استشارة أخصائي رعاية صحية مؤهَّل. اطلب المشورة عند أي قلق طبي.',
        ru: 'Он не заменяет консультацию квалифицированного медицинского специалиста. Обращайтесь за советом при любой медицинской проблеме.',
        fr: 'Elle ne remplace pas une consultation avec un professionnel de santé qualifié. Demandez un avis pour toute préoccupation médicale.',
        es: 'No sustituye la consulta con un profesional sanitario cualificado. Solicite asesoramiento ante cualquier preocupación médica.',
      }),
    ),
    S(
      'eligibility-review',
      L6({
        en: 'Eligibility review',
        he: 'בדיקת התאמה',
        ar: 'مراجعة الاستيفاء',
        ru: 'Проверка соответствия',
        fr: 'Examen d’éligibilité',
        es: 'Revisión de requisitos',
      }),
      L6({
        en: 'Programs that include a prescription-strength component are only available after a treatment review. The analysis alone does not prescribe medication.',
        he: 'תוכניות הכוללות רכיב בעוצמת מרשם זמינות רק לאחר בדיקת טיפול. האבחון עצמו אינו רושם תרופות.',
        ar: 'البرامج التي تتضمّن مكوّنًا بتركيز الوصفة الطبية لا تتوفّر إلا بعد مراجعة علاجية. والتحليل وحده لا يصف الدواء.',
        ru: 'Программы, включающие компонент рецептурной концентрации, доступны только после проверки лечения. Один лишь анализ не является назначением лекарства.',
        fr: 'Les programmes comportant un composant à concentration de prescription ne sont disponibles qu’après un examen de traitement. L’analyse seule ne prescrit aucun médicament.',
        es: 'Los programas que incluyen un componente con concentración de prescripción solo están disponibles después de una revisión de tratamiento. El análisis por sí solo no prescribe ningún medicamento.',
      }),
    ),
    S(
      'ingredients-and-claims',
      L6({
        en: 'Ingredients & claims',
        he: 'רכיבים וטענות',
        ar: 'المكوّنات والادعاءات',
        ru: 'Ингредиенты и заявления',
        fr: 'Ingrédients et allégations',
        es: 'Ingredientes y afirmaciones',
      }),
      L6({
        en: 'Formula and claim information is subject to regulatory review. We do not present an ingredient study or a competitor study as our own, and make no guarantee of regrowth or of slowing or reversing gray hair.',
        he: 'מידע על הפורמולה והטענות כפוף לבדיקה רגולטורית. איננו מציגים מחקר של רכיב או של מתחרה כשלנו, ואיננו מבטיחים צמיחה מחדש או האטה/היפוך של שיער אפור.',
        ar: 'معلومات التركيبة والادعاءات خاضعة لمراجعة تنظيمية. ولا نقدّم دراسة عن مكوّن أو دراسة لمنافس على أنها دراستنا، ولا نضمن إعادة نمو الشعر ولا إبطاء الشعر الرمادي أو عكسه.',
        ru: 'Информация о формуле и заявлениях подлежит нормативной проверке. Мы не выдаём исследование ингредиента или исследование конкурента за собственное и не гарантируем ни возобновления роста волос, ни замедления или обращения вспять седины.',
        fr: 'Les informations sur la formule et les allégations sont soumises à un examen réglementaire. Nous ne présentons pas une étude d’ingrédient ou une étude de concurrent comme la nôtre, et ne garantissons ni la repousse ni le ralentissement ou l’inversion des cheveux gris.',
        es: 'La información sobre la fórmula y las afirmaciones está sujeta a revisión regulatoria. No presentamos un estudio de un ingrediente ni un estudio de la competencia como propio, y no garantizamos el recrecimiento del cabello ni la ralentización o reversión de las canas.',
      }),
    ),
    S(
      'emergencies',
      L6({
        en: 'Emergencies',
        he: 'מקרי חירום',
        ar: 'حالات الطوارئ',
        ru: 'Экстренные случаи',
        fr: 'Urgences',
        es: 'Emergencias',
      }),
      L6({
        en: 'If you have a medical emergency, contact your local emergency service.',
        he: 'במקרה חירום רפואי, יש לפנות לשירותי החירום המקומיים.',
        ar: 'إذا كنت تواجه حالة طوارئ طبية، فاتصل بخدمة الطوارئ المحلية لديك.',
        ru: 'Если у вас неотложное медицинское состояние, обратитесь в местную службу экстренной помощи.',
        fr: 'En cas d’urgence médicale, contactez votre service d’urgence local.',
        es: 'Si tiene una emergencia médica, póngase en contacto con su servicio de emergencias local.',
      }),
    ),
  ],
  accessibility: [
    S(
      'commitment',
      L6({
        en: 'Our commitment',
        he: 'המחויבות שלנו',
        ar: 'التزامنا',
        ru: 'Наше обязательство',
        fr: 'Notre engagement',
        es: 'Nuestro compromiso',
      }),
      L6({
        en: 'We want this website to be usable by as many people as possible, including people who use assistive technology.',
        he: 'אנו רוצים שהאתר הזה יהיה שמיש לכמה שיותר אנשים, כולל משתמשי טכנולוגיה מסייעת.',
        ar: 'نريد أن يكون هذا الموقع قابلاً للاستخدام من أكبر عدد ممكن من الأشخاص، بمن فيهم مستخدمو التقنيات المساعِدة.',
        ru: 'Мы хотим, чтобы этим веб-сайтом могло пользоваться как можно больше людей, включая тех, кто использует вспомогательные технологии.',
        fr: 'Nous voulons que ce site web soit utilisable par le plus grand nombre de personnes possible, y compris celles qui utilisent des technologies d’assistance.',
        es: 'Queremos que este sitio web sea utilizable por el mayor número de personas posible, incluidas las que utilizan tecnología de apoyo.',
      }),
    ),
    S(
      'standard',
      L6({
        en: 'Standard',
        he: 'תקן',
        ar: 'المعيار',
        ru: 'Стандарт',
        fr: 'Norme',
        es: 'Norma',
      }),
      L6({
        en: 'We aim to meet WCAG 2.2 level AA.',
        he: 'אנו שואפים לעמוד בתקן WCAG 2.2 ברמה AA.',
        ar: 'نهدف إلى استيفاء معيار WCAG 2.2 المستوى AA.',
        ru: 'Мы стремимся соответствовать стандарту WCAG 2.2 уровня AA.',
        fr: 'Nous visons à respecter la norme WCAG 2.2 niveau AA.',
        es: 'Aspiramos a cumplir la norma WCAG 2.2 nivel AA.',
      }),
    ),
    S(
      'known-limitations',
      L6({
        en: 'Known limitations',
        he: 'מגבלות ידועות',
        ar: 'القيود المعروفة',
        ru: 'Известные ограничения',
        fr: 'Limites connues',
        es: 'Limitaciones conocidas',
      }),
      L6({
        en: 'This is a concept build and some areas are still being improved. [TODO: list known gaps once audited.]',
        he: 'זו גרסת קונספט וחלק מהאזורים עדיין בשיפור. [TODO: לפרט פערים ידועים לאחר ביקורת.]',
        ar: 'هذه نسخة مفاهيمية وبعض الجوانب لا تزال قيد التحسين. [TODO: سرد الثغرات المعروفة بعد التدقيق.]',
        ru: 'Это концептуальная сборка, и некоторые области ещё дорабатываются. [TODO: перечислить известные пробелы после аудита.]',
        fr: 'Il s’agit d’une version conceptuelle et certaines parties sont encore en cours d’amélioration. [TODO: lister les lacunes connues après audit.]',
        es: 'Esta es una versión conceptual y algunas áreas todavía se están mejorando. [TODO: enumerar las carencias conocidas tras la auditoría.]',
      }),
    ),
    S(
      'contact',
      L6({
        en: 'Report a barrier',
        he: 'דיווח על חסם',
        ar: 'الإبلاغ عن عائق',
        ru: 'Сообщить о барьере',
        fr: 'Signaler un obstacle',
        es: 'Informar de una barrera',
      }),
      L6({
        en: 'Tell us at support@roote.us and we will work to fix it.',
        he: 'ספרו לנו ב-support@roote.us ונפעל לתקן.',
        ar: 'أخبِرنا عبر support@roote.us وسنعمل على إصلاحه.',
        ru: 'Сообщите нам на support@roote.us, и мы постараемся это исправить.',
        fr: 'Signalez-le-nous à support@roote.us et nous nous efforcerons de le corriger.',
        es: 'Díganoslo en support@roote.us y trabajaremos para corregirlo.',
      }),
    ),
  ],
  cookies: [
    S(
      'what-we-use',
      L6({
        en: 'What we use',
        he: 'במה אנחנו משתמשים',
        ar: 'ما الذي نستخدمه',
        ru: 'Что мы используем',
        fr: 'Ce que nous utilisons',
        es: 'Qué utilizamos',
      }),
      L6({
        en: 'This site uses your browser’s local storage to remember your language, your assessment progress, and your cart. It does not use advertising cookies.',
        he: 'האתר משתמש באחסון המקומי של הדפדפן כדי לזכור את השפה, את התקדמות האבחון ואת העגלה. אינו משתמש בעוגיות פרסום.',
        ar: 'يستخدم هذا الموقع التخزين المحلي في متصفحك لتذكّر لغتك وتقدّمك في التقييم وحقيبتك. وهو لا يستخدم ملفات تعريف ارتباط إعلانية.',
        ru: 'Этот сайт использует локальное хранилище вашего браузера, чтобы запоминать ваш язык, ход прохождения оценки и вашу корзину. Он не использует рекламные файлы cookie.',
        fr: 'Ce site utilise le stockage local de votre navigateur pour mémoriser votre langue, votre progression dans l’évaluation et votre panier. Il n’utilise pas de cookies publicitaires.',
        es: 'Este sitio utiliza el almacenamiento local de su navegador para recordar su idioma, su progreso en la evaluación y su bolsa. No utiliza cookies publicitarias.',
      }),
    ),
    S(
      'essential',
      L6({
        en: 'Essential storage',
        he: 'אחסון חיוני',
        ar: 'التخزين الأساسي',
        ru: 'Необходимое хранилище',
        fr: 'Stockage essentiel',
        es: 'Almacenamiento esencial',
      }),
      L6({
        en: 'Language preference, session progress, and cart contents are needed for the site to work.',
        he: 'העדפת שפה, התקדמות והתוכן בעגלה נדרשים לתפקוד האתר.',
        ar: 'تفضيل اللغة وتقدّم الجلسة ومحتويات الحقيبة ضرورية لكي يعمل الموقع.',
        ru: 'Языковые настройки, ход сеанса и содержимое корзины необходимы для работы сайта.',
        fr: 'La préférence de langue, la progression de la session et le contenu du panier sont nécessaires au fonctionnement du site.',
        es: 'La preferencia de idioma, el progreso de la sesión y el contenido de la bolsa son necesarios para que el sitio funcione.',
      }),
    ),
    S(
      'analytics',
      L6({
        en: 'Analytics',
        he: 'ניתוח שימוש',
        ar: 'التحليلات',
        ru: 'Аналитика',
        fr: 'Analyse d’audience',
        es: 'Analítica',
      }),
      L6({
        en: 'No analytics provider is connected in this build. If one is added, this section will describe it and how to opt out.',
        he: 'לא מחובר ספק ניתוח בגרסה זו. אם יתווסף, סעיף זה יתאר אותו ואת אופן ההסתלקות.',
        ar: 'لا يوجد مزوّد تحليلات متصل في هذه النسخة. وإذا أُضيف مزوّد، فسيصف هذا القسم إياه وكيفية إلغاء الاشتراك فيه.',
        ru: 'В этой сборке не подключён ни один поставщик аналитики. Если он будет добавлен, в этом разделе будет описано, что это и как отказаться.',
        fr: 'Aucun fournisseur d’analyse d’audience n’est connecté dans cette version. Si l’un est ajouté, cette section le décrira ainsi que la manière de le refuser.',
        es: 'En esta versión no hay ningún proveedor de analítica conectado. Si se añade uno, esta sección lo describirá y explicará cómo rechazarlo.',
      }),
    ),
    S(
      'managing',
      L6({
        en: 'Managing storage',
        he: 'ניהול האחסון',
        ar: 'إدارة التخزين',
        ru: 'Управление хранилищем',
        fr: 'Gestion du stockage',
        es: 'Gestión del almacenamiento',
      }),
      L6({
        en: 'Clear site data in your browser settings to remove everything this site has stored.',
        he: 'ניקוי נתוני האתר בהגדרות הדפדפן ימחק את כל מה שהאתר שמר.',
        ar: 'امسح بيانات الموقع من إعدادات متصفحك لإزالة كل ما خزّنه هذا الموقع.',
        ru: 'Очистите данные сайта в настройках браузера, чтобы удалить всё, что этот сайт сохранил.',
        fr: 'Effacez les données du site dans les paramètres de votre navigateur pour supprimer tout ce que ce site a stocké.',
        es: 'Borre los datos del sitio en la configuración de su navegador para eliminar todo lo que este sitio haya almacenado.',
      }),
    ),
  ],
};

export function getLegalBody(slug: string): LegalSection[] {
  return LEGAL_BODIES[slug] ?? [];
}
