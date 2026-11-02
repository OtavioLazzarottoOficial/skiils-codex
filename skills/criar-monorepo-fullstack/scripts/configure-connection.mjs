#!/usr/bin/env node
import { lstatSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, parse } from 'node:path';
const templates = {
  "apps/backend/.env.example": "# Origem permitida no navegador (sem caminho).\nPORT=3000\nFRONTEND_URL=http://localhost:5173\n",
  "apps/frontend/.env.example": "# URL publica da API; variaveis VITE_ sao visiveis no navegador.\nVITE_API_URL=http://localhost:3000\n",
  "packages/shared/src/connection-check.ts": "export interface ConnectionCheckResponse {\n  status: 'ok';\n  service: 'backend';\n  message: string;\n}\n",
  "apps/backend/src/infra/config/env.schema.ts": "import { z } from 'zod';\n\nconst frontendOrigin = z.string().url().refine((value) => {\n  const url = new URL(value);\n  return ['http:', 'https:'].includes(url.protocol) &&\n    url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password;\n}, 'FRONTEND_URL deve ser uma origem HTTP(S), sem caminho, credenciais, query ou fragmento.')\n  .transform((value) => new URL(value).origin);\n\nexport const envSchema = z.object({\n  PORT: z.coerce.number().int().min(1).max(65535).default(3000),\n  FRONTEND_URL: frontendOrigin,\n});\n\nexport type AppEnv = z.infer<typeof envSchema>;\n",
  "apps/backend/src/infra/config/env.ts": "import { loadEnvFile } from 'node:process';\nimport { fileURLToPath } from 'node:url';\nimport { envSchema } from './env.schema.js';\n\nexport function readEnvironment() {\n  // O caminho funciona tanto em src/infra/config quanto em dist/infra/config.\n  try {\n    loadEnvFile(fileURLToPath(new URL('../../../.env', import.meta.url)));\n  } catch (error) {\n    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {\n      throw error;\n    }\n  }\n  return envSchema.parse(process.env);\n}\n",
  "apps/backend/src/infra/http/configure-app.ts": "import type { INestApplication } from '@nestjs/common';\nimport type { AppEnv } from '../config/env.schema.js';\n\nexport function configureApp(app: INestApplication, env: Pick<AppEnv, 'FRONTEND_URL'>) {\n  app.enableCors({\n    origin: [env.FRONTEND_URL],\n    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],\n    allowedHeaders: ['Content-Type', 'Authorization'],\n  });\n}\n",
  "apps/backend/src/infra/http/connection.controller.ts": "import { Controller, Get } from '@nestjs/common';\nimport type { ConnectionCheckResponse } from '@repo/shared/connection-check';\n\n@Controller('connection')\nexport class ConnectionController {\n  @Get()\n  check(): ConnectionCheckResponse {\n    return {\n      status: 'ok',\n      service: 'backend',\n      message: 'Conexão com o backend estabelecida.',\n    };\n  }\n}\n",
  "apps/backend/src/infra/config/env.schema.spec.ts": "import { describe, expect, it } from 'vitest';\nimport { envSchema } from './env.schema.js';\n\ndescribe('configuração do ambiente', () => {\n  it('converte a porta e normaliza a origem', () => {\n    expect(envSchema.parse({ PORT: '3001', FRONTEND_URL: 'http://localhost:5173/' }))\n      .toEqual({ PORT: 3001, FRONTEND_URL: 'http://localhost:5173' });\n  });\n\n  it('usa 3000 quando PORT não é fornecida', () => {\n    expect(envSchema.parse({ FRONTEND_URL: 'http://localhost:5173' }).PORT).toBe(3000);\n  });\n\n  it.each(['0', '65536', 'abc'])('recusa porta inválida %s', (PORT) => {\n    expect(() => envSchema.parse({ PORT, FRONTEND_URL: 'http://localhost:5173' })).toThrow();\n  });\n\n  it.each(['https://site.test/path', 'https://user:pass@site.test', 'file:///tmp', '*', 'https://site.test?q=1'])\n    ('recusa origem inválida %s', (FRONTEND_URL) => {\n      expect(() => envSchema.parse({ FRONTEND_URL })).toThrow();\n    });\n});\n",
  "apps/backend/test/connection.e2e-spec.ts": "import { Test } from '@nestjs/testing';\nimport type { INestApplication } from '@nestjs/common';\nimport request from 'supertest';\nimport { afterEach, beforeEach, describe, expect, it } from 'vitest';\nimport { AppModule } from '../src/infra/app.module.js';\nimport { configureApp } from '../src/infra/http/configure-app.js';\n\ndescribe('conexão e CORS (e2e)', () => {\n  let app: INestApplication;\n  const origin = 'http://localhost:5173';\n\n  beforeEach(async () => {\n    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();\n    app = module.createNestApplication();\n    configureApp(app, { FRONTEND_URL: origin });\n    await app.init();\n  });\n\n  afterEach(async () => { await app.close(); });\n\n  it('retorna o diagnóstico e permite a origem configurada', async () => {\n    const response = await request(app.getHttpServer()).get('/connection').set('Origin', origin).expect(200);\n    expect(response.body).toEqual({ status: 'ok', service: 'backend', message: 'Conexão com o backend estabelecida.' });\n    expect(response.headers['access-control-allow-origin']).toBe(origin);\n  });\n\n  it('responde ao preflight', async () => {\n    await request(app.getHttpServer()).options('/connection')\n      .set('Origin', origin).set('Access-Control-Request-Method', 'GET')\n      .set('Access-Control-Request-Headers', 'Content-Type')\n      .expect(204).expect('Access-Control-Allow-Origin', origin);\n  });\n\n  it('não libera uma origem diferente', async () => {\n    const response = await request(app.getHttpServer()).get('/connection')\n      .set('Origin', 'https://outra-origem.test').expect(200);\n    expect(response.headers['access-control-allow-origin']).toBeUndefined();\n  });\n});\n",
  "apps/frontend/src/env.d.ts": "interface ImportMetaEnv {\n  readonly VITE_API_URL: string;\n}\ninterface ImportMeta {\n  readonly env: ImportMetaEnv;\n}\n",
  "apps/frontend/src/lib/api.ts": "import type { ConnectionCheckResponse } from '@repo/shared/connection-check';\n\nexport async function checkConnection(\n  baseUrl: string = import.meta.env.VITE_API_URL,\n): Promise<ConnectionCheckResponse> {\n  let url: URL;\n  try {\n    url = new URL(baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');\n    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {\n      throw new Error('URL inválida');\n    }\n  } catch {\n    throw new Error('Configure VITE_API_URL com uma URL HTTP(S) válida no .env do frontend.');\n  }\n\n  const response = await fetch(new URL('connection', url), {\n    headers: { Accept: 'application/json' },\n    signal: AbortSignal.timeout(5000),\n  });\n  if (!response.ok) throw new Error('O backend respondeu com HTTP ' + response.status + '.');\n\n  const data: unknown = await response.json();\n  if (typeof data !== 'object' || data === null ||\n      !('status' in data) || data.status !== 'ok' ||\n      !('service' in data) || data.service !== 'backend' ||\n      !('message' in data) || typeof data.message !== 'string') {\n    throw new Error('O backend retornou uma resposta inesperada.');\n  }\n  return { status: data.status, service: data.service, message: data.message };\n}\n",
  "apps/frontend/src/lib/api.spec.ts": "import { afterEach, describe, expect, it, vi } from 'vitest';\nimport { checkConnection } from './api';\n\nafterEach(() => { vi.unstubAllGlobals(); });\n\ndescribe('chamada de conexão', () => {\n  it('chama a URL configurada e interpreta o contrato', async () => {\n    const body = { status: 'ok', service: 'backend', message: 'Conectado' };\n    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));\n    vi.stubGlobal('fetch', fetchSpy);\n    await expect(checkConnection('http://localhost:3000')).resolves.toEqual(body);\n    expect(String(fetchSpy.mock.calls[0][0])).toBe('http://localhost:3000/connection');\n  });\n\n  it('recusa configuração inválida antes de enviar a chamada', async () => {\n    const fetchSpy = vi.fn();\n    vi.stubGlobal('fetch', fetchSpy);\n    await expect(checkConnection('invalid')).rejects.toThrow('VITE_API_URL');\n    expect(fetchSpy).not.toHaveBeenCalled();\n  });\n\n  it('informa erros HTTP', async () => {\n    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));\n    await expect(checkConnection('http://localhost:3000')).rejects.toThrow('HTTP 503');\n  });\n\n  it('recusa um contrato inesperado', async () => {\n    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{\"status\":\"unknown\"}')));\n    await expect(checkConnection('http://localhost:3000')).rejects.toThrow('resposta inesperada');\n  });\n\n  it('propaga falhas de rede para a interface', async () => {\n    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));\n    await expect(checkConnection('http://localhost:3000')).rejects.toThrow('Failed to fetch');\n  });\n});\n",
  "apps/frontend/vitest.config.ts": "import { defineConfig } from 'vitest/config';\n\nexport default defineConfig({ test: { include: ['src/**/*.spec.ts'], environment: 'node' } });\n",
  "apps/frontend/src/routes/connection.tsx": "import { useState } from 'react'\nimport { createFileRoute } from '@tanstack/react-router'\nimport { Button } from '@/components/ui/button'\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'\nimport { checkConnection } from '@/lib/api'\n\nexport const Route = createFileRoute('/connection')({ component: ConnectionPage })\n\ntype State = { status: 'idle' | 'loading' } | { status: 'success' | 'error'; message: string }\n\nfunction ConnectionPage() {\n  const [state, setState] = useState<State>({ status: 'idle' })\n\n  async function testConnection() {\n    setState({ status: 'loading' })\n    try {\n      const result = await checkConnection()\n      setState({ status: 'success', message: result.message })\n    } catch (error) {\n      const message = error instanceof Error && error.name === 'TimeoutError'\n        ? 'O backend demorou para responder. Tente novamente.'\n        : error instanceof TypeError\n          ? 'Não foi possível alcançar o backend. Confira se ele está em execução e se a origem está permitida no CORS.'\n          : error instanceof Error ? error.message : 'Não foi possível testar a conexão.'\n      setState({ status: 'error', message })\n    }\n  }\n\n  return (\n    <section className=\"max-w-2xl space-y-8\">\n      <div className=\"space-y-4\"><p className=\"text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground\">Diagnóstico</p><h1 className=\"text-4xl font-semibold tracking-tight\">Teste de conexão</h1><p className=\"text-muted-foreground\">Confira se esta aplicação consegue enviar uma chamada e receber a resposta da API.</p></div>\n      <Card>\n        <CardHeader><CardTitle>Frontend ↔ Backend</CardTitle><CardDescription className=\"break-all\">API: {import.meta.env.VITE_API_URL || 'não configurada'}</CardDescription></CardHeader>\n        <CardContent className=\"space-y-5\">\n          <Button disabled={state.status === 'loading'} onClick={() => { void testConnection() }}>\n            {state.status === 'loading' ? 'Testando…' : 'Testar conexão'}\n          </Button>\n          <div aria-live=\"polite\" role={state.status === 'error' ? 'alert' : 'status'} className=\"text-sm\">\n            {state.status === 'idle' && <p className=\"text-muted-foreground\">Pronto para testar.</p>}\n            {state.status === 'loading' && <p className=\"text-muted-foreground\">Aguardando resposta do backend…</p>}\n            {state.status === 'success' && <p className=\"text-green-700 dark:text-green-400\"><strong>Conexão funcionando.</strong> {state.message}</p>}\n            {state.status === 'error' && <p className=\"text-destructive\"><strong>Falha na conexão.</strong> {state.message}</p>}\n          </div>\n        </CardContent>\n      </Card>\n    </section>\n  )\n}\n"
};
const replacements = {
  "apps/backend/src/infra/main.ts": {
    "before": "import 'reflect-metadata';\nimport { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module.js';\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  await app.listen(process.env.PORT ?? 3000);\n}\nawait bootstrap();\n",
    "after": "import 'reflect-metadata';\nimport { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module.js';\nimport { readEnvironment } from './config/env.js';\nimport { configureApp } from './http/configure-app.js';\n\nasync function bootstrap() {\n  const env = readEnvironment();\n  const app = await NestFactory.create(AppModule);\n  configureApp(app, env);\n  await app.listen(env.PORT);\n}\nawait bootstrap();\n"
  },
  "apps/backend/src/infra/http/http.module.ts": {
    "before": "import { Module } from '@nestjs/common';\nimport { AppController } from './app.controller.js';\n\n@Module({ controllers: [AppController] })\nexport class HttpModule {}\n",
    "after": "import { Module } from '@nestjs/common';\nimport { AppController } from './app.controller.js';\nimport { ConnectionController } from './connection.controller.js';\n\n@Module({ controllers: [AppController, ConnectionController] })\nexport class HttpModule {}\n"
  }
};

function stat(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0].startsWith('--')) throw new Error('Uso: node configure-connection.mjs <monorepo>');
  const root = resolve(args[0]);
  const writes = new Map();
  function read(name) {
    const path = resolve(root, name);
    const entry = stat(path);
    if (!entry?.isFile() || entry.isSymbolicLink()) throw new Error('Arquivo esperado: ' + path);
    return readFileSync(path, 'utf8');
  }
  for (const [name, content] of Object.entries(templates)) {
    const path = resolve(root, name);
    const entry = stat(path);
    if (entry && (!entry.isFile() || entry.isSymbolicLink() || read(name) !== content)) {
      throw new Error('Modelo difere do arquivo existente; adapte preservando as alteracoes: ' + path);
    }
    if (!entry) writes.set(name, content);
  }
  for (const [name, change] of Object.entries(replacements)) {
    const content = read(name).replaceAll(String.fromCharCode(13,10), String.fromCharCode(10));
    if (content !== change.before && content !== change.after) throw new Error('Bootstrap personalizado; adapte manualmente: ' + name);
    if (content !== change.after) writes.set(name, change.after);
  }
  for (const app of ['backend', 'frontend']) {
    const path = 'apps/' + app + '/.env';
    if (!stat(resolve(root, path))) writes.set(path, templates[path + '.example']);
  }
  const backend = JSON.parse(read('apps/backend/package.json'));
  backend.dependencies = { ...backend.dependencies, zod: backend.dependencies?.zod || '^4.5.4' };
  writes.set('apps/backend/package.json', JSON.stringify(backend, null, 2) + String.fromCharCode(10));
  const frontend = JSON.parse(read('apps/frontend/package.json'));
  frontend.devDependencies = { ...frontend.devDependencies, vitest: frontend.devDependencies?.vitest || '^4.1.2' };
  frontend.scripts.test = 'vitest run';
  writes.set('apps/frontend/package.json', JSON.stringify(frontend, null, 2) + String.fromCharCode(10));
  const shared = JSON.parse(read('packages/shared/package.json'));
  shared.exports = { ...shared.exports, './connection-check': {
    types: './dist/connection-check.d.ts', import: './dist/connection-check.js'
  } };
  writes.set('packages/shared/package.json', JSON.stringify(shared, null, 2) + String.fromCharCode(10));
  const turbo = JSON.parse(read('turbo.json'));
  for (const task of ['build', 'typecheck', 'test']) {
    turbo.tasks[task].inputs = [...new Set([...(turbo.tasks[task].inputs || ['$TURBO_DEFAULT$']), '.env', '.env.*'])];
    turbo.tasks[task].env = [...new Set([...(turbo.tasks[task].env || []), 'VITE_*'])];
  }
  turbo.tasks.dev.passThroughEnv = [...new Set([...(turbo.tasks.dev.passThroughEnv || []), 'PORT', 'FRONTEND_URL', 'VITE_*'])];
  turbo.tasks.test.outputs = [];
  writes.set('turbo.json', JSON.stringify(turbo, null, 2) + String.fromCharCode(10));
  // Validate all parent directories before mutating, including links outside the project.
  for (const name of writes.keys()) {
    const path = resolve(root, name);
    const entry = stat(path);
    if (entry && (!entry.isFile() || entry.isSymbolicLink())) throw new Error('Conflito: ' + path);
    for (let parent = dirname(path); ; parent = dirname(parent)) {
      const item = stat(parent);
      if (item && (!item.isDirectory() || item.isSymbolicLink())) throw new Error('Pasta invalida: ' + parent);
      if (parent === parse(parent).root) break;
    }
  }
  for (const [name, content] of writes) {
    const path = resolve(root, name);
    mkdirSync(dirname(path), { recursive: true });
    if (!stat(path) || readFileSync(path, 'utf8') !== content) writeFileSync(path, content, 'utf8');
  }
  console.log('Integracao configurada. Execute npm install na raiz, adicione um link para /connection no layout e valide no navegador.');
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
