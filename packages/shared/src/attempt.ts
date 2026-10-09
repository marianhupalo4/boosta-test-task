import { z } from 'zod';

/** Stored as JSONB, so new answer kinds can be added without migrations. */
export const AnswerValueSchema = z.object({
  optionKey: z.string().min(1),
});

export const AnswerSchema = z.object({
  questionKey: z.string().min(1),
  value: AnswerValueSchema,
});

export const SubmitAttemptSchema = z.object({
  quizVersionId: z.uuid(),
  answers: z.array(AnswerSchema).min(1).max(200),
});

export type AnswerValue = z.infer<typeof AnswerValueSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type SubmitAttemptInput = z.infer<typeof SubmitAttemptSchema>;

export interface SubmitAttemptResponse {
  attemptId: string;
  /** false when the attempt is already linked to a signed-in user */
  requiresAccount: boolean;
}
