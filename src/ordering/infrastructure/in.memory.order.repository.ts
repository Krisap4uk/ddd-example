import { OrderAggregate } from "../domain/aggregates/order.aggregate";
import { OrderIdValueObject } from "../domain/value-objects/order.id.value.object";
import { OrderRepositoryInterface } from "../domain/repositories/order.repository.interface";
import { fromOrderSnapshot, OrderSnapshot, toOrderSnapshot } from "./persistence/order.snapshot.mapper";

export class InMemoryOrderRepository implements OrderRepositoryInterface {
    private readonly store = new Map<string, OrderSnapshot>();

    async getById(id: OrderIdValueObject): Promise<OrderAggregate | null> {
        const snap = this.store.get(id.toString());
        return snap ? fromOrderSnapshot(snap) : null;
    }

    async save(order: OrderAggregate): Promise<void> {
        this.store.set(order.getId().toString(), toOrderSnapshot(order));
    }
}
