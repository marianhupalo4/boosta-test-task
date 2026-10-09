import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizDefinitionSchema, type QuizDto } from '@adhd/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { QuizVersion } from '../generated/prisma/client';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive(quizKey: string): Promise<QuizDto> {
    const version = await this.prisma.quizVersion.findFirst({
      where: { quizKey, status: 'active' },
    });
    if (!version) {
      throw new NotFoundException(`No active version of quiz "${quizKey}"`);
    }
    return this.toDto(version);
  }

  /** Any version, including archived ones, so old attempts stay interpretable. */
  async getVersion(id: string) {
    const version = await this.prisma.quizVersion.findUnique({ where: { id } });
    if (!version) {
      throw new NotFoundException('Quiz version not found');
    }
    return {
      ...version,
      definition: QuizDefinitionSchema.parse(version.definition),
    };
  }

  private toDto(version: QuizVersion): QuizDto {
    return {
      id: version.id,
      quizKey: version.quizKey,
      version: version.version,
      questions: QuizDefinitionSchema.parse(version.definition).questions,
    };
  }
}
