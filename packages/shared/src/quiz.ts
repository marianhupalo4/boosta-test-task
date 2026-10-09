import { z } from 'zod';

export const QuestionOptionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
});

/**
 * `layout` only affects presentation: `intro` questions are rendered as a
 * landing screen and are not counted in the step progress.
 */
export const QuestionSchema = z.object({
  key: z.string().min(1),
  type: z.literal('single-choice'),
  layout: z.enum(['intro', 'default']).default('default'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  options: z.array(QuestionOptionSchema).min(1),
});

export const QuizDefinitionSchema = z.object({
  questions: z.array(QuestionSchema).min(1),
});

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuizDefinition = z.infer<typeof QuizDefinitionSchema>;

/** Public shape of a quiz version. Never contains scoring weights. */
export interface QuizDto {
  id: string;
  quizKey: string;
  version: number;
  questions: Question[];
}
