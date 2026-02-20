import { DomainEvent } from "../../domain/shared/domain.event";

export type DiscountView = { code: string; percent: number } | null;

export type SummaryItemView = {
    itemId: string;
    sku: string;
    qty: number;
    unitPrice: string;
    lineTotal: string;
};

export type CreateOrderResult = {
    orderId: string;
    events: DomainEvent[];
};

export type AddItemResult = {
    itemId: string;
    events: DomainEvent[];
};

export type GetSummaryResult = {
    status: string;
    total: string;
    items: SummaryItemView[];
    discount: DiscountView;
};
