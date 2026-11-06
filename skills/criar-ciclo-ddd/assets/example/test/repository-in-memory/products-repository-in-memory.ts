import { ProductsRepository } from "../../src/domain/product/application/repositories/products-repository.ts";
import type { Product } from "../../src/domain/product/enterprise/product.ts";

export class ProductsRepositoryInMemory extends ProductsRepository {
  public items: Product[] = [];

  create(product: Product): Promise<void> {
    this.items.push(product);
    return Promise.resolve();
  }
}
