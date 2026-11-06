---
name: definir-projeto
description: Levantar e documentar contexto de negócio, escopo, atores, requisitos funcionais e não funcionais, regras de negócio, critérios de aceitação e plano de implementação antes de iniciar um projeto ou definir sua próxima entrega. Não gera a base técnica nem implementa funcionalidades.
---

# Definir o projeto e sua primeira entrega

Conduza uma conversa objetiva para entender o problema e produzir uma definição útil à implementação. Use o rigor de DDD, Clean Architecture e análise de requisitos para esclarecer termos e responsabilidades, sem antecipar classes, tabelas ou camadas sem necessidade.

## Recuperar contexto antes de perguntar

- Leia a conversa, instruções locais, README e documentação existente. Em monorepos, procure a raiz que contém apps/packages: a definição pertence ao projeto inteiro, não a uma cópia dentro de cada app.
- Use docs/project-definition.md e docs/implementation-plan.md como caminhos padrão. Reutilize documentos equivalentes já existentes em outros caminhos e registre links; não mantenha versões paralelas do mesmo conteúdo. Se houver docs/business-context.md, reaproveite-o e organize a informação sem apagar histórico ou decisões confirmadas.
- Não deduza segmento ou regras pelo nome da pasta. Use informações explícitas. Considere o código existente como evidência do comportamento atual, não como aprovação automática da regra de negócio.

## Conversa de descoberta

1. Identifique segmento, problema, objetivo, quem utilizará o sistema e qual resultado a primeira entrega precisa permitir. Pergunte somente pelo que ainda não foi informado, agrupando até três questões essenciais por rodada e aprofundando conforme as respostas.
2. Esclareça os termos ambíguos antes de listar atributos. Por exemplo, em academia, uma conta de acesso pode ser diferente do cadastro de aluno ou instrutor; em estoque, conta de acesso e responsabilidade pelo almoxarifado podem ter papéis distintos. Apresente essas distinções como possibilidades a discutir, nunca como entidades obrigatórias.
3. Sugira campos, operações e regras adequados à finalidade confirmada, explicando brevemente sua utilidade. Diferencie solicitado/confirmado, sugestão, hipótese assumida por delegação e pendência. Não copie pacotes prontos de campos por segmento, nem colete dados pessoais sem necessidade definida.
4. Levante requisitos da primeira entrega, suas regras e critérios de aceitação. Para requisitos não funcionais, pergunte pelos aspectos que mudam decisões concretas: acesso, volume, desempenho, disponibilidade, operação e integrações. Evite metas inventadas de latência, segurança ou disponibilidade e expressões vagas como 'rápido e escalável'; registre metas mensuráveis quando definidas e, nos demais casos, a questão em aberto.
5. Apresente um resumo curto e resolva contradições ou decisões essenciais ausentes antes de implementar a parte dependente. Não considere silêncio como aprovação. Quando os requisitos estiverem claros ou as escolhas tiverem sido delegadas, registre as decisões e prossiga sem uma nova rodada de confirmação ritual.

## Documentos

Use os modelos de [definição](assets/project-definition.md) e [plano](assets/implementation-plan.md) como estrutura adaptável, preenchendo-os com o que foi levantado. Não entregue exemplos como requisitos reais nem placeholders como se fossem decisões concluídas. Se algo ainda não foi definido, registre explicitamente a pendência e qual entrega ela afeta.

- docs/project-definition.md reúne contexto, objetivo, escopo inicial e futuro, atores, glossário, requisitos funcionais (RF), regras de negócio (RN), requisitos não funcionais (RNF), critérios de aceitação (CA), decisões e questões em aberto.
- Use IDs estáveis como RF-001, RN-001, RNF-001 e CA-001. Relacione os itens relevantes entre si, sem criar um requisito artificial para preencher cada seção. Itens confirmados podem estar pendentes de implementação: status de decisão e status de execução são coisas diferentes.
- docs/implementation-plan.md organiza tarefas com IDs T-001, objetivo, referências aos requisitos/regras, dependências, prioridade ou ordem, condição de conclusão e status. Prefira entregas pequenas e utilizáveis, ordenadas pelas dependências. Domínio/testes, persistência, HTTP e frontend são passos possíveis conforme a entrega; não crie infraestrutura ou CRUD inteiros por padrão.
- O README permanece a porta de entrada técnica, com resumo do objetivo, comandos e links para esses documentos. Integre os links preservando o conteúdo existente. Quando um gerador produz README, atualize-o depois da geração para evitar conflito de sobrescrita; os documentos em docs podem ser escritos antes.

## Coordenação e manutenção

- A definição deve ser suficiente para a próxima entrega, não uma especificação completa de todo o sistema. Questões de entregas futuras não bloqueiam a base técnica nem uma funcionalidade já definida.
- Ao criar backend ou monorepo, faça esse levantamento antes da geração, quando o pedido envolver definição de negócio. Se o usuário pedir explicitamente apenas uma base técnica ou adiar a definição, respeite isso, registre que o negócio permanece em aberto e gere a base sem funcionalidades presumidas.
- Esta skill não dispara geração, instalação, implementação ou criação de tarefas em serviços externos. Depois do levantamento, siga a autorização do pedido original para coordenar as skills técnicas; se o pedido for somente definir o projeto, entregue os documentos.
- Durante a implementação, use a conversa mais recente para identificar decisões novas e atualize os documentos afetados. Se código e definição divergirem, explique a divergência e esclareça a decisão necessária; não mude a regra silenciosamente. Preserve IDs e não marque tarefas como concluídas apenas porque foram planejadas ou houve geração parcial.

## Verificar e entregar

Confira coerência entre objetivo, primeira entrega, atores e regras; referências válidas entre IDs; critérios observáveis para os requisitos implementáveis; dependências e condições de conclusão das tarefas. Verifique os links do README e diferencie decisões confirmadas de pendências. Não execute testes de aplicação por uma alteração exclusivamente documental.

Entregue os caminhos, um resumo da primeira entrega e as questões que realmente afetam o próximo passo. Requisitos de outros segmentos apresentados na conversa continuam sendo apenas exemplos.
