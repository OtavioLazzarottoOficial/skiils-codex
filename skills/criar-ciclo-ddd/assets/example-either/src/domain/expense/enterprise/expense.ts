import { left, right, type Either } from "../../../core/either.ts";
import { Entity } from "../../../core/entities/entity.ts";
import { UniqueEntityID } from "../../../core/entities/unique-entity-id.ts";
import type { Optional } from "../../../core/types/optional.ts";
import { InvalidExpenseError } from "./errors/invalid-expense-error.ts";
import { MoneyObjectValue } from "./object-values/money-object-value.ts";

export interface ExpenseProps {
  description: string;
  amount: MoneyObjectValue;
  due_date: Date;
  user_id: UniqueEntityID;
  created_at: Date;
  updated_at: Date | null;
}

export class Expense extends Entity<ExpenseProps> {
  get description() {
    return this.props.description;
  }

  get amount() {
    return this.props.amount;
  }

  get due_date() {
    return new Date(this.props.due_date);
  }

  get user_id() {
    return this.props.user_id;
  }

  get created_at() {
    return new Date(this.props.created_at);
  }

  get updated_at() {
    return this.props.updated_at ? new Date(this.props.updated_at) : null;
  }

  static create(
    props: Optional<ExpenseProps, "created_at" | "updated_at">,
    id?: UniqueEntityID,
  ): Either<InvalidExpenseError, Expense> {
    if (!props.description.trim()) {
      return left(
        new InvalidExpenseError("description", "A descrição é obrigatória."),
      );
    }

    if (!Number.isFinite(props.due_date.getTime())) {
      return left(
        new InvalidExpenseError(
          "due_date",
          "A data de vencimento deve ser válida.",
        ),
      );
    }

    if (!props.user_id.toString().trim()) {
      return left(
        new InvalidExpenseError(
          "user_id",
          "O usuário responsável é obrigatório.",
        ),
      );
    }

    return right(
      new Expense(
        {
          ...props,
          due_date: new Date(props.due_date),
          created_at: new Date(props.created_at ?? new Date()),
          updated_at: props.updated_at ? new Date(props.updated_at) : null,
        },
        id,
      ),
    );
  }
}
