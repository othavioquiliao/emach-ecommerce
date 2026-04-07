# Ferrari Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o design system do emach para a linguagem visual Ferrari, atualizando tokens CSS, tipografia (Barlow + Barlow Condensed), arquitetura chiaroscuro por seções, e documentação.

**Architecture:** Tokens de cor em `globals.css` são a camada central — todos os componentes shadcn já os referenciam. A migração é primariamente token-swap + remoção do dark mode toggle + troca de fontes. Componentes shadcn não precisam de mudanças (já usam `rounded-none` e referenciam tokens).

**Tech Stack:** Tailwind CSS v4, shadcn (base-lyra), Next.js 16, Google Fonts (Barlow, Barlow Condensed), oklch color space.

**Spec:** `docs/superpowers/specs/2026-04-07-ferrari-design-system-design.md`

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `packages/ui/src/styles/globals.css` | Reescrever | Tokens de cor, tipografia, radius |
| `packages/ui/src/components/sonner.tsx` | Modificar | Remover dependência de `next-themes` |
| `packages/ui/package.json` | Modificar | Remover `next-themes` das deps |
| `apps/web/src/app/layout.tsx` | Modificar | Trocar Geist → Barlow, remover suppressHydrationWarning |
| `apps/web/src/components/providers.tsx` | Modificar | Remover ThemeProvider |
| `apps/web/src/components/header.tsx` | Modificar | Remover ModeToggle |
| `apps/web/src/components/mode-toggle.tsx` | Deletar | — |
| `apps/web/src/components/theme-provider.tsx` | Deletar | — |
| `apps/web/package.json` | Modificar | Remover `next-themes` |
| `package.json` (root) | Modificar | Remover `next-themes` do catalog |
| `.claude/CLAUDE.md` | Modificar | Adicionar seção Design System |
| `AGENTS.md` | Modificar | Adicionar seção Design System (idêntico) |

---

### Task 1: Reescrever tokens em globals.css

**Files:**
- Modify: `packages/ui/src/styles/globals.css`

- [ ] **Step 1: Reescrever globals.css com tokens Ferrari**

Substituir o conteúdo completo de `packages/ui/src/styles/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@source "../../../apps/**/*.{ts,tsx}";
@source "../**/*.{ts,tsx}";

@custom-variant dark (&:is(.dark *));

:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.133 0 0);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.133 0 0);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.133 0 0);
	--primary: oklch(0.529 0.194 26);
	--primary-foreground: oklch(1 0 0);
	--secondary: oklch(1 0 0);
	--secondary-foreground: oklch(0 0 0);
	--muted: oklch(0.855 0 0);
	--muted-foreground: oklch(0.443 0 0);
	--accent: oklch(0.529 0.194 26 / 10%);
	--accent-foreground: oklch(0.529 0.194 26);
	--destructive: oklch(0.569 0.2 24);
	--border: oklch(0.831 0 0);
	--input: oklch(0.831 0 0);
	--ring: oklch(0.529 0.194 26);
	--chart-1: oklch(0.529 0.194 26);
	--chart-2: oklch(0.44 0.19 24);
	--chart-3: oklch(0.4 0.18 23);
	--chart-4: oklch(0.93 0.21 110);
	--chart-5: oklch(0.91 0.2 107);
	--radius: 2px;
	--sidebar: oklch(1 0 0);
	--sidebar-foreground: oklch(0.133 0 0);
	--sidebar-primary: oklch(0.529 0.194 26);
	--sidebar-primary-foreground: oklch(1 0 0);
	--sidebar-accent: oklch(0.855 0 0);
	--sidebar-accent-foreground: oklch(0.133 0 0);
	--sidebar-border: oklch(0.831 0 0);
	--sidebar-ring: oklch(0.529 0.194 26);
}

.dark {
	--background: oklch(0.133 0 0);
	--foreground: oklch(1 0 0);
	--card: oklch(0.216 0 0);
	--card-foreground: oklch(1 0 0);
	--popover: oklch(0.216 0 0);
	--popover-foreground: oklch(1 0 0);
	--primary: oklch(0.529 0.194 26);
	--primary-foreground: oklch(1 0 0);
	--secondary: oklch(0.133 0 0);
	--secondary-foreground: oklch(1 0 0);
	--muted: oklch(0.216 0 0);
	--muted-foreground: oklch(0.592 0 0);
	--accent: oklch(0.216 0 0);
	--accent-foreground: oklch(1 0 0);
	--destructive: oklch(0.627 0.179 22);
	--border: oklch(1 0 0 / 10%);
	--input: oklch(1 0 0 / 15%);
	--ring: oklch(0.529 0.194 26);
	--chart-1: oklch(0.529 0.194 26);
	--chart-2: oklch(0.44 0.19 24);
	--chart-3: oklch(0.4 0.18 23);
	--chart-4: oklch(0.93 0.21 110);
	--chart-5: oklch(0.91 0.2 107);
	--sidebar: oklch(0.133 0 0);
	--sidebar-foreground: oklch(1 0 0);
	--sidebar-primary: oklch(0.529 0.194 26);
	--sidebar-primary-foreground: oklch(1 0 0);
	--sidebar-accent: oklch(0.216 0 0);
	--sidebar-accent-foreground: oklch(1 0 0);
	--sidebar-border: oklch(1 0 0 / 10%);
	--sidebar-ring: oklch(0.529 0.194 26);
}

@theme inline {
	--font-sans: var(--font-barlow), sans-serif;
	--font-display: var(--font-barlow-condensed), sans-serif;
	--color-sidebar-ring: var(--sidebar-ring);
	--color-sidebar-border: var(--sidebar-border);
	--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
	--color-sidebar-accent: var(--sidebar-accent);
	--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
	--color-sidebar-primary: var(--sidebar-primary);
	--color-sidebar-foreground: var(--sidebar-foreground);
	--color-sidebar: var(--sidebar);
	--color-chart-5: var(--chart-5);
	--color-chart-4: var(--chart-4);
	--color-chart-3: var(--chart-3);
	--color-chart-2: var(--chart-2);
	--color-chart-1: var(--chart-1);
	--color-ring: var(--ring);
	--color-input: var(--input);
	--color-border: var(--border);
	--color-destructive: var(--destructive);
	--color-accent-foreground: var(--accent-foreground);
	--color-accent: var(--accent);
	--color-muted-foreground: var(--muted-foreground);
	--color-muted: var(--muted);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-secondary: var(--secondary);
	--color-primary-foreground: var(--primary-foreground);
	--color-primary: var(--primary);
	--color-popover-foreground: var(--popover-foreground);
	--color-popover: var(--popover);
	--color-card-foreground: var(--card-foreground);
	--color-card: var(--card);
	--color-foreground: var(--foreground);
	--color-background: var(--background);
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);
	--radius-2xl: calc(var(--radius) + 8px);
	--radius-3xl: calc(var(--radius) + 12px);
	--radius-4xl: calc(var(--radius) + 16px);
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
	body {
		@apply font-sans bg-background text-foreground;
	}
	html {
		@apply font-sans;
	}
}
```

- [ ] **Step 2: Verificar que o CSS é válido**

Run: `bun x ultracite check`
Expected: sem erros de formatting no CSS

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/styles/globals.css
git commit -m "feat: atualizar tokens CSS para design system Ferrari"
```

---

### Task 2: Remover next-themes do sonner.tsx

**Files:**
- Modify: `packages/ui/src/components/sonner.tsx`

- [ ] **Step 1: Reescrever sonner.tsx sem next-themes**

Substituir conteúdo de `packages/ui/src/components/sonner.tsx`:

```tsx
"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			theme="light"
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
```

- [ ] **Step 2: Verificar tipos**

Run: `cd packages/ui && bun run check-types`
Expected: sem erros de tipo

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/sonner.tsx
git commit -m "refactor: remover dependência de next-themes do Toaster"
```

---

### Task 3: Remover next-themes das dependências

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `apps/web/package.json`
- Modify: `package.json` (root)

- [ ] **Step 1: Remover next-themes de packages/ui/package.json**

Em `packages/ui/package.json`, remover a linha:
```
"next-themes": "catalog:",
```
da seção `dependencies`.

- [ ] **Step 2: Remover next-themes de apps/web/package.json**

Em `apps/web/package.json`, remover a linha:
```
"next-themes": "catalog:",
```
da seção `dependencies`.

- [ ] **Step 3: Remover next-themes do catalog no root package.json**

Em `package.json` (root), remover a linha:
```
"next-themes": "^0.4.6",
```
da seção `workspaces.catalog`.

- [ ] **Step 4: Reinstalar dependências**

Run: `bun install`
Expected: lockfile atualizado sem next-themes

- [ ] **Step 5: Commit**

```bash
git add packages/ui/package.json apps/web/package.json package.json bun.lock
git commit -m "chore: remover next-themes das dependências"
```

---

### Task 4: Atualizar layout.tsx — fontes Barlow

**Files:**
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Reescrever layout.tsx com Barlow + Barlow Condensed**

Substituir conteúdo de `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

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

export const metadata: Metadata = {
	title: "emach",
	description: "emach",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body
				className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}
			>
				<Providers>
					<div className="grid h-svh grid-rows-[auto_1fr]">
						<Header />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
```

Mudanças chave:
- `Geist`, `Geist_Mono` → `Barlow`, `Barlow_Condensed`
- `--font-geist-sans`, `--font-geist-mono` → `--font-barlow`, `--font-barlow-condensed`
- Removido `suppressHydrationWarning` (era necessário para next-themes)
- `lang="en"` → `lang="pt-BR"`

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/layout.tsx
git commit -m "feat: trocar fontes Geist por Barlow e Barlow Condensed"
```

---

### Task 5: Remover dark mode toggle — providers, header, deletar arquivos

**Files:**
- Modify: `apps/web/src/components/providers.tsx`
- Modify: `apps/web/src/components/header.tsx`
- Delete: `apps/web/src/components/mode-toggle.tsx`
- Delete: `apps/web/src/components/theme-provider.tsx`

- [ ] **Step 1: Simplificar providers.tsx**

Substituir conteúdo de `apps/web/src/components/providers.tsx`:

```tsx
"use client";

import { Toaster } from "@emach/ui/components/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<Toaster richColors />
		</>
	);
}
```

- [ ] **Step 2: Remover ModeToggle do header.tsx**

Substituir conteúdo de `apps/web/src/components/header.tsx`:

```tsx
"use client";
import Link from "next/link";

import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link href={to} key={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
```

- [ ] **Step 3: Deletar mode-toggle.tsx e theme-provider.tsx**

```bash
rm apps/web/src/components/mode-toggle.tsx
rm apps/web/src/components/theme-provider.tsx
```

- [ ] **Step 4: Verificar tipos e build**

Run: `bun run check-types`
Expected: sem erros — nenhum arquivo restante importa next-themes ou os componentes deletados

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/providers.tsx apps/web/src/components/header.tsx
git rm apps/web/src/components/mode-toggle.tsx apps/web/src/components/theme-provider.tsx
git commit -m "refactor: remover dark mode toggle, adotar chiaroscuro por seções"
```

---

### Task 6: Verificação visual end-to-end

- [ ] **Step 1: Iniciar dev server**

Run: `bun run dev:web`
Expected: app inicia sem erros na porta 3001

- [ ] **Step 2: Verificar no browser**

Abrir `http://localhost:3001` e verificar:
- Fonte Barlow carregada (inspecionar com DevTools → Computed → font-family)
- Cores Ferrari: fundo branco, texto `#181818`, botões e focus rings em vermelho
- Sem toggle de dark mode no header
- Login page (`/login`) renderiza corretamente com novos tokens

- [ ] **Step 3: Testar chiaroscuro**

Temporariamente adicionar `className="dark"` a uma `<section>` em qualquer page para confirmar que os tokens dark (.dark) funcionam — background `#181818`, texto branco, componentes adaptam.

- [ ] **Step 4: Rodar linting**

Run: `bun x ultracite check`
Expected: sem erros

---

### Task 7: Documentar design system no CLAUDE.md e AGENTS.md

**Files:**
- Modify: `.claude/CLAUDE.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Adicionar seção Design System ao CLAUDE.md**

Inserir ANTES da seção "10. Ultracite Code Standards" a seguinte seção:

```markdown
## 10. Design System — Ferrari-Inspired

O projeto segue uma linguagem visual inspirada no site Ferrari. Referência completa em `design/DESIGN.md`.

### Paleta de Cores

| Token | Light (padrão) | Dark (`.dark`) | Papel |
|-------|----------------|----------------|-------|
| `--primary` | `#DA291C` Ferrari Red | `#DA291C` | CTAs de alta prioridade. Usar com parcimônia. |
| `--secondary` | `#FFFFFF` branco | `#181818` | Botão padrão (Configure, etc.) |
| `--background` | `#FFFFFF` | `#181818` Near Black | Superfície base |
| `--foreground` | `#181818` | `#FFFFFF` | Texto principal |
| `--muted` | `#D2D2D2` | `#303030` | Superfícies sutis |
| `--muted-foreground` | `#666666` | `#8F8F8F` | Texto secundário |
| `--destructive` | `#F13A2C` | `#F13A2C` | Warning (distinto do brand red) |
| `--border` | `#CCCCCC` | `rgba(255,255,255,0.1)` | Bordas |
| `--ring` | `#DA291C` | `#DA291C` | Focus ring (Ferrari Red) |

### Tipografia

- **Barlow** (`--font-sans`): Headings, botões, nav, body text. Pesos 400-700.
- **Barlow Condensed** (`--font-display`): Labels, captions, tags. Sempre **uppercase** com `letter-spacing: 1px`.

### Chiaroscuro (Seções Alternadas)

Não há toggle de dark mode global. Seções individuais alternam entre light e dark:

```html
<section>...conteúdo editorial (branco)...</section>
<section class="dark">...conteúdo cinemático (preto)...</section>
```

O `@custom-variant dark (&:is(.dark *))` no Tailwind garante que `dark:` utilities funcionam dentro de qualquer ancestral com `class="dark"`.

### Do's
- Ferrari Red (`--primary`) apenas em CTAs de alta prioridade — sua força vem da parcimônia
- `rounded-none` em todos os componentes — "razor precision"
- Barlow Condensed apenas para labels/tags em uppercase
- Cada seção da página deve ser uma "vinheta" com um foco claro

### Don'ts
- Não espalhe Ferrari Red como decoração — é sinal de CTA, não cor de tema
- Não use border-radius arredondados (exceto modais: até 8px)
- Não adicione box-shadows em cards — profundidade vem do contraste de superfícies
- Não misture Barlow e Barlow Condensed no mesmo bloco de texto
```

- [ ] **Step 2: Renumerar a seção Ultracite para "11."**

A seção que antes era "10. Ultracite Code Standards" passa a ser "11. Ultracite Code Standards".

- [ ] **Step 3: Copiar conteúdo idêntico para AGENTS.md**

O `AGENTS.md` deve receber exatamente as mesmas mudanças.

- [ ] **Step 4: Commit**

```bash
git add .claude/CLAUDE.md AGENTS.md
git commit -m "docs: documentar design system Ferrari no CLAUDE.md e AGENTS.md"
```
