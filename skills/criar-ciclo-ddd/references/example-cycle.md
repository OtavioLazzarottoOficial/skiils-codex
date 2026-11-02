# Exemplo de criação de produto

Origem das convenções: ciclo de usuário demonstrado em O:/www/novo-backend. A referência incorporada é independente dessa pasta.

Pedido do exemplo: criar produto com name e description explicitamente solicitados, usando armazenamento em memória somente nos testes. Esses campos pertencem a esse pedido e não são defaults para novos produtos ou outras entidades. Antes de adaptar o exemplo, siga a definição de domínio em domain-definition.md. Nenhuma regra de unicidade, autenticação ou validação adicional foi solicitada.

Leia os seis arquivos em ../assets/example/:

- src/domain/product/enterprise/product.ts: entidade simples com datas e ID.
- src/domain/product/application/repositories/products-repository.ts: somente create.
- src/domain/product/application/usecases/create-product-usecase.ts: injeta contrato e retorna Either.
- test/factories/make-product.ts: dados gerados por @faker-js/faker, com overrides e ID opcional. Os testes fixam pelos overrides os valores que precisam comparar.
- test/repository-in-memory/products-repository-in-memory.ts: persistência em memória para testes.
- src/domain/product/application/usecases/create-product-usecase.spec.ts: comprova persistência, retorno e suporte da factory à reconstituição da entidade.

Os exemplos pressupõem o core do backend de destino (Entity, UniqueEntityID, Optional e Either) e NestJS/Vitest instalados. A factory usa @faker-js/faker como devDependency do backend. O caso de uso mantém @Injectable() na classe e declara os contratos no construtor sem @Inject(). Não copie um segundo core por módulo. Para cenários com erro de negócio, amplie o contrato, implemente o left e teste a falha conforme a regra real; este exemplo não define regras para outros domínios.
