import { Entity } from "../../../core/entities/entity.js";
import { UniqueEntityID } from "../../../core/entities/unique-entity-id.js";
import type { Optional } from "../../../core/types/optional.js";

export interface ProductProps {
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date | null;
}

export class Product extends Entity<ProductProps> {
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get created_at() {
    return this.props.created_at;
  }
  get updated_at() {
    return this.props.updated_at;
  }

  static create(
    props: Optional<ProductProps, "created_at" | "updated_at">,
    id?: UniqueEntityID,
  ) {
    return new Product(
      {
        ...props,
        created_at: props.created_at ?? new Date(),
        updated_at: props.updated_at ?? null,
      },
      id,
    );
  }
}
