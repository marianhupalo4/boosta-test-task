import { z } from 'zod';
import type {
  AnswerMap,
  ScoringResult,
  ScoringStrategy,
} from '../scoring.types';

const LikertSumParamsSchema = z.object({
  /** Questions that contribute to the score; other answers (e.g. gender) are ignored. */
  questionKeys: z.array(z.string()).min(1),
  optionWeights: z.record(z.string(), z.number().min(0)),
  /** Normalized score (0..100) at or above which the outcome is `high`. */
  highThreshold: z.number().min(0).max(100),
});

export type LikertSumParams = z.infer<typeof LikertSumParamsSchema>;

const MAX_SCORE = 100;

/**
 * Sums option weights of the scored questions and normalizes the sum to 0..100.
 */
export const likertSumStrategy: ScoringStrategy<LikertSumParams> = {
  key: 'likert-sum-v1',
  paramsSchema: LikertSumParamsSchema,

  score(answers: AnswerMap, params: LikertSumParams): ScoringResult {
    const maxWeight = Math.max(...Object.values(params.optionWeights));
    const perQuestion: Record<string, number> = {};

    for (const questionKey of params.questionKeys) {
      const optionKey = answers.get(questionKey)?.optionKey;
      const weight =
        optionKey === undefined ? undefined : params.optionWeights[optionKey];
      if (weight === undefined) {
        throw new Error(
          `likert-sum-v1: no weight for answer to "${questionKey}"`,
        );
      }
      perQuestion[questionKey] = weight;
    }

    const rawScore = Object.values(perQuestion).reduce((a, b) => a + b, 0);
    const rawMax = params.questionKeys.length * maxWeight;
    const score = Math.round((rawScore / rawMax) * MAX_SCORE);

    return {
      outcome: score >= params.highThreshold ? 'high' : 'low',
      score,
      maxScore: MAX_SCORE,
      details: { rawScore, rawMax, perQuestion },
    };
  },
};
