import { DomainEvent } from "../shared/domain.event";

export type OrderStatus = "DRAFT" | "CONFIRMED";

export class OrderCreated implements DomainEvent {
    readonly type = "ordering.order.created";
    readonly occurredAt = new Date();

    constructor(public readonly payload: { orderId: string }) {}
}

export class ItemAddedToOrder implements DomainEvent {
    readonly type = "ordering.order.itemAdded";
    readonly occurredAt = new Date();

    constructor(public readonly payload: { orderId: string; itemId: string; sku: string; qty: number }) {}
}

export class OrderItemQuantityChanged implements DomainEvent {
    readonly type = "ordering.order.itemQtyChanged";
    readonly occurredAt = new Date();

    constructor(public readonly payload: { orderId: string; itemId: string; from: number; to: number }) {}
}

export class OrderItemRemoved implements DomainEvent {
    readonly type = "ordering.order.itemRemoved";
    readonly occurredAt = new Date();

    constructor(public readonly payload: { orderId: string; itemId: string }) {}
}

export class DiscountAppliedToOrder implements DomainEvent {
    readonly type = "ordering.order.discountApplied";
    readonly occurredAt = new Date();

    constructor(public readonly payload: { orderId: string; code: string; percent: number }) {}
}

export class OrderConfirmed implements DomainEvent {
    readonly type = "ordering.order.confirmed";
    readonly occurredAt = new Date();

    constructor(public readonly payload: { orderId: string; totalCents: number; currency: string }) {}
}
