# emach-ecommerce — Guia para Codex

> Adaptador para agentes que leem `AGENTS.md`.
> **Fonte canônica do projeto:** `CLAUDE.md`.
> **Fonte canônica das preferências globais do usuário:** `/home/othavio/.claude/CLAUDE.md`.

Este repo usa **Claude Code como agente principal**. O Codex deve preservar essa
hierarquia: ler os contextos Claude, traduzir instruções Claude-specific para as
ferramentas do Codex e evitar criar uma segunda fonte de verdade.

## Ordem de Leitura

Antes de qualquer tarefa não trivial:

1. `CLAUDE.md` — mapa principal do projeto, stack, invariantes e comandos.
2. `/home/othavio/.claude/CLAUDE.md` — preferências globais, quando a tarefa
   depender de workflow, estilo, segurança, tooling local ou uso de skills.
3. `CONTEXT-MAP.md` — mapa dos bounded contexts do domínio EMACH.
4. `docs/adr/` — decisões arquiteturais que podem limitar a solução.
5. `docs/contexts/<slug>/CONTEXT.md` — somente os contextos relevantes.

Leituras condicionais:

- UI/frontend: ler `DESIGN.md` antes de tocar telas, componentes ou copy visual.
- DB/schema/query: ler `packages/db/CLAUDE.md` e `docs/adr/0002-ownership-de-migrations.md`.
- `packages/db/`: ler também `packages/db/AGENTS.md`.
- Issue/PRD/triage: ler `docs/agents/*.md`.

## Como Trabalhar Neste Repo

- Responda em Português. Preserve comandos, identificadores, APIs e erros em inglês.
- Use `rtk` como prefixo dos comandos de shell sempre que possível.
- Não faça `git commit`, `git push`, force-push, remoção destrutiva, drop de dados
  ou kill de processo sem aprovação explícita.
- Não pule hooks com `--no-verify`, `--no-gpg-sign` ou flags equivalentes.
- Antes de afirmar "feito", "passa" ou "OK", rode verificação real e mostre o
  resultado essencial.
- Se houver dúvida real de intenção ou 2+ soluções com trade-off, pergunte antes
  de editar.

## Equivalências Claude Code -> Codex

| Intenção no contexto Claude | Codex |
| --- | --- |
| `AskUserQuestion` | perguntar diretamente quando necessário; `request_user_input` se disponível |
| `Bash` | `exec_command`; sessões longas via `write_stdin` |
| `Read` | `exec_command` com `rtk sed`, `rtk nl`, `rtk head`, `rtk tail` |
| `Grep` | `exec_command` com `rtk rg` |
| `Glob` | `exec_command` com `rtk rg --files` |
| `Write` / `Edit` / `MultiEdit` | `apply_patch` |
| `TodoWrite` | `update_plan` |
| `Task` / `Agent` | `spawn_agent` somente quando o usuário ou harness permitir |
| `Skill` | abrir o `SKILL.md` aplicável e seguir as instruções |
| `WebSearch` / `WebFetch` | `web.run`; para docs de libs, preferir `ctx7`/Context7 |

## Stack e Comandos

Stack principal: Bun 1.3, Turborepo 2, Next.js 16, React 19, Drizzle 0.45,
Supabase Postgres, Better Auth, shadcn Base UI, Tailwind v4, Ultracite/Biome.

Comandos frequentes:

```bash
rtk bun run dev
rtk bun run dev:web
rtk bun run build
rtk bun run check-types
rtk bun run check
rtk bun run fix
```

DB:

```bash
rtk bun run db:push
rtk bun --cwd packages/db db:apply-triggers
rtk bun --cwd packages/db db:check-drift
```

## Regras Críticas de DB

- A DB real no Supabase é compartilhada com `emach-dashboard`.
- `emach-dashboard` é a fonte de verdade para schema e migrations.
- Neste repo, `packages/db/src/schema/*` é espelho versionado do dashboard.
- Não autorar migrations próprias aqui. ADR-0002 governa esse fluxo.
- Triggers PL/pgSQL vivem em `packages/db/src/sql/triggers.sql` e são aplicadas
  com `bun --cwd packages/db db:apply-triggers`.
- Mudanças em tabelas dashboard-owned ou compartilhadas começam no dashboard e
  depois são sincronizadas neste repo.
- `client*` é owned-by-ecommerce; mesmo assim, validar drift e impacto com cuidado.

## Regras Críticas de App

- `apps/web` nunca importa `@emach/db/schema/auth` nem `@emach/auth/dashboard`.
- `EcommerceSession` e `DashboardSession` não são intercambiáveis.
- Server actions: `"use server"`, guarda de sessão no início, input validado com
  Zod, normalização antes de persistir e retorno `ActionResult<T>`.
- Em catch de server action, usar `log.error` de `@/lib/evlog` antes de retornar
  `{ ok: false }`.
- React 19: `ref` é prop normal; não usar `React.forwardRef`.
- React Compiler ativo: não adicionar `useMemo`/`useCallback` manual sem motivo
  comprovado.
- Next 16: Server Components por padrão; `"use client"` só para eventos, hooks ou
  estado local.

## UI e Design

- Ler `DESIGN.md` antes de qualquer trabalho visual.
- Visual EMACH é Ferrari-inspired: chiaroscuro, Barlow/Barlow Condensed, cantos
  retos, vermelho `#DA291C` usado como ação, não decoração.
- Usar `EmachButton` para páginas EMACH; shadcn fica como base compartilhada.
- Componentes shadcn entram via:

```bash
rtk bunx shadcn@latest add <nome> -c packages/ui
```

Depois rode `rtk bun run check`.

## Docs e Domínio

- Use o vocabulário dos `docs/contexts/*/CONTEXT.md`.
- Se uma proposta contradizer um ADR, aponte isso explicitamente.
- `Cart` é estado efêmero client-side, não bounded context.
- `Payment` e `Shipping` ainda não são contextos próprios.

## MCP e Docs Atuais

`.mcp.json` define servidores para Supabase, Context7, shadcn, next-devtools,
Better Auth e Better-T-Stack. Quando a pergunta envolver API, SDK, framework,
CLI ou cloud service, use documentação atual via Context7/`ctx7` antes de
responder com detalhes de versão.

Não inclua segredos, tokens ou credenciais em queries.
