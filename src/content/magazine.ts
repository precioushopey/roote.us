import { L6, type LocalizedText } from './localized';
import { claim, type Claim } from './claims';
import { PRODUCTS, type Ingredient, type ProductFormat } from './products';

/**
 * Content for the "Magazine" hub (`/magazine`) — a single scrollable page, not a
 * per-ingredient wiki (2026-09-09 design decision, see docs/superpowers/specs/
 * 2026-09-09-magazine-content-section-design.md). Ingredient names, claim
 * statuses, and source types are owned by `products.ts` — this file only adds
 * longer explanatory copy on top, keyed by ingredient name; it never overrides
 * an ingredient's real status.
 *
 * Only `RESULTS_TIMELINE_CLAIM` below is wrapped in a `Claim` with its own
 * `ClaimStatus`/`sourceType`. `HAIR_LOSS_SCIENCE`, `INGREDIENT_EXPLANATIONS`,
 * and `FORMAT_EXPLANATIONS` are plain `LocalizedText` — general, non-brand-
 * specific, factual copy reviewed at write-time rather than gated at
 * render-time; `INGREDIENT_EXPLANATIONS` additionally never exists for a
 * proprietary ingredient, so those always fall through to the ingredient's
 * own real `requires-review` status and render [PENDING] via IngredientCard,
 * unchanged.
 */

export const HAIR_LOSS_SCIENCE: LocalizedText = L6({
  en: 'Pattern hair loss is largely driven by genetics and the hormone DHT, which gradually shrinks follicles until some stop growing visible hair. Gray hair is a separate, unrelated process — pigment cells simply slowing down over time.',
  he: 'נשירת שיער תורשתית מונעת ברובה על ידי גנטיקה וההורמון DHT, שמכווץ בהדרגה את זקיקי השיער עד שחלקם מפסיקים לייצר שיער נראה לעין. שיער אפור הוא תהליך נפרד ולא קשור — האטה של תאי הפיגמנט עם הזמן.',
  ar: 'يُعزى تساقط الشعر النمطي في معظمه إلى الوراثة وهرمون DHT، الذي يُصغّر البصيلات تدريجيًا حتى تتوقف بعضها عن إنتاج شعر مرئي. الشعر الرمادي عملية منفصلة لا علاقة لها بذلك — مجرد تباطؤ خلايا الصبغة مع الوقت.',
  ru: 'Андрогенное выпадение волос в основном определяется генетикой и гормоном DHT, который постепенно уменьшает фолликулы, пока часть из них не перестаёт расти видимым волосом. Седина — отдельный, не связанный с этим процесс: пигментные клетки просто замедляются со временем.',
  fr: "La chute de cheveux androgénétique est surtout liée à la génétique et à l'hormone DHT, qui rétrécit progressivement les follicules jusqu'à ce que certains cessent de produire un cheveu visible. Les cheveux gris sont un processus distinct et sans rapport — les cellules pigmentaires ralentissent simplement avec le temps.",
  es: 'La pérdida de cabello de patrón se debe sobre todo a la genética y a la hormona DHT, que encoge gradualmente los folículos hasta que algunos dejan de producir cabello visible. Las canas son un proceso aparte y sin relación: las células pigmentarias simplemente se ralentizan con el tiempo.',
});

/**
 * Result-timeline claim. Real competitor sites (minoxidilmax.com, heyhair.co —
 * FAQ, product, and collection pages) were checked directly and make NO official
 * brand claim about result timelines; the only timeframes found anywhere were
 * customer-review anecdotes (2-6 months, informal), which are not used as a
 * source. This instead draws on general, brand-independent medical literature
 * on topical minoxidil/finasteride onset (commonly cited ~3-6 months) —
 * `requires-review` because it's still a result-timeline claim and needs
 * sign-off before it can render as live copy, not because the sourcing is weak.
 */
export const RESULTS_TIMELINE_CLAIM: Record<'en' | 'he', Claim> = {
  en: claim(
    'Onset timelines for topical minoxidil and finasteride are well documented in the general medical literature: initial shedding sometimes increases in the first several weeks as the hair cycle resets, visible density changes are commonly reported starting around the 3-6 month mark, and continued use is generally required to maintain any gains. Individual timelines vary, and a treatment review is the place to set expectations for your specific plan.',
    'requires-review',
    'ingredient-literature',
    'General minoxidil/finasteride onset timeline (~3-6 months) — confirm wording and sourcing with legal before publishing.',
  ),
  he: claim(
    'לוחות הזמנים להופעת תוצאות ממינוקסידיל ופינסטריד מקומיים מתועדים היטב בספרות הרפואית הכללית: לעיתים חלה עלייה בנשירה בשבועות הראשונים ככל שמחזור השיער מתאפס, שינויים נראים בצפיפות מדווחים בדרך כלל החל מסביבות חודש 3 עד 6, והמשך שימוש נדרש בדרך כלל לשמירה על כל שיפור שהושג. לוחות הזמנים משתנים מאדם לאדם, ובדיקת הטיפול היא המקום לקבוע ציפיות מותאמות לתוכנית שלך.',
    'requires-review',
    'ingredient-literature',
    'General minoxidil/finasteride onset timeline (~3-6 months) — confirm wording and sourcing with legal before publishing.',
  ),
};

/** Every unique ingredient across the 6 real SKUs, first occurrence wins. Single
 *  source of truth stays `products.ts` — this never redefines name/claimStatus/
 *  sourceType, only deduplicates what's already there. */
export function dedupedIngredients(): Ingredient[] {
  const seen = new Map<string, Ingredient>();
  for (const p of PRODUCTS) {
    for (const ing of p.ingredients) {
      if (!seen.has(ing.name)) seen.set(ing.name, ing);
    }
  }
  return Array.from(seen.values());
}

/** Same 4 categories `/science` already shows (marketing.sci.mechanism.*Title
 *  i18n keys) — reused, not reinvented, so both pages agree. */
export type IngredientCategory = 'dht' | 'regrowth' | 'pigment' | 'conditioning';

export const INGREDIENT_CATEGORY: Record<string, IngredientCategory> = {
  // DHT-pathway support
  Finasteride: 'dht',
  'Azelaic Acid': 'dht',
  'Saw Palmetto': 'dht',
  'Nettle Root': 'dht',
  // Regrowth stimulation
  Minoxidil: 'regrowth',
  'Procapil®': 'regrowth',
  'Capixyl™': 'regrowth',
  Caffeine: 'regrowth',
  Ginseng: 'regrowth',
  Rosemary: 'regrowth',
  'ABN Complex™': 'regrowth',
  Retinol: 'regrowth',
  // Pigment & nutrition support
  'Greyverse™': 'pigment',
  'Darkenyl™': 'pigment',
  'Fo-Ti': 'pigment',
  Biotin: 'pigment',
  Catalase: 'pigment',
  'L-Tyrosine': 'pigment',
  PABA: 'pigment',
  Zinc: 'pigment',
  'Red Clover Extract': 'pigment',
  // Scalp & hair conditioning
  'Green Tea': 'conditioning',
  Panthenol: 'conditioning',
  Nettle: 'conditioning',
  Horsetail: 'conditioning',
  Sage: 'conditioning',
  Jojoba: 'conditioning',
  'Canadian Willow Herb': 'conditioning',
  'Hydrolyzed Wheat Protein': 'conditioning',
};

/** Longer, Magazine-depth explanation per ingredient — the section's value-add
 *  over `/science`'s one-line note. Deliberately omitted for the 5 supplier-
 *  proprietary/unreviewed actives (Procapil®, Greyverse™, Darkenyl™, Capixyl™,
 *  ABN Complex™); those stay `requires-review` and render [PENDING] via
 *  IngredientCard, unchanged — never shown on `/magazine` at all (see
 *  `byCategory`'s filter below). Also not yet written for the four round-2
 *  ingredients newly wired into `INGREDIENT_CATEGORY` above (Retinol, Red
 *  Clover Extract, Canadian Willow Herb, Hydrolyzed Wheat Protein) — they
 *  fall back to their shorter `products.ts` note (see the `note` fallback in
 *  Magazine.tsx) until a longer explanation is written for them too. */
export const INGREDIENT_EXPLANATIONS: Record<string, LocalizedText> = {
  Minoxidil: L6({
    en: "Widens scalp blood vessels and extends the hair growth cycle's active phase.",
    he: 'מרחיב את כלי הדם בקרקפת ומאריך את שלב הצמיחה הפעיל במחזור השיער.',
    ar: 'يوسّع الأوعية الدموية في فروة الرأس ويطيل الطور النشط من دورة نمو الشعر.',
    ru: 'Расширяет сосуды кожи головы и удлиняет активную фазу цикла роста волос.',
    fr: 'Dilate les vaisseaux sanguins du cuir chevelu et prolonge la phase active du cycle pilaire.',
    es: 'Dilata los vasos sanguíneos del cuero cabelludo y prolonga la fase activa del ciclo de crecimiento.',
  }),
  Finasteride: L6({
    en: 'Reduces testosterone conversion into DHT, the hormone behind follicle miniaturization.',
    he: 'מפחית את המרת הטסטוסטרון ל-DHT, ההורמון הגורם להצטמקות זקיקי השיער.',
    ar: 'يقلّل تحوّل التستوستيرون إلى DHT، الهرمون المسؤول عن تصغير البصيلات.',
    ru: 'Снижает превращение тестостерона в DHT — гормон, вызывающий миниатюризацию фолликулов.',
    fr: "Réduit la conversion de la testostérone en DHT, l'hormone responsable de la miniaturisation des follicules.",
    es: 'Reduce la conversión de testosterona en DHT, la hormona responsable de la miniaturización del folículo.',
  }),
  'Azelaic Acid': L6({
    en: 'A mild DHT-pathway inhibitor, more established as a skin-care active.',
    he: 'מעכב מתון במסלול ה-DHT, מבוסס יותר כרכיב טיפוח עור.',
    ar: 'مثبِّط خفيف لمسار DHT، وأكثر رسوخًا كمكوّن للعناية بالبشرة.',
    ru: 'Мягкий ингибитор пути DHT, более признан как активный компонент ухода за кожей.',
    fr: 'Un inhibiteur léger de la voie DHT, plus reconnu comme actif de soin de la peau.',
    es: 'Un inhibidor leve de la vía DHT, más consolidado como activo de cuidado de la piel.',
  }),
  'Saw Palmetto': L6({
    en: "A milder, less-proven DHT-pathway alternative to finasteride.",
    he: 'חלופה צמחית מתונה ופחות מוכחת לפינסטריד במסלול ה-DHT.',
    ar: 'بديل نباتي أخف وأقل إثباتًا لـ Finasteride في مسار DHT.',
    ru: 'Более мягкая и менее доказанная растительная альтернатива Finasteride в пути DHT.',
    fr: 'Une alternative botanique plus douce et moins prouvée à Finasteride sur la voie DHT.',
    es: 'Una alternativa botánica más suave y menos probada a Finasteride en la vía DHT.',
  }),
  'Nettle Root': L6({
    en: 'Often paired with saw palmetto for a similar DHT-supporting role.',
    he: 'משולב לעיתים קרובות עם Saw Palmetto לתפקיד תומך דומה במסלול ה-DHT.',
    ar: 'كثيرًا ما يُقرَن بـ saw palmetto لدور داعم مماثل في مسار DHT.',
    ru: 'Часто сочетается с saw palmetto, играя похожую вспомогательную роль в пути DHT.',
    fr: 'Souvent associée au saw palmetto pour un rôle de soutien similaire sur la voie DHT.',
    es: 'Suele combinarse con saw palmetto para un papel de apoyo similar en la vía DHT.',
  }),
  Caffeine: L6({
    en: 'May stimulate hair follicles when applied topically to the scalp.',
    he: 'עשוי לגרות את זקיקי השיער בעת מריחה מקומית על הקרקפת.',
    ar: 'قد يحفّز بصيلات الشعر عند وضعه موضعيًا على فروة الرأس.',
    ru: 'Может стимулировать волосяные фолликулы при местном нанесении на кожу головы.',
    fr: 'Pourrait stimuler les follicules pileux en application locale sur le cuir chevelu.',
    es: 'Podría estimular los folículos pilosos al aplicarse de forma tópica en el cuero cabelludo.',
  }),
  Ginseng: L6({
    en: 'Supports scalp circulation and vitality; a long-used traditional herbal ingredient.',
    he: 'תומך במחזור הדם ובחיוניות הקרקפת; רכיב מסורתי בשימוש ותיק.',
    ar: 'يدعم الدورة الدموية وحيوية فروة الرأس؛ عشب تقليدي طويل الاستخدام.',
    ru: 'Поддерживает кровообращение и тонус кожи головы; давнее народное растение.',
    fr: 'Soutient la circulation et la vitalité du cuir chevelu ; un ingrédient traditionnel ancien.',
    es: 'Apoya la circulación y la vitalidad del cuero cabelludo; un ingrediente herbal tradicional.',
  }),
  Rosemary: L6({
    en: 'Supports scalp circulation, though with less evidence than minoxidil.',
    he: 'תומכת במחזור הדם בקרקפת, עם פחות ראיות ממינוקסידיל.',
    ar: 'يدعم الدورة الدموية في فروة الرأس، بأدلة أقل من Minoxidil.',
    ru: 'Поддерживает кровообращение кожи головы, но с меньшей доказательной базой, чем Minoxidil.',
    fr: 'Soutient la circulation du cuir chevelu, avec moins de preuves que Minoxidil.',
    es: 'Apoya la circulación del cuero cabelludo, con menos evidencia que Minoxidil.',
  }),
  'Fo-Ti': L6({
    en: 'A traditional botanical used for hair and, informally, natural hair color.',
    he: 'רכיב צמחי מסורתי לשיער, ובאופן לא רשמי לתמיכה בצבע השיער הטבעי.',
    ar: 'نبات تقليدي يُستخدم للشعر، وبشكل غير رسمي لدعم لون الشعر الطبيعي.',
    ru: 'Традиционное растение для волос и, неформально, для природного цвета волос.',
    fr: 'Une plante traditionnelle pour les cheveux et, de façon informelle, leur couleur naturelle.',
    es: 'Una planta tradicional para el cabello y, de forma informal, su color natural.',
  }),
  Biotin: L6({
    en: 'A B-vitamin supporting keratin production, most useful when a deficiency exists.',
    he: 'ויטמין B התומך בייצור קרטין, מועיל בעיקר כשיש מחסור קיים.',
    ar: 'فيتامين B يدعم إنتاج الكيراتين، ويفيد بصفة رئيسية عند وجود نقص.',
    ru: 'Витамин группы B, поддерживающий выработку кератина; полезен в основном при дефиците.',
    fr: 'Une vitamine B qui soutient la kératine, surtout utile en cas de carence.',
    es: 'Una vitamina B que apoya la queratina, útil sobre todo si hay carencia.',
  }),
  Catalase: L6({
    en: 'An enzyme thought to break down follicle-clogging hydrogen peroxide that affects pigment.',
    he: 'אנזים שמשוער כמפרק מי חמצן המצטברים בזקיק ופוגעים בפיגמנט.',
    ar: 'إنزيم يُعتقد أنه يفكّك بيروكسيد الهيدروجين المتراكم في البصيلة والمؤثّر في الصبغة.',
    ru: 'Фермент, который, как считается, расщепляет перекись водорода, мешающую пигменту.',
    fr: 'Une enzyme qui décomposerait le peroxyde d’hydrogène accumulé dans le follicule et nuisant au pigment.',
    es: 'Una enzima que descompondría el peróxido de hidrógeno acumulado en el folículo y que afecta al pigmento.',
  }),
  'L-Tyrosine': L6({
    en: "An amino acid that's a precursor in the body's melanin synthesis.",
    he: 'חומצת אמינו המשמשת חומר מוצא בסינתזת המלנין בגוף.',
    ar: 'حمض أميني يُعدّ مادة أوّلية في تخليق الميلانين في الجسم.',
    ru: 'Аминокислота, служащая предшественником в синтезе меланина в организме.',
    fr: "Un acide aminé précurseur dans la synthèse de la mélanine par l'organisme.",
    es: 'Un aminoácido precursor en la síntesis de melanina del organismo.',
  }),
  PABA: L6({
    en: 'Informally linked to pigment support; included here for its nutritional role.',
    he: 'מקושר באופן לא רשמי לתמיכה בפיגמנט; נכלל כאן בשל תפקידו התזונתי.',
    ar: 'يُربَط بشكل غير رسمي بدعم الصبغة؛ ومُدرَج هنا لدوره التغذوي.',
    ru: 'Неформально связывается с поддержкой пигмента; включён здесь за питательную роль.',
    fr: 'Informellement associé au soutien du pigment ; inclus ici pour son rôle nutritionnel.',
    es: 'Asociado de forma informal al apoyo del pigmento; incluido aquí por su papel nutricional.',
  }),
  Zinc: L6({
    en: 'Supports normal hair tissue growth and repair.',
    he: 'תומך בצמיחה ובתיקון תקינים של רקמת השיער.',
    ar: 'يدعم النمو والإصلاح الطبيعيين لنسيج الشعر.',
    ru: 'Поддерживает нормальный рост и восстановление тканей волос.',
    fr: 'Soutient une croissance et une réparation normales du tissu capillaire.',
    es: 'Apoya el crecimiento y la reparación normales del tejido capilar.',
  }),
  'Green Tea': L6({
    en: 'An antioxidant-rich botanical that helps protect scalp condition day to day.',
    he: 'רכיב צמחי עשיר בנוגדי חמצון, התומך במצב הקרקפת מול עומס יומיומי.',
    ar: 'نبات غني بمضادات الأكسدة يساعد في دعم حالة فروة الرأس يوميًا.',
    ru: 'Богатое антиоксидантами растение, помогающее поддерживать состояние кожи головы день за днём.',
    fr: 'Une plante riche en antioxydants qui aide à préserver l’état du cuir chevelu au quotidien.',
    es: 'Una planta rica en antioxidantes que ayuda a mantener el estado del cuero cabelludo a diario.',
  }),
  Panthenol: L6({
    en: 'A pro-vitamin B5 that helps hair retain moisture and feel smoother.',
    he: 'פרו-ויטמין B5 המסייע לשיער לשמר לחות ולהרגיש חלק יותר.',
    ar: 'بروفيتامين B5 يساعد الشعر على الاحتفاظ بالرطوبة والشعور بالنعومة.',
    ru: 'Провитамин B5, помогающий волосам удерживать влагу и ощущаться более гладкими.',
    fr: 'Une pro-vitamine B5 qui aide les cheveux à retenir l’hydratation et à être plus doux.',
    es: 'Una provitamina B5 que ayuda al cabello a retener la humedad y sentirse más suave.',
  }),
  Nettle: L6({
    en: 'Supports general scalp conditioning, distinct from nettle root\'s DHT-pathway role.',
    he: 'תומכת בטיפוח כללי של הקרקפת, בשונה מתפקידה של שורש הסרפד במסלול ה-DHT.',
    ar: 'يدعم العناية العامة بفروة الرأس، بخلاف دور جذر القرّاص في مسار DHT.',
    ru: 'Поддерживает общий уход за кожей головы, в отличие от роли корня крапивы в пути DHT.',
    fr: 'Soutient un conditionnement général du cuir chevelu, à la différence du rôle de la racine d’ortie sur la voie DHT.',
    es: 'Apoya el acondicionamiento general del cuero cabelludo, a diferencia del papel de la raíz de ortiga en la vía DHT.',
  }),
  Horsetail: L6({
    en: 'A silica-rich botanical traditionally used to support hair strength and texture.',
    he: 'רכיב צמחי עשיר בסיליקה, בשימוש מסורתי לתמיכה בחוזק ובמרקם השיער.',
    ar: 'نبات غني بالسيليكا يُستخدم تقليديًا لدعم قوة الشعر وملمسه.',
    ru: 'Растение с высоким содержанием кремния, традиционно поддерживающее прочность и текстуру волос.',
    fr: 'Une plante riche en silice traditionnellement utilisée pour soutenir la force et la texture du cheveu.',
    es: 'Una planta rica en sílice de uso tradicional para apoyar la fuerza y la textura del cabello.',
  }),
  Sage: L6({
    en: 'An aromatic botanical valued for traditional scalp care and its herbal scent.',
    he: 'רכיב צמחי ארומטי המוערך לטיפוח קרקפת מסורתי ולריחו הצמחי.',
    ar: 'نبات عطري يُقدَّر للعناية التقليدية بفروة الرأس ولرائحته العشبية.',
    ru: 'Ароматическое растение, ценимое за традиционный уход за кожей головы и травяной аромат.',
    fr: 'Une plante aromatique appréciée pour le soin traditionnel du cuir chevelu et son parfum herbacé.',
    es: 'Una planta aromática valorada por el cuidado tradicional del cuero cabelludo y su aroma herbal.',
  }),
  Jojoba: L6({
    en: 'Mimics the scalp\'s natural oils, conditioning hair without feeling heavy or greasy.',
    he: 'דומה לשמנים הטבעיים של הקרקפת, ומזין את השיער מבלי להרגיש כבד או שמנוני.',
    ar: 'يشبه الزيوت الطبيعية لفروة الرأس، وينعّم الشعر دون إحساس بالثقل أو الدهنية.',
    ru: 'Похоже на природные масла кожи головы, ухаживает за волосами без ощущения тяжести или жирности.',
    fr: 'Ressemble aux sébums naturels du cuir chevelu et conditionne les cheveux sans effet lourd ni gras.',
    es: 'Se parece a los aceites naturales del cuero cabelludo y acondiciona el cabello sin sensación de peso o grasa.',
  }),
};

/** One explainer per real product format — general delivery-method info, not a
 *  brand-specific or efficacy claim. */
export const FORMAT_EXPLANATIONS: Record<ProductFormat, LocalizedText> = {
  'topical-solution': L6({
    en: 'Applied to the scalp so actives reach the follicles directly.',
    he: 'נמרח ישירות על הקרקפת כדי שהרכיבים הפעילים יגיעו לזקיקים.',
    ar: 'يُوضع على فروة الرأس كي تصل المكوّنات الفاعلة إلى البصيلات مباشرةً.',
    ru: 'Наносится на кожу головы, чтобы активные вещества попадали прямо к фолликулам.',
    fr: 'Appliqué sur le cuir chevelu pour que les actifs atteignent directement les follicules.',
    es: 'Se aplica en el cuero cabelludo para que los activos lleguen directo a los folículos.',
  }),
  'capsule-supplement': L6({
    en: 'Taken daily with food to deliver nutrients through digestion.',
    he: 'נלקח מדי יום עם אוכל ומספק רכיבים דרך מערכת העיכול.',
    ar: 'يُؤخذ يوميًا مع الطعام لإيصال العناصر الغذائية عبر الجهاز الهضمي.',
    ru: 'Принимается ежедневно с едой, доставляя питательные вещества через пищеварение.',
    fr: "À prendre chaque jour avec un repas pour apporter des nutriments via la digestion.",
    es: 'Se toma a diario con las comidas para aportar nutrientes a través de la digestión.',
  }),
  serum: L6({
    en: 'A lightweight, leave-in formula applied once daily.',
    he: 'תכשיר קל שאינו נשטף, הנמרח פעם ביום.',
    ar: 'تركيبة خفيفة تُترك دون شطف وتُوضع مرة يوميًا.',
    ru: 'Лёгкий несмываемый состав, который наносят раз в день.',
    fr: 'Une formule légère sans rinçage, appliquée une fois par jour.',
    es: 'Una fórmula ligera sin aclarado que se aplica una vez al día.',
  }),
  shampoo: L6({
    en: 'A daily cleanse that clears buildup and conditions hair.',
    he: 'ניקוי יומי המסיר הצטברות ומזין את השיער.',
    ar: 'تنظيف يومي يزيل التراكمات وينعّم الشعر.',
    ru: 'Ежедневное очищение, которое удаляет налёт и ухаживает за волосами.',
    fr: 'Un nettoyage quotidien qui élimine les résidus et soigne les cheveux.',
    es: 'Una limpieza diaria que elimina residuos y acondiciona el cabello.',
  }),
};
