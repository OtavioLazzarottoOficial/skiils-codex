---
name: criar-ciclo-ddd
description: Criar ou ampliar uma funcionalidade DDD em backend TypeScript/NestJS, da entidade aos testes do caso de uso, seguindo as convenções do projeto. Não inclui persistência concreta, HTTP ou frontend.
---

# Criar o ciclo DDD

Implemente o ciclo de aplicação demonstrado pelo usuário: entidade, contrato de repositório, caso de uso, factory, implementação em memória e teste. Adapte a complexidade às regras solicitadas; o exemplo simples não limita entidades com comportamento e validações fortes.

## Delimitar a operação

Leia as instruções locais, requisitos disponíveis, configuração de testes/TypeScript e os arquivos existentes do domínio. Reutilize core, entidades, contratos, factories e doubles existentes.

Antes de criar arquivos, defina a operação e o modelo a partir dos requisitos:

- Identifique atributos, tipos, obrigatoriedade, relacionamentos, invariantes e comportamentos relevantes. Separe o que foi solicitado ou já existe no projeto das hipóteses ainda não confirmadas.
- Os exemplos demonstram organização, convenções e sequência de implementação. Não definem os atributos nem as regras de novas entidades. Não copie name, description, status, slug, preço, hierarquia ou unicidade de outro domínio automaticamente. A identidade e as datas seguem as abstrações e convenções aplicáveis do projeto.
- Se o pedido for somente “cadastrar <entidade>” e o projeto não fornecer uma definição suficiente, apresente uma proposta breve para os campos e pergunte pelas regras que mudam o comportamento, como unicidade ou hierarquia. Agrupe as dúvidas essenciais e aguarde as respostas antes de gerar a entidade e o caso de uso. Não trate a falta de resposta como aprovação da proposta.
- Se os requisitos já estiverem claros, resuma o modelo e implemente sem pedir confirmação novamente. Comunique suposições pequenas e reversíveis; não decida silenciosamente relações, campos obrigatórios ou invariantes de negócio.
- Mantenha entidades simples quando isso atender às regras. Quando houver comportamento de domínio, modele métodos e invariantes apropriados, em vez de apenas acumular atributos ou gerar setters genéricos. Não crie validações fortes, agregados ou eventos sem uma necessidade concreta.

Consulte [references/domain-definition.md](references/domain-definition.md) para distinguir pedidos suficientes de pedidos que precisam de definição. A definição deve aparecer de forma curta na conversa; não exige criar documentos extras no projeto.

Esta skill implementa a camada de domínio/aplicação e seus testes. Controllers, presenters, mappers, Prisma, migrations, repositórios concretos, registro em modules e frontend ficam para a etapa de infraestrutura. Não execute a skill de base para preencher esses itens automaticamente. Um pedido de fluxo completo pode coordenar as etapas separadamente.

## Sequência de implementação

1. Com o modelo definido, crie ou amplie a entidade em src/domain/<dominio>/enterprise/<entidade>.ts. Use Entity, UniqueEntityID, Optional e a factory estática create conforme o core existente. Preserve created_at e updated_at quando fizerem parte do padrão. Adicione métodos, invariantes, value objects ou eventos apenas quando as regras exigirem; não use setters genéricos para contornar invariantes.
2. Defina os métodos de repositório necessários em src/domain/<dominio>/application/repositories/<plural>-repository.ts. Use uma classe abstrata como contrato/token. Não gere CRUD inteiro, métodos que lançam “não implementado” nem regras de unicidade sem necessidade definida.
3. Implemente o caso de uso em application/usecases/<acao>-<entidade>-usecase.ts, com request, response e execute. Siga Either/left/right do projeto. Para operações sem falha de negócio definida, o padrão de referência é Either<null, { entidade: Entidade }>. Modele erros de negócio reais quando existirem; não invente retornos de sucesso para falhas.
4. Crie ou complemente test/factories/make-<entidade>.ts, aceitando overrides tipados e ID opcional para cenários de teste. Sempre use @faker-js/faker para gerar os dados padrão das factories, como makeUser, makeProduct e makeCategory. Se estiver ausente, instale como devDependency no workspace do backend, usando o gerenciador e lockfile existentes. Escolha os geradores adequados aos campos e regras da entidade. Aplique ...overrides depois dos valores gerados e preserve o ID opcional; testes com valores específicos devem fornecê-los pelos overrides.
5. Implemente em test/repository-in-memory/<plural>-repository-in-memory.ts todos os métodos exigidos pelo contrato atual, com comportamento observável. Mantenha items para inspecionar o estado nos testes. Adicione doubles de outros contratos somente se o caso de uso precisar.
6. Escreva o teste ao lado do caso de uso: <acao>-<entidade>-usecase.spec.ts. Use beforeEach e sut. Verifique resultado, efeito no repositório e regras relevantes. Cubra falhas definidas, ausência de efeitos quando rejeitado e uso dos contratos necessários; não dependa de aleatoriedade para satisfazer regras de negócio.
7. Execute os testes afetados e verifique tipos e a configuração de build. Informe arquivos, regras implementadas e limites da etapa. Não declare build ou integração concluídos se verificou somente testes unitários.

## Convenções e dependências

- Use @Injectable() na declaração da classe do caso de uso e das classes abstratas de repositório. Não adicione @Inject() aos parâmetros do construtor: declare as dependências com private/private readonly e seus contratos como tipos. Mantenha imports de valor para os contratos usados na injeção do NestJS. Nos testes unitários, instancie o caso de uso explicitamente com os doubles; não acrescente decorators de parâmetro para adaptar o código ao runner de testes. O registro de providers pertence à etapa de infraestrutura.
- Código de src depende de contratos de produção, nunca de test. Para senha, dependa de HashGenerator e use o fake apenas ao montar o teste. Não inclua senha, autenticação ou criptografia em entidades que não precisam disso.
- No template ESM executado diretamente pelo Node, imports locais usam extensão .js, inclusive nos arquivos TypeScript. Siga a configuração real do projeto se for diferente. Use import type para tipos; mantenha import de valor para tokens de injeção.
- Preserve convenções existentes como application/usecases e nomes já estabelecidos. Não faça renomeações gerais ou altere core durante uma funcionalidade sem necessidade.
- Os arquivos são código funcional, sem placeholders, logs de depuração ou regras hipotéticas. Não devolva entidades com dados sensíveis diretamente em um futuro controller; a serialização será tratada na etapa HTTP.

Para um exemplo mínimo completo e as decisões que ele demonstra, leia [references/example-cycle.md](references/example-cycle.md). Os arquivos de exemplo em assets/example são uma referência adaptável, não um gerador de módulos com campos fixos. A skill não depende da pasta original do usuário.
