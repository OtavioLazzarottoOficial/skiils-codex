import { ProductsRepository } from "../../src/domain/product/application/repositories/products-repository.js";
import type { Product } from "../../src/domain/product/enterprise/product.js";

export class ProductsRepositoryInMemory extends ProductsRepository {
  public items: Product[] = [];

  create(product: Product): Promise<void> {
    this.items.push(product);
    return Promise.resolve();
  }
}
