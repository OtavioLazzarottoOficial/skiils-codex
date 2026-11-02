import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { EnvService } from './env/env.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const envService = app.get(EnvService);
  const corsOrigins = envService.get('CORS_ORIGINS');

  app.enableCors({
    origin:
      corsOrigins === '*'
        ? true
        : corsOrigins.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  const port = envService.get('PORT');

  await app.listen(port);
}
await bootstrap();
