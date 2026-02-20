import { DomainEvent } from "../../domain/shared/domain.event";
import { RemoveItemCommand } from "../commands/order.commands";
import { CommandHandlerDependencies } from "./handler.dependencies";
import { mustGetOrder } from "./order.loader";

export class RemoveItemCommandHandler {
    constructor(private readonly deps: Pick<CommandHandlerDependencies, "repo">) {}

    async execute(command: RemoveItemCommand): Promise<DomainEvent[]> {
        const order = await mustGetOrder(this.deps.repo, command.orderId);
        order.removeItem(command.itemId);
        await this.deps.repo.save(order);
        return order.pullDomainEvents();
    }
}
