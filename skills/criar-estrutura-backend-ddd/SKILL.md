---
name: criar-estrutura-backend-ddd
description: Criar a base NestJS/DDD do projeto de referência com Prisma 7, PostgreSQL Compose, ambiente Zod, JWT RS256, bcryptjs e throttler. Usar para gerar essa base e seus arquivos de infraestrutura.
---

# Criar backend a partir do template

Use [scripts/create-backend-tree.mjs](scripts/create-backend-tree.mjs). Os arquivos reais ficam em assets/backend; o Compose fica em assets/compose.yaml. O gerador não depende do projeto original.

## Critérios de decisão técnica

- Tome decisões com o rigor de um especialista em DDD, Clean Architecture, SOLID, TypeScript e JavaScript, aplicando esses princípios de forma proporcional ao problema e ao escopo desta skill.
- Preserve as invariantes e a direção das dependências: entidades e objetos de valor independem do framework; casos de uso dependem de contratos, sem conhecer HTTP ou Prisma. O uso de @Injectable() na aplicação e nos contratos de repositório é uma concessão intencional deste padrão para a integração com NestJS. Preserve essa escolha, os imports de valor dos tokens e private readonly no construtor, sem adicionar @Inject() aos casos de uso. O decorator não substitui o registro de providers na infraestrutura.
- Prefira a solução mais simples que atenda às regras. Introduza objetos de valor, interfaces, camadas e padrões quando houver uma necessidade concreta; não aplique padrões apenas para demonstrar arquitetura.
- Use os recursos e a configuração real de TypeScript e JavaScript para expressar contratos com clareza, distinguindo garantias de tipos de validações necessárias em execução.
- Explique brevemente decisões relevantes e suas consequências. Esclareça requisitos contraditórios ou regras de negócio indefinidas antes de implementar a parte afetada, sem pedir confirmação para escolhas rotineiras já autorizadas.
- Quando uma convenção existente conflitar com esses princípios ou trouxer uma limitação relevante, explique o problema e proponha uma mudança proporcional. Não faça refatorações fora do escopo nem substitua convenções silenciosamente.

## Contexto e definição antes da base

Antes de gerar arquivos, consulte a conversa e a definição existente na raiz do projeto (docs/project-definition.md e docs/implementation-plan.md, ou documentos equivalentes). Se o contexto de negócio ainda não estiver definido, use a skill irmã [definir-projeto](../definir-projeto/SKILL.md) para levantar segmento, objetivo, atores, escopo inicial, requisitos, regras e critérios de aceitação. Leia sua skill e reaproveite respostas já dadas; não faça perguntas duplicadas.

Em backend independente, mantenha a documentação na raiz dele; em monorepo, use a raiz compartilhada, sem duplicar docs em apps/backend. Documentos em docs podem preceder a geração; integre resumo e links ao README depois que o gerador criar seu README, preservando comandos e evitando conflito de arquivo existente.

Não exija todas as regras futuras para gerar a base. Se o usuário pedir apenas infraestrutura ou adiar a definição, registre o negócio como pendente e prossiga com a base técnica autorizada. Contexto não autoriza criar entidades/modelos/rotas de negócio automaticamente; eles seguem ciclos próprios e requisitos confirmados. Atualize no plano somente o que tiver sido entregue e verificado.

## Execução

- Identifique o destino e as instruções aplicáveis. Para uma base completa com backend em apps/backend:
  node "<skill>/scripts/create-backend-tree.mjs" "<projeto>/apps/backend" --compose-root "<projeto>"
- Para backend independente, passe sua pasta diretamente, sem --compose-root.
- Requer Node.js 24.15+ e npm. A execução normal instala bibliotecas e gera o cliente Prisma.
- --skip-install prepara somente arquivos e ambiente; use na composição do monorepo e faça a instalação centralizada depois.
- --database-port permite escolher a porta publicada pelo PostgreSQL; padrão 5433. Não altere um serviço de banco existente para liberar a porta.
- O destino vazio recebe o template, .env local com par RSA exclusivo e Compose isolado. O gerador recusa arquivos diferentes antes de escrever. Não force sobrescrita em projetos existentes.
- Preserve .env já existente. npm run env:init cria chaves somente se ambas estiverem ausentes ou com o marcador GENERATE_LOCALLY; não substitui um par configurado nem imprime valores.
- Para transportar o gerador, copie também assets/backend e assets/compose.yaml mantendo a estrutura da skill. O script agora usa arquivos de template em vez de strings de código embutidas.

## Padrões do projeto de referência

- core mantém as abstrações existentes.
- domain/auth/application/crypthograpy contém os contratos Encrypter, HashGenerator e HashComparer.
- infra/env contém env.ts com schema Zod, EnvService e EnvModule. ConfigModule global valida o ambiente no AppModule.
- infra/auth contém AuthModule, JwtStrategy, JwtAuthGuard global, Public e CurrentUser.
- infra/cryptography contém BcryptHasher, JwtEncrypter e CryptographyModule, ligados aos contratos.
- infra/database mantém PrismaService, DatabaseModule e pastas de mappers/repositories. Prisma 7 usa adapter PostgreSQL e cliente ESM gerado.
- infra/http mantém controllers, presenters, pipes e filters. Crie ZodValidationPipe em src/infra/http/pipes/zod-validation-pipe.ts.
- test/cryphograpy mantém FakerEncrypter e FakerJWT.
- AppModule registra o throttler global de 100 requisições por 60 segundos.
- Preserve nomes existentes como crypthograpy, cryphograpy e encrypty para compatibilidade. Renomeações ficam para um pedido específico.
- Não crie login, usuários, papéis ou modelos Prisma fictícios. A estrutura de autenticação está incluída, mas não há funcionalidade de emissão de tokens HTTP pronta.
- As rotas / e /health são protegidas pelo guard global, como no projeto atual. Use @Public() somente em rotas que devam ser públicas por decisão explícita.
- O template usa imports relativos com .ts no código-fonte e rewriteRelativeImportExtensions no TypeScript para gerar imports .js no build; Prisma gera imports .ts. Vitest usa SWC com metadados de decorators para testar a injeção do NestJS. @nestjs/passport fica nas dependências de execução.
- Configuração de ambiente gerada: PORT, DATABASE_URL, CORS_ORIGINS e par JWT em base64. O padrão local é CORS_ORIGINS=http://localhost:5173; '*' é aceito pelo padrão do projeto somente quando escolhido explicitamente.
- Não copie .env, chaves, node_modules, dist, generated, caches ou dados locais da referência.

## Formatação e legibilidade na entrega

- Antes de concluir cada ciclo, organize visualmente os arquivos criados ou alterados e execute o formatador configurado no projeto. Use npm run format quando seu escopo for adequado; se ele formatar arquivos fora da tarefa, execute o Prettier local apenas nos arquivos envolvidos. Na criação da base, mantenha Prettier configurado e execute npm run format ao finalizar a geração.
- Além da indentação, separe com uma linha em branco os métodos e getters consecutivos, as validações independentes e as etapas de preparação, validação, criação da entidade, persistência e retorno. Separe declarações de variáveis dos próximos blocos de controle e use chaves com retorno em linha própria nos guard clauses, evitando if e return compactados em uma linha. Mantenha juntas propriedades de objetos e interfaces e instruções que formem uma única operação; não insira linhas em branco indiscriminadamente.
- Prettier preserva separações existentes, mas não cria todas as separações lógicas. Revise esse espaçamento explicitamente antes de executar a formatação; apenas rodar o comando não satisfaz a revisão de legibilidade. Aproveite o lint existente se já houver regras para espaçamento, sem instalar ferramentas redundantes por padrão.
- Execute as verificações exigidas pela skill após a formatação e confira o resultado final. Informe o comando utilizado e eventuais limitações.

## Verificação

Na pasta do backend, execute prisma:validate, typecheck, build, lint, test e test:e2e.
Os scripts preparam o ambiente local e geram o cliente Prisma antes das verificações.
Teste tanto 401 sem token quanto sucesso com JWT RS256 e bypass explícito de Public.

Quando Docker estiver disponível, valide o Compose em instância isolada e a conexão real de /health com um token de teste; encerre processos de verificação e preserve volumes. Não use o banco do projeto de referência para esses testes.

Para alterações de padrão, consulte [references/project-reference.md](references/project-reference.md).
Na entrega, informe destino, comandos, módulos incluídos, verificações e limitações.


## Manutenção do template e próximas etapas

Quando uma correção do core ou infraestrutura for aprovada como padrão reutilizável, atualize também assets/backend e seus testes, não apenas o projeto de teste. Gere uma base descartável para validar o gerador e a correção. Nunca copie .env, chaves ou dados da aplicação para os assets.

Funcionalidades de domínio são criadas com criar-ciclo-ddd; a persistência concreta com criar-persistencia-prisma; a adaptação HTTP com criar-http-nestjs. A base não deve conter usuários ou despesas só porque foram usados para testar as skills. Regras de negócio do projeto descartável não se tornam padrões deste template.


## Padrão de testes e imports

- Use exclusivamente Vitest como runner de testes unitários, HTTP/E2E e integração; não introduza node:test, Jest ou scripts de teste avulsos com execução por node. Supertest continua sendo o cliente HTTP, não um runner adicional.
- No código TypeScript autoral, use imports relativos com .ts. Preserve rewriteRelativeImportExtensions no tsconfig para que o build Nest/TypeScript gere imports .js válidos no ESM; não edite dist ou generated manualmente. Prisma deve gerar imports .ts no template configurado para essa reescrita.
- Para testes NestJS com @Injectable() e sem @Inject() nos casos de uso, configure Vitest com unplugin-swc/@swc/core, parser TypeScript com decorators e transform legacyDecorator/decoratorMetadata, e carregue reflect-metadata. Teste o módulo real com os imports .ts, sem outro runner para contornar a ausência de metadados. Preserve a verificação do build e da execução pelo Node.
