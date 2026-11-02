#!/usr/bin/env node
import { lstatSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, basename, parse, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const assets = fileURLToPath(new URL('../assets/backend/', import.meta.url));
function stat(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function safeDirectory(path) {
  for (let current = path; ; current = dirname(current)) {
    const entry = stat(current);
    if (entry && (!entry.isDirectory() || entry.isSymbolicLink())) throw new Error('Pasta invalida ou link: ' + current);
    if (current === parse(current).root) break;
  }
}
function command(binary, args, cwd) {
  const result = spawnSync(binary, args, { cwd, stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error('Comando falhou. Arquivos preservados para inspecao: ' + binary);
}
function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Uso: node create-backend-tree.mjs <backend> [--skip-install] [--compose-root <raiz>] [--database-port <porta>]');
    return;
  }
  if (!args[0]?.trim() || args[0].startsWith('--')) throw new Error('Informe a pasta do backend.');
  const root = resolve(args.shift());
  let composeRoot = root;
  let databasePort = 5433;
  let skipInstall = false;
  while (args.length) {
    const flag = args.shift();
    if (flag === '--skip-install') skipInstall = true;
    else if (flag === '--compose-root' && args[0] && !args[0].startsWith('--')) composeRoot = resolve(args.shift());
    else if (flag === '--database-port' && args[0]) databasePort = Number(args.shift());
    else throw new Error('Opcao invalida: ' + flag);
  }
  if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) throw new Error('Porta do banco invalida.');
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 24 || (major === 24 && minor < 15)) throw new Error('Use Node.js 24.15+.');
  if ([root, composeRoot].some(path => path === parse(path).root)) throw new Error('Escolha uma pasta de projeto.');
  safeDirectory(root);
  safeDirectory(composeRoot);
  const directories = [];
  const files = new Map();
  function walk(directory, prefix = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const name = prefix ? prefix + '/' + entry.name : entry.name;
      if (entry.isSymbolicLink()) throw new Error('Link no template.');
      if (entry.isDirectory()) { directories.push(name); walk(join(directory, entry.name), name); }
      else files.set(name, readFileSync(join(directory, entry.name)));
    }
  }
  walk(assets);
  const manifest = JSON.parse(files.get('package.json').toString('utf8'));
  manifest.name = basename(root).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'backend';
  if (root === composeRoot) {
    manifest.scripts['db:up'] = 'docker compose up -d --wait db';
    manifest.scripts['db:stop'] = 'docker compose stop db';
  } else {
    delete manifest.scripts['db:up']; delete manifest.scripts['db:stop'];
  }
  files.set('package.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  const example = files.get('.env.example').toString('utf8').replace('localhost:5433/', 'localhost:' + databasePort + '/');
  files.set('.env.example', Buffer.from(example));
  const projectName = ('base-' + basename(composeRoot).toLowerCase().replace(/[^a-z0-9-]/g, '-')).slice(0, 60);
  const compose = readFileSync(new URL('../assets/compose.yaml', import.meta.url), 'utf8')
    .replace(/^name:.*$/m, 'name: ' + projectName)
    .replace('127.0.0.1:5433:5432', '127.0.0.1:' + databasePort + ':5432');
  const pending = [];
  for (const directory of directories) safeDirectory(resolve(root, directory));
  for (const [name, content] of files) {
    const path = resolve(root, name);
    const entry = stat(path);
    if (entry && (!entry.isFile() || entry.isSymbolicLink() || !readFileSync(path).equals(content))) {
      throw new Error('Arquivo diferente no destino; nenhuma sobrescrita: ' + path);
    }
    if (!entry) pending.push([path, content]);
  }
  const env = stat(resolve(root, '.env'));
  if (env && (!env.isFile() || env.isSymbolicLink())) throw new Error('.env invalido no destino.');
  const composePath = resolve(composeRoot, 'compose.yaml');
  const composeEntry = stat(composePath);
  if (composeEntry && (!composeEntry.isFile() || composeEntry.isSymbolicLink() || readFileSync(composePath, 'utf8') !== compose)) {
    throw new Error('Compose existente diferente; nenhuma sobrescrita.');
  }
  mkdirSync(root, { recursive: true });
  mkdirSync(composeRoot, { recursive: true });
  for (const directory of directories) mkdirSync(resolve(root, directory), { recursive: true });
  for (const [path, content] of pending) writeFileSync(path, content, { flag: 'wx' });
  if (!composeEntry) writeFileSync(composePath, compose, { flag: 'wx' });
  command(process.execPath, [resolve(root, 'scripts/setup-env.mjs')], root);
  if (!skipInstall) {
    if (process.platform === 'win32') command(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'npm install --no-audit --no-fund'], root);
    else command('npm', ['install', '--no-audit', '--no-fund'], root);
    if (process.platform === 'win32') command(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'npm run prisma:generate'], root);
    else command('npm', ['run', 'prisma:generate'], root);
  }
  console.log(JSON.stringify({ backend: root, compose: composePath, filesCreated: pending.length, dependenciesInstalled: !skipInstall,
    auth: 'JWT RS256 global, Public, bcryptjs e throttler', databasePort }, null, 2));
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
