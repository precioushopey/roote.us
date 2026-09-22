export type LocalizedText = { en: string; he: string; ar?: string; ru?: string; fr?: string; es?: string };

export const rooteContent = {
  brand: {
    name: 'ROOTÉ',
    domain: 'ROOTÉ.US',
    tagline: { en: 'Personalized Hair Growth System', he: 'מערכת אישית לצמיחת שיער', ar: 'نظام شخصي لنمو الشعر', ru: 'Персональная система роста волос', fr: 'Système personnalisé de croissance capillaire', es: 'Sistema personalizado de crecimiento capilar' } as LocalizedText,
    /** Social profile URLs — null until the client supplies the real handles; the
     *  footer only renders an icon for a platform whose value is non-null. */
    social: {
      instagram: null,
      facebook: null,
      tiktok: null,
      youtube: null,
    } as Record<string, string | null>,
  },

  /**
   * The legal entity that operates the ROOTÉ brand. Locale-invariant facts live here;
   * the surrounding labels + legal prose are i18n keys (`marketing.legal.company.*`,
   * `marketing.legalSale.*`). Rendered by <CompanyDetails> on /terms (which
   * absorbs the former /terms-of-sale), and as the entity line in the site footer.
   */
  company: {
    legalName: '91 ENTERPRISE LLC',
    representative: 'Asher Elimelech',
    address: ['PO BOX 48112', 'Los Angeles, CA 90036', 'United States'] as readonly string[],
    registrationNumber: '201403110138',
    ein: '46-4692938',
    incorporated: 'January 30, 2014', // TODO: confirm display format / HE localization with client
    legalUpdated: 'September 17, 2026', // "last updated" date shown on the legal pages — from the ROOTÉ Master Legal Pack (2026-09-22); Terms & Conditions' own effective date in that pack is Sept 16
    support: {
      email: 'support@roote.us',
      phone: '+1 (310) 651-7283',
      phoneHref: 'tel:+13106517283',
    },
  },

  // Single display currency for the concept build. Real pricing and any
  // multi-currency support are [PENDING] client/commerce decisions.
  currency: 'USD',

  formula: {
    status: 'pending-regulatory-review',
    displayPercentagesPublicly: false, // TODO: confirm with client (regulatory)
    ingredients: [
      { key: 'minoxidil',   name: 'Minoxidil',    percentage: 10.0, role: 'regrowth-stimulant',    status: 'proposed' },
      { key: 'finasteride', name: 'Finasteride',  percentage: 0.1,  role: 'dht-blocker',           status: 'proposed' },
      { key: 'azelaic',     name: 'Azelaic Acid', percentage: 5.0,  role: 'dht-support',           status: 'proposed' },
      { key: 'abn',         name: 'ABN Complex™', percentage: 0.8,  role: 'proprietary-support',  status: 'proposed' },
    ],
  },

  // PO #5 / #15 (2026-09-04), realigned 2026-09-07 to the client-confirmed Hair
  // Goal → product mapping (Ilay/Marwell thread): every treatment product, keyed
  // by slug — the single source of truth for display (name/usage/frequency/zones).
  // WHICH keys apply to a given customer is a *Hair-Goal-branched* decision,
  // resolved by `domain/recommendation/recommend()` + `planKeysFor()` (rules.ts),
  // never by reading this whole registry. The client's "internal recommendation
  // key" and "customer-facing working name" are kept distinct from the slug below
  // (final commercial SKU/branding is still open — see client instruction to keep
  // the recommendation engine independent from commerce SKUs):
  //
  //   slug              internal recommendation key         customer-facing name (working)
  //   density-serum   → ROOTE_DENSITY_SERUM               → ROOTÉ Root Density Serum
  //   gray-support    → ROOTE_ANTI_GRAY_CAPSULES          → ROOTÉ Anti-Gray Capsules
  //   gray-serum      → (unconfirmed companion — kept as a supporting product only, [PENDING CLIENT RE-CONFIRMATION])
  //   regrowth-shampoo→ ROOTE_STOP_LOSS_SHAMPOO           → ROOTÉ Hair Loss Control Shampoo
  //   density-6/10/15 → ROOTE_HAIR_GROWTH_06/10/15        → ROOTÉ Hair Growth Treatment
  //     (Hair Growth tiers are business_rule_confirmed=true, clinical_approval=pending,
  //      production_active=false — see `domain/recommendation/hairGrowthTable.ts`.
  //      Never auto-recommended to a customer while inactive; do not depend on a
  //      final commercial name such as "Aminoxi"/"Minoxi" yet — client instruction.)
  //
  // Do not auto-stack a Density topical + Gray Serum: [PENDING CLINICAL COMPATIBILITY REVIEW].
  treatmentRegistry: {
    // AR/RU/FR/ES product-name translations below are first-pass, pending the same medical/naming review as the `// TODO: confirm medical HE` notes.
    'density-serum': {
      name: { en: 'ROOTÉ Root Density Serum', he: 'סרום צפיפות שורש ROOTÉ', ar: 'سيروم كثافة الجذور ROOTÉ', ru: 'ROOTÉ Сыворотка для плотности корней', fr: 'ROOTÉ Sérum densité racinaire', es: 'ROOTÉ Sérum densidad de la raíz' } as LocalizedText, // TODO: confirm medical HE
      form: 'serum' as const,
      usageKey: 'usage.apply-scalp-affected',
      frequencyKey: 'frequency.daily-evening',
      appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
    },
    'density-6': {
      // 2026-09-22: named to match the actual product label art (src/assets/products/Level 6.png
      // — "LEVEL 6", Minoxidil 6%, Finasteride 0.3%), which now exists and confirms the level
      // numbering; supersedes the earlier generic-name-only caution for these three entries.
      name: { en: 'ROOTÉ Hair Growth Treatment — Level 6', he: 'טיפול לצמיחת שיער ROOTÉ — רמה 6', ar: 'علاج نمو الشعر ROOTÉ — مستوى 6', ru: 'ROOTÉ Средство для роста волос — Уровень 6', fr: 'ROOTÉ Traitement pour la croissance capillaire — Niveau 6', es: 'ROOTÉ Tratamiento para el crecimiento capilar — Nivel 6' } as LocalizedText, // TODO: confirm medical HE
      form: 'topical' as const,
      usageKey: 'usage.apply-scalp-affected',
      frequencyKey: 'frequency.daily-evening',
      appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
    },
    'density-10': {
      // Label: src/assets/products/Level 10.png — "LEVEL 10", Minoxidil 10%, Finasteride 0.1%,
      // Azelaic Acid 5%, ABN Complex™ 0.8%.
      name: { en: 'ROOTÉ Hair Growth Treatment — Level 10', he: 'טיפול לצמיחת שיער ROOTÉ — רמה 10', ar: 'علاج نمو الشعر ROOTÉ — مستوى 10', ru: 'ROOTÉ Средство для роста волос — Уровень 10', fr: 'ROOTÉ Traitement pour la croissance capillaire — Niveau 10', es: 'ROOTÉ Tratamiento para el crecimiento capilar — Nivel 10' } as LocalizedText,
      form: 'topical' as const,
      usageKey: 'usage.apply-scalp-affected',
      frequencyKey: 'frequency.daily-evening',
      appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
    },
    'density-15': {
      // Label: src/assets/products/Level 15.png — "LEVEL 15", Minoxidil 15%, Finasteride 0.1%,
      // Retinol 0.025%, Caffeine 0.001%.
      name: { en: 'ROOTÉ Hair Growth Treatment — Level 15', he: 'טיפול לצמיחת שיער ROOTÉ — רמה 15', ar: 'علاج نمو الشعر ROOTÉ — مستوى 15', ru: 'ROOTÉ Средство для роста волос — Уровень 15', fr: 'ROOTÉ Traitement pour la croissance capillaire — Niveau 15', es: 'ROOTÉ Tratamiento para el crecimiento capilar — Nivel 15' } as LocalizedText,
      form: 'topical' as const,
      usageKey: 'usage.apply-scalp-affected',
      frequencyKey: 'frequency.daily-evening',
      appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
    },
    'regrowth-shampoo': {
      name: { en: 'ROOTÉ Hair Loss Control Shampoo', he: 'שמפו ROOTÉ לבלימת נשירה', ar: 'شامبو ضد تساقط الشعر ROOTÉ', ru: 'ROOTÉ Шампунь против выпадения волос', fr: 'ROOTÉ Shampooing anti-chute', es: 'ROOTÉ Champú anticaída' } as LocalizedText,
      form: 'shampoo' as const,
      usageKey: 'usage.cleanse',
      frequencyKey: 'frequency.wash-day',
    },
    'gray-support': {
      name: { en: 'ROOTÉ Anti-Gray Capsules', he: 'קפסולות ROOTÉ נגד הזדקנות שיער', ar: 'كبسولات ضد شيب الشعر ROOTÉ', ru: 'ROOTÉ Капсулы против седины', fr: 'ROOTÉ Capsules anti-cheveux gris', es: 'ROOTÉ Cápsulas anticanas' } as LocalizedText, // TODO: confirm medical HE
      form: 'capsule' as const,
      usageKey: 'usage.gray-support',
      frequencyKey: 'frequency.daily-morning',
    },
    'gray-serum': {
      name: { en: 'ROOTÉ Gray Serum', he: 'סרום ROOTÉ גריי', ar: 'سيروم الشعر الرمادي ROOTÉ', ru: 'ROOTÉ Сыворотка от седины', fr: 'ROOTÉ Sérum cheveux gris', es: 'ROOTÉ Sérum para canas' } as LocalizedText, // TODO: confirm medical HE
      form: 'serum' as const,
      usageKey: 'usage.gray-serum',
      frequencyKey: 'frequency.daily-evening',
    },
    'derma-stim': {
      name: { en: 'Scalp-care guidance (optional)', he: 'הנחיות לטיפוח הקרקפת (רשות)', ar: 'إرشادات العناية بفروة الرأس (اختياري)', ru: 'Рекомендации по уходу за кожей головы (по желанию)', fr: 'Conseils de soin du cuir chevelu (facultatif)', es: 'Orientación sobre el cuidado del cuero cabelludo (opcional)' } as LocalizedText,
      form: 'routine' as const,
      usageKey: 'usage.derma-stim',
      frequencyKey: 'frequency.weekly',
    },
  } as Record<
    string,
    {
      name: LocalizedText;
      form: 'topical' | 'shampoo' | 'capsule' | 'serum' | 'routine';
      usageKey: string;
      frequencyKey: string;
      appliesToZones?: readonly string[];
    }
  >,

  programDurations: [
    { days: 90,  key: 'd90',  price: null, perDayFrom: null },
    { days: 120, key: 'd120', price: null, perDayFrom: null },
    { days: 180, key: 'd180', price: null, perDayFrom: null },
    { days: 270, key: 'd270', price: null, perDayFrom: null },
    { days: 360, key: 'd360', price: null, perDayFrom: null },
  ],

  claims: {
    effectiveness:        { value: null, footnoteKey: 'footnote.effectiveness-source' },
    timeToVisibleResults: { value: null, footnoteKey: 'footnote.results-timing-source' },
    rescanWindow:         { value: null, footnoteKey: null },
    doctorFollowUpCost:   { value: null, footnoteKey: null }, // TODO: confirm ROOTÉ offers follow-ups
  },

  recommendedDurationTable: {
    'mild:stabilize': 120,        'mild:regrow': 180,        'mild:stabilize-regrow': 180,
    'moderate:stabilize': 180,    'moderate:regrow': 270,    'moderate:stabilize-regrow': 270,
    'established:stabilize': 270, 'established:regrow': 360,  'established:stabilize-regrow': 360,
  } as Record<string, 90 | 120 | 180 | 270 | 360>,

  // PO #20 (2026-09-04): dashboard reorder card at end−21d; email + in-app nudge at
  // end−14d; final nudge at end−7d. International shipping may tune these later.
  reorderLeadDays: 21,
  reorderReminderLeadDays: [14, 7] as readonly number[],

  disclaimers: {
    // HE + AR/RU/FR/ES strings are a plain first-pass translation of the EN liability disclaimers; still pending formal legal review.
    medical:        { en: 'This report is a preliminary, photo-based visual assessment. It is not a medical diagnosis.', he: 'הדוח הזה הוא הערכה חזותית ראשונית המבוססת על תמונות, ואינו מהווה אבחון רפואי.', ar: 'هذا التقرير تقييم بصري أولي يعتمد على الصور. وهو ليس تشخيصاً طبياً. (تخضع لمراجعة قانونية رسمية.)', ru: 'Этот отчёт представляет собой предварительную визуальную оценку на основе фотографий. Он не является медицинским диагнозом. (Требуется официальная юридическая проверка.)', fr: 'Ce rapport est une évaluation visuelle préliminaire fondée sur des photos. Il ne constitue pas un diagnostic médical. (Sous réserve d’une révision juridique formelle.)', es: 'Este informe es una evaluación visual preliminar basada en fotos. No es un diagnóstico médico. (Sujeto a revisión jurídica formal.)' } as LocalizedText, // TODO: legal review
    notADiagnosis:  { en: 'An AI visual estimate, not a medical diagnosis.', he: 'הערכה חזותית מבוססת בינה מלאכותית, לא אבחון רפואי.', ar: 'تقدير بصري بالذكاء الاصطناعي، وليس تشخيصاً طبياً. (تخضع لمراجعة قانونية رسمية.)', ru: 'Визуальная оценка на основе ИИ, а не медицинский диагноз. (Требуется официальная юридическая проверка.)', fr: 'Une estimation visuelle par IA, non un diagnostic médical. (Sous réserve d’une révision juridique formelle.)', es: 'Una estimación visual mediante IA, no un diagnóstico médico. (Sujeto a revisión jurídica formal.)' } as LocalizedText,
    demo:           { en: 'Demo: analysis figures are illustrative; production integrates a clinical analysis provider.', he: 'הדגמה: הנתונים להמחשה בלבד; בגרסה המלאה תשולב מערכת ניתוח קלינית.', ar: 'نسخة تجريبية: أرقام التحليل توضيحية؛ تدمج النسخة الكاملة مزوّد تحليل سريري. (تخضع لمراجعة قانونية رسمية.)', ru: 'Демоверсия: показатели анализа приведены для иллюстрации; в полной версии интегрируется поставщик клинического анализа. (Требуется официальная юридическая проверка.)', fr: 'Démonstration : les chiffres de l’analyse sont donnés à titre indicatif ; la version de production intègre un prestataire d’analyse clinique. (Sous réserve d’une révision juridique formelle.)', es: 'Demostración: las cifras del análisis son ilustrativas; la versión de producción integra un proveedor de análisis clínico. (Sujeto a revisión jurídica formal.)' } as LocalizedText,
    formulaPending: { en: 'Formulation under evaluation, pending regulatory review.', he: 'הפורמולה בבחינה, בכפוף לאישור רגולטורי.', ar: 'التركيبة قيد التقييم، بانتظار المراجعة التنظيمية. (تخضع لمراجعة قانونية رسمية.)', ru: 'Формула на этапе оценки, ожидает регуляторной проверки. (Требуется официальная юридическая проверка.)', fr: 'Formulation en cours d’évaluation, en attente d’un examen réglementaire. (Sous réserve d’une révision juridique formelle.)', es: 'Formulación en evaluación, pendiente de revisión regulatoria. (Sujeto a revisión jurídica formal.)' } as LocalizedText,
  },
} as const;
