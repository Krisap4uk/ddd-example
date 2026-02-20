import { OrderAggregate } from "../aggregates/order.aggregate";

export interface OrderConfirmationSpecification {
    assertSatisfiedBy(order: OrderAggregate): void;
}
