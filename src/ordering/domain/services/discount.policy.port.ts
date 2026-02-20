export interface DiscountPolicyPort {
    resolve(code: string): { code: string; percent: number };
}
