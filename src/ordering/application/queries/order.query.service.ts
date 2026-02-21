import { OrderRepositoryInterface } from "../../domain/repositories/order.repository.interface";
import { GetSummaryResult } from "../contracts/order.contracts";
import { mustGetOrder } from "../handlers/order.loader";

export class OrderQueryService {
    constructor(private readonly repo: OrderRepositoryInterface) {}

    async getSummary(orderId: string): Promise<GetSummaryResult> {
        const order = await mustGetOrder(this.repo, orderId);
        const total = order.total();

        return {
            status: order.getStatus(),
            total: formatMoney(total.getCents(), total.getCurrency()),
            items: order.listItems().map((i) => ({
                itemId: i.id,
                sku: i.sku,
                quantity: i.quantity,
                unitPrice: formatMoney(i.unitPriceCents, i.currency),
                lineTotal: formatMoney(i.unitPriceCents * i.quantity, i.currency),
            })),
            discount: order.getDiscount(),
        };
    }
}

function formatMoney(cents: number, currency: string): string {
    const major = Math.floor(cents / 100);
    const minor = Math.abs(cents) % 100;
    return `${major}.${minor.toString().padStart(2, "0")} ${currency}`;
}
