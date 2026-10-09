import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type {
  AnswerMap,
  ScoringResult,
  ScoringStrategy,
} from './scoring.types';
import { likertSumStrategy } from './strategies/likert-sum.strategy';

const ScoringConfigSchema = z.object({
  strategy: z.string(),
  params: z.unknown(),
});

/** Every strategy ever referenced by a quiz version must stay registered. */
const STRATEGIES: ScoringStrategy<unknown>[] = [likertSumStrategy];

@Injectable()
export class ScoringService {
  private readonly strategies = new Map(STRATEGIES.map((s) => [s.key, s]));

  /** Validates a stored scoring config; used when seeding new quiz versions. */
  assertValidConfig(config: unknown): void {
    this.resolve(config);
  }

  score(
    config: unknown,
    answers: AnswerMap,
  ): ScoringResult & { strategy: string } {
    const { strategy, params } = this.resolve(config);
    return { ...strategy.score(answers, params), strategy: strategy.key };
  }

  private resolve(config: unknown) {
    const { strategy: key, params } = ScoringConfigSchema.parse(config);
    const strategy = this.strategies.get(key);
    if (!strategy) {
      throw new Error(`Unknown scoring strategy "${key}"`);
    }
    return { strategy, params: strategy.paramsSchema.parse(params) };
  }
}
