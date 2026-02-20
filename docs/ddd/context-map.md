# Context Map

## Bounded contexts

1. Ordering
- Ответственность: жизненный цикл заказа, инварианты агрегата, подтверждение.
- Владелец языка: `Order`, `OrderItem`, `DiscountPercent`.

2. Pricing
- Ответственность: промо-коды и скидочные правила.
- Владелец языка: `Coupon`, `Promotion`, `DiscountRate`.

## Relationship

- `ordering` потребляет данные `pricing` через ACL.
- Тип отношения: Customer-Supplier с Anti-Corruption Layer.

## ACL translation

- Input from pricing: `{ couponCode, discountRate }`
- Internal ordering model: `{ code, percent }`
