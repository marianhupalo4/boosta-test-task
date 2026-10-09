import 'dotenv/config';
import { isDeepStrictEqual } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { QuizDefinitionSchema } from '@adhd/shared';
import { PrismaClient } from '../src/generated/prisma/client';
import { QUIZ_VERSIONS } from '../src/quiz/definitions';
import { ScoringService } from '../src/scoring/scoring.service';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Idempotent: creates missing quiz versions, refuses to modify published ones
 * and activates the latest version of each quiz.
 */
async function main() {
  const scoring = new ScoringService();
  const latest = new Map<string, number>();

  for (const quiz of QUIZ_VERSIONS) {
    const definition = QuizDefinitionSchema.parse(quiz.definition);
    scoring.assertValidConfig(quiz.scoring);

    const existing = await prisma.quizVersion.findUnique({
      where: {
        quizKey_version: { quizKey: quiz.quizKey, version: quiz.version },
      },
    });

    if (!existing) {
      await prisma.quizVersion.create({
        data: {
          quizKey: quiz.quizKey,
          version: quiz.version,
          definition,
          scoring: quiz.scoring,
          reportTemplate: quiz.reportTemplate,
        },
      });
      console.log(`created ${quiz.quizKey} v${quiz.version}`);
    } else if (
      !isDeepStrictEqual(existing.definition, definition) ||
      !isDeepStrictEqual(existing.scoring, quiz.scoring) ||
      existing.reportTemplate !== quiz.reportTemplate
    ) {
      throw new Error(
        `${quiz.quizKey} v${quiz.version} is already published and must not change. Add a new version instead.`,
      );
    }

    latest.set(
      quiz.quizKey,
      Math.max(latest.get(quiz.quizKey) ?? 0, quiz.version),
    );
  }

  for (const [quizKey, version] of latest) {
    await prisma.$transaction([
      prisma.quizVersion.updateMany({
        where: { quizKey, status: 'active', NOT: { version } },
        data: { status: 'archived' },
      }),
      prisma.quizVersion.update({
        where: { quizKey_version: { quizKey, version } },
        data: { status: 'active' },
      }),
    ]);
    console.log(`active ${quizKey} v${version}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
