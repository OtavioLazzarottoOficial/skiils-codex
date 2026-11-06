# Minhas skills do Codex

Skills pessoais para definir projetos e desenvolver backends TypeScript/NestJS com DDD, persistência Prisma e HTTP, além de iniciar frontends e monorepos fullstack.

## Skills incluídas

- `definir-projeto`: levantar e documentar contexto, requisitos, regras e plano de implementação.
- `criar-estrutura-backend-ddd`: criar a base NestJS/DDD com Prisma, PostgreSQL e autenticação.
- `criar-ciclo-ddd`: implementar o domínio, os contratos e os testes de um caso de uso.
- `criar-persistencia-prisma`: implementar a persistência Prisma de um ciclo existente.
- `criar-http-nestjs`: expor o ciclo por HTTP com validação, testes e exemplos para REST Client.
- `iniciar-frontend-shadcn-tanstack`: criar a base React com Vite, shadcn/ui e TanStack Router, com atenção à usabilidade.
- `criar-monorepo-fullstack`: criar um monorepo integrando as bases especializadas de backend e frontend.

## Instalar em outro computador

Clone este repositório e, dentro da pasta clonada, execute no PowerShell:

```powershell
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
$destino = Join-Path $codexHome 'skills'
New-Item -ItemType Directory -Path $destino -Force | Out-Null
Copy-Item -Path '.\skills\*' -Destination $destino -Recurse -Force
```

O comando substitui arquivos de mesmo nome no destino. Se houver alterações locais que deseja manter, faça backup e compare antes de executar. Ele não remove arquivos antigos que existam apenas no destino.

No macOS ou Linux, dentro da pasta clonada:

```bash
CODEX_SKILLS_HOME="${CODEX_HOME:-$HOME/.codex}"
mkdir -p "$CODEX_SKILLS_HOME/skills"
cp -R skills/. "$CODEX_SKILLS_HOME/skills/"
```

Reinicie o Codex se as skills não aparecerem. Por exemplo, peça no chat: “Use a skill criar-monorepo-fullstack para iniciar meu projeto.”

Cada skill pode depender das outras skills indicadas em suas instruções. Instale todas as pastas deste repositório para manter os fluxos completos. Node.js, npm e Docker podem ser necessários conforme o projeto. Plugins, credenciais e arquivos de ambiente pessoais não estão incluídos.

## Atualizar

Execute `git pull` na cópia deste repositório, compare com suas alterações locais e repita a cópia para o diretório de skills.

## Documentação

[Documentação sobre skills](https://learn.chatgpt.com/docs/build-skills).
