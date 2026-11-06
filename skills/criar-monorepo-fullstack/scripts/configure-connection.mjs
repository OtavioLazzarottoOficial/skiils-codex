#!/usr/bin/env node
import { lstatSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname, parse } from "node:path";
import { fileURLToPath } from "node:url";
const templateRoot = fileURLToPath(
  new URL("../assets/connection/", import.meta.url),
);
const templateNames = [
  "apps/frontend/.env.example",
  "packages/shared/src/connection-check.ts",
  "apps/backend/src/infra/http/configure-app.ts",
  "apps/backend/src/infra/http/connection.controller.ts",
  "apps/backend/test/connection.e2e-spec.ts",
  "apps/frontend/src/env.d.ts",
  "apps/frontend/src/lib/api.ts",
  "apps/frontend/src/lib/api.spec.ts",
  "apps/frontend/vitest.config.ts",
  "apps/frontend/src/routes/connection.tsx",
];
const templates = Object.fromEntries(
  templateNames.map((name) => [
    name,
    readFileSync(resolve(templateRoot, name), "utf8"),
  ]),
);

function stat(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !args[0].trim() || args[0].startsWith("--"))
    throw new Error("Uso: node configure-connection.mjs <monorepo>");
  const root = resolve(args[0]);
  const writes = new Map();
  function read(name) {
    const path = resolve(root, name),
      entry = stat(path);
    if (!entry?.isFile() || entry.isSymbolicLink())
      throw new Error("Arquivo esperado: " + path);
    return readFileSync(path, "utf8");
  }
  const backendTsconfig = JSON.parse(read("apps/backend/tsconfig.json"));
  if (
    backendTsconfig.compilerOptions?.rewriteRelativeImportExtensions !== true
  ) {
    throw new Error(
      "Backend desatualizado: gere a base com criar-estrutura-backend-ddd atual (imports .ts e rewriteRelativeImportExtensions).",
    );
  }
  read("apps/backend/vitest.shared.ts");
  read("apps/backend/src/infra/env/env.service.ts");
  read("apps/backend/src/infra/auth/public.ts");
  read("apps/backend/.env");
  for (const [name, content] of Object.entries(templates)) {
    const entry = stat(resolve(root, name));
    if (
      entry &&
      (!entry.isFile() || entry.isSymbolicLink() || read(name) !== content)
    )
      throw new Error("Conflito; adapte preservando alteracoes: " + name);
    if (!entry) writes.set(name, content);
  }
  const modulePath = "apps/backend/src/infra/http/http.module.ts";
  let moduleText = read(modulePath);
  if (!moduleText.includes("ConnectionController")) {
    if (!/controllers:\s*\[/.test(moduleText))
      throw new Error(
        "HttpModule personalizado: adicione ConnectionController manualmente.",
      );
    moduleText =
      "import { ConnectionController } from './connection.controller.ts';\n" +
      moduleText.replace(
        /controllers:\s*\[/,
        "controllers: [ConnectionController, ",
      );
    writes.set(modulePath, moduleText);
  }
  const frontEnv = "apps/frontend/.env";
  if (!stat(resolve(root, frontEnv)))
    writes.set(frontEnv, templates[frontEnv + ".example"]);
  const frontend = JSON.parse(read("apps/frontend/package.json"));
  const backend = JSON.parse(read("apps/backend/package.json"));
  const vitestVersion = backend.devDependencies?.vitest;
  if (!vitestVersion)
    throw new Error("Vitest ausente no backend; use a skill de base atual.");
  frontend.devDependencies = {
    ...frontend.devDependencies,
    vitest: frontend.devDependencies?.vitest || vitestVersion,
  };
  frontend.scripts.test = frontend.scripts.test || "vitest run";
  writes.set(
    "apps/frontend/package.json",
    JSON.stringify(frontend, null, 2) + "\n",
  );
  const shared = JSON.parse(read("packages/shared/package.json"));
  shared.exports = {
    ...shared.exports,
    "./connection-check": {
      types: "./dist/connection-check.d.ts",
      import: "./dist/connection-check.js",
    },
  };
  writes.set(
    "packages/shared/package.json",
    JSON.stringify(shared, null, 2) + "\n",
  );
  const rootManifest = JSON.parse(read("package.json"));
  rootManifest.scripts = {
    ...rootManifest.scripts,
    "db:up": "docker compose up -d --wait db",
    "db:stop": "docker compose stop db",
  };
  writes.set("package.json", JSON.stringify(rootManifest, null, 2) + "\n");
  const turbo = JSON.parse(read("turbo.json"));
  const backendVariables = [
    "PORT",
    "DATABASE_URL",
    "CORS_ORIGINS",
    "JWT_PRIVATE_KEY",
    "JWT_PUBLIC_KEY",
  ];
  for (const task of ["build", "typecheck", "test"]) {
    turbo.tasks[task].inputs = [
      ...new Set([
        ...(turbo.tasks[task].inputs || ["$TURBO_DEFAULT$"]),
        ".env",
        ".env.*",
      ]),
    ];
    turbo.tasks[task].env = [
      ...new Set([
        ...(turbo.tasks[task].env || []),
        ...backendVariables,
        "VITE_*",
      ]),
    ];
  }
  turbo.tasks.dev.passThroughEnv = [
    ...new Set([
      ...(turbo.tasks.dev.passThroughEnv || []),
      ...backendVariables,
      "VITE_*",
    ]),
  ];
  turbo.tasks.test.outputs = [];
  writes.set("turbo.json", JSON.stringify(turbo, null, 2) + "\n");
  for (const name of writes.keys()) {
    const path = resolve(root, name),
      entry = stat(path);
    if (entry && (!entry.isFile() || entry.isSymbolicLink()))
      throw new Error("Conflito: " + path);
    for (let parent = dirname(path); ; parent = dirname(parent)) {
      const item = stat(parent);
      if (item && (!item.isDirectory() || item.isSymbolicLink()))
        throw new Error("Pasta invalida: " + parent);
      if (parent === parse(parent).root) break;
    }
  }
  for (const [name, content] of writes) {
    const path = resolve(root, name);
    mkdirSync(dirname(path), { recursive: true });
    if (!stat(path) || readFileSync(path, "utf8") !== content)
      writeFileSync(path, content, "utf8");
  }
  console.log(
    "Conexao integrada ao EnvService e AuthModule atuais. /connection usa Public; outras rotas mantem sua protecao.",
  );
}
try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
