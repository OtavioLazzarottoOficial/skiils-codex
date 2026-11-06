# Ciclo com rejeições esperadas

O exemplo autocontido em ../assets/example-either usa o core, NestJS, Faker e Vitest do backend de destino. Copie os arquivos para um backend de teste já preparado; não duplique core nem dependências e não sobrescreva funcionalidades existentes. Ele contém Expense, MoneyObjectValue, erros próprios, contrato de repositório, CreateExpenseUseCase, factory, repositório em memória e testes.

Regras exclusivas deste exemplo: descrição obrigatória, centavos positivos em BRL dentro de Number.MAX_SAFE_INTEGER, vencimento como Date válido e ID de responsável não vazio. Não há estado de pagamento nem verificação de existência do usuário. Estas escolhas servem para demonstrar o fluxo, não para definir novas entidades.

MoneyObjectValue.create retorna Either<InvalidMoneyError, MoneyObjectValue>; Expense.create retorna Either<InvalidExpenseError, Expense>. O caso de uso verifica cada isLeft(), retorna left com o erro específico, e só persiste depois de obter uma entidade válida; sucesso retorna right({ expense }). Não há try/catch no caso de uso. Falhas inesperadas do repositório propagam.

A factory de teste desembrulha Right e lança caso seus próprios dados de preparação sejam inválidos. Isso não muda o contrato de produção; cenários de rejeição chamam create/execute diretamente e verificam Left e ausência de persistência.

O exemplo mínimo sem rejeições continua em example-cycle.md. Em ambos, use @Injectable(), private readonly e imports .ts; separe preparação, validações, persistência e retorno com linhas em branco. Execute o formatador e depois testes, typecheck, build e lint.

Antes de persistir dinheiro, escolha tipo de banco que suporte o intervalo do domínio: Int/PostgreSQL integer não comporta todos os inteiros seguros JavaScript. Se usar bigint, o mapper precisa verificar limites antes de converter para number e o presenter não deve devolver BigInt cru em JSON. Antes de expor vencimentos, defina data de calendário versus instante e seu fuso; o Date deste exemplo não resolve essa decisão de produto.
