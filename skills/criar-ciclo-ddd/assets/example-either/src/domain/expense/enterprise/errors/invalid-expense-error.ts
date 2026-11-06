import type { UseCaseError } from "../../../../core/error/use-case-error.ts";

export class InvalidExpenseError extends Error implements UseCaseError {
  constructor(
    public readonly field: "description" | "due_date" | "user_id",
    message: string,
  ) {
    super(message);
    this.name = "InvalidExpenseError";
  }
}
