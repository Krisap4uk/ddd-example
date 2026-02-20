export type CreateOrderCommand = {
    currency?: string;
};

export type AddItemCommand = {
    orderId: string;
    sku: string;
    unitPriceCents: number;
    quantity: number;
};

export type ChangeItemQuantityCommand = {
    orderId: string;
    itemId: string;
    to: number;
};

export type RemoveItemCommand = {
    orderId: string;
    itemId: string;
};

export type ApplyDiscountCommand = {
    orderId: string;
    code: string;
};

export type ConfirmOrderCommand = {
    orderId: string;
};
