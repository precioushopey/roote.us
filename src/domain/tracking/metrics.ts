import type { HairAnalysis } from '@/domain/analysis/types';
import type { GrayProfile } from '@/domain/analysis/grayProfile';
import type { HairMetric, MetricKey } from './types';

/**
 * Qualitative-first metrics (spec §6/§7 — locked decision: no numbers until a
 * real provider). Turns the deterministic analysis + gray profile into a set of
 * `HairMetric`s whose `status` is an i18n key and whose `value`/`unit` stay
 * null. A real provider fills `value` and sets `isMock: false`.
 */
const LEVEL_STATUS_KEY: Record<'low' | 'medium' | 'high', string> = {
  low: 'app.metric.level.low',
  medium: 'app.metric.level.medium',
  high: 'app.metric.level.high',
};

const METRIC_FROM_ANALYSIS_KEY: Partial<Record<MetricKey, string>> = {
  'hair-density': 'relative-density',
  'visible-thinning': 'pattern-stage',
  'scalp-condition': 'thickness-caliber',
  'loss-area': 'scalp-visibility',
};

export function qualitativeMetrics(input: {
  analysis: HairAnalysis | null;
  grayProfile?: GrayProfile | null;
  provider: string;
  isMock: boolean;
  capturedAt: string;
}): HairMetric[] {
  const { analysis, grayProfile, provider, isMock, capturedAt } = input;
  const out: HairMetric[] = [];
  const push = (key: MetricKey, statusKey: string) =>
    out.push({ key, status: statusKey, value: null, unit: null, provider, isMock, confidence: null, capturedAt });

  if (analysis) {
    for (const [metricKey, analysisKey] of Object.entries(METRIC_FROM_ANALYSIS_KEY) as [MetricKey, string][]) {
      const m = analysis.metrics.find((x) => x.key === analysisKey);
      push(metricKey, m ? LEVEL_STATUS_KEY[m.level] : 'app.metric.level.unknown');
    }
    push('hairline', `severity.${analysis.severityBand}`);
  }
  if (grayProfile) {
    push('gray-pattern', grayProfile.summaryKey);
  }
  return out;
}

/** Pair a baseline metric with the latest scan's metric for the same key. */
export function compareMetric(
  baseline: HairMetric | undefined,
  latest: HairMetric | undefined,
): { key: MetricKey; baselineStatus: string | null; latestStatus: string | null; numericChange: number | null } {
  const key = (latest?.key ?? baseline?.key) as MetricKey;
  const numericChange =
    baseline?.value != null && latest?.value != null && !baseline.isMock && !latest.isMock
      ? latest.value - baseline.value
      : null;
  return {
    key,
    baselineStatus: baseline?.status ?? null,
    latestStatus: latest?.status ?? null,
    numericChange,
  };
}
