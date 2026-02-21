import { AggregateRoot } from "../shared/domain.event";
import { DomainError } from "../shared/domain.error";
import { DiscountPrimitive, DiscountValueObject } from "../value-objects/discount.value.object";
import { MoneyValueObject } from "../value-objects/money.value.object";
import { OrderIdValueObject } from "../value-objects/order.id.value.object";
import { OrderItemEntity } from "../entities/order.item.entity";
import { OrderItemIdValueObject } from "../value-objects/order.item.id.value.object";
import { DiscountPolicyPort } from "../services/discount.policy.port";
import { OrderConfirmationSpecification } from "../specifications/order.confirmation.specification.interface";
import {
    DiscountAppliedToOrder,
    ItemAddedToOrder,
    OrderConfirmed,
    OrderCreated,
    OrderItemQuantityChanged,
    OrderItemRemoved,
    OrderStatus,
} from "../events/events";

export type OrderDiscount = DiscountPrimitive | null;

export type OrderItemDetails = {
    id: string;
    sku: string;
    unitPriceCents: number;
    currency: string;
    quantity: number;
};

export class OrderAggregate extends AggregateRoot {
    private status: OrderStatus = "DRAFT";
    private readonly items: OrderItemEntity[] = [];
    private discount: DiscountValueObject | null = null;

    private constructor(private readonly id: OrderIdValueObject, private readonly currency: string) {
        super();
        this.currency = OrderAggregate.normalizeCurrency(currency);
    }

    static createNew(id: OrderIdValueObject, currency = "USD"): OrderAggregate {
        const order = new OrderAggregate(id, currency);
        order.record(new OrderCreated({ orderId: order.id.toString() }));
        return order;
    }

    static restore(params: {
        id: OrderIdValueObject;
        currency: string;
        status: OrderStatus;
        items: OrderItemEntity[];
        discount: DiscountValueObject | null;
    }): OrderAggregate {
        const order = new OrderAggregate(params.id, params.currency);
        order.status = params.status;
        order.items.push(...params.items);
        order.discount = params.discount;
        return order;
    }

    getId(): OrderIdValueObject {
        return this.id;
    }

    getStatus(): OrderStatus {
        return this.status;
    }

    getCurrency(): string {
        return this.currency;
    }

    getDiscount(): OrderDiscount {
        return this.discount ? this.discount.toPrimitives() : null;
    }

    listItems(): ReadonlyArray<OrderItemDetails> {
        return this.items.map((i) => ({
            id: i.getId().toString(),
            sku: i.getSku(),
            unitPriceCents: i.getUnitPrice().getCents(),
            currency: i.getUnitPrice().getCurrency(),
            quantity: i.getQuantity(),
        }));
    }

    addItem(
        sku: string,
        unitPrice: MoneyValueObject,
        quantity: number,
        nextItemId: () => OrderItemIdValueObject,
    ): OrderItemIdValueObject {
        this.assertDraft();

        if (unitPrice.getCurrency() !== this.currency) {
            throw new DomainError("Unit price currency must match order currency");
        }

        const normalizedSku = sku.trim();
        if (!normalizedSku) {
            throw new DomainError("SKU cannot be empty");
        }

        const existing = this.items.find((i) => i.getSku() === normalizedSku);
        if (!existing && this.items.length >= 10) {
            throw new DomainError("Cannot have more than 10 unique items in an order");
        }

        if (existing) {
            existing.increase(quantity);
            this.record(
                new ItemAddedToOrder({
                    orderId: this.id.toString(),
                    itemId: existing.getId().toString(),
                    sku: normalizedSku,
                    quantity,
                }),
            );
            return existing.getId();
        }

        const item = OrderItemEntity.create({
            id: nextItemId(),
            sku: normalizedSku,
            unitPrice,
            quantity,
        });

        this.items.push(item);

        this.record(
            new ItemAddedToOrder({
                orderId: this.id.toString(),
                itemId: item.getId().toString(),
                sku: normalizedSku,
                quantity,
            }),
        );

        return item.getId();
    }

    changeItemQuantity(itemId: string, to: number): void {
        this.assertDraft();
        const id = OrderItemIdValueObject.from(itemId);
        const item = this.findItemOrThrow(id);
        const from = item.getQuantity();
        item.changeQuantity(to);
        this.record(new OrderItemQuantityChanged({ orderId: this.id.toString(), itemId: id.toString(), from, to }));
    }

    removeItem(itemId: string): void {
        this.assertDraft();
        const id = OrderItemIdValueObject.from(itemId);
        const idx = this.items.findIndex((i) => i.getId().equals(id));
        if (idx === -1) {
            throw new DomainError("OrderItem not found");
        }
        this.items.splice(idx, 1);
        this.record(new OrderItemRemoved({ orderId: this.id.toString(), itemId: id.toString() }));
    }

    applyDiscount(code: string, discountPolicy: DiscountPolicyPort): void {
        this.assertDraft();
        if (this.discount) {
            throw new DomainError("Discount already applied");
        }

        const resolved = discountPolicy.resolve(code);
        this.discount = DiscountValueObject.of(resolved.code, resolved.percent);

        this.record(
            new DiscountAppliedToOrder({
                orderId: this.id.toString(),
                code: this.discount.getCode(),
                percent: this.discount.getPercent(),
            }),
        );
    }

    totalBeforeDiscount(): MoneyValueObject {
        return this.items.reduce((acc, it) => acc.add(it.lineTotal()), MoneyValueObject.zero(this.currency));
    }

    discountAmount(): MoneyValueObject {
        if (!this.discount) {
            return MoneyValueObject.zero(this.currency);
        }
        return this.totalBeforeDiscount().multiply(this.discount.getPercent() / 100);
    }

    total(): MoneyValueObject {
        const before = this.totalBeforeDiscount();
        const disc = this.discountAmount();
        if (disc.compareTo(before) >= 0) {
            return MoneyValueObject.zero(this.currency);
        }
        return before.subtract(disc);
    }

    confirm(confirmationSpecification: OrderConfirmationSpecification): void {
        this.assertDraft();
        confirmationSpecification.assertSatisfiedBy(this);

        const total = this.total();
        this.status = "CONFIRMED";
        this.record(
            new OrderConfirmed({
                orderId: this.id.toString(),
                totalCents: total.getCents(),
                currency: total.getCurrency(),
            }),
        );
    }

    private findItemOrThrow(id: OrderItemIdValueObject): OrderItemEntity {
        const item = this.items.find((i) => i.getId().equals(id));
        if (!item) {
            throw new DomainError("OrderItem not found");
        }
        return item;
    }

    private assertDraft(): void {
        if (this.status !== "DRAFT") {
            throw new DomainError("Order is not editable after confirmation");
        }
    }

    private static normalizeCurrency(currency: string): string {
        const normalized = currency.trim();
        if (!normalized) {
            throw new DomainError("Currency cannot be empty");
        }
        return normalized;
    }
}
