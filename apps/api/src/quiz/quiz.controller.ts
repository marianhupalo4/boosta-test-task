import { Controller, Get, Param } from '@nestjs/common';
import type { QuizDto } from '@adhd/shared';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get(':quizKey/active')
  getActive(@Param('quizKey') quizKey: string): Promise<QuizDto> {
    return this.quizService.getActive(quizKey);
  }
}
