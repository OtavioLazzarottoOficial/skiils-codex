import { Injectable } from "@nestjs/common";
import { left, right, type Either } from "../../../../core/either.ts";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id.ts";
import { Expense } from "../../enterprise/expense.ts";
import { InvalidExpenseError } from "../../enterprise/errors/invalid-expense-error.ts";
import { InvalidMoneyError } from "../../enterprise/errors/invalid-money-error.ts";
import { MoneyObjectValue } from "../../enterprise/object-values/money-object-value.ts";
import { ExpensesRepository } from "../repositories/expenses-repository.ts";

export interface CreateExpenseUseCaseRequest {
  description: string;
  /** Integer cents in BRL: 1099 represents R$ 10,99. */
  amount: number;
  due_date: Date;
  user_id: string;
}

export type CreateExpenseUseCaseResponse = Either<
  InvalidExpenseError | InvalidMoneyError,
  { expense: Expense }
>;

@Injectable()
export class CreateExpenseUseCase {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async execute(
    request: CreateExpenseUseCaseRequest,
  ): Promise<CreateExpenseUseCaseResponse> {
    const amountResult = MoneyObjectValue.create(request.amount);

    if (amountResult.isLeft()) {
      return left(amountResult.value);
    }

    const expenseResult = Expense.create({
      description: request.description,
      amount: amountResult.value,
      due_date: request.due_date,
      user_id: new UniqueEntityID(request.user_id),
    });

    if (expenseResult.isLeft()) {
      return left(expenseResult.value);
    }

    const expense = expenseResult.value;

    await this.expensesRepository.create(expense);

    return right({ expense });
  }
}
