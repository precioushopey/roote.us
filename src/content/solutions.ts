import { L, type LocalizedText } from './localized';
import type { ProgramKind } from './programs';

/**
 * Solution pages (brief §18 thinning, §19 gray). Each educates, then routes to
 * the assessment — "Start free hair analysis" is the primary action, exploring
 * the system is secondary. Severity levels are an *assessment visualization*
 * only and are never mapped to a specific Density tier (brief §7, §9).
 */

export type MediaSlot = { id: string; alt: string; label: string; ratio: string };

export type SeverityLevel = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
};

export type Solution = {
  slug: 'thinning' | 'gray-hair';
  concern: 'thinning' | 'gray';
  hero: { eyebrow: LocalizedText; title: LocalizedText; body: LocalizedText };
  /** Sub-areas of the concern to explain (brief §18/§19). */
  education: Array<{ id: string; title: LocalizedText; body: LocalizedText }>;
  severityHeading: LocalizedText;
  severityNote: LocalizedText;
  severityLevels: SeverityLevel[];
  relatedProgram: ProgramKind;
  relatedProducts: string[];
  media: MediaSlot[];
};

export const SOLUTIONS: Solution[] = [
  {
    slug: 'thinning',
    concern: 'thinning',
    hero: {
      eyebrow: L('Hair thinning', 'שיער דליל'),
      title: L('Understand your hair density before choosing a treatment.', 'להבין את צפיפות השיער לפני שבוחרים טיפול.'),
      body: L(
        'Thinning shows up differently at the hairline, the crown, and across the whole scalp. Start with an analysis, then look at the Density system.',
        'דלילות מתבטאת אחרת בקו השיער, בקודקוד ובכל הקרקפת. מתחילים באבחון, ואז בוחנים את מערכת Density.',
      ),
    },
    education: [
      { id: 'hairline', title: L('Hairline', 'קו השיער'), body: L('Recession at the temples and the frontal edge.', 'נסיגה ברקות ובקצה הקדמי.') },
      { id: 'crown', title: L('Crown', 'קודקוד'), body: L('Thinning that starts at the vertex and widens outward.', 'דלילות שמתחילה בקודקוד ומתרחבת החוצה.') },
      { id: 'diffuse', title: L('Diffuse thinning', 'דלילות מפוזרת'), body: L('A general loss of density spread across the scalp.', 'ירידה כללית בצפיפות המתפרשת על כל הקרקפת.') },
    ],
    severityHeading: L('Different stages call for different decisions.', 'שלבים שונים מצריכים החלטות שונות.'),
    severityNote: L(
      'These are ways to picture your assessment, not a prescription. Treatment strength and eligibility are set by approved recommendation criteria.',
      'אלה דרכים להמחיש את ההערכה, לא מרשם. עוצמת הטיפול וההתאמה נקבעות לפי קריטריוני המלצה מאושרים.',
    ),
    severityLevels: [
      { id: 'higher', title: L('Higher remaining density', 'צפיפות שנותרה גבוהה'), description: L('Minimal loss so far, early or localized only.', 'אובדן מועט בלבד, מוקדם או מקומי.') },
      { id: 'moderate', title: L('Moderate density loss', 'אובדן צפיפות בינוני'), description: L('A visible reduction across one or more areas.', 'ירידה נראית לעין באזור אחד או יותר.') },
      { id: 'advanced', title: L('Advanced density loss', 'אובדן צפיפות מתקדם'), description: L('Density is reduced across most of the scalp.', 'הצפיפות מופחתת ברוב הקרקפת.') },
    ],
    relatedProgram: 'density',
    relatedProducts: ['density-6', 'density-10', 'density-15', 'regrowth-shampoo'],
    media: [
      { id: 'hairline', alt: 'Close crop of a receding hairline at the temple, no face', label: 'Hairline recession, clinical crop, no face', ratio: '4 / 3' },
      { id: 'crown', alt: 'Close crop of thinning at the crown', label: 'Crown thinning, clinical crop', ratio: '4 / 3' },
      { id: 'diffuse', alt: 'Close crop of a widened part line showing diffuse thinning', label: 'Diffuse thinning at the part line', ratio: '4 / 3' },
      { id: 'family', alt: 'The Density 6, 10 and 15 bottles together', label: 'Density 6 / 10 / 15 product family', ratio: '16 / 10' },
    ],
  },
  {
    slug: 'gray-hair',
    concern: 'gray',
    hero: {
      eyebrow: L('Gray hair', 'שיער אפור'),
      title: L('Understand what is changing at the root.', 'להבין מה משתנה בשורש.'),
      body: L(
        'Graying is a change in pigment at the follicle. The Gray system pairs a daily supplement with a topical serum — a routine, not a promise.',
        'האפרה היא שינוי בפיגמנט בזקיק. מערכת Gray משלבת תוסף יומי עם סרום מקומי — שגרה, לא הבטחה.',
      ),
    },
    education: [
      { id: 'progression', title: L('Visible progression', 'התקדמות נראית'), body: L('Where gray appears first and how it spreads over time.', 'היכן מופיע האפור תחילה ואיך הוא מתפשט עם הזמן.') },
      { id: 'pigmentation', title: L('Pigmentation', 'פיגמנטציה'), body: L('The pigment-producing activity at the base of the hair.', 'הפעילות המייצרת פיגמנט בבסיס השערה.') },
      { id: 'routine', title: L('A long-term routine', 'שגרה ארוכת טווח'), body: L('An inside supplement and a topical serum, used consistently.', 'תוסף מבפנים וסרום מקומי, בשימוש עקבי.') },
    ],
    severityHeading: L('Gray hair deserves its own system.', 'שיער אפור ראוי למערכת משלו.'),
    severityNote: L(
      'A coordinated inside + topical routine for managing the appearance of gray. It is not a claim to restore lost pigment.',
      'שגרה מתואמת מבפנים ומבחוץ לניהול מראה השיער האפור. אין בכך טענה להשבת פיגמנט שאבד.',
    ),
    severityLevels: [
      { id: 'early', title: L('Early', 'מוקדם'), description: L('A few gray strands, usually at the temples.', 'מספר שערות אפורות, בדרך כלל ברקות.') },
      { id: 'moderate', title: L('Moderate', 'בינוני'), description: L('Gray is noticeable across the crown and top.', 'האפור בולט בקודקוד ובחלק העליון.') },
      { id: 'advanced', title: L('Advanced', 'מתקדם'), description: L('Gray is distributed throughout the hair.', 'האפור מפוזר בכל השיער.') },
    ],
    relatedProgram: 'gray',
    relatedProducts: ['gray-support', 'gray-serum'],
    media: [
      { id: 'root', alt: 'Macro photograph of a gray hair at the root against the scalp', label: 'Gray root macro', ratio: '4 / 3' },
      { id: 'support', alt: 'The Gray Support supplement bottle', label: 'Gray Support supplement', ratio: '1' },
      { id: 'serum', alt: 'The Gray Serum bottle', label: 'Gray Serum', ratio: '1' },
      { id: 'system', alt: 'Gray Support and Gray Serum shown together as a bundle', label: 'The Gray system bundle', ratio: '16 / 10' },
    ],
  },
];

const BY_SLUG: Record<string, Solution> = Object.fromEntries(SOLUTIONS.map((s) => [s.slug, s]));

export function getSolution(slug: string): Solution | undefined {
  return BY_SLUG[slug];
}
