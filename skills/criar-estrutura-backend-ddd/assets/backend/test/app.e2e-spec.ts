import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/infra/app.module.js';
import { PrismaService } from '../src/infra/database/prisma/prisma.service.js';
import { Public } from '../src/infra/auth/public.js';

@Controller('_test')
class PublicTestController {
  @Public()
  @Get('public')
  handle() { return { public: true }; }
}

describe('base HTTP com JWT RS256', () => {
  let app: INestApplication;
  let token: string;
  let jwt: JwtService;
  const checkConnection = vi.fn<() => Promise<void>>();

  beforeEach(async () => {
    checkConnection.mockReset().mockResolvedValue();
    const module = await Test.createTestingModule({
      imports: [AppModule], controllers: [PublicTestController],
    }).overrideProvider(PrismaService).useValue({ checkConnection }).compile();
    app = module.createNestApplication();
    await app.init();
    jwt = module.get(JwtService);
    token = await jwt.signAsync({ sub: 'c9ab9903-c1c9-4463-b449-e26c58d59a00' });
  });
  afterEach(async () => { await app.close(); });

  it('recusa acesso sem token', async () => {
    await request(app.getHttpServer()).get('/').expect(401);
    await request(app.getHttpServer()).get('/health').expect(401);
  });
  it('aceita token RS256 válido', async () => {
    await request(app.getHttpServer()).get('/').auth(token, { type: 'bearer' }).expect(200).expect('Hello World!');
  });
  it('permite rota marcada Public', async () => {
    await request(app.getHttpServer()).get('/_test/public').expect(200).expect({ public: true });
  });
  it('rejeita token assinado com payload inválido', async () => {
    const invalid = await jwt.signAsync({ sub: 'invalid' });
    await request(app.getHttpServer()).get('/').auth(invalid, { type: 'bearer' }).expect(401);
  });
  it('informa o diagnóstico autenticado do banco', async () => {
    const response = await request(app.getHttpServer()).get('/health').auth(token, { type: 'bearer' }).expect(200);
    expect(response.body).toEqual({ status: 'ok', database: 'connected' });
  });
  it('retorna 503 sem expor detalhes privados', async () => {
    checkConnection.mockRejectedValueOnce(new Error('detalhes privados'));
    const response = await request(app.getHttpServer()).get('/health').auth(token, { type: 'bearer' }).expect(503);
    expect(response.body.message).toBe('Banco de dados indisponível.');
  });
});
