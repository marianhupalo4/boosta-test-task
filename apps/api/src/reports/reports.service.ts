import { Injectable } from '@nestjs/common';
import type { ReportDto, ReportSection } from '@adhd/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** The user's current report is the one of their most recent attempt. */
  async getLatestForUser(userId: string): Promise<ReportDto | null> {
    const report = await this.prisma.report.findFirst({
      where: { attempt: { userId } },
      orderBy: { attempt: { completedAt: 'desc' } },
    });
    if (!report) return null;

    return {
      id: report.id,
      attemptId: report.attemptId,
      template: report.template,
      templateVersion: report.templateVersion,
      createdAt: report.createdAt.toISOString(),
      sections: report.sections as unknown as ReportSection[],
    };
  }
}
