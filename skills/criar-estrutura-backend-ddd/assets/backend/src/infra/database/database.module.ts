import { Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module.ts';
import { PrismaService } from './prisma/prisma.service.ts';

@Module({
  imports: [EnvModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
