import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import {
  SubmitAttemptSchema,
  type SubmitAttemptInput,
  type SubmitAttemptResponse,
} from '@adhd/shared';
import type { Request, Response } from 'express';
import { ATTEMPT_CLAIM_COOKIE, cookieOptions } from '../auth/cookies';
import { SessionService } from '../auth/session.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AttemptsService } from './attempts.service';

@Controller('attempts')
export class AttemptsController {
  constructor(
    private readonly attempts: AttemptsService,
    private readonly sessions: SessionService,
  ) {}

  /** Open to anonymous users: the quiz does not require an account. */
  @Post()
  async submit(
    @Body(new ZodValidationPipe(SubmitAttemptSchema)) body: SubmitAttemptInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SubmitAttemptResponse> {
    const userId = await this.sessions.getUserId(req);
    const { attemptId, claimToken } = await this.attempts.submit(body, userId);

    if (claimToken) {
      res.cookie(ATTEMPT_CLAIM_COOKIE, claimToken, cookieOptions());
    }
    return { attemptId, requiresAccount: !userId };
  }
}
