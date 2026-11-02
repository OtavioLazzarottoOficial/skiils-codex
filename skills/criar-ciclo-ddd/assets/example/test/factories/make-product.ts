import { faker } from "@faker-js/faker";
import {
  Product,
  type ProductProps,
} from "../../src/domain/product/enterprise/product.js";
import { UniqueEntityID } from "../../src/core/entities/unique-entity-id.js";

export function makeProduct(
  overrides: Partial<ProductProps> = {},
  id?: UniqueEntityID,
) {
  return Product.create(
    {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      ...overrides,
    },
    id,
  );
}
