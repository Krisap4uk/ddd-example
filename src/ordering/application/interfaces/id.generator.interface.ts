import { OrderIdValueObject } from "../../domain/value-objects/order.id.value.object";
import { OrderItemIdValueObject } from "../../domain/value-objects/order.item.id.value.object";

export interface OrderIdGeneratorPort {
    nextOrderId(): OrderIdValueObject;
}

export interface OrderItemIdGeneratorPort {
    nextOrderItemId(): OrderItemIdValueObject;
}
