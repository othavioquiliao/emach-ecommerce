# emach-ecommerce

> Log de mistakes recorrentes e decisões não-óbvias. Código vence em conflito.
> Storefront BR de ferramentas (furadeiras, serras, EPIs). Compartilha DB Supabase com `emach-dashboard` (repo irmão, admin staff).

## Auth — invariantes P0 (qualquer violação é bug crítico)

Duas instâncias **completamente isoladas** Better Auth no mesmo banco. Este app usa só a `ecommerce` (clientes BR via email/senha + Google OAuth).

1. `apps/web` deste repo **nunca** importa `@emach/db/schema/auth` nem `@emach/auth/dashboard`. Dashboard **nunca** importa `@emach/db/schema/client` nem `@emach/auth/ecommerce`.
2. `EcommerceSession` ≠ `DashboardSession` — não existe tipo "Session" genérico.
3. **Nunca** setar `advanced.cookies.<name>.attributes.domain = ".emach.com.br"`. Subdomínios distintos isolam por host.
4. CPF/CNPJ: validação no app (zod refine + dígito verificador em `apps/web/src/lib/validators/cpf-cnpj.ts`). Sempre normalizar (só dígitos) antes de persistir em `client.document`.

## Ownership e schema sync (ADR-0009)

Schema TS aqui é **cópia versionada** do dashboard, sincronizada via **CI PR automático**.

- **Owned-by-dashboard (autoritativo, mudanças começam lá):** `tool`, `toolVariant`, `category`, `supplier`, `branch`, `stockLevel`, `userBranch`, `promotion`, `attribute*`, schema `auth`.
- **Owned-by-ecommerce (autoritativo aqui):** tabelas `client*` (5).
- **Escrita compartilhada:** `order`, `orderItem`, `stockMovement`, `review`, `consentLog`, `toolAttributeValue`.
- **Sync:** workflow `sync-db-schema.yml` no dashboard abre PR aqui quando `packages/db/src/{schema,queries,sql/triggers.sql}` muda na `main` do dashboard. **Não editar `schema/*.ts` em isolamento aqui.**
- **`db:generate` / `db:migrate` são legacy** — scripts ainda no `package.json` mas não usar. A pasta `migrations/` foi removida.
- **Escritas em tabelas dashboard-owned:** `actorType='system'` em `stockMovement` e similares (nunca `'user'` — `user` é staff). Enum atual: `pgEnum('actor_type', ['user','system'])`.

## Anti-patterns banidos (P0/P1)

- `console.log/warn/error` em produção. Usar `log` do evlog (`import { log } from "@/lib/evlog"`). Em catch de server action: **sempre** `log.error({ action, ...context })` antes de retornar `{ ok: false }` — silenciar sem log é P0.
- `: any`, `as any`, `@ts-ignore`, `@ts-expect-error` (exceto `.next/` gerado).
- `key={index}` em `.map()` — IDs estáveis. Exceções com `biome-ignore` documentado.
- `<img>` puro — sempre `next/image` (exceto thumbs Supabase com `// biome-ignore lint/performance/noImgElement`).
- `React.forwardRef` — React 19 usa `ref` como prop normal.
- `useMemo`/`useCallback` manuais — React Compiler ativo.
- `async function` em Client Component — usar Server Component pra fetching.
- Barrel files em `packages/ui/src`, `apps/web/src`, `packages/auth/src`. Exceção: `packages/db/src/schema/index.ts` (intencional).
- `.forEach()` em hot path — `for...of`.
- `new RegExp(...)` em loops — extrair top-level.
- `target="_blank"` sem `rel="noopener"`.
- HTML não-sanitizado em React — passar por `react-markdown` + `rehype-sanitize` (`defaultSchema`).
- Importar `@emach/db/schema/auth` ou `@emach/auth/dashboard` (P0 — quebra isolamento).

## Server actions

- `"use server"` no topo, guarda de sessão no início, input validado com Zod, normalizar antes de persistir.
- Retorno: `ActionResult<T>` = `{ ok: true; data } | { ok: false; error }`.
- Catch: `log.error({ action, ...context })` + `{ ok: false, error: "mensagem" }`. Sem `console`.

## Gotchas

- **`createDb()` × `db` singleton:** `@emach/auth/*` usa `createDb()` pra evitar ciclo com `@emach/env`; resto usa `db`. Não consolidar.
- **`apps/web` nunca importa `@emach/db` diretamente em rota autenticada** — acesso é mediado por `@emach/auth`.
- **shadcn é Base UI (não Radix)** — style `base-lyra`. Primitivo `@base-ui/react`.
- **`shadcn add` não passa pelo hook lint** — rodar `bun check` após adicionar componentes.
- **`proxy.ts` (Next 16) substitui `middleware.ts`** — não criar `middleware.ts`.
- **`typedRoutes: true`** — `<Link href>` valida em tsc.
- **Resend em sandbox** (`EMAIL_FROM=onboarding@resend.dev`): só entrega pro owner da conta. Ao comprar domínio: verificar SPF/DKIM/DMARC no Resend + trocar `EMAIL_FROM`.
- **Filial padrão NÃO é env var** — resolvida via `lib/default-branch.ts > getDefaultBranchId()` (lookup DB).
- **IDs:** `crypto.randomUUID()` no caller — sem nanoid.
- **Pós-merge de PR sync ou `bun db:push` em dev local:** rodar `bun db:apply-triggers` (triggers em `sql/triggers.sql`, owned-by-dashboard).

## Smoke run-time

`bun check-types` não detecta SQL inválido em template strings nem queries com colunas removidas. Após mexer em schema/queries SSR: `bun dev:web` + visitar rotas afetadas. Stack trace via `nextjs_call <port> get_errors` (MCP `next-devtools`).

## Lacunas conhecidas

- Rate limit em endpoints auth (sem proteção brute-force em `signin`/`signup`/`reset`).
- Resend em sandbox (ver gotchas).
- evlog sem drain externo (Axiom/Datadog/Sentry) — output só em console.
- Sem CI/CD nem Docker config.

## Design — Ferrari-inspired (resumo)

Detalhe completo em `DESIGN.md`. **Vermelho é verbo, não decoração** — Ferrari Red (`#DA291C`) só em CTA de alta prioridade, UMA vez por tela. **Cantos retos = precisão** (`border-radius: 0` em interativos; modais ≤8px, avatares 50%). Tipografia: **Barlow** (corpo) + **Barlow Condensed** (labels uppercase + tracking) — não misturar no mesmo bloco. Preços sempre `R$ 899,00`.

## MCP — Resend é local

`.mcp.json` é versionado e `RESEND_API_KEY` é segredo, então Resend MCP é local (não no repo). Outros devs re-adicionam:

```bash
claude mcp add -s local resend -- npx -y resend-mcp -e RESEND_API_KEY=<key>
```

## Onde estão os outros mistakes-logs

| Tópico | Arquivo |
|---|---|
| Schema sync, triggers, ownership detalhado, gotchas DB | `packages/db/CLAUDE.md` |
| Sistema visual completo | `DESIGN.md` |
| Multi-context glossário de domínio | `CONTEXT-MAP.md` |
| Skills locais, MCPs (exceto Resend) | `.claude/skills/`, `.mcp.json` |

Stack / scripts / envs → `package.json`, `packages/env/src/{server,web}.ts`. Schema fonte de verdade → repo irmão `emach-dashboard`.
