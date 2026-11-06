import { ValueObject } from "../../../../core/entities/object-value.ts";
import { InvalidMoneyError } from "../errors/invalid-money-error.ts";
import { left, right, type Either } from "../../../../core/either.ts";

interface MoneyProps {
  cents: number;
  currency: "BRL";
}

export class MoneyObjectValue extends ValueObject<MoneyProps> {
  get cents() {
    return this.props.cents;
  }

  get currency() {
    return this.props.currency;
  }

  static create(cents: number): Either<InvalidMoneyError, MoneyObjectValue> {
    if (!Number.isSafeInteger(cents) || cents <= 0) {
      return left(new InvalidMoneyError());
    }

    return right(new MoneyObjectValue({ cents, currency: "BRL" }));
  }
}
