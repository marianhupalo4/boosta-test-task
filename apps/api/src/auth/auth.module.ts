import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AttemptsModule } from '../attempts/attempts.module';
import type { Env } from '../config/env';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SESSION_TTL_SECONDS } from './cookies';
import { SessionService } from './session.service';

@Global()
@Module({
  imports: [
    AttemptsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: SESSION_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, AuthGuard],
  exports: [SessionService, AuthGuard],
})
export class AuthModule {}
