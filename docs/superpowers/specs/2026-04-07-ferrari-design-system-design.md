# Design Spec: Ferrari-Inspired Design System

> Migração do design system do emach para seguir a linguagem visual Ferrari documentada em `design/DESIGN.md`.

## Decisões

| Decisão | Escolha |
|---------|---------|
| Fonte primária | **Barlow** (substitui Inter Variable) |
| Fonte de labels | **Barlow Condensed** (uppercase + letter-spacing 1px) |
| Dark mode | **Chiaroscuro por seções** (sem toggle global) |
| Border radius | **rounded-none** nos componentes, `--radius: 2px` no token |
| Background dark | **#181818** (Near Black, não preto absoluto) |
| Primary color | **#DA291C** (Ferrari Red) |

---

## 1. Paleta de Cores — Light (`:root`)

Seções brancas editoriais. O padrão.

| Token | Valor | Hex | Papel |
|-------|-------|-----|-------|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | Superfície branca editorial |
| `--foreground` | `oklch(0.133 0 0)` | `#181818` | Texto primário (Near Black) |
| `--primary` | `oklch(0.529 0.194 26)` | `#DA291C` | Ferrari Red — CTAs de alta prioridade |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto sobre Ferrari Red |
| `--secondary` | `oklch(1 0 0)` | `#FFFFFF` | Botão branco padrão (Configure) |
| `--secondary-foreground` | `oklch(0 0 0)` | `#000000` | Texto preto sobre botão branco |
| `--muted` | `oklch(0.855 0 0)` | `#D2D2D2` | Superfície sutil, dividers |
| `--muted-foreground` | `oklch(0.443 0 0)` | `#666666` | Texto secundário (Dark Gray) |
| `--accent` | `oklch(0.529 0.194 26 / 10%)` | `#DA291C/10%` | Hover sutil com toque vermelho |
| `--accent-foreground` | `oklch(0.529 0.194 26)` | `#DA291C` | Texto sobre accent |
| `--destructive` | `oklch(0.569 0.2 24)` | `#F13A2C` | Warning Red (distinto do brand red) |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Background de cards |
| `--card-foreground` | `oklch(0.133 0 0)` | `#181818` | Texto de cards |
| `--popover` | `oklch(1 0 0)` | `#FFFFFF` | Background de popovers |
| `--popover-foreground` | `oklch(0.133 0 0)` | `#181818` | Texto de popovers |
| `--border` | `oklch(0.831 0 0)` | `#CCCCCC` | Bordas (Border Gray) |
| `--input` | `oklch(0.831 0 0)` | `#CCCCCC` | Bordas de inputs |
| `--ring` | `oklch(0.529 0.194 26)` | `#DA291C` | Focus ring (Ferrari Red) |

### Chart Colors

| Token | Hex | Papel |
|-------|-----|-------|
| `--chart-1` | `#DA291C` | Ferrari Red |
| `--chart-2` | `#B01E0A` | Dark Red |
| `--chart-3` | `#9D2211` | Deep Red |
| `--chart-4` | `#FFF200` | Racing Yellow |
| `--chart-5` | `#F6E500` | Modena Yellow |

---

## 2. Paleta de Cores — Dark (`.dark`)

Seções pretas cinemáticas. Aplicado via `class="dark"` em `<section>` individuais.

| Token | Valor | Hex | Papel |
|-------|-------|-----|-------|
| `--background` | `oklch(0.133 0 0)` | `#181818` | Near Black (ajuste do usuário) |
| `--foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto branco |
| `--primary` | `oklch(0.529 0.194 26)` | `#DA291C` | Ferrari Red (mesmo em dark) |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto sobre Ferrari Red |
| `--secondary` | `oklch(0.133 0 0)` | `#181818` | Superfície dark para botões |
| `--secondary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto branco sobre secondary |
| `--muted` | `oklch(0.216 0 0)` | `#303030` | Dark Surface (footer, panels) |
| `--muted-foreground` | `oklch(0.592 0 0)` | `#8F8F8F` | Mid Gray |
| `--accent` | `oklch(0.216 0 0)` | `#303030` | Hover em seções dark |
| `--accent-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto sobre accent |
| `--destructive` | `oklch(0.627 0.179 22)` | `#F13A2C` | Warning Red (ajustado para dark) |
| `--card` | `oklch(0.216 0 0)` | `#303030` | Cards sobre fundo dark |
| `--card-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto de cards |
| `--popover` | `oklch(0.216 0 0)` | `#303030` | Popovers em contexto dark |
| `--popover-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Texto de popovers |
| `--border` | `oklch(1 0 0 / 10%)` | `rgba(255,255,255,0.1)` | Bordas sutis sobre dark |
| `--input` | `oklch(1 0 0 / 15%)` | `rgba(255,255,255,0.15)` | Bordas de inputs |
| `--ring` | `oklch(0.529 0.194 26)` | `#DA291C` | Focus ring |

---

## 3. Tipografia

### Fontes

| Token CSS | Fonte | Papel |
|-----------|-------|-------|
| `--font-sans` | `"Barlow", sans-serif` | Headings, botões, nav, body text |
| `--font-display` (novo) | `"Barlow Condensed", sans-serif` | Labels, captions, tags — sempre uppercase com `letter-spacing: 1px` |

### Carregamento

Ambas as fontes vêm de Google Fonts via `next/font/google` (self-hosted, sem external requests):

```ts
import { Barlow, Barlow_Condensed } from "next/font/google";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow-condensed",
});
```

### Escala Tipográfica (referência do DESIGN.md)

| Papel | Size | Weight | Letter Spacing |
|-------|------|--------|----------------|
| Section Title | 26px | 500 | normal |
| Card Heading | 24px | 400 | normal |
| Subheading | 18px | 700 | normal |
| UI Heading | 16px | 500 | 0.08px |
| Button Label | 16px | 400 | 1.28px |
| Nav Link | 13px | 600 | 0.13px |
| Caption | 13px | 400 | 0.195px |
| Label (Barlow Condensed) | 12px | 400 | 1px |
| Micro Label (Barlow Condensed) | 11px | 400 | 1px |

---

## 4. Border Radius

| Token | Valor |
|-------|-------|
| `--radius` | `2px` |

Componentes shadcn continuam usando `rounded-none` hardcoded. O token existe como fallback mas os componentes não o referenciam — isso é intencional e fiel ao "razor precision" Ferrari.

Escala derivada:
- `--radius-sm`: `calc(2px - 4px)` → efetivamente 0
- `--radius-md`: `calc(2px - 2px)` → 0
- `--radius-lg`: `2px`
- `--radius-xl`: `6px` (para modais/dialogs, que o DESIGN.md permite até 8px)

---

## 5. Arquitetura Chiaroscuro

### Antes (toggle global)

```
<html class="dark">     ← next-themes controla
  <body>
    <Header />
    <main>{children}</main>
  </body>
</html>
```

### Depois (seções alternadas)

```
<html>                    ← sempre sem classe
  <body>
    <Header />            ← seção dark (nav sobre preto)
    <section>             ← light por padrão
      ...conteúdo editorial...
    </section>
    <section class="dark"> ← cinemático
      ...hero com imagem...
    </section>
    <section>
      ...mais conteúdo editorial...
    </section>
  </body>
</html>
```

### Mecanismo CSS

O `globals.css` já tem `@custom-variant dark (&:is(.dark *))` — isso faz o Tailwind gerar classes `dark:bg-*` que funcionam quando qualquer ancestral tem `class="dark"`. Não precisa mudar nada no Tailwind.

### Componentes removidos

- `apps/web/src/components/mode-toggle.tsx` — deletar
- `apps/web/src/components/theme-provider.tsx` — deletar
- Remover `ThemeProvider` de `apps/web/src/components/providers.tsx`
- Remover `next-themes` das dependências
- Atualizar `apps/web/src/components/header.tsx` — remover `<ModeToggle />`

### Componente Toaster (sonner)

O `Toaster` em `packages/ui/src/components/sonner.tsx` atualmente importa `useTheme()` do `next-themes`. Solução: remover o import de `next-themes`, setar `theme="light"` fixo no componente `<Toaster>`. Toasts sempre aparecem no contexto global (top-level), que é light por padrão.

---

## 6. Sidebar Tokens

O DESIGN.md não menciona sidebar. Os tokens de sidebar seguem a mesma lógica:

| Token | Light | Dark |
|-------|-------|------|
| `--sidebar` | `#FFFFFF` | `#181818` |
| `--sidebar-foreground` | `#181818` | `#FFFFFF` |
| `--sidebar-primary` | `#DA291C` | `#DA291C` |
| `--sidebar-primary-foreground` | `#FFFFFF` | `#FFFFFF` |
| `--sidebar-accent` | `#D2D2D2` | `#303030` |
| `--sidebar-accent-foreground` | `#181818` | `#FFFFFF` |
| `--sidebar-border` | `#CCCCCC` | `rgba(255,255,255,0.1)` |
| `--sidebar-ring` | `#DA291C` | `#DA291C` |

---

## 7. Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `packages/ui/src/styles/globals.css` | Reescrever tokens de cor, tipografia, radius |
| `apps/web/src/app/layout.tsx` | Trocar fontes (Geist → Barlow), remover ThemeProvider |
| `apps/web/src/components/providers.tsx` | Remover ThemeProvider, simplificar Toaster |
| `apps/web/src/components/mode-toggle.tsx` | **Deletar** |
| `apps/web/src/components/theme-provider.tsx` | **Deletar** |
| `apps/web/src/components/header.tsx` | Remover ModeToggle do header |
| `packages/ui/src/components/sonner.tsx` | Remover `useTheme()`, setar `theme="light"` fixo |
| `apps/web/package.json` | Remover `next-themes` |
| `.claude/CLAUDE.md` + `AGENTS.md` | Documentar design system Ferrari |

---

## 8. Documentação a Adicionar

Adicionar uma seção **Design System** no CLAUDE.md e AGENTS.md com:

- Paleta de cores e quando usar cada token
- Regras de tipografia (Barlow vs Barlow Condensed)
- Como funciona o chiaroscuro (quando usar `.dark`)
- Referência ao `design/DESIGN.md` para detalhes visuais completos
- Do's and Don'ts resumidos do Ferrari design

---

## 9. Verificação

1. `bun run dev:web` — confirmar que a app renderiza sem erros
2. Inspeção visual — verificar cores, fontes e botões no browser
3. `bun run check-types` — confirmar que a remoção do next-themes não quebra tipos
4. `bun x ultracite check` — confirmar formatting
5. Testar componentes shadcn existentes em contexto light e dark (colocar `.dark` em uma seção)
