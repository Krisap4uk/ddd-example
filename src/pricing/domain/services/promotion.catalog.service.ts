import { Promotion } from "../models/promotion";

export class PromotionCatalogService {
    private readonly known: Record<string, number> = {
        SAVE10: 0.1,
        VIP20: 0.2,
    };

    resolveCoupon(code: string): Promotion | null {
        const normalized = code.trim().toUpperCase();
        if (!normalized) {
            return null;
        }

        const discountRate = this.known[normalized];
        if (!discountRate) {
            return null;
        }

        return { couponCode: normalized, discountRate };
    }
}
