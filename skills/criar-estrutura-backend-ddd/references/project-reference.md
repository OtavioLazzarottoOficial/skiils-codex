# Referência incorporada em 02/11/2026

Fonte analisada: O:/www/teste-base-backend/apps/backend e compose.yaml na raiz.
O projeto-fonte não é necessário para executar a skill e não deve ser modificado durante uma geração.

Adições incorporadas: auth com JWT RS256/guard/Public/CurrentUser; bcryptjs e JWT com contratos de aplicação; fakes; throttler global; pipe Zod; env/configuração e Prisma/Compose atuais.

Ajustes técnicos no template: extensões .js para o ESM compilado; injeção explícita para testes; @nestjs/passport como dependência de execução; par RSA novo por destino; .env.example com CORS_ORIGINS e marcadores de chaves; carregamento de .env independente do cwd; payload JWT inválido retorna 401; E2E usa token em rotas protegidas e substitui a conexão real.

As escolhas de arquitetura, nomes e algoritmos do projeto foram mantidas. A configuração CORS do projeto é preservada, mas o exemplo usa uma origem local explícita.
Os testes do template cobrem o comportamento novo; a fonte original mantém seus arquivos.

Correção de organização confirmada em O:/www/novo-backend: ZodValidationPipe fica em src/infra/http/pipes/zod-validation-pipe.ts. A pasta filters permanece disponível para filtros HTTP.


Padrão atual: imports relativos .ts no código-fonte, rewriteRelativeImportExtensions no build e Vitest com SWC para emissão de metadados de decorators em todos os níveis de teste.
