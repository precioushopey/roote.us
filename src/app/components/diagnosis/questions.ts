import type { Answers } from '@/domain/analysis/types';

export type QuestionId = keyof Answers;
export type Question = {
  id: QuestionId;
  promptKey: string;
  options: { value: string; labelKey: string }[];
};

export const QUESTIONS: Question[] = [
  {
    id: 'q1_area', promptKey: 'q.area.prompt',
    options: [
      { value: 'hairline', labelKey: 'q.area.hairline' },
      { value: 'crown', labelKey: 'q.area.crown' },
      { value: 'entire-scalp', labelKey: 'q.area.entire' },
    ],
  },
  {
    id: 'q2_onset', promptKey: 'q.onset.prompt',
    options: [
      { value: 'lt-1y', labelKey: 'q.onset.lt1' },
      { value: '1-5y', labelKey: 'q.onset.1to5' },
      { value: 'gt-5y', labelKey: 'q.onset.gt5' },
    ],
  },
  {
    id: 'q3_prior', promptKey: 'q.prior.prompt',
    options: [
      { value: 'never', labelKey: 'q.prior.never' },
      { value: 'no-success', labelKey: 'q.prior.nosuccess' },
      { value: 'partial', labelKey: 'q.prior.partial' },
    ],
  },
  {
    id: 'q4_family', promptKey: 'q.family.prompt',
    options: [
      { value: 'yes', labelKey: 'q.family.yes' },
      { value: 'no', labelKey: 'q.family.no' },
      { value: 'not-sure', labelKey: 'q.family.notsure' },
    ],
  },
  {
    id: 'q5_goal', promptKey: 'q.goal.prompt',
    options: [
      { value: 'stop', labelKey: 'q.goal.stop' },
      { value: 'regrow', labelKey: 'q.goal.regrow' },
      { value: 'both', labelKey: 'q.goal.both' },
    ],
  },
];
