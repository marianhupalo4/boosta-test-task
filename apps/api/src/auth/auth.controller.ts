import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  SignInSchema,
  SignUpSchema,
  type SignInInput,
  type SignUpInput,
  type UserDto,
} from '@adhd/shared';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import {
  ATTEMPT_CLAIM_COOKIE,
  SESSION_COOKIE,
  clearCookieOptions,
  cookieOptions,
} from './cookies';
import { CurrentUserId } from './current-user.decorator';
import { SessionService } from './session.service';

@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionService,
  ) {}

  @Post('sign-up')
  async signUp(
    @Body(new ZodValidationPipe(SignUpSchema)) body: SignUpInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const user = await this.auth.signUp(body, claimTokenOf(req));
    await this.startSession(res, user.id);
    return user;
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Body(new ZodValidationPipe(SignInSchema)) body: SignInInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDto> {
    const user = await this.auth.signIn(body, claimTokenOf(req));
    await this.startSession(res, user.id);
    return user;
  }

  @Post('sign-out')
  @HttpCode(204)
  signOut(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(SESSION_COOKIE, clearCookieOptions());
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUserId() userId: string): Promise<UserDto> {
    return this.auth.getUser(userId);
  }

  private async startSession(res: Response, userId: string) {
    res.cookie(
      SESSION_COOKIE,
      await this.sessions.sign(userId),
      cookieOptions(),
    );
    res.clearCookie(ATTEMPT_CLAIM_COOKIE, clearCookieOptions());
  }
}

function claimTokenOf(req: Request): string | undefined {
  return (req.cookies as Record<string, string | undefined>)[
    ATTEMPT_CLAIM_COOKIE
  ];
}
