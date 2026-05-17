# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **multi-context** (a Turborepo monorepo): one app (`apps/web`) and several packages (`packages/db`, `packages/auth`, `packages/email`, `packages/env`, `packages/ui`, `packages/config`).

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- The per-context **`CONTEXT.md`** under `apps/<app>/` or `packages/<pkg>/`.
- **`docs/adr/`** at the root — monorepo-wide architectural decisions. Also check `apps/<app>/docs/adr/` and `packages/<pkg>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

> Note: today the architectural documentation is centralised in `CLAUDE.md`, `DESIGN.md`, and `packages/db/CLAUDE.md`. `CONTEXT.md`/`CONTEXT-MAP.md`/`docs/adr/` files don't exist yet — they will be created lazily by `/grill-with-docs` as the domain glossary and decisions get pinned down.

## File structure

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md                     ← points to each context's CONTEXT.md
├── CLAUDE.md                          ← canonical project guide (architecture, invariants)
├── DESIGN.md                          ← design system tokens + principles
├── docs/
│   ├── adr/                           ← monorepo-wide decisions
│   └── agents/                        ← this skill's config (issue-tracker, triage, domain)
├── apps/
│   └── web/
│       ├── CONTEXT.md
│       └── docs/adr/                  ← web-specific decisions
└── packages/
    ├── db/
    │   ├── CONTEXT.md
    │   └── docs/adr/
    └── auth/
        ├── CONTEXT.md
        └── docs/adr/
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

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
>
> > > > > > > ad98396 (chore: mover CLAUDE.md para a raiz e configurar skills de engenharia)
