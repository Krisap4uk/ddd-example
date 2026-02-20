import { CommandHandlerDependencies } from "./handler.dependencies";
import { CreateOrderCommand } from "../commands/order.commands";
import { CreateOrderResult } from "../contracts/order.contracts";

export class CreateOrderCommandHandler {
    constructor(private readonly deps: Pick<CommandHandlerDependencies, "repo" | "orderFactory" | "orderIdGenerator">) {}

    async execute(command: CreateOrderCommand = {}): Promise<CreateOrderResult> {
        const order = this.deps.orderFactory.createDraft(this.deps.orderIdGenerator.nextOrderId(), command.currency ?? "USD");
        await this.deps.repo.save(order);
        return { orderId: order.getId().toString(), events: order.pullDomainEvents() };
    }
}
