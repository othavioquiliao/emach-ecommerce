# packages/db — Convenções

Drizzle 0.45 + node-postgres + Supabase Postgres. Schema TS aqui é **cópia versionada** do `emach-dashboard` — sync via CI PR automático (ADR-0009). Regras gerais na raiz.

## Schema sync (ADR-0009)

- **Mudanças de schema começam no dashboard.** Workflow `sync-db-schema.yml` no dashboard abre PR aqui quando `packages/db/src/{schema,queries,sql/triggers.sql}` muda na `main` do dashboard.
- **Não editar `schema/*.ts` em isolamento.** Toda mudança vem por PR de sync.
- **`db:generate` / `db:migrate` são legacy** — scripts ainda no `package.json` mas não usar. Pasta `migrations/` foi removida.
- **Pós-merge do PR sync (ou pós-`db:push` em dev local):** rodar `bun db:apply-triggers`.

**Drop & recreate em dev** (renames ambíguos sem TTY): `DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres, public;` via pg client → `bunx drizzle-kit push && bun db:apply-triggers && bun db:seed-categories && bun db:seed-attributes`. Só em dev.

## Triggers PL/pgSQL

`src/sql/triggers.sql` (owned-by-dashboard, cópia aqui) tem 4 triggers que Drizzle Kit **não consegue gerar**: anti-ciclo de categoria + `path`/`depth` materializados, cascade de path, `client.last_seen`, derivação de `client.type`. Aplicar:

```bash
bun db:apply-triggers   # idempotente (CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS)
```

Idempotência de débito de venda em `stockMovement` **não** é trigger — é partial unique index no schema. RLS é gerenciada direto no Supabase (sem `_rls.sql`): catálogo público (SELECT anon+authenticated), demais tabelas deny-all (server-side via service role / Better Auth).

## Convenções de schema

- ID: `text("id").primaryKey()`, preencher com `crypto.randomUUID()` no caller.
- FK: explicitar `onDelete: "cascade" | "restrict" | "set null"`. Default = `restrict` por integridade.
- Money: `numeric(10, 2)` preço/custo produto; `numeric(12, 2)` totais pedido. **Nunca `real`/`double`**.
- Auditoria: `actorType pgEnum('actor_type', ['user','system'])` + `actorId` (FK user). CHECK `actor_coherence` garante coerência.
- "No máximo 1 marcado": `uniqueIndex(...).on(parentId).where(sql\`${isDefault} = true\`)` — ex `tool_variant.isDefault` (1 default por tool).

## Ownership de tabelas

- **Owned-by-dashboard** (autoritativo, mudanças via PR no dashboard): `tool`, `toolVariant`, `category`, `supplier`, `branch`, `stockLevel`, `userBranch`, `promotion`, `attribute*`, schema `auth`.
- **Owned-by-ecommerce**: tabelas `client*` (5).
- **Escrita compartilhada**: `order`, `orderItem`, `stockMovement`, `review`, `consentLog`, `toolAttributeValue`.

Em `stockMovement` deste repo: **`actorType='system'`** (nunca `'user'` — `user` é staff).

## Exports

`src/schema/index.ts` é barrel intencional (`// biome-ignore lint/performance/noBarrelFile`). Import preferido em consumidores: `import { category } from "@emach/db/schema/categories"` — barrel é fallback.

## `db` × `createDb()`

- `db` (singleton em `src/index.ts`) — uso geral em server actions.
- `createDb()` (factory) — `@emach/auth/*` pra evitar ciclo de import com `@emach/env`. **Não consolidar.**
- `apps/web` nunca importa `@emach/db` diretamente em rota autenticada — acesso é mediado por `@emach/auth`.

## Atenção pós-refactor de variants

`stock_level`, `stock_movement`, `order_item` referenciam **`tool_variant.id`** (não mais `tool.id`). Enviar `variantId` em pedidos e movimentos. `tool_variant` traz SKU vendável; `tool` é produto-pai.

## Queries owned-by-dashboard

`packages/db/src/queries/*.ts` é ferramenta de leitura/regra de negócio consumida aqui (`reviews.ts`, `catalog.ts`).

**Regra:** dashboard é fonte de verdade. Sync via CI. **Não editar em isolamento aqui** — mudanças de regra começam no dashboard.

Padrão de assinatura: `db: NodePgDatabase<Record<string, unknown>>` parametrizado (não singleton), `export type`, sem `select *` em projeções (esconder `costAmount` em endpoints públicos).

## Storage de imagens

Bucket público `tool-images`. `tool_image.url` armazena URL pública absoluta completa — `<Image src={toolImage.url} />` direto. Upload feito pelo dashboard. Whitelist Supabase host em `apps/web/next.config.ts > images.remotePatterns`.

## Scripts úteis

```bash
bun db:apply-triggers         # idempotente, pós-sync
bun db:seed-categories        # bootstrap 5 categorias raiz idempotente
bun db:seed-attributes        # attribute_definitions iniciais por categoria raiz
bun db:anonymize-client <id>  # LGPD direito ao esquecimento
bun db:check-drift            # verifica drift schema Drizzle × DB
```

## Testes

Vitest configurado mas **suite vazia** (diretório `test/` não existe). Quando entrarem: viver em `packages/db/test/`. Boot Supabase local: `bun test:supabase:start/stop` (precisa Docker).
