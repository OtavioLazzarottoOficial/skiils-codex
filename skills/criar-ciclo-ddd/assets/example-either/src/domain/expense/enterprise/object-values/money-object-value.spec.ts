import { describe, expect, it } from "vitest";
import { MoneyObjectValue } from "./money-object-value.ts";
import { InvalidMoneyError } from "../errors/invalid-money-error.ts";

describe("MoneyObjectValue", () => {
  it.each([1, 1099, Number.MAX_SAFE_INTEGER])(
    "preserves %s cents without rounding",
    (cents) => {
      const result = MoneyObjectValue.create(cents);
      expect(result.isRight()).toBe(true);
      if (result.isLeft()) throw result.value;
      expect(result.value.cents).toBe(cents);
      expect(result.value.currency).toBe("BRL");
    },
  );

  it.each([0, -1, 0.1, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "returns Left for invalid amount %s",
    (cents) => {
      const result = MoneyObjectValue.create(cents);
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidMoneyError);
    },
  );

  it("compares money by value through the existing base class", () => {
    const first = MoneyObjectValue.create(100);
    const same = MoneyObjectValue.create(100);
    const different = MoneyObjectValue.create(101);
    if (first.isLeft() || same.isLeft() || different.isLeft())
      throw new Error("Invalid fixture");
    expect(first.value.equals(same.value)).toBe(true);
    expect(first.value.equals(different.value)).toBe(false);
  });
});
