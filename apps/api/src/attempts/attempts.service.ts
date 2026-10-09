import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AnswerValueSchema, type SubmitAttemptInput } from '@adhd/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnswerValidationError,
  validateAnswers,
} from '../quiz/answer-validation';
import { QuizService } from '../quiz/quiz.service';
import { ReportBuilderService } from '../reports/report-builder.service';
import type { PastAttempt } from '../reports/report.types';
import { ScoringService } from '../scoring/scoring.service';
import type { AnswerMap } from '../scoring/scoring.types';
import { createClaimToken, hashClaimToken } from './claim-token';

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizzes: QuizService,
    private readonly scoring: ScoringService,
    private readonly reports: ReportBuilderService,
  ) {}

  /**
   * Validates, scores and stores a completed attempt together with a snapshot
   * of its report. Anonymous attempts get a claim token instead of an owner.
   */
  async submit(input: SubmitAttemptInput, userId: string | null) {
    const quizVersion = await this.quizzes.getVersion(input.quizVersionId);
    if (quizVersion.status !== 'active') {
      throw new ConflictException({
        message: 'This version of the quiz is no longer available',
        code: 'QUIZ_VERSION_OUTDATED',
      });
    }

    let answers: AnswerMap;
    try {
      answers = validateAnswers(quizVersion.definition, input.answers);
    } catch (error) {
      if (error instanceof AnswerValidationError) {
        throw new BadRequestException({
          message: 'Invalid answers',
          errors: error.issues,
        });
      }
      throw error;
    }

    const result = this.scoring.score(quizVersion.scoring, answers);
    const report = await this.reports.build(quizVersion.reportTemplate, {
      answers,
      result,
      loadHistory: () =>
        userId ? this.loadHistory(userId) : Promise.resolve([]),
    });
    const claim = userId ? null : createClaimToken();

    const attempt = await this.prisma.attempt.create({
      data: {
        quizVersionId: quizVersion.id,
        userId,
        claimTokenHash: claim?.hash,
        answers: {
          create: [...answers].map(([questionKey, value]) => ({
            questionKey,
            value,
          })),
        },
        result: {
          create: {
            strategy: result.strategy,
            outcome: result.outcome,
            score: result.score,
            maxScore: result.maxScore,
            details: result.details as Prisma.InputJsonObject,
          },
        },
        report: {
          create: {
            template: report.template,
            templateVersion: report.templateVersion,
            sections: report.sections as unknown as Prisma.InputJsonArray,
          },
        },
      },
      select: { id: true },
    });

    return { attemptId: attempt.id, claimToken: claim?.token };
  }

  /** Links an anonymous attempt to the user, making it their latest result. */
  async claim(
    tx: Prisma.TransactionClient,
    userId: string,
    claimToken: string | undefined,
  ): Promise<void> {
    if (!claimToken) return;
    await tx.attempt.updateMany({
      where: { claimTokenHash: hashClaimToken(claimToken), userId: null },
      data: { userId, claimTokenHash: null },
    });
  }

  private async loadHistory(userId: string): Promise<PastAttempt[]> {
    const attempts = await this.prisma.attempt.findMany({
      where: { userId, result: { isNot: null } },
      orderBy: { completedAt: 'desc' },
      include: { answers: true, result: true, quizVersion: true },
    });

    return attempts.map((attempt) => ({
      attemptId: attempt.id,
      quizVersion: attempt.quizVersion.version,
      completedAt: attempt.completedAt,
      answers: new Map(
        attempt.answers.map((a) => [
          a.questionKey,
          AnswerValueSchema.parse(a.value),
        ]),
      ),
      result: {
        outcome: attempt.result!.outcome as PastAttempt['result']['outcome'],
        score: attempt.result!.score,
        maxScore: attempt.result!.maxScore,
      },
    }));
  }
}
