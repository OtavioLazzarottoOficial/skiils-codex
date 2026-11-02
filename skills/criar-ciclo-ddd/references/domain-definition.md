# Definir a entidade antes da implementação

Use os requisitos e o código do projeto como fonte dos atributos e das regras. O nome da entidade, sozinho, não determina seu modelo.

## Pedido sem definição suficiente

Pedido: “Cadastrar categoria” em um projeto que ainda não define categorias.

Proponha uma possibilidade mínima e faça uma pergunta curta, por exemplo: “A categoria será uma classificação apenas com nome ou terá categoria pai? Quais campos são obrigatórios e o nome precisa ser único?” A proposta é provisória. Aguarde a resposta antes de gerar os arquivos. Não adicione descrição, slug ou status só porque existem em outro exemplo. Se o usuário delegar explicitamente essas decisões, apresente as escolhas assumidas e prossiga dentro dessa autorização.

## Pedido com definição suficiente

Pedido: “Cadastrar categoria com apenas nome obrigatório, sem hierarquia e permitindo nomes repetidos.”

Implemente name e a identidade/datas aplicáveis do core, com criação, persistência em memória e testes. Não introduza findByName, parentId ou erro de nome duplicado. A factory usa Faker para name e aceita overrides; os testes fixam os valores necessários.

## Pedido com comportamento definido

Pedido: “Uma reserva tem início e fim; o fim deve ser posterior ao início. Só reservas pendentes podem ser canceladas.”

Essas regras justificam invariantes de datas e um comportamento de cancelamento, com testes de sucesso e rejeição. Antes de implementá-lo, esclareça estados ou transições que o projeto ainda não defina. Não acrescente pagamento, usuário, estoque ou outras relações por associação com o nome “reserva”.

O ciclo permanece limitado à operação pedida. Mesmo que a entidade tenha outras regras conhecidas, não gere automaticamente todo o CRUD nem sua infraestrutura.
