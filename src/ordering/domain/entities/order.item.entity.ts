import { DomainError } from "../shared/domain.error";
import { MoneyValueObject } from "../value-objects/money.value.object";
import { OrderItemIdValueObject } from "../value-objects/order.item.id.value.object";

/** OrderItem — Entity (имеет собственный OrderItemId). */
export class OrderItemEntity {
    private constructor(
        private readonly id: OrderItemIdValueObject,
        private readonly sku: string,
        private readonly unitPrice: MoneyValueObject,
        private quantity: number
    ) {}

    static create(params: { id: OrderItemIdValueObject; sku: string; unitPrice: MoneyValueObject; quantity: number }): OrderItemEntity {
        const sku = params.sku.trim();
        if (!sku) throw new DomainError("SKU cannot be empty");
        if (!Number.isInteger(params.quantity) || params.quantity <= 0) throw new DomainError("Quantity must be a positive integer");
        return new OrderItemEntity(params.id, sku, params.unitPrice, params.quantity);
    }

    getId(): OrderItemIdValueObject {
        return this.id;
    }

    getSku(): string {
        return this.sku;
    }

    getQuantity(): number {
        return this.quantity;
    }

    getUnitPrice(): MoneyValueObject {
        return this.unitPrice;
    }

    increase(by: number) {
        if (!Number.isInteger(by) || by <= 0) throw new DomainError("Increase must be positive integer");
        this.quantity += by;
    }

    changeQuantity(to: number) {
        if (!Number.isInteger(to) || to <= 0) throw new DomainError("Quantity must be a positive integer");
        this.quantity = to;
    }

    lineTotal(): MoneyValueObject {
        return this.unitPrice.multiply(this.quantity);
    }
}
