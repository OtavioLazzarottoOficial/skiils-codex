import type { UseCaseError } from "../../../../core/error/use-case-error.ts";

export class InvalidMoneyError extends Error implements UseCaseError {
  constructor() {
    super("O valor deve ser um inteiro positivo seguro em centavos.");
    this.name = "InvalidMoneyError";
  }
}
