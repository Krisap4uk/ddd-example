import { DomainError } from "../../domain/shared/domain.error";
import { DiscountValueObject } from "../../domain/value-objects/discount.value.object";
import { MoneyValueObject } from "../../domain/value-objects/money.value.object";
import { OrderIdValueObject } from "../../domain/value-objects/order.id.value.object";
import { OrderItemIdValueObject } from "../../domain/value-objects/order.item.id.value.object";
import { OrderItemEntity } from "../../domain/entities/order.item.entity";
import { OrderAggregate, OrderDiscount } from "../../domain/aggregates/order.aggregate";
import { OrderStatus } from "../../domain/events/events";

export type OrderItemSnapshot = {
    id: string;
    sku: string;
    unitPriceCents: number;
    currency: string;
    quantity: number;
};

export type OrderSnapshot = {
    id: string;
    currency: string;
    status: string;
    items: OrderItemSnapshot[];
    discount: OrderDiscount;
};

const ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set(["DRAFT", "CONFIRMED"]);

export function fromOrderSnapshot(snapshot: OrderSnapshot): OrderAggregate {
    const status = parseOrderStatus(snapshot.status);

    const items = snapshot.items.map((item) =>
        OrderItemEntity.create({
            id: OrderItemIdValueObject.from(item.id),
            sku: item.sku,
            unitPrice: MoneyValueObject.of(item.unitPriceCents, item.currency),
            quantity: item.quantity,
        }),
    );

    return OrderAggregate.restore({
        id: OrderIdValueObject.from(snapshot.id),
        currency: snapshot.currency,
        status,
        items,
        discount: snapshot.discount ? DiscountValueObject.of(snapshot.discount.code, snapshot.discount.percent) : null,
    });
}

export function toOrderSnapshot(order: OrderAggregate): OrderSnapshot {
    return {
        id: order.getId().toString(),
        currency: order.getCurrency(),
        status: order.getStatus(),
        items: order.listItems().map((item) => ({
            id: item.id,
            sku: item.sku,
            unitPriceCents: item.unitPriceCents,
            currency: item.currency,
            quantity: item.quantity,
        })),
        discount: order.getDiscount(),
    };
}

function parseOrderStatus(status: string): OrderStatus {
    if (!ORDER_STATUSES.has(status as OrderStatus)) {
        throw new DomainError(`Unknown order status: ${status}`);
    }
    return status as OrderStatus;
}
