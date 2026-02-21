# Evans DDD Concepts Map (for this template)

Ниже карта понятий из DDD Eric Evans и где они отражены в шаблоне.

## Tactical design

- Ubiquitous Language
  - Доменные термины: `Order`, `OrderItem`, `Discount`, `Promotion`, `Confirm`, `Coupon`.
  - См. `src/ordering/domain/*`, `src/pricing/domain/*`.

- Entity
  - `OrderItemEntity`: `src/ordering/domain/entities/order.item.entity.ts`

- Value Object
  - `MoneyValueObject`, `OrderIdValueObject`, `OrderItemIdValueObject`, `DiscountValueObject`:
    `src/ordering/domain/value-objects/*`

- Aggregate / Aggregate Root
  - `OrderAggregate`: `src/ordering/domain/aggregates/order.aggregate.ts`

- Domain Service
  - `DiscountPolicyPort` + реализации:
    - прямой вариант: `src/ordering/domain/services/discount.policy.service.ts`
    - через ACL: `src/ordering/infrastructure/acl/pricing.discount.policy.acl.ts`
  - `PromotionCatalogService`: `src/pricing/domain/services/promotion.catalog.service.ts`

- Repository
  - `OrderRepositoryInterface`: `src/ordering/domain/repositories/order.repository.interface.ts`
  - `InMemoryOrderRepository`: `src/ordering/infrastructure/in.memory.order.repository.ts`

- Factory
  - `OrderFactoryInterface`: `src/ordering/domain/factories/order.factory.interface.ts`
  - `DefaultOrderFactory`: `src/ordering/domain/factories/default.order.factory.ts`

- Specification
  - `OrderConfirmationSpecification`: `src/ordering/domain/specifications/order.confirmation.specification.interface.ts`
  - `DefaultOrderConfirmationSpecification`: `src/ordering/domain/specifications/default.order.confirmation.specification.ts`

- Domain Event
  - События: `src/ordering/domain/events/events.ts`
  - База aggregate/event: `src/ordering/domain/shared/domain.event.ts`

- Application Layer
  - Command handlers: `src/ordering/application/handlers/*`
  - Query service: `src/ordering/application/queries/order.query.service.ts`

- Module
  - Модули по bounded context и слоям:
    - `src/ordering/*`
    - `src/pricing/*`

## Strategic design

- Bounded Context
  - `ordering` context: оформление заказа и инварианты подтверждения.
  - `pricing` context: каталог промо-правил по coupon.
  - Domain model `Promotion`: `src/pricing/domain/models/promotion.ts`

- Context Map
  - Документ: `docs/ddd/context-map.md`

- Anti-Corruption Layer (ACL)
  - `PricingDiscountPolicyAcl`: `src/ordering/infrastructure/acl/pricing.discount.policy.acl.ts`
  - Переводит язык `pricing` (`discountRate`) в язык `ordering` (`percent`).

## Что сознательно упрощено

- Нет persistence-модели БД, только in-memory адаптеры.
- Нет distributed integration/events bus.
- Нет отдельных командных/читающих моделей (CQRS) — это уже расширение, не обязательный минимум.
