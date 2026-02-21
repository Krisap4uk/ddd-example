import { Promotion } from "../../domain/models/promotion";

export interface PromotionLookupInterface {
    findPromotionByCoupon(code: string): Promotion | null;
}
