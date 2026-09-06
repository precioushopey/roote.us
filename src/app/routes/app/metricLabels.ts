import type { MessageKey } from '@/i18n/messages';

/** Metric key → i18n label, shared by the Baseline, Scans, and Progress screens. */
export const METRIC_LABEL: Record<string, MessageKey> = {
  'hair-density': 'analysis.results.rowDensity',
  'visible-thinning': 'app.metric.key.visibleThinning',
  hairline: 'app.metric.key.hairline',
  'loss-area': 'app.metric.key.lossArea',
  'scalp-condition': 'app.metric.key.scalpCondition',
  'gray-pattern': 'analysis.results.rowStage',
};

export const METRIC_LABEL_FALLBACK: MessageKey = 'analysis.results.rowProgression';
