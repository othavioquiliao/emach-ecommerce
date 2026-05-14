# Devoluções e Reembolso — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/dashboard/devolucoes` (listagem com abas Em andamento / Finalizado), espelhando o padrão visual de `/dashboard/pedidos`, e injetar um bloco compartilhado de "Reembolso" na página `/dashboard/pedidos/[id]` quando o pedido tem devolução vinculada.

**Architecture:** Toda a feature é client-side + mock data — sem schema novo no banco. Tipos novos em `dashboard/_lib/types.ts`, mocks em `dashboard/_lib/mock-refunds.ts`, página + componentes em `dashboard/devolucoes/`. O componente compartilhado `<OrderRefundBlock>` mora em `dashboard/pedidos/[id]/_components/` (o pedido é o "dono" do reembolso) e é importado tanto pelo card de devolução quanto pela página do pedido.

**Tech Stack:** Next.js 16 (App Router, Server Components default), React 19, Tailwind v4, `@emach/ui` (shadcn base-lyra), `<Tabs variant="line">` do shadcn, `lucide-react` para ícones, sem testes automatizados (validação é via `bun run check-types` + smoke em `bun run dev:web`).

**Spec source of truth:** `docs/superpowers/specs/2026-05-12-devolucoes-reembolso-design.md`

---

## File Map

**Files to create:**
- `apps/web/src/app/dashboard/_lib/mock-refunds.ts` — mock data + helpers `getRefundsByTab`, `getRefundCounts`
- `apps/web/src/app/dashboard/devolucoes/page.tsx` — entry da rota
- `apps/web/src/app/dashboard/devolucoes/_components/refunds-tabs.tsx` — Tabs (open/closed) com counts
- `apps/web/src/app/dashboard/devolucoes/_components/refund-card.tsx` — card de devolução
- `apps/web/src/app/dashboard/devolucoes/_components/refund-status-badge.tsx` — badge por status
- `apps/web/src/app/dashboard/devolucoes/_components/refunds-empty-state.tsx` — vazio por aba
- `apps/web/src/app/dashboard/pedidos/[id]/_components/order-refund-block.tsx` — bloco compartilhado

**Files to modify:**
- `apps/web/src/app/dashboard/_lib/types.ts` — adicionar tipos de refund + `refund?: Refund` em `OrderDetail`
- `apps/web/src/app/dashboard/_lib/mock-order-detail.ts` — popular `.refund` em pelo menos 1 pedido
- `apps/web/src/app/dashboard/_components/dashboard-sidebar.tsx` — converter "Reembolso e devoluções" de `kind:"soon"` para `kind:"link"`
- `apps/web/src/app/dashboard/pedidos/[id]/page.tsx` — renderizar `<OrderRefundBlock variant="page" />` quando `detail.refund` existe

---

## Task 1: Adicionar tipos de Refund em `_lib/types.ts`

**Files:**
- Modify: `apps/web/src/app/dashboard/_lib/types.ts`

- [ ] **Step 1: Abrir e ler tipos atuais**

Confirmar que o arquivo tem `OrderItem`, `OrderDetail`, `ORDER_STATUS_LABEL`, etc. Os tipos novos vão no fim do arquivo, antes de qualquer linha de export final.

- [ ] **Step 2: Adicionar bloco de tipos de Refund no final de `types.ts`**

Cole exatamente o seguinte ao final do arquivo:

```ts
export type RefundStatus =
	| "solicitado"
	| "em_analise"
	| "reembolsado"
	| "recusado";

export type RefundTab = "open" | "closed";

export type RefundMethod = "pix" | "credit_card" | "boleto" | "store_credit";

export interface RefundResolution {
	deniedReason?: string;
	etaLabel?: string;
	method?: RefundMethod;
	refundedAt?: Date;
}

export interface Refund {
	amountCents: number;
	createdAt: Date;
	id: string;
	items: OrderItem[];
	orderId: string;
	reason: string;
	resolution?: RefundResolution;
	status: RefundStatus;
}

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
	solicitado: "Solicitado",
	em_analise: "Em análise",
	reembolsado: "Reembolsado",
	recusado: "Recusado",
};

export const REFUND_TAB_LABEL: Record<RefundTab, string> = {
	open: "Em andamento",
	closed: "Finalizado",
};

export const REFUND_TABS: readonly RefundTab[] = ["open", "closed"] as const;

export const REFUND_STATUS_BY_TAB: Record<RefundTab, readonly RefundStatus[]> =
	{
		open: ["solicitado", "em_analise"],
		closed: ["reembolsado", "recusado"],
	};

export const REFUND_METHOD_LABEL: Record<RefundMethod, string> = {
	pix: "Pix",
	credit_card: "Cartão de crédito",
	boleto: "Boleto bancário",
	store_credit: "Crédito na loja",
};
```

- [ ] **Step 3: Estender `OrderDetail` com `refund?`**

Na interface `OrderDetail` que já existe, adicionar uma linha:

```ts
export interface OrderDetail extends Order {
	address: ShippingAddress;
	breakdown: OrderBreakdown;
	buyer: BuyerSnapshot;
	cancelledAt?: Date;
	deliveredAt?: Date;
	paidAt?: Date;
	payment: PaymentInfo;
	refund?: Refund; // ← NOVO
	shippedAt?: Date;
	tracking?: OrderTracking;
}
```

- [ ] **Step 4: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros (tipos novos não estão sendo consumidos ainda).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/dashboard/_lib/types.ts
git commit -m "feat(dashboard): adicionar tipos de Refund e estender OrderDetail"
```

---

## Task 2: Criar `mock-refunds.ts` com 5 cenários

**Files:**
- Create: `apps/web/src/app/dashboard/_lib/mock-refunds.ts`

IDs de pedido reais já presentes em `mock-orders.ts` que vamos referenciar: `EMACH-2026-0410-7B22` (completed), `EMACH-2026-0402-22A1` (completed), `EMACH-2026-0325-4811` (completed), `EMACH-2026-0228-50D9` (completed), `EMACH-2026-0205-C12B` (cancelled). Não adicionar pedidos novos.

- [ ] **Step 1: Criar o arquivo com mocks**

Crie `apps/web/src/app/dashboard/_lib/mock-refunds.ts` com o conteúdo abaixo:

```ts
import {
	type Refund,
	REFUND_STATUS_BY_TAB,
	type RefundTab,
} from "./types";

export const mockRefunds: Refund[] = [
	{
		id: "DEV-2026-00128",
		orderId: "EMACH-2026-0410-7B22",
		createdAt: new Date("2026-05-10T10:12:00"),
		status: "solicitado",
		reason: "Produto chegou com defeito (botão de reversão travado).",
		amountCents: 74_900,
		items: [
			{
				id: "i-1",
				name: "Furadeira de Impacto Profissional 850W",
				variant: "220V · Mandril 13mm",
				quantity: 1,
				unitPriceCents: 74_900,
				categorySlug: "eletricas",
			},
		],
	},
	{
		id: "DEV-2026-00121",
		orderId: "EMACH-2026-0402-22A1",
		createdAt: new Date("2026-05-04T15:30:00"),
		status: "em_analise",
		reason: "Recebi o tamanho errado (10-22mm em vez de 8-22mm).",
		amountCents: 35_800,
		items: [
			{
				id: "i-1",
				name: "Jogo de Chaves Combinadas 8-22mm (12 peças)",
				variant: "Aço cromo-vanádio",
				quantity: 2,
				unitPriceCents: 17_900,
				categorySlug: "manuais",
			},
		],
	},
	{
		id: "DEV-2026-00115",
		orderId: "EMACH-2026-0325-4811",
		createdAt: new Date("2026-04-28T09:48:00"),
		status: "solicitado",
		reason: "Comprei na voltagem errada, preciso devolver os dois itens.",
		amountCents: 35_890,
		items: [
			{
				id: "i-1",
				name: "Trena Digital a Laser 40m",
				variant: "Bivolt · IP54",
				quantity: 1,
				unitPriceCents: 28_900,
				categorySlug: "medicao",
			},
			{
				id: "i-2",
				name: 'Disco de Corte para Metal 4.1/2" (10 unidades)',
				variant: "115mm × 1.6mm",
				quantity: 1,
				unitPriceCents: 6990,
				categorySlug: "acessorios",
			},
		],
	},
	{
		id: "DEV-2026-00098",
		orderId: "EMACH-2026-0228-50D9",
		createdAt: new Date("2026-04-12T11:00:00"),
		status: "reembolsado",
		reason: "Produto chegou riscado e com a embalagem violada.",
		amountCents: 45_900,
		items: [
			{
				id: "i-1",
				name: 'Esmerilhadeira Angular 720W 4.1/2"',
				variant: "220V",
				quantity: 1,
				unitPriceCents: 45_900,
				categorySlug: "eletricas",
			},
		],
		resolution: {
			refundedAt: new Date("2026-04-22T09:15:00"),
			method: "pix",
			etaLabel: "1-2 dias úteis",
		},
	},
	{
		id: "DEV-2026-00076",
		orderId: "EMACH-2026-0205-C12B",
		createdAt: new Date("2026-03-28T16:20:00"),
		status: "recusado",
		reason: "Não gostei do peso, queria mais leve.",
		amountCents: 13_200,
		items: [
			{
				id: "i-1",
				name: 'Alicate Universal 8"',
				variant: "Cabo isolado",
				quantity: 3,
				unitPriceCents: 4400,
				categorySlug: "manuais",
			},
		],
		resolution: {
			deniedReason:
				"Solicitação fora do prazo de arrependimento (7 dias) e produto sem defeito.",
		},
	},
];

export function getRefundsByTab(tab: RefundTab): Refund[] {
	const allowed = REFUND_STATUS_BY_TAB[tab];
	return mockRefunds.filter((r) => allowed.includes(r.status));
}

export function getRefundCounts(): Record<RefundTab, number> {
	const counts: Record<RefundTab, number> = { open: 0, closed: 0 };
	for (const refund of mockRefunds) {
		if (REFUND_STATUS_BY_TAB.open.includes(refund.status)) {
			counts.open += 1;
		} else if (REFUND_STATUS_BY_TAB.closed.includes(refund.status)) {
			counts.closed += 1;
		}
	}
	return counts;
}

export function getRefundById(id: string): Refund | undefined {
	return mockRefunds.find((r) => r.id === id);
}

export function getRefundByOrderId(orderId: string): Refund | undefined {
	return mockRefunds.find((r) => r.orderId === orderId);
}

```

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Verificar lint**

Run: `bun run check`
Expected: zero erros. Se reclamar das linhas `_UNUSED_REFUND_STATUS`, removê-las e rodar de novo.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/dashboard/_lib/mock-refunds.ts
git commit -m "feat(dashboard): mock data de devoluções com 5 cenários"
```

---

## Task 3: Popular `OrderDetail.refund` em `mock-order-detail.ts`

**Files:**
- Modify: `apps/web/src/app/dashboard/_lib/mock-order-detail.ts`

- [ ] **Step 1: Importar `mockRefunds` no topo**

Localize a seção de imports e adicione:

```ts
import { mockRefunds } from "./mock-refunds";
```

- [ ] **Step 2: Alterar `getOrderDetail` para injetar `.refund`**

Substitua a função `getOrderDetail` no final do arquivo por:

```ts
export function getOrderDetail(id: string): OrderDetail | undefined {
	const detail = mockOrderDetails[id];
	if (!detail) {
		return undefined;
	}
	const refund = mockRefunds.find((r) => r.orderId === id);
	return refund ? { ...detail, refund } : detail;
}
```

Isso evita ter que sincronizar manualmente cada `mockOrderDetails[id]` quando adicionarmos devoluções — o cruzamento acontece em runtime.

- [ ] **Step 3: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/dashboard/_lib/mock-order-detail.ts
git commit -m "feat(dashboard): cruzar OrderDetail com Refund pelo orderId"
```

---

## Task 4: Criar `RefundStatusBadge`

**Files:**
- Create: `apps/web/src/app/dashboard/devolucoes/_components/refund-status-badge.tsx`

Espelha 1:1 o shape do `OrderStatusBadge` (mesmo padding, mesma tipografia, single `<span>` com border + text color — sem dot, sem background, exceto o caso `recusado` que ganha `bg-gray-10` igual ao `cancelled` de pedido).

- [ ] **Step 1: Criar o arquivo**

```tsx
import { cn } from "@emach/ui/lib/utils";
import { REFUND_STATUS_LABEL, type RefundStatus } from "../../_lib/types";

const VARIANT: Record<RefundStatus, string> = {
	solicitado: "text-link-hover border-link-hover",
	em_analise: "text-[#B45309] border-[#B45309]",
	reembolsado: "text-success border-success",
	recusado: "text-gray-50 border-border bg-gray-10",
};

interface RefundStatusBadgeProps {
	className?: string;
	status: RefundStatus;
}

export function RefundStatusBadge({
	status,
	className,
}: RefundStatusBadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center border px-2.5 py-1 font-display font-semibold text-[10px] uppercase tracking-[0.14em]",
				VARIANT[status],
				className
			)}
		>
			{REFUND_STATUS_LABEL[status]}
		</span>
	);
}
```

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/devolucoes/_components/refund-status-badge.tsx
git commit -m "feat(devolucoes): badge de status com paleta blue/amber/green/gray"
```

---

## Task 5: Criar `RefundsEmptyState`

**Files:**
- Create: `apps/web/src/app/dashboard/devolucoes/_components/refunds-empty-state.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
import { RotateCcw } from "lucide-react";

interface RefundsEmptyStateProps {
	tabLabel: string;
}

export function RefundsEmptyState({ tabLabel }: RefundsEmptyStateProps) {
	const text = `Você não tem devoluções em "${tabLabel}".`;
	return (
		<div className="flex flex-col items-center justify-center border border-border bg-white px-6 py-16 text-center">
			<RotateCcw className="mb-4 h-12 w-12 text-gray-50" strokeWidth={1.2} />
			<p className="mb-2 text-[14px] text-gray-60">{text}</p>
			<p className="text-[12px] text-gray-50">
				Para solicitar, abra o pedido em "Pedidos" e clique em "Solicitar
				devolução".
			</p>
		</div>
	);
}
```

Sem CTA primária — o caminho para solicitar nasce em `/dashboard/pedidos/[id]`, conforme spec §9.

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/devolucoes/_components/refunds-empty-state.tsx
git commit -m "feat(devolucoes): empty state por aba"
```

---

## Task 6: Criar `OrderRefundBlock` (componente compartilhado)

**Files:**
- Create: `apps/web/src/app/dashboard/pedidos/[id]/_components/order-refund-block.tsx`

Espelha o estilo de `SectionBlock` (mesmo border, header gray-10, font display uppercase) mas internamente comuta entre 3 estados:
- `open` (solicitado / em_analise) → bloco neutro de aviso
- `reembolsado` → bloco com fundo `bg-[#fafafa]` mostrando data + método + prazo
- `recusado` → bloco com fundo `bg-[#FFF5F5]` mostrando justificativa

- [ ] **Step 1: Criar o arquivo**

```tsx
import { cn } from "@emach/ui/lib/utils";
import {
	type Refund,
	REFUND_METHOD_LABEL,
	REFUND_STATUS_BY_TAB,
} from "../../../_lib/types";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

interface OrderRefundBlockProps {
	refund: Refund;
	variant?: "card" | "page";
}

export function OrderRefundBlock({
	refund,
	variant = "card",
}: OrderRefundBlockProps) {
	const isOpen = REFUND_STATUS_BY_TAB.open.includes(refund.status);
	const isReembolsado = refund.status === "reembolsado";
	const isRecusado = refund.status === "recusado";

	if (isOpen) {
		return (
			<Row
				label="Devolução"
				variant={variant}
				bg="bg-white"
				text={`Em andamento · #${refund.id}`}
			/>
		);
	}

	if (isReembolsado) {
		const r = refund.resolution;
		const date = r?.refundedAt ? DATE_FMT.format(r.refundedAt) : "—";
		const method = r?.method ? REFUND_METHOD_LABEL[r.method] : "—";
		const eta = r?.etaLabel ? ` · ${r.etaLabel}` : "";
		return (
			<Row
				label="Reembolso"
				variant={variant}
				bg="bg-[#fafafa]"
				text={
					<>
						Estornado em <strong className="text-near-black">{date}</strong> ·{" "}
						{method}
						{eta}
					</>
				}
			/>
		);
	}

	if (isRecusado) {
		return (
			<Row
				label="Decisão"
				variant={variant}
				bg="bg-[#FFF5F5]"
				text={refund.resolution?.deniedReason ?? "Solicitação recusada."}
			/>
		);
	}

	return null;
}

function Row({
	label,
	text,
	bg,
	variant,
}: {
	bg: string;
	label: string;
	text: React.ReactNode;
	variant: "card" | "page";
}) {
	const padding = variant === "page" ? "px-[18px] py-4" : "px-[18px] py-3";
	return (
		<div
			className={cn(
				"flex flex-wrap items-baseline gap-x-6 gap-y-1 border-border border-t",
				bg,
				padding
			)}
		>
			<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
				{label}
			</span>
			<span className="text-[13px] text-gray-60 leading-relaxed">{text}</span>
		</div>
	);
}
```

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/pedidos/\[id\]/_components/order-refund-block.tsx
git commit -m "feat(pedidos): OrderRefundBlock compartilhado"
```

---

## Task 7: Criar `RefundCard`

**Files:**
- Create: `apps/web/src/app/dashboard/devolucoes/_components/refund-card.tsx`

Espelha estrutura do `OrderCard` (header gray-10 com meta-pairs, lista de itens com thumbs, total no rodapé, footer de ações), com diferenças:
- Meta-pair extra `Pedido #...`
- Bloco "Motivo" entre itens e total
- Bloco "Reembolso/Decisão" via `<OrderRefundBlock variant="card" />`
- Total renomeado para `A reembolsar` / `Valor solicitado` (status-dependent)
- Ações: `[Cancelar solicitação]` apenas em `solicitado`; sempre `[Ver detalhes]` → `/dashboard/pedidos/[orderId]`

- [ ] **Step 1: Criar o arquivo**

```tsx
"use client";

import { cn } from "@emach/ui/lib/utils";
import { Disc3, Drill, Ruler, Shield, Wrench } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { toast } from "sonner";
import { EmachButton, emachButtonVariants } from "@/components/emach-button";
import { fmtBRL } from "@/lib/format";
import type { CategorySlug, Refund } from "../../_lib/types";
import { OrderRefundBlock } from "../../pedidos/[id]/_components/order-refund-block";
import { RefundStatusBadge } from "./refund-status-badge";

const CATEGORY_ICONS: Record<CategorySlug, React.ElementType> = {
	eletricas: Drill,
	manuais: Wrench,
	medicao: Ruler,
	seguranca: Shield,
	acessorios: Disc3,
};

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

function MetaPair({ label, value }: { label: string; value: string }) {
	return (
		<>
			<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
				{label}
			</span>
			<span className="font-semibold text-[12px] text-near-black">{value}</span>
		</>
	);
}

function ItemThumb({ categorySlug }: { categorySlug: CategorySlug }) {
	const Icon = CATEGORY_ICONS[categorySlug];
	return (
		<div className="emach-bg-placeholder flex h-16 w-16 shrink-0 items-center justify-center">
			<Icon className="h-8 w-8 text-cinema-2 opacity-80" strokeWidth={1.2} />
		</div>
	);
}

interface RefundCardProps {
	refund: Refund;
}

export function RefundCard({ refund }: RefundCardProps) {
	const detailsHref = `/dashboard/pedidos/${refund.orderId}` as Route;
	const isRefunded = refund.status === "reembolsado";
	const isDenied = refund.status === "recusado";

	const totalLabel = isDenied ? "Valor solicitado" : "A reembolsar";
	const totalClass = cn(
		"font-bold text-[18px]",
		isRefunded && "text-success",
		isDenied && "text-gray-60 line-through"
	);

	return (
		<article
			className={cn(
				"mb-3.5 border border-border bg-white",
				isDenied && "opacity-85"
			)}
		>
			<header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-border border-b bg-gray-10 px-[18px] py-3">
				<MetaPair label="Devolução" value={`#${refund.id}`} />
				<MetaPair label="Pedido" value={`#${refund.orderId}`} />
				<MetaPair
					label="Solicitada em"
					value={DATE_FMT.format(refund.createdAt)}
				/>
				<div className="flex-1" />
				<RefundStatusBadge status={refund.status} />
			</header>

			<div>
				{refund.items.map((item, idx) => (
					<div
						className={cn(
							"flex items-center gap-3.5 px-[18px] py-3.5",
							idx > 0 && "border-border/50 border-t"
						)}
						key={item.id}
					>
						<ItemThumb categorySlug={item.categorySlug} />
						<div className="min-w-0 flex-1">
							<div className="truncate font-semibold text-[13px] text-near-black">
								{item.name}
							</div>
							{item.variant ? (
								<div className="text-[11px] text-gray-60">{item.variant}</div>
							) : null}
							<div className="mt-0.5 text-[11px] text-gray-50">
								Quantidade: {item.quantity}
							</div>
						</div>
						<div className="min-w-[90px] text-right font-semibold text-[13px] text-near-black">
							{fmtBRL(item.unitPriceCents * item.quantity)}
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-border border-t bg-white px-[18px] py-3">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					Motivo
				</span>
				<span className="text-[13px] text-gray-60 leading-relaxed">
					{refund.reason}
				</span>
			</div>

			<OrderRefundBlock refund={refund} variant="card" />

			<div className="flex items-center justify-between border-border border-t bg-[#fafafa] px-[18px] py-3.5">
				<span className="font-display font-semibold text-[11px] text-gray-60 uppercase tracking-[0.14em]">
					{totalLabel}
				</span>
				<span className={totalClass}>{fmtBRL(refund.amountCents)}</span>
			</div>

			<footer className="flex justify-end gap-2 border-border border-t bg-white px-[18px] py-2.5">
				{refund.status === "solicitado" ? (
					<EmachButton
						onClick={() => toast.info("Cancelar solicitação: em breve")}
						size="sm"
						variant="ghost"
					>
						Cancelar solicitação
					</EmachButton>
				) : null}
				<Link
					className={cn(emachButtonVariants({ variant: "outline", size: "sm" }))}
					href={detailsHref}
				>
					Ver detalhes
				</Link>
			</footer>
		</article>
	);
}
```

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/devolucoes/_components/refund-card.tsx
git commit -m "feat(devolucoes): RefundCard espelhando OrderCard"
```

---

## Task 8: Criar `RefundsTabs`

**Files:**
- Create: `apps/web/src/app/dashboard/devolucoes/_components/refunds-tabs.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@emach/ui/components/tabs";
import { getRefundCounts, getRefundsByTab } from "../../_lib/mock-refunds";
import { REFUND_TAB_LABEL, REFUND_TABS, type RefundTab } from "../../_lib/types";
import { RefundCard } from "./refund-card";
import { RefundsEmptyState } from "./refunds-empty-state";

export function RefundsTabs() {
	const counts = getRefundCounts();

	return (
		<Tabs defaultValue="open">
			<TabsList variant="line">
				{REFUND_TABS.map((tab) => (
					<TabsTrigger
						className="h-auto flex-1 border-none px-0 py-3.5 font-semibold text-[13px]/[14px] data-active:text-near-black"
						key={tab}
						value={tab}
					>
						<span>{REFUND_TAB_LABEL[tab]}</span>
						<span className="ml-1.5 font-normal text-gray-50">
							{counts[tab]}
						</span>
					</TabsTrigger>
				))}
			</TabsList>

			{REFUND_TABS.map((tab) => (
				<TabsContent className="mt-6" key={tab} value={tab}>
					<RefundsList tab={tab} />
				</TabsContent>
			))}
		</Tabs>
	);
}

function RefundsList({ tab }: { tab: RefundTab }) {
	const refunds = getRefundsByTab(tab);
	if (refunds.length === 0) {
		return <RefundsEmptyState tabLabel={REFUND_TAB_LABEL[tab]} />;
	}
	return (
		<div>
			{refunds.map((refund) => (
				<RefundCard key={refund.id} refund={refund} />
			))}
		</div>
	);
}
```

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/devolucoes/_components/refunds-tabs.tsx
git commit -m "feat(devolucoes): RefundsTabs com abas open/closed e counts"
```

---

## Task 9: Criar `page.tsx` da rota `/dashboard/devolucoes`

**Files:**
- Create: `apps/web/src/app/dashboard/devolucoes/page.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
import { SectionLabel } from "@/components/section-label";
import { RefundsTabs } from "./_components/refunds-tabs";

export default function DevolucoesPage() {
	return (
		<section>
			<SectionLabel>Minha conta</SectionLabel>
			<h1 className="mt-2 mb-7 font-display font-medium text-[36px] leading-none">
				Devoluções e reembolso
			</h1>
			<RefundsTabs />
		</section>
	);
}
```

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/devolucoes/page.tsx
git commit -m "feat(devolucoes): página /dashboard/devolucoes"
```

---

## Task 10: Ativar item de sidebar para `/dashboard/devolucoes`

**Files:**
- Modify: `apps/web/src/app/dashboard/_components/dashboard-sidebar.tsx`

- [ ] **Step 1: Trocar `kind:"soon"` por `kind:"link"`**

Em `NAV_ITEMS` (linhas 19–23), substituir:

```ts
const NAV_ITEMS: NavItem[] = [
	{ kind: "link", label: "Pedidos", href: "/dashboard/pedidos" },
	{ kind: "soon", label: "Reembolso e devoluções" },
	{ kind: "link", label: "Meus dados", href: "/dashboard/dados-pessoais" },
];
```

por:

```ts
const NAV_ITEMS: NavItem[] = [
	{ kind: "link", label: "Pedidos", href: "/dashboard/pedidos" },
	{
		kind: "link",
		label: "Reembolso e devoluções",
		href: "/dashboard/devolucoes",
	},
	{ kind: "link", label: "Meus dados", href: "/dashboard/dados-pessoais" },
];
```

- [ ] **Step 2: Verificar compilação (typedRoutes valida a rota nova)**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros — Next 16 typedRoutes deve aceitar `/dashboard/devolucoes` agora que `page.tsx` existe.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/_components/dashboard-sidebar.tsx
git commit -m "feat(dashboard): ativar link de devoluções no sidebar"
```

---

## Task 11: Renderizar `OrderRefundBlock` em `/dashboard/pedidos/[id]/page.tsx`

**Files:**
- Modify: `apps/web/src/app/dashboard/pedidos/[id]/page.tsx`

- [ ] **Step 1: Importar `OrderRefundBlock` e renderizar quando há `detail.refund`**

No topo do arquivo, adicionar import:

```ts
import { OrderRefundBlock } from "./_components/order-refund-block";
```

E no JSX, posicionar o bloco **entre `<OrderTotals />` e `<OrderItems />`** (lugar onde "Reembolso" faz mais sentido contextualmente — logo após o resumo financeiro):

```tsx
return (
	<div className="mx-auto max-w-[920px]">
		<OrderDetailHeader
			createdAt={detail.createdAt}
			id={detail.id}
			status={detail.status}
		/>

		<BuyerInfo buyer={detail.buyer} />
		<ShippingAddress address={detail.address} />
		<OrderTotals
			breakdown={detail.breakdown}
			itemCount={itemCount}
			payment={detail.payment}
		/>

		{detail.refund ? (
			<section className="mb-3.5 border border-border bg-white">
				<div className="flex items-center justify-between border-border border-b bg-gray-10 px-[18px] py-3.5">
					<h2 className="font-display font-semibold text-[12px] text-near-black uppercase tracking-[0.16em]">
						Devolução #{detail.refund.id}
					</h2>
				</div>
				<OrderRefundBlock refund={detail.refund} variant="page" />
			</section>
		) : null}

		<OrderItems items={detail.items} />
		<OrderTracking detail={detail} />

		<OrderActions order={detail} />
	</div>
);
```

> Observação: o `<section>` aqui replica manualmente o chrome de `<SectionBlock>` (mesma classe `mb-3.5 border border-border bg-white` + header gray-10 com h2 Barlow Condensed). Não usei `<SectionBlock>` diretamente porque ele tem `padding px-[18px] py-[18px]` interno que duplicaria com o padding do próprio `OrderRefundBlock`. Manter inline.

- [ ] **Step 2: Verificar compilação**

Run: `bun --cwd apps/web run check-types`
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/dashboard/pedidos/\[id\]/page.tsx
git commit -m "feat(pedidos): mostrar bloco de reembolso quando pedido tem devolução"
```

---

## Task 12: Smoke test em `bun dev:web`

**Files:** nenhum

- [ ] **Step 1: Subir o dev server**

Run: `bun run dev:web` (ou em background com `run_in_background: true`)
Expected: server escutando em `http://localhost:3001` sem erros no startup.

- [ ] **Step 2: Logar e navegar para a rota**

Abrir `http://localhost:3001/login`, autenticar com a conta de teste, então navegar para `http://localhost:3001/dashboard/devolucoes` (ou clicar no novo item do sidebar).

- [ ] **Step 3: Validar checklist visual**

Verifique cada item:

- [ ] Sidebar mostra "Reembolso e devoluções" com border-left vermelho ativo
- [ ] H1 "Devoluções e reembolso" em Barlow Condensed
- [ ] Tab "Em andamento" ativa por padrão com `3` items
- [ ] Tab "Finalizado" mostra `2` items ao clicar
- [ ] Card `DEV-2026-00128` (solicitado): badge azul, botões `Cancelar solicitação` + `Ver detalhes`
- [ ] Card `DEV-2026-00121` (em análise): badge âmbar `#B45309`, apenas `Ver detalhes`
- [ ] Card `DEV-2026-00115` (solicitado, 2 itens): divisor entre itens, total `R$ 358,90`
- [ ] Aba Finalizado · `DEV-2026-00098` (reembolsado): badge verde, bloco "Reembolso · Estornado em 22/04/2026 · Pix · 1-2 dias úteis", valor em verde
- [ ] Aba Finalizado · `DEV-2026-00076` (recusado): badge cinza, card em opacity 85%, bloco "Decisão" com justificativa, valor riscado
- [ ] Clicar "Ver detalhes" em qualquer card navega para `/dashboard/pedidos/EMACH-...` correto
- [ ] Em `/dashboard/pedidos/EMACH-2026-0228-50D9` (pedido com refund reembolsado) aparece bloco "Devolução #DEV-2026-00098" entre Totais e Itens, mostrando data/método/prazo

- [ ] **Step 4: Validar lint final**

Run: `bun run check`
Expected: zero issues.

- [ ] **Step 5: Validar types final**

Run: `bun run check-types`
Expected: zero issues.

- [ ] **Step 6: Reportar pronto**

Se todos os itens acima estão verdes, parar aqui. Não fazer "polish" não-pedido. Se algum item visual está errado, voltar à task correspondente.

---

## Definition of Done (DOD)

Checklist final espelhando o §10 do spec:

1. Rota `/dashboard/devolucoes` acessível pelo sidebar autenticado.
2. Duas abas com contagem; alternância carrega listas distintas.
3. Cinco cenários de mock visíveis e renderizando todos os blocos (header, itens, motivo, reembolso/decisão quando aplicável, total, ações).
4. `[Ver detalhes]` em qualquer card navega para `/dashboard/pedidos/[orderId]`.
5. Página do pedido renderiza `<OrderRefundBlock variant="page" />` quando o `OrderDetail` tem `refund` populado.
6. Empty state aparece quando a aba está vazia (se você zerar `mockRefunds` localmente, deve aparecer — não precisa commitar essa verificação).
7. `bun run check-types` e `bun run check` passam.
8. Visual confere com mockups `devolucoes-v1.html` e `devolucoes-v2-finalizado.html` no companion.
