export interface DomainEvent {
    readonly type: string;
    readonly occurredAt: Date;
    readonly payload: Record<string, unknown>;
}

export abstract class AggregateRoot {
    private readonly pendingEvents: DomainEvent[] = [];

    pullDomainEvents(): DomainEvent[] {
        return this.pendingEvents.splice(0, this.pendingEvents.length);
    }

    protected record(event: DomainEvent): void {
        this.pendingEvents.push(event);
    }
}
