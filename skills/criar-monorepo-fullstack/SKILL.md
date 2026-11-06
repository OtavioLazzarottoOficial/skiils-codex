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

## Definição compartilhada do projeto

Antes da geração, consulte a conversa e os documentos existentes na raiz. Use a skill irmã [definir-projeto](../definir-projeto/SKILL.md) para levantar as informações de negócio ainda necessárias e organizar docs/project-definition.md e docs/implementation-plan.md (ou reutilizar documentos equivalentes). A definição contempla segmento, objetivo, atores, escopo, RF, RN, RNF, critérios de aceitação e tarefas ordenadas por dependência.

Conduza o levantamento uma única vez para o projeto inteiro; ao chamar as skills das apps, forneça os caminhos desses documentos e as decisões já tomadas. Não replique documentação ou perguntas em cada app. Integre resumo e links no README da raiz após a geração, preservando instruções técnicas; os documentos em docs podem ser preparados antes.

Questões de funcionalidades futuras não bloqueiam uma base técnica autorizada. Se o usuário pedir somente a base ou adiar o levantamento, registre essa escolha e o contexto ainda aberto, sem presumir regras pelo nome do projeto. A documentação orienta os próximos ciclos, não dispara implementação de funcionalidades previstas no plano. Registre no plano a conclusão da base apenas após as verificações efetivamente executadas.

## Preparação da raiz

- Resolva o destino a partir do pedido. Se não for inferível, pergunte.
- Inspecione instruções, arquivos e manifests existentes. Não execute inicializadores sobre arquivos incompatíveis.
- Para uma base nova com npm, execute:
  node "<pasta-desta-skill>/scripts/init-monorepo.mjs" "<destino>"
- O [script](scripts/init-monorepo.mjs) prepara somente a raiz, os diretórios das apps e o pacote shared. Instalar o Turbo e preencher as apps são etapas seguintes, obrigatórias.
- Ele registra a versão local do npm em packageManager. Requer Node.js compatível com ambas as skills, atualmente 24.15+.

## Preparar as apps

1. Use criar-estrutura-backend-ddd para gerar apps/backend. Neste fluxo, execute seu gerador com --skip-install --compose-root "<destino>" para consolidar a instalação na raiz depois de preparar os manifests; isso não dispensa a instalação final.
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

O backend já fornece EnvModule/EnvService, Zod, Prisma, AuthModule, JWT RS256, bcryptjs, throttler, .env.example e um par RSA local. O gerador de backend cria compose.yaml na raiz indicada por --compose-root. Não duplique a infraestrutura em infra/config.

O configurador usa arquivos reais em assets/connection (mantenha essa pasta ao transportar a skill), verifica a compatibilidade da base e adiciona:
- .env e .env.example do frontend com VITE_API_URL=http://localhost:3000.
- GET /connection com @Public() e sua página de diagnóstico no frontend.
- Contrato @repo/shared/connection-check e testes HTTP/CORS com PrismaService substituído.
- Scripts db:up/db:stop na raiz e configuração do cache/ambiente do Turbo.

O backend usa CORS_ORIGINS, PORT, DATABASE_URL, JWT_PRIVATE_KEY e JWT_PUBLIC_KEY.
Ajuste CORS_ORIGINS à origem real do frontend. Preserve .env e chaves existentes; nunca copie o par RSA de outro projeto. Não crie outra validação de ambiente nem substitua main.ts ou AuthModule para implementar o diagnóstico.

As rotas / e /health do backend são protegidas por JWT conforme o projeto-base. O endpoint /connection é explicitamente público para o diagnóstico inicial; não crie login nem entidades de usuário sem um pedido de funcionalidade.

Adicione o link /connection à navegação do frontend. A comunicação é chamada do navegador e resposta da API, sem callback para a SPA. Mantenha .env ignorado e exemplos versionáveis; VITE_* contém apenas informação pública.

O configurador recusa conflitos. Se houver código personalizado, adapte os pontos indicados sem sobrescrever alterações do usuário. Antes de conferir o backend em execução, inicie o Compose isolado do projeto; preserve bancos e contêineres externos.

## Código compartilhado e tarefas

- Shared começa com um contrato mínimo de diagnóstico da conexão. Adicione contratos e utilitários quando houver necessidade real; não invente entidades ou regras de negócio de exemplo.
- Shared não importa NestJS, React, Prisma, nem arquivos das apps. As apps podem depender de shared.
- O pacote shared exporta JavaScript compilado e declarações em dist para funcionar no Node ESM e no Vite.
- turbo.json usa tasks, build com dependsOn ["^build"] e outputs ["dist/**"]; dev é persistent e cache false. Preserve scripts do pacote raiz como orquestração, sem chamar a si mesmos recursivamente.
- Shared precisa estar compilado antes de o backend importar seu JavaScript. A configuração de dev constrói dependências primeiro; ao adicionar uso ativo de shared, explique que alterações nele exigem rebuild/reinício ou configure um watcher apropriado ao fluxo.
- Preserve os contratos em domain/auth/application/crypthograpy vindos da skill de backend; as entidades de negócio ainda não existem. Prisma, JWT RS256, bcryptjs e throttler já fazem parte da skill atual; não adicione modelos ou funcionalidades de usuário sem pedido.

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


## Padrões compartilhados com as skills atuais

- Leia as versões instaladas das skills de backend e frontend e preserve suas configurações. A composição não deve reintroduzir padrões antigos por meio de arquivos auxiliares.
- Imports relativos do código TypeScript autoral usam .ts (ou .tsx para componentes). Backend e shared mantêm rewriteRelativeImportExtensions para emitir imports .js no build ESM. Os exports de package.json apontam para JavaScript e declarações compilados em dist; não os troque por .ts. Imports de pacotes como @repo/shared/connection-check mantêm o subpath público.
- Use exclusivamente Vitest nos testes unitários, HTTP/E2E e de integração das apps. Preserve Vitest/SWC com legacyDecorator, decoratorMetadata e reflect-metadata no backend para testar a injeção real do NestJS. Não introduza node:test/Jest nem substitua a configuração herdada do backend.
- Preserve @Injectable() na aplicação como escolha intencional, contratos abstratos como tokens/imports de valor e dependências private readonly. Entidades e objetos de valor independem de NestJS, Prisma e HTTP. Funcionalidades futuras seguem criar-ciclo-ddd, criar-persistencia-prisma e criar-http-nestjs; os testes de usuários/despesas não pertencem à base do monorepo.
- O configurador de conexão recusa uma base sem rewriteRelativeImportExtensions ou sem a configuração compartilhada do Vitest atual; atualize a preparação do backend, sem remendar imports para .js.
- Revise a legibilidade dos arquivos gerados: linhas em branco entre métodos, validações e etapas; guard clauses com chaves e retorno em linha própria. Execute o formatador configurado nas apps antes de build, typecheck, lint e testes. Exclua routeTree.gen.ts da formatação/lint e não instale ferramentas duplicadas.
- Ao mudar templates de conexão, valide scripts e geração em um destino descartável com o backend atual. Confira os imports gerados, os testes Vitest de conexão/CORS e do cliente HTTP, o build do shared e do backend e a preservação de arquivos incompatíveis. Não declare a skill inteira testada apenas por validar o Markdown.
