export type LocalizedText = { en: string; he: string };

export const rooteContent = {
  brand: {
    name: 'ROOTÉ',
    domain: 'ROOTÉ.US',
    tagline: { en: 'Personalized Hair Growth System', he: 'מערכת אישית לצמיחת שיער' } as LocalizedText,
  },

  /**
   * The legal entity that operates the ROOTÉ brand. Locale-invariant facts live here;
   * the surrounding labels + legal prose are i18n keys (`marketing.legal.company.*`,
   * `marketing.legalSale.*`). Rendered by <CompanyDetails> on /terms and /terms-of-sale,
   * and as the entity line in the site footer.
   */
  company: {
    legalName: '91 ENTERPRISE LLC',
    representative: 'Asher Elimelech',
    address: ['PO BOX 48112', 'Los Angeles, CA 90036', 'United States'] as readonly string[],
    registrationNumber: '201403110138',
    ein: '46-4692938',
    incorporated: 'January 30, 2014', // TODO: confirm display format / HE localization with client
    legalUpdated: 'September 3, 2026', // "last updated" date shown on the legal pages
    support: {
      email: 'support@roote.us',
      phone: '+1 (310) 651-7283',
      phoneHref: 'tel:+13106517283',
    },
  },

  // PO #3 (2026-09-04): launch currencies are USD + ILS (en-US→USD, he-IL→ILS);
  // GBP with UK commerce, EUR later, no RUB at launch. This is the fallback when
  // no country/locale is resolved — see i18n/locales `launchCurrencyFor`.
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

  // PO #5 / #15 (2026-09-04): every treatment product, keyed by slug — the single
  // source of truth for display (name/usage/frequency/zones). WHICH keys apply to
  // a given customer is a *concern-branched* decision, resolved by
  // `domain/recommendation/recommend()` + `planKeysFor()` (rules.ts), never by
  // reading this whole registry — a gray-only customer gets Gray Support + Gray
  // Serum and no Density component; a thinning customer gets Density + Regrowth
  // Shampoo and no gray products; "both" gets all of it. Do not auto-stack a
  // Density topical + Gray Serum: [PENDING CLINICAL COMPATIBILITY REVIEW].
  treatmentRegistry: {
    'density-6': {
      name: { en: 'ROOTÉ Density 6', he: 'ROOTÉ דנסיטי 6' } as LocalizedText, // TODO: confirm medical HE
      form: 'topical' as const,
      usageKey: 'usage.apply-scalp-affected',
      frequencyKey: 'frequency.daily-evening',
      appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
    },
    'density-10': {
      name: { en: 'ROOTÉ Density 10', he: 'ROOTÉ דנסיטי 10' } as LocalizedText,
      form: 'topical' as const,
      usageKey: 'usage.apply-scalp-affected',
      frequencyKey: 'frequency.daily-evening',
      appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
    },
    'density-15': {
      name: { en: 'ROOTÉ Density 15', he: 'ROOTÉ דנסיטי 15' } as LocalizedText,
      form: 'topical' as const,
      usageKey: 'usage.apply-scalp-affected',
      frequencyKey: 'frequency.daily-evening',
      appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
    },
    'regrowth-shampoo': {
      name: { en: 'ROOTÉ Regrowth Shampoo', he: 'שמפו ROOTÉ ריגרות׳' } as LocalizedText,
      form: 'shampoo' as const,
      usageKey: 'usage.cleanse',
      frequencyKey: 'frequency.wash-day',
    },
    'gray-support': {
      name: { en: 'ROOTÉ Gray Support', he: 'ROOTÉ גריי סאפורט' } as LocalizedText, // TODO: confirm medical HE
      form: 'capsule' as const,
      usageKey: 'usage.gray-support',
      frequencyKey: 'frequency.daily-morning',
    },
    'gray-serum': {
      name: { en: 'ROOTÉ Gray Serum', he: 'סרום ROOTÉ גריי' } as LocalizedText, // TODO: confirm medical HE
      form: 'serum' as const,
      usageKey: 'usage.gray-serum',
      frequencyKey: 'frequency.daily-evening',
    },
    'derma-stim': {
      name: { en: 'Scalp-care guidance (optional)', he: 'הנחיות לטיפוח הקרקפת (רשות)' } as LocalizedText,
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
    // HE strings are a plain translation of the EN liability disclaimers; still pending formal legal review.
    medical:        { en: 'This report is a preliminary, photo-based visual assessment. It is not a medical diagnosis.', he: 'הדוח הזה הוא הערכה חזותית ראשונית המבוססת על תמונות, ואינו מהווה אבחון רפואי.' } as LocalizedText, // TODO: legal review
    notADiagnosis:  { en: 'An AI visual estimate, not a medical diagnosis.', he: 'הערכה חזותית מבוססת בינה מלאכותית, לא אבחון רפואי.' } as LocalizedText,
    demo:           { en: 'Demo: analysis figures are illustrative; production integrates hairhealth.ai.', he: 'הדגמה: הנתונים להמחשה בלבד; בגרסה המלאה משולבת מערכת hairhealth.ai.' } as LocalizedText,
    formulaPending: { en: 'Formulation under evaluation, pending regulatory review.', he: 'הפורמולה בבחינה, בכפוף לאישור רגולטורי.' } as LocalizedText,
  },
} as const;
