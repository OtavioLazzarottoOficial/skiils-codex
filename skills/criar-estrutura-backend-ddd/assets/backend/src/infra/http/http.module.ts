import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { AppController } from './app.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { CryptographyModule } from '../cryptography/cryptography.module.js';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [AppController, HealthController],
})
export class HttpModule {}
