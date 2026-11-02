# Minhas skills do Codex

Skills pessoais para iniciar projetos backend, frontend e monorepos fullstack.

## Skills incluídas

- `criar-estrutura-backend-ddd`: base NestJS com TypeScript, Vitest e camadas DDD.
- `iniciar-frontend-shadcn-tanstack`: base React, Vite, shadcn/ui e TanStack Router.
- `criar-monorepo-fullstack`: monorepo Turborepo que utiliza as duas skills anteriores.

## Instalar em outro computador

Clone este repositório e execute, no PowerShell, dentro da pasta clonada:

```powershell
New-Item -ItemType Directory -Path "$env:USERPROFILE/.agents/skills" -Force | Out-Null
Copy-Item -Path './skills/*' -Destination "$env:USERPROFILE/.agents/skills" -Recurse
```

Se já houver skills com os mesmos nomes no destino, faça backup e compare antes de substituí-las. Para atualizar uma instalação existente de forma intencional, use `Copy-Item` com `-Force` após revisar as alterações.

No macOS/Linux, copie as três pastas de `skills/` para `~/.agents/skills/`.

Reinicie o Codex caso as skills não apareçam. Peça no chat, por exemplo:

> Use a skill criar-monorepo-fullstack para iniciar meu projeto.

As skills de desenvolvimento exigem Node.js e npm compatíveis com suas instruções. O monorepo exige as três skills instaladas. Plugins e credenciais não estão incluídos.

## Atualizar

Execute `git pull` na cópia deste repositório e copie novamente as pastas para o diretório de skills após revisar as alterações.

## Documentação

https://learn.chatgpt.com/docs/build-skills
