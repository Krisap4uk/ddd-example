import { DomainEvent } from "../../domain/shared/domain.event";
import { ChangeItemQuantityCommand } from "../commands/order.commands";
import { CommandHandlerDependencies } from "./handler.dependencies";
import { mustGetOrder } from "./order.loader";

export class ChangeItemQuantityCommandHandler {
    constructor(private readonly deps: Pick<CommandHandlerDependencies, "repo">) {}

    async execute(command: ChangeItemQuantityCommand): Promise<DomainEvent[]> {
        const order = await mustGetOrder(this.deps.repo, command.orderId);
        order.changeItemQuantity(command.itemId, command.to);
        await this.deps.repo.save(order);
        return order.pullDomainEvents();
    }
}
