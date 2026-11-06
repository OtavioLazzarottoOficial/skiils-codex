import { Injectable } from "@nestjs/common";
import type { Expense } from "../../enterprise/expense.ts";

@Injectable()
export abstract class ExpensesRepository {
  abstract create(expense: Expense): Promise<void>;
}
