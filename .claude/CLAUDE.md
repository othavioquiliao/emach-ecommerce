# emach-ecommerce — Guia do Projeto para Agentes

> Este arquivo é o mapa completo do projeto. Leia antes de qualquer tarefa.
> **Responda sempre em Português.** Termos técnicos e identificadores de código ficam em English.
>
> **Repo irmão:** `~/noctua/emach-dashboard` (admin staff) compartilha a **mesma DB Supabase** e parte do schema Drizzle. Quando algo aqui depender de tabelas owned-by-dashboard (`tool`, `category`, `promotion`, etc.), a fonte de verdade é o dashboard. Ver §3 (Ownership) e `docs/auth/ecommerce-integration.md`.

---

## 1. Visão Geral

**EMACH** é um e-commerce de **ferramentas elétricas e manuais** (furadeiras, serras, chaves, alicates, etc.) para o mercado brasileiro. Scaffoldado com [Better-T-Stack](https://better-t-stack.dev/).

| | |
|---|---|
| **Produto** | Ferramentas elétricas + manuais |
| **Marca** | EMACH |
| **Moeda** | R$ (Real brasileiro) — formato `R$ 899,00` |
| **Mercado** | Brasil (pt-BR) |
| **Personalidade** | Precisa, Robusta, Profissional |
| **Package manager** | Bun 1.3.11 |
| **Orquestração** | Turborepo 2 |
| **Frontend** | Next.js 16 + React 19 (App Router) |
| **Banco de dados** | PostgreSQL via Supabase (compartilhado com dashboard) |
| **ORM** | Drizzle 0.45 |
| **Auth** | Better Auth (instância `ecommerce`) |
| **UI** | shadcn (style `base-lyra`, baseado em Base UI — não Radix) |
| **CSS** | Tailwind CSS v4 |
| **Linting/Format** | Biome via Ultracite |
| **Forms** | TanStack Form + Zod |
| **Design** | Ferrari-inspired (chiaroscuro, Barlow, `#DA291C`) |
| **Design Tool** | Pencil MCP (`~/Work/pencil/emach-ecommerce.pen`) |

IDs em server actions/scripts: **`crypto.randomUUID()`** (sem nanoid).

---

## 2. Estrutura do Monorepo

```
emach-ecommerce/
├── apps/
│   └── web/                  ← App Next.js 16, porta 3001
└── packages/
    ├── config/               ← tsconfig.base.json compartilhado
    ├── env/                  ← Validação de env vars (T3 Env + Zod)
    ├── db/                   ← Drizzle ORM + schema PostgreSQL (cópia versionada do dashboard)
    ├── auth/                 ← Better Auth (instância dashboard + ecommerce)
    ├── email/                ← Resend client + React Email templates
    └── ui/                   ← Biblioteca shadcn compartilhada
```

---

## 3. Packages — O que cada um faz

### `@emach/config` — TypeScript Base
- **Propósito:** Contém apenas `tsconfig.base.json` com strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`.
- **Exports:** Nenhum em runtime. Só `@emach/config/tsconfig.base.json` via `extends`.
- **Quando modificar:** Quase nunca. Somente para mudar regras TS globais.

---

### `@emach/env` — Variáveis de Ambiente Tipadas
- **Propósito:** Valida env vars em build time com Zod. Se uma var estiver faltando, o build falha com mensagem clara.
- **Exports:**
  - `@emach/env/server` → `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_URL_ECOMMERCE`, `CORS_ORIGIN`, `ECOMMERCE_ORIGIN`, `RESEND_API_KEY`, `EMAIL_FROM`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_ENV`
  - `@emach/env/web` → `NEXT_PUBLIC_ECOMMERCE_AUTH_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- **Quando modificar:** Sempre que adicionar uma nova variável de ambiente. Adicione ao schema Zod em `packages/env/src/server.ts` (server) ou `web.ts` (client).

---

### `@emach/db` — Banco de Dados

- **Propósito:** Client Drizzle + schema PostgreSQL. Toda interação com o banco passa por aqui. Schema é **cópia versionada** do `emach-dashboard` — sincronizado manualmente a cada migration do dashboard.
- **Exports principais:**
  - `@emach/db` → `db` (singleton) + `createDb()` (factory para evitar ciclo com `@emach/auth`)
  - `@emach/db/schema/<arquivo>` — preferir caminho específico ao barrel
  - `@emach/db/schema` (barrel intencional, marcado com `// biome-ignore lint/performance/noBarrelFile`)

**Schemas em `packages/db/src/schema/`:**

| Arquivo | Tabelas | Notas |
|---|---|---|
| `auth.ts` | `user`, `session`, `account`, `verification` | Dashboard staff. **Ecommerce não importa.** `user.role` = `pgEnum('user_role', ['admin','manager','user'])`. |
| `client.ts` | `client`, `clientSession`, `clientAccount`, `clientVerification`, `clientAddress` | Clientes BR. `country` default `"BR"`, `phone`, `document` unique nullable. **Owned by ecommerce.** |
| `tools.ts` | `supplier`, `tool` (produto-pai enxuto), **`toolVariant`** (SKU + voltagem + preço/custo + barcode), `toolImage` | `voltage` é `pgEnum('voltage', ['127V','220V','Bivolt','380V'])`. **Toda ferramenta tem ≥1 `toolVariant`** (uma marcada `isDefault=true` via partial unique index). |
| `categories.ts` | `category`, `toolCategory` | Árvore hierárquica com `parent_id` + `path`/`depth` materializados via trigger PL/pgSQL. Anti-ciclo + cascade de path. Depth máximo 5. |
| `attributes.ts` | `attributeDefinition`, `toolAttributeValue` | Catálogo de specs dinâmicas (Saleor-lite). `inputType` (`text`/`number`/`select`/`boolean`/`numeric_range`/`color`), `unit`, `options jsonb`, `categoryId` (herança via path). Valor tipado por coluna (`valueText`, `valueNumeric`, `valueNumericMax`, `valueBool`). |
| `inventory.ts` | `branch`, `stockLevel` | PK `(variantId, branchId)`. `minQty` + `reorderPoint` + check `quantity >= 0`. |
| `stock-movements.ts` | `stockMovement` | Audit trail por **variante** (`variantId`, não `toolId`). `actorType` (`user`/`apiKey`/`system`) + `actorId` + `apiKeyId`. Partial unique index garante idempotência de débito de venda. |
| `orders.ts` | `order`, `orderItem`, `orderStatusHistory`, `orderNote` | `orderItem` carrega `toolId` + `variantId` + snapshots fiscais/dimensão. Enums: `orderStatus`, `paymentStatus`. |
| `reviews.ts` | `review` | Moderação por admin (`status` pgEnum). Unique `(clientId, toolId, orderId)`. SELECT público filtra `status='approved'`. |
| `promotions.ts` | `promotion`, `promotionTool` | Cupons via `promotion.type='promocode'` (não há tabela `coupon`). |
| `api-keys.ts` | `apiKey` | `scopes` + `allowedTags` (text[]). GIN index em scopes. Usado pelo ecommerce para escrever em tabelas dashboard-owned com `actorType='apiKey'`. |
| `consent-log.ts` | `consentLog` | LGPD: TOS/privacy/marketing/cookies por client/lead. |
| `shared-enums.ts` | `actorTypeEnum` | `'user' \| 'apiKey' \| 'system'`. |

**Ownership e escrita compartilhada:**

- **Owned-by-dashboard (autoritativo):** `tool`, `toolVariant`, `category`, `supplier`, `branch`, `stockLevel`, `promotion`, `apiKey`, `attributeDefinition`, schema `auth`. Mudanças → PR no dashboard primeiro.
- **Owned-by-ecommerce (autoritativo):** tabelas `client*` (5).
- **Escrita compartilhada (ambos os apps inserem/atualizam):** `order`, `orderItem`, `stockMovement` (com `actorType='user'` no dashboard, `actorType='apiKey'` no ecommerce), `review`, `consentLog`, `toolAttributeValue` em fluxos cliente.
- **Cópia de schema:** `packages/db/src/schema/*` deste repo é re-sincronizado manualmente a cada migration do dashboard. Não editar em isolamento — coordenar via PR.
- **Drops/renames em prod:** sempre `bun db:generate` + migration versionada. **Nunca** `db:push --force` em prod. `db:push` só em dev local.

**IDs e money:**
- IDs: `crypto.randomUUID()` no caller (server actions/scripts). Sem nanoid.
- Money: `numeric(10,2)` em `tool_variant.priceAmount`/`costAmount`; `numeric(12,2)` em totais de `order.totalAmount`. Nunca `real`/`double`.

**Triggers PL/pgSQL** (`packages/db/src/migrations/_triggers.sql`):
- Drizzle Kit não gera triggers. Aplicar via `bun db:apply-triggers` (idempotente, `CREATE OR REPLACE FUNCTION` + `DROP TRIGGER IF EXISTS`) após qualquer `db:push`/`db:migrate`.
- Conteúdo: anti-ciclo de categoria com path/depth materializados, idempotência de débito de venda em `stockMovement`.

**RLS** (`packages/db/src/migrations/_rls.sql`):
- RLS habilitada em **todas as 30 tabelas**.
- 13 policies SELECT públicas (catálogo: `category`, `tool`, `tool_image`, `tool_variant`, `attribute_definition`, `tool_attribute_value`, `review` filtrada por `status='approved'`, etc).
- 17 tabelas deny-all server-side (Better Auth/service role bypass).
- **Caveats:**
  - `consent_log` deny-all → lead capture (form anon submit) precisa server action, não Supabase client direto.
  - `review` INSERT user-side via server action, não via Supabase client browser.
  - Funções com `SET search_path = public, pg_temp` para fechar advisor `function_search_path_mutable`.

**`db` × `createDb()`:**
- `db` (singleton em `src/index.ts`) — uso geral em server actions.
- `createDb()` (factory) — usado por `@emach/auth/*` para evitar ciclo de import com `@emach/env`. **Não** consolidar em um padrão único.
- **Regra:** o `apps/web` nunca importa `@emach/db` diretamente em código que também precisa de auth. O acesso ao banco em rotas autenticadas é mediado por `@emach/auth`.

**Dependências internas:** `@emach/env`.

---

### `@emach/auth` — Autenticação

- **Propósito:** Duas instâncias Better Auth distintas, isoladas por modelos e cookies:
  - **Dashboard staff** (`@emach/auth/dashboard` → `authDashboard`, `DashboardSession`) — usa `user`, `session`, `account`, `verification`. Não usado neste app.
  - **Ecommerce clients** (`@emach/auth/ecommerce` → `authEcommerce`, `EcommerceSession`) — usa tabelas `client*`. Cookie prefix `ecommerce.session_token`. Email/password + `additionalFields` (`phone`, `document` opcionais). `sendVerificationEmail` + `sendResetPassword` via `@emach/email`.

- **Consumido em:**
  - `apps/web/src/app/api/auth/[...all]/route.ts` — handler catch-all (instância ecommerce)
  - `apps/web/src/lib/auth-client.ts` — `createAuthClient()` Better Auth client SDK
  - `apps/web/src/lib/session.ts` — helper `getClientSession()` server-side
  - `apps/web/src/middleware.ts` — guarda de rotas autenticadas

**Invariantes P0 (qualquer violação é bug crítico):**

1. **`apps/web` deste repo nunca importa `@emach/db/schema/auth` nem `@emach/auth/dashboard`.** O dashboard nunca importa `@emach/db/schema/client` nem `@emach/auth/ecommerce`.
2. `EcommerceSession` ≠ `DashboardSession` — não há tipo "Session" genérico.
3. **Nunca** setar `advanced.cookies.<name>.attributes.domain = ".emach.com.br"` — apps em subdomínios distintos isolam por host. Cookie prefix `ecommerce.session_token` fica preso ao host do ecommerce.
4. CPF/CNPJ: validação responsabilidade deste app (zod refine + dígito verificador via `apps/web/src/lib/validators/cpf-cnpj.ts`). Sempre normalizar (só dígitos) antes de persistir em `client.document`.
5. Migrations em prod: `drizzle-kit generate` + migration versionada. `--force` só em dev/staging.

- **Quando modificar:** Para adicionar OAuth (Google está no UI mas backend pendente), magic link, 2FA, etc.
- **Dependências internas:** `@emach/db`, `@emach/env`, `@emach/email`

---

### `@emach/email` — Envio de E-mails Transacionais
- **Propósito:** Wrapper Resend SDK + templates React Email. Usado por Better Auth ecommerce para verify-email e reset-password.
- **Exports:**
  - `@emach/email/send` → `sendEmail({ to, subject, react })`
  - `@emach/email/templates/verify-email` → template `<VerifyEmail />`
  - `@emach/email/templates/reset-password` → template `<ResetPassword />`
- **Sandbox Resend (sem domain verificado):** `EMAIL_FROM` aponta para `onboarding@resend.dev` — Resend só entrega para o e-mail do owner da conta. Quando comprar domínio, verificar em Resend (SPF/DKIM/DMARC) e trocar `EMAIL_FROM` para `no-reply@<dominio>`.
- **Dependências internas:** `@emach/env`

---

### `@emach/ui` — Biblioteca de Componentes (shadcn)
- **Propósito:** Componentes shadcn compartilhados entre todas as apps do monorepo.
- **Style:** `base-lyra` (usa `@base-ui/react` como primitivo, **não Radix UI**). Visual compacto, cantos retos (`rounded-none`).
- **Exports subpath** (sem barrel/index — importe componentes individualmente):
  - `@emach/ui/components/<nome>` → componente
  - `@emach/ui/lib/utils` → função `cn()` (clsx + tailwind-merge)
  - `@emach/ui/globals.css` → CSS com tokens de design Tailwind v4
  - `@emach/ui/hooks/<nome>` → hooks compartilhados (diretório existe, atualmente vazio)
- **30 componentes existentes:** `accordion`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `card`, `carousel`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `input`, `input-group`, `label`, `navigation-menu`, `pagination`, `popover`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`
- **Como adicionar componentes:**
  ```bash
  bunx shadcn@latest add <nome> -c packages/ui
  bunx shadcn@latest add table sheet -c packages/ui    # múltiplos
  ```
- **Dependências internas:** nenhuma em runtime

---

## 4. Grafo de Dependências

```
@emach/config ──(devDep: tsconfig)──► todos os packages
      │
@emach/env ──(runtime)──► @emach/db, @emach/email
      │                         │            │
      └────────────────────────►@emach/auth ◄┘
                                      │
                               apps/web (consome auth + env + ui)

@emach/ui ──(runtime, independente)──► apps/web
```

---

## 5. App Web (`apps/web`)

### Estrutura de diretórios

```
apps/web/src/
├── index.css                       ← @import "@emach/ui/globals.css"
├── middleware.ts                   ← Guard de rotas autenticadas (/dashboard etc.)
├── lib/
│   ├── auth-client.ts              ← createAuthClient() Better Auth client SDK
│   ├── session.ts                  ← getClientSession() server-side helper
│   ├── cart-context.tsx, cart-store.ts, constants.ts, format.ts, mock-data.ts
│   └── validators/
│       └── cpf-cnpj.ts             ← maskCpfCnpj, isValidCpfCnpj, maskPhone (uso: checkout)
├── components/                     ← Componentes de negócio compartilhados
│   ├── site-header.tsx, site-footer.tsx, search-overlay.tsx
│   ├── product-card.tsx, product-image.tsx, product-rating.tsx
│   ├── cart-sheet.tsx, cart-item-row.tsx, freight-calculator.tsx, free-shipping-progress.tsx
│   ├── checkout-header.tsx, quantity-stepper.tsx, category-tile.tsx
│   ├── emach-button.tsx, emach-badge.tsx, ticker.tsx, loader.tsx
│   ├── page-container.tsx, section-header.tsx, section-label.tsx
│   ├── product-card-skeleton.tsx, providers.tsx
└── app/
    ├── layout.tsx                  ← Root layout (fontes, Providers, Header)
    ├── page.tsx                    ← Landing "/"
    ├── not-found.tsx, manifest.ts, robots.ts, sitemap.ts
    ├── login/page.tsx              ← Tabs Entrar/Cadastrar + Google OAuth (UI placeholder)
    ├── esqueci-senha/              ← Solicitar link de redefinição
    ├── redefinir-senha/            ← Confirmar nova senha via token
    ├── verificar-email/            ← Verificar e-mail via token
    ├── sobre/                      ← Página institucional
    ├── dashboard/                  ← Área autenticada (cliente logado)
    ├── catalog/, product/, cart/, checkout/   ← Páginas ecommerce (em construção)
    └── api/auth/[...all]/route.ts  ← Better Auth catch-all (instância ecommerce)
```

### Padrões de import

```ts
// Componentes da UI compartilhada (subpath — sem barrel)
import { Button } from "@emach/ui/components/button";
import { cn } from "@emach/ui/lib/utils";

// Schema Drizzle preferir caminho específico
import { tool, toolVariant } from "@emach/db/schema/tools";

// Código local do app
import { SomeComponent } from "@/components/some-component";
import { authClient } from "@/lib/auth-client";
```

---

## 6. Convenções de Organização de Código

### Regra das pastas com `_` prefix (private folders do Next.js)

Pastas prefixadas com `_` são **ignoradas pelo App Router** — não geram rotas. Use-as para organizar código colocado junto à rota.

**Estrutura padrão de uma rota:**

```
app/<rota>/
├── page.tsx              ← Entry point (server component por padrão)
├── layout.tsx            ← Layout específico da rota (se necessário)
├── loading.tsx           ← Suspense boundary visual (se necessário)
├── error.tsx             ← Error boundary (se necessário)
├── _components/          ← Componentes usados APENAS nesta rota
│   └── product-card.tsx
├── _hooks/               ← Hooks usados APENAS nesta rota
│   └── use-product-filter.ts
├── _actions/             ← Server actions desta rota
│   └── create-product.ts
└── _lib/                 ← Utilitários e helpers desta rota
    └── format-price.ts
```

### Tabela de decisão: onde colocar cada coisa

| O que você precisa criar | Onde colocar |
|---|---|
| Componente UI genérico/reutilizável (botão, modal, tabela) | `packages/ui/` via `bunx shadcn add -c packages/ui` |
| Componente de negócio compartilhado entre rotas | `apps/web/src/components/` |
| Componente específico de UMA rota | `apps/web/src/app/<rota>/_components/` |
| Hook compartilhado entre rotas | `apps/web/src/hooks/` |
| Hook específico de UMA rota | `apps/web/src/app/<rota>/_hooks/` |
| Server action | `apps/web/src/app/<rota>/_actions/` |
| Utilitário compartilhado | `apps/web/src/lib/` |
| Utilitário específico de UMA rota | `apps/web/src/app/<rota>/_lib/` |
| Nova página/rota | `apps/web/src/app/<rota>/page.tsx` |
| Layout entre rotas (route group) | `apps/web/src/app/(<grupo>)/layout.tsx` |
| API route | `apps/web/src/app/api/<rota>/route.ts` |
| Nova tabela no banco | `packages/db/src/schema/<nome>.ts` (coordenar com dashboard se for compartilhada) |
| Nova variável de ambiente server | `packages/env/src/server.ts` |
| Nova variável de ambiente client | `packages/env/src/web.ts` |
| Novo método/plugin de auth | `packages/auth/src/ecommerce.ts` |
| Middleware global (auth guard, etc.) | `apps/web/src/middleware.ts` |

### Pergunta rápida para decidir onde colocar

1. **Será usado por múltiplas apps?** → `packages/`
2. **Será usado por múltiplas rotas na mesma app?** → `apps/web/src/components/`, `hooks/` ou `lib/`
3. **Só é usado numa rota específica?** → Na pasta da rota com prefix `_`

---

## 7. Comandos Essenciais

### Desenvolvimento

```bash
bun run dev          # Inicia todas as apps e packages
bun run dev:web      # Inicia só o apps/web (porta 3001)
bun run build        # Build de produção (via Turbo)
bun run check-types  # Verifica TypeScript em todo o monorepo
```

### Banco de dados

```bash
bun run db:push      # Sincroniza schema com o banco (sem migration) — apenas dev local
bun run db:generate  # Gera arquivos de migration (staging/prod)
bun run db:migrate   # Aplica migrations pendentes
bun run db:studio    # Abre Drizzle Studio (UI visual do banco)
```

### Banco de dados — utilitários (em `packages/db`)

```bash
bun --cwd packages/db db:apply-triggers       # aplica src/migrations/_triggers.sql (idempotente)
bun --cwd packages/db db:seed-categories      # bootstrap categorias raiz
bun --cwd packages/db db:seed-attributes      # bootstrap attribute_definitions iniciais
bun --cwd packages/db db:anonymize-client <id># LGPD direito ao esquecimento
```

> ⚠️ Após qualquer `db:push`/`db:migrate`, rodar `db:apply-triggers`. Drizzle Kit não gera triggers PL/pgSQL.

### Qualidade de código

```bash
bun run check        # Verifica linting/formatting (Ultracite/Biome)
bun run fix          # Corrige automaticamente os problemas
# Ou diretamente:
bun x ultracite fix
bun x ultracite check
bun x ultracite doctor
```

### shadcn

```bash
bunx shadcn@latest add <nome> -c packages/ui          # Adiciona componente
bunx shadcn@latest add <a> <b> <c> -c packages/ui     # Múltiplos de uma vez
bunx shadcn@latest diff -c packages/ui                 # Ver atualizações disponíveis
```

---

## 8. Environment Variables

Todas as vars são definidas em `apps/web/.env` (gitignored) e validadas em build time pelo `@emach/env`.

| Variável | Tipo | Escopo | Onde é validada |
|---|---|---|---|
| `DATABASE_URL` | string (min 1) | server | `@emach/env/server` |
| `BETTER_AUTH_SECRET` | string (min 32) | server | `@emach/env/server` |
| `BETTER_AUTH_URL` | URL | server | `@emach/env/server` |
| `BETTER_AUTH_URL_ECOMMERCE` | URL | server | `@emach/env/server` |
| `CORS_ORIGIN` | URL | server | `@emach/env/server` |
| `ECOMMERCE_ORIGIN` | URL | server | `@emach/env/server` |
| `RESEND_API_KEY` | string (`re_...`) | server | `@emach/env/server` |
| `EMAIL_FROM` | string (formato `Nome <email>`) | server | `@emach/env/server` |
| `SUPABASE_SERVICE_ROLE_KEY` | string (`sb_secret_...`) | server | `@emach/env/server` |
| `NODE_ENV` | `development\|production\|test` | server | `@emach/env/server` |
| `NEXT_PUBLIC_ECOMMERCE_AUTH_URL` | URL | client | `@emach/env/web` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL | client | `@emach/env/web` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | string (`sb_publishable_...`) | client | `@emach/env/web` |

**Para adicionar nova env var:**
1. Adicione ao schema Zod em `packages/env/src/server.ts` (server) ou `packages/env/src/web.ts` (client)
2. Adicione ao `apps/web/.env`

---

## 9. O que ainda não existe (contexto de desenvolvimento)

- **OAuth Google/Apple backend** — Botão "Continuar com Google" no `/login` é placeholder visual com toast "Em breve". Apple removido. Backend ainda sem `socialProviders` configurado em `@emach/auth/ecommerce`.
- **Domínio verificado no Resend** — `EMAIL_FROM=onboarding@resend.dev` (sandbox). Em sandbox, Resend só entrega para o e-mail do owner da conta. Quando comprar domínio, verificar (SPF/DKIM/DMARC) e atualizar `EMAIL_FROM`.
- **Rate limit em endpoints auth** — Sem proteção contra brute-force em `signin`/`signup`/`reset`.
- **Logger central** — `apps/web/src/lib/logger.ts` ainda não existe; código atual usa `console.*` (ver §11 anti-pattern). Criar wrapper antes de adicionar mutations sensíveis em prod.
- **Templates de e-mail Ferrari-style** — `verify-email.tsx` e `reset-password.tsx` funcionais mas sem polish visual.
- **`apps/web/src/hooks/`** — Diretório não criado ainda.
- **`loading.tsx`, `error.tsx`** — Nenhuma rota tem esses (apenas `not-found.tsx` global).
- **Route groups** (`(shop)`, `(auth)`, etc.) — Não utilizados ainda.
- **Coleta de CPF/CNPJ** — Movida do signup para o checkout (campo `client.document` existe e validator `cpf-cnpj.ts` está pronto para reuso).
- **Cabear `mock-data.ts` → queries reais** — Catálogo storefront ainda lê de mock; integrar com `tool` + `toolVariant` + `toolImage` reais.
- **CI/CD e Docker** — Nenhuma configuração de deploy existe.

## 9.1. O que já existe (referência)

- **30 componentes shadcn** instalados em `packages/ui/` (style `base-lyra`, Base UI)
- **Tokens CSS Ferrari** em `packages/ui/src/styles/globals.css` (cores oklch, fontes Barlow, `--radius: 2px`, chiaroscuro)
- **Schema completo do dashboard** sincronizado: `tool`/`toolVariant`/`category`/`attribute*`/`order*`/`stockMovement`/`review`/`consentLog` etc.
- **RLS aplicada** em todas as 30 tabelas (catálogo público anon+authenticated; resto deny-all server-side)
- **Triggers PL/pgSQL** ativos (anti-ciclo categoria, idempotência stock_movement)
- **Design visual completo** no Pencil MCP (`~/Work/pencil/emach-ecommerce.pen`) com 28 componentes, 34 vars, 6 páginas
- **Design context** em `.impeccable.md` na raiz e `design/DESIGN.md`
- **Specs** em `docs/superpowers/specs/`

---

## 10. Design System — Ferrari-Inspired

O projeto segue uma linguagem visual inspirada no site Ferrari. A linguagem visual é Ferrari, mas os produtos são **ferramentas**.

**Referências:**
- `design/DESIGN.md` — Referência visual completa (cores, tipografia, layout, breakpoints)
- `design/preview.html` / `design/preview-dark.html` — Catálogo visual HTML dos tokens
- `.impeccable.md` — Contexto de design persistente com princípios e guidelines
- `~/Work/pencil/emach-ecommerce.pen` — Design System visual no Pencil MCP

### Categorias de Produtos

| Categoria | Exemplos |
|---|---|
| **Ferramentas Elétricas** | Furadeira, Serra Circular, Esmerilhadeira, Parafusadeira |
| **Ferramentas Manuais** | Jogo de Chaves, Alicate, Martelo, Serrote |
| **Medição** | Nível Laser, Trena Digital, Paquímetro |
| **Segurança** | Óculos, Luvas, Protetor Auricular |
| **Acessórios** | Brocas, Discos de Corte, Lâminas, Bits |

### Princípios de Design (da `.impeccable.md`)

1. **Vermelho é verbo, não decoração.** Ferrari Red (`#DA291C`) aparece UMA vez por tela, sempre como CTA de alta prioridade.
2. **Cada seção é uma vinheta.** O ritmo dark→light→dark é narrativo, não estilístico.
3. **Cantos retos = precisão.** `border-radius: 0` em todos os componentes interativos.
4. **Informação técnica é design.** Specs (voltagem, torque, RPM) têm a mesma atenção visual que headlines.
5. **Menos é mais, exceto quando menos é vazio.** Whitespace generoso, mas cada seção com densidade e propósito.

### Paleta de Cores

| Token | Light (padrão) | Dark (`.dark`) | Papel |
|-------|----------------|----------------|-------|
| `--primary` | `#DA291C` Ferrari Red | `#DA291C` | CTAs de alta prioridade. Usar com **parcimônia**. |
| `--secondary` | `#FFFFFF` branco | `#181818` | Botão padrão (Configure, etc.) |
| `--background` | `#FFFFFF` | `#181818` Near Black | Superfície base |
| `--foreground` | `#181818` | `#FFFFFF` | Texto principal |
| `--muted` | `#D2D2D2` | `#303030` | Superfícies sutis, dividers |
| `--muted-foreground` | `#666666` | `#8F8F8F` | Texto secundário |
| `--destructive` | `#F13A2C` | `#F13A2C` | Warning (distinto do brand red) |
| `--border` | `#CCCCCC` | `rgba(255,255,255,0.1)` | Bordas |
| `--ring` | `#DA291C` | `#DA291C` | Focus ring (Ferrari Red) |

### Tipografia

- **Barlow** (`--font-sans`): Headings, botões, nav, body text. Pesos 400–700.
- **Barlow Condensed** (`--font-display`): Labels, captions, tags. Sempre **uppercase** com `letter-spacing: 1px`.

```tsx
<span className="font-display uppercase tracking-wider text-xs">Label</span>
```

### Chiaroscuro — Seções Alternadas

Não há toggle de dark mode global. Seções individuais alternam entre light e dark adicionando `className="dark"`:

```tsx
<section>
  {/* conteúdo editorial — branco (#FFFFFF) */}
</section>
<section className="dark">
  {/* conteúdo cinemático — Near Black (#181818) */}
</section>
```

O `@custom-variant dark (&:is(.dark *))` no Tailwind CSS v4 garante que `dark:bg-*`, `dark:text-*` etc. funcionam dentro de qualquer ancestral com `class="dark"`.

### Do's
- Ferrari Red (`--primary`) apenas em CTAs de alta prioridade — sua força vem da parcimônia
- `rounded-none` em todos os componentes — "razor precision"
- Barlow Condensed apenas para labels/tags em uppercase + `letter-spacing: 1px`
- Cada seção da página deve ser uma "vinheta" com um foco claro
- Specs técnicas (voltagem, torque, RPM, peso) com destaque visual — profissionais compram por dados
- Preços sempre em formato R$ brasileiro: `R$ 899,00` (vírgula decimal, ponto milhar)
- Imagens de produto com color scheme vermelho/preto (identidade EMACH)

### Don'ts
- Não espalhe Ferrari Red como decoração — é sinal de CTA, não cor de tema
- Não use border-radius arredondados (exceto modais: até 8px, avatares: 50%)
- Não adicione box-shadows em cards — profundidade vem do contraste de superfícies
- Não misture Barlow e Barlow Condensed no mesmo bloco de texto
- Não use uppercase em headings Barlow — uppercase é reservado para Barlow Condensed labels
- Não use cores vibrantes como fundo de seção — só preto/branco/cinza
- Não use ferramentas com detalhes amarelos (estilo DeWalt) — sempre vermelho/preto EMACH

---

## 11. Anti-patterns banidos (P0/P1)

- **`console.log/warn/error`** em código de produção. Usar `logger` central em `apps/web/src/lib/logger.ts` (criar quando precisar). Em catch de server action, devolver `{ ok: false, error: "mensagem" }` em vez de logar e seguir.
- **`: any`, `<any>`, `as any`, `@ts-ignore`, `@ts-expect-error`** — exceto em `.next/` gerado.
- **`key={index}`** em `.map()` — usar ID estável (`tool.id`, `variant.id`, etc.). Exceções (variantes/options sem id) ficam com `biome-ignore` explícito.
- **`<img>` puro** — sempre `next/image` (exceção thumbs Supabase com `// biome-ignore lint/performance/noImgElement: Supabase public URL` documentado).
- **`React.forwardRef`** — React 19 usa `ref` como prop normal.
- **Barrel files** (`index.ts` que só re-exporta) em `packages/ui/src`, `apps/web/src`, `packages/auth/src`. Em `packages/db/src/schema/index.ts` o barrel é **intencional** (marcado com `// biome-ignore lint/performance/noBarrelFile`).
- **`async function` em Client Component** (`"use client"`) — usar Server Component para fetching.
- **`.forEach()` em hot path** — preferir `for...of`.
- **`new RegExp(...)` ou regex literal dentro de loops** — extrair top-level.
- **`target="_blank"` sem `rel="noopener"`**.
- **Injeção de HTML não-sanitizado em React** — qualquer markdown/HTML de fonte não confiável precisa passar por `react-markdown` + `rehype-sanitize` (preset `defaultSchema`).
- **Importar `@emach/db/schema/auth` ou `@emach/auth/dashboard`** deste app (P0 — quebra isolamento staff × cliente).

---

## 12. Workflow de mudança

1. **Antes de tocar UI:** abrir `design/DESIGN.md` + `.impeccable.md` na seção relevante; invocar skill `web-design-guidelines` se for review.
2. **Antes de tocar schema:**
   - Tabela owned-by-ecommerce (`client*`): editar `packages/db/src/schema/client.ts` → dev `bun db:push` → `bun db:apply-triggers` → smoke.
   - Tabela owned-by-dashboard ou compartilhada: **PR no dashboard primeiro**, depois sincronizar a cópia neste repo. Em prod sempre `bun db:generate` + commit migration + `bun db:migrate`.
3. **Server actions:** `"use server"` no topo, `await getClientSession()` ou guarda explícita no início, validar input com Zod, normalizar antes de persistir. Padrão `ActionResult<T>` (`{ ok: true; data } | { ok: false; error }`).
4. **Escrita em tabelas dashboard-owned:** usar `actorType='apiKey'` + `apiKeyId` em `stockMovement` e similares (nunca `actorType='user'` aqui — `user` é staff).
5. **Imagens em forms:** quando integrar uploads, extrair helper genérico em `lib/storage.ts` aceitando `{ bucket, prefix, formData }`. Service role key em `SUPABASE_SERVICE_ROLE_KEY` (server-only).
6. **Validação targeted:** `bun check-types` no workspace alterado, `bun fix` no escopo. Suite inteira só se necessário.
7. **Smoke run-time:** quando refactor toca SSR, sempre rodar `bun dev:web` e visitar as rotas afetadas — `tsc` não detecta SQL inválido nem queries com colunas removidas.
8. **Commit:** Conventional Commits em **PT** (`feat:`/`fix:`/`refactor:`/`test:`/`docs:`/`chore:`). **Nunca** commitar sem confirmação explícita do user.

---

## 13. MCP Servers — Configuração

| Servidor | Scope | Onde | Para quê |
|---|---|---|---|
| `supabase` | project | `.mcp.json` | DDL/migrations no banco do projeto (`apply_migration`, `execute_sql`, `list_tables`, `get_advisors`) |
| `better-t-stack` | project | `.mcp.json` | Stack scaffolding |
| `context7` | project | `.mcp.json` | Docs ao vivo de libs/SDKs |
| `shadcn` | project | `.mcp.json` | Adicionar/buscar componentes shadcn |
| `next-devtools` | project | `.mcp.json` | Helpers Next.js 16 (`nextjs_call <port> get_errors` para stack trace SSR) |
| `better-auth` | project | `.mcp.json` (HTTP) | Docs Better Auth |
| `resend` | **local** | `~/.claude.json` (project entry) | Envio transacional + gestão de domínios. Privado por dev — API key não vai pro repo |

**Por que Resend é `local` e não `project`:** `.mcp.json` é versionado em git. `RESEND_API_KEY` é segredo — colocá-la em `.mcp.json` vazaria no repo. Scope `local` mantém a config no `~/.claude.json` (não-versionado), privado ao dev. Outros devs precisam re-adicionar com:
```bash
claude mcp add -s local resend -- npx -y resend-mcp -e RESEND_API_KEY=<key>
```

**Boundaries críticos** (do CLAUDE.md global):
- `pencil`: arquivos `.pen` encriptados — **NUNCA** ler com `Read`/`Grep`. Usar `mcp__pencil__*`.
- `filesystem`: whitelist `~/Work`. **NUNCA expandir para `~/.claude`** (contém credenciais).

---

## 14. Ultracite Code Standards

Este projeto usa **Ultracite**, um preset zero-config que aplica formatação e linting rigorosos via Biome.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid runtime code evaluation primitives; never assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- **Avoid barrel files** (index files that re-export everything) — use subpath imports
- Use proper image components (Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components
- `"use client"` só quando realmente necessário (eventos, hooks, estado local)

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`
- React Compiler está ativo (`reactCompiler: true`) — não adicione `useMemo`/`useCallback` manual desnecessário

**Typed Routes:**
- `typedRoutes: true` está ativo — TypeScript valida os paths de `<Link href="...">`. Se o link não compilar, a rota não existe.

### Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

### When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations

Run `bun x ultracite fix` before committing to ensure compliance.

---

## 15. Onde se aprofundar

- **Auth ecommerce passo-a-passo + footguns:** `docs/auth/ecommerce-integration.md`
- **Convenções de schema Drizzle:** `packages/db/CLAUDE.md`
- **Design system completo:** `design/DESIGN.md` + `.impeccable.md`
- **Pencil design source:** `~/Work/pencil/emach-ecommerce.pen` (via `mcp__pencil__*`)
- **Schema do dashboard (fonte de verdade para tabelas compartilhadas):** `~/noctua/emach-dashboard/.claude/CLAUDE.md` + `~/noctua/emach-dashboard/packages/db/CLAUDE.md`
- **Specs de fases:** `docs/superpowers/specs/`
