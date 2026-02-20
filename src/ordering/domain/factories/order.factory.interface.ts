import { OrderAggregate } from "../aggregates/order.aggregate";
import { OrderIdValueObject } from "../value-objects/order.id.value.object";

export interface OrderFactoryInterface {
    createDraft(orderId: OrderIdValueObject, currency: string): OrderAggregate;
}
