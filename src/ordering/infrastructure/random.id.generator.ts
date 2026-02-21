import * as crypto from "node:crypto";
import { OrderIdGeneratorPort, OrderItemIdGeneratorPort } from "../application/interfaces/id.generator.interface";
import { OrderIdValueObject } from "../domain/value-objects/order.id.value.object";
import { OrderItemIdValueObject } from "../domain/value-objects/order.item.id.value.object";

export class RandomIdGenerator implements OrderIdGeneratorPort, OrderItemIdGeneratorPort {
    nextOrderId(): OrderIdValueObject {
        return OrderIdValueObject.from(`ord_${crypto.randomUUID()}`);
    }

    nextOrderItemId(): OrderItemIdValueObject {
        return OrderItemIdValueObject.from(`item_${crypto.randomUUID()}`);
    }
}
