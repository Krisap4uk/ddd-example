import { PromotionLookupInterface } from "../application/interfaces/promotion.lookup.interface";
import { Promotion } from "../domain/models/promotion";
import { PromotionCatalogService } from "../domain/services/promotion.catalog.service";

export class InMemoryPromotionLookup implements PromotionLookupInterface {
    constructor(private readonly catalog: PromotionCatalogService = new PromotionCatalogService()) {}

    findPromotionByCoupon(code: string): Promotion | null {
        return this.catalog.resolveCoupon(code);
    }
}
