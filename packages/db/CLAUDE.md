# packages/db — Convenções

Drizzle 0.45 + node-postgres + Supabase Postgres. Regras gerais ver `.claude/CLAUDE.md`.

## Migrations

- **Dev:** `bun db:push` (sync schema → DB sem migration). Livre em branch local. `--force` só em dev quando rename ambíguo.
- **Staging/Prod:** `bun db:generate` (SQL versionado em `src/migrations/`) → revisar SQL → `bun db:migrate`.
- **Nunca** `--force` fora de dev.
- Aditivas preferidas. Drops: PR explícito + avisar app ecomerce (DB compartilhada — ver `docs/integration/admin-ecommerce.md`).

## Triggers PL/pgSQL

`src/migrations/_triggers.sql` tem triggers que Drizzle Kit **não gera** (anti-ciclo categoria com path/depth materializados, idempotência débito venda em stock_movement). Após qualquer `bun db:push` dev ou `bun db:migrate` prod:

```bash
bun db:apply-triggers   # idempotente (CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS)
```

## Convenções de schema

- ID: `text("id").primaryKey()` — preencher com `crypto.randomUUID()` no caller (server actions/scripts).
- Timestamps: `timestamp("created_at").defaultNow().notNull()`. Soft delete: `deleted_at timestamp` quando aplicável.
- Enums: `pgEnum`, derivar tipo. Ex: `export const userRoleEnum = pgEnum("user_role", ["admin","manager","user"]); export type UserRole = (typeof userRoleEnum.enumValues)[number]`.
- FK: explicitar `onDelete: "cascade" | "restrict" | "set null"`. Default = restrict pra integridade.
- `unique()` em colunas busca natural (sku, barcode, slug, document).
- Money: `numeric(10, 2)` preço/custo produto (`tool_variant.priceAmount`, `costAmount`); `numeric(12, 2)` totais pedido (`order.totalAmount`). Nunca `real`/`double`.
- Listas pequenas: `text[]` (Postgres array, GIN-friendly) ou tabela própria se ≥ entidade.
- JSONB schema livre: `jsonb("col").$type<MyShape>()` + parser cuidadoso ao ler. Ex: `attribute_definition.options`.
- Auditoria: tabelas movimento incluem `actorType pgEnum('actor_type', ['user','apiKey','system'])` + `actorId` (FK user) + `apiKeyId` (FK apiKey). CHECK garante coerência (`actor_coherence`).
- Partial unique index pra "no máximo 1 marcado": ex `tool_variant.isDefault` usa `uniqueIndex(...).on(toolId).where(sql\`${isDefault} = true\`)` pra 1 default por tool.

## Exports

`src/schema/index.ts` é **barrel intencional** (marcado `// biome-ignore lint/performance/noBarrelFile`). Re-exporta schemas como API pública pra `@emach/db/schema`. Sincronizar ao criar arquivos novos.

Import preferido em consumidores: `import { category } from "@emach/db/schema/categories"` (caminho específico) — barrel é fallback.

## `db` × `createDb()`

- `db` (singleton em `src/index.ts`) — uso geral server actions.
- `createDb()` (factory) — usado por `@emach/auth/*` pra evitar ciclo import com `@emach/env`. **Não** consolidar em padrão único.

## Scripts

```bash
bun db:push                # dev: sync schema → DB
bun db:generate            # gera nova migration versionada
bun db:migrate             # aplica migrations pendentes
bun db:studio              # UI inspetora

bun db:apply-triggers      # aplica src/migrations/_triggers.sql
bun db:seed-categories     # bootstrap 5 categorias raiz idempotente
bun db:seed-attributes     # attribute_definitions iniciais (RPM, mandril, percussão, etc) por categoria raiz
bun db:anonymize-client <id>  # LGPD direito ao esquecimento
```

**Drop & recreate em dev** (quando renames ambíguos quebram drizzle-kit push em ambiente sem TTY):

```ts
// snippet via pg client direto
await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres, public;");
// depois: bunx drizzle-kit push && bun db:apply-triggers && bun db:seed-categories && bun db:seed-attributes
```

⚠️ Só dev. Staging/prod sempre via migration versionada.

## Schema compartilhado com app ecomerce

Site ecomerce escreve em `order`, `orderItem`, `stockMovement`, `client*`, `review`, `lead`. Cópia versionada do schema sincronizada manual a cada migration. Ver `docs/integration/admin-ecommerce.md` pro contrato completo. Mudanças nessas tabelas exigem coordenação.

**Atenção pós-refactor variants:** `stock_level`, `stock_movement` e `order_item` agora referenciam `tool_variant.id` (não mais `tool.id`). App ecomerce precisa enviar `variantId` em pedidos e movimentos, não `toolId`. Ler `tool_variant` pro SKU vendável; `tool` é produto-pai (info comum).

## Testes (futuro)

Suíte vitest em `test/` virá na Fase F (requer Supabase local CLI + Docker). Hoje cobertura única é `apps/web/__tests__/permissions.test.ts` (puro unit, sem DB).