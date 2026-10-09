import { Controller, Get, UseGuards } from '@nestjs/common';
import type { MyReportResponse } from '@adhd/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('me')
  async mine(@CurrentUserId() userId: string): Promise<MyReportResponse> {
    return { report: await this.reports.getLatestForUser(userId) };
  }
}
