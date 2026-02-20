import { DomainEvent } from "../../domain/shared/domain.event";
import { ApplyDiscountCommand } from "../commands/order.commands";
import { CommandHandlerDependencies } from "./handler.dependencies";
import { mustGetOrder } from "./order.loader";

export class ApplyDiscountCommandHandler {
    constructor(private readonly deps: Pick<CommandHandlerDependencies, "repo" | "discountPolicy">) {}

    async execute(command: ApplyDiscountCommand): Promise<DomainEvent[]> {
        const order = await mustGetOrder(this.deps.repo, command.orderId);
        order.applyDiscount(command.code, this.deps.discountPolicy);
        await this.deps.repo.save(order);
        return order.pullDomainEvents();
    }
}
