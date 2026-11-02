import { Injectable } from "@nestjs/common";
import { type Either, right } from "../../../../core/either.js";
import { ProductsRepository } from "../repositories/products-repository.js";
import { Product } from "../../enterprise/product.js";

export interface CreateProductUseCaseRequest {
  name: string;
  description: string;
}

export type CreateProductUseCaseResponse = Either<null, { product: Product }>;

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute({
    name,
    description,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    const product = Product.create({ name, description });
    await this.productsRepository.create(product);
    return right({ product });
  }
}
