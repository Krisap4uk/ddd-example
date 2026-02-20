import { OrderAggregate } from "../../domain/aggregates/order.aggregate";
import { OrderRepositoryInterface } from "../../domain/repositories/order.repository.interface";
import { OrderIdValueObject } from "../../domain/value-objects/order.id.value.object";
import { NotFoundError } from "../errors";

export async function mustGetOrder(repo: OrderRepositoryInterface, orderId: string): Promise<OrderAggregate> {
    const id = OrderIdValueObject.from(orderId);
    const order = await repo.getById(id);

    if (!order) {
        throw new NotFoundError(`Order not found: ${id.toString()}`);
    }

    return order;
}
