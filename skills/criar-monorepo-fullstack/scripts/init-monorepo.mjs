#!/usr/bin/env node
// Prepara a raiz e shared; as skills especializadas completam as apps.
import { lstatSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, parse, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

function stat(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--help' && args.length === 1) {
    console.log('Uso: node init-monorepo.mjs <destino>');
    console.log('Prepara npm workspaces, Turbo e shared. As skills de backend/frontend e npm install completam a base.');
    return;
  }
  if (args.length !== 1 || !args[0].trim() || args[0].startsWith('--')) throw new Error('Informe uma pasta de destino.');
  const root = resolve(args[0]);
  for (let current = root; ; current = dirname(current)) {
    if (stat(current)?.isSymbolicLink()) throw new Error('Destino com link: ' + current);
    if (current === parse(current).root) break;
  }
  const npm = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'npm --version'], { encoding: 'utf8', windowsHide: true })
    : spawnSync('npm', ['--version'], { encoding: 'utf8' });
  if (npm.error || npm.status !== 0 || !/^\d+\.\d+\.\d+$/.test(npm.stdout.trim())) throw new Error('npm indisponivel.');
  const name = basename(root).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'monorepo';
  const json = value => JSON.stringify(value, null, 2) + '\n';
  const files = {
    'package.json': json({
      name, private: true, version: '0.0.0', packageManager: 'npm@' + npm.stdout.trim(),
      engines: { node: '>=24.15.0' }, workspaces: ['apps/*', 'packages/*'],
      scripts: { dev: 'turbo run dev', build: 'turbo run build', lint: 'turbo run lint',
        typecheck: 'turbo run typecheck', test: 'turbo run test', 'test:e2e': 'turbo run test:e2e' },
      devDependencies: { turbo: '^2.0.0' }
    }),
    'turbo.json': json({
      $schema: 'https://turborepo.dev/schema.json',
      tasks: {
        build: { dependsOn: ['^build'], outputs: ['dist/**'] },
        dev: { dependsOn: ['^build'], cache: false, persistent: true,
          passThroughEnv: ['PORT', 'NODE_ENV', 'VITE_*'] },
        lint: { dependsOn: ['^build'] },
        typecheck: { dependsOn: ['^build'] },
        test: { dependsOn: ['^build'], outputs: [] },
        'test:e2e': { dependsOn: ['^build'], cache: false }
      }
    }),
    '.gitignore': 'node_modules/\ndist/\n.turbo/\ncoverage/\n*.tsbuildinfo\n.env\n.env.*\n!.env.example\n',
    'packages/shared/package.json': json({
      name: '@repo/shared', private: true, version: '0.0.0', type: 'module',
      exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
      scripts: { build: 'tsc -p tsconfig.json', typecheck: 'tsc -p tsconfig.json --noEmit' },
      devDependencies: { typescript: '^6.0.2' }
    }),
    'packages/shared/tsconfig.json': json({
      compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext',
        target: 'ES2023', strict: true, declaration: true,
        rootDir: 'src', outDir: 'dist', skipLibCheck: true, types: [] },
      include: ['src/**/*.ts']
    }),
    'packages/shared/src/index.ts': '// Contratos e utilitarios independentes de framework entram aqui conforme a necessidade.\nexport {};\n'
  };
  const directories = ['', 'apps', 'apps/backend', 'apps/frontend', 'packages', 'packages/shared', 'packages/shared/src'];
  for (const directory of directories) {
    const path = resolve(root, directory);
    const entry = stat(path);
    if (entry && (!entry.isDirectory() || entry.isSymbolicLink())) throw new Error('Conflito com pasta: ' + path);
  }
  const pending = [];
  for (const [name, content] of Object.entries(files)) {
    const path = resolve(root, name);
    const entry = stat(path);
    if (entry) {
      if (!entry.isFile() || entry.isSymbolicLink() || !readFileSync(path).equals(Buffer.from(content))) {
        throw new Error('Arquivo existente diferente: ' + path);
      }
    } else pending.push([path, content]);
  }
  for (const directory of directories) mkdirSync(resolve(root, directory), { recursive: true });
  for (const [path, content] of pending) writeFileSync(path, content, { flag: 'wx' });
  console.log(JSON.stringify({ destination: root, filesCreated: pending.length,
    next: 'Execute as duas skills nas apps, ajuste seus manifests e execute npm install na raiz.' }, null, 2));
}
try { main(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
