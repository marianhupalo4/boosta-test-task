import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from './session.service';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = await this.sessions.getUserId(request);
    if (!userId) {
      throw new UnauthorizedException();
    }
    request.userId = userId;
    return true;
  }
}
