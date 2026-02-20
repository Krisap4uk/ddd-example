import { OrderIdValueObject } from "../value-objects/order.id.value.object";
import { OrderAggregate } from "../aggregates/order.aggregate";

export interface OrderRepositoryInterface {
    getById(id: OrderIdValueObject): Promise<OrderAggregate | null>;

    save(order: OrderAggregate): Promise<void>;
}