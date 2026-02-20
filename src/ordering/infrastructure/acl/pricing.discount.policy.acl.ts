import { DomainError } from "../../domain/shared/domain.error";
import { DiscountPolicyPort } from "../../domain/services/discount.policy.port";
import { PromotionLookupInterface } from "../../../pricing/application/interfaces/promotion.lookup.interface";

export class PricingDiscountPolicyAcl implements DiscountPolicyPort {
    constructor(private readonly promotionLookup: PromotionLookupInterface) {}

    resolve(code: string): { code: string; percent: number } {
        const promotion = this.promotionLookup.findPromotionByCoupon(code);
        if (!promotion) {
            throw new DomainError("Unknown discount code");
        }

        return {
            code: promotion.couponCode,
            percent: Math.round(promotion.discountRate * 100),
        };
    }
}
