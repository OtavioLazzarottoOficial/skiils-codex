#!/usr/bin/env node
import { lstatSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, parse } from 'node:path';
const templates = {
  "apps/frontend/.env.example": "# URL publica da API; variaveis VITE_ sao visiveis no navegador.\nVITE_API_URL=http://localhost:3000\n",
  "packages/shared/src/connection-check.ts": "export interface ConnectionCheckResponse {\n  status: 'ok';\n  service: 'backend';\n  message: string;\n}\n",
  "apps/backend/src/infra/http/configure-app.ts": "import type { INestApplication } from '@nestjs/common';\n\nexport function configureApp(app: INestApplication, env: { CORS_ORIGINS: string }) {\n  app.enableCors({\n    origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),\n    credentials: true,\n  });\n}\n",
  "apps/backend/src/infra/http/connection.controller.ts": "import { Public } from '../auth/public.js';\nimport { Controller, Get } from '@nestjs/common';\nimport type { ConnectionCheckResponse } from '@repo/shared/connection-check';\n\n@Public()\n@Controller('connection')\nexport class ConnectionController {\n  @Get()\n  check(): ConnectionCheckResponse {\n    return {\n      status: 'ok',\n      service: 'backend',\n      message: 'Conexão com o backend estabelecida.',\n    };\n  }\n}\n",
  "apps/backend/test/connection.e2e-spec.ts": "import { Test } from '@nestjs/testing';\nimport type { INestApplication } from '@nestjs/common';\nimport request from 'supertest';\nimport { afterEach, beforeEach, describe, expect, it } from 'vitest';\nimport { AppModule } from '../src/infra/app.module.js';\nimport { PrismaService } from '../src/infra/database/prisma/prisma.service.js';\nimport { configureApp } from '../src/infra/http/configure-app.js';\n\ndescribe('conexão e CORS (e2e)', () => {\n  let app: INestApplication;\n  const origin = 'http://localhost:5173';\n\n  beforeEach(async () => {\n    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(PrismaService).useValue({ checkConnection: async () => undefined }).compile();\n    app = module.createNestApplication();\n    configureApp(app, { CORS_ORIGINS: origin });\n    await app.init();\n  });\n\n  afterEach(async () => { await app.close(); });\n\n  it('retorna o diagnóstico e permite a origem configurada', async () => {\n    const response = await request(app.getHttpServer()).get('/connection').set('Origin', origin).expect(200);\n    expect(response.body).toEqual({ status: 'ok', service: 'backend', message: 'Conexão com o backend estabelecida.' });\n    expect(response.headers['access-control-allow-origin']).toBe(origin);\n  });\n\n  it('responde ao preflight', async () => {\n    await request(app.getHttpServer()).options('/connection')\n      .set('Origin', origin).set('Access-Control-Request-Method', 'GET')\n      .set('Access-Control-Request-Headers', 'Content-Type')\n      .expect(204).expect('Access-Control-Allow-Origin', origin);\n  });\n\n  it('não libera uma origem diferente', async () => {\n    const response = await request(app.getHttpServer()).get('/connection')\n      .set('Origin', 'https://outra-origem.test').expect(200);\n    expect(response.headers['access-control-allow-origin']).toBeUndefined();\n  });\n});\n",
  "apps/frontend/src/env.d.ts": "interface ImportMetaEnv {\n  readonly VITE_API_URL: string;\n}\ninterface ImportMeta {\n  readonly env: ImportMetaEnv;\n}\n",
  "apps/frontend/src/lib/api.ts": "import type { ConnectionCheckResponse } from '@repo/shared/connection-check';\n\nexport async function checkConnection(\n  baseUrl: string = import.meta.env.VITE_API_URL,\n): Promise<ConnectionCheckResponse> {\n  let url: URL;\n  try {\n    url = new URL(baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');\n    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {\n      throw new Error('URL inválida');\n    }\n  } catch {\n    throw new Error('Configure VITE_API_URL com uma URL HTTP(S) válida no .env do frontend.');\n  }\n\n  const response = await fetch(new URL('connection', url), {\n    headers: { Accept: 'application/json' },\n    signal: AbortSignal.timeout(5000),\n  });\n  if (!response.ok) throw new Error('O backend respondeu com HTTP ' + response.status + '.');\n\n  const data: unknown = await response.json();\n  if (typeof data !== 'object' || data === null ||\n      !('status' in data) || data.status !== 'ok' ||\n      !('service' in data) || data.service !== 'backend' ||\n      !('message' in data) || typeof data.message !== 'string') {\n    throw new Error('O backend retornou uma resposta inesperada.');\n  }\n  return { status: data.status, service: data.service, message: data.message };\n}\n",
  "apps/frontend/src/lib/api.spec.ts": "import { afterEach, describe, expect, it, vi } from 'vitest';\nimport { checkConnection } from './api';\n\nafterEach(() => { vi.unstubAllGlobals(); });\n\ndescribe('chamada de conexão', () => {\n  it('chama a URL configurada e interpreta o contrato', async () => {\n    const body = { status: 'ok', service: 'backend', message: 'Conectado' };\n    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));\n    vi.stubGlobal('fetch', fetchSpy);\n    await expect(checkConnection('http://localhost:3000')).resolves.toEqual(body);\n    expect(String(fetchSpy.mock.calls[0][0])).toBe('http://localhost:3000/connection');\n  });\n\n  it('recusa configuração inválida antes de enviar a chamada', async () => {\n    const fetchSpy = vi.fn();\n    vi.stubGlobal('fetch', fetchSpy);\n    await expect(checkConnection('invalid')).rejects.toThrow('VITE_API_URL');\n    expect(fetchSpy).not.toHaveBeenCalled();\n  });\n\n  it('informa erros HTTP', async () => {\n    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));\n    await expect(checkConnection('http://localhost:3000')).rejects.toThrow('HTTP 503');\n  });\n\n  it('recusa um contrato inesperado', async () => {\n    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{\"status\":\"unknown\"}')));\n    await expect(checkConnection('http://localhost:3000')).rejects.toThrow('resposta inesperada');\n  });\n\n  it('propaga falhas de rede para a interface', async () => {\n    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));\n    await expect(checkConnection('http://localhost:3000')).rejects.toThrow('Failed to fetch');\n  });\n});\n",
  "apps/frontend/vitest.config.ts": "import { defineConfig } from 'vitest/config';\n\nexport default defineConfig({ test: { include: ['src/**/*.spec.ts'], environment: 'node' } });\n",
  "apps/frontend/src/routes/connection.tsx": "import { useState } from 'react'\nimport { createFileRoute } from '@tanstack/react-router'\nimport { Button } from '@/components/ui/button'\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'\nimport { checkConnection } from '@/lib/api'\n\nexport const Route = createFileRoute('/connection')({ component: ConnectionPage })\n\ntype State = { status: 'idle' | 'loading' } | { status: 'success' | 'error'; message: string }\n\nfunction ConnectionPage() {\n  const [state, setState] = useState<State>({ status: 'idle' })\n\n  async function testConnection() {\n    setState({ status: 'loading' })\n    try {\n      const result = await checkConnection()\n      setState({ status: 'success', message: result.message })\n    } catch (error) {\n      const message = error instanceof Error && error.name === 'TimeoutError'\n        ? 'O backend demorou para responder. Tente novamente.'\n        : error instanceof TypeError\n          ? 'Não foi possível alcançar o backend. Confira se ele está em execução e se a origem está permitida no CORS.'\n          : error instanceof Error ? error.message : 'Não foi possível testar a conexão.'\n      setState({ status: 'error', message })\n    }\n  }\n\n  return (\n    <section className=\"max-w-2xl space-y-8\">\n      <div className=\"space-y-4\"><p className=\"text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground\">Diagnóstico</p><h1 className=\"text-4xl font-semibold tracking-tight\">Teste de conexão</h1><p className=\"text-muted-foreground\">Confira se esta aplicação consegue enviar uma chamada e receber a resposta da API.</p></div>\n      <Card>\n        <CardHeader><CardTitle>Frontend ↔ Backend</CardTitle><CardDescription className=\"break-all\">API: {import.meta.env.VITE_API_URL || 'não configurada'}</CardDescription></CardHeader>\n        <CardContent className=\"space-y-5\">\n          <Button disabled={state.status === 'loading'} onClick={() => { void testConnection() }}>\n            {state.status === 'loading' ? 'Testando…' : 'Testar conexão'}\n          </Button>\n          <div aria-live=\"polite\" role={state.status === 'error' ? 'alert' : 'status'} className=\"text-sm\">\n            {state.status === 'idle' && <p className=\"text-muted-foreground\">Pronto para testar.</p>}\n            {state.status === 'loading' && <p className=\"text-muted-foreground\">Aguardando resposta do backend…</p>}\n            {state.status === 'success' && <p className=\"text-green-700 dark:text-green-400\"><strong>Conexão funcionando.</strong> {state.message}</p>}\n            {state.status === 'error' && <p className=\"text-destructive\"><strong>Falha na conexão.</strong> {state.message}</p>}\n          </div>\n        </CardContent>\n      </Card>\n    </section>\n  )\n}\n"
};

function stat(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !args[0].trim() || args[0].startsWith('--')) throw new Error('Uso: node configure-connection.mjs <monorepo>');
  const root = resolve(args[0]);
  const writes = new Map();
  function read(name) {
    const path = resolve(root, name), entry = stat(path);
    if (!entry?.isFile() || entry.isSymbolicLink()) throw new Error('Arquivo esperado: ' + path);
    return readFileSync(path, 'utf8');
  }
  read('apps/backend/src/infra/env/env.service.ts');
  read('apps/backend/src/infra/auth/public.ts');
  read('apps/backend/.env');
  for (const [name, content] of Object.entries(templates)) {
    const entry = stat(resolve(root, name));
    if (entry && (!entry.isFile() || entry.isSymbolicLink() || read(name) !== content)) throw new Error('Conflito; adapte preservando alteracoes: ' + name);
    if (!entry) writes.set(name, content);
  }
  const modulePath = 'apps/backend/src/infra/http/http.module.ts';
  let moduleText = read(modulePath);
  if (!moduleText.includes('ConnectionController')) {
    if (!/controllers:\s*\[/.test(moduleText)) throw new Error('HttpModule personalizado: adicione ConnectionController manualmente.');
    moduleText = "import { ConnectionController } from './connection.controller.js';\n" + moduleText.replace(/controllers:\s*\[/, 'controllers: [ConnectionController, ');
    writes.set(modulePath, moduleText);
  }
  const frontEnv = 'apps/frontend/.env';
  if (!stat(resolve(root, frontEnv))) writes.set(frontEnv, templates[frontEnv + '.example']);
  const frontend = JSON.parse(read('apps/frontend/package.json'));
  frontend.devDependencies = { ...frontend.devDependencies, vitest: frontend.devDependencies?.vitest || '^4.1.2' };
  frontend.scripts.test = frontend.scripts.test || 'vitest run';
  writes.set('apps/frontend/package.json', JSON.stringify(frontend, null, 2) + '\n');
  const shared = JSON.parse(read('packages/shared/package.json'));
  shared.exports = { ...shared.exports, './connection-check': { types: './dist/connection-check.d.ts', import: './dist/connection-check.js' } };
  writes.set('packages/shared/package.json', JSON.stringify(shared, null, 2) + '\n');
  const rootManifest = JSON.parse(read('package.json'));
  rootManifest.scripts = { ...rootManifest.scripts, 'db:up': 'docker compose up -d --wait db', 'db:stop': 'docker compose stop db' };
  writes.set('package.json', JSON.stringify(rootManifest, null, 2) + '\n');
  const turbo = JSON.parse(read('turbo.json'));
  const backendVariables = ['PORT', 'DATABASE_URL', 'CORS_ORIGINS', 'JWT_PRIVATE_KEY', 'JWT_PUBLIC_KEY'];
  for (const task of ['build', 'typecheck', 'test']) {
    turbo.tasks[task].inputs = [...new Set([...(turbo.tasks[task].inputs || ['$TURBO_DEFAULT$']), '.env', '.env.*'])];
    turbo.tasks[task].env = [...new Set([...(turbo.tasks[task].env || []), ...backendVariables, 'VITE_*'])];
  }
  turbo.tasks.dev.passThroughEnv = [...new Set([...(turbo.tasks.dev.passThroughEnv || []), ...backendVariables, 'VITE_*'])];
  turbo.tasks.test.outputs = [];
  writes.set('turbo.json', JSON.stringify(turbo, null, 2) + '\n');
  for (const name of writes.keys()) {
    const path = resolve(root, name), entry = stat(path);
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
  console.log('Conexao integrada ao EnvService e AuthModule atuais. /connection usa Public; outras rotas mantem sua protecao.');
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
