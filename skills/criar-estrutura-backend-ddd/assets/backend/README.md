# Backend base

Base NestJS/DDD com Prisma 7, PostgreSQL, Zod, JWT RS256, bcryptjs e throttler.
Não existem entidades de usuário, login HTTP ou modelos de negócio neste template.

## Preparar

O gerador cria .env a partir de .env.example e gera um par RSA exclusivo para o projeto.
Para recriar apenas um ambiente ausente, execute npm run env:init.
Não copie o .env ou as chaves de outro projeto.

Na pasta do Compose, execute docker compose up -d --wait db.
Na pasta do backend, instale dependências com npm install e inicie npm run start:dev.
Build, testes e desenvolvimento geram o cliente Prisma automaticamente.

## Padrões

O core é independente de framework. Os contratos de criptografia ficam em
domain/auth/application/crypthograpy e as implementações em infra/cryptography.
O pipe de validação está em infra/http/pipes/zod-validation-pipe.ts,
para validar os dados recebidos pelas rotas.

O guard JWT é global. / e /health exigem token RS256 com sub UUID válido.
Use Public para liberar explicitamente uma rota e CurrentUser para acessar o payload.
Não há endpoint de login: a emissão de tokens HTTP será uma funcionalidade própria.
O throttler global permite 100 requisições a cada 60 segundos.

EnvService fornece PORT, DATABASE_URL, CORS_ORIGINS e chaves JWT em base64.
O exemplo permite apenas http://localhost:5173. Ajuste a origem e as portas ao seu projeto.

## Verificar

npm run typecheck
npm run build
npm run lint
npm test
npm run test:e2e

Os testes HTTP substituem PrismaService e verificam rotas protegidas e públicas.
O schema Prisma está preparado sem modelos fictícios.
