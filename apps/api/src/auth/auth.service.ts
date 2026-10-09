import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { SignInInput, SignUpInput, UserDto } from '@adhd/shared';
import * as argon2 from 'argon2';
import { AttemptsService } from '../attempts/attempts.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  /** Compared against when the email is unknown, so timing does not reveal registered emails. */
  private readonly dummyHash = argon2.hash('dummy-password-for-timing');

  constructor(
    private readonly prisma: PrismaService,
    private readonly attempts: AttemptsService,
  ) {}

  async signUp(input: SignUpInput, claimToken?: string): Promise<UserDto> {
    const passwordHash = await argon2.hash(input.password);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: input.email, passwordHash },
          select: { id: true, email: true },
        });
        await this.attempts.claim(tx, user.id, claimToken);
        return user;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }
  }

  async signIn(input: SignInInput, claimToken?: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    const valid = await argon2.verify(
      user?.passwordHash ?? (await this.dummyHash),
      input.password,
    );
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.$transaction((tx) =>
      this.attempts.claim(tx, user.id, claimToken),
    );
    return { id: user.id, email: user.email };
  }

  async getUser(userId: string): Promise<UserDto> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true },
    });
  }
}
