export const en = {
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.start': 'Start',
  'brand.tagline': 'Personalized Hair Growth System',
  'locale.toggle.toHe': 'עברית',
  'locale.toggle.toEn': 'English',

  'landing.eyebrow': 'Personalized Hair Growth System',
  'landing.cta': 'Start Free Diagnosis',

  'scale.norwood.label': 'Norwood–Hamilton scale',
  'scale.ludwig.label': 'Ludwig scale',

  'severity.mild': 'Early',
  'severity.moderate': 'Moderate',
  'severity.established': 'Established',

  'zone.frontal-hairline': 'Frontal hairline',
  'zone.temples': 'Temples',
  'zone.mid-scalp': 'Mid-scalp',
  'zone.crown-vertex': 'Crown / vertex',

  'zone-note.frontal-hairline': 'Recession visible along the frontal hairline.',
  'zone-note.temples': 'Both temple corners have moved back.',
  'zone-note.mid-scalp': 'Reduced coverage across the mid-scalp.',
  'zone-note.crown-vertex': 'Thinning at the crown, with scalp show-through.',

  'metric.pattern-stage': 'Pattern stage',
  'metric.relative-density': 'Relative density',
  'metric.thickness-caliber': 'Thickness / caliber',
  'metric.scalp-visibility': 'Scalp visibility',

  'note.treatment-naive': 'No prior hair-loss treatment.',
  'note.prior-no-response': 'Previous treatment without a noticeable response.',
  'note.prior-partial': 'Previous treatment with partial improvement.',
  'note.family-history-positive': 'Family history of hair loss reported.',
  'note.family-history-unknown': 'Family history uncertain.',
  'note.family-history-negative': 'No reported family history of hair loss.',

  'summary.norwood.mild': 'An early, patterned thinning localised to a few areas. Strand quality still appears healthy.',
  'summary.norwood.moderate': 'A patterned thinning that is now well established in the flagged areas.',
  'summary.norwood.established': 'A long-standing patterned thinning with visible scalp across several zones.',
  'summary.ludwig.mild': 'Early diffuse thinning, most visible along the part.',
  'summary.ludwig.moderate': 'Diffuse thinning with a widening part and reduced volume.',
  'summary.ludwig.established': 'Pronounced diffuse thinning across the mid-scalp.',

  'diagnosis.rail.intro': 'Intro',
  'diagnosis.rail.gender': 'You',
  'diagnosis.rail.photos': 'Photos',
  'diagnosis.rail.analysis': 'Analysis',
  'diagnosis.rail.results': 'Results',
} as const;

export type MessageKey = keyof typeof en;
