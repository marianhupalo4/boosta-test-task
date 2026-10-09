import type { AnswerValue, Outcome } from '@adhd/shared';
import type { z } from 'zod';

/** Answers of one attempt keyed by stable question key. */
export type AnswerMap = ReadonlyMap<string, AnswerValue>;

export interface ScoringResult {
  outcome: Outcome;
  /** Normalized score, 0..maxScore. */
  score: number;
  maxScore: number;
  details: Record<string, unknown>;
}

export interface ScoringStrategy<TParams = unknown> {
  /** Referenced from QuizVersion.scoring.strategy. Never reuse a key for different logic. */
  readonly key: string;
  readonly paramsSchema: z.ZodType<TParams>;
  score(answers: AnswerMap, params: TParams): ScoringResult;
}
