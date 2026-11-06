import { ExpensesRepository } from "../../src/domain/expense/application/repositories/expenses-repository.ts";
import type { Expense } from "../../src/domain/expense/enterprise/expense.ts";

export class ExpensesRepositoryInMemory implements ExpensesRepository {
  items: Expense[] = [];

  async create(expense: Expense): Promise<void> {
    this.items.push(expense);
  }
}
