---
name: criar-persistencia-prisma
description: Implementar a persistência Prisma de uma funcionalidade DDD existente em backend NestJS, com models, migrations, mappers, repositórios e providers. Não cria HTTP, frontend nem regras de domínio por inferência.
---

# Persistência Prisma do ciclo DDD

Implemente apenas os métodos dos contratos necessários à operação solicitada. Não gere CRUD completo nem execute novamente o gerador da base. Inspecione instruções locais, domínio, casos de uso, contratos, PrismaService, schema, migrations, versões instaladas, scripts e módulos antes de alterar arquivos.

## Decisões e limites

- Decida com rigor em DDD, Clean Architecture, SOLID, TypeScript e JavaScript e complexidade proporcional ao problema. Preserve a concessão de @Injectable() na aplicação e contratos; entidades e objetos de valor permanecem independentes de Nest e Prisma. Use private readonly nas dependências.
- Reutilize IDs, nomes de campos, datas, factories e objetos de valor. Não altere core nem contratos para acomodar detalhes do ORM. Mudanças de domínio necessárias devem ser explicitadas e tratadas pelo ciclo DDD.
- Defina relações, campos obrigatórios, unicidade, normalização, exclusões e intervalos com base em requisitos confirmados. Pergunte pelas decisões essenciais ausentes antes de gerar models/migrations; quando o usuário delegar essas escolhas, comunique-as. Não transforme usuários, despesas ou regras dos exemplos em modelos obrigatórios.
- Confirme o destino do banco sem imprimir credenciais. Criar a funcionalidade não autoriza reset, perda de dados ou aplicação em produção. Não use banco de referência nem reaproveite dados locais para testes.

## Implementação

1. Adicione apenas os models e enums necessários ao schema existente. Use o cliente/adapter e as configurações da versão instalada; no padrão Prisma 7, preserve prisma.config.ts, adapter PostgreSQL e cliente ESM gerado. Não edite generated.
2. Confira que tipos e limites de banco representam o domínio sem perda: centavos inteiros, precisão, null, enum, IDs e data versus instante. Para bigint/Decimal, faça conversões explícitas com verificação de limites; nunca converta silenciosamente para number nem use ponto flutuante para contornar centavos. Para dinheiro seguro JavaScript em centavos, integer de 32 bits é insuficiente sem restringir o domínio.
3. Crie mappers em src/infra/database/prisma/mappers, com toDomain e toPrisma conforme os usos reais. Reconstitua IDs, datas e objetos de valor pelas APIs existentes e desembrulhe Either explicitamente. Dados persistidos incompatíveis devem produzir um erro de infraestrutura contextual e sem dados sensíveis; não ignore Left, não retorne entidade parcial e não imponha política de senha original ao hash armazenado.
4. Implemente os contratos em src/infra/database/prisma/repositories, como PrismaExpensesRepository. Use @Injectable() e private readonly prisma: PrismaService. Mantenha tipos do ORM restritos à infraestrutura, imports locais .ts e tokens abstratos como imports de valor.
5. Registre { provide: ExpensesRepository, useClass: PrismaExpensesRepository } no módulo responsável e exporte o token quando outro módulo precisar dele. Preserve a organização existente. O caso de uso recebe o contrato, sem @Inject() adicional e sem importar o repositório concreto.
6. Para unicidade confirmada, combine verificação de negócio com constraint no banco. A consulta prévia não impede concorrência: traduza apenas o conflito conhecido da operação para o erro acordado e preserve falhas inesperadas. Se o contrato atual não representa o conflito concorrente, ajuste-o explicitamente com o ciclo DDD, usando Either e sem try/catch no caso de uso; não finja que uma consulta findBy garante exclusividade.
7. Gere migrations com ferramentas da versão instalada e revise o SQL. Aplique e teste somente no destino de desenvolvimento autorizado ou em instância isolada. Se uma ferramenta pedir reset por drift, não aceite automaticamente. Sem banco disponível, informe exatamente o que foi validado e o que não foi gerado/aplicado; não declare migração funcional apenas por prisma validate.

## Organização e tradução de erros

- Cada classe de erro fica em arquivo próprio dentro de errors, nunca declarada no arquivo de mapper ou repositório. Erros de domínio/aplicação permanecem na camada que define a regra; erros técnicos ficam em src/infra/errors, fora de database. Não crie uma pasta global que faça o domínio depender da infraestrutura.
- Mappers importam erros técnicos de src/infra/errors e falham explicitamente quando um registro persistido não pode formar uma entidade válida. Não devolva null para corrupção de dados: null é reservado a uma consulta bem-sucedida que não encontrou o registro.
- Métodos de repositórios e casos de uso não contêm try/catch. Quando uma operação Prisma precisar traduzir um conflito conhecido, concentre a captura e classificação em um adaptador/handler pequeno na infraestrutura, por exemplo src/infra/errors/prisma/prisma-user-write-error-handler.ts. O repositório delega a operação a esse handler sem repetir blocos de captura. Não introduza uma hierarquia genérica de handlers sem necessidade concreta.
- Preserve os três resultados: null para ausência em consultas, Either com left(erro) para rejeições esperadas e right(resultado) para sucesso de operações que adotam esse contrato, exceção para falhas inesperadas. Banco indisponível, erro de conexão ou falha de leitura nunca são convertidos em null ou falso sucesso; a camada HTTP tratará a falha inesperada sem expor detalhes privados.
- Traduza somente a constraint conhecida da operação. Valide o formato real do erro na versão/adapter instalado: P2002 pode identificar campos em meta.target ou trazer o índice em meta.driverAdapterError.cause.constraint.index. Não trate qualquer P2002 como email duplicado. Confira o índice do schema/migration, preserve o erro original nos demais casos e teste concorrência em banco real.

## Verificação e entrega

- Teste ida e volta dos mappers, identidade reconstituída, enums, null/datas e limites de valores. Teste rejeição de registros inválidos sem expor senha ou credenciais.
- Quando o banco estiver disponível, faça integração com instância/schema isolado e migrations reais; valide create/leitura e constraints relevantes, incluindo concorrência quando houver unicidade. Encerre processos de teste sem remover volumes ou dados alheios. Mocks do Prisma não comprovam persistência real.
- Resolva os providers pelo container Nest e execute uma operação: conferir apenas que compile() não lança não prova a injeção. Testes unitários instanciam casos de uso diretamente; integração deve verificar tokens e metadados do runtime real, com Vitest/SWC emitindo metadata; confira também a execução do build pelo Node.
- Separe métodos, validações e etapas com linhas em branco e use guard clauses com chaves. Formate arquivos envolvidos antes de executar prisma:validate, typecheck, build, lint e testes afetados; use os scripts existentes e não instale ferramentas redundantes.
- Informe models, migrations, mappers, bindings, comandos executados e limites. Não declare HTTP pronto nesta etapa.

Para o contrato com HTTP, utilize criar-http-nestjs quando solicitado. Documentação técnica de apoio: [custom providers NestJS](https://docs.nestjs.com/fundamentals/custom-providers), [migrations Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production). Confirme comportamento na versão instalada antes de executar comandos.


## Padrão de testes e imports

- Use exclusivamente Vitest como runner de testes unitários, HTTP/E2E e integração; não introduza node:test, Jest ou scripts de teste avulsos com execução por node. Supertest continua sendo o cliente HTTP, não um runner adicional.
- No código TypeScript autoral, use imports relativos com .ts. Preserve rewriteRelativeImportExtensions no tsconfig para que o build Nest/TypeScript gere imports .js válidos no ESM; não edite dist ou generated manualmente. Prisma deve gerar imports .ts no template configurado para essa reescrita.
- Para testes NestJS com @Injectable() e sem @Inject() nos casos de uso, configure Vitest com unplugin-swc/@swc/core, parser TypeScript com decorators e transform legacyDecorator/decoratorMetadata, e carregue reflect-metadata. Teste o módulo real com os imports .ts, sem outro runner para contornar a ausência de metadados. Preserve a verificação do build e da execução pelo Node.
