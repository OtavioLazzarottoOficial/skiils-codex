import { describe, expect, it } from "vitest";
import { makeExpense } from "../../../../test/factories/make-expense.ts";
import { UniqueEntityID } from "../../../core/entities/unique-entity-id.ts";
import { Expense } from "./expense.ts";
import { InvalidExpenseError } from "./errors/invalid-expense-error.ts";

describe("Expense", () => {
  it("supports factory overrides and reconstitution with identity and dates", () => {
    const id = new UniqueEntityID("expense-1");
    const user_id = new UniqueEntityID("user-1");
    const amount = makeExpense().amount;
    const created_at = new Date("2026-01-01");
    const updated_at = new Date("2026-02-01");
    const due_date = new Date("2026-03-01");
    const expense = makeExpense(
      {
        description: "Internet",
        amount,
        user_id,
        created_at,
        updated_at,
        due_date,
      },
      id,
    );
    expect(expense.id).toBe(id);
    expect(expense).toMatchObject({
      description: "Internet",
      amount,
      user_id,
      created_at,
      updated_at,
      due_date,
    });
  });

  it.each(["", "  "])(
    "rejects an empty description directly in the entity",
    (description) => {
      const valid = makeExpense();
      const result = Expense.create({
        description,
        amount: valid.amount,
        due_date: valid.due_date,
        user_id: valid.user_id,
      });
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidExpenseError);
    },
  );

  it("rejects invalid due dates directly in the entity", () => {
    const valid = makeExpense();
    const result = Expense.create({
      description: valid.description,
      amount: valid.amount,
      due_date: new Date("invalid"),
      user_id: valid.user_id,
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidExpenseError);
  });

  it("protects the due date from external mutation", () => {
    const due_date = new Date("2026-12-10");
    const expected = new Date(due_date);
    const expense = makeExpense({ due_date });
    due_date.setFullYear(2030);
    expense.due_date.setFullYear(2040);
    expect(expense.due_date).toEqual(expected);
  });
});
