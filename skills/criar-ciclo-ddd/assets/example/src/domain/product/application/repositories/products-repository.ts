import { Injectable } from "@nestjs/common";
import type { Product } from "../../enterprise/product.ts";

@Injectable()
export abstract class ProductsRepository {
  abstract create(product: Product): Promise<void>;
}
