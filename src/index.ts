import { DomainEvent } from "./ordering/domain/shared/domain.event";
import { InMemoryOrderRepository } from "./ordering/infrastructure/in.memory.order.repository";
import { RandomIdGenerator } from "./ordering/infrastructure/random.id.generator";
import { PricingDiscountPolicyAcl } from "./ordering/infrastructure/acl/pricing.discount.policy.acl";
import { DefaultOrderFactory } from "./ordering/domain/factories/default.order.factory";
import { DefaultOrderConfirmationSpecification } from "./ordering/domain/specifications/default.order.confirmation.specification";
import { InMemoryPromotionLookup } from "./pricing/infrastructure/in.memory.promotion.lookup";
import { CreateOrderCommandHandler } from "./ordering/application/handlers/create-order.command.handler";
import { AddItemCommandHandler } from "./ordering/application/handlers/add-item.command.handler";
import { ChangeItemQuantityCommandHandler } from "./ordering/application/handlers/change-item-quantity.command.handler";
import { ApplyDiscountCommandHandler } from "./ordering/application/handlers/apply-discount.command.handler";
import { ConfirmOrderCommandHandler } from "./ordering/application/handlers/confirm-order.command.handler";
import { OrderQueryService } from "./ordering/application/queries/order.query.service";
import { PromotionLookupInterface } from "./pricing/application/interfaces/promotion.lookup.interface";
import { DiscountPolicyPort } from "./ordering/domain/services/discount.policy.port";

function printEvents(events: DomainEvent[]): void {
    for (const e of events) {
        console.log(`[EVENT] ${e.type}`, e.payload);
    }
}

function printBoundedContextDemo(
    promotionLookup: PromotionLookupInterface,
    discountPolicy: DiscountPolicyPort,
): void {
    const code = "save10";
    const promotion = promotionLookup.findPromotionByCoupon(code);

    if (!promotion) {
        console.log("[BC DEMO] Pricing context cannot resolve coupon:", code);
        return;
    }

    const orderingDiscount = discountPolicy.resolve(code);

    console.log("\n[BC DEMO] Same discount, different bounded contexts");
    console.log("[BC DEMO] Pricing language:", promotion);
    console.log("[BC DEMO] Ordering language via ACL:", orderingDiscount);
    console.log("[BC DEMO] Ordering does not use discountRate directly\n");
}

async function main(): Promise<void> {
    const repo = new InMemoryOrderRepository();
    const idGenerator = new RandomIdGenerator();

    const promotionLookup = new InMemoryPromotionLookup();
    const discountPolicy = new PricingDiscountPolicyAcl(promotionLookup);
    printBoundedContextDemo(promotionLookup, discountPolicy);

    const orderFactory = new DefaultOrderFactory();
    const orderConfirmationSpecification = new DefaultOrderConfirmationSpecification();

    const createOrder = new CreateOrderCommandHandler({ repo, orderFactory, orderIdGenerator: idGenerator });
    const addItem = new AddItemCommandHandler({ repo, orderItemIdGenerator: idGenerator });
    const changeItemQuantity = new ChangeItemQuantityCommandHandler({ repo });
    const applyDiscount = new ApplyDiscountCommandHandler({ repo, discountPolicy });
    const confirmOrder = new ConfirmOrderCommandHandler({ repo, orderConfirmationSpecification });

    const queries = new OrderQueryService(repo);

    const created = await createOrder.execute({ currency: "USD" });
    console.log("Created order:", created.orderId);
    printEvents(created.events);

    const a1 = await addItem.execute({ orderId: created.orderId, sku: "SKU-TSHIRT", unitPriceCents: 2599, quantity: 2 });
    console.log("Added itemId:", a1.itemId);
    printEvents(a1.events);

    const a2 = await addItem.execute({ orderId: created.orderId, sku: "SKU-MUG", unitPriceCents: 1299, quantity: 1 });
    console.log("Added itemId:", a2.itemId);
    printEvents(a2.events);

    printEvents(await applyDiscount.execute({ orderId: created.orderId, code: "SAVE10" }));
    printEvents(await changeItemQuantity.execute({ orderId: created.orderId, itemId: a2.itemId, to: 3 }));

    console.log("Summary:", await queries.getSummary(created.orderId));

    printEvents(await confirmOrder.execute({ orderId: created.orderId }));
    console.log("Final summary:", await queries.getSummary(created.orderId));
}

main().catch((err: unknown) => {
    if (err instanceof Error) {
        console.error("ERROR:", err.name, err.message);
    } else {
        console.error("ERROR:", err);
    }
    process.exitCode = 1;
});
