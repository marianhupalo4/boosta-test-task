import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { SESSION_COOKIE } from './cookies';

/** Stateless JWT session stored in an httpOnly cookie. */
@Injectable()
export class SessionService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  sign(userId: string): Promise<string> {
    return this.jwt.signAsync({ sub: userId });
  }

  /** Returns the user id for a valid session of an existing user, otherwise null. */
  async getUserId(request: Request): Promise<string | null> {
    const token = (request.cookies as Record<string, string | undefined>)[
      SESSION_COOKIE
    ];
    if (!token) return null;

    try {
      const { sub } = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: sub },
        select: { id: true },
      });
      return user?.id ?? null;
    } catch {
      return null;
    }
  }
}
