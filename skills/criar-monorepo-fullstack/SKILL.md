---
name: criar-monorepo-fullstack
description: Criar um monorepo Turborepo com backend NestJS/DDD, frontend React/shadcn/TanStack Router e packages/shared, coordenando as duas skills especializadas instaladas. Usar para iniciar essa base fullstack.
---

# Criar monorepo fullstack

Entregue um monorepo executável com instalação centralizada e as apps preparadas pelas skills existentes. Esta skill coordena a composição; as regras de cada stack continuam nas duas skills especializadas.

## Skills necessárias

Localize e leia antes de preparar cada app:
- criar-estrutura-backend-ddd: gere o backend com sua versão instalada.
- iniciar-frontend-shadcn-tanstack: prepare o frontend com sua versão instalada.

Localize-as pelo catálogo ou pelas pastas irmãs desta skill. Não copie o conteúdo dos geradores para esta skill. Se alguma dependência estiver ausente, informe qual falta e não declare o monorepo completo.

## Estrutura final

~~~text
<destino>/
  apps/
    backend/           # NestJS e DDD conforme a skill instalada
    frontend/          # React, TypeScript, Vite, shadcn/ui e TanStack Router
  packages/
    shared/
      src/index.ts
      package.json
      tsconfig.json
  package.json
  package-lock.json
  turbo.json
  .gitignore
~~~

A base usa npm workspaces, alinhado ao backend atual. Nomeie os pacotes @repo/backend, @repo/frontend e @repo/shared. Em um workspace existente com outro gerenciador, respeite sua escolha e adapte os comandos e vínculos, sem misturar lockfiles.

## Preparação da raiz

- Resolva o destino a partir do pedido. Se não for inferível, pergunte.
- Inspecione instruções, arquivos e manifests existentes. Não execute inicializadores sobre arquivos incompatíveis.
- Para uma base nova com npm, execute:
  node "<pasta-desta-skill>/scripts/init-monorepo.mjs" "<destino>"
- O [script](scripts/init-monorepo.mjs) prepara somente a raiz, os diretórios das apps e o pacote shared. Instalar o Turbo e preencher as apps são etapas seguintes, obrigatórias.
- Ele registra a versão local do npm em packageManager. Requer Node.js compatível com ambas as skills, atualmente 24.15+.

## Preparar as apps

1. Use criar-estrutura-backend-ddd para gerar apps/backend. Neste fluxo, execute seu gerador com --skip-install para consolidar a instalação na raiz depois de preparar os manifests; isso não dispensa a instalação final.
2. Use iniciar-frontend-shadcn-tanstack em apps/frontend, com npm. Como o diretório já é parte de um workspace, prefira a configuração de Vite/shadcn para projeto existente ou um scaffold que preserve os manifests da raiz. Instale componentes reais pelo CLI oficial, direcionado a apps/frontend.
3. Renomeie os manifests para @repo/backend e @repo/frontend. Adicione a ambos a dependência local "@repo/shared": "*" e preserve o nome/versão 0.0.0 do pacote shared; npm vincula o workspace local.
4. Exponha dev, build, lint e typecheck nas duas apps. No backend, dev pode ser um alias de nest start --watch; preserve start:dev e os demais scripts da skill. Testes unitários e E2E do backend continuam disponíveis.
5. No frontend, gere routeTree.gen.ts antes da checagem de tipos e do build, inclusive em checkout limpo. Use uma ferramenta de geração compatível com a versão do roteador, ou invoque o build Vite antes da checagem. Não dependa de o servidor dev já ter rodado.
6. Use portas distintas, por padrão backend 3000 e frontend 5173. Ajuste configurações existentes caso haja conflito.
7. Execute npm install na raiz para instalar Turbo e todos os workspaces e produzir um único package-lock.json. Não deixe lockfiles de instalações independentes nas apps. Evite gerar esses lockfiles; se um inicializador os criar, verifique a origem antes de removê-los.
8. Confirme que @repo/shared resolve para packages/shared localmente, sem buscar um pacote externo.

## Integração e variáveis de ambiente

Depois de preparar as apps e antes da instalação final, execute:
node "<pasta-desta-skill>/scripts/configure-connection.mjs" "<destino>"

O [configurador](scripts/configure-connection.mjs) adiciona:
- apps/backend/.env e .env.example: PORT=3000 e FRONTEND_URL=http://localhost:5173.
- apps/frontend/.env e .env.example: VITE_API_URL=http://localhost:3000.
- Validação do ambiente do backend com Zod e leitura do .env relativa ao arquivo, tanto em src quanto em dist. Variáveis do processo têm precedência.
- CORS com lista explícita de origens, configurado antes de listen. Não libere "*" por padrão.
- GET /connection no backend e /connection no frontend com botão e estados de carregamento, sucesso, erro HTTP, rede e timeout.
- Contrato compartilhado exportado por @repo/shared/connection-check e testes do contrato HTTP/CORS e do cliente frontend.
- Entradas .env e VITE_* no cache de tarefas do Turbo.

Adicione um link para /connection na navegação do frontend, respeitando seu layout. A comunicação testada é chamada do navegador seguida de resposta da API; não crie uma chamada HTTP de retorno do servidor para uma SPA.

O script preserva .env já existente e recusa substituir arquivos de implementação personalizados. Se houver conflito, adapte os pontos indicados preservando o código; não force sobrescrita. Mantenha as URLs coerentes com as portas escolhidas. Se alterar a porta do frontend, ajuste também FRONTEND_URL.

Mantenha .env fora do Git e .env.example versionável e sem segredos. VITE_* é informação pública compilada no frontend. Se VITE_API_URL mudar, reinicie o Vite e refaça o build de produção.

## Código compartilhado e tarefas

- Shared começa com um contrato mínimo de diagnóstico da conexão. Adicione contratos e utilitários quando houver necessidade real; não invente entidades ou regras de negócio de exemplo.
- Shared não importa NestJS, React, Prisma, nem arquivos das apps. As apps podem depender de shared.
- O pacote shared exporta JavaScript compilado e declarações em dist para funcionar no Node ESM e no Vite.
- turbo.json usa tasks, build com dependsOn ["^build"] e outputs ["dist/**"]; dev é persistent e cache false. Preserve scripts do pacote raiz como orquestração, sem chamar a si mesmos recursivamente.
- Shared precisa estar compilado antes de o backend importar seu JavaScript. A configuração de dev constrói dependências primeiro; ao adicionar uso ativo de shared, explique que alterações nele exigem rebuild/reinício ou configure um watcher apropriado ao fluxo.
- Mantenha src/domain vazia no backend conforme a skill atual. Prisma, JWT, bcrypt e módulos opcionais entram quando a skill de backend ganhar esses incrementos; não anuncie bibliotecas ainda não instaladas.

## Verificação e entrega

- Execute na raiz npm run build, npm run typecheck, npm run lint e npm test; execute os E2E do backend.
- Inspecione o plano do Turbo com npx turbo run build --dry=json para confirmar apps/backend, apps/frontend e packages/shared e a ordem de shared antes das apps.
- Confira npm run dev com ambas as apps e os endpoints/páginas iniciais; encerre os processos de verificação. Verifique as rotas do frontend conforme sua skill.
- Execute os testes de ambiente e CORS do backend e do cliente HTTP do frontend. Confira a chamada real em /connection no navegador e uma falha de rede isolada, sem encerrar servidores preexistentes.
- Verifique preflight e ausência de Access-Control-Allow-Origin para origens não autorizadas. CORS limita a leitura no navegador, não substitui autenticação.
- Relate a árvore criada, comandos de desenvolvimento, portas e verificações executadas. Se uma etapa falhar, reporte a pendência; somente preparar a raiz não conclui a execução desta skill.

## Documentação

Consulte quando a etapa exigir:
- CORS: https://docs.nestjs.com/security/cors
- Ambiente do Vite: https://vite.dev/guide/env-and-mode
- Workspaces e estrutura: https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
- Tarefas e cache: https://turborepo.dev/docs/crafting-your-repository/configuring-tasks
- Frontend e backend: links mantidos nas respectivas skills.
