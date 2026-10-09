import type { QuizDefinition } from '@adhd/shared';
import type { LikertSumParams } from '../../scoring/strategies/likert-sum.strategy';

const likertOptions = [
  { key: 'strongly_agree', label: 'Strongly agree' },
  { key: 'agree', label: 'Agree' },
  { key: 'neutral', label: 'Neutral' },
  { key: 'disagree', label: 'Disagree' },
  { key: 'strongly_disagree', label: 'Strongly Disagree' },
];

const likertQuestions = [
  [
    'time_blindness',
    'I easily lose track of time when doing something I enjoy',
  ],
  [
    'misplacing_items',
    'I often misplace things like my phone, keys, or wallet',
  ],
  ['task_completion', 'I frequently start tasks but struggle to finish them'],
  [
    'focus_conversations',
    'I find it hard to stay focused during conversations or meetings',
  ],
  [
    'forgetting_daily_tasks',
    'I often forget about daily tasks like appointments or returning calls',
  ],
] as const;

const definition: QuizDefinition = {
  questions: [
    {
      key: 'gender',
      type: 'single-choice',
      layout: 'intro',
      title: 'Discover Your ADHD Trait Profile',
      subtitle:
        'Find out how ADHD traits influence your focus, energy, and daily life',
      options: [
        { key: 'male', label: 'Male' },
        { key: 'female', label: 'Female' },
      ],
    },
    ...likertQuestions.map(([key, title]) => ({
      key,
      type: 'single-choice' as const,
      layout: 'default' as const,
      title,
      options: likertOptions,
    })),
  ],
};

const scoringParams: LikertSumParams = {
  questionKeys: likertQuestions.map(([key]) => key),
  optionWeights: {
    strongly_agree: 4,
    agree: 3,
    neutral: 2,
    disagree: 1,
    strongly_disagree: 0,
  },
  highThreshold: 60,
};

/**
 * Version 1 of the ADHD quiz. Once seeded, a version is never edited:
 * changes to questions or scoring go into a new file (adhd-v2.ts, ...).
 */
export const adhdQuizV1 = {
  quizKey: 'adhd',
  version: 1,
  reportTemplate: 'adhd-v1',
  definition,
  scoring: { strategy: 'likert-sum-v1', params: scoringParams },
};
