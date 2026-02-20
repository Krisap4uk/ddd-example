import { DomainError } from "../shared/domain.error";

export class OrderItemIdValueObject {
    private constructor(private readonly value: string) {}

    static from(value: string): OrderItemIdValueObject {
        const v = value.trim();
        if (!v) throw new DomainError("OrderItemId cannot be empty");
        return new OrderItemIdValueObject(v);
    }

    equals(other: OrderItemIdValueObject): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
