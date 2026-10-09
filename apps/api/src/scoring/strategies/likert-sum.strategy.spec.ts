import { adhdQuizV1 } from '../../quiz/definitions/adhd-v1';
import type { AnswerMap } from '../scoring.types';
import { likertSumStrategy, type LikertSumParams } from './likert-sum.strategy';

const params = adhdQuizV1.scoring.params;

function answersWith(optionKeys: string[]): AnswerMap {
  return new Map([
    ['gender', { optionKey: 'male' }],
    ...params.questionKeys.map(
      (key, i) => [key, { optionKey: optionKeys[i] }] as const,
    ),
  ]);
}

describe('likert-sum-v1', () => {
  it('scores all "strongly agree" as 100 / high', () => {
    const result = likertSumStrategy.score(
      answersWith(Array(5).fill('strongly_agree')),
      params,
    );
    expect(result).toMatchObject({
      score: 100,
      maxScore: 100,
      outcome: 'high',
    });
  });

  it('scores all "strongly disagree" as 0 / low', () => {
    const result = likertSumStrategy.score(
      answersWith(Array(5).fill('strongly_disagree')),
      params,
    );
    expect(result).toMatchObject({ score: 0, outcome: 'low' });
  });

  it('treats the threshold as inclusive', () => {
    // 3 + 3 + 2 + 2 + 2 = 12 of 20 -> 60
    const atThreshold = likertSumStrategy.score(
      answersWith(['agree', 'agree', 'neutral', 'neutral', 'neutral']),
      params,
    );
    expect(atThreshold).toMatchObject({ score: 60, outcome: 'high' });

    // 11 of 20 -> 55
    const below = likertSumStrategy.score(
      answersWith(['agree', 'neutral', 'neutral', 'neutral', 'neutral']),
      params,
    );
    expect(below).toMatchObject({ score: 55, outcome: 'low' });
  });

  it('ignores answers to non-scored questions', () => {
    const a = answersWith(Array(5).fill('agree'));
    const b = new Map(a).set('gender', { optionKey: 'female' });
    expect(likertSumStrategy.score(a, params).score).toBe(
      likertSumStrategy.score(b, params).score,
    );
  });

  it('fails loudly when a scored answer has no weight', () => {
    const custom: LikertSumParams = { ...params, questionKeys: ['missing'] };
    expect(() => likertSumStrategy.score(new Map(), custom)).toThrow(/missing/);
  });
});
