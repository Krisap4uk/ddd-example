import { PromotionLookupInterface, PricingPromotion } from "../application/interfaces/promotion.lookup.interface";
import { PromotionCatalogService } from "../domain/services/promotion.catalog.service";

export class InMemoryPromotionLookup implements PromotionLookupInterface {
    constructor(private readonly catalog: PromotionCatalogService = new PromotionCatalogService()) {}

    findPromotionByCoupon(code: string): PricingPromotion | null {
        return this.catalog.resolveCoupon(code);
    }
}
