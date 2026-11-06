---
name: iniciar-frontend-shadcn-tanstack
description: Criar a base de um frontend React com TypeScript, Vite, shadcn/ui e TanStack Router, do zero ou em um workspace ainda sem essa configuração. Não usar para alterações comuns em frontends já preparados.
---

# Iniciar frontend com shadcn/ui e TanStack Router

Entregue uma base executável com rotas tipadas, componentes reais do shadcn/ui e verificações passando. Respeite o AGENTS.md, o destino e as escolhas explícitas do usuário.

## Contexto e decisões iniciais

- Inspecione o diretório de destino, os manifests, lockfiles e as instruções aplicáveis. Preserve arquivos e configurações compatíveis.
- Em monorepos, prepare o workspace frontend existente ou indicado; siga os comandos e a organização do monorepo.
- Reutilize o gerenciador de pacotes existente. Em um diretório vazio sem preferência informada, use pnpm.
- Use React, TypeScript estrito e Vite com TanStack Router e rotas por arquivos. TanStack Start/SSR exige uma escolha explícita ou requisitos que justifiquem esclarecer essa decisão.
- O escopo desta skill é a preparação do frontend. Backend, autenticação, integração de API e funcionalidades de negócio dependem do pedido.
- Antes da instalação, confirme comandos e APIs na documentação oficial vinculada abaixo e a compatibilidade com o runtime disponível. Use o lockfile para registrar as versões resolvidas; não copie números de versão ou flags antigas de memória.

## Configurar a base

Use o scaffold oficial adequado ou complete a base existente, evitando executar inicializadores sobre arquivos que eles possam sobrescrever.

- Configure Tailwind CSS pela integração atual com Vite e inicialize shadcn/ui. Confira o CSS global, os tokens de tema, components.json e seus aliases.
- Configure @/ para src/ de forma consistente no Vite e nas configurações TypeScript efetivamente usadas pela aplicação.
- Instale @tanstack/react-router e @tanstack/router-plugin. No Vite, posicione tanstackRouter({ target: 'react', autoCodeSplitting: true }) antes do plugin React.
- Configure a instância do router, o registro de tipos e RouterProvider no ponto de entrada. Use __root.tsx com Outlet para a composição raiz.
- Gere routeTree.gen.ts pela ferramenta. Não o edite manualmente e exclua-o das alterações automáticas de lint e formatação.
- Faça a geração de rotas anteceder a checagem de tipos em uma instalação limpa: o arquivo gerado pode ainda não existir quando o compilador iniciar.

## Organização e interface

Adote esta organização como ponto de partida, ajustando-a ao workspace e ao scaffold:

- src/components/ui/: componentes instalados pelo CLI do shadcn.
- src/components/: composições visuais compartilhadas.
- src/lib/utils.ts: utilitário de classes usado pelos componentes, quando gerado.
- src/routes/__root.tsx, index.tsx e about.tsx: layout raiz e duas rotas mínimas.
- src/router.tsx: criação do router e registro dos seus tipos.
- src/routeTree.gen.ts: árvore gerada.
- src/main.tsx e o CSS global da aplicação.

Preserve convenções de nomes especiais do roteador e arquivos gerados. Use kebab-case para arquivos próprios e crie pastas adicionais quando houver código que as justifique.

- Siga o visual solicitado. Sem referência, use tema neutro e layout simples e responsivo.
- Adicione pelo CLI oficial somente os componentes shadcn usados na interface inicial; use os tokens de tema para cores e superfícies.
- Use Link do TanStack Router na navegação interna e configure uma apresentação para rotas não encontradas.
- Crie duas rotas navegáveis para demonstrar a integração; adapte seus nomes e conteúdos ao produto solicitado.
- Preserve semântica, foco visível, nomes acessíveis e navegação por teclado.
- Adicione Query, Form, estado global ou outras bibliotecas quando os requisitos concretos precisarem delas.

## Usabilidade e clareza da interface

- Pense nas tarefas de quem usa o produto pela primeira vez: identifique o objetivo da tela, as ações disponíveis para cada perfil e o próximo passo. Use o contexto e os requisitos confirmados; quando uma permissão ou regra de negócio não estiver clara, esclareça-a em vez de inventá-la.
- Prefira rótulos, botões e mensagens em linguagem do público, com hierarquia visual clara. Explique junto à ação os requisitos, as restrições relevantes e, quando útil, por que uma opção não está disponível e como prosseguir; não dependa de documentação externa para uma tarefa comum.
- Ao criar fluxos interativos solicitados, apresente estados de carregamento, ausência de dados, sucesso e erro adequados; preserve os dados preenchidos quando possível e ofereça uma próxima ação. Evite ações ou controles que aparentem funcionar sem estarem implementados.
- Faça formulários e navegação utilizáveis por teclado e tecnologias assistivas, com foco visível, nomes acessíveis e mensagens compreensíveis. Adapte a apresentação a celular e desktop, mantendo coerência com o design e os componentes existentes.
- Quando houver navegador disponível, percorra as tarefas incluídas na entrega como uma pessoa sem conhecimento do sistema. Verifique se é possível identificar o objetivo, executar a ação e entender o resultado e as restrições; registre limites ou problemas não verificados.

## Verificar e entregar

- Instale dependências, preserve o lockfile e disponibilize scripts para dev, build, checagem de tipos e lint. Reutilize os scripts e ferramentas existentes.
- Execute geração de rotas, checagem de tipos, lint e build. Resolva falhas relacionadas ao trabalho.
- Quando houver ferramenta de navegador disponível, abra a aplicação e confira navegação, rota desconhecida e apresentação em celular e desktop.
- Para deploy como SPA, informe o requisito de fallback para index.html no acesso direto a rotas. Configure-o quando o provedor de hospedagem fizer parte do pedido.
- Na entrega, informe o diretório criado, o comando para iniciar, as rotas disponíveis, as verificações executadas e limitações observadas. Não declare verificações que não executou.

## Documentação oficial

Consulte conforme a etapa, sem carregar todas as páginas antecipadamente:

- Inicialização, Tailwind e aliases do shadcn/ui com Vite: https://ui.shadcn.com/docs/installation/vite
- Configuração do CLI e aliases: https://ui.shadcn.com/docs/components-json
- Plugin Vite e arquivo de rotas gerado: https://tanstack.com/router/latest/docs/installation/with-vite
- Instância do router, registro de tipos e rotas iniciais: https://tanstack.com/router/latest/docs/installation/manual
