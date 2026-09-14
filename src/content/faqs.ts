import { L6, type LocalizedText } from './localized';

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
    q: L6({
      en: 'How does the free hair analysis work?',
      he: 'איך עובד אבחון השיער החינמי?',
      ar: 'كيف يعمل تحليل الشعر المجاني؟',
      ru: 'Как работает бесплатный анализ волос?',
      fr: "Comment fonctionne l'analyse capillaire gratuite ?",
      es: '¿Cómo funciona el análisis capilar gratuito?',
    }),
    a: L6({
      en: 'You answer a short set of questions and upload four guided photos. We organize what is visible into a hair profile and suggest a personalized program to consider. It takes a few minutes and there is no commitment.',
      he: 'עונים על סדרת שאלות קצרה ומעלים ארבע תמונות מודרכות. אנו מארגנים את מה שנראה לעין לפרופיל שיער ומציעים תוכנית אישית לשקול. זה לוקח כמה דקות וללא התחייבות.',
      ar: 'تُجيب عن مجموعة قصيرة من الأسئلة وتُحمِّل أربع صور موجَّهة. ننظّم ما هو ظاهر في ملف تعريف للشعر ونقترح برنامجًا شخصيًا للنظر فيه. تستغرق العملية بضع دقائق ولا تنطوي على أي التزام.',
      ru: 'Вы отвечаете на короткий список вопросов и загружаете четыре снимка по инструкции. Мы систематизируем видимые данные в профиль волос и предлагаем персональную программу для рассмотрения. Это занимает несколько минут и ни к чему не обязывает.',
      fr: 'Vous répondez à une courte série de questions et téléversez quatre photos guidées. Nous organisons ce qui est visible en un profil capillaire et proposons un programme personnalisé à envisager. Cela prend quelques minutes et ne vous engage à rien.',
      es: 'Respondes a una breve serie de preguntas y subes cuatro fotos guiadas. Organizamos lo que se observa en un perfil capilar y sugerimos un programa personalizado para considerar. Lleva solo unos minutos y no implica ningún compromiso.',
    }),
  },
  {
    id: 'what-photos',
    q: L6({
      en: 'What photos do I need?',
      he: 'אילו תמונות צריך?',
      ar: 'ما الصور التي أحتاج إليها؟',
      ru: 'Какие фотографии мне нужны?',
      fr: 'Quelles photos dois-je fournir ?',
      es: '¿Qué fotos necesito?',
    }),
    a: L6({
      en: 'Four photos from your phone: front, top, crown, and hairline. Each step shows an outline and an example so the framing is consistent.',
      he: 'ארבע תמונות מהטלפון: חזית, מלמעלה, קודקוד וקו השיער. בכל שלב מוצגים קו מתאר ודוגמה כדי לשמור על מסגור אחיד.',
      ar: 'أربع صور من هاتفك: من الأمام، من الأعلى، من قمة الرأس، ومن خط الشعر. تعرض كل خطوة مخططًا توضيحيًا ومثالًا للحفاظ على تناسق التأطير.',
      ru: 'Четыре снимка с телефона: спереди, сверху, макушка и линия роста волос. На каждом шаге показаны контур и пример, чтобы кадрирование было одинаковым.',
      fr: "Quatre photos prises avec votre téléphone : de face, du dessus, de la couronne et de la ligne d'implantation. Chaque étape affiche un contour et un exemple pour garder un cadrage cohérent.",
      es: 'Cuatro fotos desde tu teléfono: frente, parte superior, coronilla y línea del cabello. Cada paso muestra un contorno y un ejemplo para mantener un encuadre uniforme.',
    }),
  },
  {
    id: 'how-long',
    q: L6({
      en: 'How long does the assessment take?',
      he: 'כמה זמן לוקח האבחון?',
      ar: 'كم من الوقت يستغرق التقييم؟',
      ru: 'Сколько времени занимает оценка?',
      fr: "Combien de temps prend l'évaluation ?",
      es: '¿Cuánto tiempo tarda la evaluación?',
    }),
    a: L6({
      en: 'A few minutes, including taking the photos. You can leave and pick up where you left off.',
      he: 'כמה דקות, כולל צילום התמונות. אפשר לצאת ולהמשיך מאותה נקודה.',
      ar: 'بضع دقائق، بما في ذلك التقاط الصور. يمكنك المغادرة والعودة لاحقًا لإكمال ما توقفت عنده.',
      ru: 'Несколько минут, включая съёмку фотографий. Вы можете прерваться и продолжить с того места, на котором остановились.',
      fr: 'Quelques minutes, photos comprises. Vous pouvez interrompre et reprendre là où vous vous étiez arrêté(e).',
      es: 'Unos minutos, incluida la toma de fotos. Puedes salir y continuar desde donde lo dejaste.',
    }),
  },
  {
    id: 'how-program-selected',
    q: L6({
      en: 'How is my program selected?',
      he: 'איך נבחרת התוכנית שלי?',
      ar: 'كيف يتم اختيار برنامجي؟',
      ru: 'Как выбирается моя программа?',
      fr: 'Comment mon programme est-il sélectionné ?',
      es: '¿Cómo se selecciona mi programa?',
    }),
    a: L6({
      en: 'Your recommendation is based on your assessment profile and available treatment criteria. Programs that include a prescription-strength component require an additional review before they are available to you.',
      he: 'ההמלצה מבוססת על פרופיל האבחון שלך ועל קריטריוני הטיפול הזמינים. תוכניות הכוללות רכיב בעוצמת מרשם מחייבות בדיקה נוספת לפני שהן זמינות לך.',
      ar: 'تستند التوصية إلى ملف التقييم الخاص بك وإلى معايير العلاج المتاحة. البرامج التي تتضمّن مكوّنًا بقوة الوصفة الطبية تتطلّب مراجعة إضافية قبل أن تصبح متاحة لك.',
      ru: 'Рекомендация основана на профиле вашей оценки и доступных критериях лечения. Программы, включающие компонент рецептурной силы, требуют дополнительной проверки, прежде чем стать доступными для вас.',
      fr: 'Votre recommandation repose sur le profil de votre évaluation et sur les critères de traitement disponibles. Les programmes comportant un composant de force prescriptible nécessitent un examen supplémentaire avant de vous être proposés.',
      es: 'Tu recomendación se basa en el perfil de tu evaluación y en los criterios de tratamiento disponibles. Los programas que incluyen un componente de concentración con receta requieren una revisión adicional antes de estar disponibles para ti.',
    }),
  },
  {
    id: 'density-difference',
    q: L6({
      en: 'What is the difference between Density 6, 10, and 15?',
      he: 'מה ההבדל בין Density 6, 10 ו-15?',
      ar: 'ما الفرق بين مستويات الكثافة 6 و10 و15؟',
      ru: 'В чём разница между уровнями плотности 6, 10 и 15?',
      fr: 'Quelle est la différence entre les niveaux de densité 6, 10 et 15 ?',
      es: '¿Cuál es la diferencia entre los niveles de densidad 6, 10 y 15?',
    }),
    a: L6({
      en: 'They are treatment tiers, not a good/better/best scale. The right tier is decided through a treatment review based on your profile; it is never chosen automatically from a score.',
      he: 'אלה דרגות טיפול, לא סולם של טוב/טוב יותר. הדרגה המתאימה נקבעת בבדיקת טיפול לפי הפרופיל שלך, לעולם לא נבחרת אוטומטית לפי ניקוד.',
      ar: 'هذه درجات علاج، وليست سلّمًا من نوع جيد/أفضل/الأفضل. تُحدَّد الدرجة المناسبة من خلال مراجعة علاجية بناءً على ملفك الشخصي، ولا يتم اختيارها أبدًا تلقائيًا بناءً على نتيجة رقمية.',
      ru: 'Это уровни лечения, а не шкала «хорошо / лучше / лучше всего». Подходящий уровень определяется в ходе проверки лечения на основе вашего профиля; он никогда не выбирается автоматически по баллу.',
      fr: "Ce sont des paliers de traitement, pas une échelle bien/mieux/idéal. Le palier adapté est déterminé lors d'un examen de traitement basé sur votre profil ; il n'est jamais choisi automatiquement à partir d'un score.",
      es: 'Son niveles de tratamiento, no una escala de bueno/mejor/óptimo. El nivel adecuado se determina mediante una revisión de tratamiento basada en tu perfil; nunca se elige automáticamente a partir de una puntuación.',
    }),
  },
  {
    id: 'men-women-products',
    q: L6({
      en: 'Do men and women receive different products?',
      he: 'האם גברים ונשים מקבלים מוצרים שונים?',
      ar: 'هل يحصل الرجال والنساء على منتجات مختلفة؟',
      ru: 'Получают ли мужчины и женщины разные продукты?',
      fr: 'Les hommes et les femmes reçoivent-ils des produits différents ?',
      es: '¿Los hombres y las mujeres reciben productos diferentes?',
    }),
    a: L6({
      en: 'Packaging is presented in a dark-teal theme for men and a cream theme for women. Treatment recommendations come from your assessment and the eligibility rules, not from that choice.',
      he: 'האריזה מוצגת בגוון טורקיז כהה לגברים ובגוון קרם לנשים. המלצות הטיפול נובעות מהאבחון ומכללי ההתאמה, לא מהבחירה הזו.',
      ar: 'تُعرض العبوات بتصميم فيروزي داكن للرجال وبتصميم كريمي للنساء. توصيات العلاج مستمدّة من التقييم الخاص بك ومن قواعد الأهلية، وليس من هذا الاختيار.',
      ru: 'Упаковка оформлена в тёмно-бирюзовой теме для мужчин и в кремовой теме для женщин. Рекомендации по лечению основаны на вашей оценке и правилах соответствия, а не на этом выборе.',
      fr: "L'emballage se décline dans un thème sarcelle foncé pour les hommes et un thème crème pour les femmes. Les recommandations de traitement découlent de votre évaluation et des règles d'éligibilité, pas de ce choix.",
      es: 'El empaque se presenta en un tono verde azulado oscuro para hombres y un tono crema para mujeres. Las recomendaciones de tratamiento provienen de tu evaluación y de las reglas de elegibilidad, no de esa elección.',
    }),
  },
  {
    id: 'progress',
    q: L6({
      en: 'How does progress tracking work?',
      he: 'איך עובד מעקב ההתקדמות?',
      ar: 'كيف يعمل تتبّع التقدّم؟',
      ru: 'Как работает отслеживание прогресса?',
      fr: 'Comment fonctionne le suivi de la progression ?',
      es: '¿Cómo funciona el seguimiento del progreso?',
    }),
    a: L6({
      en: 'After you start a program, your account tracks your daily routine and stores your check-in photos and scans, so you can compare from your baseline scan to your final scan.',
      he: 'לאחר תחילת התוכנית, החשבון שלך עוקב אחר השגרה היומית ושומר את תמונות המעקב והסריקות, כדי שתוכל/י להשוות מהסריקה הראשונה ועד הסופית.',
      ar: 'بعد بدء البرنامج، يتتبّع حسابك روتينك اليومي ويخزّن صور المتابعة والفحوصات، حتى تتمكّن من المقارنة بين الفحص الأساسي والفحص النهائي.',
      ru: 'После начала программы ваш аккаунт отслеживает ежедневную рутину и сохраняет фотографии контрольных отметок и сканы, чтобы вы могли сравнить начальное сканирование с финальным.',
      fr: 'Une fois votre programme commencé, votre compte suit votre routine quotidienne et enregistre vos photos de suivi et vos scans, afin que vous puissiez comparer votre scan de référence à votre scan final.',
      es: 'Una vez que inicias un programa, tu cuenta hace seguimiento de tu rutina diaria y guarda tus fotos de control y escaneos, para que puedas comparar desde tu escaneo inicial hasta el final.',
    }),
  },
  {
    id: 'next-scan',
    q: L6({
      en: 'When will I take another hair scan?',
      he: 'מתי אבצע סריקת שיער נוספת?',
      ar: 'متى سأجري فحص شعر آخر؟',
      ru: 'Когда мне нужно будет пройти ещё одно сканирование волос?',
      fr: 'Quand devrai-je refaire un scan capillaire ?',
      es: '¿Cuándo haré otro escaneo capilar?',
    }),
    a: L6({
      en: 'Your program includes scan check-ins on a set schedule. The dates appear in your account once your program starts.',
      he: 'התוכנית שלך כוללת נקודות סריקה בלוח זמנים קבוע. התאריכים מופיעים בחשבון עם תחילת התוכנית.',
      ar: 'يتضمّن برنامجك نقاط فحص وفق جدول زمني ثابت. تظهر التواريخ في حسابك بمجرد بدء البرنامج.',
      ru: 'Ваша программа включает контрольные сканирования по установленному графику. Даты появляются в вашем аккаунте после начала программы.',
      fr: 'Votre programme comprend des points de contrôle par scan selon un calendrier défini. Les dates apparaissent dans votre compte dès que votre programme commence.',
      es: 'Tu programa incluye puntos de control de escaneo según un calendario fijo. Las fechas aparecen en tu cuenta en cuanto comienza tu programa.',
    }),
  },
  {
    id: 'program-change',
    q: L6({
      en: 'Can my program change over time?',
      he: 'האם התוכנית שלי יכולה להשתנות עם הזמן?',
      ar: 'هل يمكن أن يتغيّر برنامجي مع مرور الوقت؟',
      ru: 'Может ли моя программа меняться со временем?',
      fr: "Mon programme peut-il évoluer au fil du temps ?",
      es: '¿Puede cambiar mi programa con el tiempo?',
    }),
    a: L6({
      en: 'Yes. A re-analysis can lead to an adjusted recommendation, and any change to a prescription-strength component goes through review.',
      he: 'כן. אבחון חוזר יכול להוביל להמלצה מעודכנת, וכל שינוי ברכיב בעוצמת מרשם עובר בדיקה.',
      ar: 'نعم. يمكن أن يؤدي إعادة التحليل إلى توصية معدَّلة، وأي تغيير في مكوّن بقوة الوصفة الطبية يخضع لمراجعة.',
      ru: 'Да. Повторный анализ может привести к скорректированной рекомендации, а любое изменение компонента рецептурной силы проходит проверку.',
      fr: "Oui. Une nouvelle analyse peut entraîner une recommandation ajustée, et tout changement apporté à un composant de force prescriptible fait l'objet d'un examen.",
      es: 'Sí. Un nuevo análisis puede dar lugar a una recomendación ajustada, y cualquier cambio en un componente de concentración con receta pasa por una revisión.',
    }),
  },
  {
    id: 'buy-without-analysis',
    q: L6({
      en: 'Can I buy products without taking the analysis?',
      he: 'אפשר לקנות מוצרים בלי לעשות את האבחון?',
      ar: 'هل يمكنني شراء المنتجات دون إجراء التحليل؟',
      ru: 'Могу ли я купить продукты без прохождения анализа?',
      fr: "Puis-je acheter des produits sans effectuer l'analyse ?",
      es: '¿Puedo comprar productos sin hacer el análisis?',
    }),
    a: L6({
      en: 'Support products can be bought on their own. Programs with a prescription-strength component still require the assessment and a treatment review.',
      he: 'מוצרי תמיכה ניתן לקנות בנפרד. תוכניות עם רכיב בעוצמת מרשם עדיין מחייבות אבחון ובדיקת טיפול.',
      ar: 'يمكن شراء منتجات الدعم بشكل منفصل. أمّا البرامج التي تتضمّن مكوّنًا بقوة الوصفة الطبية فلا تزال تتطلّب التقييم ومراجعة علاجية.',
      ru: 'Вспомогательные продукты можно приобрести отдельно. Программы с компонентом рецептурной силы по-прежнему требуют оценки и проверки лечения.',
      fr: 'Les produits de soutien peuvent être achetés séparément. Les programmes comportant un composant de force prescriptible nécessitent toujours l\'évaluation et un examen de traitement.',
      es: 'Los productos de apoyo se pueden comprar por separado. Los programas con un componente de concentración con receta siguen requiriendo la evaluación y una revisión de tratamiento.',
    }),
  },
  {
    id: 'data-handling',
    q: L6({
      en: 'How are my photos and personal data handled?',
      he: 'איך מטופלים התמונות והנתונים האישיים שלי?',
      ar: 'كيف يتم التعامل مع صوري وبياناتي الشخصية؟',
      ru: 'Как обрабатываются мои фотографии и личные данные?',
      fr: 'Comment mes photos et mes données personnelles sont-elles traitées ?',
      es: '¿Cómo se gestionan mis fotos y mis datos personales?',
    }),
    a: L6({
      en: 'You are asked for consent before any photo upload, and told why the photos are needed, how they are used, how long they are kept, and how to ask for deletion. See the Privacy Policy for details.',
      he: 'מבקשים את הסכמתך לפני העלאת תמונות, ומסבירים למה הן נדרשות, כיצד נעשה בהן שימוש, כמה זמן הן נשמרות, ואיך לבקש מחיקה. פרטים במדיניות הפרטיות.',
      ar: 'يُطلب منك الموافقة قبل رفع أي صورة، ويتم توضيح سبب الحاجة إليها، وكيفية استخدامها، ومدة الاحتفاظ بها، وكيفية طلب حذفها. راجع سياسة الخصوصية للاطّلاع على التفاصيل.',
      ru: 'Перед загрузкой любой фотографии у вас запрашивают согласие и объясняют, зачем нужны фотографии, как они используются, как долго хранятся и как запросить их удаление. Подробности см. в Политике конфиденциальности.',
      fr: "Votre consentement vous est demandé avant tout téléversement de photo, et vous êtes informé(e) des raisons pour lesquelles elles sont nécessaires, de la façon dont elles sont utilisées, de leur durée de conservation et de la manière de demander leur suppression. Voir la Politique de confidentialité pour plus de détails.",
      es: 'Se te pide tu consentimiento antes de subir cualquier foto, y se te explica por qué son necesarias, cómo se utilizan, cuánto tiempo se conservan y cómo solicitar su eliminación. Consulta la Política de Privacidad para más detalles.',
    }),
  },
  {
    id: 'pause-cancel',
    q: L6({
      en: 'Can I pause or cancel a recurring order?',
      he: 'אפשר להשהות או לבטל הזמנה מתחדשת?',
      ar: 'هل يمكنني تعليق أو إلغاء طلب متكرّر؟',
      ru: 'Могу ли я приостановить или отменить регулярный заказ?',
      fr: 'Puis-je suspendre ou annuler une commande récurrente ?',
      es: '¿Puedo pausar o cancelar un pedido recurrente?',
    }),
    a: L6({
      en: 'Yes. Recurring orders can be paused or cancelled from your account, and the recurring terms are disclosed before you agree to them. See the Subscription Terms.',
      he: 'כן. ניתן להשהות או לבטל הזמנות מתחדשות דרך החשבון, ותנאי ההתחדשות מוצגים לפני האישור. ראו תנאי מנוי.',
      ar: 'نعم. يمكن تعليق أو إلغاء الطلبات المتكرّرة من خلال حسابك، ويتم عرض شروط التجديد قبل موافقتك عليها. راجع شروط الاشتراك.',
      ru: 'Да. Регулярные заказы можно приостановить или отменить в вашем аккаунте, а условия продления раскрываются до того, как вы их принимаете. См. Условия подписки.',
      fr: "Oui. Les commandes récurrentes peuvent être suspendues ou annulées depuis votre compte, et les conditions de renouvellement sont communiquées avant que vous les acceptiez. Voir les Conditions d'abonnement.",
      es: 'Sí. Los pedidos recurrentes se pueden pausar o cancelar desde tu cuenta, y las condiciones de renovación se muestran antes de que las aceptes. Consulta los Términos de suscripción.',
    }),
  },
];

/** Shared questions reused on each product page (brief §20 item 11). */
export const PRODUCT_FAQS_COMMON: Faq[] = [
  {
    id: 'how-it-fits',
    q: L6({
      en: 'How does this fit my program?',
      he: 'איך זה משתלב בתוכנית שלי?',
      ar: 'كيف يتناسب هذا مع برنامجي؟',
      ru: 'Как это вписывается в мою программу?',
      fr: "Comment cela s'intègre-t-il à mon programme ?",
      es: '¿Cómo encaja esto en mi programa?',
    }),
    a: L6({
      en: 'Your program lists exactly which products to use and when. This page explains the product on its own.',
      he: 'התוכנית שלך מפרטת בדיוק באילו מוצרים להשתמש ומתי. עמוד זה מסביר את המוצר עצמו.',
      ar: 'يحدّد برنامجك بدقّة المنتجات التي يجب استخدامها ومتى. توضّح هذه الصفحة المنتج بحدّ ذاته.',
      ru: 'В вашей программе точно указано, какие продукты использовать и когда. Эта страница описывает продукт отдельно.',
      fr: 'Votre programme indique précisément quels produits utiliser et à quel moment. Cette page présente le produit à part.',
      es: 'Tu programa indica exactamente qué productos usar y cuándo. Esta página explica el producto por sí solo.',
    }),
  },
  {
    id: 'evidence',
    q: L6({
      en: 'What evidence is there?',
      he: 'מה הראיות?',
      ar: 'ما الأدلة المتوفرة؟',
      ru: 'Какие есть доказательства?',
      fr: 'Quelles preuves existe-t-il ?',
      es: '¿Qué evidencia hay?',
    }),
    a: L6({
      en: 'We publish trial data for this formulation as it becomes available, and never present an ingredient study or a competitor study as our own.',
      he: 'אנו מפרסמים נתוני מחקר על הפורמולה הזו ככל שהם זמינים, ולעולם לא מציגים מחקר של רכיב או של מתחרה כשלנו.',
      ar: 'ننشر بيانات التجارب الخاصة بهذه التركيبة كلما أصبحت متاحة، ولا نعرض أبدًا دراسة عن مكوّن أو دراسة لمنافس على أنها دراستنا الخاصة.',
      ru: 'Мы публикуем данные испытаний этой формулы по мере их появления и никогда не выдаём исследование ингредиента или исследование конкурента за собственное.',
      fr: "Nous publions les données d'essai de cette formulation au fur et à mesure de leur disponibilité, et ne présentons jamais une étude d'ingrédient ou une étude d'un concurrent comme la nôtre.",
      es: 'Publicamos los datos de los ensayos de esta formulación a medida que están disponibles, y nunca presentamos un estudio de un ingrediente o de un competidor como propio.',
    }),
  },
];

export function homeFaq(id: string): Faq | undefined {
  return HOME_FAQS.find((f) => f.id === id);
}
