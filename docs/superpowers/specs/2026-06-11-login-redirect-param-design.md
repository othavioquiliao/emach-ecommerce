# Login respeita `?redirect=` — Design (#81)

> Fecha a issue #81. Bug de UX: o `proxy.ts` seta `?redirect=<rota-original>` ao barrar
> acesso a rota protegida, mas a página `/login` ignora o param e sempre força `/dashboard`,
> perdendo o destino original.

## Contexto

- **Produtor do param** (já existe, via #80 mergeado) — `apps/web/src/proxy.ts:24`:
  `url.searchParams.set("redirect", req.nextUrl.pathname)`.
- **Consumidor ausente** — `apps/web/src/app/login/page.tsx`. Hoje 4 pontos hardcodam `/dashboard`:
  - L36 — `useEffect` de sessão ativa → `router.replace("/dashboard")`
  - L44 — `handleGoogleSignIn` → `callbackURL: "/dashboard"`
  - L65 — `signInForm.onSuccess` → `router.push("/dashboard")`
  - L107 — `signUpForm.onSuccess` → `router.push("/dashboard")`
- **Pré-requisito satisfeito:** #80 está MERGED; `proxy.ts` já produz o param.

## Decisão de arquitetura — Suspense boundary

`useSearchParams()` no App Router (Next 16.2.0) **exige `<Suspense>` boundary** ou quebra o
build de produção (CSR bailout). O repo já tem um padrão repetido para isso
(`redefinir-senha/page.tsx`, `verificar-email/page.tsx`): conteúdo em `_components/`, a
`page.tsx` é um Server Component fino que envolve em `<Suspense>`.

→ Seguimos esse padrão (Abordagem A). O "~10 linhas / 1 arquivo" da issue subestimava: não
contava com o requisito de Suspense.

## Estrutura final

```
apps/web/src/app/login/
├── page.tsx                ← Server Component: metadata + <Suspense fallback={<LoginFallback/>}><LoginForm/></Suspense>
└── _components/
    └── login-form.tsx      ← "use client": conteúdo atual de LoginPage + lógica de redirect
```

## Unidades

### 1. `sanitizeRedirect(raw: string | null): string`
Função pura, top-level em `login-form.tsx`. Guarda anti-open-redirect (**requisito de
segurança, não opcional**).

```ts
function sanitizeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/dashboard";
  }
  return raw;
}
```

### 2. `LoginForm` (`_components/login-form.tsx`, client)
Recebe o conteúdo integral do `LoginPage` atual, mais:
- `const redirectTo = sanitizeRedirect(useSearchParams().get("redirect"))`
- 4 substituições de `/dashboard` → `redirectTo` (L36 `replace`, L44 `callbackURL`, L65/L107 `push`).
- **typedRoutes:** `router.push(redirectTo as Route)` / `router.replace(redirectTo as Route)`
  com `import type { Route } from "next"`. O `callbackURL` do Google é string pura passada ao
  better-auth → **não** precisa de cast.

### 3. `LoginPage` (`page.tsx`, Server Component)
- `export const metadata` com `title: "Entrar"` (sem `robots noindex` — login é rota pública,
  diferente de reset/verify).
- `LoginFallback` reusa o visual de loading dark existente (`<Loader/>` em `bg-near-black`,
  como o estado `isPending` atual).
- `export default` → `<Suspense fallback={<LoginFallback/>}><LoginForm/></Suspense>`.

## Data flow

`proxy.ts:24` seta `?redirect=<rota>` → `LoginForm` lê via `useSearchParams` →
`sanitizeRedirect` → os 4 destinos consomem `redirectTo`.

## Error handling / segurança

- `sanitizeRedirect` cobre open-redirect: `//evil.com`, `/\evil`, `https://…` e o que não
  começa com `/` caem no fallback `/dashboard`.
- Sem param → `/dashboard` (comportamento atual preservado).

## Testing

Sem infra de teste no repo (CI roda só `check-types`). Validação:
- `bun check` (lint + types — atenção ao typedRoutes).
- Smoke manual do critério de aceite:
  - [ ] Deslogado, `/dashboard/pedidos` → login → cai em `/dashboard/pedidos`.
  - [ ] `?redirect=https://evil.com` e `?redirect=//evil.com` → ignorados → `/dashboard`.
  - [ ] Sem param → `/dashboard`.
  - [ ] `bun check-types` ok.

## Fora de escopo

- Checkbox "Lembrar de mim" (`login/page.tsx` L267) é decorativo (sem state nem efeito).
  Não tocar aqui — candidato a issue futura.
- `proxy.ts` — não tocar (escopo do #80, já mergeado).
