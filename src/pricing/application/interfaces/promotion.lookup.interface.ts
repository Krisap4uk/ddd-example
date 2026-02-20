export type PricingPromotion = {
    couponCode: string;
    discountRate: number;
};

export interface PromotionLookupInterface {
    findPromotionByCoupon(code: string): PricingPromotion | null;
}
