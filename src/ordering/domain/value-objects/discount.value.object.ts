import { DomainError } from "../shared/domain.error";

export type DiscountPrimitive = {
    code: string;
    percent: number;
};

export class DiscountValueObject {
    private constructor(private readonly code: string, private readonly percent: number) {}

    static of(code: string, percent: number): DiscountValueObject {
        const normalizedCode = code.trim().toUpperCase();
        if (!normalizedCode) {
            throw new DomainError("Discount code cannot be empty");
        }
        if (!Number.isFinite(percent)) {
            throw new DomainError("Discount percent must be finite");
        }
        if (percent <= 0 || percent > 100) {
            throw new DomainError("Discount percent must be > 0 and <= 100");
        }
        return new DiscountValueObject(normalizedCode, percent);
    }

    getCode(): string {
        return this.code;
    }

    getPercent(): number {
        return this.percent;
    }

    toPrimitives(): DiscountPrimitive {
        return {
            code: this.code,
            percent: this.percent,
        };
    }
}
