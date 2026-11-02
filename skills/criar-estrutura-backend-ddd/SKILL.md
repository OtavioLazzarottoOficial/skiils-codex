---
name: criar-estrutura-backend-ddd
description: Criar um projeto base NestJS com instalação npm, TypeScript, Vitest e camadas DDD core/domain/infra. Usar para iniciar essa base ou entregar seu gerador JavaScript; não para implementar funcionalidades de negócio.
---

# Criar a base NestJS com DDD

Execute [scripts/create-backend-tree.mjs](scripts/create-backend-tree.mjs). O gerador é independente, contém os arquivos do modelo e instala as dependências locais com npm; requer Node.js 24.15+ e npm.

## Uso

- Resolva o destino pelo pedido e respeite as instruções aplicáveis. Se não houver destino inferível, pergunte.
- Execute via terminal: `node "<pasta-desta-skill>/scripts/create-backend-tree.mjs" "<destino>"`.
- Use `--skip-install` somente se o usuário pedir geração sem instalação ou para verificar o scaffold offline; informe que as bibliotecas ainda não foram instaladas.
- Se o usuário pedir o gerador como arquivo, copie o .mjs; ele funciona sem depender da pasta da skill.
- Esta versão usa npm, de acordo com o projeto-base. Em workspaces com outro gerenciador ou manifests existentes, preserve a configuração e adapte a instalação ao pedido, sem misturar lockfiles.
- Arquivos existentes idênticos são preservados; conflitos são recusados antes da geração. Não sobrescreva alterações do usuário para forçar uma repetição. Para retomar somente a instalação, execute npm install no destino.

## Estrutura e decisões

- src/core: Either, Entity, AggregateRoot, ValueObject em object-value.ts, UniqueEntityID, eventos, erros, paginação e Optional, com os testes do modelo.
- src/domain: vazia. Usuário, autenticação e criptografia são extensões opcionais futuras.
- src/infra/main.ts: inicialização NestJS.
- src/infra/app.module.ts: módulo raiz.
- src/infra/http: HttpModule e controller mínimo GET / para validar a inicialização.
- test/app.e2e-spec.ts: teste HTTP da aplicação.
- Raiz: package.json, configurações TypeScript/build, Nest CLI, Vitest unitário/E2E, Oxlint, Prettier e arquivos de ignore.
- TypeScript estrito com ESM/NodeNext e extensões .js nos imports locais; Nest entryFile infra/main e saída dist/infra/main.js.
- Preserve o domínio independente de NestJS; os arquivos específicos do framework ficam na infraestrutura.
- O gerador instala NestJS, Express, reflect-metadata, RxJS, CLI local, TypeScript e ferramentas de testes/lint/formatação. npm gera node_modules e package-lock.json; dist é produzido pelo build.
- Não inclua Prisma, Zod, JWT, bcrypt ou observabilidade nesta etapa: serão incrementos próprios. Não copie dist, node_modules, segredos ou AGENTS.md do projeto original.
- Mantenha os nomes do núcleo do modelo; a adaptação dos imports e do bootstrap é necessária para tornar a base executável.

## Verificação e entrega

Após a geração e instalação, execute no destino:
1. npm run typecheck
2. npm run build
3. npm test
4. npm run test:e2e
5. npm run lint

Verifique também a inicialização de dist/infra/main.js e GET /, encerrando o processo de verificação ao terminar. Use uma porta livre para evitar conflito com aplicações existentes.

Se instalação ou verificação falhar, corrija a causa no gerador e teste novamente em um destino isolado; não declare a base pronta com verificações pendentes. Relate o destino, como iniciar com npm run start:dev e os resultados obtidos.

Consulte a documentação oficial quando alterar o bootstrap ou atualizar a versão principal: https://docs.nestjs.com/first-steps
