import { DomainError } from "../shared/domain.error";

export class OrderIdValueObject {
    private constructor(private readonly value: string) {}

    static from(value: string): OrderIdValueObject {
        const v = value.trim();
        if (!v) throw new DomainError("OrderId cannot be empty");
        return new OrderIdValueObject(v);
    }

    equals(other: OrderIdValueObject): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
