import { DomainError } from "../shared/domain.error";
import { OrderAggregate } from "../aggregates/order.aggregate";
import { OrderConfirmationSpecification } from "./order.confirmation.specification.interface";

export class DefaultOrderConfirmationSpecification implements OrderConfirmationSpecification {
    assertSatisfiedBy(order: OrderAggregate): void {
        if (order.listItems().length === 0) {
            throw new DomainError("Cannot confirm an empty order");
        }

        if (order.total().isZero()) {
            throw new DomainError("Order total must be > 0 to confirm");
        }
    }
}
