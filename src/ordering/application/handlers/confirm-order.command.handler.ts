import { DomainEvent } from "../../domain/shared/domain.event";
import { ConfirmOrderCommand } from "../commands/order.commands";
import { CommandHandlerDependencies } from "./handler.dependencies";
import { mustGetOrder } from "./order.loader";

export class ConfirmOrderCommandHandler {
    constructor(private readonly deps: Pick<CommandHandlerDependencies, "repo" | "orderConfirmationSpecification">) {}

    async execute(command: ConfirmOrderCommand): Promise<DomainEvent[]> {
        const order = await mustGetOrder(this.deps.repo, command.orderId);
        order.confirm(this.deps.orderConfirmationSpecification);
        await this.deps.repo.save(order);
        return order.pullDomainEvents();
    }
}
