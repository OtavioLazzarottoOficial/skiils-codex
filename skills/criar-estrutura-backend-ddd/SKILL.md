---
name: criar-estrutura-backend-ddd
description: Criar a base NestJS/DDD do projeto de referência com Prisma 7, PostgreSQL Compose, ambiente Zod, JWT RS256, bcryptjs e throttler. Usar para gerar essa base e seus arquivos de infraestrutura.
---

# Criar backend a partir do template

Use [scripts/create-backend-tree.mjs](scripts/create-backend-tree.mjs). Os arquivos reais ficam em assets/backend; o Compose fica em assets/compose.yaml. O gerador não depende do projeto original.

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
- O template adapta imports locais para .js e injeta explicitamente as dependências usadas em testes. @nestjs/passport fica nas dependências de execução.
- Configuração de ambiente gerada: PORT, DATABASE_URL, CORS_ORIGINS e par JWT em base64. O padrão local é CORS_ORIGINS=http://localhost:5173; '*' é aceito pelo padrão do projeto somente quando escolhido explicitamente.
- Não copie .env, chaves, node_modules, dist, generated, caches ou dados locais da referência.

## Verificação

Na pasta do backend, execute prisma:validate, typecheck, build, lint, test e test:e2e.
Os scripts preparam o ambiente local e geram o cliente Prisma antes das verificações.
Teste tanto 401 sem token quanto sucesso com JWT RS256 e bypass explícito de Public.

Quando Docker estiver disponível, valide o Compose em instância isolada e a conexão real de /health com um token de teste; encerre processos de verificação e preserve volumes. Não use o banco do projeto de referência para esses testes.

Para alterações de padrão, consulte [references/project-reference.md](references/project-reference.md).
Na entrega, informe destino, comandos, módulos incluídos, verificações e limitações.
