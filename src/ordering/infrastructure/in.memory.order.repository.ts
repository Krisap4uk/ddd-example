import { OrderAggregate } from "../domain/aggregates/order.aggregate";
import { OrderIdValueObject } from "../domain/value-objects/order.id.value.object";
import { OrderRepositoryInterface } from "../domain/repositories/order.repository.interface";

export class InMemoryOrderRepository implements OrderRepositoryInterface {
    private readonly store = new Map<string, ReturnType<OrderAggregate["snapshot"]>>();

    async getById(id: OrderIdValueObject): Promise<OrderAggregate | null> {
        const snap = this.store.get(id.toString());
        return snap ? OrderAggregate.rehydrate(snap) : null;
    }

    async save(order: OrderAggregate): Promise<void> {
        this.store.set(order.getId().toString(), order.snapshot());
    }
}
