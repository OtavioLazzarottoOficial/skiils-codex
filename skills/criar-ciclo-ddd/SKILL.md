---
name: criar-ciclo-ddd
description: Criar ou ampliar uma funcionalidade DDD em backend TypeScript/NestJS, da entidade aos testes do caso de uso, seguindo as convenções do projeto. Não inclui persistência concreta, HTTP ou frontend.
---

# Criar o ciclo DDD

Implemente o ciclo de aplicação demonstrado pelo usuário: entidade, contrato de repositório, caso de uso, factory, implementação em memória e teste. Adapte a complexidade às regras solicitadas; o exemplo simples não limita entidades com comportamento e validações fortes.

## Critérios de decisão técnica

- Tome decisões com o rigor de um especialista em DDD, Clean Architecture, SOLID, TypeScript e JavaScript, aplicando esses princípios de forma proporcional ao problema e ao escopo desta skill.
- Preserve as invariantes e a direção das dependências: entidades e objetos de valor independem do framework; casos de uso dependem de contratos, sem conhecer HTTP ou Prisma. O uso de @Injectable() na aplicação e nos contratos de repositório é uma concessão intencional deste padrão para a integração com NestJS. Preserve essa escolha, os imports de valor dos tokens e private readonly no construtor, sem adicionar @Inject() aos casos de uso. O decorator não substitui o registro de providers na infraestrutura.
- Prefira a solução mais simples que atenda às regras. Introduza objetos de valor, interfaces, camadas e padrões quando houver uma necessidade concreta; não aplique padrões apenas para demonstrar arquitetura.
- Use os recursos e a configuração real de TypeScript e JavaScript para expressar contratos com clareza, distinguindo garantias de tipos de validações necessárias em execução.
- Explique brevemente decisões relevantes e suas consequências. Esclareça requisitos contraditórios ou regras de negócio indefinidas antes de implementar a parte afetada, sem pedir confirmação para escolhas rotineiras já autorizadas.
- Quando uma convenção existente conflitar com esses princípios ou trouxer uma limitação relevante, explique o problema e proponha uma mudança proporcional. Não faça refatorações fora do escopo nem substitua convenções silenciosamente.

## Consultar o negócio e selecionar a entrega

Leia a conversa e a definição/plano existentes na raiz do projeto, inclusive a raiz do monorepo: docs/project-definition.md e docs/implementation-plan.md, ou documentos equivalentes. Reaproveite RF, RN, RNF, critérios de aceitação, glossário e decisões confirmadas. Não duplique documentos em cada domínio ou app e não repita perguntas já respondidas.

Se o pedido for vago ou o contexto insuficiente, consulte a skill irmã [definir-projeto](../definir-projeto/SKILL.md) e faça apenas o levantamento necessário à operação atual. Use o segmento confirmado para sugerir possibilidades, sem assumir campos/regras por nicho. Esclareça o significado da entidade: conta de acesso, aluno e instrutor, por exemplo, não são automaticamente o mesmo conceito. Não exija definir o sistema inteiro para implementar um ciclo suficiente.

Antes de codificar, apresente o modelo e relacione a operação aos IDs existentes e ao item do plano pertinente, quando disponíveis. Hipóteses e sugestões continuam pendentes até definição ou delegação explícita; requisitos claros dispensam nova confirmação. Transforme critérios e rejeições relevantes em testes do comportamento, sem introduzir infraestrutura ou requisitos futuros fora do pedido.

Ao concluir, atualize a definição apenas com as novas decisões confirmadas e o plano com o resultado real e as verificações. Um ciclo DDD não conclui automaticamente uma tarefa que também exige persistência, HTTP ou frontend. Se faltar documentação, faça perguntas proporcionais quando necessárias; não crie uma especificação ampla para uma operação pequena já definida.

## Delimitar a operação

Leia as instruções locais, requisitos disponíveis, configuração de testes/TypeScript e os arquivos existentes do domínio. Reutilize core, entidades, contratos, factories e doubles existentes.

Antes de criar arquivos, defina a operação e o modelo a partir dos requisitos:

- Identifique atributos, tipos, obrigatoriedade, relacionamentos, invariantes e comportamentos relevantes. Separe o que foi solicitado ou já existe no projeto das hipóteses ainda não confirmadas.
- Os exemplos demonstram organização, convenções e sequência de implementação. Não definem os atributos nem as regras de novas entidades. Não copie name, description, status, slug, preço, hierarquia ou unicidade de outro domínio automaticamente. A identidade e as datas seguem as abstrações e convenções aplicáveis do projeto.
- Se o pedido for somente “cadastrar <entidade>” e o projeto não fornecer uma definição suficiente, apresente uma proposta breve para os campos e pergunte pelas regras que mudam o comportamento, como unicidade ou hierarquia. Agrupe as dúvidas essenciais e aguarde as respostas antes de gerar a entidade e o caso de uso. Não trate a falta de resposta como aprovação da proposta.
- Se os requisitos já estiverem claros, resuma o modelo e implemente sem pedir confirmação novamente. Comunique suposições pequenas e reversíveis; não decida silenciosamente relações, campos obrigatórios ou invariantes de negócio.
- Mantenha entidades simples quando isso atender às regras. Quando houver comportamento de domínio, modele métodos e invariantes apropriados, em vez de apenas acumular atributos ou gerar setters genéricos. Não crie validações fortes, agregados ou eventos sem uma necessidade concreta.

Consulte [references/domain-definition.md](references/domain-definition.md) para distinguir pedidos suficientes de pedidos que precisam de definição. Resuma a definição da operação na conversa e reutilize a documentação do projeto quando existente; não crie um documento novo por entidade. Atualize os documentos compartilhados quando houver uma nova decisão confirmada.

Esta skill implementa a camada de domínio/aplicação e seus testes. Controllers, presenters, mappers, Prisma, migrations, repositórios concretos, registro em modules e frontend ficam para a etapa de infraestrutura. Não execute a skill de base para preencher esses itens automaticamente. Um pedido de fluxo completo pode coordenar as etapas separadamente.

## Sequência de implementação

1. Com o modelo definido, crie ou amplie a entidade em src/domain/<dominio>/enterprise/<entidade>.ts. Use Entity, UniqueEntityID, Optional e a factory estática create conforme o core existente. Preserve created_at e updated_at quando fizerem parte do padrão. Adicione métodos, invariantes, value objects ou eventos apenas quando as regras exigirem; não use setters genéricos para contornar invariantes.
2. Defina os métodos de repositório necessários em src/domain/<dominio>/application/repositories/<plural>-repository.ts. Use uma classe abstrata como contrato/token. Não gere CRUD inteiro, métodos que lançam “não implementado” nem regras de unicidade sem necessidade definida.
3. Implemente o caso de uso em application/usecases/<acao>-<entidade>-usecase.ts, com request, response e execute. Siga Either/left/right do projeto. Para operações sem falha de negócio definida, o padrão de referência é Either<null, { entidade: Entidade }>. Modele erros de negócio reais quando existirem; não invente retornos de sucesso para falhas.
4. Crie ou complemente test/factories/make-<entidade>.ts, aceitando overrides tipados e ID opcional para cenários de teste. Sempre use @faker-js/faker para gerar os dados padrão das factories, como makeUser, makeProduct e makeCategory. Se estiver ausente, instale como devDependency no workspace do backend, usando o gerenciador e lockfile existentes. Escolha os geradores adequados aos campos e regras da entidade. Aplique ...overrides depois dos valores gerados e preserve o ID opcional; testes com valores específicos devem fornecê-los pelos overrides.
5. Implemente em test/repository-in-memory/<plural>-repository-in-memory.ts todos os métodos exigidos pelo contrato atual, com comportamento observável. Mantenha items para inspecionar o estado nos testes. Adicione doubles de outros contratos somente se o caso de uso precisar.
6. Escreva o teste ao lado do caso de uso: <acao>-<entidade>-usecase.spec.ts. Use beforeEach e sut. Verifique resultado, efeito no repositório e regras relevantes. Cubra falhas definidas, ausência de efeitos quando rejeitado e uso dos contratos necessários; não dependa de aleatoriedade para satisfazer regras de negócio.
7. Execute os testes afetados e verifique tipos e a configuração de build. Informe arquivos, regras implementadas e limites da etapa. Não declare build ou integração concluídos se verificou somente testes unitários.

- Ao definir a entidade, avalie quais atributos precisam de objetos de valor por possuírem invariantes próprias. Apresente a proposta e confirme regras indefinidas antes de implementar; não transforme todos os atributos automaticamente. Reutilize a classe ValueObject de src/core/entities/object-value.ts como base. Nomeie as subclasses em PascalCase com o sufixo ObjectValue, como EmailObjectValue e PasswordObjectValue; use arquivos em kebab-case, como email-object-value.ts. Para senhas, distinga a política da senha original do hash armazenado; regras de formato do email não substituem unicidade no caso de uso.

- Todo caso de uso retorna o Either existente em src/core/either.ts: left(erro) para falhas de negócio esperadas e right(resultado) para sucesso. Nunca use try/catch dentro de casos de uso. Factories de entidades e objetos de valor que podem rejeitar dados por regras de domínio devem retornar Either com erros específicos, em vez de lançar exceções para essas rejeições. O caso de uso verifica isLeft(), propaga o erro com left e só executa efeitos após todas as validações; no caminho feliz, acessa o valor validado e retorna right. Falhas inesperadas de infraestrutura propagam como exceções, sem conversão em erro de validação ou falso sucesso. Objetos de valor usam erros próprios, sem depender de erros de uma entidade consumidora. Adapte factories e testes para verificar isLeft/isRight e ausência de efeitos nos cenários rejeitados.

## Formatação e legibilidade na entrega

- Antes de concluir cada ciclo, organize visualmente os arquivos criados ou alterados e execute o formatador configurado no projeto. Use npm run format quando seu escopo for adequado; se ele formatar arquivos fora da tarefa, execute o Prettier local apenas nos arquivos envolvidos. Na criação da base, mantenha Prettier configurado e execute npm run format ao finalizar a geração.
- Além da indentação, separe com uma linha em branco os métodos e getters consecutivos, as validações independentes e as etapas de preparação, validação, criação da entidade, persistência e retorno. Separe declarações de variáveis dos próximos blocos de controle e use chaves com retorno em linha própria nos guard clauses, evitando if e return compactados em uma linha. Mantenha juntas propriedades de objetos e interfaces e instruções que formem uma única operação; não insira linhas em branco indiscriminadamente.
- Prettier preserva separações existentes, mas não cria todas as separações lógicas. Revise esse espaçamento explicitamente antes de executar a formatação; apenas rodar o comando não satisfaz a revisão de legibilidade. Aproveite o lint existente se já houver regras para espaçamento, sem instalar ferramentas redundantes por padrão.
- Execute as verificações exigidas pela skill após a formatação e confira o resultado final. Informe o comando utilizado e eventuais limitações.

## Convenções e dependências

- Use @Injectable() na declaração da classe do caso de uso e das classes abstratas de repositório. Não adicione @Inject() aos parâmetros do construtor: declare sempre as dependências injetadas (repositórios e demais serviços/contratos) com private readonly e seus contratos como tipos. O readonly mantém a referência definida no construtor, sem impedir o uso dos métodos da dependência. Mantenha imports de valor para os contratos usados na injeção do NestJS. Nos testes unitários, instancie o caso de uso explicitamente com os doubles; não acrescente decorators de parâmetro para adaptar o código ao runner de testes. O registro de providers pertence à etapa de infraestrutura.
- Código de src depende de contratos de produção, nunca de test. Para senha, dependa de HashGenerator e use o fake apenas ao montar o teste. Não inclua senha, autenticação ou criptografia em entidades que não precisam disso.
- Imports relativos do código TypeScript usam .ts. O template configura rewriteRelativeImportExtensions para emitir .js no build ESM executado pelo Node; não remova extensões sem ajustar o runtime. Use import type para tipos e imports de valor para tokens de injeção.
- Preserve convenções existentes como application/usecases e nomes já estabelecidos. Não faça renomeações gerais ou altere core durante uma funcionalidade sem necessidade.
- Os arquivos são código funcional, sem placeholders, logs de depuração ou regras hipotéticas. Não devolva entidades com dados sensíveis diretamente em um futuro controller; a serialização será tratada na etapa HTTP.

Para um exemplo mínimo completo e as decisões que ele demonstra, leia [references/example-cycle.md](references/example-cycle.md). Os arquivos de exemplo em assets/example são uma referência adaptável, não um gerador de módulos com campos fixos. A skill não depende da pasta original do usuário.


## Continuação na infraestrutura

Para um exemplo com erros esperados, objetos de valor e Either, leia [references/either-cycle.md](references/either-cycle.md). As regras desse exemplo não são defaults de novos domínios.

Persistência concreta pertence à skill criar-persistencia-prisma; a adaptação HTTP pertence à criar-http-nestjs. Reutilize o ciclo existente e combine essas etapas somente quando solicitado. Antes de expor uma funcionalidade, defina quem pode executá-la, de onde vêm IDs do usuário e papéis, e a semântica de datas e valores monetários. Não imponha unicidade, política de senha, moeda ou autorização a outro domínio por copiar os exemplos.


## Padrão de testes e imports

- Use exclusivamente Vitest como runner de testes unitários, HTTP/E2E e integração; não introduza node:test, Jest ou scripts de teste avulsos com execução por node. Supertest continua sendo o cliente HTTP, não um runner adicional.
- No código TypeScript autoral, use imports relativos com .ts. Preserve rewriteRelativeImportExtensions no tsconfig para que o build Nest/TypeScript gere imports .js válidos no ESM; não edite dist ou generated manualmente. Prisma deve gerar imports .ts no template configurado para essa reescrita.
- Para testes NestJS com @Injectable() e sem @Inject() nos casos de uso, configure Vitest com unplugin-swc/@swc/core, parser TypeScript com decorators e transform legacyDecorator/decoratorMetadata, e carregue reflect-metadata. Teste o módulo real com os imports .ts, sem outro runner para contornar a ausência de metadados. Preserve a verificação do build e da execução pelo Node.
