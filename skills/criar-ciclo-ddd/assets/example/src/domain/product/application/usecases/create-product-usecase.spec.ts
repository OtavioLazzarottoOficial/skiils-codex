import { beforeEach, describe, expect, it } from "vitest";
import { CreateProductUseCase } from "./create-product-usecase.ts";
import { ProductsRepositoryInMemory } from "../../../../../test/repository-in-memory/products-repository-in-memory.ts";
import { makeProduct } from "../../../../../test/factories/make-product.ts";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id.ts";

describe("Create Product Use Case", () => {
  let productsRepository: ProductsRepositoryInMemory;
  let sut: CreateProductUseCase;

  beforeEach(() => {
    productsRepository = new ProductsRepositoryInMemory();
    sut = new CreateProductUseCase(productsRepository);
  });

  it("creates and persists the product returned by the use case", async () => {
    const data = makeProduct({ name: "Teclado", description: "Teclado USB" });
    const result = await sut.execute({
      name: data.name,
      description: data.description,
    });

    expect(result.isRight()).toBe(true);
    if (!result.isRight()) throw new Error("Expected successful creation");
    const product = result.value.product;
    expect(product.name).toBe("Teclado");
    expect(product.description).toBe("Teclado USB");
    expect(product.id.toString()).toBeTruthy();
    expect(product.created_at).toBeInstanceOf(Date);
    expect(product.updated_at).toBeNull();
    expect(productsRepository.items).toHaveLength(1);
    expect(productsRepository.items[0]).toBe(product);
  });

  it("supports explicit identity and dates when rebuilding a product", () => {
    const id = new UniqueEntityID("7b76ae91-af20-4733-811c-37d1dbfcdd3c");
    const createdAt = new Date("2026-01-01T12:00:00Z");
    const updatedAt = new Date("2026-01-02T12:00:00Z");
    const product = makeProduct(
      { name: "Monitor", created_at: createdAt, updated_at: updatedAt },
      id,
    );

    expect(product.id.toString()).toBe(id.toString());
    expect(product.name).toBe("Monitor");
    expect(product.created_at).toEqual(createdAt);
    expect(product.updated_at).toEqual(updatedAt);
  });
});
