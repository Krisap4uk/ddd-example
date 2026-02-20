import { CommandHandlerDependencies } from "./handler.dependencies";
import { AddItemCommand } from "../commands/order.commands";
import { AddItemResult } from "../contracts/order.contracts";
import { MoneyValueObject } from "../../domain/value-objects/money.value.object";
import { mustGetOrder } from "./order.loader";

export class AddItemCommandHandler {
    constructor(private readonly deps: Pick<CommandHandlerDependencies, "repo" | "orderItemIdGenerator">) {}

    async execute(command: AddItemCommand): Promise<AddItemResult> {
        const order = await mustGetOrder(this.deps.repo, command.orderId);

        const itemId = order.addItem(
            command.sku,
            MoneyValueObject.of(command.unitPriceCents, order.getCurrency()),
            command.quantity,
            () => this.deps.orderItemIdGenerator.nextOrderItemId(),
        );

        await this.deps.repo.save(order);
        return { itemId: itemId.toString(), events: order.pullDomainEvents() };
    }
}
