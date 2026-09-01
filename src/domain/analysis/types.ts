export type Gender = 'male' | 'female';
export type ZoneKey = 'frontal-hairline' | 'temples' | 'mid-scalp' | 'crown-vertex';
export type Level = 'low' | 'medium' | 'high';
export type SeverityBand = 'mild' | 'moderate' | 'established';
export type PlanEmphasis = 'stabilize' | 'regrow' | 'stabilize-regrow';

export type Answers = {
  q1_area: 'hairline' | 'crown' | 'entire-scalp';
  q2_onset: 'lt-1y' | '1-5y' | 'gt-5y';
  q3_prior: 'never' | 'no-success' | 'partial';
  q4_family: 'yes' | 'no' | 'not-sure';
  q5_goal: 'stop' | 'regrow' | 'both';
};

export type HairAnalysis = {
  scale: 'norwood' | 'ludwig';
  stage: number;
  severityBand: SeverityBand;
  flaggedZones: { zone: ZoneKey; severity: 'mild' | 'moderate'; noteKey: string }[];
  densityByZone: { zone: ZoneKey; level: Level }[];
  metrics: { key: string; level: Level }[];
  notes: string[];
  planEmphasis: PlanEmphasis;
  summaryPlainKey: string;
  recommendedDurationDays: 90 | 120 | 180 | 270 | 360;
};
