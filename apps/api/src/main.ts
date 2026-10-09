import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import type { Env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<Env, true>);

  // Requests arrive through the web app's rewrite proxy; use X-Forwarded-For
  // so rate limiting is per visitor, not per proxy.
  app.set('trust proxy', true);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableShutdownHooks();

  const origins = config.get('CORS_ORIGINS', { infer: true });
  if (origins.length) {
    app.enableCors({ origin: origins, credentials: true });
  }

  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap();
