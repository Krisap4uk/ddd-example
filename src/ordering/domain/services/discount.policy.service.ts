import { DomainError } from "../shared/domain.error";
import { DiscountPolicyPort } from "./discount.policy.port";

/**
 * DiscountPolicy — Domain Service:
 * - не имеет собственного id
 * - не хранит состояние заказа
 * - инкапсулирует доменное правило расчёта/валидации скидки по коду
 */
export class DiscountPolicyService implements DiscountPolicyPort {
    private readonly known: Record<string, number> = {
        SAVE10: 10,
        VIP20: 20,
    };

    resolve(code: string): { code: string; percent: number } {
        const normalized = code.trim().toUpperCase();
        if (!normalized) throw new DomainError("Discount code cannot be empty");

        const percent = this.known[normalized];
        if (!percent) throw new DomainError("Unknown discount code");

        return {code: normalized, percent};
    }
}
