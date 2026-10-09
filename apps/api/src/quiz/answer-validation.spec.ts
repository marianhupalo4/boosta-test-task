import type { Answer } from '@adhd/shared';
import { adhdQuizV1 } from './definitions/adhd-v1';
import { AnswerValidationError, validateAnswers } from './answer-validation';

const { definition } = adhdQuizV1;

const complete: Answer[] = definition.questions.map((q) => ({
  questionKey: q.key,
  value: { optionKey: q.options[0].key },
}));

function issuesOf(answers: Answer[]): string[] {
  try {
    validateAnswers(definition, answers);
    return [];
  } catch (error) {
    if (error instanceof AnswerValidationError) return error.issues;
    throw error;
  }
}

describe('validateAnswers', () => {
  it('returns answers keyed by question for a complete submission', () => {
    const map = validateAnswers(definition, complete);
    expect(map.size).toBe(definition.questions.length);
    expect(map.get('gender')).toEqual({ optionKey: 'male' });
  });

  it('rejects missing answers', () => {
    expect(issuesOf(complete.slice(1))).toEqual([
      'missing answer for "gender"',
    ]);
  });

  it('rejects unknown questions and options', () => {
    expect(
      issuesOf([
        ...complete,
        { questionKey: 'nope', value: { optionKey: 'agree' } },
      ]),
    ).toEqual(['unknown question "nope"']);

    const badOption = complete.map((a) =>
      a.questionKey === 'gender' ? { ...a, value: { optionKey: 'agree' } } : a,
    );
    expect(issuesOf(badOption)).toEqual([
      'unknown option "agree" for "gender"',
    ]);
  });

  it('rejects duplicate answers', () => {
    expect(issuesOf([...complete, complete[0]])).toEqual([
      'duplicate answer for "gender"',
    ]);
  });
});
