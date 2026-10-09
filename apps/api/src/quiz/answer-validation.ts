import type { Answer, QuizDefinition } from '@adhd/shared';
import type { AnswerMap } from '../scoring/scoring.types';

export class AnswerValidationError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid answers: ${issues.join('; ')}`);
  }
}

/**
 * Checks submitted answers against the exact quiz version they were given for:
 * every question answered once, only known questions and options.
 */
export function validateAnswers(
  definition: QuizDefinition,
  answers: Answer[],
): AnswerMap {
  const issues: string[] = [];
  const questions = new Map(definition.questions.map((q) => [q.key, q]));
  const result = new Map<string, Answer['value']>();

  for (const { questionKey, value } of answers) {
    const question = questions.get(questionKey);
    if (!question) {
      issues.push(`unknown question "${questionKey}"`);
    } else if (result.has(questionKey)) {
      issues.push(`duplicate answer for "${questionKey}"`);
    } else if (!question.options.some((o) => o.key === value.optionKey)) {
      issues.push(`unknown option "${value.optionKey}" for "${questionKey}"`);
    } else {
      result.set(questionKey, value);
    }
  }

  for (const key of questions.keys()) {
    if (!result.has(key) && !answers.some((a) => a.questionKey === key)) {
      issues.push(`missing answer for "${key}"`);
    }
  }

  if (issues.length) {
    throw new AnswerValidationError(issues);
  }
  return result;
}
