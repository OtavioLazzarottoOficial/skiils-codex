---
name: criar-http-nestjs
description: Expor um caso de uso DDD existente por HTTP em NestJS, com controller, validação Zod, presenter, providers e testes de integração. Não cria persistência Prisma nem frontend automaticamente.
---

# Adaptar o ciclo DDD para HTTP/NestJS

Leia instruções locais, casos de uso, tipos Either/erros, módulos, guards, pipe Zod, configuração de testes e build. Reutilize a estrutura e as dependências existentes. Não rode a skill da base em um projeto preparado e não gere CRUD além da operação solicitada.

## Contrato da operação

- Decida com rigor em DDD, Clean Architecture, SOLID, TypeScript e JavaScript, preservando simplicidade. Mantenha @Injectable() na aplicação como escolha intencional, private readonly nas dependências e tokens abstratos como imports de valor. Entidades e objetos de valor não conhecem HTTP ou Nest.
- Defina método, caminho, entrada, resposta, status de sucesso e mapa de erros do Either antes de implementar. Confirme requisitos essenciais ausentes; escolhas delegadas devem ser comunicadas. Use erros e regras reais, sem inventar status de domínio ou endpoints extras.
- Defina se a rota é pública ou autenticada, quem está autorizado e de onde vêm os IDs e papéis. Preserve o guard JWT global; use @Public() somente por decisão explícita. Em operações do usuário autenticado, derive o responsável de CurrentUser; não confie no user_id do body. Cadastros administrativos e criação em nome de terceiros exigem autorização definida; nunca exponha uma rota pública que aceite role admin livremente.
- Diferencie validação da entrada, invariantes do domínio e autorização. Zod protege a fronteira HTTP, sem substituir validação das entidades/objetos de valor. Para datas, defina data de calendário versus instante e fuso antes de converter; para dinheiro, documente moeda/unidade/intervalo e não arredonde entradas inválidas silenciosamente.

## Implementação

1. Crie o schema de entrada junto ao controller conforme a organização existente e use ZodValidationPipe. Valide body/params/query realmente utilizados. Não use coerções que convertam texto vazio ou null em um valor de negócio válido sem intenção definida. Não receba hashes como senhas de cadastro.
2. Implemente controller em src/infra/http/controllers, com dependência private readonly no caso de uso. Adapte a entrada, invoque execute e trate result.isLeft(). Mapeie erros conhecidos explicitamente para respostas HTTP coerentes (por exemplo, entrada inválida 400, conflito de unicidade 409, recurso ausente 404 quando essa regra existir); preserve 401/403 dos guards. Erro desconhecido não vira sucesso, erro de validação genérico nem resposta contendo detalhes privados.
3. Respostas de sucesso passam por presenter em src/infra/http/presenters. Escolha campos explicitamente: nunca retorne a entidade, props ou hash de senha por espalhamento. Converta IDs e objetos de valor para o contrato HTTP; datas seguem a semântica acordada. BigInt/Decimal não devem escapar crus para JSON. Teste a ausência de senha/hash e campos internos.
4. Registre controllers, casos de uso e imports dos módulos de banco/criptografia necessários. @Injectable() não registra providers automaticamente. Associe cada contrato ao provider existente e exporte/importe tokens entre módulos; não substitua persistência real por memória na aplicação de produção. Se a persistência ainda não existir, use criar-persistencia-prisma quando autorizada ou informe a lacuna.
5. Use o padrão existente de exceptions/filtros para falhas inesperadas na infraestrutura. A proibição de try/catch aplica-se aos casos de uso: eles sempre retornam Either para rejeições esperadas, e propagam falhas inesperadas. Não coloque HttpException, Prisma ou tipos Request/Response dentro do domínio/aplicação.

## Requisições para REST Client

- Ao concluir cada adaptação HTTP, crie ou atualize um arquivo `.http` na raiz do backend (por exemplo, `requests.http`), usando a extensão REST Client do VS Code. Reaproveite um arquivo equivalente existente e preserve as requisições anteriores.
- Documente exemplos utilizáveis das rotas implementadas na entrega, com método, caminho, cabeçalhos, corpo e parâmetros compatíveis com os contratos reais. Indique a ordem de execução, o perfil ou a autenticação exigida e os efeitos relevantes, como criar dados, enviar email ou invalidar sessões.
- Use endereço local configurável, variáveis e exemplos fictícios. Nunca grave credenciais, tokens, links de convite reais ou dados pessoais no arquivo versionado; use variáveis locais ou de ambiente para segredos. Se uma resposta de login fornecer token, mostre como reutilizá-lo com o nome da requisição e a sintaxe do REST Client.
- Confirme a sintaxe e os nomes de campos com a documentação do REST Client e o código do projeto. O arquivo auxilia testes manuais e não substitui os testes automatizados; não envie requisições que alterem dados ou enviem emails sem a autorização apropriada.
- Por padrão, encerre a entrega nas camadas de backend e no arquivo de requisições. Implemente ou altere frontend apenas quando isso for solicitado na tarefa ou já autorizado no contexto.

## Verificação e entrega

- Teste a requisição HTTP pelo módulo real, resolvendo o caso de uso pelo container Nest; execute o comportamento para comprovar injeção. Cubra sucesso/presenter, entrada inválida sem persistência, erros Left e acesso não autenticado/não autorizado quando aplicáveis. Use doubles via overrideProvider em testes, sem mudar decorators dos casos de uso para compensar o runner.
- O runner pode não emitir design:paramtypes apesar do tsc emitir. Configure o transformador SWC do Vitest para emitir esses metadados; não acrescente @Inject() no caso de uso contra a convenção. Não use useFactory de teste apenas para esconder um binding/metadado quebrado na aplicação real.
- Separe métodos e preparação/validação/execução/resposta com linhas em branco; use chaves nos guard clauses e execute o formatador nos arquivos envolvidos. Depois rode typecheck, build, lint, testes afetados e test:e2e. Preserve testes existentes.
- E2E com repositório em memória não comprova integração PostgreSQL. Quando houver banco disponível, valide o fluxo completo com migrations e banco isolado. Não use banco de referência, não elimine volumes e encerre processos de teste.
- Informe contrato das rotas, decisões de acesso, providers registrados, respostas/erros e comandos executados. Diferencie integração HTTP com doubles de teste com banco real. Não declare autenticação/login implementados só porque existe guard JWT.

Documentação técnica de apoio: [providers NestJS](https://docs.nestjs.com/fundamentals/custom-providers) e [testes NestJS](https://docs.nestjs.com/fundamentals/testing). Use a versão/configuração real do projeto ao implementar.


## Padrão de testes e imports

- Use exclusivamente Vitest como runner de testes unitários, HTTP/E2E e integração; não introduza node:test, Jest ou scripts de teste avulsos com execução por node. Supertest continua sendo o cliente HTTP, não um runner adicional.
- No código TypeScript autoral, use imports relativos com .ts. Preserve rewriteRelativeImportExtensions no tsconfig para que o build Nest/TypeScript gere imports .js válidos no ESM; não edite dist ou generated manualmente. Prisma deve gerar imports .ts no template configurado para essa reescrita.
- Para testes NestJS com @Injectable() e sem @Inject() nos casos de uso, configure Vitest com unplugin-swc/@swc/core, parser TypeScript com decorators e transform legacyDecorator/decoratorMetadata, e carregue reflect-metadata. Teste o módulo real com os imports .ts, sem outro runner para contornar a ausência de metadados. Preserve a verificação do build e da execução pelo Node.
