import { DomainError } from "../shared/domain.error";

export class MoneyValueObject {
    private constructor(private readonly cents: number, private readonly currency: string) {}

    static of(cents: number, currency = "USD"): MoneyValueObject {
        const normalizedCurrency = MoneyValueObject.normalizeCurrency(currency);
        MoneyValueObject.assertValidCents(cents);
        return new MoneyValueObject(cents, normalizedCurrency);
    }

    static zero(currency = "USD"): MoneyValueObject {
        return MoneyValueObject.of(0, currency);
    }

    getCurrency(): string {
        return this.currency;
    }

    getCents(): number {
        return this.cents;
    }

    add(other: MoneyValueObject): MoneyValueObject {
        this.assertSameCurrency(other);
        return MoneyValueObject.of(this.cents + other.cents, this.currency);
    }

    subtract(other: MoneyValueObject): MoneyValueObject {
        this.assertSameCurrency(other);
        if (this.cents < other.cents) throw new DomainError("Money cannot be negative");
        return MoneyValueObject.of(this.cents - other.cents, this.currency);
    }

    multiply(mult: number): MoneyValueObject {
        if (!Number.isFinite(mult)) throw new DomainError("Multiplier must be finite");
        if (mult < 0) throw new DomainError("Multiplier cannot be negative");
        return MoneyValueObject.of(Math.round(this.cents * mult), this.currency);
    }

    compareTo(other: MoneyValueObject): -1 | 0 | 1 {
        this.assertSameCurrency(other);
        if (this.cents < other.cents) return -1;
        if (this.cents > other.cents) return 1;
        return 0;
    }

    equals(other: MoneyValueObject): boolean {
        return this.cents === other.cents && this.currency === other.currency;
    }

    isZero(): boolean {
        return this.cents === 0;
    }

    private assertSameCurrency(other: MoneyValueObject) {
        if (this.currency !== other.currency) throw new DomainError(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }

    private static assertValidCents(cents: number) {
        if (!Number.isSafeInteger(cents)) throw new DomainError("Money cents must be a safe integer");
        if (cents < 0) throw new DomainError("Money cannot be negative");
    }

    private static normalizeCurrency(currency: string): string {
        const normalized = currency.trim();
        if (!normalized) throw new DomainError("Currency cannot be empty");
        return normalized;
    }
}
