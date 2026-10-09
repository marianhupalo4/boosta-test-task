import { Module } from '@nestjs/common';
import { QuizModule } from '../quiz/quiz.module';
import { ReportsModule } from '../reports/reports.module';
import { ScoringModule } from '../scoring/scoring.module';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

@Module({
  imports: [QuizModule, ScoringModule, ReportsModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
