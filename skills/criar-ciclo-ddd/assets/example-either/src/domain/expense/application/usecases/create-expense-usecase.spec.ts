import { InvalidMoneyError } from "../../enterprise/errors/invalid-money-error.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpensesRepositoryInMemory } from "../../../../../test/repository-in-memory/expenses-repository-in-memory.ts";
import { InvalidExpenseError } from "../../enterprise/errors/invalid-expense-error.ts";
import {
  CreateExpenseUseCase,
  type CreateExpenseUseCaseRequest,
} from "./create-expense-usecase.ts";

describe("Create expense", () => {
  let repository: ExpensesRepositoryInMemory;
  let sut: CreateExpenseUseCase;
  let request: CreateExpenseUseCaseRequest;

  beforeEach(() => {
    repository = new ExpensesRepositoryInMemory();
    sut = new CreateExpenseUseCase(repository);
    request = {
      description: "Conta de energia",
      amount: 15990,
      due_date: new Date("2026-12-10T12:00:00Z"),
      user_id: "user-1",
    };
  });

  it("creates and persists the expense with an exact BRL amount", async () => {
    const result = await sut.execute(request);
    expect(result.isRight()).toBe(true);
    if (!result.isRight()) throw new Error("Expected success");
    const { expense } = result.value;
    expect(repository.items).toEqual([expense]);
    expect(expense.description).toBe(request.description);
    expect(expense.amount.cents).toBe(15990);
    expect(expense.amount.currency).toBe("BRL");
    expect(expense.user_id.toString()).toBe("user-1");
    expect(expense.due_date).toEqual(request.due_date);
    expect(expense.created_at).toBeInstanceOf(Date);
    expect(expense.updated_at).toBeNull();
  });

  it.each([
    { description: "" },
    { description: "   " },
    { amount: 0 },
    { amount: -1 },
    { amount: 1.5 },
    { amount: NaN },
    { amount: Infinity },
    { amount: Number.MAX_SAFE_INTEGER + 1 },
    { due_date: new Date("invalid") },
    { user_id: "" },
    { user_id: "  " },
  ])("rejects invalid data without persistence: %o", async (override) => {
    const result = await sut.execute({ ...request, ...override });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      "amount" in override ? InvalidMoneyError : InvalidExpenseError,
    );
    expect(repository.items).toHaveLength(0);
  });

  it("propagates repository failures instead of reporting success", async () => {
    vi.spyOn(repository, "create").mockRejectedValueOnce(
      new Error("Database unavailable"),
    );
    await expect(sut.execute(request)).rejects.toThrow("Database unavailable");
  });
});
