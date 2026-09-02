export type LocalizedText = { en: string; he: string };

export const rooteContent = {
  brand: {
    name: 'ROOTÉ',
    domain: 'ROOTÉ.US',
    tagline: { en: 'Personalized Hair Growth System', he: 'מערכת אישית לצמיחת שיער' } as LocalizedText,
  },

  currency: 'ILS', // TODO: confirm with client — ILS vs USD

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

  treatments: {
    core: [
      {
        key: 'roote-topical',
        name: { en: 'ROOTÉ Topical Formula', he: 'תרחיף ROOTÉ לקרקפת' } as LocalizedText, // TODO: confirm medical HE
        form: 'topical' as const,
        usageKey: 'usage.apply-scalp-affected',
        frequencyKey: 'frequency.twice-daily',
        appliesToZones: ['frontal-hairline', 'temples', 'crown-vertex'] as const,
      },
    ],
    supporting: [
      // TODO: confirm with client — identity of the supporting treatment(s)
      { key: 'derma-stim', name: { en: 'Scalp stimulation routine', he: '' } as LocalizedText, usageKey: 'usage.derma-stim', frequencyKey: 'frequency.weekly' },
      { key: 'cleanser',   name: { en: 'Gentle scalp cleanser',     he: '' } as LocalizedText, usageKey: 'usage.cleanse',    frequencyKey: 'frequency.daily' },
    ],
  },

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

  reorderLeadDays: 21, // TODO: confirm with client

  disclaimers: {
    // HE strings are a plain translation of the EN liability disclaimers; still pending formal legal review.
    medical:        { en: 'This report is a preliminary, photo-based visual assessment. It is not a medical diagnosis.', he: 'הדוח הזה הוא הערכה חזותית ראשונית המבוססת על תמונות, ואינו מהווה אבחון רפואי.' } as LocalizedText, // TODO: legal review
    notADiagnosis:  { en: 'An AI visual estimate, not a medical diagnosis.', he: 'הערכה חזותית מבוססת בינה מלאכותית, לא אבחון רפואי.' } as LocalizedText,
    demo:           { en: 'Demo: analysis figures are illustrative; production integrates hairhealth.ai.', he: 'הדגמה: הנתונים להמחשה בלבד.' } as LocalizedText,
    formulaPending: { en: 'Formulation under evaluation, pending regulatory review.', he: 'הפורמולה בבחינה, בכפוף לאישור רגולטורי.' } as LocalizedText,
  },
} as const;
