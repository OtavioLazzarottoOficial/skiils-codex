import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.ts';
import { AppController } from './app.controller.ts';
import { HealthController } from './controllers/health.controller.ts';
import { CryptographyModule } from '../cryptography/cryptography.module.ts';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [AppController, HealthController],
})
export class HttpModule {}
