import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.js';
import { EnvService } from '../../env/env.service.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(EnvService) env: EnvService) {
    super({
      adapter: new PrismaPg({
        connectionString: env.get('DATABASE_URL'),
        connectionTimeoutMillis: 5000,
        max: 5,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }

  async checkConnection() {
    // Consulta fixa de diagnóstico, sem dados fornecidos pelo cliente.
    await this.$queryRawUnsafe('SELECT 1');
  }
}
