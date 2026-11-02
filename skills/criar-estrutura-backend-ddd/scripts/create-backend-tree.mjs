#!/usr/bin/env node
// Base NestJS + DDD derivada do projeto-base em 31/10/2026.
// Arquivo independente: Node.js, sem dependencias npm.
import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, parse, relative, isAbsolute, basename } from 'node:path';

const directories = [
  "src",
  "src/core",
  "src/core/entities",
  "src/core/error",
  "src/core/events",
  "src/core/repositories",
  "src/core/types",
  "src/domain",
  "src/infra",
  "src/infra/http",
  "test"
];
const files = {
  "src/core/either.spec.ts": "import { Either, left, right } from './either.js';\n\nfunction doSomeThing(shouldSuccess: boolean): Either<string, number> {\n  if (shouldSuccess) {\n    return right(10);\n  } else {\n    return left('error');\n  }\n}\n\n// Wrap your tests in a describe block for better organization\ndescribe('doSomeThing', () => {\n  it('success result', () => {\n    const result = doSomeThing(true);\n    expect(result.isRight()).toBe(true);\n    expect(result.isLeft()).toBe(false);\n  });\n\n  it('error result', () => {\n    const result = doSomeThing(false);\n    expect(result.isLeft()).toBe(true);\n    expect(result.isRight()).toBe(false);\n  });\n});\n",
  "src/core/either.ts": "// Error\nexport class Left<L, R> {\n  readonly value: L;\n\n  constructor(value: L) {\n    this.value = value;\n  }\n\n  isRight(): this is Right<L, R> {\n    return false;\n  }\n\n  isLeft(): this is Left<L, R> {\n    return true;\n  }\n}\n\n// Success\nexport class Right<L, R> {\n  readonly value: R;\n\n  constructor(value: R) {\n    this.value = value;\n  }\n\n  isRight(): this is Right<L, R> {\n    return true;\n  }\n\n  isLeft(): this is Left<L, R> {\n    return false;\n  }\n}\n\nexport type Either<L, R> = Left<L, R> | Right<L, R>;\n\nexport const left = <L, R>(value: L): Either<L, R> => {\n  return new Left(value);\n};\n\nexport const right = <L, R>(value: R): Either<L, R> => {\n  return new Right(value);\n};\n",
  "src/core/entities/aggregate-root.ts": "import { DomainEvent } from '../events/domain-event.js';\nimport { DomainEvents } from '../events/domain-events.js';\nimport { Entity } from './entity.js';\n\nexport abstract class AggregateRoot<Props> extends Entity<Props> {\n  private _domainEvents: DomainEvent[] = [];\n\n  get domainEvents(): DomainEvent[] {\n    return this._domainEvents;\n  }\n\n  protected addDomainEvent(domainEvent: DomainEvent): void {\n    this._domainEvents.push(domainEvent);\n    DomainEvents.markAggregateForDispatch(this);\n  }\n\n  public clearEvents() {\n    this._domainEvents = [];\n  }\n}\n",
  "src/core/entities/entity.ts": "import { UniqueEntityID } from './unique-entity-id.js';\n\nexport abstract class Entity<Props> {\n  private _id: UniqueEntityID;\n  protected props: Props;\n\n  get id() {\n    return this._id;\n  }\n\n  protected constructor(props: Props, id?: UniqueEntityID) {\n    this.props = props;\n    this._id = id ?? new UniqueEntityID();\n  }\n\n  public equals(entity: Entity<unknown>) {\n    if (entity === this) {\n      return true;\n    }\n\n    if (entity.id === this._id) {\n      return true;\n    }\n\n    return false;\n  }\n}\n",
  "src/core/entities/object-value.ts": "export abstract class ValueObject<Props> {\n  protected props: Props;\n\n  protected constructor(props: Props) {\n    this.props = props;\n  }\n\n  public equals(vo: ValueObject<unknown>) {\n    if (vo === null || vo === undefined) {\n      return true;\n    }\n\n    if (vo.props === undefined) {\n      return false;\n    }\n\n    return JSON.stringify(vo.props) === JSON.stringify(this.props);\n  }\n}\n",
  "src/core/entities/unique-entity-id.ts": "import { randomUUID } from 'node:crypto';\n\nexport class UniqueEntityID {\n  private value: string;\n\n  toString() {\n    return this.value;\n  }\n\n  toValue() {\n    return this.value;\n  }\n\n  constructor(value?: string) {\n    this.value = value ?? randomUUID();\n  }\n\n  public equals(id: UniqueEntityID) {\n    return id.toValue() === this.value;\n  }\n}\n",
  "src/core/error/use-case-error.ts": "export interface UseCaseError {\n  message: string;\n}\n",
  "src/core/events/domain-event.ts": "import { UniqueEntityID } from '../entities/unique-entity-id.js';\n\nexport interface DomainEvent {\n  ocurredAt: Date;\n  getAggregateId(): UniqueEntityID;\n}\n",
  "src/core/events/domain-events.spec.ts": "import { describe, it, expect, vi } from 'vitest';\nimport { DomainEvent } from './domain-event.js';\nimport { AggregateRoot } from '../entities/aggregate-root.js';\nimport { DomainEvents } from './domain-events.js';\nimport { UniqueEntityID } from '../entities/unique-entity-id.js';\n\nclass CustomAggregateCreated implements DomainEvent {\n  public ocurredAt: Date;\n  private aggregate: CustomAggregate;\n\n  constructor(aggregate: CustomAggregate) {\n    this.aggregate = aggregate;\n    this.ocurredAt = new Date();\n  }\n\n  public getAggregateId(): UniqueEntityID {\n    return this.aggregate.id;\n  }\n}\n\nclass CustomAggregate extends AggregateRoot<null> {\n  static create() {\n    const aggregate = new CustomAggregate(null);\n\n    aggregate.addDomainEvent(new CustomAggregateCreated(aggregate));\n\n    return aggregate;\n  }\n}\n\ndescribe('domain events', () => {\n  it('should be able to dispatch and listen to events', async () => {\n    await Promise.resolve(); // await next tick\n\n    const callbackSpy = vi.fn();\n\n    // Subscriber cadastrado\n    DomainEvents.register(callbackSpy, CustomAggregateCreated.name);\n\n    // Criando um agregado sem salvar\n    const aggregate = CustomAggregate.create();\n\n    // Assegurando que o evento foi criado mas não disparado\n    expect(aggregate.domainEvents).toHaveLength(1);\n\n    // Disparando os eventos\n    DomainEvents.dispatchEventsForAggregate(aggregate.id);\n\n    // O subscriber ouve o evento\n    expect(callbackSpy).toHaveBeenCalled();\n\n    expect(aggregate.domainEvents).toHaveLength(0);\n  });\n});\n",
  "src/core/events/domain-events.ts": "import { AggregateRoot } from '../entities/aggregate-root.js';\nimport { UniqueEntityID } from '../entities/unique-entity-id.js';\nimport { DomainEvent } from './domain-event.js';\n\ntype DomainEventCallback = (event: DomainEvent) => void;\n\nexport class DomainEvents {\n  private static handlersMap: Record<string, DomainEventCallback[]> = {};\n  private static markedAggregates: AggregateRoot<any>[] = [];\n\n  public static markAggregateForDispatch(aggregate: AggregateRoot<any>) {\n    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);\n\n    if (!aggregateFound) {\n      this.markedAggregates.push(aggregate);\n    }\n  }\n\n  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>) {\n    aggregate.domainEvents.forEach((event: DomainEvent) =>\n      this.dispatch(event),\n    );\n  }\n\n  private static removeAggregateFromMarkedDispatchList(\n    aggregate: AggregateRoot<any>,\n  ) {\n    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));\n\n    if (index !== -1) {\n      this.markedAggregates.splice(index, 1);\n    }\n  }\n\n  private static findMarkedAggregateByID(\n    id: UniqueEntityID,\n  ): AggregateRoot<any> | undefined {\n    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id));\n  }\n\n  public static dispatchEventsForAggregate(id: UniqueEntityID) {\n    const aggregate = this.findMarkedAggregateByID(id);\n\n    if (aggregate) {\n      this.dispatchAggregateEvents(aggregate);\n      aggregate.clearEvents();\n      this.removeAggregateFromMarkedDispatchList(aggregate);\n    }\n  }\n\n  public static register(\n    callback: DomainEventCallback,\n    eventClassName: string,\n  ) {\n    const wasEventRegisteredBefore = eventClassName in this.handlersMap;\n\n    if (!wasEventRegisteredBefore) {\n      this.handlersMap[eventClassName] = [];\n    }\n\n    this.handlersMap[eventClassName].push(callback);\n  }\n\n  public static clearHandlers() {\n    this.handlersMap = {};\n  }\n\n  public static clearMarkedAggregates() {\n    this.markedAggregates = [];\n  }\n\n  private static dispatch(event: DomainEvent) {\n    const eventClassName: string = event.constructor.name;\n\n    const isEventRegistered = eventClassName in this.handlersMap;\n\n    if (isEventRegistered) {\n      const handlers = this.handlersMap[eventClassName];\n\n      for (const handler of handlers) {\n        handler(event);\n      }\n    }\n  }\n}\n",
  "src/core/events/event-handler.ts": "export interface EventHandler {\n  setupSubscriptions(): void;\n}\n",
  "src/core/repositories/pagination-params.ts": "export interface PaginationParams {\n  page: number;\n}\n",
  "src/core/types/optional.ts": "/**\n * Make some property optional on type\n *\n * @example\n * ```typescript\n * type Post {\n *  id: string;\n *  name: string;\n *  email: string;\n * }\n *\n * Optional<Post, 'id' | 'email'>\n * ```\n **/\n\nexport type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;\n",
  "src/infra/main.ts": "import 'reflect-metadata';\nimport { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module.js';\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  await app.listen(process.env.PORT ?? 3000);\n}\nawait bootstrap();\n",
  "test/app.e2e-spec.ts": "import { Test, TestingModule } from '@nestjs/testing';\nimport { INestApplication } from '@nestjs/common';\nimport request from 'supertest';\nimport { App } from 'supertest/types.js';\nimport { AppModule } from '../src/infra/app.module.js';\n\ndescribe('AppController (e2e)', () => {\n  let app: INestApplication<App>;\n\n  beforeEach(async () => {\n    const moduleFixture: TestingModule = await Test.createTestingModule({\n      imports: [AppModule],\n    }).compile();\n\n    app = moduleFixture.createNestApplication();\n    await app.init();\n  });\n\n  it('/ (GET)', () => {\n    return request(app.getHttpServer())\n      .get('/')\n      .expect(200)\n      .expect('Hello World!');\n  });\n\n  afterEach(async () => {\n    await app.close();\n  });\n});\n",
  "src/infra/app.module.ts": "import { Module } from '@nestjs/common';\nimport { HttpModule } from './http/http.module.js';\n\n@Module({ imports: [HttpModule] })\nexport class AppModule {}\n",
  "src/infra/http/http.module.ts": "import { Module } from '@nestjs/common';\nimport { AppController } from './app.controller.js';\n\n@Module({ controllers: [AppController] })\nexport class HttpModule {}\n",
  "src/infra/http/app.controller.ts": "import { Controller, Get } from '@nestjs/common';\n\n@Controller()\nexport class AppController {\n  @Get()\n  getHello(): string {\n    return 'Hello World!';\n  }\n}\n",
  "package.json": "{\n  \"name\": \"backend-ddd\",\n  \"version\": \"0.0.1\",\n  \"description\": \"\",\n  \"author\": \"\",\n  \"private\": true,\n  \"license\": \"UNLICENSED\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"build\": \"nest build\",\n    \"format\": \"prettier --write \\\"src/**/*.ts\\\" \\\"test/**/*.ts\\\"\",\n    \"start\": \"nest start\",\n    \"start:dev\": \"nest start --watch\",\n    \"start:debug\": \"nest start --debug --watch\",\n    \"start:prod\": \"node dist/infra/main.js\",\n    \"lint\": \"oxlint --type-aware src/ test/\",\n    \"test\": \"vitest run\",\n    \"test:watch\": \"vitest\",\n    \"test:cov\": \"vitest run --coverage\",\n    \"test:debug\": \"vitest --inspect-brk --no-file-parallelism\",\n    \"test:e2e\": \"vitest run --config ./vitest.config.e2e.ts\",\n    \"typecheck\": \"tsc --noEmit --incremental false\"\n  },\n  \"dependencies\": {\n    \"@nestjs/common\": \"^12.0.1\",\n    \"@nestjs/core\": \"^12.0.1\",\n    \"@nestjs/platform-express\": \"^12.0.1\",\n    \"reflect-metadata\": \"^0.2.2\",\n    \"rxjs\": \"^7.8.1\"\n  },\n  \"devDependencies\": {\n    \"@nestjs/cli\": \"^12.0.0\",\n    \"@nestjs/schematics\": \"^12.0.0\",\n    \"@nestjs/testing\": \"^12.0.1\",\n    \"@types/express\": \"^5.0.0\",\n    \"@types/node\": \"^24.0.0\",\n    \"@types/supertest\": \"^7.0.0\",\n    \"@vitest/coverage-v8\": \"^4.1.2\",\n    \"oxlint\": \"^1.58.0\",\n    \"oxlint-tsgolint\": \"^7.0.2001\",\n    \"prettier\": \"^3.4.2\",\n    \"source-map-support\": \"^0.5.21\",\n    \"supertest\": \"^7.0.0\",\n    \"typescript\": \"^6.0.2\",\n    \"vite\": \"^8.0.0\",\n    \"vitest\": \"^4.1.2\"\n  },\n  \"engines\": {\n    \"node\": \">=24.15.0\"\n  }\n}\n",
  "tsconfig.json": "{\n  \"compilerOptions\": {\n    \"module\": \"NodeNext\",\n    \"moduleResolution\": \"NodeNext\",\n    \"resolvePackageJsonExports\": true,\n    \"esModuleInterop\": true,\n    \"isolatedModules\": true,\n    \"declaration\": true,\n    \"removeComments\": true,\n    \"emitDecoratorMetadata\": true,\n    \"experimentalDecorators\": true,\n    \"allowSyntheticDefaultImports\": true,\n    \"target\": \"ES2023\",\n    \"sourceMap\": true,\n    \"outDir\": \"./dist\",\n    \"rootDir\": \".\",\n    \"incremental\": true,\n    \"skipLibCheck\": true,\n    \"strict\": true,\n    \"strictPropertyInitialization\": false,\n    \"types\": [\n      \"vitest/globals\",\n      \"node\"\n    ],\n    \"verbatimModuleSyntax\": false\n  }\n}\n",
  "tsconfig.build.json": "{\n  \"extends\": \"./tsconfig.json\",\n  \"compilerOptions\": {\n    \"rootDir\": \"./src\"\n  },\n  \"include\": [\"src\"],\n  \"exclude\": [\"node_modules\", \"test\", \"dist\", \"**/*spec.ts\"]\n}\n",
  "nest-cli.json": "{\n  \"$schema\": \"https://json.schemastore.org/nest-cli\",\n  \"collection\": \"@nestjs/schematics\",\n  \"sourceRoot\": \"src\",\n  \"entryFile\": \"infra/main\",\n  \"compilerOptions\": {\n    \"deleteOutDir\": true\n  }\n}\n",
  "vitest.config.ts": "import { defineConfig } from 'vitest/config';\n\nexport default defineConfig({\n  // Resolves the path aliases declared in tsconfig.json, including the ones\n  // added by `nest g library`. Requires Vite 8, which ships this option.\n  resolve: { tsconfigPaths: true },\n  test: {\n    globals: true,\n    root: './',\n    include: ['src/**/*.spec.ts'],\n  },\n});\n",
  "vitest.config.e2e.ts": "import { defineConfig } from 'vitest/config';\n\nexport default defineConfig({\n  resolve: { tsconfigPaths: true },\n  test: {\n    globals: true,\n    root: './',\n    include: ['**/*.e2e-spec.ts'],\n  },\n});\n",
  ".oxlintrc.json": "{\n  \"$schema\": \"./node_modules/oxlint/configuration_schema.json\",\n  \"rules\": {\n    \"typescript/no-explicit-any\": \"off\",\n    \"typescript/no-floating-promises\": \"error\"\n  },\n  \"env\": {\n    \"node\": true\n  }\n}\n",
  ".prettierrc": "{\n  \"singleQuote\": true,\n  \"trailingComma\": \"all\"\n}\n",
  ".gitignore": "# compiled output\n/dist\n/node_modules\n/build\n\n# TypeScript build cache\n*.tsbuildinfo\n\n# Logs\nlogs\n*.log\nnpm-debug.log*\npnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\nlerna-debug.log*\n\n# OS\n.DS_Store\n\n# Tests\n/coverage\n/.nyc_output\n\n# IDEs and editors\n/.idea\n.project\n.classpath\n.c9/\n*.launch\n.settings/\n*.sublime-workspace\n\n# IDE - VSCode\n.vscode/*\n!.vscode/settings.json\n!.vscode/tasks.json\n!.vscode/launch.json\n!.vscode/extensions.json\n\n# dotenv environment variable files\n.env\n.env.development.local\n.env.test.local\n.env.production.local\n.env.local\n\n# temp directory\n.temp\n.tmp\n\n# Runtime data\npids\n*.pid\n*.seed\n*.pid.lock\n\n# Diagnostic reports (https://nodejs.org/api/report.html)\nreport.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json\n",
  ".prettierignore": "node_modules\ndist\ncoverage\npackage-lock.json\n"
};

function stat(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function rejectLinkedAncestors(path) {
  for (let current = path; ; current = dirname(current)) {
    const entry = stat(current);
    if (entry?.isSymbolicLink()) throw new Error('Destino com link simbolico: ' + current);
    if (current === parse(current).root) break;
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Uso: node create-backend-tree.mjs <pasta-destino> [--skip-install]');
    console.log('Cria a base NestJS + DDD e instala dependencias npm. --skip-install gera somente os arquivos.');
    return;
  }
  const skipInstall = args.length === 2 && args[1] === '--skip-install';
  if ((args.length !== 1 && !skipInstall) || args[0].startsWith('--') || !args[0].trim()) {
    throw new Error('Informe uma pasta: node create-backend-tree.mjs <pasta-destino> [--skip-install]');
  }
  const root = resolve(args[0]);
  if (Number(process.versions.node.split('.')[0]) < 24) {
    throw new Error('Use Node.js 24.15+ com npm instalado.');
  }
  rejectLinkedAncestors(root);
  const manifest = JSON.parse(files['package.json']);
  manifest.name = basename(root).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'backend-ddd';
  files['package.json'] = JSON.stringify(manifest, null, 2) + '\n';
  const target = (name) => {
    const result = resolve(root, name);
    const rel = relative(root, result);
    if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('Caminho fora do destino: ' + name);
    return result;
  };

  // Valide todos os conflitos antes de criar qualquer pasta ou arquivo.
  for (const name of ['', ...directories]) {
    const path = name ? target(name) : root;
    const entry = stat(path);
    if (entry && (!entry.isDirectory() || entry.isSymbolicLink())) {
      throw new Error('Conflito com pasta: ' + path);
    }
  }
  const pending = [];
  for (const [name, content] of Object.entries(files)) {
    const path = target(name);
    const entry = stat(path);
    if (entry) {
      if (!entry.isFile() || entry.isSymbolicLink() ||
          !readFileSync(path).equals(Buffer.from(content, 'utf8'))) {
        throw new Error('Arquivo existente diferente ou tipo incompativel: ' + path);
      }
    } else {
      pending.push([path, content]);
    }
  }

  mkdirSync(root, { recursive: true });
  for (const name of directories) mkdirSync(target(name), { recursive: true });
  for (const [path, content] of pending) writeFileSync(path, content, { encoding: 'utf8', flag: 'wx' });
  if (!skipInstall) {
    const options = { cwd: root, stdio: 'inherit', windowsHide: true };
    const installed = process.platform === 'win32'
      ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'npm install --no-audit --no-fund'], options)
      : spawnSync('npm', ['install', '--no-audit', '--no-fund'], options);
    if (installed.error || installed.status !== 0) {
      throw new Error('Arquivos criados, mas npm install falhou. Corrija a causa e execute npm install no destino. ' + (installed.error?.message || ''));
    }
  }
  console.log(JSON.stringify({
    destination: root, dependenciesInstalled: !skipInstall, directories: directories.length,
    filesCreated: pending.length, filesPreserved: Object.keys(files).length - pending.length
  }, null, 2));
}

try { main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
