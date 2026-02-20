# ddd-ts-simpleshop-entity-with-domain-service (pure TypeScript DDD sample)

В этом варианте есть:

- **Entity + Aggregate Root**: `Order` (id = `OrderId`)
- **Entity внутри агрегата**: `OrderItem` (id = `OrderItemId`)
- **Value Objects**: `Money`, `OrderId`, `OrderItemId`
- **Domain Service**: `DiscountPolicy` (валидирует/разрешает скидочные коды)
- Domain Events
- Repository (in-memory)
- Application Command Handlers + Query Service
- Factory
- Specification
- Второй bounded context (`pricing`) + ACL между контекстами

## Структура bounded context

- `src/ordering/domain/*` - чистая доменная модель (aggregate, entities, value objects, domain services, domain shared)
- `src/ordering/application/*` - orchestration/use-cases, commands, contracts и interfaces
- `src/ordering/infrastructure/*` - адаптеры (in-memory repository, random id generator, ACL)
- `src/pricing/*` - отдельный bounded context для промо-правил
- `src/index.ts` - composition root

## DDD Map

- `docs/ddd/evans-concepts-map.md` - где именно в коде лежат понятия из Evans DDD
- `docs/ddd/context-map.md` - связи bounded contexts

## Запуск

```bash
npm i
npm run dev
```

## Как увидеть bounded context в живом примере

После запуска `npm run dev` в начале вывода будет блок:

```text
[BC DEMO] Same discount, different bounded contexts
[BC DEMO] Pricing language: { couponCode: 'SAVE10', discountRate: 0.1 }
[BC DEMO] Ordering language via ACL: { code: 'SAVE10', percent: 10 }
```

Это показывает границу контекстов:
- `pricing` говорит на языке `couponCode` + `discountRate`
- `ordering` принимает только `code` + `percent`
- перевод делается в ACL (`src/ordering/infrastructure/acl/pricing.discount.policy.acl.ts`)
