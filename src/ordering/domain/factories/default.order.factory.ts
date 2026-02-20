import { OrderAggregate } from "../aggregates/order.aggregate";
import { OrderFactoryInterface } from "./order.factory.interface";
import { OrderIdValueObject } from "../value-objects/order.id.value.object";

export class DefaultOrderFactory implements OrderFactoryInterface {
    createDraft(orderId: OrderIdValueObject, currency: string): OrderAggregate {
        return OrderAggregate.createNew(orderId, currency);
    }
}
