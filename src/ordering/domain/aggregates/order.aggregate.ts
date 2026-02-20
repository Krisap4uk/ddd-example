import { AggregateRoot } from "../shared/domain.event";
import { DomainError } from "../shared/domain.error";
import { MoneyValueObject } from "../value-objects/money.value.object";
import { OrderIdValueObject } from "../value-objects/order.id.value.object";
import { OrderItemEntity, OrderItemSnapshot } from "../entities/order.item.entity";
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

type Discount = { code: string; percent: number } | null;

export type OrderSnapshot = {
    id: string;
    currency: string;
    status: OrderStatus;
    items: OrderItemSnapshot[];
    discount: Discount;
};

export class OrderAggregate extends AggregateRoot {
    private status: OrderStatus = "DRAFT";
    private readonly items: OrderItemEntity[] = [];
    private discount: Discount = null;

    private constructor(private readonly id: OrderIdValueObject, private readonly currency: string) {
        super();
        this.currency = OrderAggregate.normalizeCurrency(currency);
    }

    static createNew(id: OrderIdValueObject, currency = "USD"): OrderAggregate {
        const order = new OrderAggregate(id, currency);
        order.record(new OrderCreated({ orderId: order.id.toString() }));
        return order;
    }

    static rehydrate(snapshot: OrderSnapshot): OrderAggregate {
        const order = new OrderAggregate(OrderIdValueObject.from(snapshot.id), snapshot.currency);
        order.status = snapshot.status;
        order.items.push(...snapshot.items.map(OrderItemEntity.rehydrate));
        order.discount = snapshot.discount ? { ...snapshot.discount } : null;
        return order;
    }

    snapshot(): OrderSnapshot {
        return {
            id: this.id.toString(),
            currency: this.currency,
            status: this.status,
            items: this.items.map((i) => i.snapshot()),
            discount: this.discount ? { ...this.discount } : null,
        };
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

    listItems(): ReadonlyArray<OrderItemSnapshot> {
        return this.items.map((i) => i.snapshot());
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
                    qty: quantity,
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
                qty: quantity,
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
        this.discount = { code: resolved.code, percent: resolved.percent };

        this.record(
            new DiscountAppliedToOrder({
                orderId: this.id.toString(),
                code: resolved.code,
                percent: resolved.percent,
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
        return this.totalBeforeDiscount().multiply(this.discount.percent / 100);
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
