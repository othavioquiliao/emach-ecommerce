# Verificação do checkout end-to-end + teste de integração — Design

> Issue: [#17](https://github.com/othavioquiliao/emach-ecommerce/issues/17) — `ready-for-human`.
> Data: 2026-05-18.

## Goal

Verificar o fluxo de checkout do storefront end-to-end após a sincronização de schema, e travar a lógica de criação de pedido com um teste de integração automatizado.

## Contexto

O commit `fix: sincronizar schema Drizzle com a DB real` corrigiu colunas-fantasma que quebravam o `createOrderAction`. A correção foi verificada em nível de coluna, tsc, lint e aceitação dos INSERTs pelo Postgres — mas a jornada real do checkout não foi percorrida, e não há teste que trave a regressão da lógica de negócio.

Estado de teste do repo (apurado na exploração):

- `apps/web` (onde vive `createOrderAction`) **não tem** framework de teste.
- `packages/db` tem `vitest` + scripts `test:supabase:*` + `supabase/config.toml` — um rig de integração meio-montado e nunca exercitado.
- `packages/auth` tem um único teste (`google.test.ts`).

O drift de schema que originou o bug **já está coberto** pelo `bun db:check-drift`. Este teste protege a **lógica de negócio** do checkout (recálculo de preço, débito de estoque, coerência transacional), não o drift.

## Componentes

### 1. Refactor — extrair `placeOrder`

`createOrderAction` (`apps/web/src/app/checkout/_actions/create-order.ts`) hoje mistura plumbing do Next (`safeParse`, `requireCurrentClient`, `getDefaultBranchId`, `headers()`) com a lógica de domínio. Para tornar a lógica testável sem o runtime Next:

- **Criar** `apps/web/src/app/checkout/_lib/place-order.ts` exportando:

  ```ts
  placeOrder(tx, {
    clientId: string;
    branchId: string;
    input: CreateOrderInput;   // já validado pelo action
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<{ orderId: string; orderNumber: string }>
  ```

  `placeOrder` recebe o `tx` (não abre transação própria) e executa, sobre ele: recálculo de preço/promoção, verificação de estoque, `update` do `client`, snapshot de endereço, inserts de `consent_log`, `order`, `order_item`, débito de `stock_level` e insert de `stock_movement`. Em estoque insuficiente, lança erro (a transação reverte).

- **Mover** para `_lib/` os helpers que a lógica usa: `prepareLines`, `checkStock`, `buildAddressSnapshot`, `fetchDiscountPctByToolId`, `centsFromString`, `formatOrderNumber`, e os tipos `CreateOrderInput`/`PreparedLine`/`AddressSnapshot`. As leituras passam a usar o `tx` recebido (hoje `prepareLines`/`checkStock` usam o singleton `db`).

- **`createOrderAction` vira wrapper fino**: `safeParse` do input → `requireCurrentClient` → `getDefaultBranchId` → ler `headers()` → `db.transaction((tx) => placeOrder(tx, …))` → mapear para `ActionResult<{ orderId; orderNumber }>`. Nenhuma lógica de domínio permanece no action.

Refactor puro: comportamento observável idêntico. Único efeito colateral aceito — `prepareLines`/`checkStock` passam a rodar dentro da transação (snapshot mais consistente).

### 2. Infraestrutura de teste — vitest em `apps/web`

- Adicionar `vitest` como devDependency de `apps/web`.
- Adicionar `apps/web/vitest.config.ts` mínimo (ambiente `node`; `place-order.ts` é TS puro — sem React, sem `next/*`, então não precisa de plugins do Next).
- Adicionar script `"test": "vitest run"` ao `apps/web/package.json`.
- Helper `withRollback(fn)`: abre `db.transaction`, executa `fn(tx)`, e força ROLLBACK ao final lançando um erro sentinela que é capturado e descartado. Garante zero resíduo no banco.

### 3. Teste de integração — `_lib/place-order.test.ts`

Roda contra o DB Supabase de dev (via `DATABASE_URL`), cada caso dentro de uma transação revertida por `withRollback`.

**Caso feliz:** semeia, dentro da transação, um `client`, um `branch`, um `tool` + `toolVariant` (com `priceAmount`) + `stockLevel` (com `quantity` suficiente). Monta um `CreateOrderInput` válido. Chama `placeOrder(tx, …)`. Asserts:

- `order` criado com `status = 'pending_payment'`, `subtotalAmount`/`totalAmount` corretos.
- `orderItem` com `toolId`/`variantId`/`sku`/`unitPrice`/`quantity`/`lineTotal` coerentes (snapshot).
- `stockLevel.quantity` decrementado pela quantidade comprada.
- `stockMovement` com `reason = 'saida_venda'`, `actorType = 'system'`, `delta` negativo, `orderId`/`orderItemId` preenchidos.
- 3 linhas em `consentLog` (`tos`, `privacy`, `marketing_email`) para o `clientId`.

**Caso de borda — estoque insuficiente:** semeia `stockLevel.quantity` abaixo do pedido; `placeOrder` lança; nenhum `order`/`stockMovement` permanece (a transação reverteria de qualquer forma; o teste verifica que o erro é lançado).

### 4. Smoke manual (uma vez)

Subir `bun dev:web` e percorrer no browser: login como cliente → adicionar variante ao cart → checkout → confirmar redirect para `/pedidos/[number]` e o render da página sem erro. Executável via `agent-browser` ou manualmente pelo usuário.

Cobre o que o teste de integração não cobre: o wrapper Next (`createOrderAction`) e o **render do server component** `/pedidos/[number]` (critério 3). Deixa um pedido real no dev DB — aceitável, é ambiente de dev.

## Cobertura dos acceptance criteria

| Critério | Coberto por |
|---|---|
| #1 — pedido real criado | Teste de integração (caso feliz) + smoke manual |
| #2 — `order`/`order_item`/`stock_movement`/`consent_log` coerentes na mesma transação | Asserts do teste de integração |
| #3 — `/pedidos/[number]` renderiza sem erro | Smoke manual |
| #4 — decisão de cobertura registrada | Este spec; cobertura escolhida = teste de integração automatizado, que passa a existir e rodar via `bun --cwd apps/web test` |

## Caveat conhecido

`order_number_seq` é uma sequência Postgres — `nextval` **não** reverte no ROLLBACK. Cada execução do teste consome um número de pedido, deixando gaps na numeração. Gaps são inofensivos (números de pedido não precisam ser contíguos).

## Fora de escopo

- CI para rodar o teste automaticamente (não há CI no repo — ver CLAUDE.md §9).
- Teste do rig `test:supabase` de `packages/db` (Supabase local) — preterido em favor de transação revertida no dev DB.
- Cobertura de UI do cart/checkout além do smoke manual.
