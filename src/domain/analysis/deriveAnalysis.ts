import type {
  Answers, Gender, HairAnalysis, HairGoal, Level, PlanEmphasis, SeverityBand, ZoneKey,
} from './types';

export const RECOMMENDED_DURATION_TABLE: Record<string, HairAnalysis['recommendedDurationDays']> = {
  'mild:stabilize': 120, 'mild:regrow': 180, 'mild:stabilize-regrow': 180,
  'moderate:stabilize': 180, 'moderate:regrow': 270, 'moderate:stabilize-regrow': 270,
  'established:stabilize': 270, 'established:regrow': 360, 'established:stabilize-regrow': 360,
};

const ALL_ZONES: ZoneKey[] = ['frontal-hairline', 'temples', 'mid-scalp', 'crown-vertex'];

/** Q12 buckets collapse to 3 severity bands — the two "under a year" buckets are
 *  finer-grained context for the report/recommendation layer, not extra severity
 *  resolution (client confirmed Q12 is context-only re: the 6/10/15 mapping). */
export function severityFromOnset(onset: Answers['q2_onset']): SeverityBand {
  if (onset === 'lt-6mo' || onset === '6-12mo') return 'mild';
  return onset === '1-3y' ? 'moderate' : 'established';
}

const sevIndex: Record<SeverityBand, number> = { mild: 0, moderate: 1, established: 2 };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function zonesForArea(area: Answers['q1_area']): ZoneKey[] {
  if (area === 'hairline') return ['frontal-hairline', 'temples'];
  if (area === 'crown') return ['crown-vertex'];
  return [...ALL_ZONES];
}

/** Hair Goal replaces the old q5_goal question (client confirmed Goal already
 *  distinguishes Stop Hair Loss from Hair Growth, so a separate goal question
 *  inside the thinning branch would be redundant). */
function emphasisForGoal(goal: HairGoal): PlanEmphasis {
  if (goal === 'stop-loss') return 'stabilize';
  if (goal === 'hair-growth') return 'regrow';
  return 'stabilize-regrow'; // thicker-fuller, other
}

export function deriveAnalysis(input: { gender: Gender; hairGoal: HairGoal; answers: Answers }): HairAnalysis {
  const { gender, hairGoal, answers } = input;
  const scale = gender === 'female' ? 'ludwig' : 'norwood'; // male + unspecified → Norwood (PO #24)
  const severityBand = severityFromOnset(answers.q2_onset);

  // Applies to both scales — Ludwig now spans 1–4 so it can carry the F1–F4
  // pattern codes the client's Hair Growth strength table is keyed on.
  const bump = answers.q1_area === 'entire-scalp' ? 1 : 0;
  const stage =
    scale === 'norwood'
      ? clamp(2 + sevIndex[severityBand] + bump, 2, 6)
      : clamp(1 + sevIndex[severityBand] + bump, 1, 4);

  const flaggedZoneKeys = zonesForArea(answers.q1_area);
  const zoneSeverity: 'mild' | 'moderate' = severityBand === 'mild' ? 'mild' : 'moderate';

  const flaggedZones = flaggedZoneKeys.map((zone) => ({
    zone,
    severity: zoneSeverity,
    noteKey: `zone-note.${zone}`,
  }));

  const densityByZone = ALL_ZONES.map((zone) => {
    const flagged = flaggedZoneKeys.includes(zone);
    const level: Level = flagged
      ? zoneSeverity === 'mild' ? 'medium' : 'low'
      : severityBand === 'established' ? 'medium' : 'high';
    return { zone, level };
  });

  const flaggedCount = flaggedZoneKeys.length;
  const metrics: { key: string; level: Level }[] = [
    { key: 'pattern-stage', level: severityBand === 'mild' ? 'low' : severityBand === 'moderate' ? 'medium' : 'high' },
    { key: 'relative-density', level: severityBand === 'mild' ? 'high' : severityBand === 'moderate' ? 'medium' : 'low' },
    { key: 'thickness-caliber', level: severityBand === 'established' ? 'low' : 'medium' },
    { key: 'scalp-visibility', level: flaggedCount >= 3 ? 'high' : flaggedCount === 2 ? 'medium' : 'low' },
  ];

  const notes: string[] = [];
  notes.push(
    answers.q3_prior === 'never' ? 'note.treatment-naive'
      : answers.q3_prior === 'no-success' ? 'note.prior-no-response'
        : 'note.prior-partial',
  );
  notes.push(
    answers.q4_family === 'yes' ? 'note.family-history-positive'
      : answers.q4_family === 'not-sure' ? 'note.family-history-unknown'
        : 'note.family-history-negative',
  );

  const planEmphasis = emphasisForGoal(hairGoal);
  const recommendedDurationDays = RECOMMENDED_DURATION_TABLE[`${severityBand}:${planEmphasis}`];
  const summaryPlainKey = `summary.${scale}.${severityBand}`;

  return {
    scale, stage, severityBand, flaggedZones, densityByZone, metrics,
    notes, planEmphasis, summaryPlainKey, recommendedDurationDays,
  };
}
