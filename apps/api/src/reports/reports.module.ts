import { Module } from '@nestjs/common';
import { ReportBuilderService } from './report-builder.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportBuilderService, ReportsService],
  exports: [ReportBuilderService],
})
export class ReportsModule {}
