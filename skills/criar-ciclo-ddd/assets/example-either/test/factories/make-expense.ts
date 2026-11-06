import { faker } from "@faker-js/faker";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id.ts";
import {
  Expense,
  type ExpenseProps,
} from "../../src/domain/expense/enterprise/expense.ts";
import { MoneyObjectValue } from "../../src/domain/expense/enterprise/object-values/money-object-value.ts";

export function makeExpense(
  overrides: Partial<ExpenseProps> = {},
  id?: UniqueEntityID,
) {
  const amountResult = MoneyObjectValue.create(
    faker.number.int({ min: 1, max: 1000000 }),
  );

  if (amountResult.isLeft()) {
    throw amountResult.value;
  }

  const result = Expense.create(
    {
      description: faker.commerce.productName(),
      amount: amountResult.value,
      due_date: faker.date.future(),
      user_id: new UniqueEntityID(faker.string.uuid()),
      ...overrides,
    },
    id,
  );

  if (result.isLeft()) {
    throw result.value;
  }

  return result.value;
}
