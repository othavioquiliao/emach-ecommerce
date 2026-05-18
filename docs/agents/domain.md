# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a **multi-context** repo: the EMACH domain is decomposed into bounded contexts in `CONTEXT-MAP.md`. The contexts are **domain contexts, not code folders** — `packages/db/src/schema/` holds tables from every context, so the per-context docs live in a dedicated `docs/contexts/` tree rather than co-located with code.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — lists the bounded contexts, where each `CONTEXT.md` lives, and how the contexts relate. Read it first.
- The per-context **`CONTEXT.md`** under `docs/contexts/<slug>/` — read the one(s) relevant to the topic.
- **`docs/adr/`** at the root — system-wide architectural decisions. Also check `docs/contexts/<slug>/docs/adr/` for context-scoped decisions.

If any of these files don't exist yet, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily as terms and decisions get resolved.

> The real PostgreSQL database (Supabase) is the source of truth for the schema. The Drizzle files in `packages/db/src/schema/` are a versioned mirror and may be out of date — verify against the live DB (via `psql` with `DATABASE_URL`, or the `supabase` MCP) before trusting them.

## File structure

```
/
├── CONTEXT-MAP.md                     ← index of bounded contexts + relationships
├── CLAUDE.md                          ← canonical project guide (architecture, invariants)
├── DESIGN.md                          ← design system tokens + principles
├── docs/
│   ├── adr/                           ← system-wide decisions
│   ├── agents/                        ← engineering-skills config (this file lives here)
│   └── contexts/
│       ├── catalog/
│       │   ├── CONTEXT.md
│       │   └── docs/adr/              ← catalog-specific decisions (lazy)
│       ├── ordering/
│       │   ├── CONTEXT.md
│       │   └── docs/adr/
│       └── …                          ← one folder per bounded context
├── apps/
└── packages/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

<<<<<<< HEAD

## Flag ADR conflictsS

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> # _Contradicts ADR-0001 (débito de estoque na criação do pedido) — but worth reopening because…_

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

<<<<<<< HEAD

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
>
> > > > > > > # ad98396 (chore: mover CLAUDE.md para a raiz e configurar skills de engenharia)
> > > > > > >
> > > > > > > _Contradicts ADR-0001 (débito de estoque na criação do pedido) — but worth reopening because…_
> > > > > > > 5e2bac5 (docs: mapear bounded contexts e linguagem ubiquia)
